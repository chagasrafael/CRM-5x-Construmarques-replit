import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDealSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all deals
  app.get("/api/deals", async (_req: Request, res: Response) => {
    try {
      const deals = await storage.getDeals();
      return res.json(deals);
    } catch (error) {
      console.error("Error fetching deals:", error);
      return res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  // Get a specific deal
  app.get("/api/deals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      const deal = await storage.getDeal(id);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      return res.json(deal);
    } catch (error) {
      console.error("Error fetching deal:", error);
      return res.status(500).json({ message: "Failed to fetch deal" });
    }
  });

  // Create a new deal
  app.post("/api/deals", async (req: Request, res: Response) => {
    try {
      const dealData = insertDealSchema.parse(req.body);
      const newDeal = await storage.createDeal(dealData);
      return res.status(201).json(newDeal);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error creating deal:", error);
      return res.status(500).json({ message: "Failed to create deal" });
    }
  });

  // Update a deal
  app.patch("/api/deals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      // Partial validation of fields to update
      const dealData = insertDealSchema.partial().parse(req.body);
      
      const updatedDeal = await storage.updateDeal(id, dealData);
      
      if (!updatedDeal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      return res.json(updatedDeal);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error updating deal:", error);
      return res.status(500).json({ message: "Failed to update deal" });
    }
  });

  // Delete a deal
  app.delete("/api/deals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      const success = await storage.deleteDeal(id);
      
      if (!success) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting deal:", error);
      return res.status(500).json({ message: "Failed to delete deal" });
    }
  });

  // Get dashboard data
  app.get("/api/dashboard", async (_req: Request, res: Response) => {
    try {
      const dashboardData = await storage.getDashboardData();
      return res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
