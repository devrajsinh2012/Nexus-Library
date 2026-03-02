// Author: devrajsinh2012 <djgohil2012@gmail.com>
import type { Express, RequestHandler, Response, NextFunction } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import { storage } from "./storage";
import * as dotenv from "dotenv";
dotenv.config();

export async function setupAuth(app: Express) {
  app.use(
    session({
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI!,
        dbName: "nexus_library",
        collectionName: "sessions",
        ttl: 7 * 24 * 60 * 60, // 7 days in seconds
      }),
      secret: process.env.SESSION_SECRET || "nexus-library-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days ms
      },
    })
  );
}

export function registerAuthRoutes(app: Express) {
  // GET current user from session
  app.get("/api/auth/user", (req: any, res: Response) => {
    if (req.session?.userId) {
      res.json({
        id: req.session.userId,
        email: req.session.userEmail || null,
        firstName: req.session.firstName || null,
        lastName: req.session.lastName || null,
        role: req.session.userRole || "patron",
        profileImageUrl: null,
      });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // POST login — email-based; upserts user record in MongoDB
  app.post("/api/login", async (req: any, res: Response) => {
    const { email, firstName, lastName } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    try {
      const user = await storage.upsertUser({ email, firstName: firstName || null, lastName: lastName || null });

      // Persist to session
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.userRole = user.role;
      req.session.firstName = user.firstName;
      req.session.lastName = user.lastName;

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // GET logout
  app.get("/api/logout", (req: any, res: Response) => {
    req.session?.destroy(() => {
      res.redirect("/");
    });
  });
}

// Requires any authenticated session
export const isAuthenticated: RequestHandler = (req: any, res: Response, next: NextFunction) => {
  if (req.session?.userId) {
    req.user = { claims: { sub: req.session.userId } };
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Requires librarian or admin role (stored in session on login)
export const isAdmin: RequestHandler = (req: any, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const role = req.session.userRole as string | undefined;
  if (role !== "librarian" && role !== "admin") {
    return res.status(403).json({ message: "Forbidden: librarian or admin role required" });
  }
  req.user = { claims: { sub: req.session.userId } };
  return next();
};
