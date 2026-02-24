# Nexus Library

> A modern, full-stack library management system powered by AI and built for the modern reader.

---

## Overview

**Nexus Library** is a production-ready library management web application that lets users browse a curated book catalog, borrow books, place holds, and get AI-generated summaries for any title — all inside a sleek, premium-feeling UI with earthy serif typography and smooth animations.

---

## Features

| Feature | Description |
|---|---|
| 📚 **Book Catalog** | Browse, search, and filter the full book collection |
| 🤖 **AI Book Summaries** | GPT-powered summaries: what it's about, key themes, who should read it |
| 🔖 **Loan Management** | Check out books with automatic 14-day due dates |
| ⏳ **Hold Queue** | Place holds on unavailable books; track hold status |
| 👤 **User Dashboard** | View active loans, holds, and account activity |
| 🔐 **Session Auth** | Secure email-based session authentication |
| 🌙 **Dark/Light Mode** | Full theme support via next-themes |
| 📱 **Responsive Design** | Mobile-first layout with fluid breakpoints |

---

## Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** — blazing fast dev server & bundler
- **Tailwind CSS v3** + **shadcn/ui** (Radix UI primitives)
- **Framer Motion** — page transitions and scroll animations
- **TanStack Query** — server state management & caching
- **Wouter** — lightweight client-side routing
- **React Hook Form** + **Zod** — type-safe form validation

### Backend
- **Node.js** + **Express 5**
- **TypeScript** (ESM modules via `tsx`)
- **Drizzle ORM** — type-safe SQL query builder
- **PostgreSQL** — primary database
- **connect-pg-simple** — PostgreSQL-backed session store
- **OpenAI SDK** — GPT-powered AI book summaries

### Database Schema
```
books       — id, title, authors[], description, aiSummary, genres[], coverUrl, totalCopies, availableCopies
loans       — id, bookId, userId, checkedOutAt, dueDate, returnedAt
holds       — id, bookId, userId, requestedAt, status
users       — id, email, firstName, lastName, profileImageUrl
sessions    — sid, sess, expire
```

---

## Project Structure

```
Nexus-Library/
├── client/                   # React frontend
│   └── src/
│       ├── pages/            # Landing, Catalog, BookDetail, Dashboard
│       ├── components/       # BookCard, Navbar, UI primitives (shadcn)
│       ├── hooks/            # use-auth, use-books, use-loans, use-holds
│       └── lib/              # queryClient, utils, auth-utils
├── server/                   # Express backend
│   ├── index.ts              # App entry point
│   ├── routes.ts             # All API route handlers
│   ├── auth.ts               # Session auth (setup, routes, middleware)
│   ├── storage.ts            # DB layer (CRUD operations)
│   ├── db.ts                 # Drizzle + pg pool connection
│   └── vite.ts               # Dev-mode Vite integration
├── shared/                   # Shared types & schema
│   ├── schema.ts             # Drizzle table definitions + Zod schemas
│   ├── routes.ts             # Typed API route map
│   └── models/auth.ts        # Auth-specific tables (users, sessions)
├── script/build.ts           # Production build script
├── drizzle.config.ts         # Drizzle Kit config
├── vite.config.ts            # Vite config
└── tailwind.config.ts        # Tailwind config
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 20
- PostgreSQL database
- OpenAI API key (optional — for AI summaries)

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
The app runs at `http://localhost:5000` (both API and client served from the same port).

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

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/auth/user` | — | Get current session user |
| `POST` | `/api/login` | — | Login with email |
| `GET` | `/api/logout` | — | Destroy session & redirect |
| `GET` | `/api/books` | — | List / search books |
| `GET` | `/api/books/:id` | — | Get book by ID |
| `POST` | `/api/books` | — | Create a new book |
| `POST` | `/api/books/:id/ai-summary` | — | Generate / retrieve AI summary |
| `GET` | `/api/loans` | ✅ | List user's active loans |
| `POST` | `/api/loans` | ✅ | Check out a book |
| `POST` | `/api/loans/:id/return` | ✅ | Return a book |
| `GET` | `/api/holds` | ✅ | List user's holds |
| `POST` | `/api/holds` | ✅ | Place a hold |

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero section with call-to-action |
| `/catalog` | Catalog | Searchable book grid |
| `/books/:id` | Book Detail | Full book info + AI summary |
| `/dashboard` | Dashboard | User loans, holds, and activity |

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/devrajsinh2012">devrajsinh2012</a>
</div>
