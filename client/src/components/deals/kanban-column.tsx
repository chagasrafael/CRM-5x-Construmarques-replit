import { useDrop } from "react-dnd";
import DealCard from "./deal-card";
import EmptyColumn from "./empty-column";
import { type Deal } from "@shared/schema";
import { Negociacao } from "@/lib/n8nApiClient";

interface KanbanColumnProps {
  title: string;
  deals: (Deal | Negociacao)[];
  count: number;
  value: string;
  onDragEnd: (dealId: number, newStage: string) => void;
  onDealClick: (deal: Deal | Negociacao) => void;
}

export default function KanbanColumn({
  title,
  deals,
  count,
  value,
  onDragEnd,
  onDealClick,
}: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "DEAL",
    drop: (item: { id: number }) => {
      onDragEnd(item.id, title);
      return { name: title };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  
  // Função para determinar a cor de fundo do cabeçalho da coluna com base no título
  const getHeaderColor = () => {
    switch (title) {
      case "Novo Lead":
        return "bg-blue-50 border-b border-blue-100";
      case "Follow Up Manual":
        return "bg-purple-50 border-b border-purple-100";
      case "Follow Up Automático":
        return "bg-teal-50 border-b border-teal-100";
      case "Proposta Enviada":
        return "bg-amber-50 border-b border-amber-100";
      case "Negociação Fechada":
        return "bg-emerald-50 border-b border-emerald-100";
      default:
        return "bg-slate-50 border-b border-slate-100";
    }
  };
  
  // Função para determinar a cor do texto com base no título
  const getTitleColor = () => {
    switch (title) {
      case "Novo Lead":
        return "text-blue-700";
      case "Follow Up Manual":
        return "text-purple-700";
      case "Follow Up Automático":
        return "text-teal-700";
      case "Proposta Enviada":
        return "text-amber-700";
      case "Negociação Fechada":
        return "text-emerald-700";
      default:
        return "text-slate-700";
    }
  };

  return (
    <div
      ref={drop}
      className={`
        kanban-column flex-shrink-0 w-72 bg-white rounded-lg shadow border overflow-hidden
        ${isOver ? "border-blue-400 border-2" : "border-neutral-200"}
      `}
    >
      <div className={`p-3 ${getHeaderColor()}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${getTitleColor()}`}>{title}</h3>
          <div className="flex items-center space-x-2 text-sm bg-white py-1 px-2 rounded-full shadow-sm">
            <span className="font-medium">{count}</span>
            <span className="text-neutral-400">·</span>
            <span className="font-medium">{value}</span>
          </div>
        </div>
      </div>
      
      <div className="p-3 pt-4">
        <div className="space-y-3">
          {deals.length > 0 ? (
            deals.map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                onClick={onDealClick}
              />
            ))
          ) : (
            <EmptyColumn />
          )}
        </div>
      </div>
    </div>
  );
}