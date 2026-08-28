import styled, { useTheme } from "styled-components";
import type { ChatMessage } from "@/types/chat";

const Wrap = styled.div<{ $align: string }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $align }) => $align};
  gap: 5px;
`;

const Label = styled.span`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.faintAlt};
`;

const Bubble = styled.div<{ $bg: string; $fg: string; $maxWidth: string }>`
  max-width: ${({ $maxWidth }) => $maxWidth};
  border-radius: ${({ theme }) => theme.radii.panelLg};
  padding: 13px 17px;
  font-size: 13.5px;
  line-height: 1.6;
  font-weight: 500;
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
`;

export function ChatMessageBubble({ message }: Readonly<{ message: ChatMessage }>) {
  const theme = useTheme();
  const isUser = message.author === "user";
  return (
    <Wrap $align={isUser ? "flex-end" : "flex-start"}>
      <Label>{isUser ? "You" : "Agent"}</Label>
      <Bubble
        $bg={isUser ? theme.colors.chat.userBubbleBg : theme.colors.chat.agentBubbleBg}
        $fg={isUser ? theme.colors.chat.userBubbleFg : theme.colors.chat.agentBubbleFg}
        $maxWidth={isUser ? "64%" : "78%"}
      >
        {message.text}
      </Bubble>
    </Wrap>
  );
}
