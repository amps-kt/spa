import { execSync } from "node:child_process";

// --- semver helpers

/** Parse "1.2.3" / "1.2.3-canary.0" -> {major,minor,patch}. */
function parseVersion(v) {
  const core = String(v)
    .trim()
    .replace(/^[v=]+/, "")
    .split("-")[0];
  const [major = 0, minor = 0, patch = 0] = core.split(".").map(Number);
  return { major, minor, patch };
}

/** Compare two version strings. Returns -1 / 0 / 1. */
function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  return (pa.major - pb.major || pa.minor - pb.minor || pa.patch - pb.patch) > 0
    ? 1
    : pa.major === pb.major && pa.minor === pb.minor && pa.patch === pb.patch
      ? 0
      : -1;
}

/**
 * Next breaking boundary above a version, typical semver rules means under 0.x, a minor bump is breaking.
 * Does not cross a breaking boundary: 4.17.23 -> "5", 0.16.21 -> "0.17", 0.0.3 -> "0.0.4".
 */
function upperBound(version) {
  const { major, minor, patch } = parseVersion(version);
  if (major > 0) return `${major + 1}`;
  if (minor > 0) return `0.${minor + 1}`;
  return `0.0.${patch + 1}`;
}

/**
 * Pull every lower-bound version out of a patched range string.
 * pnpm/GitHub express patched_versions as things like ">=7.0.7",
 * ">=3.1.3 <3.2.0 || >=9.0.7". We only care about the ">=X" floors.
 */
function patchedFloors(range) {
  const floors = [];
  const re = />=\s*([0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.]+)?)/g;
  let m;
  while ((m = re.exec(String(range))) !== null) floors.push(m[1]);
  return floors;
}

// --- load audit data

function loadAudit() {
  try {
    const out = execSync("pnpm audit --json", {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
    return JSON.parse(out);
  } catch (err) {
    if (err.stdout) return JSON.parse(err.stdout);
    throw err;
  }
}

// --- core

const audit = loadAudit();
const advisories = Object.values(audit.advisories ?? {});

if (advisories.length === 0) {
  console.log("No advisories reported by pnpm audit. Nothing to do.");
  process.exit(0);
}

/**
 * Build, per package, a map of installedMajor -> {
 *   floors: highest required patched floor that lands inside this major,
 *   reviewable: advisories whose only fix is a higher major,
 *   advisories: [{url, severity, patched}]
 * }
 */
const byPackage = new Map();

for (const adv of advisories) {
  const pkg = adv.module_name;
  const patched = adv.patched_versions || "";
  const floors = patchedFloors(patched);

  for (const finding of adv.findings ?? []) {
    const installedMajor = parseVersion(finding.version).major;

    if (!byPackage.has(pkg)) byPackage.set(pkg, new Map());
    const majors = byPackage.get(pkg);
    if (!majors.has(installedMajor)) {
      majors.set(installedMajor, {
        installedVersions: new Set(),
        floor: null, // highest in-major floor required so far
        review: [], // advisories that can't be fixed within this major
        advisories: [],
      });
    }
    const slot = majors.get(installedMajor);
    slot.installedVersions.add(finding.version);
    slot.advisories.push({ url: adv.url, severity: adv.severity, patched });

    // Lowest patched floor that is still inside this installed major.
    const inMajor = floors
      .filter((f) => parseVersion(f).major === installedMajor)
      .sort(compareVersions);
    const lowestInMajor = inMajor[0];

    if (lowestInMajor) {
      // Keep the highest floor required across this major's advisories.
      if (!slot.floor || compareVersions(lowestInMajor, slot.floor) > 0) {
        slot.floor = lowestInMajor;
      }
    } else {
      // No patch within this major -> only a major upgrade fixes it.
      const target = floors.sort(compareVersions).slice(-1)[0] || patched;
      slot.review.push({ url: adv.url, severity: adv.severity, target });
    }
  }
}

// --- emit

const overrides = {};
const manual = [];

for (const [pkg, majors] of byPackage) {
  const multipleMajors = majors.size > 1;

  for (const [major, slot] of majors) {
    // If any advisory in this major needs a higher major, it can't be auto-pinned.
    if (slot.review.length > 0) {
      manual.push({
        pkg,
        installedMajor: major,
        installed: [...slot.installedVersions].sort(compareVersions),
        review: slot.review,
      });
      continue;
    }
    if (!slot.floor) continue;

    // Scope the key to the major when several majors of the same package are
    // installed (e.g. tar-fs@2 and tar-fs@3), otherwise use the bare name.
    const key = multipleMajors ? `${pkg}@${major}` : pkg;
    overrides[key] = `>=${slot.floor} <${upperBound(slot.floor)}`;
  }
}

const sortedOverrides = Object.fromEntries(
  Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b)),
);

console.log("=".repeat(72));
console.log("AUTO-FIXABLE - add these to pnpm.overrides in package.json:");
console.log("=".repeat(72));
console.log(JSON.stringify({ pnpm: { overrides: sortedOverrides } }, null, 2));

if (manual.length > 0) {
  console.log("");
  console.log("=".repeat(72));
  console.log("NEEDS MANUAL REVIEW - only fixable by a major-version upgrade:");
  console.log("=".repeat(72));
  for (const item of manual.sort((a, b) => a.pkg.localeCompare(b.pkg))) {
    const targets = [...new Set(item.review.map((r) => r.target))].join(", ");
    console.log(
      `\n  ${item.pkg}  (installed: ${item.installed.join(", ")})  ->  needs ${targets}`,
    );
    for (const r of item.review) {
      console.log(`    [${r.severity}] ${r.url}`);
    }
  }
}

console.log("");
console.log(
  `Summary: ${Object.keys(sortedOverrides).length} override(s) suggested, ` +
    `${manual.length} package(s) need manual review.`,
);
console.log(
  "After pasting the overrides, run `pnpm install` then re-run this script.",
);
