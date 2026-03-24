// Author: devrajsinh2012 <djgohil2012@gmail.com>
// Plain TypeScript types — no ORM dependency.
// MongoDB documents are stored with _id; storage.ts maps _id → id before returning.

export type User = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;                // patron | librarian | admin
  profileImageUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type UpsertUser = Partial<User> & { email: string };
