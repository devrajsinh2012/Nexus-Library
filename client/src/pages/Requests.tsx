import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLoanRequests } from "@/hooks/use-loan-requests";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

function getBadgeClass(status: "pending" | "approved" | "rejected") {
  if (status === "pending") return "bg-orange-100 text-orange-700";
  if (status === "approved") return "bg-green-100 text-green-700";
  return "bg-red-100 text-red-700";
}

export default function RequestsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: loanRequests, isLoading: requestsLoading } = useLoanRequests();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/auth/signin?redirect=/requests";
    }
  }, [authLoading, isAuthenticated]);

  const filteredRequests = useMemo(() => {
    const all = loanRequests || [];
    const lowerSearch = search.trim().toLowerCase();

    return all.filter((request) => {
      const statusMatches = statusFilter === "all" || request.status === statusFilter;
      const title = (request.book?.title || "").toLowerCase();
      const authorBlob = (request.book?.authors || []).join(" ").toLowerCase();
      const searchMatches =
        lowerSearch.length === 0 ||
        title.includes(lowerSearch) ||
        authorBlob.includes(lowerSearch);

      return statusMatches && searchMatches;
    });
  }, [loanRequests, search, statusFilter]);

  if (authLoading || requestsLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <AppLayout>
      <div className="bg-muted/20 border-b border-border/50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">My Loan Requests</h1>
          <p className="text-lg text-muted-foreground">Track all your pending, approved, and rejected borrow requests.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or author"
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  className="capitalize"
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <p className="text-muted-foreground">No requests found for the current filter.</p>
              <Button asChild className="mt-4">
                <Link href="/catalog">Browse Catalog</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => (
                <div key={request.id} className="bg-muted/30 border border-border/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-14 h-20 bg-background rounded overflow-hidden flex-shrink-0">
                    <img
                      src={request.book?.coverUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=160&auto=format&fit=crop"}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-lg font-bold line-clamp-1">{request.book?.title || "Unknown Book"}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{request.book?.authors?.join(", ") || "Unknown author"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested {request.requestedAt ? format(new Date(request.requestedAt), "MMM d, yyyy") : "N/A"}
                    </p>
                    {request.reviewedAt && (
                      <p className="text-xs text-muted-foreground">
                        Reviewed {format(new Date(request.reviewedAt), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${getBadgeClass(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
