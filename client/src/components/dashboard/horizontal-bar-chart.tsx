import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HorizontalBarChartProps {
  data: Array<{ name: string; value: number }>;
  formatValue?: (value: number) => string;
}

export default function HorizontalBarChart({ 
  data, 
  formatValue = (val) => val.toString() 
}: HorizontalBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 30,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis 
          dataKey="name" 
          type="category" 
          tick={{ fontSize: 12 }}
          width={120}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "4px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [formatValue(value), "Valor"]}
        />
        <Bar 
          dataKey="value" 
          fill="hsl(211, 56%, 50%)" 
          radius={[0, 4, 4, 0]} 
          barSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
