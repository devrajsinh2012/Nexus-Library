import { ReactNode } from "react";
import { Navbar } from "./Navbar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-grow flex flex-col relative z-10">
        {children}
      </main>
      <footer className="border-t border-border/40 bg-muted/30 py-12 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="font-serif text-xl font-medium text-foreground mb-4">Nexus Library Management</p>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Nexus Library System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
