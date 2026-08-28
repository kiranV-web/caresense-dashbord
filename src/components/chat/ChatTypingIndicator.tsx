import styled, { keyframes } from "styled-components";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
`;

const Label = styled.span`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.faintAlt};
`;

const Bubble = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  max-width: 78%;
  border-radius: ${({ theme }) => theme.radii.panelLg};
  padding: 13px 17px;
  font-size: 13px;
  font-weight: 600;
  background: ${({ theme }) => theme.colors.chat.agentBubbleBg};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40% { transform: translateY(-3px); opacity: 1; }
`;

const Dots = styled.span`
  display: inline-flex;
  gap: 3px;
`;

const Dot = styled.span<{ $delayMs: number }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  animation: ${bounce} 1.1s ease-in-out infinite;
  animation-delay: ${({ $delayMs }) => $delayMs}ms;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.7;
  }
`;

export function ChatTypingIndicator({ statusText = "Thinking" }: Readonly<{ statusText?: string }>) {
  return (
    <Wrap>
      <Label>Agent</Label>
      <Bubble>
        {statusText}
        <Dots aria-hidden>
          <Dot $delayMs={0} />
          <Dot $delayMs={150} />
          <Dot $delayMs={300} />
        </Dots>
      </Bubble>
    </Wrap>
  );
}
