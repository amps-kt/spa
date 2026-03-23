export function WeightCell({ weight }: { weight: number }) {
  return (
    <p className="w-12 text-center">{Number.isNaN(weight) ? "-" : weight}</p>
  );
}
