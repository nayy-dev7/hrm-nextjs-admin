interface StatBoxProps {
  title: string;
  value: number;
}

export default function StatBox({ title, value }: StatBoxProps) {
  return (
    <div className="text-left">
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-gray-400 text-xs font-medium">{title}</p>
    </div>
  );
}