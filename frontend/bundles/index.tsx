import { AuthProvider } from "../src/hooks/useAuth";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "../src/App";
import reportWebVitals from "../src/reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../src/theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* CRA: Wrap */}
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
      {/* CRA: Unwrap */}
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
