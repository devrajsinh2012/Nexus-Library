import { AppLayout } from "@/components/layout/AppLayout";
import { useLoans, useReturnLoan } from "@/hooks/use-loans";
import { useHolds } from "@/hooks/use-holds";
import { useLoanRequests } from "@/hooks/use-loan-requests";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Clock, Loader2, RotateCcw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format, isPast, differenceInDays } from "date-fns";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const { data: loans, isLoading: loansLoading } = useLoans();
  const { data: holds, isLoading: holdsLoading } = useHolds();
  const { data: loanRequests, isLoading: requestsLoading } = useLoanRequests();
  const { mutate: returnLoan, isPending: returningId } = useReturnLoan();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/auth/signin?redirect=/dashboard';
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || loansLoading || holdsLoading || requestsLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) return null;

  const activeLoans = loans?.filter(l => !l.returnedAt) || [];
  const pastLoans = loans?.filter(l => l.returnedAt) || [];
  const activeHolds = holds?.filter(h => h.status !== 'cancelled' && h.status !== 'fulfilled') || [];
  const recentLoanRequests = (loanRequests || []).slice(0, 6);

  const getRequestBadgeClass = (status: "pending" | "approved" | "rejected") => {
    if (status === "pending") return "bg-orange-100 text-orange-700";
    if (status === "approved") return "bg-green-100 text-green-700";
    return "bg-red-100 text-red-700";
  };

  const handleReturn = (id: string) => {
    returnLoan(id, {
      onSuccess: () => {
        toast({ title: "Volume Returned", description: "Thank you for returning the book." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <AppLayout>
      <div className="bg-muted/20 border-b border-border/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Hello {user?.firstName || 'Reader'}</h1>
              <p className="text-lg text-muted-foreground">Welcome to Nexus Library, here is your library.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-card border border-border/50 rounded-xl px-5 py-3 shadow-sm flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Loans</p>
                  <p className="text-xl font-bold leading-none">{activeLoans.length}</p>
                </div>
              </div>
              <div className="bg-card border border-border/50 rounded-xl px-5 py-3 shadow-sm flex items-center gap-3">
                <Clock className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Waitlist</p>
                  <p className="text-xl font-bold leading-none">{activeHolds.length}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-12">
          
          {/* Active Loans Section */}
          <div className="space-y-8">
            <h2 className="font-serif text-2xl font-bold border-b border-border pb-4">Currently Reading</h2>
            
            {activeLoans.length === 0 ? (
              <div className="bg-card border border-border/50 border-dashed rounded-2xl p-12 text-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">No Active Loans</h3>
                <p className="text-muted-foreground mb-6">Your shelf is empty. Discover your next great read in our collection.</p>
                <Button asChild>
                  <Link href="/catalog">Browse Catalog</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeLoans.map((loan, i) => {
                  const dueDate = new Date(loan.dueDate);
                  const overdue = isPast(dueDate);
                  const daysLeft = differenceInDays(dueDate, new Date());

                  return (
                    <motion.div 
                      key={loan.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-card border border-border/60 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center"
                    >
                      <img 
                        src={loan.book?.coverUrl || `https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop`} 
                        alt={loan.book?.title}
                        className="w-24 h-36 object-cover rounded-lg book-shadow flex-shrink-0"
                      />
                      <div className="flex-grow">
                        <Link href={`/book/${loan.book?.id}`} className="hover:underline">
                          <h3 className="font-serif text-xl font-bold text-foreground mb-1">{loan.book?.title}</h3>
                        </Link>
                        <p className="text-muted-foreground text-sm mb-4">By {loan.book?.authors.join(', ')}</p>
                        
                        <div className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium ${
                          overdue ? 'bg-destructive/10 text-destructive border border-destructive/20' : 
                          daysLeft <= 3 ? 'bg-orange-500/10 text-orange-700 border border-orange-500/20' : 
                          'bg-secondary/10 text-secondary border border-secondary/20'
                        }`}>
                          {overdue ? <AlertCircle className="w-4 h-4 mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                          {overdue ? `Overdue by ${Math.abs(daysLeft)} days` : `Due in ${daysLeft} days (${format(dueDate, 'MMM d')})`}
                        </div>
                      </div>
                      <div className="w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          className="w-full sm:w-auto h-12 px-6 rounded-xl hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-colors"
                          onClick={() => handleReturn(loan.id)}
                          disabled={!!returningId}
                        >
                          {returningId ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                          Return Volume
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar: Holds & History */}
          <div className="space-y-12">
            {/* Loan Requests */}
            <div className="space-y-6">
              <div className="border-b border-border pb-4 flex items-center justify-between gap-3">
                <h2 className="font-serif text-2xl font-bold">My Loan Requests</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/requests">View all</Link>
                </Button>
              </div>
              {recentLoanRequests.length === 0 ? (
                <p className="text-muted-foreground italic text-sm">No loan requests yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentLoanRequests.map((request) => (
                    <div key={request.id} className="bg-card border border-border/50 rounded-xl p-4 flex gap-4 items-center">
                      <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img
                          src={request.book?.coverUrl || `https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=100&auto=format&fit=crop`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-sm line-clamp-1">{request.book?.title || "Unknown Book"}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Requested {request.requestedAt ? format(new Date(request.requestedAt), "MMM d, yyyy") : "N/A"}
                        </p>
                        {request.reviewedAt && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Reviewed {format(new Date(request.reviewedAt), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                      <div className="ml-auto">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getRequestBadgeClass(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Holds */}
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold border-b border-border pb-4">Waitlist</h2>
              {activeHolds.length === 0 ? (
                <p className="text-muted-foreground italic text-sm">You have no pending holds.</p>
              ) : (
                <div className="space-y-4">
                  {activeHolds.map(hold => (
                    <div key={hold.id} className="bg-card border border-border/50 rounded-xl p-4 flex gap-4 items-center">
                      <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={hold.book?.coverUrl || `https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=100&auto=format&fit=crop`} 
                          alt="" className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm line-clamp-1">{hold.book?.title}</h4>
                        <p className="text-xs text-muted-foreground capitalize mt-1">Status: <span className="font-semibold text-secondary">{hold.status}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reading History */}
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold border-b border-border pb-4">Reading History</h2>
              {pastLoans.length === 0 ? (
                <p className="text-muted-foreground italic text-sm">No returned books yet.</p>
              ) : (
                <div className="space-y-4">
                  {pastLoans.slice(0, 5).map(loan => (
                    <div key={loan.id} className="flex gap-4 items-center">
                      <div className="w-10 h-14 bg-muted rounded overflow-hidden flex-shrink-0 opacity-70">
                        <img 
                          src={loan.book?.coverUrl || `https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=100&auto=format&fit=crop`} 
                          alt="" className="w-full h-full object-cover grayscale" 
                        />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-foreground/80 line-clamp-1">{loan.book?.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Returned {loan.returnedAt ? format(new Date(loan.returnedAt), 'MMM d, yyyy') : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
