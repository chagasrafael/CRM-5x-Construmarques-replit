import { useState } from "react";
import Header from "@/components/layout/header";
import ViewTabs from "@/components/layout/view-tabs";
import Kanban from "@/pages/kanban";
import Dashboard from "@/pages/dashboard";
import List from "@/pages/list";

type View = "kanban" | "dashboard" | "list";

export default function Home() {
  const [activeView, setActiveView] = useState<View>("kanban");

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <ViewTabs activeView={activeView} onViewChange={setActiveView} />
        
        <div className="mb-6">
          {activeView === "kanban" && <Kanban />}
          {activeView === "dashboard" && <Dashboard />}
          {activeView === "list" && <List />}
        </div>
      </main>
    </div>
  );
}
