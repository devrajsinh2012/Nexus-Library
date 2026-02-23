import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Book, type InsertBook } from "@shared/schema";

export function useBooks(search?: string) {
  return useQuery<Book[]>({
    queryKey: [api.books.list.path, search],
    queryFn: async () => {
      const url = search ? `${api.books.list.path}?search=${encodeURIComponent(search)}` : api.books.list.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch books");
      return res.json();
    },
  });
}

export function useBook(id: string) {
  return useQuery<Book>({
    queryKey: [api.books.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.books.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("Book not found");
      if (!res.ok) throw new Error("Failed to fetch book");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBook) => {
      const res = await fetch(api.books.create.path, {
        method: api.books.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create book");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.books.list.path] });
    },
  });
}

export function useAiSummary() {
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.books.aiSummary.path, { id });
      const res = await fetch(url, {
        method: api.books.aiSummary.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate AI summary");
      const data = await res.json();
      return data.summary as string;
    },
  });
}
