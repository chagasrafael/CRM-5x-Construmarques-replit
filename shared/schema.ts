import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Deal status enum
export const DealStatus = {
  EM_NEGOCIACAO: "Em Negociação",
  GANHO: "Ganho",
  PERDA: "Perda",
} as const;

export type DealStatusType = typeof DealStatus[keyof typeof DealStatus];

// Deal stages enum
export const DealStage = {
  NOVO_LEAD: "Novo Lead",
  FOLLOW_UP_MANUAL: "Follow Up Manual",
  FOLLOW_UP_AUTOMATICO: "Follow Up Automático",
  PROPOSTA_ENVIADA: "Proposta Enviada",
  NEGOCIACAO_FECHADA: "Negociação Fechada",
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
