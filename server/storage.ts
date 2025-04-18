import { 
  Deal, 
  InsertDeal, 
  DealStage, 
  DealStatus, 
  type DashboardData 
} from "@shared/schema";

export interface IStorage {
  getDeals(): Promise<Deal[]>;
  getDeal(id: number): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: number, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: number): Promise<boolean>;
  getDashboardData(): Promise<DashboardData>;
}

export class MemStorage implements IStorage {
  private deals: Map<number, Deal>;
  private currentId: number;

  constructor() {
    this.deals = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    const sampleDeals: InsertDeal[] = [
      {
        nomeCliente: "Empresa Exemplo Ltda",
        valorNegociado: 750050,
        estagio: DealStage.NOVO_LEAD,
        status: DealStatus.EM_NEGOCIACAO,
        vendedor: "João Silva Sauro",
      },
      {
        nomeCliente: "Empresa Exemplo Ltda",
        valorNegociado: 750050,
        estagio: DealStage.FOLLOW_UP_AUTOMATICO,
        status: DealStatus.EM_NEGOCIACAO,
        vendedor: "João Silva",
      },
      {
        nomeCliente: "Empresa XYZ Atualizada Ltda",
        valorNegociado: 11200.99,
        estagio: DealStage.FOLLOW_UP_AUTOMATICO,
        status: DealStatus.GANHO,
        vendedor: "Mariana Silva",
      },
      {
        nomeCliente: "Empresa Exemplo Ltda",
        valorNegociado: 750050,
        estagio: DealStage.NOVO_LEAD,
        status: DealStatus.EM_NEGOCIACAO,
        vendedor: "João Silva Sauro",
      },
      {
        nomeCliente: "Empresa Exemplo Ltda",
        valorNegociado: 750050,
        estagio: DealStage.NOVO_LEAD,
        status: DealStatus.PERDA,
        vendedor: "João Silva Sauro",
      },
      {
        nomeCliente: "Empresa Exemplo Ltda",
        valorNegociado: 750050,
        estagio: DealStage.NOVO_LEAD,
        status: DealStatus.GANHO,
        vendedor: "João Silva Sauro",
      },
      {
        nomeCliente: "Empresa Exemplo Ltda",
        valorNegociado: 750050,
        estagio: DealStage.NOVO_LEAD,
        status: DealStatus.PERDA,
        vendedor: "João Silva",
      },
      {
        nomeCliente: "Empresa Exemplo Ltda",
        valorNegociado: 750050,
        estagio: DealStage.FOLLOW_UP_MANUAL,
        status: DealStatus.EM_NEGOCIACAO,
        vendedor: "João Silva Sauro",
      }
    ];

    sampleDeals.forEach(deal => {
      this.createDeal(deal);
    });
  }

  async getDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values());
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const id = this.currentId++;
    const now = new Date();
    const deal: Deal = { 
      ...insertDeal, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.deals.set(id, deal);
    return deal;
  }

  async updateDeal(id: number, deal: Partial<InsertDeal>): Promise<Deal | undefined> {
    const existingDeal = this.deals.get(id);
    
    if (!existingDeal) {
      return undefined;
    }
    
    const updatedDeal: Deal = {
      ...existingDeal,
      ...deal,
      updatedAt: new Date()
    };
    
    this.deals.set(id, updatedDeal);
    return updatedDeal;
  }

  async deleteDeal(id: number): Promise<boolean> {
    return this.deals.delete(id);
  }

  async getDashboardData(): Promise<DashboardData> {
    const deals = Array.from(this.deals.values());
    
    // Calculate total value of active deals
    const valorTotalEmAndamento = deals
      .filter(deal => deal.status === DealStatus.EM_NEGOCIACAO)
      .reduce((sum, deal) => sum + Number(deal.valorNegociado), 0);
    
    // Count open deals
    const numeroNegociosAbertos = deals.filter(
      deal => deal.status === DealStatus.EM_NEGOCIACAO
    ).length;
    
    // Calculate win rate
    const closedDeals = deals.filter(
      deal => deal.status === DealStatus.GANHO || deal.status === DealStatus.PERDA
    );
    const wonDeals = deals.filter(deal => deal.status === DealStatus.GANHO);
    const taxaDeGanho = closedDeals.length > 0 ? 
      wonDeals.length / closedDeals.length : 0;
    
    // Count deals by stage
    const negociosPorEstagio = {
      [DealStage.NOVO_LEAD]: 0,
      [DealStage.FOLLOW_UP_MANUAL]: 0,
      [DealStage.FOLLOW_UP_AUTOMATICO]: 0,
      [DealStage.PROPOSTA_ENVIADA]: 0,
      [DealStage.NEGOCIACAO_FECHADA]: 0
    };
    
    deals.forEach(deal => {
      negociosPorEstagio[deal.estagio]++;
    });
    
    // Sum values by seller
    const valorPorVendedor: Record<string, number> = {};
    deals.forEach(deal => {
      if (!valorPorVendedor[deal.vendedor]) {
        valorPorVendedor[deal.vendedor] = 0;
      }
      valorPorVendedor[deal.vendedor] += Number(deal.valorNegociado);
    });
    
    return {
      valorTotalEmAndamento,
      numeroNegociosAbertos,
      taxaDeGanho,
      negociosPorEstagio,
      valorPorVendedor
    };
  }
}

export const storage = new MemStorage();
