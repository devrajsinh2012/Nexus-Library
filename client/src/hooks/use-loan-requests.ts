import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Book } from "@shared/schema";

export type LoanRequest = {
  id: string;
  bookId: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string | Date | null;
  reviewedAt: string | Date | null;
  reviewedBy: string | null;
  book?: Book;
};

export function useLoanRequests() {
  return useQuery<LoanRequest[]>({
    queryKey: ["/api/loan-requests"],
    queryFn: async () => {
      const res = await fetch("/api/loan-requests", { credentials: "include" });
      if (res.status === 401) return [];
      if (!res.ok) throw new Error("Failed to fetch loan requests");
      return res.json();
    },
  });
}

export function useCreateLoanRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: string) => {
      const res = await fetch("/api/loan-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
        credentials: "include",
      });

      const payload = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error("Please log in to request books");
      if (!res.ok) throw new Error(payload?.message || "Failed to submit request");
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loan-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
    },
  });
}
