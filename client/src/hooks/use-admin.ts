import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Book, Loan, Hold } from "@shared/schema";
import type { User } from "@shared/models/auth";

interface AdminStats {
  totalBooks: number;
  totalLoans: number;
  activeLoans: number;
  totalHolds: number;
  totalUsers: number;
}

type LoanWithDetails = Loan & { book?: Book; userEmail?: string | null };
type HoldWithDetails = Hold & { book?: Book; userEmail?: string | null };

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });
}

export function useAdminBooks(search?: string) {
  return useQuery<Book[]>({
    queryKey: ["/api/admin/books", search],
    queryFn: async () => {
      const url = search ? `/api/admin/books?search=${encodeURIComponent(search)}` : "/api/admin/books";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch books");
      return res.json();
    },
  });
}

export function useAdminCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Book>) => {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create book");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
    },
  });
}

export function useAdminUpdateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Book>) => {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update book");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
    },
  });
}

export function useAdminDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete book");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
    },
  });
}

export function useAdminLoans() {
  return useQuery<LoanWithDetails[]>({
    queryKey: ["/api/admin/loans"],
    queryFn: async () => {
      const res = await fetch("/api/admin/loans", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch loans");
      return res.json();
    },
  });
}

export function useAdminReturnLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/loans/${id}/return`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to return loan");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books"] });
    },
  });
}

export function useAdminHolds() {
  return useQuery<HoldWithDetails[]>({
    queryKey: ["/api/admin/holds"],
    queryFn: async () => {
      const res = await fetch("/api/admin/holds", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch holds");
      return res.json();
    },
  });
}

export function useAdminUsers() {
  return useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
}

export function useAdminUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });
}
