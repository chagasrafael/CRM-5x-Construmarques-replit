import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

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

/**
 * Formata data para exibição no formato brasileiro
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return "";
    
    return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "";
  }
}

// Função utilitária para obter o nome do cliente considerando ambas as nomenclaturas da API
export function getNomeCliente(deal: any): string {
  return deal.nomeCliente || deal.Nome_cliente || '';
}

// Função utilitária para obter o valor negociado considerando ambas as nomenclaturas da API
export function getValorNegociado(deal: any): number {
  return deal.valorNegociado || deal.valor_negociado || 0;
}

/**
 * Obtém a data de criação da negociação, tratando diferentes nomenclaturas
 */
export function getDataCriacao(deal: any): Date | undefined {
  // Tenta diferentes formatos possíveis do campo de data de criação
  const data = deal.createdAt || deal.dataCriacao;
  if (!data) return undefined;
  
  try {
    return typeof data === "string" ? parseISO(data) : data;
  } catch (error) {
    return undefined;
  }
}

/**
 * Obtém a data de modificação da negociação, tratando diferentes nomenclaturas
 */
export function getDataModificacao(deal: any): Date | undefined {
  // Tenta diferentes formatos possíveis do campo de data de modificação
  const data = deal.updatedAt || deal.dataModificacao;
  if (!data) return undefined;
  
  try {
    return typeof data === "string" ? parseISO(data) : data;
  } catch (error) {
    return undefined;
  }
}
