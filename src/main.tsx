import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";  // Add .tsx extension
import "./index.css";

console.log("Main.tsx starting...");

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  console.log("Creating React root...");
  const root = ReactDOM.createRoot(rootElement);
  
  console.log("Rendering App...");
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log("App rendered successfully!");
} catch (error) {
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="padding: 40px; color: red; font-family: monospace;">
      <h1>Render Error</h1>
      <pre>${error}</pre>
    </div>
  `;
}
