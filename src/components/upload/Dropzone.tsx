import styled from "styled-components";
import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export interface DropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  maxSizeLabel: string;
}

const Zone = styled.div<{ $dragging: boolean; $disabled: boolean }>`
  border: 2px dashed ${({ theme }) => theme.colors.upload.dropzoneBorder};
  border-radius: ${({ theme }) => theme.radii.panelLg};
  background: ${({ theme }) => theme.colors.upload.dropzoneBg};
  padding: 52px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.62 : 1)};
  transition: background 0.2s ease, border-color 0.2s ease;
  border-color: ${({ $dragging, theme }) => $dragging ? theme.colors.accent.green : theme.colors.upload.dropzoneBorder};
  background: ${({ $dragging, theme }) => $dragging ? theme.colors.upload.dropzoneBgHover : theme.colors.upload.dropzoneBg};

  &:hover {
    background: ${({ theme }) => theme.colors.upload.dropzoneBgHover};
  }
`;

const IconBadge = styled.div`
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.upload.iconBadgeBg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.accent.green};
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const SubText = styled.div`
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const BrowseButton = styled.span`
  margin-top: 8px;
  padding: 11px 22px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.text.primary};
  color: ${({ theme }) => theme.colors.text.onAccent};
  font-size: 13px;
  font-weight: 700;
`;

export function Dropzone({ onFileSelected, disabled = false, maxSizeLabel }: Readonly<DropzoneProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const choose = (file: File | undefined) => {
    if (!disabled && file) onFileSelected(file);
  };

  return (
    <Zone
      $dragging={dragging}
      $disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && !disabled && inputRef.current?.click()}
      onDragEnter={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => { event.preventDefault(); setDragging(false); }}
      onDrop={(event) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files[0]); }}
    >
      <IconBadge><UploadCloud size={24} strokeWidth={1.7} /></IconBadge>
      <Title>{dragging ? "Drop the ZIP to start" : "Drop recordings.zip here"}</Title>
      <SubText>MP3, WAV and their JSON metadata inside one ZIP · up to {maxSizeLabel}</SubText>
      <BrowseButton>{disabled ? "Upload in progress" : "Browse files"}</BrowseButton>
      <input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip"
        hidden
        disabled={disabled}
        onChange={(event) => {
          choose(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </Zone>
  );
}
