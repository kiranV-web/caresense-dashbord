import styled from "styled-components";
import { Card } from "@/components/primitives/Card";

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.025em;
`;

const CardSubtitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 4px;
`;

const SkillList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 16px;
`;

const SkillTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
`;

const SkillExample = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 2px;
  line-height: 1.4;
`;

interface Skill {
  title: string;
  example: string;
}

const SKILLS: Skill[] = [
  { title: "Call volume & trends", example: "“How many calls happened in June?”" },
  { title: "Agent performance", example: "“Who is the best agent who follows all the rules?”" },
  { title: "Team & individual coaching", example: "“What's the one thing every agent misses?”" },
  { title: "Resolution & escalations", example: "“What % of calls get resolved? Any open alerts?”" },
  { title: "Customer & agent sentiment", example: "“How often are customers upset on calls?”" },
  { title: "Issues & banking products", example: "“What are customers complaining about most?”" },
  { title: "Repeat callers", example: "“Which customers keep calling back?”" },
  { title: "Call evidence", example: "“Show me an example of a rude call.”" },
  { title: "Anything else data-related", example: "I can write a safe, read-only query for one-off questions." },
];

export function ChatSkillsSidebar() {
  return (
    <Card padding="content">
      <CardTitle>What I can help with</CardTitle>
      <CardSubtitle>Every answer is grounded in your real call data.</CardSubtitle>
      <SkillList>
        {SKILLS.map((skill) => (
          <div key={skill.title}>
            <SkillTitle>{skill.title}</SkillTitle>
            <SkillExample>{skill.example}</SkillExample>
          </div>
        ))}
      </SkillList>
    </Card>
  );
}
