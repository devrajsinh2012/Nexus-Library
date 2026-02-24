import type { Express, RequestHandler, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Author: devrajsinh2012 <djgohil2012@gmail.com>

const PgSession = connectPg(session);

export async function setupAuth(app: Express) {
  app.use(
    session({
      store: new PgSession({ pool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "nexus-library-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );
}

export function registerAuthRoutes(app: Express) {
  // GET current user
  app.get("/api/auth/user", (req: any, res: Response) => {
    if (req.session?.userId) {
      res.json({ id: req.session.userId, email: req.session.userEmail || null });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // POST login with email (simple local auth)
  app.post("/api/login", (req: any, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    req.session.userId = email;
    req.session.userEmail = email;
    res.json({ id: email, email });
  });

  // GET logout
  app.get("/api/logout", (req: any, res: Response) => {
    req.session?.destroy(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  if (req.session?.userId) {
    // Provide a claims-compatible user object
    req.user = { claims: { sub: req.session.userId } };
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
