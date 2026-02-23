import { Link } from "wouter";
import { type Book } from "@shared/schema";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export function BookCard({ book, index = 0 }: { book: Book; index?: number }) {
  const isAvailable = book.availableCopies > 0;
  
  // Provide a beautiful fallback if cover is missing
  const coverUrl = book.coverUrl || `https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/book/${book.id}`} className="group block h-full">
        <div className="flex h-full flex-col rounded-2xl bg-card border border-border/40 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1">
          
          <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted/50 p-4 sm:p-6 flex items-center justify-center">
            {/* Ambient background blur */}
            <div 
              className="absolute inset-0 opacity-40 blur-2xl scale-110 transition-transform duration-500 group-hover:scale-125"
              style={{ backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
            
            {/* Actual Book Cover */}
            <div className="relative h-full w-full max-w-[85%] origin-bottom transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
              <img 
                src={coverUrl} 
                alt={book.title}
                className="h-full w-full object-cover rounded-md book-shadow ring-1 ring-black/10"
                loading="lazy"
              />
            </div>
            
            {/* Availability Badge */}
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-md border ${
                isAvailable 
                  ? 'bg-secondary/90 text-white border-secondary/20' 
                  : 'bg-destructive/90 text-white border-destructive/20'
              }`}>
                {isAvailable ? 'Available' : 'Waitlist'}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="flex-1">
              <p className="text-xs font-medium text-primary mb-2 uppercase tracking-wider">
                {book.genres && book.genres.length > 0 ? book.genres[0] : 'Literature'}
              </p>
              <h3 className="font-serif text-xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {book.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                {book.authors.join(", ")}
              </p>
            </div>
            
            <div className="mt-4 flex items-center text-sm font-medium text-muted-foreground border-t border-border/50 pt-4">
              <BookOpen className="mr-2 h-4 w-4 opacity-70" />
              <span>{book.totalCopies} {book.totalCopies === 1 ? 'Copy' : 'Copies'} Total</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
