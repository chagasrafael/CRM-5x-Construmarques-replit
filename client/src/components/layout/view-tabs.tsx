import { Button } from "@/components/ui/button";
import { 
  SquareDashedKanban, 
  BarChart2, 
  List, 
  Filter, 
  ChevronDown,
  Check
} from "lucide-react";
import { useState } from "react";
import { DealStatus } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

type ViewTabsProps = {
  activeView: "kanban" | "dashboard" | "list";
  onViewChange: (view: "kanban" | "dashboard" | "list") => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  groupBy?: string;
  onGroupByChange?: (groupBy: string) => void;
};

export default function ViewTabs({ 
  activeView, 
  onViewChange,
  statusFilter = DealStatus.EM_NEGOCIACAO,
  onStatusFilterChange,
  groupBy = "estagio",
  onGroupByChange
}: ViewTabsProps) {
  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  const [openGroupMenu, setOpenGroupMenu] = useState(false);

  // Esses manipuladores só são chamados se as funções de callback foram fornecidas
  const handleStatusFilterChange = (status: string) => {
    if (onStatusFilterChange) {
      onStatusFilterChange(status);
    }
  };

  const handleGroupByChange = (value: string) => {
    if (onGroupByChange) {
      onGroupByChange(value);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex space-x-2 bg-white border border-neutral-200 rounded-lg p-1 shadow-sm">
        <Button
          variant={activeView === "kanban" ? "default" : "ghost"}
          className={
            activeView === "kanban"
              ? "bg-primary text-white"
              : "text-neutral-700 hover:bg-neutral-100"
          }
          onClick={() => onViewChange("kanban")}
        >
          <SquareDashedKanban className="h-4 w-4 mr-1.5" />
          Kanban
        </Button>
        <Button
          variant={activeView === "dashboard" ? "default" : "ghost"}
          className={
            activeView === "dashboard"
              ? "bg-primary text-white"
              : "text-neutral-700 hover:bg-neutral-100"
          }
          onClick={() => onViewChange("dashboard")}
        >
          <BarChart2 className="h-4 w-4 mr-1.5" />
          Dashboard
        </Button>
        <Button
          variant={activeView === "list" ? "default" : "ghost"}
          className={
            activeView === "list"
              ? "bg-primary text-white"
              : "text-neutral-700 hover:bg-neutral-100"
          }
          onClick={() => onViewChange("list")}
        >
          <List className="h-4 w-4 mr-1.5" />
          Lista
        </Button>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Filtro de Status */}
        <DropdownMenu open={openFilterMenu} onOpenChange={setOpenFilterMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-1">
              <Filter className="h-4 w-4 mr-1" />
              <span>Filtros{statusFilter !== "" ? `: ${statusFilter === DealStatus.EM_NEGOCIACAO ? 'Em Negociação' : statusFilter}` : ""}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleStatusFilterChange(DealStatus.EM_NEGOCIACAO)}
            >
              {statusFilter === DealStatus.EM_NEGOCIACAO && (
                <Check className="h-4 w-4 mr-2" />
              )}
              Em Negociação
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusFilterChange(DealStatus.GANHO)}
            >
              {statusFilter === DealStatus.GANHO && (
                <Check className="h-4 w-4 mr-2" />
              )}
              Ganho
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusFilterChange(DealStatus.PERDA)}
            >
              {statusFilter === DealStatus.PERDA && (
                <Check className="h-4 w-4 mr-2" />
              )}
              Perda
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusFilterChange("")}
            >
              {statusFilter === "" && (
                <Check className="h-4 w-4 mr-2" />
              )}
              Todos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Agrupamento */}
        <DropdownMenu open={openGroupMenu} onOpenChange={setOpenGroupMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-1">
              <span>Agrupar por: {groupBy === "estagio" ? "Estágio" : groupBy === "vendedor" ? "Vendedor" : "Estágio"}</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Agrupar por</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={groupBy} onValueChange={handleGroupByChange}>
              <DropdownMenuRadioItem value="estagio">Estágio</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="vendedor">Vendedor</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
