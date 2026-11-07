import React from "react";

export const App: React.FC = () => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "system-ui, -apple-system, sans-serif",
      textAlign: "center",
      padding: "24px"
    }}>
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        backgroundColor: "#10B981",
        color: "#000",
        fontWeight: "900",
        fontSize: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "16px"
      }}>
        N
      </div>

      <h1 style={{ margin: "0 0 8px 0", fontSize: "22px", fontWeight: "700" }}>
        Nakraku Stash
      </h1>

      <p style={{ margin: "0 0 24px 0", color: "#94A3B8", fontSize: "14px" }}>
        Setup 1: Minimal Project Scaffold Active
      </p>

      <div style={{
        border: "1px solid #1F2937",
        borderRadius: "8px",
        backgroundColor: "#0D1117",
        padding: "16px 24px",
        fontSize: "13px",
        color: "#10B981",
        fontFamily: "monospace"
      }}>
        Ready for Task 2: High-Density Desktop UI Layout
      </div>
    </div>
  );
};
