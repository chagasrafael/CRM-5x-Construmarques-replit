import { cn } from "@/lib/utils";
import { DealStatus } from "@shared/schema";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case DealStatus.EM_NEGOCIACAO:
        return "bg-primary/10 text-primary";
      case DealStatus.GANHO:
        return "bg-green-500/10 text-green-500";
      case DealStatus.PERDA:
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-neutral-500/10 text-neutral-500";
    }
  };

  return (
    <span
      className={cn(
        "px-2 py-0.5 text-xs rounded-full inline-flex items-center justify-center font-medium",
        getStatusStyles(),
        className
      )}
    >
      {status}
    </span>
  );
}
