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
      <div className="bg-muted/20 border-b border-border/50 pt-16 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-5xl font-bold mb-6"
          >
            The Collection
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto relative"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                type="text" 
                placeholder="Search by title, author, or ISBN..." 
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-background border-2 border-border/60 text-lg shadow-sm focus-visible:ring-4 focus-visible:ring-primary/10 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
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
            <p className="text-muted-foreground max-w-md">We couldn't find any books matching your criteria. Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {books?.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
