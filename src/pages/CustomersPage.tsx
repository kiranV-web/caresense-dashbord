import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { CustomerCard } from "@/components/customer/CustomerCard";
import { Card } from "@/components/primitives/Card";
import { useAsync } from "@/hooks/useAsync";
import { listCustomers } from "@/services/customersService";

const PAGE_SIZE = 12;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const Toolbar = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 22px;
`;

const Intro = styled.div`
  font-size: 13px;
  font-weight: 650;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const SearchBox = styled.label`
  width: min(360px, 42vw);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 13px;
  border: 1px solid ${({ theme }) => theme.colors.line.input};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surface.sunken};
  color: ${({ theme }) => theme.colors.text.muted};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.accent.green};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.interaction.focusRing};
  }
`;

const SearchInput = styled.input`
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font: inherit;
  font-size: 13px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 22px;
  padding: 2px;

  @media (max-width: 1050px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Message = styled(Card)`
  padding: 38px;
  text-align: center;
  font-size: 13px;
  font-weight: 650;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Pager = styled.div`
  display: flex;
  gap: 6px;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  min-width: 34px;
  padding: 7px 13px;
  border-radius: 12px;
  background: ${({ $active, theme }) => ($active ? theme.colors.text.primary : theme.colors.surface.card)};
  color: ${({ $active, theme }) => ($active ? theme.colors.text.onAccent : theme.colors.text.muted)};
  cursor: pointer;

  &:disabled { cursor: not-allowed; opacity: 0.45; }
`;

export function CustomersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, loading, error } = useAsync(() => listCustomers(page, PAGE_SIZE, search), [page, search]);
  const totalPages = Math.max(1, data?.pagination.totalPages ?? 1);

  return (
    <Stack>
      <Toolbar padding="none">
        <Intro>{data?.pagination.total ?? 0} customers with recorded call history</Intro>
        <SearchBox>
          <Search size={17} strokeWidth={1.8} aria-hidden="true" />
          <SearchInput
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Search caller ID or logged name"
            aria-label="Search customers"
          />
        </SearchBox>
      </Toolbar>

      {loading && !data && <Message>Loading customers…</Message>}
      {error && <Message>Unable to load customers: {error.message}</Message>}
      {!loading && !error && data?.items.length === 0 && <Message>No customers match this search.</Message>}
      {data && data.items.length > 0 && (
        <>
          <Grid>
            {data.items.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} onOpen={() => navigate(`/customers/${customer.id}`)} />
            ))}
          </Grid>
          <Footer>
            <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.pagination.total)} of {data.pagination.total}</span>
            <Pager>
              <PageButton type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>←</PageButton>
              <PageButton type="button" $active>{page}</PageButton>
              <PageButton type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>→</PageButton>
            </Pager>
          </Footer>
        </>
      )}
    </Stack>
  );
}
