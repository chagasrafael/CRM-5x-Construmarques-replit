import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import DealDialog from "@/components/deals/deal-dialog";

export default function Header() {
  const [openNewDeal, setOpenNewDeal] = useState(false);

  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-neutral-800">CRM</h1>
          <div className="border-l border-neutral-200 h-6"></div>
          <nav className="flex">
            <button className="px-4 py-2 font-medium text-primary border-b-2 border-primary flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Negociações</span>
            </button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Pesquisar" 
              className="py-1.5 px-3 pl-9 rounded-md"
            />
            <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-2.5" />
          </div>
          
          <Button 
            className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
            onClick={() => setOpenNewDeal(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>Nova Negociação</span>
          </Button>
        </div>

        <DealDialog
          open={openNewDeal}
          onOpenChange={setOpenNewDeal}
        />
      </div>
    </header>
  );
}
