import { useState } from "react";
import Header from "@/components/layout/header";
import ViewTabs from "@/components/layout/view-tabs";
import Kanban from "@/pages/kanban";
import Dashboard from "@/pages/dashboard";
import List from "@/pages/list";
import { DealStatus } from "@shared/schema";

type View = "kanban" | "dashboard" | "list";
type GroupBy = "estagio" | "vendedor" | "status";

export default function Home() {
  const [activeView, setActiveView] = useState<View>("kanban");
  const [statusFilter, setStatusFilter] = useState<string>(DealStatus.EM_NEGOCIACAO);
  const [groupBy, setGroupBy] = useState<GroupBy>("estagio");

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
        />
        
        <div className="mb-6">
          {activeView === "kanban" && (
            <Kanban 
              statusFilter={statusFilter} 
              groupBy={groupBy} 
            />
          )}
          {activeView === "dashboard" && <Dashboard />}
          {activeView === "list" && (
            <List 
              initialStatusFilter={statusFilter} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
