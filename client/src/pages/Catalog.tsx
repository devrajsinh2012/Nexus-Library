import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBooks } from "@/hooks/use-books";
import { BookCard } from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Library } from "lucide-react";
import { motion } from "framer-motion";

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: books, isLoading, error } = useBooks(searchQuery.length > 2 ? searchQuery : undefined);

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-gradient-to-b from-muted/30 to-background border-b border-border/40 pt-14 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-[0.15em] mb-3">Catalog</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-balance">
              The Collection
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-background border-2 border-border/60 text-lg shadow-sm focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary/40 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery.length > 0 && searchQuery.length <= 2 && (
              <p className="text-xs text-muted-foreground mt-2">Type at least 3 characters to search...</p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
            <p className="font-medium text-lg">Curating the collection...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive bg-destructive/5 rounded-2xl border border-destructive/20">
            <p className="font-medium text-lg">Failed to load the catalog. Please try again later.</p>
          </div>
        ) : books?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Library className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-2">No volumes found</h3>
            <p className="text-muted-foreground max-w-md text-pretty">
              We couldn't find any books matching your criteria. Try adjusting your search terms.
            </p>
          </div>
        ) : (
          <>
            {books && books.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground mb-8"
              >
                Showing {books.length} {books.length === 1 ? 'volume' : 'volumes'}
                {searchQuery.length > 2 ? ` matching "${searchQuery}"` : ' in the collection'}
              </motion.p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {books?.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
