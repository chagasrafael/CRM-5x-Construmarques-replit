import { Button } from "@/components/ui/button";
import { 
  SquareDashedKanban, 
  BarChart2, 
  List, 
  Filter, 
  ChevronDown,
  Check,
  Calendar as CalendarIcon
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  format,
  isAfter, 
  isBefore, 
  isEqual,
  addDays 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDate } from "@/lib/utils";

type ViewTabsProps = {
  activeView: "kanban" | "dashboard" | "list";
  onViewChange: (view: "kanban" | "dashboard" | "list") => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  groupBy?: string;
  onGroupByChange?: (groupBy: string) => void;
  dateRange?: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
};

export default function ViewTabs({ 
  activeView, 
  onViewChange,
  statusFilter = DealStatus.EM_NEGOCIACAO,
  onStatusFilterChange,
  groupBy = "estagio",
  onGroupByChange,
  dateRange = { from: undefined, to: undefined },
  onDateRangeChange
}: ViewTabsProps) {
  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  const [openGroupMenu, setOpenGroupMenu] = useState(false);
  const [openDatePopover, setOpenDatePopover] = useState(false);
  const [dateRangeLocal, setDateRangeLocal] = useState(dateRange);

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
  
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRangeLocal(range);
    
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

  // Opções pré-definidas para filtros de data
  const getUltimaSemana = () => {
    const now = new Date();
    const from = addDays(now, -7);
    const to = now;
    return { from, to };
  };

  const getUltimoMes = () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const to = now;
    return { from, to };
  };

  const getUltimo3Meses = () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const to = now;
    return { from, to };
  };

  // Formata a exibição do intervalo de datas
  const getDateRangeText = () => {
    if (!dateRangeLocal.from && !dateRangeLocal.to) {
      return "Filtrar por Data";
    }

    if (dateRangeLocal.from && !dateRangeLocal.to) {
      return `De ${formatDate(dateRangeLocal.from)}`;
    }

    if (!dateRangeLocal.from && dateRangeLocal.to) {
      return `Até ${formatDate(dateRangeLocal.to)}`;
    }

    return `${formatDate(dateRangeLocal.from)} - ${formatDate(dateRangeLocal.to)}`;
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
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Filtro de Data */}
        <Popover open={openDatePopover} onOpenChange={setOpenDatePopover}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`justify-start text-left ${
                (dateRangeLocal.from || dateRangeLocal.to) ? "text-primary" : ""
              }`}
            >
              <CalendarIcon className="mr-1.5 h-4 w-4" />
              <span>{getDateRangeText()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <div className="p-3 border-b border-neutral-200">
              <div className="flex justify-between mb-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const range = getUltimaSemana();
                    handleDateRangeChange(range);
                  }}
                >
                  Última semana
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const range = getUltimoMes();
                    handleDateRangeChange(range);
                  }}
                >
                  Último mês
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const range = getUltimo3Meses();
                    handleDateRangeChange(range);
                  }}
                >
                  3 meses
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-center"
                onClick={() => handleDateRangeChange({ from: undefined, to: undefined })}
              >
                Limpar filtro
              </Button>
            </div>
            <Calendar
              mode="range"
              locale={ptBR}
              selected={{
                from: dateRangeLocal.from,
                to: dateRangeLocal.to,
              }}
              onSelect={(range) => {
                if (range) {
                  handleDateRangeChange({
                    from: range.from,
                    to: range.to,
                  });
                }
              }}
              numberOfMonths={2}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
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
