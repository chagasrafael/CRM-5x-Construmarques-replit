import { useDrag } from "react-dnd";
import { DollarSign, User } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";
import { formatCurrency, getNomeCliente, getValorNegociado } from "@/lib/utils";
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
  
  // Determina a cor do card com base no valor negociado
  const getCardColorClass = () => {
    const valor = getValorNegociado(deal);
    
    if (valor > 15000) {
      return "border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white";
    } else if (valor > 10000) {
      return "border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-white";
    } else if (valor > 5000) {
      return "border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white";
    } else {
      return "border-l-4 border-l-slate-400 bg-gradient-to-r from-slate-50 to-white";
    }
  };

  return (
    <div
      ref={drag}
      className={`
        deal-card rounded-md border border-neutral-200 p-3 shadow-sm 
        cursor-pointer transition-all hover:shadow-md
        ${getCardColorClass()}
        ${isDragging ? "opacity-50" : ""}
      `}
      onClick={() => onClick(deal)}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-neutral-800 text-sm truncate max-w-full">
          {getNomeCliente(deal)}
        </h4>
      </div>
      
      <div className="flex items-center text-sm text-neutral-600 mb-3">
        <DollarSign className="h-4 w-4 mr-1.5 text-emerald-500" />
        <span className="font-medium bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
          {formatCurrency(getValorNegociado(deal))}
        </span>
      </div>
      
      <div className="flex items-center text-sm text-neutral-500 bg-slate-50 p-1 px-2 rounded-full w-fit">
        <User className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
        <span className="text-xs">{deal.vendedor}</span>
      </div>
    </div>
  );
}
