import { db } from "./db";
import {
  items, bills, billItems,
  type Item, type InsertItem, type Bill, type CreateBillRequest, type BillWithItems
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Items
  getItems(): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: Partial<InsertItem>): Promise<Item>;
  deleteItem(id: number): Promise<void>;

  // Bills
  getBills(): Promise<BillWithItems[]>;
  createBill(billData: CreateBillRequest): Promise<Bill>;
}

export class DatabaseStorage implements IStorage {
  async getItems(): Promise<Item[]> {
    return await db.select().from(items).orderBy(items.name);
  }

  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const [item] = await db.insert(items).values(insertItem).returning();
    return item;
  }

  async updateItem(id: number, updates: Partial<InsertItem>): Promise<Item> {
    const [item] = await db
      .update(items)
      .set(updates)
      .where(eq(items.id, id))
      .returning();
    return item;
  }

  async deleteItem(id: number): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  async getBills(): Promise<BillWithItems[]> {
    // Fetch bills and their items
    // Using a query builder approach for relations is cleaner but manual join works too
    // Let's use the query API if possible, or just two queries for simplicity in MVP
    
    // Drizzle's query.bills.findMany({ with: { items: true } }) is best
    return await db.query.bills.findMany({
      with: {
        items: true
      },
      orderBy: [desc(bills.createdAt)]
    });
  }

  async createBill(billData: CreateBillRequest): Promise<Bill> {
    return await db.transaction(async (tx) => {
      let totalAmount = 0;
      
      // Verify stock and calculate total
      for (const reqItem of billData.items) {
        const [item] = await tx.select().from(items).where(eq(items.id, reqItem.itemId));
        if (!item) throw new Error(`Item ${reqItem.itemId} not found`);
        if (item.quantity < reqItem.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Available: ${item.quantity}`);
        }
        totalAmount += Number(item.price) * reqItem.quantity;
      }

      // Create Bill
      const [newBill] = await tx.insert(bills).values({
        customerName: billData.customerName,
        paymentMethod: billData.paymentMethod,
        totalAmount: totalAmount.toString(),
      }).returning();

      // Create Bill Items and Deduct Stock
      for (const reqItem of billData.items) {
        const [item] = await tx.select().from(items).where(eq(items.id, reqItem.itemId));
        
        // Add bill item
        await tx.insert(billItems).values({
          billId: newBill.id,
          itemId: item.id,
          itemName: item.name,
          quantity: reqItem.quantity,
          priceAtTime: item.price,
        });

        // Update stock
        await tx.update(items)
          .set({ quantity: item.quantity - reqItem.quantity })
          .where(eq(items.id, item.id));
      }

      return newBill;
    });
  }
}

export const storage = new DatabaseStorage();
