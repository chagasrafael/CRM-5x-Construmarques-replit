import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Deal status enum
export const DealStatus = {
  EM_NEGOCIACAO: "Em Negociacao",
  GANHO: "Ganho",
  PERDA: "Perda",
  RESPOSTA_PENDENTE_CLIENTE: "Resposta Pendente do Cliente",
  PAGAMENTO_PENDENTE: "Pagamento Pendente",
  RESPOSTA_PENDENTE_VENDEDOR: "Resposta Pendente do Vendedor",
  VENDIDO: "Vendido",
} as const;

export type DealStatusType = typeof DealStatus[keyof typeof DealStatus];

// Deal stages enum
export const DealStage = {
  NOVO_CONTATO: "Novo Contato",
  FOLLOW_UP_AUTOMATICO: "Follow-Up Automático",
  RECUPERADO_POR_IA: "Recuperado por IA",
  PERDIDO: "Perdido",
  VENDIDO: "Vendido",
} as const;

export type DealStageType = typeof DealStage[keyof typeof DealStage];

// Deal schema
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  nomeCliente: text("Nome_cliente").notNull(),
  valorNegociado: numeric("valor_negociado").notNull(),
  estagio: text("estagio").notNull().$type<DealStageType>(),
  status: text("status").notNull().$type<DealStatusType>(),
  vendedor: text("vendedor").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

// Dashboard schema
export type DashboardData = {
  valorTotalEmAndamento: number;
  numeroNegociosAbertos: number;
  taxaDeGanho: number;
  negociosPorEstagio: Record<DealStageType, number>;
  valorPorVendedor: Record<string, number>;
};
