import React from "react";

export const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bg-base text-text-primary font-ui p-lg select-none">
      <div className="w-12 h-12 rounded-md bg-accent-emerald text-bg-base font-bold text-lg flex items-center justify-center mb-base shadow-sm">
        N
      </div>

      <h1 className="text-base font-bold tracking-tight mb-2xs">
        Nakraku Stash
      </h1>

      <p className="text-xs text-text-secondary mb-lg">
        High-Density RAM-Freeze Session Utility
      </p>

      <div className="border border-border-subtle rounded-sm bg-bg-surface px-base py-sm text-xs text-accent-emerald font-mono">
        Tailwind CSS + Design Tokens Initialized
      </div>
    </div>
  );
};
