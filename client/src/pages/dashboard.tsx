import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/dashboard/stat-card";
import BarChart from "@/components/dashboard/bar-chart";
import HorizontalBarChart from "@/components/dashboard/horizontal-bar-chart";
import { DollarSign, Briefcase, CheckCircle, Clock } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { DealStage } from "@shared/schema";

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  const {
    valorTotalEmAndamento,
    numeroNegociosAbertos,
    taxaDeGanho,
    negociosPorEstagio,
    valorPorVendedor
  } = dashboardData;

  // Prepare data for charts
  const stageChartData = Object.entries(negociosPorEstagio).map(([stage, count]) => ({
    name: stage,
    value: count,
  }));

  const sellerChartData = Object.entries(valorPorVendedor)
    .sort((a, b) => b[1] - a[1])
    .map(([seller, value]) => ({
      name: seller,
      value,
    }));

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total em Andamento"
          value={formatCurrency(valorTotalEmAndamento)}
          icon={<DollarSign />}
          trend={12.5}
          trendLabel="vs mês anterior"
        />
        <StatCard
          title="Negócios Abertos"
          value={numeroNegociosAbertos.toString()}
          icon={<Briefcase />}
          trend={-5.2}
          trendLabel="vs mês anterior"
        />
        <StatCard
          title="Taxa de Ganho"
          value={formatPercent(taxaDeGanho)}
          icon={<CheckCircle />}
          trend={3.1}
          trendLabel="vs mês anterior"
        />
        <StatCard
          title="Tempo Médio de Ciclo"
          value="18 dias"
          icon={<Clock />}
          trend={2.3}
          trendLabel="vs mês anterior"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
          <h3 className="font-medium text-neutral-800 mb-4">Negócios por Estágio</h3>
          <div className="h-64">
            <BarChart data={stageChartData} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
          <h3 className="font-medium text-neutral-800 mb-4">Valor por Vendedor</h3>
          <div className="h-64">
            <HorizontalBarChart 
              data={sellerChartData}
              formatValue={formatCurrency}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
