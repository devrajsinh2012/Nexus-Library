import { useParams } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBook, useAiSummary } from "@/hooks/use-books";
import { useCreateLoan } from "@/hooks/use-loans";
import { useCreateHold } from "@/hooks/use-holds";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, BrainCircuit, CheckCircle2, Clock } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

function getSpineColor(title: string): string {
  const colors = [
    'hsl(25, 35%, 32%)', 'hsl(145, 25%, 28%)', 'hsl(220, 30%, 35%)',
    'hsl(0, 35%, 35%)', 'hsl(35, 40%, 30%)', 'hsl(280, 20%, 35%)',
  ];
  const hash = title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading, error } = useBook(id);
  const { mutate: createLoan, isPending: isLoaning } = useCreateLoan();
  const { mutate: createHold, isPending: isHolding } = useCreateHold();
  const { mutate: generateSummary, isPending: isGenerating, data: aiSummary } = useAiSummary();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !book) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h2 className="font-serif text-2xl font-bold text-destructive mb-4">Volume Not Found</h2>
          <Button variant="outline" asChild>
            <Link href="/catalog">Return to Catalog</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isAvailable = book.availableCopies > 0;
  const coverUrl = book.coverUrl || `https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop`;
  const spineColor = getSpineColor(book.title);

  const handleAction = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }

    if (isAvailable) {
      createLoan(book.id, {
        onSuccess: () => {
          toast({
            title: "Checkout Successful",
            description: "The book has been added to your active loans.",
          });
        },
        onError: (err) => {
          toast({
            title: "Checkout Failed",
            description: err.message,
            variant: "destructive"
          });
        }
      });
    } else {
      createHold(book.id, {
        onSuccess: () => {
          toast({
            title: "Hold Placed",
            description: "You've been added to the waitlist.",
          });
        },
        onError: (err) => {
          toast({
            title: "Action Failed",
            description: err.message,
            variant: "destructive"
          });
        }
      });
    }
  };

  const handleAiSummary = () => {
    generateSummary(book.id);
  };

  const displaySummary = aiSummary || book.aiSummary;

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/catalog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Collection
        </Link>

        <div className="grid md:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
          {/* Left Column: 3D Book Cover & Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8"
          >
            {/* 3D Book Display */}
            <div className="flex justify-center">
              <div className="book-3d-hero" style={{ width: '280px', height: '420px' }}>
                <div className="book-3d-inner w-full h-full">
                  <div className="book-3d-spine" style={{ background: spineColor }} />
                  <div className="book-3d-pages" />
                  <div className="book-3d-bottom" />
                  <div className="book-3d-cover w-full h-full">
                    <img
                      src={coverUrl}
                      alt={book.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${
                  isAvailable ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'
                }`}>
                  {isAvailable ? <CheckCircle2 className="mr-1.5 h-4 w-4" /> : <Clock className="mr-1.5 h-4 w-4" />}
                  {isAvailable ? 'Available Now' : 'Waitlist Only'}
                </span>
              </div>

              <div className="flex justify-between text-sm mb-6 border-y border-border/50 py-4">
                <div className="text-center flex-1">
                  <p className="font-bold text-2xl text-foreground">{book.availableCopies}</p>
                  <p className="text-muted-foreground text-xs mt-1">Available</p>
                </div>
                <div className="w-px bg-border/50" />
                <div className="text-center flex-1">
                  <p className="font-bold text-2xl text-foreground">{book.totalCopies}</p>
                  <p className="text-muted-foreground text-xs mt-1">Total Copies</p>
                </div>
              </div>

              <Button
                className="w-full h-12 text-base rounded-xl shadow-md"
                size="lg"
                variant={isAvailable ? "default" : "secondary"}
                onClick={handleAction}
                disabled={isLoaning || isHolding}
              >
                {isLoaning || isHolding ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isAuthenticated
                  ? (isAvailable ? "Checkout Volume" : "Place on Hold")
                  : "Sign in to Borrow"
                }
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col"
          >
            <div className="mb-3 flex gap-2 flex-wrap">
              {book.genres?.map(g => (
                <span key={g} className="px-3 py-1 rounded-full bg-muted text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">
                  {g}
                </span>
              ))}
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-[1.08] text-balance">
              {book.title}
            </h1>

            <p className="text-xl text-primary font-medium mb-10">
              By {book.authors.join(", ")}
            </p>

            {/* AI Summary Section */}
            <div className="bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border border-primary/15 rounded-3xl p-6 sm:p-8 mb-10 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold">AI Synthesis</h3>
                    <p className="text-[11px] text-muted-foreground tracking-wide">Powered by Groq</p>
                  </div>
                </div>

                {!(displaySummary) && (
                  <Button
                    variant="outline"
                    onClick={handleAiSummary}
                    disabled={isGenerating}
                    className="rounded-full border-primary/30 hover:bg-primary/5 text-primary"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Generate Analysis"}
                  </Button>
                )}
              </div>

              <div className="relative z-10 text-foreground/80 leading-relaxed">
                <AnimatePresence mode="wait">
                  {displaySummary ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      {displaySummary.split('\n\n').map((paragraph, i) => (
                        <p key={i} className="text-[15px] leading-relaxed">{paragraph}</p>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="italic text-muted-foreground text-sm"
                    >
                      Click generate to let Groq analyze this work and provide a comprehensive breakdown of themes, plot, and target audience.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Publisher Description */}
            {book.description && (
              <div>
                <h3 className="font-serif text-xl font-bold mb-4">Publisher's Note</h3>
                <p className="text-muted-foreground leading-relaxed text-[15px]">
                  {book.description}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-12 pt-8 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5">ISBN-13</p>
                <p className="font-mono font-medium text-sm">{book.isbn13 || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5">Added</p>
                <p className="font-medium text-sm">{book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5">Genres</p>
                <p className="font-medium text-sm">{book.genres?.join(', ') || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5">Authors</p>
                <p className="font-medium text-sm">{book.authors.length}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
