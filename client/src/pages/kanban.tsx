import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useState, useMemo, useRef } from "react";
import KanbanColumn from "@/components/deals/kanban-column";
import { DealStage, DealStatus, type Deal } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, getValorNegociado, getNomeCliente, getDataCriacao, getDataModificacao } from "@/lib/utils";
import DealDialog from "@/components/deals/deal-dialog";
import { updateDeal } from "@/lib/api";
import { fetchNegociacoes, updateNegociacao, Negociacao } from "@/lib/n8nApiClient";
import { useUpdateNegociacao } from "@/hooks/use-update-negociacao";

type KanbanProps = {
  statusFilter?: string;
  groupBy?: string;
  dateRange?: { 
    from: Date | undefined; 
    to: Date | undefined 
  };
};

export default function Kanban({ 
  statusFilter = "",  // Remover filtro padrão para mostrar todos os status
  groupBy = "estagio",
  dateRange = { from: undefined, to: undefined }
}: KanbanProps) {
  const [openDealDialog, setOpenDealDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | Negociacao | null>(null);
  
  // Referência para o container de rolagem (movida para cá para garantir a consistência dos hooks)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
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

  const handleDragEnd = (dealId: number, newCategory: string) => {
    // Verifica se o negócio existe na API local pelo ID
    const allDeals = deals as (Deal | Negociacao)[];
    const deal = allDeals.find(d => d.id === dealId);
    
    if (!deal) return;
    
    // Verifica se é um negócio da API local (tem createdAt)
    const isFromLocalApi = 'createdAt' in deal;
    
    // Se estamos agrupando por estágio, o newCategory é o estágio
    // Caso contrário, mantém o estágio atual
    const newStage = groupBy === "estagio" ? newCategory : deal.estagio;
    
    // Se estamos agrupando por status, o newCategory é o status
    // Caso contrário, mantém o status atual
    const newStatus = groupBy === "status" ? newCategory : deal.status;
    
    // Se estamos agrupando por vendedor, o newCategory é o vendedor
    // Caso contrário, mantém o vendedor atual
    const newVendedor = groupBy === "vendedor" ? newCategory : deal.vendedor;
    
    // Prepara os dados para a API
    const updateData = { 
      estagio: newStage,
      status: newStatus,
      vendedor: newVendedor,
      // Mantém compatibilidade com os diferentes campos
      nomeCliente: getNomeCliente(deal),
      Nome_cliente: getNomeCliente(deal),
      valorNegociado: String(getValorNegociado(deal)),
      valor_negociado: String(getValorNegociado(deal))
    };
    
    // Tenta atualizar na API do n8n
    updateNegociacaoMutation.mutate({
      id: dealId,
      data: updateData
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
        data: { 
          estagio: newStage as any,
          status: newStatus as any,
          vendedor: newVendedor
        }
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
  
  // Categorias padrão para estágios
  const defaultStages = [
    DealStage.NOVO_CONTATO,
    DealStage.FOLLOW_UP_AUTOMATICO,
    DealStage.RECUPERADO_POR_IA,
    DealStage.PERDIDO,
    DealStage.VENDIDO
  ];
  
  // Categorias para agrupamento dependendo do tipo selecionado
  const groupingCategories = useMemo(() => {
    if (!deals || !Array.isArray(deals)) return defaultStages;
    
    const dealsList = deals as (Deal | Negociacao)[];
    
    if (groupBy === "vendedor") {
      // Obter lista única de vendedores
      const vendedores = Array.from(new Set(dealsList.map(deal => deal.vendedor)));
      return vendedores.length > 0 ? vendedores : ["Sem vendedor"];
    } 
    else if (groupBy === "status") {
      // Usar os status constantes conforme atualizados na API
      return [
        DealStatus.EM_NEGOCIACAO, 
        DealStatus.GANHO,
        DealStatus.PERDA
      ];
    }
    else {
      // Padrão: agrupar por estágio
      return defaultStages;
    }
  }, [deals, groupBy]);

  if (isLoading || !deals || !Array.isArray(deals)) {
    return (
      <div className="flex space-x-4 overflow-x-auto pb-6">
        {groupingCategories.map((category) => (
          <div key={category} className="flex-shrink-0 w-72">
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
  
  console.log("Dados disponíveis no Kanban:", dealsList);
  
  // Aplica múltiplos filtros aos dados
  const filteredDeals = dealsList.filter(deal => {
    // Log para debugging de cada item
    console.log("Analisando item:", deal);
    
    // Verificação básica se o item tem os campos necessários
    if (!deal || typeof deal !== 'object' || !('status' in deal) || !('estagio' in deal)) {
      console.warn("Item inválido encontrado nos dados:", deal);
      return false;
    }
    
    // Filtro de status (apenas se um status específico foi selecionado)
    if (statusFilter && statusFilter.length > 0 && deal.status !== statusFilter) {
      console.log(`Item filtrado por status: ${deal.status} != ${statusFilter}`);
      return false;
    }
    
    // Filtro de data - verifica a data de criação
    if (dateRange.from || dateRange.to) {
      const dataCriacao = getDataCriacao(deal);
      console.log("Data de criação do item:", dataCriacao);
      
      // Pula este negócio se não tem data de criação
      if (!dataCriacao) {
        console.log("Item sem data de criação");
        return false;
      }
      
      // Verifica se está dentro do período de início
      if (dateRange.from && dataCriacao < dateRange.from) {
        console.log(`Item anterior ao período: ${dataCriacao} < ${dateRange.from}`);
        return false;
      }
      
      // Verifica se está dentro do período de fim
      if (dateRange.to) {
        // Adiciona 1 dia ao date.to para incluir o dia final completo
        const finalDay = new Date(dateRange.to);
        finalDay.setDate(finalDay.getDate() + 1);
        
        if (dataCriacao > finalDay) {
          console.log(`Item posterior ao período: ${dataCriacao} > ${finalDay}`);
          return false;
        }
      }
    }
    
    console.log("Item incluído nos filtrados");
    return true;
  });
  
  console.log("Quantidade de itens após filtros:", filteredDeals.length);

  // Calculate stats for each category based on groupby
  const columnStats = groupingCategories.reduce<Record<string, { count: number, value: number }>>(
    (acc, category) => {
      let categoryDeals;
      
      if (groupBy === "vendedor") {
        categoryDeals = filteredDeals.filter((deal) => deal.vendedor === category);
      } 
      else if (groupBy === "status") {
        categoryDeals = filteredDeals.filter((deal) => deal.status === category);
      }
      else {
        // Padrão: agrupar por estágio
        categoryDeals = filteredDeals.filter((deal) => deal.estagio === category);
      }
      
      const count = categoryDeals.length;
      const value = categoryDeals.reduce((sum, deal) => sum + getValorNegociado(deal), 0);
      acc[category] = { count, value };
      return acc;
    },
    {}
  );

  // Função para rolar para a esquerda
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  // Função para rolar para a direita
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Botão de rolagem para a esquerda - fixo na tela */}
      <button 
        onClick={scrollLeft}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-primary text-white rounded-full shadow-lg p-3 hover:bg-primary/80"
        aria-label="Rolar para a esquerda"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Container de rolagem com as colunas */}
      <div 
        ref={scrollContainerRef}
        className="flex space-x-4 overflow-x-auto pb-6 scroll-smooth hide-scrollbar"
      >
        {groupingCategories.map((category) => {
          // Filtrar deals com base no critério de agrupamento
          let categoryDeals;
          
          if (groupBy === "vendedor") {
            categoryDeals = filteredDeals.filter((deal) => deal.vendedor === category);
          } 
          else if (groupBy === "status") {
            categoryDeals = filteredDeals.filter((deal) => deal.status === category);
          }
          else {
            // Padrão: agrupar por estágio
            categoryDeals = filteredDeals.filter((deal) => deal.estagio === category);
          }
          
          const stats = columnStats[category] || { count: 0, value: 0 };
          
          return (
            <KanbanColumn
              key={category}
              title={category}
              deals={categoryDeals}
              count={stats.count}
              value={formatCurrency(stats.value)}
              onDragEnd={handleDragEnd}
              onDealClick={handleOpenDeal}
            />
          );
        })}
      </div>
      
      {/* Botão de rolagem para a direita - fixo na tela */}
      <button 
        onClick={scrollRight}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 bg-primary text-white rounded-full shadow-lg p-3 hover:bg-primary/80"
        aria-label="Rolar para a direita"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

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
