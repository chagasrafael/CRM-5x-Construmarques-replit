import { useQuery } from "@tanstack/react-query";
import React, { useState, Fragment } from "react";
import DataTable from "@/components/ui/data-table";
import StatusBadge from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Download, 
  MoreHorizontal,
  Search
} from "lucide-react";
import { formatCurrency, getNomeCliente, getValorNegociado } from "@/lib/utils";
import DealDialog from "@/components/deals/deal-dialog";
import { Deal, DealStatus } from "@shared/schema";
import { fetchNegociacoes, Negociacao } from "@/lib/n8nApiClient";

interface ListProps {
  initialStatusFilter?: string;
}

export default function List({ initialStatusFilter = DealStatus.EM_NEGOCIACAO }: ListProps = {}) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDealDialog, setOpenDealDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  
  // Utilizando a API n8n para buscar negociações
  const { data: deals, isLoading } = useQuery<Negociacao[] | Deal[]>({
    queryKey: ['negociacoes'],
    queryFn: fetchNegociacoes,
    // Caso a API externa falhe, recorrer para a API local
    retry: 1,
    refetchOnWindowFocus: false
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleEditDeal = (deal: Deal | Negociacao) => {
    setSelectedDeal(deal as Deal);
    setOpenDealDialog(true);
  };

  const closeDialog = () => {
    setOpenDealDialog(false);
    setSelectedDeal(null);
  };

  // Filter deals based on search and status filter
  const filteredDeals = deals && Array.isArray(deals)
    ? deals.filter((deal) => {
        // Filtra pelo status selecionado (só filtra se algum status específico for escolhido)
        if (statusFilter && statusFilter !== "" && deal.status && deal.status !== statusFilter) {
          return false;
        }
        
        // Filtra pela busca de texto se houver algum termo
        if (search && search.trim() !== "") {
          const searchTerm = search.toLowerCase().trim();
          const matchesName = getNomeCliente(deal).toLowerCase().includes(searchTerm);
          const matchesVendedor = deal.vendedor?.toLowerCase().includes(searchTerm);
          const matchesEstagio = deal.estagio?.toLowerCase().includes(searchTerm);
          const matchesStatus = deal.status?.toLowerCase().includes(searchTerm);
          
          return matchesName || matchesVendedor || matchesEstagio || matchesStatus;
        }
        
        // Se não tem termo de busca, inclui o item
        return true;
      }) as (Deal | Negociacao)[]
    : [];
    
  // Função para exportar dados para CSV
  const exportToCSV = () => {
    if (!filteredDeals.length) return;
    
    // Cabeçalhos do CSV
    const headers = ["Cliente", "Valor", "Estágio", "Status", "Vendedor"];
    
    // Dados formatados para CSV
    const csvData = filteredDeals.map(deal => [
      getNomeCliente(deal),
      formatCurrency(getValorNegociado(deal)).replace("R$", "").trim(),
      deal.estagio,
      deal.status,
      deal.vendedor
    ]);
    
    // Criar conteúdo CSV
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "negociacoes.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);
  const paginatedDeals = filteredDeals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      header: "Cliente",
      accessor: "nomeCliente",
      cell: (_: any, row: Deal | Negociacao) => (
        <div className="font-medium text-neutral-800">{getNomeCliente(row)}</div>
      ),
    },
    {
      header: "Valor",
      accessor: "valorNegociado",
      cell: (_: any, row: Deal | Negociacao) => formatCurrency(getValorNegociado(row)),
    },
    {
      header: "Estágio",
      accessor: "estagio",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (value: string) => <StatusBadge status={value} />,
    },
    {
      header: "Vendedor",
      accessor: "vendedor",
    },
    {
      header: "Ações",
      accessor: "id",
      cell: (_: any, row: Deal) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEditDeal(row)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-neutral-800">Todas as Negociações</h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Pesquisar"
                value={search}
                onChange={handleSearch}
                className="pl-9 w-64"
              />
              <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>
            <DropdownMenu open={openFilterMenu} onOpenChange={setOpenFilterMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1.5" />
                  <span>Filtros</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter(DealStatus.EM_NEGOCIACAO)}>
                  {statusFilter === DealStatus.EM_NEGOCIACAO && "✓ "}Em Negociação
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(DealStatus.GANHO)}>
                  {statusFilter === DealStatus.GANHO && "✓ "}Ganho
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(DealStatus.PERDA)}>
                  {statusFilter === DealStatus.PERDA && "✓ "}Perda
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("")}>
                  {!statusFilter && "✓ "}Todos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-1.5" />
              <span>Exportar</span>
            </Button>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={paginatedDeals} 
        isLoading={isLoading} 
      />

      <div className="px-6 py-4 flex items-center justify-between border-t border-neutral-200">
        <div>
          <p className="text-sm text-neutral-500">
            Mostrando{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            a{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredDeals.length)}
            </span>{" "}
            de <span className="font-medium">{filteredDeals.length}</span>{" "}
            resultados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
            .map((page, i, arr) => (
              <Fragment key={page}>
                {i > 0 && arr[i - 1] + 1 !== page && (
                  <span className="text-neutral-500">...</span>
                )}
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              </Fragment>
            ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
