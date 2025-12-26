import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  // Fallback UI in case of critical error
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-center: center; min-height: 100vh; padding: 20px; font-family: system-ui;">
      <div style="text-align: center;">
        <h1 style="color: #ef4444; margin-bottom: 16px;">Application Error</h1>
        <p style="color: #6b7280; margin-bottom: 8px;">Something went wrong while loading the application.</p>
        <p style="color: #6b7280; font-size: 14px;">Please refresh the page or contact support if the problem persists.</p>
        <pre style="margin-top: 16px; padding: 16px; background: #f3f4f6; border-radius: 8px; font-size: 12px; text-align: left; max-width: 600px; overflow: auto;">
${error}
        </pre>
      </div>
    </div>
  `;
}