import { pgTable, text, integer, timestamp, varchar, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth"; // Import auth users

export const books = pgTable("books", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  isbn13: text("isbn_13").unique(),
  title: text("title").notNull(),
  authors: text("authors").array().notNull(),
  description: text("description"),
  aiSummary: text("ai_summary"),
  genres: text("genres").array(),
  coverUrl: text("cover_url"),
  totalCopies: integer("total_copies").notNull().default(1),
  availableCopies: integer("available_copies").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loans = pgTable("loans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: uuid("book_id").notNull().references(() => books.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  checkedOutAt: timestamp("checked_out_at").defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  returnedAt: timestamp("returned_at"),
});

export const holds = pgTable("holds", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: uuid("book_id").notNull().references(() => books.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  requestedAt: timestamp("requested_at").defaultNow(),
  status: text("status").notNull().default("waiting"), // waiting, ready, fulfilled, cancelled
});

export const insertBookSchema = createInsertSchema(books).omit({ id: true, createdAt: true });
export const insertLoanSchema = createInsertSchema(loans).omit({ id: true, checkedOutAt: true, returnedAt: true });
export const insertHoldSchema = createInsertSchema(holds).omit({ id: true, requestedAt: true });

export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Loan = typeof loans.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Hold = typeof holds.$inferSelect;
export type InsertHold = z.infer<typeof insertHoldSchema>;

// Export auth models so they're available for Drizzle migrations
export * from "./models/auth";
