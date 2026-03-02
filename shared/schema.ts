import { z } from "zod";

// ── Book ────────────────────────────────────────────────────────────────────
export const insertBookSchema = z.object({
  isbn13: z.string().optional().nullable(),
  title: z.string().min(1, "Title is required"),
  authors: z.array(z.string()).min(1, "At least one author is required"),
  description: z.string().optional().nullable(),
  aiSummary: z.string().optional().nullable(),
  genres: z.array(z.string()).optional().default([]),
  coverUrl: z.string().optional().nullable(),
  totalCopies: z.number().int().min(1).default(1),
  availableCopies: z.number().int().min(0).default(1),
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = InsertBook & { id: string; createdAt: Date | null };

// ── Loan ────────────────────────────────────────────────────────────────────
export const insertLoanSchema = z.object({
  bookId: z.string().min(1),
  userId: z.string().min(1),
  dueDate: z.coerce.date(),
});

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = InsertLoan & {
  id: string;
  checkedOutAt: Date | null;
  returnedAt: Date | null;
};

// ── Hold ────────────────────────────────────────────────────────────────────
export const insertHoldSchema = z.object({
  bookId: z.string().min(1),
  userId: z.string().min(1),
  status: z.string().default("waiting"),
});

export type InsertHold = z.infer<typeof insertHoldSchema>;
export type Hold = InsertHold & {
  id: string;
  requestedAt: Date | null;
};

// Re-export auth types so shared/schema is still a one-stop-shop
export * from "./models/auth";
