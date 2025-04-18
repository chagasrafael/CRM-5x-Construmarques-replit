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

  return (
    <div
      ref={drop}
      className={`
        kanban-column flex-shrink-0 w-72 bg-white rounded-lg shadow p-3 border
        ${isOver ? "border-primary border-2" : "border-neutral-200"}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-neutral-800">{title}</h3>
        <div className="flex items-center space-x-2 text-sm text-neutral-500">
          <span>{count}</span>
          <span className="text-neutral-400">·</span>
          <span>{value}</span>
        </div>
      </div>
      
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
  );
}
