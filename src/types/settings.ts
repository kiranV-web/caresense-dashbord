import type { Id } from "./common";

export interface QualityRule {
  id: Id;
  name: string;
  description: string;
  enabled: boolean;
}

export interface CallAnalysisSettings {
  idealDurationMinutes: number;
  qualityRules: QualityRule[];
}
