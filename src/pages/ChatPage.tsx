import { useEffect, useState } from "react";
import styled from "styled-components";
import { ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/primitives/Card";
import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { ChatTypingIndicator } from "@/components/chat/ChatTypingIndicator";
import { ReferencedCallsBlock } from "@/components/chat/ReferencedCallCard";
import { ChatPromptSuggestions } from "@/components/chat/ChatPromptSuggestions";
import { ChatSkillsSidebar } from "@/components/chat/ChatSkillsSidebar";
import { useAsync } from "@/hooks/useAsync";
import { getChatThread, sendMessage } from "@/services/chatService";
import type { ChatMessage, ReferencedCall } from "@/types/chat";

const THINKING_STEPS = ["Thinking", "Checking call records", "Crunching the numbers", "Putting together an answer"];

function useThinkingStatus(active: boolean): string {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active) return;
    const resetTimer = window.setTimeout(() => setStep(0), 0);
    const timer = setInterval(() => setStep((prev) => (prev + 1) % THINKING_STEPS.length), 1800);
    return () => {
      window.clearTimeout(resetTimer);
      clearInterval(timer);
    };
  }, [active]);
  return active ? THINKING_STEPS[step]! : THINKING_STEPS[0]!;
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.95fr 1fr;
  gap: ${({ theme }) => theme.spacing.stackGap};
  align-items: start;
`;

const ConversationCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.stackGap};
  min-height: 560px;
`;

const Messages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
`;

const SidebarStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const Composer = styled.form`
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.surface.sunken};
  border: 1.5px solid ${({ theme }) => theme.colors.surface.mutedAlt};
  padding: 8px 8px 8px 20px;
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;

  &:focus-within {
    background: ${({ theme }) => theme.colors.surface.card};
    border-color: ${({ theme }) => theme.colors.interaction.focusOutline};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.interaction.focusRing};
  }
`;

const ComposerInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SendButton = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.text.primary};
  color: ${({ theme }) => theme.colors.text.onAccent};
  transition: background 0.18s ease, transform 0.18s ease, opacity 0.18s ease;

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.accent.deep};
      transform: translateY(-1px);
    }
  }

  &:active:not(:disabled) {
    transform: scale(0.94);
  }

  &:disabled {
    opacity: 0.45;
  }
`;

export function ChatPage() {
  const navigate = useNavigate();
  const { data: thread, loading } = useAsync(getChatThread, []);
  const [extraMessages, setExtraMessages] = useState<ChatMessage[]>([]);
  const [referencedCalls, setReferencedCalls] = useState<ReferencedCall[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const thinkingStatus = useThinkingStatus(sending);

  async function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const userMessage: ChatMessage = { id: `local-${Date.now()}`, author: "user", text: trimmed };
    setExtraMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setSending(true);
    try {
      const reply = await sendMessage(trimmed);
      setExtraMessages((prev) => [...prev, reply.message]);
      if (reply.referencedCalls.length > 0) {
        setReferencedCalls((prev) => {
          const seen = new Set(prev.map((call) => call.callId));
          return [...prev, ...reply.referencedCalls.filter((call) => !seen.has(call.callId))];
        });
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Something went wrong answering that.";
      setExtraMessages((prev) => [...prev, { id: `error-${Date.now()}`, author: "agent", text: message }]);
    } finally {
      setSending(false);
    }
  }

  if (loading || !thread) return <div>Loading…</div>;

  const messages = [...thread.messages, ...extraMessages];

  return (
    <Grid>
      <ConversationCard padding="wide">
        <Messages>
          {messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}
          {sending && <ChatTypingIndicator statusText={thinkingStatus} />}
          {referencedCalls.length > 0 && (
            <ReferencedCallsBlock calls={referencedCalls} onOpen={(call) => navigate(`/calls/${call.callId}`)} />
          )}
        </Messages>

        <ChatPromptSuggestions prompts={thread.promptSuggestions} onSelect={(prompt) => void submit(prompt)} />

        <Composer
          onSubmit={(e) => {
            e.preventDefault();
            void submit(draft);
          }}
        >
          <ComposerInput
            placeholder="Ask about a call, an agent or a device…"
            value={draft}
            disabled={sending}
            onChange={(e) => setDraft(e.target.value)}
          />
          <SendButton type="submit" aria-label="Send" disabled={sending}>
            <ArrowUp size={16} strokeWidth={2} />
          </SendButton>
        </Composer>
      </ConversationCard>

      <SidebarStack>
        <ChatSkillsSidebar />
      </SidebarStack>
    </Grid>
  );
}
