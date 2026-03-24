// Author: devrajsinh2012 <djgohil2012@gmail.com>
import { randomUUID } from "crypto";
import { dbQuery, getDB } from "./db";
import type { InsertBook, InsertHold, InsertLoan, Book, Hold, Loan } from "@shared/schema";
import type { User } from "@shared/models/auth";

type DbBookRow = {
  id: string;
  isbn13: string | null;
  title: string;
  authors: string[];
  description: string | null;
  ai_summary: string | null;
  genres: string[];
  cover_url: string | null;
  total_copies: number;
  available_copies: number;
  created_at: string | Date;
};

type DbLoanRow = {
  id: string;
  book_id: string;
  user_id: string;
  due_date: string | Date;
  checked_out_at: string | Date;
  returned_at: string | Date | null;
};

type DbHoldRow = {
  id: string;
  book_id: string;
  user_id: string;
  status: string;
  requested_at: string | Date;
};

type DbLoanRequestRow = {
  id: string;
  book_id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string | Date;
  reviewed_at: string | Date | null;
  reviewed_by: string | null;
};

type DbUserRow = {
  id: string;
  email: string;
  password: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  profile_image_url: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

export class LoanNotFoundError extends Error {
  constructor(id: string) {
    super(`Loan ${id} not found`);
    this.name = "LoanNotFoundError";
  }
}

function toBook(row: DbBookRow): Book {
  return {
    id: row.id,
    isbn13: row.isbn13,
    title: row.title,
    authors: row.authors || [],
    description: row.description,
    aiSummary: row.ai_summary,
    genres: row.genres || [],
    coverUrl: row.cover_url,
    totalCopies: row.total_copies,
    availableCopies: row.available_copies,
    createdAt: row.created_at ? new Date(row.created_at) : null,
  };
}

function toLoan(row: DbLoanRow): Loan {
  return {
    id: row.id,
    bookId: row.book_id,
    userId: row.user_id,
    dueDate: new Date(row.due_date),
    checkedOutAt: row.checked_out_at ? new Date(row.checked_out_at) : null,
    returnedAt: row.returned_at ? new Date(row.returned_at) : null,
  };
}

function toHold(row: DbHoldRow): Hold {
  return {
    id: row.id,
    bookId: row.book_id,
    userId: row.user_id,
    status: row.status,
    requestedAt: row.requested_at ? new Date(row.requested_at) : null,
  };
}

export type LoanRequest = {
  id: string;
  bookId: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: Date | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
};

function toLoanRequest(row: DbLoanRequestRow): LoanRequest {
  return {
    id: row.id,
    bookId: row.book_id,
    userId: row.user_id,
    status: row.status,
    requestedAt: row.requested_at ? new Date(row.requested_at) : null,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : null,
    reviewedBy: row.reviewed_by,
  };
}

function toUser(row: DbUserRow): User {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    profileImageUrl: row.profile_image_url,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function buildBookUpdates(updates: Partial<InsertBook>) {
  const fieldMap: Record<string, string> = {
    isbn13: "isbn13",
    title: "title",
    authors: "authors",
    description: "description",
    aiSummary: "ai_summary",
    genres: "genres",
    coverUrl: "cover_url",
    totalCopies: "total_copies",
    availableCopies: "available_copies",
  };

  const keys = Object.keys(updates).filter((key) => fieldMap[key]);
  if (!keys.length) {
    return { setClause: "", values: [] as unknown[] };
  }

  const values = keys.map((key) => (updates as Record<string, unknown>)[key]);
  const setClause = keys
    .map((key, index) => `${fieldMap[key]} = $${index + 1}`)
    .join(", ");

  return { setClause, values };
}

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
  getLoanRequests(userId: string): Promise<(LoanRequest & { book?: Book })[]>;
  getAllLoanRequests(): Promise<(LoanRequest & { book?: Book; userEmail?: string | null; reviewedByEmail?: string | null })[]>;
  createLoanRequest(input: { bookId: string; userId: string }): Promise<LoanRequest>;
  reviewLoanRequest(id: string, reviewerId: string, action: "approved" | "rejected"): Promise<{ request: LoanRequest; loan?: Loan }>;

  getHolds(userId: string): Promise<(Hold & { book?: Book })[]>;
  getAllHolds(): Promise<(Hold & { book?: Book; userEmail?: string | null })[]>;
  createHold(hold: InsertHold): Promise<Hold>;

  getStats(): Promise<{
    totalBooks: number;
    totalLoans: number;
    activeLoans: number;
    totalHolds: number;
    totalUsers: number;
  }>;
  getAllUsers(): Promise<User[]>;
  createUserWithPassword(input: {
    email: string;
    password: string;
    firstName?: string | null;
    lastName?: string | null;
    role?: string;
  }): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  hasAdminUsers(): Promise<boolean>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUserPassword(id: string, currentPassword: string, newPassword: string): Promise<boolean>;
  setUserPasswordAndRole(id: string, password: string, role: string): Promise<User>;
  upsertUser(user: Partial<User> & { email: string }): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getBooks(search?: string): Promise<Book[]> {
    if (!search) {
      const result = await dbQuery<DbBookRow>(
        `
          select *
          from books
          order by created_at desc
        `,
      );
      return result.rows.map(toBook);
    }

    const pattern = `%${search}%`;
    const result = await dbQuery<DbBookRow>(
      `
        select *
        from books
        where title ilike $1
           or array_to_string(authors, ', ') ilike $1
           or coalesce(isbn13, '') ilike $1
        order by created_at desc
      `,
      [pattern],
    );

    return result.rows.map(toBook);
  }

  async getBook(id: string): Promise<Book | undefined> {
    const result = await dbQuery<DbBookRow>(`select * from books where id = $1`, [id]);
    const row = result.rows[0];
    return row ? toBook(row) : undefined;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const id = randomUUID();
    const result = await dbQuery<DbBookRow>(
      `
        insert into books (
          id, isbn13, title, authors, description, ai_summary,
          genres, cover_url, total_copies, available_copies
        )
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        returning *
      `,
      [
        id,
        book.isbn13 || null,
        book.title,
        book.authors,
        book.description || null,
        book.aiSummary || null,
        book.genres || [],
        book.coverUrl || null,
        book.totalCopies,
        book.availableCopies,
      ],
    );

    return toBook(result.rows[0]);
  }

  async updateBook(id: string, updates: Partial<InsertBook>): Promise<Book> {
    const { setClause, values } = buildBookUpdates(updates);

    if (!setClause) {
      const existing = await this.getBook(id);
      if (!existing) {
        throw new Error("Book not found");
      }
      return existing;
    }

    const result = await dbQuery<DbBookRow>(
      `
        update books
        set ${setClause}
        where id = $${values.length + 1}
        returning *
      `,
      [...values, id],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("Book not found");
    }

    return toBook(row);
  }

  async deleteBook(id: string): Promise<void> {
    await dbQuery(`delete from books where id = $1`, [id]);
  }

  async getLoans(userId: string): Promise<(Loan & { book?: Book })[]> {
    const result = await dbQuery<DbLoanRow & Record<string, unknown>>(
      `
        select
          l.*,
          b.id as b_id,
          b.isbn13 as b_isbn13,
          b.title as b_title,
          b.authors as b_authors,
          b.description as b_description,
          b.ai_summary as b_ai_summary,
          b.genres as b_genres,
          b.cover_url as b_cover_url,
          b.total_copies as b_total_copies,
          b.available_copies as b_available_copies,
          b.created_at as b_created_at
        from loans l
        left join books b on b.id = l.book_id
        where l.user_id = $1
        order by l.checked_out_at desc
      `,
      [userId],
    );

    return result.rows.map((row) => {
      const loan = toLoan(row as DbLoanRow);
      const book = row.b_id
        ? toBook({
            id: String(row.b_id),
            isbn13: (row.b_isbn13 as string | null) ?? null,
            title: String(row.b_title),
            authors: (row.b_authors as string[]) || [],
            description: (row.b_description as string | null) ?? null,
            ai_summary: (row.b_ai_summary as string | null) ?? null,
            genres: (row.b_genres as string[]) || [],
            cover_url: (row.b_cover_url as string | null) ?? null,
            total_copies: Number(row.b_total_copies),
            available_copies: Number(row.b_available_copies),
            created_at: row.b_created_at as string | Date,
          })
        : undefined;

      return { ...loan, book };
    });
  }

  async getAllLoans(): Promise<(Loan & { book?: Book; userEmail?: string | null })[]> {
    const result = await dbQuery<DbLoanRow & Record<string, unknown>>(
      `
        select
          l.*,
          b.id as b_id,
          b.isbn13 as b_isbn13,
          b.title as b_title,
          b.authors as b_authors,
          b.description as b_description,
          b.ai_summary as b_ai_summary,
          b.genres as b_genres,
          b.cover_url as b_cover_url,
          b.total_copies as b_total_copies,
          b.available_copies as b_available_copies,
          b.created_at as b_created_at,
          u.email as u_email
        from loans l
        left join books b on b.id = l.book_id
        left join users u on u.id = l.user_id
        order by l.checked_out_at desc
      `,
    );

    return result.rows.map((row) => {
      const loan = toLoan(row as DbLoanRow);
      const book = row.b_id
        ? toBook({
            id: String(row.b_id),
            isbn13: (row.b_isbn13 as string | null) ?? null,
            title: String(row.b_title),
            authors: (row.b_authors as string[]) || [],
            description: (row.b_description as string | null) ?? null,
            ai_summary: (row.b_ai_summary as string | null) ?? null,
            genres: (row.b_genres as string[]) || [],
            cover_url: (row.b_cover_url as string | null) ?? null,
            total_copies: Number(row.b_total_copies),
            available_copies: Number(row.b_available_copies),
            created_at: row.b_created_at as string | Date,
          })
        : undefined;

      return {
        ...loan,
        book,
        userEmail: (row.u_email as string | null) ?? null,
      };
    });
  }

  async createLoan(loan: InsertLoan): Promise<Loan> {
    const id = randomUUID();
    const result = await dbQuery<DbLoanRow>(
      `
        insert into loans (id, book_id, user_id, due_date)
        values ($1, $2, $3, $4)
        returning *
      `,
      [id, loan.bookId, loan.userId, loan.dueDate],
    );
    return toLoan(result.rows[0]);
  }

  async returnLoan(id: string): Promise<Loan> {
    const result = await dbQuery<DbLoanRow>(
      `
        update loans
        set returned_at = now()
        where id = $1
        returning *
      `,
      [id],
    );

    const row = result.rows[0];
    if (!row) {
      throw new LoanNotFoundError(id);
    }

    return toLoan(row);
  }

  async getLoanRequests(userId: string): Promise<(LoanRequest & { book?: Book })[]> {
    const result = await dbQuery<DbLoanRequestRow & Record<string, unknown>>(
      `
        select
          lr.*,
          b.id as b_id,
          b.isbn13 as b_isbn13,
          b.title as b_title,
          b.authors as b_authors,
          b.description as b_description,
          b.ai_summary as b_ai_summary,
          b.genres as b_genres,
          b.cover_url as b_cover_url,
          b.total_copies as b_total_copies,
          b.available_copies as b_available_copies,
          b.created_at as b_created_at
        from loan_requests lr
        left join books b on b.id = lr.book_id
        where lr.user_id = $1
        order by lr.requested_at desc
      `,
      [userId],
    );

    return result.rows.map((row) => {
      const request = toLoanRequest(row as DbLoanRequestRow);
      const book = row.b_id
        ? toBook({
            id: String(row.b_id),
            isbn13: (row.b_isbn13 as string | null) ?? null,
            title: String(row.b_title),
            authors: (row.b_authors as string[]) || [],
            description: (row.b_description as string | null) ?? null,
            ai_summary: (row.b_ai_summary as string | null) ?? null,
            genres: (row.b_genres as string[]) || [],
            cover_url: (row.b_cover_url as string | null) ?? null,
            total_copies: Number(row.b_total_copies),
            available_copies: Number(row.b_available_copies),
            created_at: row.b_created_at as string | Date,
          })
        : undefined;

      return { ...request, book };
    });
  }

  async getAllLoanRequests(): Promise<(LoanRequest & { book?: Book; userEmail?: string | null; reviewedByEmail?: string | null })[]> {
    const result = await dbQuery<DbLoanRequestRow & Record<string, unknown>>(
      `
        select
          lr.*,
          b.id as b_id,
          b.isbn13 as b_isbn13,
          b.title as b_title,
          b.authors as b_authors,
          b.description as b_description,
          b.ai_summary as b_ai_summary,
          b.genres as b_genres,
          b.cover_url as b_cover_url,
          b.total_copies as b_total_copies,
          b.available_copies as b_available_copies,
          b.created_at as b_created_at,
          u.email as u_email,
          reviewer.email as reviewer_email
        from loan_requests lr
        left join books b on b.id = lr.book_id
        left join users u on u.id = lr.user_id
        left join users reviewer on reviewer.id = lr.reviewed_by
        order by lr.requested_at desc
      `,
    );

    return result.rows.map((row) => {
      const request = toLoanRequest(row as DbLoanRequestRow);
      const book = row.b_id
        ? toBook({
            id: String(row.b_id),
            isbn13: (row.b_isbn13 as string | null) ?? null,
            title: String(row.b_title),
            authors: (row.b_authors as string[]) || [],
            description: (row.b_description as string | null) ?? null,
            ai_summary: (row.b_ai_summary as string | null) ?? null,
            genres: (row.b_genres as string[]) || [],
            cover_url: (row.b_cover_url as string | null) ?? null,
            total_copies: Number(row.b_total_copies),
            available_copies: Number(row.b_available_copies),
            created_at: row.b_created_at as string | Date,
          })
        : undefined;

      return {
        ...request,
        book,
        userEmail: (row.u_email as string | null) ?? null,
        reviewedByEmail: (row.reviewer_email as string | null) ?? null,
      };
    });
  }

  async createLoanRequest(input: { bookId: string; userId: string }): Promise<LoanRequest> {
    const existingPending = await dbQuery<DbLoanRequestRow>(
      `
        select *
        from loan_requests
        where book_id = $1 and user_id = $2 and status = 'pending'
        limit 1
      `,
      [input.bookId, input.userId],
    );

    if (existingPending.rows[0]) {
      return toLoanRequest(existingPending.rows[0]);
    }

    const hasActiveLoan = await dbQuery<{ count: string }>(
      `
        select count(*)::text as count
        from loans
        where book_id = $1 and user_id = $2 and returned_at is null
      `,
      [input.bookId, input.userId],
    );

    if (Number(hasActiveLoan.rows[0]?.count || 0) > 0) {
      throw new Error("You already have this book on loan");
    }

    const result = await dbQuery<DbLoanRequestRow>(
      `
        insert into loan_requests (id, book_id, user_id, status)
        values ($1, $2, $3, 'pending')
        returning *
      `,
      [randomUUID(), input.bookId, input.userId],
    );

    return toLoanRequest(result.rows[0]);
  }

  async reviewLoanRequest(id: string, reviewerId: string, action: "approved" | "rejected"): Promise<{ request: LoanRequest; loan?: Loan }> {
    const client = await getDB().connect();
    try {
      await client.query("begin");

      const pendingRequestResult = await client.query<DbLoanRequestRow>(
        `
          select *
          from loan_requests
          where id = $1 and status = 'pending'
          for update
        `,
        [id],
      );

      const pendingRequest = pendingRequestResult.rows[0];
      if (!pendingRequest) {
        throw new Error("Loan request not found or already reviewed");
      }

      const reviewedResult = await client.query<DbLoanRequestRow>(
        `
          update loan_requests
          set status = $1, reviewed_at = now(), reviewed_by = $2
          where id = $3
          returning *
        `,
        [action, reviewerId, id],
      );

      const reviewedRequest = reviewedResult.rows[0];
      let approvedLoan: Loan | undefined;

      if (action === "approved") {
        const bookResult = await client.query<{ id: string; available_copies: number }>(
          `
            select id, available_copies
            from books
            where id = $1
            for update
          `,
          [reviewedRequest.book_id],
        );

        const book = bookResult.rows[0];
        if (!book || book.available_copies <= 0) {
          throw new Error("No available copies left for approval");
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        const loanResult = await client.query<DbLoanRow>(
          `
            insert into loans (id, book_id, user_id, due_date)
            values ($1, $2, $3, $4)
            returning *
          `,
          [randomUUID(), reviewedRequest.book_id, reviewedRequest.user_id, dueDate],
        );

        await client.query(
          `
            update books
            set available_copies = available_copies - 1
            where id = $1
          `,
          [reviewedRequest.book_id],
        );

        approvedLoan = toLoan(loanResult.rows[0]);
      }

      await client.query("commit");
      return { request: toLoanRequest(reviewedRequest), loan: approvedLoan };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async getHolds(userId: string): Promise<(Hold & { book?: Book })[]> {
    const result = await dbQuery<DbHoldRow & Record<string, unknown>>(
      `
        select
          h.*,
          b.id as b_id,
          b.isbn13 as b_isbn13,
          b.title as b_title,
          b.authors as b_authors,
          b.description as b_description,
          b.ai_summary as b_ai_summary,
          b.genres as b_genres,
          b.cover_url as b_cover_url,
          b.total_copies as b_total_copies,
          b.available_copies as b_available_copies,
          b.created_at as b_created_at
        from holds h
        left join books b on b.id = h.book_id
        where h.user_id = $1
        order by h.requested_at desc
      `,
      [userId],
    );

    return result.rows.map((row) => {
      const hold = toHold(row as DbHoldRow);
      const book = row.b_id
        ? toBook({
            id: String(row.b_id),
            isbn13: (row.b_isbn13 as string | null) ?? null,
            title: String(row.b_title),
            authors: (row.b_authors as string[]) || [],
            description: (row.b_description as string | null) ?? null,
            ai_summary: (row.b_ai_summary as string | null) ?? null,
            genres: (row.b_genres as string[]) || [],
            cover_url: (row.b_cover_url as string | null) ?? null,
            total_copies: Number(row.b_total_copies),
            available_copies: Number(row.b_available_copies),
            created_at: row.b_created_at as string | Date,
          })
        : undefined;

      return { ...hold, book };
    });
  }

  async getAllHolds(): Promise<(Hold & { book?: Book; userEmail?: string | null })[]> {
    const result = await dbQuery<DbHoldRow & Record<string, unknown>>(
      `
        select
          h.*,
          b.id as b_id,
          b.isbn13 as b_isbn13,
          b.title as b_title,
          b.authors as b_authors,
          b.description as b_description,
          b.ai_summary as b_ai_summary,
          b.genres as b_genres,
          b.cover_url as b_cover_url,
          b.total_copies as b_total_copies,
          b.available_copies as b_available_copies,
          b.created_at as b_created_at,
          u.email as u_email
        from holds h
        left join books b on b.id = h.book_id
        left join users u on u.id = h.user_id
        order by h.requested_at desc
      `,
    );

    return result.rows.map((row) => {
      const hold = toHold(row as DbHoldRow);
      const book = row.b_id
        ? toBook({
            id: String(row.b_id),
            isbn13: (row.b_isbn13 as string | null) ?? null,
            title: String(row.b_title),
            authors: (row.b_authors as string[]) || [],
            description: (row.b_description as string | null) ?? null,
            ai_summary: (row.b_ai_summary as string | null) ?? null,
            genres: (row.b_genres as string[]) || [],
            cover_url: (row.b_cover_url as string | null) ?? null,
            total_copies: Number(row.b_total_copies),
            available_copies: Number(row.b_available_copies),
            created_at: row.b_created_at as string | Date,
          })
        : undefined;

      return {
        ...hold,
        book,
        userEmail: (row.u_email as string | null) ?? null,
      };
    });
  }

  async createHold(hold: InsertHold): Promise<Hold> {
    const id = randomUUID();
    const result = await dbQuery<DbHoldRow>(
      `
        insert into holds (id, book_id, user_id, status)
        values ($1, $2, $3, $4)
        returning *
      `,
      [id, hold.bookId, hold.userId, hold.status],
    );
    return toHold(result.rows[0]);
  }

  async getStats() {
    const result = await dbQuery<{
      total_books: string;
      total_loans: string;
      active_loans: string;
      total_holds: string;
      total_users: string;
    }>(
      `
        select
          (select count(*) from books) as total_books,
          (select count(*) from loans) as total_loans,
          (select count(*) from loans where returned_at is null) as active_loans,
          (select count(*) from holds) as total_holds,
          (select count(*) from users) as total_users
      `,
    );

    const row = result.rows[0];
    return {
      totalBooks: Number(row.total_books || 0),
      totalLoans: Number(row.total_loans || 0),
      activeLoans: Number(row.active_loans || 0),
      totalHolds: Number(row.total_holds || 0),
      totalUsers: Number(row.total_users || 0),
    };
  }

  async getAllUsers(): Promise<User[]> {
    const result = await dbQuery<DbUserRow>(
      `
        select *
        from users
        order by created_at desc
      `,
    );
    return result.rows.map(toUser);
  }

  async createUserWithPassword(input: {
    email: string;
    password: string;
    firstName?: string | null;
    lastName?: string | null;
    role?: string;
  }): Promise<User> {
    const now = new Date();
    const result = await dbQuery<DbUserRow>(
      `
        insert into users (
          id, email, password, first_name, last_name, role, profile_image_url, created_at, updated_at
        )
        values ($1, $2, $3, $4, $5, $6, null, $7, $8)
        returning *
      `,
      [
        randomUUID(),
        input.email,
        input.password,
        input.firstName || null,
        input.lastName || null,
        input.role || "patron",
        now,
        now,
      ],
    );

    return toUser(result.rows[0]);
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const result = await dbQuery<DbUserRow>(
      `
        select *
        from users
        where lower(email) = lower($1)
          and password = $2
        limit 1
      `,
      [email, password],
    );

    const row = result.rows[0];
    return row ? toUser(row) : null;
  }

  async hasAdminUsers(): Promise<boolean> {
    const result = await dbQuery<{ count: string }>(
      `
        select count(*)::text as count
        from users
        where role = 'admin'
      `,
    );

    return Number(result.rows[0]?.count || 0) > 0;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await dbQuery<DbUserRow>(
      `
        select *
        from users
        where lower(email) = lower($1)
        limit 1
      `,
      [email],
    );

    const row = result.rows[0];
    return row ? toUser(row) : null;
  }

  async updateUserPassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const result = await dbQuery<DbUserRow>(
      `
        update users
        set password = $1, updated_at = now()
        where id = $2 and password = $3
        returning *
      `,
      [newPassword, id, currentPassword],
    );

    return Boolean(result.rows[0]);
  }

  async setUserPasswordAndRole(id: string, password: string, role: string): Promise<User> {
    const result = await dbQuery<DbUserRow>(
      `
        update users
        set password = $1, role = $2, updated_at = now()
        where id = $3
        returning *
      `,
      [password, role, id],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("User not found");
    }

    return toUser(row);
  }

  async upsertUser(user: Partial<User> & { email: string }): Promise<User> {
    const now = new Date();
    const result = await dbQuery<DbUserRow>(
      `
        insert into users (
          id, email, password, first_name, last_name, role, profile_image_url, created_at, updated_at
        )
        values ($1, $2, null, $3, $4, $5, $6, $7, $8)
        on conflict (email)
        do update set
          first_name = coalesce(users.first_name, excluded.first_name),
          last_name = coalesce(users.last_name, excluded.last_name),
          updated_at = excluded.updated_at
        returning *
      `,
      [
        user.id || randomUUID(),
        user.email,
        user.firstName || null,
        user.lastName || null,
        user.role || "patron",
        user.profileImageUrl || null,
        now,
        now,
      ],
    );

    return toUser(result.rows[0]);
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const result = await dbQuery<DbUserRow>(
      `
        update users
        set role = $1, updated_at = now()
        where id = $2
        returning *
      `,
      [role, id],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("User not found");
    }

    return toUser(row);
  }
}

export const storage = new DatabaseStorage();
