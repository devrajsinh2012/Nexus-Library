# Nexus Library

> A modern, full-stack library management system — rebuilt with 3D book UI, AI-powered summaries, and a complete librarian admin panel.

---

## Overview

**Nexus Library** is a production-ready library management web application that lets patrons browse a curated book catalog, borrow books, place holds, and read AI-generated analyses — all inside a premium UI featuring CSS 3D book rendering, Playfair Display serif typography, and fluid Framer Motion animations.

Librarians and admins get a dedicated panel to manage the entire collection, monitor loans and holds in real-time, and control user roles.

---

## Features

| Feature | Description |
|---|---|
| 📚 **3D Book Catalog** | Every book card renders as a real 3D book with spine, pages, and hover tilt |
| 🤖 **AI Summaries** | GPT-4o-mini summaries: what it's about, key themes, who should read it |
| 🔖 **Loan Management** | Check out books with automatic 14-day due dates |
| ⏳ **Hold Queue** | Place holds on unavailable books; track hold status |
| 👤 **User Dashboard** | View active loans, holds, due dates, and reading history |
| 🛡️ **Admin Panel** | Full librarian dashboard — manage books, loans, holds, and users |
| 🔐 **Role-Based Auth** | Patron / Librarian / Admin roles with session-backed authentication |
| 🌙 **Dark / Light Mode** | Full theme support |
| 📱 **Responsive Design** | Mobile-first layout with fluid breakpoints |

---

## Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite 7** — fast dev server & bundler
- **Tailwind CSS v3** + **shadcn/ui** (Radix UI primitives)
- **Framer Motion** — page transitions, scroll animations, and 3D book float
- **TanStack Query** — server state caching and mutation handling
- **Wouter** — lightweight client-side routing
- **React Hook Form** + **Zod** — type-safe form validation
- **Google Fonts** — Playfair Display (serif), Inter (sans), JetBrains Mono (mono)

### Backend
- **Node.js 20** + **Express 5**
- **TypeScript** (ESM modules via `tsx`)
- **Drizzle ORM** — type-safe query builder
- **PostgreSQL** — primary database
- **connect-pg-simple** — PostgreSQL-backed session store
- **OpenAI SDK** — `gpt-4o-mini` for AI book summaries

### Database Schema
```
books    — id, isbn13, title, authors[], description, aiSummary, genres[], coverUrl, totalCopies, availableCopies
loans    — id, bookId, userId, checkedOutAt, dueDate, returnedAt
holds    — id, bookId, userId, requestedAt, status (waiting|ready|fulfilled|cancelled)
users    — id, email, firstName, lastName, role (patron|librarian|admin), profileImageUrl
sessions — sid, sess, expire
```

---

## Project Structure

```
Nexus-Library/
├── client/                     # React frontend
│   └── src/
│       ├── pages/              # Landing, Catalog, BookDetail, Dashboard, Admin
│       ├── components/
│       │   ├── layout/         # Navbar, AppLayout (footer)
│       │   └── ui/             # 47 shadcn/ui components
│       ├── hooks/              # use-auth, use-books, use-loans, use-holds, use-admin
│       ├── lib/                # queryClient, utils
│       └── index.css           # 3D book CSS system + design tokens
├── server/                     # Express backend
│   ├── index.ts                # App entry point
│   ├── routes.ts               # All API route handlers (patron + admin)
│   ├── auth.ts                 # Session auth (setup, routes, isAuthenticated, isAdmin)
│   ├── storage.ts              # DB abstraction layer (CRUD + admin queries with JOINs)
│   ├── db.ts                   # Drizzle + pg pool connection
│   └── vite.ts                 # Dev-mode Vite integration
├── shared/                     # Shared types & schema
│   ├── schema.ts               # Drizzle table definitions + Zod schemas
│   ├── routes.ts               # Typed API route map
│   └── models/auth.ts          # Users & sessions tables (with role field)
├── script/build.ts             # Production build script (Vite + esbuild)
├── drizzle.config.ts
├── vite.config.ts
└── tailwind.config.ts
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 20
- PostgreSQL database
- OpenAI API key (optional — required for AI summaries)

### 1. Clone the repo
```bash
git clone https://github.com/devrajsinh2012/Nexus-Library.git
cd Nexus-Library
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Create a `.env` file in the root:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/nexus_library
SESSION_SECRET=your-super-secret-session-key
OPENAI_API_KEY=sk-...          # optional, for AI summaries
NODE_ENV=development
```

### 4. Push schema to database
```bash
npm run db:push
```

### 5. Start development server
```bash
npm run dev
```
The app runs at `http://localhost:5000` — both API and client served from the same port.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server (Express + Vite HMR) |
| `npm run build` | Build for production (`dist/`) |
| `npm start` | Run production build |
| `npm run check` | TypeScript type-check |
| `npm run db:push` | Push Drizzle schema changes to the database |

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/auth/user` | — | Get current session user (with role) |
| `POST` | `/api/login` | — | Login / register with email |
| `GET` | `/api/logout` | — | Destroy session |

### Books
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/books` | — | List / search books |
| `GET` | `/api/books/:id` | — | Get book by ID |
| `POST` | `/api/books` | ✅ | Create a new book |
| `POST` | `/api/books/:id/ai-summary` | — | Generate / retrieve AI summary |

### Loans & Holds
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/loans` | ✅ | List user's active loans (with book data) |
| `POST` | `/api/loans` | ✅ | Check out a book |
| `POST` | `/api/loans/:id/return` | ✅ | Return a book |
| `GET` | `/api/holds` | ✅ | List user's holds (with book data) |
| `POST` | `/api/holds` | ✅ | Place a hold |

### Admin (Librarian / Admin role only)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Dashboard totals (books, loans, holds, users) |
| `GET` | `/api/admin/books` | All books |
| `PUT` | `/api/admin/books/:id` | Update a book |
| `DELETE` | `/api/admin/books/:id` | Delete a book |
| `GET` | `/api/admin/loans` | All loans with book + patron info |
| `POST` | `/api/admin/loans/:id/return` | Staff-initiated loan return |
| `GET` | `/api/admin/holds` | All holds with book + patron info |
| `GET` | `/api/admin/users` | All users |
| `PATCH` | `/api/admin/users/:id/role` | Update user role |

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero with 3D floating books, features, CTA |
| `/catalog` | Catalog | Searchable 3D book grid |
| `/book/:id` | Book Detail | 3D cover, AI summary, checkout / hold actions |
| `/dashboard` | Dashboard | Patron loans, holds, and due date tracking |
| `/admin` | Admin Panel | Librarian dashboard — books, loans, holds, users |

---

## 3D Book System

The 3D book effect is implemented in pure CSS using `transform-style: preserve-3d` and `perspective`. Every book has three visible faces:

- **Cover** (front face) — the book cover image with an inset spine shadow
- **Spine** (left face) — color-coded per book, reveals on hover rotation
- **Pages** (right + bottom faces) — layered paper texture

The hero on the landing page features three books with a continuous `book-float` keyframe animation.

---

## User Roles

| Role | Access |
|---|---|
| `patron` | Browse catalog, borrow books, place holds, view personal dashboard |
| `librarian` | All patron access + full admin panel |
| `admin` | All librarian access + can manage user roles |

To promote a user to librarian, log in as an admin and change the role via the Admin → Users tab.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/devrajsinh2012">devrajsinh2012</a>
</div>
