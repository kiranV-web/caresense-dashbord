import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { theme } from "@/theme/theme";
import { GlobalStyle } from "@/theme/GlobalStyle";
import { DesktopOnlyGate } from "@/components/layout/DesktopOnlyGate";
import { AppRoutes } from "./routes";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <DesktopOnlyGate>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DesktopOnlyGate>
    </ThemeProvider>
  );
}
