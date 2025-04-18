import { apiRequest } from "@/lib/queryClient";
import type { Deal, InsertDeal } from "@shared/schema";

export async function createDeal(dealData: InsertDeal): Promise<Deal> {
  const response = await apiRequest("POST", "/api/deals", dealData);
  return response.json();
}

export async function updateDeal(id: number, dealData: Partial<InsertDeal>): Promise<Deal> {
  const response = await apiRequest("PATCH", `/api/deals/${id}`, dealData);
  return response.json();
}

export async function deleteDeal(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/deals/${id}`);
}
