import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

  * {
    box-sizing: border-box;
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
  }

  a {
    color: ${({ theme }) => theme.colors.accent.green};
    text-decoration: none;
  }

  a:hover {
    color: ${({ theme }) => theme.colors.accent.deep};
  }

  input,
  button {
    font-family: inherit;
  }

  button {
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: #d5d2cb;
    border-radius: 4px;
  }
`;
