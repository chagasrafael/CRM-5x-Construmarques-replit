import { useState } from "react";
import Header from "@/components/layout/header";
import ViewTabs from "@/components/layout/view-tabs";
import Kanban from "@/pages/kanban";
import Dashboard from "@/pages/dashboard";
import List from "@/pages/list";
import { DealStatus } from "@shared/schema";

type View = "kanban" | "dashboard" | "list";
type GroupBy = "estagio" | "vendedor" | "status";
type DateRange = { from: Date | undefined; to: Date | undefined };

export default function Home() {
  const [activeView, setActiveView] = useState<View>("kanban");
  const [statusFilter, setStatusFilter] = useState<string>(DealStatus.EM_NEGOCIACAO);
  const [groupBy, setGroupBy] = useState<GroupBy>("estagio");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <ViewTabs 
          activeView={activeView} 
          onViewChange={setActiveView} 
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          groupBy={groupBy}
          onGroupByChange={(value) => setGroupBy(value as GroupBy)}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        
        <div className="mb-6">
          {activeView === "kanban" && (
            <Kanban 
              statusFilter={statusFilter} 
              groupBy={groupBy}
              dateRange={dateRange}
            />
          )}
          {activeView === "dashboard" && <Dashboard />}
          {activeView === "list" && (
            <List 
              initialStatusFilter={statusFilter}
              dateRange={dateRange} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
