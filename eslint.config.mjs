import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

// import disallows:
const disallowNextBuiltins = {
  group: ["next/navigation", "next/router", "next/link"],
  allowImportNames: ["notFound"],
  message:
    "Do not call next builtins directly; instead use the new routing tools from @/lib/routing",
};

const disallowPrisma = {
  group: ["@prisma/client"],
  message: "Please import via `@/db` as appropriate",
};

const disallowRadix = {
  group: ["@radix-ui/*"],
  message:
    "Imports directly from radix-ui are generally incorrect; please check and ignore this if necessary",
};

const disallowLucide = {
  group: ["lucide-react"],
  allowImportNamePattern: "Icon$",
  message: "Lucide Icon imports must always use the `<Name>Icon` variant.",
};

const disallowedEmail = { group: ["@react-email/*"] };

const disallowDayPicker = {
  group: ["react-day-picker"],
  importNames: ["Button"],
};

/**
 * utility function for adding import disallow exceptions
 * @param  {...("nextBuiltins" | "prisma" | "radix" | "emails" | "none")} from
 * @returns
 */
function AllowImportsFrom(...from) {
  const patterns = [disallowLucide, disallowDayPicker];

  if (!from.includes("nextBuiltins")) patterns.push(disallowNextBuiltins);
  if (!from.includes("prisma")) patterns.push(disallowPrisma);
  if (!from.includes("radix")) patterns.push(disallowRadix);
  if (!from.includes("emails")) patterns.push(disallowedEmail);

  return { "no-restricted-imports": ["warn", { patterns }] };
}

export default tseslint.config(
  { ignores: [".next/", ".react-email/", "dist/"] },
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      "@typescript-eslint/no-deprecated": "warn",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      ...AllowImportsFrom("none"),
    },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: true },
    languageOptions: { parserOptions: { projectService: true } },
  },
  {
    files: ["src/db/**/*.ts", "src/db/**/*.tsx"],
    rules: AllowImportsFrom("prisma"),
  },
  {
    files: ["src/components/ui/**/*.ts", "src/components/ui/**/*.tsx"],
    rules: AllowImportsFrom("radix"),
  },
  {
    files: ["src/lib/routing/*.ts", "src/lib/routing/*.tsx"],
    rules: AllowImportsFrom("nextBuiltins"),
  },
  {
    files: ["src/emails/**/*.ts", "src/emails/**/*.tsx"],
    rules: AllowImportsFrom("emails"),
  },
);
