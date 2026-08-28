import type { CallAnalysisSettings } from "@/types/settings";
import { mockSettings } from "./mocks/settings.mock";
import { simulateDelay } from "./client";

// Mutated in place so the in-memory mock behaves like a persisted resource
// across calls within a session — replace with real writes later.
let settingsState: CallAnalysisSettings = mockSettings;

export function getSettings(): Promise<CallAnalysisSettings> {
  return simulateDelay(settingsState);
}

export function updateIdealDuration(minutes: number): Promise<CallAnalysisSettings> {
  settingsState = { ...settingsState, idealDurationMinutes: minutes };
  return simulateDelay(settingsState, 120);
}
