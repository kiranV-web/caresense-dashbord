import styled, { css, keyframes, useTheme } from "styled-components";
import { ProgressBar } from "@/components/primitives/ProgressBar";
import { QueueFlowTrack } from "./QueueFlowTrack";
import type { ActiveUpload, ProcessCounter } from "@/types/upload";

const ProgressBlock = styled.div`
  padding: 16px 18px;
  border-radius: ${({ theme }) => theme.radii.panelLg};
  background: ${({ theme }) => theme.colors.upload.dropzoneBg};
`;

const ProgressHead = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13.5px;
  font-weight: 800;

  span:last-child {
    color: ${({ theme }) => theme.colors.accent.green};
  }
`;

const ProgressDetail = styled.div`
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 10px;
`;

const QueueTitle = styled.div`
  margin-top: 24px;
  margin-bottom: 11px;
  font-size: 12px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.07em;
`;

const QueueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const cardSweep = keyframes`
  from { transform: translateX(-140%); }
  to { transform: translateX(360%); }
`;

const signalPulse = keyframes`
  0%, 100% { transform: scale(.85); opacity: .65; }
  50% { transform: scale(1.25); opacity: 1; }
`;

const QueueCard = styled.div<{ $active: boolean; $failed: boolean; $complete: boolean }>`
  position: relative;
  overflow: hidden;
  padding: 13px 14px;
  border-radius: ${({ theme }) => theme.radii.panelLg};
  background: ${({ $failed, $active, $complete, theme }) =>
    $failed ? theme.colors.chip.redSoft
      : $active ? theme.colors.upload.dropzoneBg
        : $complete ? theme.colors.chip.green.bg : theme.colors.surface.sunken};
  border: 1px solid ${({ $failed, $active, $complete, theme }) =>
    $failed ? theme.colors.chip.red.bg
      : $active ? theme.colors.upload.dropzoneBorder
        : $complete ? theme.colors.pastel.greenSolid : theme.colors.line.hairline};
  transition: background .35s ease, border-color .35s ease, transform .25s ease;

  &::after {
    content: "";
    display: ${({ $active }) => $active ? "block" : "none"};
    position: absolute;
    top: 0;
    bottom: 0;
    width: 28%;
    background: ${({ theme }) => theme.colors.surface.card};
    opacity: .4;
    transform: skewX(-18deg);
    animation: ${cardSweep} 2.4s ease-in-out infinite;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    &, &::after { animation: none !important; transition: none !important; }
  }
`;

const QueueName = styled.div<{ $active: boolean; $complete: boolean; $failed: boolean }>`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.muted};

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    flex: none;
    border-radius: 50%;
    background: ${({ $failed, $active, $complete, theme }) =>
      $failed ? theme.colors.chip.red.fg
        : $active ? theme.colors.accent.green
          : $complete ? theme.colors.chip.green.fg : theme.colors.line.input};
    ${({ $active }) => $active && css`animation: ${signalPulse} 1.35s ease-in-out infinite;`}
  }
`;

const QueueValue = styled.div<{ $active: boolean }>`
  margin-top: 4px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${({ $active, theme }) => $active ? theme.colors.accent.deep : theme.colors.text.primary};
  transition: color .25s ease;

  span {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const QueueMeta = styled.div<{ $failed: boolean; $complete: boolean }>`
  margin-top: 3px;
  font-size: 10.5px;
  font-weight: 700;
  color: ${({ $failed, $complete, theme }) =>
    $failed ? theme.colors.chip.red.fg : $complete ? theme.colors.chip.green.fg : theme.colors.text.faint};
`;

function queueCompleted(counter: ProcessCounter): number {
  return counter.completed ?? counter.uploaded ?? counter.processed ?? 0;
}

function QueueStatus({ name, counter }: Readonly<{ name: string; counter: ProcessCounter }>) {
  const completed = queueCompleted(counter);
  const active = (counter.active ?? 0) > 0;
  const failed = counter.failed > 0;
  const complete = completed === counter.total && counter.total > 0;
  const state = failed
    ? `${counter.failed} failed`
    : active
      ? `${counter.active} active · ${counter.queued ?? 0} queued`
      : (counter.queued ?? 0) > 0
        ? `${counter.queued} queued`
        : complete ? "Complete" : "Waiting";
  return (
    <QueueCard $active={active} $failed={failed} $complete={complete}>
      <QueueName $active={active} $complete={complete} $failed={failed}>{name}</QueueName>
      <QueueValue $active={active}>{completed}<span> / {counter.total}</span></QueueValue>
      <QueueMeta $failed={failed} $complete={complete}>{state}</QueueMeta>
    </QueueCard>
  );
}

export function ProcessingSteps({ upload }: Readonly<{ upload: ActiveUpload }>) {
  const theme = useTheme();

  return (
    <div>
      <ProgressBlock>
        <ProgressHead>
          <span>{upload.fileName}</span>
          <span>{upload.percentLabel ?? `${upload.percent}%`}</span>
        </ProgressHead>
        <div style={{ marginTop: 12 }}>
          <ProgressBar percent={upload.percent} color={theme.colors.accent.green} trackColor={theme.colors.upload.progressTrack} />
        </div>
        <ProgressDetail>{upload.detailLabel}</ProgressDetail>
      </ProgressBlock>

      {upload.batch && (
        <>
          <QueueTitle>Live queue status</QueueTitle>
          <QueueFlowTrack batch={upload.batch} />
          <QueueGrid>
            <QueueStatus name="Validation" counter={upload.batch.ingestion} />
            <QueueStatus name="Transcription" counter={upload.batch.transcription} />
            <QueueStatus name="Analysis" counter={upload.batch.analysis} />
            <QueueStatus name="Recurrence" counter={upload.batch.recurrence} />
          </QueueGrid>
        </>
      )}
    </div>
  );
}
