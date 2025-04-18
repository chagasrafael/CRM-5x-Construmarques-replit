import { useDrag } from "react-dnd";
import { DollarSign, User } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/utils";
import { type Deal } from "@shared/schema";
import { Negociacao } from "@/lib/n8nApiClient";

interface DealCardProps {
  deal: Deal | Negociacao;
  onClick: (deal: Deal | Negociacao) => void;
}

export default function DealCard({ deal, onClick }: DealCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "DEAL",
    item: { id: deal.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`
        deal-card bg-white rounded-md border border-neutral-200 p-3 shadow-sm 
        cursor-pointer transition-all
        ${isDragging ? "opacity-50" : ""}
      `}
      onClick={() => onClick(deal)}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-neutral-800 text-sm">{deal.nomeCliente}</h4>
        <StatusBadge status={deal.status} />
      </div>
      
      <div className="flex items-center text-sm text-neutral-600 mb-2">
        <DollarSign className="h-4 w-4 mr-1.5 text-neutral-400" />
        <span className="font-medium">{formatCurrency(deal.valorNegociado)}</span>
      </div>
      
      <div className="flex items-center text-sm text-neutral-500">
        <User className="h-4 w-4 mr-1.5 text-neutral-400" />
        <span>{deal.vendedor}</span>
      </div>
    </div>
  );
}
