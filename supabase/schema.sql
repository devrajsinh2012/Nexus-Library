create extension if not exists pgcrypto;

create table if not exists books (
  id text primary key,
  isbn13 text,
  title text not null,
  authors text[] not null default '{}',
  description text,
  ai_summary text,
  genres text[] not null default '{}',
  cover_url text,
  total_copies integer not null check (total_copies >= 1),
  available_copies integer not null check (available_copies >= 0),
  created_at timestamptz not null default now()
);

create table if not exists users (
  id text primary key,
  email text not null unique,
  password text,
  first_name text,
  last_name text,
  role text not null default 'patron' check (role in ('patron', 'librarian', 'admin')),
  profile_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists loans (
  id text primary key,
  book_id text not null references books(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  due_date timestamptz not null,
  checked_out_at timestamptz not null default now(),
  returned_at timestamptz
);

create table if not exists holds (
  id text primary key,
  book_id text not null references books(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting', 'ready', 'fulfilled', 'cancelled')),
  requested_at timestamptz not null default now()
);

create table if not exists loan_requests (
  id text primary key,
  book_id text not null references books(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text references users(id) on delete set null
);

create index if not exists idx_books_title on books(title);
create index if not exists idx_books_authors_gin on books using gin(authors);
create index if not exists idx_loans_user_id on loans(user_id);
create index if not exists idx_loans_book_id on loans(book_id);
create index if not exists idx_holds_user_id on holds(user_id);
create index if not exists idx_holds_book_id on holds(book_id);
create index if not exists idx_loan_requests_user_id on loan_requests(user_id);
create index if not exists idx_loan_requests_book_id on loan_requests(book_id);
create index if not exists idx_loan_requests_status on loan_requests(status);
create index if not exists idx_users_email on users(email);
