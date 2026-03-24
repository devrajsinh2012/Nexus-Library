// Author: devrajsinh2012 <djgohil2012@gmail.com>
// Plain TypeScript types — no ORM dependency.
import { z } from "zod";

export const insertConversationSchema = z.object({
  title: z.string().min(1),
});

export const insertMessageSchema = z.object({
  conversationId: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

export type Conversation = { id: string; title: string; createdAt: Date };
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = { id: string; conversationId: string; role: string; content: string; createdAt: Date };
export type InsertMessage = z.infer<typeof insertMessageSchema>;
