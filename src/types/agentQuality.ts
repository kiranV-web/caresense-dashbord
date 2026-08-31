export interface RuleQualityPoint {
  rule: string;
  label: string;
  agentPercent: number | null;
  teamPercent: number;
  failCount: number;
  totalCalls: number;
}

export interface AgentConversationQuality {
  agentId: string;
  loggedNames: string[];
  overallAdherencePercent: number;
  rules: RuleQualityPoint[];
}

export interface QualityAgentIdentity {
  id: string;
  loggedNames: string[];
  callsCount: number;
}
