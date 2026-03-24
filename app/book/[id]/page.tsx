"use client";

import { useParams } from "next/navigation";
import BookDetail from "@/pages/BookDetail";

export default function Page() {
  const params = useParams<{ id: string }>();
  return <BookDetail id={params.id} />;
}
