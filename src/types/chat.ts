import type { Id } from "./common";

export interface ChatMessage {
  id: Id;
  author: "user" | "agent";
  text: string;
}

export interface ReferencedCall {
  id: Id;
  callId: Id;
  initials: string;
  summary: string;
  durationLabel: string;
}

export interface ChatThread {
  messages: ChatMessage[];
  referencedCalls: ReferencedCall[];
  promptSuggestions: string[];
}
