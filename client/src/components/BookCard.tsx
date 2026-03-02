import { Link } from "wouter";
import { type Book } from "@shared/schema";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

// Generate a spine color from the book title
function getSpineColor(book: Book): string {
  const colors = [
    'hsl(25, 35%, 32%)',   // warm brown
    'hsl(145, 25%, 28%)',  // forest green
    'hsl(220, 30%, 35%)',  // navy blue
    'hsl(0, 35%, 35%)',    // burgundy
    'hsl(35, 40%, 30%)',   // amber
    'hsl(280, 20%, 35%)',  // plum
    'hsl(180, 20%, 30%)',  // teal
    'hsl(350, 30%, 32%)',  // crimson
  ];
  const hash = book.title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function BookCard({ book, index = 0 }: { book: Book; index?: number }) {
  const isAvailable = book.availableCopies > 0;
  const coverUrl = book.coverUrl || `https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop`;
  const spineColor = getSpineColor(book);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }}
    >
      <Link href={`/book/${book.id}`} className="group block h-full">
        <div className="flex h-full flex-col rounded-2xl bg-card border border-border/40 overflow-hidden shadow-sm transition-all duration-500 hover:shadow-xl hover:border-primary/20">

          {/* 3D Book Cover Area */}
          <div className="relative w-full overflow-visible px-8 pt-8 pb-6 flex items-center justify-center bg-muted/30">
            {/* Ambient blur behind book */}
            <div
              className="absolute inset-0 opacity-30 blur-2xl scale-110 transition-transform duration-700 group-hover:scale-125"
              style={{ backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />

            {/* 3D Book */}
            <div className="book-3d relative z-10 w-[75%]">
              <div className="book-3d-inner aspect-[2/3]">
                {/* Spine */}
                <div className="book-3d-spine" style={{ background: spineColor }} />
                {/* Pages right */}
                <div className="book-3d-pages" />
                {/* Pages bottom */}
                <div className="book-3d-bottom" />
                {/* Cover */}
                <div className="book-3d-cover w-full h-full">
                  <img
                    src={coverUrl}
                    alt={book.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Availability Badge */}
            <div className="absolute top-4 right-4 z-20">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-md border ${
                isAvailable
                  ? 'bg-secondary/90 text-white border-secondary/20'
                  : 'bg-destructive/90 text-white border-destructive/20'
              }`}>
                {isAvailable ? 'Available' : 'Waitlist'}
              </span>
            </div>
          </div>

          {/* Book Info */}
          <div className="flex flex-1 flex-col p-5">
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-primary mb-2 uppercase tracking-[0.12em]">
                {book.genres && book.genres.length > 0 ? book.genres[0] : 'Literature'}
              </p>
              <h3 className="font-serif text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                {book.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground line-clamp-1">
                {book.authors.join(", ")}
              </p>
            </div>

            <div className="mt-4 flex items-center text-sm font-medium text-muted-foreground border-t border-border/50 pt-3.5">
              <BookOpen className="mr-2 h-4 w-4 opacity-60" />
              <span className="text-xs tracking-wide">
                {book.availableCopies} of {book.totalCopies} available
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
