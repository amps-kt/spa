function formatProfile(profile: number[]) {
  while (profile[profile.length - 1] === 0) profile.pop();
  return profile.length === 0 ? "-" : `(${profile.join(", ")})`;
}

export function ProfileCell({ profile }: { profile: number[] }) {
  return <p className="w-28 text-center">{formatProfile(profile)}</p>;
}

export function SizeCell({ size }: { size: number }) {
  return <p className="w-12 text-center">{Number.isNaN(size) ? "-" : size}</p>;
}

export function WeightCell({ weight }: { weight: number }) {
  return (
    <p className="w-12 text-center">{Number.isNaN(weight) ? "-" : weight}</p>
  );
}
