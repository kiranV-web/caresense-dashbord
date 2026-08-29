import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Play, Pause } from "lucide-react";
import { SentimentWaveform } from "./SentimentWaveform";
import { SentimentChip } from "@/components/status/SentimentChip";
import type { CallDetail, SentimentChipEvent } from "@/types/call";
import { formatDurationShort, parseTimestampLabel } from "@/utils/formatters";

export interface AudioPlayerWaveformProps {
  call: CallDetail;
}

const PlayerHead = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const PlayButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.text.primary};
  color: ${({ theme }) => theme.colors.text.onAccent};
  transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accent.deep};
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.94);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.interaction.focusRing};
  }
`;

const TimeLabel = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};

  span {
    color: ${({ theme }) => theme.colors.text.faintAlt};
    font-weight: 700;
  }
`;

const Ruler = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 11.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.faintAlt};
`;

function rulerLabelsFor(durationSeconds: number) {
  return [0, 0.25, 0.5, 0.75, 1].map((f) => formatDurationShort(durationSeconds * f));
}

/**
 * A plain native <audio> element, driven by its own standard events. The
 * backend's audio endpoint supports HTTP byte-range requests, so streaming
 * a URL directly like this loads faster and seeks better than fetching the
 * whole file as a blob first.
 */
export function AudioPlayerWaveform({ call }: Readonly<AudioPlayerWaveformProps>) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [realDuration, setRealDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setRealDuration(audio.duration);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, []);

  // Two timelines: the call's declared duration (what labels/ruler/sentiment
  // timestamps are expressed in, and what the header shows) vs. the audio
  // file's real duration (what the <audio> element itself reports). They
  // usually match, but seeks/labels are computed as a fraction and
  // re-projected onto the call's timeline in case they ever drift.
  const callDuration = call.durationSeconds;
  const audioDuration = realDuration || callDuration;
  const playedFraction = audioDuration ? currentTime / audioDuration : 0;

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => undefined);
    else audio.pause();
  }

  function seekToFraction(fraction: number) {
    const audio = audioRef.current;
    if (!audio || !audioDuration) return;
    const nextTime = fraction * audioDuration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
    // Seeking (a waveform bar or a sentiment chip) jumps straight into
    // playback at that moment rather than just moving the cursor.
    audio.play().catch(() => undefined);
  }

  function seekToLabel(label: string) {
    seekToFraction(parseTimestampLabel(label) / callDuration);
  }

  return (
    <div>
      {/* Audio engine, not a user-facing media player — the visible bars,
          ruler and transcript are the actual UI, so there's no separate
          caption track to attach. Visually hidden via clipping rather than
          display:none — some browsers deprioritise or refuse to load
          display:none media elements, which silently breaks playback. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={call.audioUrl}
        preload="metadata"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
      />

      <PlayerHead>
        <PlayButton type="button" onClick={togglePlayback} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
        </PlayButton>
        <TimeLabel>
          {formatDurationShort(playedFraction * callDuration)} <span>/ {formatDurationShort(callDuration)}</span>
        </TimeLabel>
      </PlayerHead>

      {/* progressFraction gives a "reveal as it plays" effect — bars ahead
          of the playhead sit at reduced opacity, already-played bars show
          their real colour. Tuned subtle (not the old 0.4) so the resting
          state still reads close to the Home/Calls preview's full colour. */}
      <div style={{ marginTop: 18 }}>
        <SentimentWaveform
          seed={call.waveSeed}
          spans={call.sentimentSpans}
          size="lg"
          progressFraction={playedFraction}
          onSeek={seekToFraction}
        />
      </div>

      <Ruler>
        {rulerLabelsFor(callDuration).map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </Ruler>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        {call.sentimentEvents.map((event) => (
          <SentimentEventChip key={event.timestampLabel + event.label} event={event} onSeek={seekToLabel} />
        ))}
      </div>
    </div>
  );
}

function SentimentEventChip({ event, onSeek }: Readonly<{ event: SentimentChipEvent; onSeek: (label: string) => void }>) {
  return (
    <SentimentChip
      timestampLabel={event.timestampLabel}
      label={event.label}
      tone={event.tone}
      onClick={() => onSeek(event.timestampLabel)}
    />
  );
}
