import styled from "styled-components";
import type { ChatTable } from "@/types/chat";

const Wrap = styled.div`
  border-radius: ${({ theme }) => theme.radii.panelLg};
  background: ${({ theme }) => theme.colors.surface.sunken};
  padding: 16px 18px;
  max-width: 100%;
`;

const Caption = styled.div`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.faintAlt};
  margin-bottom: 12px;
`;

const ScrollArea = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const HeaderRow = styled.tr`
  background: ${({ theme }) => theme.colors.surface.muted};
`;

const HeaderCell = styled.th<{ $align: "left" | "right" }>`
  text-align: ${({ $align }) => $align};
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.faintAlt};
  white-space: nowrap;

  &:first-child {
    border-radius: ${({ theme }) => theme.radii.panel} 0 0 ${({ theme }) => theme.radii.panel};
  }
  &:last-child {
    border-radius: 0 ${({ theme }) => theme.radii.panel} ${({ theme }) => theme.radii.panel} 0;
  }
`;

const BodyRow = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.line.hairline};
  }
`;

const BodyCell = styled.td<{ $align: "left" | "right" }>`
  text-align: ${({ $align }) => $align};
  padding: 9px 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;

  &:first-child {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

function isNumericColumn(rows: string[][], columnIndex: number): boolean {
  if (rows.length === 0) return false;
  return rows.every((row) => {
    const value = row[columnIndex] ?? "";
    return /^-?[\d,.]+%?$/.test(value.trim());
  });
}

export function ChatDataTable({ table }: Readonly<{ table: ChatTable }>) {
  const alignments: Array<"left" | "right"> = table.columns.map((_, index) =>
    isNumericColumn(table.rows, index) ? "right" : "left");

  return (
    <Wrap>
      <Caption>{table.title}</Caption>
      <ScrollArea>
        <Table>
          <thead>
            <HeaderRow>
              {table.columns.map((column, index) => (
                <HeaderCell key={column} $align={alignments[index]!}>{column}</HeaderCell>
              ))}
            </HeaderRow>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              // eslint-disable-next-line react/no-array-index-key -- rows are plain string tuples with no stable id
              <BodyRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  // eslint-disable-next-line react/no-array-index-key -- cells are plain strings with no stable id
                  <BodyCell key={cellIndex} $align={alignments[cellIndex]!}>{cell}</BodyCell>
                ))}
              </BodyRow>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    </Wrap>
  );
}
