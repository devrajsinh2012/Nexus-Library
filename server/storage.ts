// Author: devrajsinh2012 <djgohil2012@gmail.com>
import { getDB } from "./db";
import { randomUUID } from "crypto";
import type { InsertBook, InsertLoan, InsertHold, Book, Loan, Hold } from "@shared/schema";
import type { User } from "@shared/models/auth";

// ── Helpers ────────────────────────────────────────────────────────────────
// MongoDB stores _id; our API exposes `id`. These helpers translate between them.
function fromDoc<T extends Record<string, any>>(doc: T): T & { id: string } {
  const { _id, ...rest } = doc as any;
  return { id: _id as string, ...rest } as T & { id: string };
}

const BOOKS = () => getDB().collection("books");
const LOANS = () => getDB().collection("loans");
const HOLDS = () => getDB().collection("holds");
const USERS = () => getDB().collection("users");

// ── Interface ───────────────────────────────────────────────────────────────
export interface IStorage {
  getBooks(search?: string): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, updates: Partial<InsertBook>): Promise<Book>;
  deleteBook(id: string): Promise<void>;

  getLoans(userId: string): Promise<(Loan & { book?: Book })[]>;
  getAllLoans(): Promise<(Loan & { book?: Book; userEmail?: string | null })[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  returnLoan(id: string): Promise<Loan>;

  getHolds(userId: string): Promise<(Hold & { book?: Book })[]>;
  getAllHolds(): Promise<(Hold & { book?: Book; userEmail?: string | null })[]>;
  createHold(hold: InsertHold): Promise<Hold>;

  getStats(): Promise<{ totalBooks: number; totalLoans: number; activeLoans: number; totalHolds: number; totalUsers: number }>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: Partial<User> & { email: string }): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
}

// ── Implementation ──────────────────────────────────────────────────────────
export class DatabaseStorage implements IStorage {

  // ── Books ─────────────────────────────────────────────────────────────────

  async getBooks(search?: string): Promise<Book[]> {
    const filter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { authors: { $regex: search, $options: "i" } },
            { isbn13: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const docs = await BOOKS().find(filter).sort({ createdAt: -1 }).toArray();
    return docs.map(fromDoc) as unknown as Book[];
  }

  async getBook(id: string): Promise<Book | undefined> {
    const doc = await BOOKS().findOne({ _id: id as any });
    return doc ? (fromDoc(doc) as unknown as Book) : undefined;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const id = randomUUID();
    const doc = { _id: id, ...book, createdAt: new Date() };
    await BOOKS().insertOne(doc as any);
    return fromDoc(doc) as unknown as Book;
  }

  async updateBook(id: string, updates: Partial<InsertBook>): Promise<Book> {
    await BOOKS().updateOne({ _id: id as any }, { $set: updates });
    const doc = await BOOKS().findOne({ _id: id as any });
    return fromDoc(doc!) as unknown as Book;
  }

  async deleteBook(id: string): Promise<void> {
    await BOOKS().deleteOne({ _id: id as any });
  }

  // ── Loans ─────────────────────────────────────────────────────────────────

  async getLoans(userId: string): Promise<(Loan & { book?: Book })[]> {
    const rows = await LOANS().aggregate([
      { $match: { userId } },
      { $lookup: { from: "books", localField: "bookId", foreignField: "_id", as: "bookArr" } },
    ]).toArray();

    return rows.map((r: any) => {
      const book = r.bookArr?.[0] ? fromDoc(r.bookArr[0]) as Book : undefined;
      const { bookArr, _id, ...rest } = r;
      return { id: _id as string, ...rest, book } as Loan & { book?: Book };
    });
  }

  async getAllLoans(): Promise<(Loan & { book?: Book; userEmail?: string | null })[]> {
    const rows = await LOANS().aggregate([
      { $lookup: { from: "books", localField: "bookId", foreignField: "_id", as: "bookArr" } },
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userArr" } },
    ]).toArray();

    return rows.map((r: any) => {
      const book = r.bookArr?.[0] ? fromDoc(r.bookArr[0]) as Book : undefined;
      const userEmail: string | null = r.userArr?.[0]?.email ?? null;
      const { bookArr, userArr, _id, ...rest } = r;
      return { id: _id as string, ...rest, book, userEmail } as Loan & { book?: Book; userEmail?: string | null };
    });
  }

  async createLoan(loan: InsertLoan): Promise<Loan> {
    const id = randomUUID();
    const doc = { _id: id, ...loan, checkedOutAt: new Date(), returnedAt: null };
    await LOANS().insertOne(doc as any);
    return fromDoc(doc) as unknown as Loan;
  }

  async returnLoan(id: string): Promise<Loan> {
    await LOANS().updateOne({ _id: id as any }, { $set: { returnedAt: new Date() } });
    const doc = await LOANS().findOne({ _id: id as any });
    return fromDoc(doc!) as unknown as Loan;
  }

  // ── Holds ─────────────────────────────────────────────────────────────────

  async getHolds(userId: string): Promise<(Hold & { book?: Book })[]> {
    const rows = await HOLDS().aggregate([
      { $match: { userId } },
      { $lookup: { from: "books", localField: "bookId", foreignField: "_id", as: "bookArr" } },
    ]).toArray();

    return rows.map((r: any) => {
      const book = r.bookArr?.[0] ? fromDoc(r.bookArr[0]) as Book : undefined;
      const { bookArr, _id, ...rest } = r;
      return { id: _id as string, ...rest, book } as Hold & { book?: Book };
    });
  }

  async getAllHolds(): Promise<(Hold & { book?: Book; userEmail?: string | null })[]> {
    const rows = await HOLDS().aggregate([
      { $lookup: { from: "books", localField: "bookId", foreignField: "_id", as: "bookArr" } },
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userArr" } },
    ]).toArray();

    return rows.map((r: any) => {
      const book = r.bookArr?.[0] ? fromDoc(r.bookArr[0]) as Book : undefined;
      const userEmail: string | null = r.userArr?.[0]?.email ?? null;
      const { bookArr, userArr, _id, ...rest } = r;
      return { id: _id as string, ...rest, book, userEmail } as Hold & { book?: Book; userEmail?: string | null };
    });
  }

  async createHold(hold: InsertHold): Promise<Hold> {
    const id = randomUUID();
    const doc = { _id: id, ...hold, requestedAt: new Date() };
    await HOLDS().insertOne(doc as any);
    return fromDoc(doc) as unknown as Hold;
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  async getStats() {
    const [totalBooks, totalLoans, activeLoans, totalHolds, totalUsers] = await Promise.all([
      BOOKS().countDocuments(),
      LOANS().countDocuments(),
      LOANS().countDocuments({ returnedAt: null }),
      HOLDS().countDocuments(),
      USERS().countDocuments(),
    ]);
    return { totalBooks, totalLoans, activeLoans, totalHolds, totalUsers };
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async getAllUsers(): Promise<User[]> {
    const docs = await USERS().find({}).toArray();
    return docs.map(fromDoc) as unknown as User[];
  }

  async upsertUser(user: Partial<User> & { email: string }): Promise<User> {
    const now = new Date();
    const result = await USERS().findOneAndUpdate(
      { email: user.email },
      {
        $setOnInsert: {
          _id: user.id || randomUUID(),
          email: user.email,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          role: user.role || "patron",
          profileImageUrl: user.profileImageUrl || null,
          createdAt: now,
        },
        $set: { updatedAt: now },
      },
      { upsert: true, returnDocument: "after" }
    );
    return fromDoc(result!) as unknown as User;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    await USERS().updateOne({ _id: id as any }, { $set: { role, updatedAt: new Date() } });
    const doc = await USERS().findOne({ _id: id as any });
    return fromDoc(doc!) as unknown as User;
  }
}

export const storage = new DatabaseStorage();
