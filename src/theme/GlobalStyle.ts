import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    color-scheme: light;
    scrollbar-color: ${({ theme }) => theme.colors.interaction.scrollbar} transparent;
  }

  html, body, #root {
    height: 100%;
  }

  body {
    margin: 0;
    background: ${({ theme }) => theme.colors.bg.app};
    font-family: ${({ theme }) => theme.fontFamily};
    color: ${({ theme }) => theme.colors.text.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    line-height: 1.5;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.tone.mild.solid};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  a {
    color: ${({ theme }) => theme.colors.accent.green};
    text-decoration: none;
  }

  a:hover {
    color: ${({ theme }) => theme.colors.accent.deep};
  }

  input,
  button,
  textarea,
  select {
    font-family: inherit;
  }

  input::placeholder,
  textarea::placeholder {
    color: ${({ theme }) => theme.colors.text.faint};
    opacity: 1;
  }

  button {
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.interaction.focusOutline};
    outline-offset: 3px;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.interaction.scrollbar};
    border: 2px solid transparent;
    background-clip: padding-box;
    border-radius: ${({ theme }) => theme.radii.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.interaction.scrollbarHover};
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
