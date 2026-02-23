import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Loan, type Book } from "@shared/schema";

export type LoanWithBook = Loan & { book?: Book };

export function useLoans() {
  return useQuery<LoanWithBook[]>({
    queryKey: [api.loans.list.path],
    queryFn: async () => {
      const res = await fetch(api.loans.list.path, { credentials: "include" });
      if (res.status === 401) return []; // Handle unauthorized gracefully
      if (!res.ok) throw new Error("Failed to fetch loans");
      return res.json();
    },
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: string) => {
      const res = await fetch(api.loans.create.path, {
        method: api.loans.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
        credentials: "include",
      });
      if (res.status === 401) throw new Error("Please log in to checkout books");
      if (!res.ok) throw new Error("Failed to checkout book");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.loans.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.books.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.books.list.path] });
    },
  });
}

export function useReturnLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.loans.return.path, { id });
      const res = await fetch(url, {
        method: api.loans.return.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to return book");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.loans.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.books.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.books.list.path] });
    },
  });
}
