import { useState, useEffect } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const metabaseUrl = "https://metabase.5x.flowmax.digital/public/dashboard/537ff47e-53f5-4cc6-9b5f-272ff9cf812a?data=&vendedor=";
  
  useEffect(() => {
    // Adicionamos um pequeno atraso para mostrar o loading e dar tempo para o iframe carregar
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full">
      {loading && (
        <div className="flex items-center justify-center h-[700px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-neutral-600">Carregando dashboard...</p>
          </div>
        </div>
      )}
      
      <div className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
        <iframe 
          src={metabaseUrl}
          title="Dashboard do Metabase"
          className="w-full h-[800px] border-0 rounded-lg shadow-md"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
