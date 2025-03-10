import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/themes.css";
import { BrowserRouter } from "react-router-dom";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

// Function to get theme color based on theme ID and color type
const getThemeColor = (themeId: string, colorType: "primary" | "secondary" | "accent"): string => {
  const colorMap = {
    professional: {
      primary: "#2563eb",
      secondary: "#4b5563",
      accent: "#0d9488"
    },
    modern: {
      primary: "#8b5cf6",
      secondary: "#ec4899",
      accent: "#6366f1"
    },
    classic: {
      primary: "#1f2937",
      secondary: "#4b5563",
      accent: "#d97706"
    },
    dark: {
      primary: "#3b82f6",
      secondary: "#1f2937",
      accent: "#3b82f6"
    },
    light: {
      primary: "#3b82f6",
      secondary: "#f3f4f6",
      accent: "#3b82f6"
    },
    education: {
      primary: "#16a34a",
      secondary: "#2563eb",
      accent: "#eab308"
    }
  };
  
  return colorMap[themeId as keyof typeof colorMap]?.[colorType] || "";
};

// Initialize theme from localStorage
const initializeTheme = () => {
  // Default theme is blue, default font size is medium
  const savedTheme = localStorage.getItem("tebase-theme") || "blue";
  const savedFontSize = localStorage.getItem("tebase-font-size") || "medium";
  
  try {
    // Remove any existing theme classes
    document.documentElement.classList.remove(
      "theme-dark",
      "theme-blue",
      "theme-green",
      "theme-purple"
    );
    
    // Apply theme class to html element
    document.documentElement.classList.add(`theme-${savedTheme}`);
    
    // Remove any existing font size classes
    document.documentElement.classList.remove(
      "text-size-small",
      "text-size-medium",
      "text-size-large"
    );
    
    // Apply font size
    document.documentElement.classList.add(`text-size-${savedFontSize}`);
    
    // Store in localStorage if not already there
    if (!localStorage.getItem("tebase-theme")) {
      localStorage.setItem("tebase-theme", savedTheme);
    }
    
    if (!localStorage.getItem("tebase-font-size")) {
      localStorage.setItem("tebase-font-size", savedFontSize);
    }
    
    console.log("Theme initialized:", savedTheme, "Font size:", savedFontSize);
  } catch (error) {
    console.error("Error initializing theme:", error);
  }
};

// Apply theme before rendering
initializeTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
