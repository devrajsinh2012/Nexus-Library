import * as dotenv from "dotenv";
import { dbQuery, ensureSchema } from "../server/db";

dotenv.config({ path: ".env.local" });

type SeedUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "patron" | "librarian" | "admin";
};

type SeedBookInput = {
  id: string;
  isbn13: string;
  title: string;
  authors: string[];
  description: string;
  genres: string[];
  coverUrl: string;
  totalCopies: number;
  availableCopies: number;
};

const users: SeedUserInput[] = [
  {
    email: "admin@nexus.local",
    password: "Admin@123",
    firstName: "Aarav",
    lastName: "Shah",
    role: "admin",
  },
  {
    email: "librarian@nexus.local",
    password: "Librarian@123",
    firstName: "Meera",
    lastName: "Patel",
    role: "librarian",
  },
  {
    email: "patron@nexus.local",
    password: "Patron@123",
    firstName: "Dev",
    lastName: "Reader",
    role: "patron",
  },
];

const books: SeedBookInput[] = [
  {
    id: "book-gatsby",
    isbn13: "9780743273565",
    title: "The Great Gatsby",
    authors: ["F. Scott Fitzgerald"],
    description: "A haunting portrait of ambition, class, and illusion in Jazz Age America.",
    genres: ["Fiction", "Classic"],
    coverUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
    totalCopies: 6,
    availableCopies: 4,
  },
  {
    id: "book-1984",
    isbn13: "9780451524935",
    title: "1984",
    authors: ["George Orwell"],
    description: "A dystopian warning about surveillance, power, and manufactured truth.",
    genres: ["Fiction", "Sci-Fi", "Classic"],
    coverUrl:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800",
    totalCopies: 5,
    availableCopies: 1,
  },
  {
    id: "book-mockingbird",
    isbn13: "9780061120084",
    title: "To Kill a Mockingbird",
    authors: ["Harper Lee"],
    description: "A coming-of-age story confronting justice and prejudice in the American South.",
    genres: ["Fiction", "Classic"],
    coverUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
    totalCopies: 7,
    availableCopies: 3,
  },
  {
    id: "book-atomic-habits",
    isbn13: "9780735211292",
    title: "Atomic Habits",
    authors: ["James Clear"],
    description: "A practical framework for building systems that compound small improvements.",
    genres: ["Productivity", "Self-Help"],
    coverUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=700",
    totalCopies: 4,
    availableCopies: 2,
  },
  {
    id: "book-sapiens",
    isbn13: "9780062316097",
    title: "Sapiens",
    authors: ["Yuval Noah Harari"],
    description: "A sweeping narrative on human evolution, culture, and shared myths.",
    genres: ["History", "Non-Fiction"],
    coverUrl:
      "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&q=80&w=800",
    totalCopies: 5,
    availableCopies: 2,
  },
];

async function upsertUsers() {
  const idByEmail = new Map<string, string>();

  for (const user of users) {
    const result = await dbQuery<{ id: string }>(
      `
        insert into users (id, email, password, first_name, last_name, role, created_at, updated_at)
        values (gen_random_uuid()::text, $1, $2, $3, $4, $5, now(), now())
        on conflict (email)
        do update set
          password = excluded.password,
          first_name = excluded.first_name,
          last_name = excluded.last_name,
          role = excluded.role,
          updated_at = now()
        returning id
      `,
      [user.email, user.password, user.firstName, user.lastName, user.role],
    );

    idByEmail.set(user.email, result.rows[0].id);
  }

  return idByEmail;
}

async function upsertBooks() {
  for (const book of books) {
    await dbQuery(
      `
        insert into books (
          id, isbn13, title, authors, description, genres,
          cover_url, total_copies, available_copies, created_at
        )
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
        on conflict (id)
        do update set
          isbn13 = excluded.isbn13,
          title = excluded.title,
          authors = excluded.authors,
          description = excluded.description,
          genres = excluded.genres,
          cover_url = excluded.cover_url,
          total_copies = excluded.total_copies,
          available_copies = excluded.available_copies
      `,
      [
        book.id,
        book.isbn13,
        book.title,
        book.authors,
        book.description,
        book.genres,
        book.coverUrl,
        book.totalCopies,
        book.availableCopies,
      ],
    );
  }
}

async function seedLoansAndHolds(userIds: Map<string, string>) {
  const patronId = userIds.get("patron@nexus.local");
  const librarianId = userIds.get("librarian@nexus.local");

  if (!patronId || !librarianId) {
    throw new Error("Missing seeded users required for loans/holds.");
  }

  await dbQuery(
    `
      insert into loans (id, book_id, user_id, due_date, checked_out_at, returned_at)
      values
        ('loan-active-1', 'book-1984', $1, now() + interval '7 days', now() - interval '2 days', null),
        ('loan-returned-1', 'book-gatsby', $1, now() - interval '20 days', now() - interval '35 days', now() - interval '18 days'),
        ('loan-active-2', 'book-sapiens', $2, now() + interval '10 days', now() - interval '4 days', null)
      on conflict (id)
      do update set
        book_id = excluded.book_id,
        user_id = excluded.user_id,
        due_date = excluded.due_date,
        checked_out_at = excluded.checked_out_at,
        returned_at = excluded.returned_at
    `,
    [patronId, librarianId],
  );

  await dbQuery(
    `
      insert into holds (id, book_id, user_id, status, requested_at)
      values
        ('hold-waiting-1', 'book-mockingbird', $1, 'waiting', now() - interval '1 day'),
        ('hold-ready-1', 'book-atomic-habits', $1, 'ready', now() - interval '2 days')
      on conflict (id)
      do update set
        book_id = excluded.book_id,
        user_id = excluded.user_id,
        status = excluded.status,
        requested_at = excluded.requested_at
    `,
    [patronId],
  );
}

async function printSummary() {
  const counts = await dbQuery<{
    books_count: string;
    users_count: string;
    loans_count: string;
    holds_count: string;
  }>(`
    select
      (select count(*)::text from books) as books_count,
      (select count(*)::text from users) as users_count,
      (select count(*)::text from loans) as loans_count,
      (select count(*)::text from holds) as holds_count
  `);

  const row = counts.rows[0];
  console.log(
    `Seed complete. books=${row.books_count}, users=${row.users_count}, loans=${row.loans_count}, holds=${row.holds_count}`,
  );
  console.log("Demo credentials:");
  console.log("admin@nexus.local / Admin@123");
  console.log("librarian@nexus.local / Librarian@123");
  console.log("patron@nexus.local / Patron@123");
}

async function main() {
  await ensureSchema();
  const userIds = await upsertUsers();
  await upsertBooks();
  await seedLoansAndHolds(userIds);
  await printSummary();
}

main()
  .catch((error) => {
    console.error("Supabase seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
