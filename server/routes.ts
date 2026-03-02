// Author: devrajsinh2012 <djgohil2012@gmail.com>
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated, isAdmin } from "./auth";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // ==================== BOOK ROUTES ====================

  app.get(api.books.list.path, async (req, res) => {
    const search = req.query.search as string;
    const booksList = await storage.getBooks(search);
    res.json(booksList);
  });

  app.get(api.books.get.path, async (req, res) => {
    const book = await storage.getBook(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  });

  app.post(api.books.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.books.create.input.parse(req.body);
      const book = await storage.createBook(input);
      res.status(201).json(book);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.books.aiSummary.path, async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      if (!book) return res.status(404).json({ message: "Book not found" });

      if (book.aiSummary) {
        return res.json({ summary: book.aiSummary });
      }

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are an expert librarian. Summarize the following book in 3 short paragraphs: 1) What it's about, 2) Key themes, 3) Who should read it." },
          { role: "user", content: `Title: ${book.title}\nAuthors: ${book.authors.join(", ")}\nDescription: ${book.description || ""}` }
        ]
      });

      const summary = response.choices[0]?.message?.content || "Summary unavailable.";
      await storage.updateBook(book.id, { aiSummary: summary });

      res.json({ summary });
    } catch (error) {
      console.error("AI Summary error:", error);
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  // ==================== LOAN ROUTES ====================

  app.get(api.loans.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const loansList = await storage.getLoans(userId);
    res.json(loansList);
  });

  app.post(api.loans.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.loans.create.input.parse(req.body);

      const book = await storage.getBook(input.bookId);
      if (!book || book.availableCopies <= 0) {
        return res.status(400).json({ message: "Book not available" });
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 2 weeks

      const loan = await storage.createLoan({
        bookId: input.bookId,
        userId,
        dueDate
      });

      await storage.updateBook(book.id, { availableCopies: book.availableCopies - 1 });

      res.status(201).json(loan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post(api.loans.return.path, isAuthenticated, async (req: any, res) => {
    const loan = await storage.returnLoan(req.params.id);
    const book = await storage.getBook(loan.bookId);
    if (book) {
      await storage.updateBook(book.id, { availableCopies: book.availableCopies + 1 });
    }
    res.json(loan);
  });

  // ==================== HOLD ROUTES ====================

  app.get(api.holds.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const holdsList = await storage.getHolds(userId);
    res.json(holdsList);
  });

  app.post(api.holds.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.holds.create.input.parse(req.body);
      const hold = await storage.createHold({
        bookId: input.bookId,
        userId,
        status: "waiting"
      });
      res.status(201).json(hold);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // ==================== ADMIN ROUTES ====================

  // Admin stats dashboard
  app.get("/api/admin/stats", isAdmin, async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Admin: all books (same as public but for consistency)
  app.get("/api/admin/books", isAdmin, async (req, res) => {
    const search = req.query.search as string;
    const booksList = await storage.getBooks(search);
    res.json(booksList);
  });

  // Admin: update a book
  app.put("/api/admin/books/:id", isAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      const updates = req.body;
      const book = await storage.updateBook(id, updates);
      res.json(book);
    } catch (err) {
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  // Admin: delete a book
  app.delete("/api/admin/books/:id", isAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      await storage.deleteBook(id);
      res.json({ message: "Book deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Admin: all loans
  app.get("/api/admin/loans", isAdmin, async (_req, res) => {
    try {
      const allLoans = await storage.getAllLoans();
      res.json(allLoans);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch loans" });
    }
  });

  // Admin: return a loan (staff-initiated)
  app.post("/api/admin/loans/:id/return", isAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      const loan = await storage.returnLoan(id);
      const book = await storage.getBook(loan.bookId);
      if (book) {
        await storage.updateBook(book.id, { availableCopies: book.availableCopies + 1 });
      }
      res.json(loan);
    } catch (err) {
      res.status(500).json({ message: "Failed to return loan" });
    }
  });

  // Admin: all holds
  app.get("/api/admin/holds", isAdmin, async (_req, res) => {
    try {
      const allHolds = await storage.getAllHolds();
      res.json(allHolds);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch holds" });
    }
  });

  // Admin: all users
  app.get("/api/admin/users", isAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin: update user role
  app.patch("/api/admin/users/:id/role", isAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      const { role } = req.body;
      if (!["patron", "librarian", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const user = await storage.updateUserRole(id, role);
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // ==================== DATABASE SEED ====================

  async function seedDatabase() {
    const existingBooks = await storage.getBooks();
    if (existingBooks.length === 0) {
      await storage.createBook({
        title: "The Great Gatsby",
        authors: ["F. Scott Fitzgerald"],
        description: "A novel about the American Dream in the 1920s.",
        genres: ["Fiction", "Classic"],
        totalCopies: 3,
        availableCopies: 3,
        coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800"
      });
      await storage.createBook({
        title: "To Kill a Mockingbird",
        authors: ["Harper Lee"],
        description: "A novel about racial injustice in the American South.",
        genres: ["Fiction", "Classic"],
        totalCopies: 5,
        availableCopies: 2,
        coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800"
      });
      await storage.createBook({
        title: "1984",
        authors: ["George Orwell"],
        description: "A dystopian social science fiction novel.",
        genres: ["Fiction", "Sci-Fi"],
        totalCopies: 4,
        availableCopies: 0,
        coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800"
      });
    }
  }
  seedDatabase().catch(console.error);

  return httpServer;
}
