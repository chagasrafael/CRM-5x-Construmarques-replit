import { ArrowUp, ArrowDown } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend: number;
  trendLabel: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
}: StatCardProps) {
  const isTrendPositive = trend >= 0;

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="p-2 bg-primary/10 rounded-md text-primary">
          {icon}
        </div>
      </div>
      <div className="flex items-center text-sm">
        <span className={`flex items-center font-medium ${
          isTrendPositive ? "text-green-500" : "text-red-500"
        }`}>
          {isTrendPositive ? (
            <ArrowUp className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 mr-1" />
          )}
          {Math.abs(trend)}%
        </span>
        <span className="text-neutral-500 ml-2">{trendLabel}</span>
      </div>
    </div>
  );
}
