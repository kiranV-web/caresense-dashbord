import type { CallAnalysisSettings } from "@/types/settings";

export const mockSettings: CallAnalysisSettings = {
  idealDurationMinutes: 5,
  qualityRules: [
    {
      id: "greeting",
      name: "Greeting",
      description: "Agent introduces themselves within 15 seconds",
      enabled: true,
    },
    {
      id: "empathy",
      name: "Empathy",
      description: "Agent acknowledges the concern before troubleshooting",
      enabled: true,
    },
    {
      id: "verification",
      name: "Customer verification",
      description: "Identity confirmed before any account change",
      enabled: true,
    },
    {
      id: "resolution",
      name: "Resolution confirmation",
      description: "Agent states the outcome and the next step",
      enabled: true,
    },
    {
      id: "closing",
      name: "Closing etiquette",
      description: "Agent closes with thanks and an offer of further help",
      enabled: true,
    },
  ],
};
