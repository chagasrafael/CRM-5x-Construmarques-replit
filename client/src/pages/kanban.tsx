import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import KanbanColumn from "@/components/deals/kanban-column";
import { DealStage, type Deal } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import DealDialog from "@/components/deals/deal-dialog";
import { updateDeal } from "@/lib/api";

export default function Kanban() {
  const [openDealDialog, setOpenDealDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  const { data: deals, isLoading } = useQuery({
    queryKey: ["/api/deals"],
  });

  const updateDealMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Deal> }) => {
      return updateDeal(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const handleDragEnd = (dealId: number, newStage: string) => {
    updateDealMutation.mutate({
      id: dealId,
      data: { estagio: newStage as any }
    });
  };

  const handleOpenDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setOpenDealDialog(true);
  };

  const closeDialog = () => {
    setOpenDealDialog(false);
    setSelectedDeal(null);
  };
  
  const stages = [
    DealStage.NOVO_LEAD,
    DealStage.FOLLOW_UP_MANUAL,
    DealStage.FOLLOW_UP_AUTOMATICO,
    DealStage.PROPOSTA_ENVIADA,
    DealStage.NEGOCIACAO_FECHADA
  ];

  if (isLoading) {
    return (
      <div className="flex space-x-4 overflow-x-auto pb-6">
        {stages.map((stage) => (
          <div key={stage} className="flex-shrink-0 w-72">
            <Skeleton className="h-10 w-full mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate stats for each stage
  const columnStats = stages.reduce<Record<string, { count: number, value: number }>>(
    (acc, stage) => {
      const stageDeals = deals.filter((deal: Deal) => deal.estagio === stage);
      const count = stageDeals.length;
      const value = stageDeals.reduce((sum: number, deal: Deal) => sum + Number(deal.valorNegociado), 0);
      acc[stage] = { count, value };
      return acc;
    },
    {}
  );

  return (
    <div className="flex space-x-4 overflow-x-auto pb-6 scrollbar-thin">
      {stages.map((stage) => {
        const stageDeals = deals.filter((deal: Deal) => deal.estagio === stage);
        const stats = columnStats[stage] || { count: 0, value: 0 };
        
        return (
          <KanbanColumn
            key={stage}
            title={stage}
            deals={stageDeals}
            count={stats.count}
            value={formatCurrency(stats.value)}
            onDragEnd={handleDragEnd}
            onDealClick={handleOpenDeal}
          />
        );
      })}

      {selectedDeal && (
        <DealDialog
          open={openDealDialog}
          onOpenChange={closeDialog}
          deal={selectedDeal}
        />
      )}
    </div>
  );
}
