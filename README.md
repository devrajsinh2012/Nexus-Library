# Nexus Library

A modern full-stack library management system built with Next.js App Router, PostgreSQL, role-based auth, and AI-powered book summaries.

## Overview

Nexus Library supports:

- Patron workflows for browsing, borrowing, placing holds, and submitting loan requests.
- Librarian and admin workflows for managing books, users, loans, holds, and reviewing loan requests.
- AI summaries generated on demand and persisted to the book record.
- Signed URL upload flow for object storage.

## Core Features

- Catalog browsing and search
- Book detail pages with AI summary generation
- Loan checkout and return flow
- Hold placement and status tracking
- Loan request submission and admin review
- Role-based access (patron, librarian, admin)
- First-admin setup flow
- Session-cookie authentication
- Password change endpoint for authenticated users
- Admin dashboard endpoints (stats, books, users, loans, holds, loan requests)

## Tech Stack

- Next.js 15 App Router
- React 18 and TypeScript
- Tailwind CSS and shadcn/ui
- TanStack Query
- PostgreSQL (Supabase-hosted or any compatible Postgres)
- Groq SDK (Llama 3.3 model) for AI summaries
- Google Cloud Storage signed upload URLs

## Project Structure

- app: Next.js pages and API route handlers
- client/src: client pages, hooks, components, and UI primitives
- server: database, session, and route utility layer
- shared: shared schema and route contracts
- script: database init and seed scripts
- supabase: SQL schema snapshot

## Environment Variables

Create a .env.local file in the project root.

SUPABASE_DB_URL=postgresql://...
DATABASE_URL=postgresql://...
SESSION_SECRET=your-strong-secret
GROQ_API_KEY=gsk_...
GCS_BUCKET_NAME=your-bucket-name
NODE_ENV=development

Notes:

- Database connection uses SUPABASE_DB_URL first, then DATABASE_URL.
- Session signing falls back to a default secret if SESSION_SECRET is missing. Set SESSION_SECRET in all real environments.
- GROQ_API_KEY is optional, but required for AI summary generation.
- GCS_BUCKET_NAME is required only for the upload URL endpoint.

## Getting Started

1. Install dependencies

  npm install

2. Initialize schema

  npm run db:init

3. Optional seed data

  npm run db:seed

4. Start development server

  npm run dev

The app runs on http://localhost:3000.

## Available Scripts

- npm run dev: start development server
- npm run build: production build
- npm start: run production server
- npm run check: TypeScript type-check
- npm run db:init: initialize database schema
- npm run db:seed: seed demo users, books, loans, and holds

## Authentication and Roles

Roles:

- patron
- librarian
- admin

Access control:

- Admin APIs accept librarian or admin role.
- Patron flows require an authenticated session user.
- Session cookie name is nexus_session.

Setup flow:

- GET /api/auth/setup-status
- POST /api/auth/setup-first-admin

Primary auth endpoints:

- POST /api/auth/signup
- POST /api/auth/signin
- GET /api/auth/user
- GET /api/logout
- POST /api/auth/change-password

Compatibility auth endpoint:

- POST /api/login

## API Reference

Auth:

- GET /api/auth/setup-status
- POST /api/auth/setup-first-admin
- POST /api/auth/signup
- POST /api/auth/signin
- GET /api/auth/user
- POST /api/auth/change-password
- GET /api/logout
- POST /api/login

Books:

- GET /api/books
- POST /api/books
- GET /api/books/:id
- POST /api/books/:id/ai-summary

Loans:

- GET /api/loans
- POST /api/loans
- POST /api/loans/:id/return

Holds:

- GET /api/holds
- POST /api/holds

Loan Requests:

- GET /api/loan-requests
- POST /api/loan-requests

Uploads:

- POST /api/uploads/request-url

Admin:

- GET /api/admin/stats
- GET /api/admin/books
- PUT /api/admin/books/:id
- DELETE /api/admin/books/:id
- GET /api/admin/users
- PATCH /api/admin/users/:id/role
- GET /api/admin/loans
- POST /api/admin/loans/:id/return
- GET /api/admin/holds
- GET /api/admin/loan-requests
- POST /api/admin/loan-requests/:id/review

## App Routes

- /: landing
- /catalog: catalog page
- /book/:id: book detail
- /dashboard: user dashboard
- /requests: user loan requests
- /profile: user profile
- /admin: admin and librarian panel
- /auth/setup: first-admin setup
- /auth/signin: sign in
- /auth/signup: sign up

## Database Entities

Main tables:

- books
- users
- loans
- holds
- loan_requests

The server initializes schema on startup if needed and also through npm run db:init.

## License

MIT (as declared in package metadata).
