export type CallsFilterValue =
  | "All"
  | "Resolved"
  | "Improve quality"
  | "Recurring"
  | "Unresolved"
  | "Analysis failed"
  | "Dropped"
  | "Rude"
  | "Requires attention";

export interface CallsPageState {
  filter: CallsFilterValue;
  page: number;
}

const STORAGE_KEY = "caresense.calls-page-state.v1";
const DEFAULT_STATE: CallsPageState = { filter: "All", page: 1 };
const VALID_FILTERS = new Set<CallsFilterValue>([
  "All", "Resolved", "Improve quality", "Recurring", "Unresolved",
  "Analysis failed", "Dropped", "Rude", "Requires attention",
]);

function loadInitial(): CallsPageState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as { filter?: string; page?: number };
    const storedFilter = parsed.filter === "Requires review" ? "Requires attention" : parsed.filter;
    if (typeof storedFilter !== "string" || !VALID_FILTERS.has(storedFilter as CallsFilterValue)) return DEFAULT_STATE;
    if (typeof parsed.page !== "number" || parsed.page < 1) return DEFAULT_STATE;
    return { filter: storedFilter as CallsFilterValue, page: parsed.page };
  } catch {
    return DEFAULT_STATE;
  }
}

let state: CallsPageState = loadInitial();
const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function getCallsPageState(): CallsPageState {
  return state;
}

export function setCallsFilter(filter: CallsFilterValue): void {
  if (state.filter === filter) return;
  state = { filter, page: 1 };
  persist();
  emit();
}

export function setCallsPageNumber(page: number): void {
  if (state.page === page) return;
  state = { ...state, page };
  persist();
  emit();
}

export function subscribeCallsPageState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
