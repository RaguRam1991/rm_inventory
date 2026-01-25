import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === Items Routes ===
  app.get(api.items.list.path, async (req, res) => {
    const items = await storage.getItems();
    res.json(items);
  });

  app.get(api.items.get.path, async (req, res) => {
    const item = await storage.getItem(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  });

  app.post(api.items.create.path, async (req, res) => {
    try {
      const input = api.items.create.input.parse(req.body);
      // Ensure price is valid numeric string (frontend sends string usually)
      const item = await storage.createItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.items.update.path, async (req, res) => {
    try {
      const input = api.items.update.input.parse(req.body);
      const item = await storage.updateItem(Number(req.params.id), input);
      if (!item) return res.status(404).json({ message: "Item not found" });
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.items.delete.path, async (req, res) => {
    await storage.deleteItem(Number(req.params.id));
    res.status(204).send();
  });

  // === Bills Routes ===
  app.get(api.bills.list.path, async (req, res) => {
    const bills = await storage.getBills();
    res.json(bills);
  });

  app.post(api.bills.create.path, async (req, res) => {
    try {
      const input = api.bills.create.input.parse(req.body);
      const bill = await storage.createBill(input);
      res.status(201).json(bill);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      if (err instanceof Error) {
        // Handle business logic errors (e.g. insufficient stock)
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

// Seed function
export async function seedDatabase() {
  const existingItems = await storage.getItems();
  if (existingItems.length === 0) {
    await storage.createItem({
      name: "Mineral Water (500ml)",
      sku: "BEV-001",
      category: "Beverages",
      quantity: 100,
      price: "2.50",
      minQuantity: 20,
      description: "Standard bottled water"
    });
    await storage.createItem({
      name: "Soda Can (Coke)",
      sku: "BEV-002",
      category: "Beverages",
      quantity: 50,
      price: "3.00",
      minQuantity: 10,
      description: "Chilled soda"
    });
    await storage.createItem({
      name: "Club Sandwich",
      sku: "FOOD-001",
      category: "Food",
      quantity: 15,
      price: "12.00",
      minQuantity: 5,
      description: "Freshly made sandwich"
    });
    await storage.createItem({
      name: "Toiletries Kit",
      sku: "AMEN-001",
      category: "Amenities",
      quantity: 200,
      price: "5.00",
      minQuantity: 30,
      description: "Toothbrush, paste, soap"
    });
    await storage.createItem({
      name: "Spa Voucher (1hr)",
      sku: "SVC-001",
      category: "Services",
      quantity: 999, // Virtual
      price: "80.00",
      minQuantity: 0,
      description: "Access to spa services"
    });
  }
}
