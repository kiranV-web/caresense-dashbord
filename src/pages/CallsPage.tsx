import { useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/primitives/Card";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { CallList } from "@/components/call/CallList";
import { useAsync } from "@/hooks/useAsync";
import { useCallsPageState } from "@/hooks/useCallsPageState";
import { listCallsPage } from "@/services/callsService";
import type { CallsFilterValue } from "@/services/callsFilterStore";

const PAGE_SIZE = 15;

const filterItems: { value: CallsFilterValue; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Resolved", label: "Resolved" },
  { value: "Improve quality", label: "Improve quality" },
  { value: "Recurring", label: "Recurring" },
  { value: "Requires review", label: "Requires review" },
  { value: "Unresolved", label: "Unresolved" },
  { value: "Analysis failed", label: "Analysis failed" },
  { value: "Dropped", label: "Dropped" },
  { value: "Rude", label: "Rude" },
];

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const Spacer = styled.div`
  flex: 1;
`;

const DropdownChip = styled.button`
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.radii.pillLg};
  background: ${({ theme }) => theme.colors.surface.card};
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 13px;
  font-weight: 700;
`;

const TableHead = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 2.6fr 52px 168px 138px 60px;
  gap: 18px;
  padding: 10px 12px;
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.text.faintAlt};
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 12px 0;
  font-size: 12.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const PageChips = styled.div`
  display: flex;
  gap: 6px;
`;

const PageChip = styled.button<{ $active?: boolean }>`
  padding: 7px 13px;
  border-radius: 12px;
  background: ${({ $active, theme }) => ($active ? theme.colors.text.primary : theme.colors.surface.muted)};
  color: ${({ $active, theme }) => ($active ? theme.colors.text.onAccent : "inherit")};
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

export function CallsPage() {
  const navigate = useNavigate();
  const [{ filter, page }, setFilter, setPage] = useCallsPageState();
  const { data: result } = useAsync(() => listCallsPage(filter, page, PAGE_SIZE), [filter, page]);

  const pageItems = result?.items ?? [];
  const total = result?.pagination.total ?? 0;
  const totalPages = Math.max(1, result?.pagination.total_pages ?? 1);

  // Backend page numbers are only known once a response comes back — if a
  // stale page number (e.g. from a shrunk result set) is now out of range,
  // snap back to the last valid page.
  useEffect(() => {
    if (result && page > totalPages) setPage(totalPages);
  }, [result, page, totalPages, setPage]);

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <Stack>
      <FilterBar>
        <SegmentedControl items={filterItems} value={filter} onChange={setFilter} variant="chips" aria-label="Filter calls" />
        <Spacer />
        <DropdownChip type="button">Agent ▾</DropdownChip>
        <DropdownChip type="button">Enquiry ▾</DropdownChip>
      </FilterBar>

      <Card padding="none" style={{ padding: "16px 26px 24px" }}>
        <TableHead>
          <span>Customer / summary</span>
          <span>Sentiment waveform</span>
          <span>Time</span>
          <span>Etiquette</span>
          <span>Status</span>
          <span />
        </TableHead>
        <CallList calls={pageItems} onOpen={(call) => navigate(
          call.kind === "recurring-group" ? `/recurring-groups/${call.id}` : `/calls/${call.id}`
        )} showActions />
        <Footer>
          <span>
            Showing {rangeStart}–{rangeEnd} of {total}
          </span>
          <PageChips>
            <PageChip type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>←</PageChip>
            <PageChip type="button" $active>{page}</PageChip>
            <PageChip type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>→</PageChip>
          </PageChips>
        </Footer>
      </Card>
    </Stack>
  );
}
