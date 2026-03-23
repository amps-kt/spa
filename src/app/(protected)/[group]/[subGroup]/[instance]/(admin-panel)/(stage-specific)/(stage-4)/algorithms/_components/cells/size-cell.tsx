export function SizeCell({ size }: { size: number }) {
  return <p className="w-12 text-center">{Number.isNaN(size) ? "-" : size}</p>;
}
