import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numValue);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Função utilitária para obter o nome do cliente considerando ambas as nomenclaturas da API
export function getNomeCliente(deal: any): string {
  return deal.nomeCliente || deal.Nome_cliente || '';
}

// Função utilitária para obter o valor negociado considerando ambas as nomenclaturas da API
export function getValorNegociado(deal: any): number {
  return deal.valorNegociado || deal.valor_negociado || 0;
}
