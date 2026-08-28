import styled from "styled-components";
import type { ReactNode } from "react";
import { PageContainer, PageInner } from "./PageContainer";
import { Header, type AppMode } from "./Header";

export interface AppShellProps {
  title: string;
  subtitle: string;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  sidebar?: ReactNode;
  children: ReactNode;
}

const BodyRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sidebarToContent};
  align-items: flex-start;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

export function AppShell({ title, subtitle, mode, onModeChange, sidebar, children }: Readonly<AppShellProps>) {
  return (
    <PageContainer>
      <PageInner>
        <Header title={title} subtitle={subtitle} mode={mode} onModeChange={onModeChange} />
        <BodyRow>
          {sidebar}
          <Content>{children}</Content>
        </BodyRow>
      </PageInner>
    </PageContainer>
  );
}
