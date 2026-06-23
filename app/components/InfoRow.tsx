interface InfoRowProps {
  label: string;
  value: string;
}

export default function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex py-1 text-sm">
      <span className="w-24 font-semibold text-gray-600">{label}</span>
      <span className="text-gray-700 flex-1">{value || "-"}</span>
    </div>
  );
}