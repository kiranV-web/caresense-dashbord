import type { Id } from "./common";

export interface ChatTable {
  title: string;
  columns: string[];
  rows: string[][];
}

export interface ChatMessage {
  id: Id;
  author: "user" | "agent";
  text: string;
  table?: ChatTable;
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
