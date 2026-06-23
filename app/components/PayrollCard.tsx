interface PayrollCardProps {
  title: string;
  nominal: string;
  textColor?: string;
}

export default function PayrollCard({ title, nominal, textColor = "text-gray-300" }: PayrollCardProps) {
  return (
    <div className="bg-[#1f2235] p-3.5 rounded-xl flex justify-between text-xs border border-gray-800">
      <span className="text-gray-400 font-medium">{title}</span>
      <span className={`font-bold ${textColor}`}>{nominal}</span>
    </div>
  );
}