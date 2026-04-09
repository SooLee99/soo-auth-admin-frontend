type Props = {
  value?: string | null;
};

export default function StatusBadge({ value }: Props): JSX.Element {
  const text = value ?? "-";
  const normalized = text.toUpperCase();
  const cls =
    normalized.includes("UP") || normalized.includes("SUCCESS") || normalized.includes("ACTIVE")
      ? "text-bg-success"
      : normalized.includes("BLOCK") || normalized.includes("FAIL") || normalized.includes("DOWN")
      ? "text-bg-danger"
      : "text-bg-secondary";

  return <span className={`badge ${cls}`}>{text}</span>;
}
