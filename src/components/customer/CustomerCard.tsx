import styled from "styled-components";
import { ArrowUpRight } from "lucide-react";
import { Avatar } from "@/components/primitives/Avatar";
import { MiniActivityStrip } from "@/components/heatmap/MiniActivityStrip";
import type { HeatmapLevel } from "@/types/agent";
import type { CustomerSummary } from "@/types/customer";

const CustomerCardSurface = styled.button<{ $outcome: HeatmapLevel }>`
  width: 100%;
  min-height: 252px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 22px;
  text-align: left;
  overflow: hidden;
  border: 1px solid ${({ $outcome, theme }) => theme.colors.heatmap[$outcome]};
  border-left-width: 5px;
  border-radius: ${({ theme }) => theme.radii.card};
  background: ${({ $outcome, theme }) => {
    const tint = $outcome === "good" ? theme.colors.chip.green.bg
      : $outcome === "difficult" ? theme.colors.chip.amber.bg
        : $outcome === "rude" ? theme.colors.chip.red.bg
          : $outcome === "low" ? theme.colors.surface.muted : theme.colors.surface.sunken;
    return `linear-gradient(145deg, ${theme.colors.surface.card} 15%, ${tint} 145%)`;
  }};
  box-shadow: 0 5px 18px rgba(27, 28, 26, 0.07);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-3px);
      box-shadow: ${({ theme }) => theme.shadows.cardHover};
      border-color: ${({ theme }) => theme.colors.accent.green};
    }
  }

  &:active {
    transform: translateY(-1px) scale(0.995);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.interaction.focusRing},
      ${({ theme }) => theme.shadows.cardHover};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Identity = styled.div`
  min-width: 0;
  flex: 1;
`;

const IdentityLabel = styled.div`
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.faintAlt};
`;

const CallerId = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const NamesSection = styled.div`
  min-height: 59px;
  margin-top: 18px;
`;

const NamesLabel = styled.div`
  margin-bottom: 8px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.faintAlt};
`;

const Capsules = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Capsule = styled.span`
  max-width: 145px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 5px 9px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surface.muted};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 10.5px;
  font-weight: 700;
`;

const OpenIcon = styled(ArrowUpRight)`
  flex: none;
  color: ${({ theme }) => theme.colors.icon.faint};
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 14px;
  padding: 12px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.line.hairline};
  border-bottom: 1px solid ${({ theme }) => theme.colors.line.hairline};
  font-size: 11.5px;
  font-weight: 700;

  span {
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  small {
    font-size: 9.5px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.muted};
    text-transform: uppercase;
  }
`;

const HistoryLabel = styled.div`
  margin-top: auto;
  padding-top: 15px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.faintAlt};
`;

const EmptyHistory = styled.div`
  margin-top: 16px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

export function CustomerCard({ customer, onOpen }: Readonly<{
  customer: CustomerSummary; onOpen: (customer: CustomerSummary) => void;
}>) {
  return (
    <CustomerCardSurface
      type="button"
      $outcome={customer.latestOutcome}
      onClick={() => onOpen(customer)}
      aria-label={`Open call history for ${customer.name}`}
    >
      <Header>
        <Avatar initials={customer.initials} tintIndex={customer.avatarTintIndex} shape="circle" size={44} fontSize={14} />
        <Identity>
          <IdentityLabel>Caller ID</IdentityLabel>
          <CallerId>{customer.externalId}</CallerId>
        </Identity>
        <OpenIcon size={18} strokeWidth={1.7} aria-hidden="true" />
      </Header>
      <NamesSection>
        <NamesLabel>Logged names</NamesLabel>
        <Capsules title={customer.loggedNames.join(", ")}>
          {customer.loggedNames.slice(0, 3).map((name) => <Capsule key={name}>{name}</Capsule>)}
          {customer.loggedNames.length > 3 && <Capsule>+{customer.loggedNames.length - 3}</Capsule>}
          {customer.loggedNames.length === 0 && <Capsule>Name unavailable</Capsule>}
        </Capsules>
      </NamesSection>
      <Stats>
        <span>{customer.callsCount}<small>Calls</small></span>
        <span>{customer.resolvedCount}<small>Resolved</small></span>
        <span>{customer.attentionCount}<small>Review</small></span>
      </Stats>
      <HistoryLabel>Call history</HistoryLabel>
      {customer.activity.length > 0
        ? <MiniActivityStrip cells={customer.activity} variant="dots" />
        : <EmptyHistory>No calls recorded</EmptyHistory>}
    </CustomerCardSurface>
  );
}
