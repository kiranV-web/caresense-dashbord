import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { CallList } from "@/components/call/CallList";
import { Avatar } from "@/components/primitives/Avatar";
import { Card } from "@/components/primitives/Card";
import { useAsync } from "@/hooks/useAsync";
import { getCustomer } from "@/services/customersService";
import { formatDurationLong } from "@/utils/formatters";

const PAGE_SIZE = 15;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const CustomerHeader = styled(Card)`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const BackButton = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.colors.surface.muted};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
`;

const Identity = styled.div`
  min-width: 0;
  flex: 1;
`;

const CustomerName = styled.div`
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.03em;
`;

const CustomerId = styled.div`
  margin-top: 3px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const LoggedNames = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 9px;
`;

const NameCapsule = styled.span`
  padding: 5px 9px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surface.muted};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 10.5px;
  font-weight: 700;
`;

const Kpis = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const KpiValue = styled.div`
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.035em;
`;

const KpiLabel = styled.div`
  margin-top: 5px;
  font-size: 12.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
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

const PageButton = styled.button`
  margin-left: 6px;
  min-width: 34px;
  padding: 7px 13px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface.muted};
  color: inherit;
  cursor: pointer;

  &:disabled { cursor: not-allowed; opacity: 0.45; }
`;

const Message = styled(Card)`
  padding: 38px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
`;

export function CustomerDetailPage() {
  const { customerId = "" } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data: customer, loading, error } = useAsync(
    () => getCustomer(customerId, page, PAGE_SIZE), [customerId, page],
  );
  const totalPages = Math.max(1, customer?.pagination.totalPages ?? 1);
  if (loading && !customer) return <Message>Loading customer call history…</Message>;
  if (error || !customer) return <Message>Unable to load this customer’s call history.</Message>;

  const rangeStart = customer.pagination.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, customer.pagination.total);
  return (
    <Stack>
      <CustomerHeader>
        <BackButton type="button" onClick={() => navigate("/customers")} aria-label="Back to customers">
          <ArrowLeft size={18} strokeWidth={1.8} />
        </BackButton>
        <Avatar initials={customer.initials} tintIndex={customer.avatarTintIndex} shape="circle" size={48} fontSize={15} />
        <Identity>
          <CustomerName>Caller {customer.externalId}</CustomerName>
          <CustomerId>Caller ID</CustomerId>
          <LoggedNames>
            {customer.loggedNames.map((name) => <NameCapsule key={name}>{name}</NameCapsule>)}
            {customer.loggedNames.length === 0 && <NameCapsule>Name unavailable</NameCapsule>}
          </LoggedNames>
        </Identity>
      </CustomerHeader>

      <Kpis>
        <Card padding="kpi"><KpiValue>{customer.callsCount}</KpiValue><KpiLabel>Total calls</KpiLabel></Card>
        <Card padding="kpi"><KpiValue>{customer.resolvedCount}</KpiValue><KpiLabel>Resolved</KpiLabel></Card>
        <Card padding="kpi"><KpiValue>{customer.attentionCount}</KpiValue><KpiLabel>Needs review</KpiLabel></Card>
        <Card padding="kpi"><KpiValue>{formatDurationLong(customer.totalDurationSeconds)}</KpiValue><KpiLabel>Total talk time</KpiLabel></Card>
      </Kpis>

      <Card padding="none" style={{ padding: "16px 26px 24px" }}>
        <TableHead>
          <span>Customer / summary</span><span>Sentiment waveform</span><span>Time</span>
          <span>Etiquette</span><span>Status</span><span />
        </TableHead>
        <CallList
          calls={customer.calls}
          onOpen={(call) => navigate(`/calls/${call.id}`)}
          showActions
          emptyMessage="No calls recorded for this customer."
        />
        <Footer>
          <span>Showing {rangeStart}–{rangeEnd} of {customer.pagination.total}</span>
          <span>
            <PageButton type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>←</PageButton>
            <PageButton type="button" disabled>{page}</PageButton>
            <PageButton type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>→</PageButton>
          </span>
        </Footer>
      </Card>
    </Stack>
  );
}
