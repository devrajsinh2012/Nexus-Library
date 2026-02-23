import { db } from "./db";
import {
  books, loans, holds,
  type InsertBook, type InsertLoan, type InsertHold,
  type Book, type Loan, type Hold
} from "@shared/schema";
import { eq, ilike } from "drizzle-orm";

export interface IStorage {
  getBooks(search?: string): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, updates: Partial<InsertBook>): Promise<Book>;
  
  getLoans(userId: string): Promise<Loan[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  returnLoan(id: string): Promise<Loan>;

  getHolds(userId: string): Promise<Hold[]>;
  createHold(hold: InsertHold): Promise<Hold>;
}

export class DatabaseStorage implements IStorage {
  async getBooks(search?: string): Promise<Book[]> {
    if (search) {
      return await db.select().from(books).where(ilike(books.title, `%${search}%`));
    }
    return await db.select().from(books);
  }

  async getBook(id: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }

  async updateBook(id: string, updates: Partial<InsertBook>): Promise<Book> {
    const [updated] = await db.update(books).set(updates).where(eq(books.id, id)).returning();
    return updated;
  }

  async getLoans(userId: string): Promise<Loan[]> {
    return await db.select().from(loans).where(eq(loans.userId, userId));
  }

  async createLoan(loan: InsertLoan): Promise<Loan> {
    const [newLoan] = await db.insert(loans).values(loan).returning();
    return newLoan;
  }

  async returnLoan(id: string): Promise<Loan> {
    const [updated] = await db.update(loans).set({ returnedAt: new Date() }).where(eq(loans.id, id)).returning();
    return updated;
  }

  async getHolds(userId: string): Promise<Hold[]> {
    return await db.select().from(holds).where(eq(holds.userId, userId));
  }

  async createHold(hold: InsertHold): Promise<Hold> {
    const [newHold] = await db.insert(holds).values(hold).returning();
    return newHold;
  }
}

export const storage = new DatabaseStorage();
