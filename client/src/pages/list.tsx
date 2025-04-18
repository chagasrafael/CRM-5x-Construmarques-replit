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
import { formatCurrency } from "@/lib/utils";
import DealDialog from "@/components/deals/deal-dialog";
import { Deal } from "@shared/schema";

export default function List() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDealDialog, setOpenDealDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  const { data: deals, isLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setOpenDealDialog(true);
  };

  const closeDialog = () => {
    setOpenDealDialog(false);
    setSelectedDeal(null);
  };

  // Filter deals based on search
  const filteredDeals = deals && Array.isArray(deals)
    ? deals.filter((deal: Deal) => 
        deal.nomeCliente.toLowerCase().includes(search.toLowerCase()) ||
        deal.vendedor.toLowerCase().includes(search.toLowerCase()) ||
        deal.estagio.toLowerCase().includes(search.toLowerCase()) ||
        deal.status.toLowerCase().includes(search.toLowerCase())
      )
    : [];

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
      cell: (value: string) => (
        <div className="font-medium text-neutral-800">{value}</div>
      ),
    },
    {
      header: "Valor",
      accessor: "valorNegociado",
      cell: (value: number) => formatCurrency(value),
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
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1.5" />
              <span>Filtros</span>
            </Button>
            <Button variant="outline" size="sm">
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
