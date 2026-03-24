import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Library, Github, BookOpen, Heart } from "lucide-react";
import Link from "next/link";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-grow flex flex-col relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-3 mb-4 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/15 transition-transform group-hover:scale-105">
                  <Library className="h-4.5 w-4.5" />
                </div>
                <span className="font-serif text-xl font-bold tracking-tight">Nexus</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                A modern library management system. Powered by AI, designed for discovery.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-serif font-bold text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/catalog" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5" /> Browse Catalog
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5" /> My Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="font-serif font-bold text-sm mb-4">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Open-source library system built with Next.js and MongoDB. AI summaries powered by Groq.
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="py-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Nexus Library System. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with care for readers everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
