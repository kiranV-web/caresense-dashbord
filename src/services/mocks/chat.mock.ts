import type { ChatThread } from "@/types/chat";

export const mockChatThread: ChatThread = {
  messages: [
    { id: "msg-1", author: "user", text: "Which banking product caused the most escalations this week?" },
    {
      id: "msg-2",
      author: "agent",
      text: "Credit cards — 74 calls, 19 escalated. Card payment failures account for 41 of them, and 3 customers have called more than twice about it.",
    },
    { id: "msg-3", author: "user", text: "Show me the rudest calls about it." },
    {
      id: "msg-4",
      author: "agent",
      text: "Four calls were flagged rude. Two involve the same customer, #C1842. Open either one to jump straight to the flagged moment in the recording.",
    },
  ],
  referencedCalls: [
    { id: "ref-1", callId: "call-1289", initials: "RK", summary: "Card payment repeatedly declined", durationLabel: "4:38" },
    { id: "ref-2", callId: "call-1198", initials: "MR", summary: "Cheque book not dispatched", durationLabel: "7:44" },
  ],
  promptSuggestions: [
    "Top recurring issues today",
    "Which agent fails empathy most?",
    "Summarise unresolved calls",
    "This week vs last week",
  ],
};
