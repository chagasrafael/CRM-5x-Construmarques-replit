/**
 * Cliente de API para comunicação com o n8n.
 * Este módulo configura uma instância base para as requisições HTTP.
 */

const API_BASE_URL = "https://workflows-webhook.iev.com.br/webhook/crm/apiv1";

/**
 * Função utilitária para fazer requisições à API do n8n.
 * Inclui tratamento básico de erros.
 */
export async function n8nApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API n8n: ${response.status} - ${errorText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error("Erro na comunicação com API n8n:", error);
    throw error;
  }
}

/**
 * Tipos para os dados da API
 */
export interface DashboardData {
  valorTotalEmAndamento: number;
  numeroNegociosAbertos: number;
  taxaDeGanho: number;
  negociosPorEstagio: Record<string, number>;
  valorPorVendedor: Record<string, number>;
}

export interface Negociacao {
  id: number;
  // Campos podem vir com nomenclaturas diferentes da API
  nomeCliente?: string;
  Nome_cliente?: string;
  valorNegociado?: number;
  valor_negociado?: number;
  estagio: string;
  status: string;
  vendedor: string;
  // Campos para datas
  createdAt?: string | Date;
  dataCriacao?: string | Date;
  updatedAt?: string | Date;
  dataModificacao?: string | Date;
  dataUltimaModificacao?: string | Date;
  // Campos adicionais da API
  link_conversa?: string;
  resumo?: string;
}

/**
 * Funções específicas para operações com negociações
 */

// Buscar todas as negociações
export async function fetchNegociacoes() {
  try {
    // Tenta obter dados da API n8n
    console.log("Tentando obter dados da API n8n:", `${API_BASE_URL}/negociacoes`);
    const data = await n8nApiRequest<Negociacao[]>('/negociacoes');
    console.log("Dados recebidos da API n8n:", data);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn("API n8n retornou array vazio ou dados inválidos, tentando API local");
      throw new Error("Dados vazios ou inválidos da API n8n");
    }
    
    return data;
  } catch (error) {
    console.warn("Erro ao buscar dados da API n8n, usando fallback local:", error);
    
    // Em caso de falha, faz fallback para API local
    console.log("Tentando API local...");
    const response = await fetch('/api/deals');
    if (!response.ok) {
      throw new Error(`Erro na API local: ${response.status}`);
    }
    const localData = await response.json();
    console.log("Dados recebidos da API local:", localData);
    return localData;
  }
}

// Buscar dados para o dashboard
export async function fetchDashboardData() {
  try {
    // Tenta obter dados do dashboard da API n8n
    return await n8nApiRequest<DashboardData>('/dashboard');
  } catch (error) {
    console.warn("Erro ao buscar dados do dashboard da API n8n, usando fallback local:", error);
    
    // Em caso de falha, faz fallback para API local
    const response = await fetch('/api/dashboard');
    if (!response.ok) {
      throw new Error(`Erro na API local: ${response.status}`);
    }
    return response.json();
  }
}

// Atualizar uma negociação
export async function updateNegociacao(id: number, data: any) {
  return n8nApiRequest('/negociacoes', {
    method: 'POST',
    body: JSON.stringify({
      id,
      ...data
    })
  });
}