import React, { useState } from "react";

export interface AppIconProps {
  iconBase64?: string | null;
  processName: string;
  title?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const PALETTE = [
  { border: "border-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  { border: "border-cyan-500/30", text: "text-cyan-400", bg: "bg-cyan-500/10" },
  { border: "border-sky-500/30", text: "text-sky-400", bg: "bg-sky-500/10" },
  { border: "border-amber-500/30", text: "text-amber-400", bg: "bg-amber-500/10" },
  { border: "border-rose-500/30", text: "text-rose-400", bg: "bg-rose-500/10" },
  { border: "border-purple-500/30", text: "text-purple-400", bg: "bg-purple-500/10" },
];

const getInitials = (processName: string, title?: string): string => {
  const clean = processName.replace(/\.exe$/iu, "").trim();
  if (clean.length >= 2) {
    return clean.slice(0, 2).toUpperCase();
  }
  if (title && title.trim().length >= 2) {
    return title.trim().slice(0, 2).toUpperCase();
  }
  return (clean || "AP").slice(0, 2).toUpperCase();
};

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const AppIcon: React.FC<AppIconProps> = ({
  iconBase64,
  processName,
  title,
  size = "md",
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);

  const dimClass =
    size === "sm" ? "w-4 h-4 text-3xs" : size === "lg" ? "w-6 h-6 text-xs" : "w-5 h-5 text-2xs";

  if (iconBase64 && !hasError) {
    return (
      <img
        src={iconBase64}
        alt=""
        onError={() => setHasError(true)}
        className={`${dimClass} object-contain rounded-xs select-none flex-shrink-0 ${className}`}
        loading="lazy"
      />
    );
  }

  const initials = getInitials(processName, title);
  const colorIndex = hashString(processName) % PALETTE.length;
  const color = PALETTE[colorIndex];

  return (
    <div
      className={`${dimClass} rounded-xs border ${color.border} ${color.bg} ${color.text} font-mono font-bold flex items-center justify-center select-none flex-shrink-0 ${className}`}
      title={processName}
    >
      {initials}
    </div>
  );
};
