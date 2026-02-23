import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type Hold, type Book } from "@shared/schema";

export type HoldWithBook = Hold & { book?: Book };

export function useHolds() {
  return useQuery<HoldWithBook[]>({
    queryKey: [api.holds.list.path],
    queryFn: async () => {
      const res = await fetch(api.holds.list.path, { credentials: "include" });
      if (res.status === 401) return []; 
      if (!res.ok) throw new Error("Failed to fetch holds");
      return res.json();
    },
  });
}

export function useCreateHold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: string) => {
      const res = await fetch(api.holds.create.path, {
        method: api.holds.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
        credentials: "include",
      });
      if (res.status === 401) throw new Error("Please log in to place holds");
      if (!res.ok) throw new Error("Failed to place hold");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.holds.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.books.get.path] });
    },
  });
}
