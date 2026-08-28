import styled from "styled-components";
import { Avatar } from "@/components/primitives/Avatar";
import type { ReferencedCall } from "@/types/chat";

const Wrap = styled.div`
  border-radius: ${({ theme }) => theme.radii.panelLg};
  background: ${({ theme }) => theme.colors.surface.sunken};
  padding: 16px 18px;
`;

const Caption = styled.div`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.faintAlt};
  margin-bottom: 12px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Row = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  font-weight: 700;
  width: 100%;
  text-align: left;
`;

const Summary = styled.span`
  flex: 1;
`;

const Duration = styled.span`
  color: ${({ theme }) => theme.colors.text.faintAlt};
`;

export interface ReferencedCallsBlockProps {
  calls: ReferencedCall[];
  onOpen: (call: ReferencedCall) => void;
}

export function ReferencedCallsBlock({ calls, onOpen }: Readonly<ReferencedCallsBlockProps>) {
  return (
    <Wrap>
      <Caption>Referenced calls</Caption>
      <List>
        {calls.map((call) => (
          <Row key={call.id} type="button" onClick={() => onOpen(call)}>
            <Avatar initials={call.initials} tintIndex={3} shape="rounded-square" size={28} fontSize={11} />
            <Summary>{call.summary}</Summary>
            <Duration>{call.durationLabel}</Duration>
          </Row>
        ))}
      </List>
    </Wrap>
  );
}
