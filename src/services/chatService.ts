import type { ChatMessage, ChatTable, ChatThread, ReferencedCall } from "@/types/chat";
import { mockChatThread } from "./mocks/chat.mock";
import { postJson } from "./apiClient";
import { getCallDetail } from "./callsService";
import { appendTurn, getHistory } from "./chatSession";
import { formatDurationShort } from "@/utils/formatters";

interface ChatApiResponse {
  answer: string;
  cited_external_call_ids: string[];
  table: ChatTable | null;
}

export interface ChatReply {
  message: ChatMessage;
  referencedCalls: ReferencedCall[];
}

/**
 * Prompt suggestions / scope / recent-threads chrome has no real backend
 * source yet, so that part of the mock stays as placeholder chrome — but the
 * conversation itself is real, seeded from whatever's persisted locally.
 */
export function getChatThread(): Promise<ChatThread> {
  const history = getHistory();
  const messages: ChatMessage[] = history.map((turn, index) => ({
    id: `history-${index}`,
    author: turn.role === "user" ? "user" : "agent",
    text: turn.content,
  }));
  return Promise.resolve({
    ...mockChatThread,
    messages,
    referencedCalls: [],
  });
}

async function resolveReferencedCalls(externalCallIds: string[]): Promise<ReferencedCall[]> {
  const details = await Promise.all(externalCallIds.map((id) => getCallDetail(id)));
  return details
    .filter((call) => call !== undefined)
    .map((call) => ({
      id: `ref-${call.id}`,
      callId: call.id,
      initials: call.avatarInitials,
      summary: call.title,
      durationLabel: formatDurationShort(call.durationSeconds),
    }));
}

export async function sendMessage(text: string): Promise<ChatReply> {
  appendTurn("user", text);
  const response = await postJson<ChatApiResponse>("/api/v1/chat/messages", { messages: getHistory() });
  appendTurn("assistant", response.answer);
  const referencedCalls = await resolveReferencedCalls(response.cited_external_call_ids);
  return {
    message: { id: `msg-${Date.now()}`, author: "agent", text: response.answer, table: response.table ?? undefined },
    referencedCalls,
  };
}
