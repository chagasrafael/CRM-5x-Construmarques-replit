import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import KanbanColumn from "@/components/deals/kanban-column";
import { DealStage, type Deal } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, getValorNegociado, getNomeCliente } from "@/lib/utils";
import DealDialog from "@/components/deals/deal-dialog";
import { updateDeal } from "@/lib/api";
import { fetchNegociacoes, updateNegociacao, Negociacao } from "@/lib/n8nApiClient";
import { useUpdateNegociacao } from "@/hooks/use-update-negociacao";

export default function Kanban() {
  const [openDealDialog, setOpenDealDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | Negociacao | null>(null);
  
  // Utilizando a API n8n para buscar negociações
  const { data: deals, isLoading } = useQuery<Negociacao[] | Deal[]>({
    queryKey: ['negociacoes'],
    queryFn: fetchNegociacoes,
    // Caso a API externa falhe, recorrer para a API local
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Utilizando o nosso hook personalizado que conecta com a API do n8n
  const updateNegociacaoMutation = useUpdateNegociacao();
  
  // Mantenha a mutação original como fallback caso a API do n8n falhe
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
    // Verifica se o negócio existe na API local pelo ID
    const allDeals = deals as (Deal | Negociacao)[];
    const deal = allDeals.find(d => d.id === dealId);
    
    if (!deal) return;
    
    // Verifica se é um negócio da API local (tem createdAt)
    const isFromLocalApi = 'createdAt' in deal;
    
    // Tenta atualizar na API do n8n
    updateNegociacaoMutation.mutate({
      id: dealId,
      data: { 
        estagio: newStage,
        // Mantém compatibilidade com os diferentes campos
        nomeCliente: getNomeCliente(deal),
        Nome_cliente: getNomeCliente(deal),
        valorNegociado: String(getValorNegociado(deal)),
        valor_negociado: String(getValorNegociado(deal))
      }
    }, {
      onSuccess: () => {
        // Forçar atualização do dashboard
        queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      }
    });
    
    // Como fallback, também atualiza localmente se o negócio for da API local
    if (isFromLocalApi) {
      updateDealMutation.mutate({
        id: dealId,
        data: { estagio: newStage as any }
      });
    }
  };

  const handleOpenDeal = (deal: Deal | Negociacao) => {
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

  if (isLoading || !deals || !Array.isArray(deals)) {
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

  // Dados estão carregados e são um array
  const dealsList = deals as (Deal | Negociacao)[];

  // Calculate stats for each stage
  const columnStats = stages.reduce<Record<string, { count: number, value: number }>>(
    (acc, stage) => {
      const stageDeals = dealsList.filter((deal) => deal.estagio === stage);
      const count = stageDeals.length;
      const value = stageDeals.reduce((sum: number, deal) => sum + getValorNegociado(deal), 0);
      acc[stage] = { count, value };
      return acc;
    },
    {}
  );

  return (
    <div className="flex space-x-4 overflow-x-auto pb-6 scrollbar-thin">
      {stages.map((stage) => {
        const stageDeals = dealsList.filter(deal => deal.estagio === stage);
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
