export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "caresense.chat-history.v1";
const MAX_TURNS = 40;

function readStored(): ChatTurn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((turn): turn is ChatTurn =>
      typeof turn === "object" && turn !== null &&
      (turn as ChatTurn).role !== undefined && typeof (turn as ChatTurn).content === "string");
  } catch {
    return [];
  }
}

let history: ChatTurn[] = readStored();

function persist(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getHistory(): ChatTurn[] {
  return history;
}

export function appendTurn(role: ChatTurn["role"], content: string): void {
  history = [...history, { role, content }].slice(-MAX_TURNS);
  persist();
}

export function resetChatSession(): void {
  history = [];
  persist();
}
