import type { ChatThread } from "@/types/chat";

// getChatThread() always overrides messages/referencedCalls with real local
// history, so only promptSuggestions from this mock ever actually renders.
export const mockChatThread: ChatThread = {
  messages: [],
  referencedCalls: [],
  promptSuggestions: [
    "Top recurring issues today",
    "Which agent fails empathy most?",
    "Summarise unresolved calls",
    "What needs my attention today?",
  ],
};
