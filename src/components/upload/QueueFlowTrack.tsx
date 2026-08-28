import { useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import type { BatchProgress, ProcessCounter } from "@/types/upload";

const STAGE_KEYS = ["ingestion", "transcription", "analysis", "recurrence"] as const;

// 7 anchor points along the track: card0, mid(0,1), card1, mid(1,2), card2,
// mid(2,3), card3. A dot parks at a "mid" anchor when the next stage hasn't
// started on it yet (genuinely queued/waiting), or at a "card" anchor when
// that stage has started but not finished it (actively being processed).
// Either way it resumes once that stage's completed count next rises above
// the value recorded when it settled there.
const ANCHOR_PERCENT = [12.5, 25, 37.5, 50, 62.5, 75, 87.5];
const cardAnchor = (stage: number) => stage * 2;
const midAnchor = (stage: number) => stage * 2 + 1;
const LAST_STAGE = STAGE_KEYS.length - 1;

const HOP_MS = 650;
const SETTLE_FADE_MS = 1100;

const flowShimmer = keyframes`
  from { transform: translateX(-120%); }
  to { transform: translateX(320%); }
`;

const waitingPulse = keyframes`
  0%, 100% { opacity: .62; box-shadow: 0 0 0 3px currentColor; }
  50% { opacity: 1; box-shadow: 0 0 0 7px transparent; }
`;

const activePulse = keyframes`
  0%, 100% { transform: scale(.72); opacity: .85; }
  50% { transform: scale(1.15); opacity: .25; }
`;

function completedCount(counter: ProcessCounter): number {
  return counter.completed ?? counter.uploaded ?? counter.processed ?? 0;
}

interface Dot {
  id: string;
  anchor: number; // 0..6, current/target anchor index
  pendingStops: number[]; // remaining anchor indices still to visit, in order
  parkedAtStage?: number; // set once at rest, waiting on this stage (1..3)
  parkedBaseline: number; // completedCount(stage) recorded when it last settled — resumes once the live count exceeds this
  settled: boolean;
}

let dotSeq = 0;
function nextDotId(): string {
  dotSeq += 1;
  return `dot-${dotSeq}`;
}

/**
 * Builds the hop sequence for a dot leaving `fromStage`. Walks forward
 * through however many further stages already show at least one completion
 * — those get one continuous glide, no pausing at the cards in between
 * (this is a best-effort signal, not true per-file tracking, since the API
 * only exposes aggregate counts). It stops at the first stage that hasn't
 * started yet (queued — parks in the gap before it) or that started but
 * hasn't finished (processing — parks on that stage's card).
 */
function buildChain(fromStage: number, batch: BatchProgress): { stops: number[]; parkedAtStage: number; parkedBaseline: number } {
  const stops: number[] = [midAnchor(fromStage)];
  let cursor = fromStage;
  for (;;) {
    const dest = cursor + 1;
    const destCounter = batch[STAGE_KEYS[dest]];
    const destCompleted = completedCount(destCounter);
    const destStarted = (destCounter.active ?? 0) > 0 || destCompleted > 0;
    if (!destStarted) return { stops, parkedAtStage: dest, parkedBaseline: 0 };

    stops.push(cardAnchor(dest));
    if (dest >= LAST_STAGE) return { stops, parkedAtStage: dest, parkedBaseline: destCompleted };
    if (destCompleted > 0) {
      stops.push(midAnchor(dest));
      cursor = dest;
      continue;
    }
    return { stops, parkedAtStage: dest, parkedBaseline: destCompleted };
  }
}

const Track = styled.div`
  position: relative;
  height: 30px;
  margin: 0 0 8px;

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`;

const Line = styled.div`
  position: absolute;
  top: 50%;
  left: 12.5%;
  right: 12.5%;
  height: 3px;
  background: ${({ theme }) => theme.colors.line.hairline};
  transform: translateY(-50%);
  border-radius: ${({ theme }) => theme.radii.pillLg};
  overflow: hidden;
`;

const LineFill = styled.div<{ $progress: number; $moving: boolean }>`
  position: absolute;
  inset: 0 auto 0 0;
  width: ${({ $progress }) => $progress}%;
  border-radius: inherit;
  background: ${({ theme }) => theme.colors.accent.green};
  transition: width 800ms cubic-bezier(.22,.75,.2,1);
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    width: 34%;
    background: ${({ theme }) => theme.colors.pastel.greenSolid};
    opacity: ${({ $moving }) => $moving ? .72 : 0};
    animation: ${flowShimmer} 1.65s linear infinite;
  }
`;

type MarkerState = "complete" | "active" | "pending";

const Marker = styled.div<{ $left: number; $state: MarkerState }>`
  position: absolute;
  top: 50%;
  left: ${({ $left }) => $left}%;
  width: ${({ $state }) => $state === "active" ? 10 : 8}px;
  height: ${({ $state }) => $state === "active" ? 10 : 8}px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme, $state }) =>
    $state === "complete" ? theme.colors.accent.green
      : $state === "active" ? theme.colors.surface.card : theme.colors.line.input};
  border: 2px solid ${({ theme, $state }) =>
    $state === "active" ? theme.colors.accent.green : theme.colors.surface.card};
  box-shadow: 0 0 0 1px ${({ theme, $state }) =>
    $state === "pending" ? theme.colors.line.hairline : theme.colors.upload.dropzoneBorder};
  z-index: 2;

  &::after {
    content: "";
    display: ${({ $state }) => $state === "active" ? "block" : "none"};
    position: absolute;
    inset: -7px;
    border-radius: 50%;
    border: 1px solid ${({ theme }) => theme.colors.upload.dropzoneBorder};
    animation: ${activePulse} 1.8s ease-in-out infinite;
  }
`;

const Dot = styled.div<{ $left: number; $waiting: boolean; $fadeOut: boolean; $moving: boolean; $layer: number }>`
  position: absolute;
  top: 50%;
  left: ${({ $left }) => $left}%;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ theme, $waiting }) => ($waiting ? theme.colors.tone.caution.solid : theme.colors.accent.green)};
  color: ${({ theme, $waiting }) => $waiting ? theme.colors.tone.caution.solid : theme.colors.surface.card};
  box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.surface.card},
    0 2px 7px ${({ theme }) => theme.colors.accent.gradientShadow};
  opacity: ${({ $fadeOut }) => ($fadeOut ? 0 : 1)};
  transform: translate(-50%, -50%) scale(${({ $waiting }) => ($waiting ? 0.85 : 1)});
  transition: left ${HOP_MS}ms cubic-bezier(.22,.75,.2,1),
    background .25s ease, opacity ${SETTLE_FADE_MS}ms ease, transform .25s ease;
  z-index: ${({ $layer }) => 3 + $layer};
  ${({ $waiting, $moving }) => $waiting && !$moving && css`
    animation: ${waitingPulse} 1.6s ease-in-out infinite;
  `}
`;

function stageState(counter: ProcessCounter): MarkerState {
  const completed = completedCount(counter);
  if (counter.total > 0 && completed >= counter.total) return "complete";
  if ((counter.active ?? 0) > 0 || (counter.queued ?? 0) > 0 || completed > 0) return "active";
  return "pending";
}

function railProgress(batch: BatchProgress): number {
  let progress = 0;
  STAGE_KEYS.forEach((key, index) => {
    const counter = batch[key];
    const completed = completedCount(counter);
    const started = completed > 0 || (counter.active ?? 0) > 0 || (counter.queued ?? 0) > 0;
    if (!started) return;
    const stageStart = index / LAST_STAGE * 100;
    const ratio = counter.total > 0 ? Math.min(1, completed / counter.total) : 0;
    const stageEnd = index === LAST_STAGE ? 100 : (index + ratio) / LAST_STAGE * 100;
    progress = Math.max(progress, stageStart, stageEnd);
  });
  return Math.min(100, progress);
}

export function QueueFlowTrack({ batch }: Readonly<{ batch: BatchProgress | undefined }>) {
  const [dots, setDots] = useState<Dot[]>([]);
  const spawnedThroughRef = useRef(0);
  const initializedRef = useRef(false);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  function clearTimer(dotId: string) {
    const existing = timersRef.current.get(dotId);
    if (existing) clearTimeout(existing);
    timersRef.current.delete(dotId);
  }

  function scheduleAdvance(dotId: string) {
    clearTimer(dotId);
    timersRef.current.set(dotId, setTimeout(() => advanceDot(dotId), HOP_MS));
  }

  function advanceDot(dotId: string) {
    setDots((current) =>
      current.flatMap((dot) => {
        if (dot.id !== dotId || dot.pendingStops.length === 0) return [dot];
        const [nextAnchor, ...rest] = dot.pendingStops;
        const advanced: Dot = { ...dot, anchor: nextAnchor!, pendingStops: rest };
        if (rest.length > 0) {
          scheduleAdvance(dotId);
          return [advanced];
        }
        if (nextAnchor! === cardAnchor(LAST_STAGE)) {
          clearTimer(dotId);
          timersRef.current.set(
            dotId,
            setTimeout(() => setDots((cur) => cur.filter((d) => d.id !== dotId)), SETTLE_FADE_MS),
          );
          return [{ ...advanced, settled: true, parkedAtStage: undefined }];
        }
        // Parked (mid or intermediate card) — the stage it's now waiting on
        // is whichever one it's positioned at/before. parkedBaseline was
        // already set when this chain was built, so leave it as-is.
        const parkedAtStage = nextAnchor! % 2 === 1 ? (nextAnchor! + 1) / 2 : nextAnchor! / 2;
        return [{ ...advanced, parkedAtStage }];
      }),
    );
  }

  useEffect(() => {
    if (!batch) return;

    setDots((current) => {
      let next = current;

      // Resume any at-rest dot whose parked stage has moved on since it
      // settled there — either it started (queued -> active, hop onto the
      // card) or it finished (completed count rose past the baseline,
      // continue toward the next stage). Comparing against each dot's own
      // recorded baseline — rather than a diff against the previous poll —
      // means a dot that was mid-hop during the tick something changed
      // still catches up correctly on the next tick, instead of the signal
      // being lost.
      next = next.map((dot) => {
        if (dot.pendingStops.length > 0 || dot.parkedAtStage === undefined) return dot;
        const stage = dot.parkedAtStage;
        const counter = batch[STAGE_KEYS[stage]];
        const nowCompleted = completedCount(counter);

        if (dot.anchor === cardAnchor(stage) && nowCompleted > dot.parkedBaseline) {
          const { stops, parkedAtStage, parkedBaseline } = buildChain(stage, batch);
          scheduleAdvance(dot.id);
          return { ...dot, pendingStops: stops, parkedAtStage, parkedBaseline };
        }
        if (dot.anchor === midAnchor(stage - 1) && (counter.active ?? 0) > 0) {
          scheduleAdvance(dot.id);
          return { ...dot, pendingStops: [cardAnchor(stage)] };
        }
        return dot;
      });

      // Spawn new dots for Validation completions not yet accounted for.
      // Tracked against a running high-water mark rather than the previous
      // poll, so nothing is missed if several completions land between the
      // ticks this effect actually runs on.
      const ingestionCompleted = completedCount(batch.ingestion);
      if (!initializedRef.current) {
        // First snapshot ever seen: anything already complete happened
        // before we started watching — nothing to animate for it.
        initializedRef.current = true;
        spawnedThroughRef.current = ingestionCompleted;
      } else if (ingestionCompleted > spawnedThroughRef.current) {
        const spawnCount = Math.min(ingestionCompleted - spawnedThroughRef.current, 3);
        spawnedThroughRef.current = ingestionCompleted;
        const spawned: Dot[] = Array.from({ length: spawnCount }, () => {
          const { stops, parkedAtStage, parkedBaseline } = buildChain(0, batch);
          const dot: Dot = {
            id: nextDotId(),
            anchor: cardAnchor(0),
            pendingStops: stops,
            parkedAtStage,
            parkedBaseline,
            settled: false,
          };
          scheduleAdvance(dot.id);
          return dot;
        });
        next = [...next, ...spawned];
      }

      return next;
    });
    // Intentionally keyed only on `batch` — scheduleAdvance/clearTimer are
    // redefined each render but read from refs, so a fresh closure per
    // render is always current; re-running this effect for their identity
    // alone would just re-diff the same batch pointlessly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const flowing = Boolean(batch && STAGE_KEYS.some((key) =>
    (batch[key].active ?? 0) > 0 || (batch[key].queued ?? 0) > 0));

  return (
    <Track aria-hidden>
      <Line><LineFill $progress={batch ? railProgress(batch) : 0} $moving={flowing} /></Line>
      {STAGE_KEYS.map((key, index) => (
        <Marker key={key} $left={ANCHOR_PERCENT[cardAnchor(index)]!} $state={batch ? stageState(batch[key]) : "pending"} />
      ))}
      {dots.map((dot, index) => (
        <Dot
          key={dot.id}
          $left={ANCHOR_PERCENT[dot.anchor]!}
          $waiting={dot.anchor % 2 === 1}
          $fadeOut={dot.settled}
          $moving={dot.pendingStops.length > 0}
          $layer={index}
        />
      ))}
    </Track>
  );
}
