import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku"),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(0),
  price: numeric("price").notNull(),
  minQuantity: integer("min_quantity").default(5),
  description: text("description"),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  paymentMethod: text("payment_method").notNull(), // 'Cash', 'Card', 'Room Charge'
  totalAmount: numeric("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const billItems = pgTable("bill_items", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").notNull(),
  itemId: integer("item_id").notNull(),
  itemName: text("item_name").notNull(), // Snapshot of name
  quantity: integer("quantity").notNull(),
  priceAtTime: numeric("price_at_time").notNull(), // Snapshot of price
});

// === RELATIONS ===
export const itemsRelations = relations(items, ({ many }) => ({
  billItems: many(billItems),
}));

export const billsRelations = relations(bills, ({ many }) => ({
  items: many(billItems),
}));

export const billItemsRelations = relations(billItems, ({ one }) => ({
  bill: one(bills, {
    fields: [billItems.billId],
    references: [bills.id],
  }),
  item: one(items, {
    fields: [billItems.itemId],
    references: [items.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertItemSchema = createInsertSchema(items).omit({ id: true });
// For bill creation, we calculate total on server, so we omit it from input
export const insertBillSchema = createInsertSchema(bills).omit({ id: true, createdAt: true, totalAmount: true }); 

// === EXPLICIT API CONTRACT TYPES ===
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type Bill = typeof bills.$inferSelect;
export type BillItem = typeof billItems.$inferSelect;

// Request types
export type CreateBillRequest = {
  customerName: string;
  paymentMethod: string;
  items: { itemId: number; quantity: number }[];
};

export type BillWithItems = Bill & {
  items: BillItem[];
};
