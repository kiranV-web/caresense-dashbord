import styled, { useTheme } from "styled-components";

export type AvatarShape = "circle" | "rounded-square";

export interface AvatarProps {
  initials: string;
  tintIndex?: number;
  shape?: AvatarShape;
  size?: number;
  fontSize?: number;
}

const Wrapper = styled.div<{ $bg: string; $shape: AvatarShape; $size: number; $fontSize: number }>`
  flex: none;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $shape, theme }) => ($shape === "circle" ? theme.radii.avatarCircle : theme.radii.avatarSquare)};
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $fontSize }) => $fontSize}px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export function Avatar({
  initials,
  tintIndex = 0,
  shape = "rounded-square",
  size = 38,
  fontSize = 12.5,
}: Readonly<AvatarProps>) {
  const theme = useTheme();
  const tints = theme.colors.avatarTints;
  const bg = tints[tintIndex % tints.length];
  return (
    <Wrapper $bg={bg} $shape={shape} $size={size} $fontSize={fontSize}>
      {initials}
    </Wrapper>
  );
}
