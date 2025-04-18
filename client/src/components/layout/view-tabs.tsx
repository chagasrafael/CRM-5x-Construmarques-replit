import { Button } from "@/components/ui/button";
import { 
  SquareDashedKanban, 
  BarChart2, 
  List, 
  Filter, 
  ChevronDown 
} from "lucide-react";

type ViewTabsProps = {
  activeView: "kanban" | "dashboard" | "list";
  onViewChange: (view: "kanban" | "dashboard" | "list") => void;
};

export default function ViewTabs({ activeView, onViewChange }: ViewTabsProps) {
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
        <Button variant="outline" className="flex items-center space-x-1">
          <Filter className="h-4 w-4 mr-1" />
          <span>Filtros</span>
        </Button>
        
        <Button variant="outline" className="flex items-center space-x-1">
          <span>Agrupar por: Estágio</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
