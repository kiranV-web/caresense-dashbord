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
  gap: 4px;
  margin-top: 16px;
`;

const SkillButton = styled.button<{ $disabled: boolean }>`
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px;
  margin: -8px;
  border-radius: ${({ theme }) => theme.radii.panel};
  transition: background 0.18s ease, transform 0.18s ease;
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};

  @media (hover: hover) {
    &:hover {
      background: ${({ $disabled, theme }) => ($disabled ? "transparent" : theme.colors.surface.hover)};
      transform: ${({ $disabled }) => ($disabled ? "none" : "translateX(2px)")};
    }
  }
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
  /** Literal text sent to the chat agent on click. */
  prompt: string;
  /** Quoted display text — may differ from prompt for readability. */
  example: string;
}

const SKILLS: Skill[] = [
  { title: "Call volume & trends", prompt: "How many calls happened in June?", example: "“How many calls happened in June?”" },
  { title: "Agent performance", prompt: "Who is the best agent who follows all the rules?", example: "“Who is the best agent who follows all the rules?”" },
  { title: "Team & individual coaching", prompt: "What's the one thing every agent misses?", example: "“What's the one thing every agent misses?”" },
  { title: "Resolution & escalations", prompt: "What % of calls get resolved? Any open alerts?", example: "“What % of calls get resolved? Any open alerts?”" },
  { title: "What needs my attention", prompt: "What needs my attention today?", example: "“What needs my attention today?”" },
  { title: "Customer & agent sentiment", prompt: "How often are customers upset on calls?", example: "“How often are customers upset on calls?”" },
  { title: "Issues, products & devices", prompt: "What are customers complaining about most, and on which devices?", example: "“What are customers complaining about most, and on which devices?”" },
  { title: "Repeat callers", prompt: "Which customers keep calling back?", example: "“Which customers keep calling back?”" },
  { title: "Call & customer lookup", prompt: "Show me an example of a rude call.", example: "“Show me an example of a rude call” or a specific customer/call." },
  { title: "Data overview", prompt: "How much call data do we have, and is it all processed?", example: "“How much call data do we have, and is it all processed?”" },
  { title: "Anything else data-related", prompt: "", example: "I can write a safe, read-only query for one-off questions." },
];

export interface ChatSkillsSidebarProps {
  onSelectSkill: (prompt: string) => void;
  disabled?: boolean;
}

export function ChatSkillsSidebar({ onSelectSkill, disabled = false }: Readonly<ChatSkillsSidebarProps>) {
  return (
    <Card padding="content">
      <CardTitle>What I can help with</CardTitle>
      <CardSubtitle>Every answer is grounded in your real call data. Click one to ask it.</CardSubtitle>
      <SkillList>
        {SKILLS.map((skill) => {
          const clickable = skill.prompt.length > 0;
          return (
            <SkillButton
              key={skill.title}
              type="button"
              $disabled={disabled || !clickable}
              disabled={disabled || !clickable}
              onClick={() => clickable && onSelectSkill(skill.prompt)}
            >
              <SkillTitle>{skill.title}</SkillTitle>
              <SkillExample>{skill.example}</SkillExample>
            </SkillButton>
          );
        })}
      </SkillList>
    </Card>
  );
}
