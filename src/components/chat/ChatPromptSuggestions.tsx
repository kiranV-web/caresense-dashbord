import styled from "styled-components";

const Row = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Chip = styled.button`
  padding: 8px 15px;
  border-radius: ${({ theme }) => theme.radii.panelLg};
  background: ${({ theme }) => theme.colors.surface.muted};
  font-size: 12.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid transparent;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
    border-color: ${({ theme }) => theme.colors.line.input};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

export interface ChatPromptSuggestionsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
}

export function ChatPromptSuggestions({ prompts, onSelect }: Readonly<ChatPromptSuggestionsProps>) {
  return (
    <Row>
      {prompts.map((prompt) => (
        <Chip key={prompt} type="button" onClick={() => onSelect(prompt)}>
          {prompt}
        </Chip>
      ))}
    </Row>
  );
}
