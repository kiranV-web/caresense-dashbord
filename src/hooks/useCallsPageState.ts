import { useSyncExternalStore } from "react";
import { getCallsPageState, subscribeCallsPageState, setCallsFilter, setCallsPageNumber,
  type CallsFilterValue, type CallsPageState } from "@/services/callsFilterStore";

export function useCallsPageState(): [CallsPageState, (filter: CallsFilterValue) => void, (page: number) => void] {
  const state = useSyncExternalStore(subscribeCallsPageState, getCallsPageState);
  return [state, setCallsFilter, setCallsPageNumber];
}
