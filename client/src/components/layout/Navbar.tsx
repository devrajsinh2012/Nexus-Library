import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Library, Menu, User, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isStaff = user?.role === "librarian" || user?.role === "admin";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105 group-hover:-rotate-3">
              <Library className="h-5 w-5" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
              Nexus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <Link href="/catalog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Catalog
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                My Dashboard
              </Link>
            )}
            {isStaff && (
              <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}

            <div className="h-6 w-px bg-border mx-2"></div>

            {!isLoading && (
              isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden lg:inline-block">{user?.firstName || 'Patron'}</span>
                    {isStaff && (
                      <span className="hidden lg:inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                        {user?.role}
                      </span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full border-border/60 hover:bg-muted" onClick={() => window.location.href = '/api/logout'}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Button variant="ghost" className="hover:bg-transparent hover:text-primary" onClick={() => window.location.href = '/api/login'}>
                    Sign In
                  </Button>
                  <Button className="rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 shadow-primary/20" onClick={() => window.location.href = '/api/login'}>
                    Join Library
                  </Button>
                </div>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="space-y-1 px-4 pb-6 pt-4">
              <Link href="/catalog" className="block rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
                Catalog
              </Link>
              {isAuthenticated && (
                <Link href="/dashboard" className="block rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
                  My Dashboard
                </Link>
              )}
              {isStaff && (
                <Link href="/admin" className="block rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
                  <ShieldCheck className="h-4 w-4 inline mr-2" />
                  Admin Panel
                </Link>
              )}
              <div className="mt-4 pt-4 border-t border-border">
                {isAuthenticated ? (
                  <Button className="w-full justify-center" variant="outline" onClick={() => window.location.href = '/api/logout'}>
                    Sign Out
                  </Button>
                ) : (
                  <Button className="w-full justify-center bg-primary text-primary-foreground" onClick={() => window.location.href = '/api/login'}>
                    Sign In / Join
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
