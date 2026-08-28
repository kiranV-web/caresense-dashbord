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
  agentName: string;
  overallAdherencePercent: number;
  rules: RuleQualityPoint[];
}
