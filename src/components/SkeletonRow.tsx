import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  circle = false,
  className = "",
  style,
  ...restProps
}) => {
  const shapeClass = circle ? "rounded-full" : "rounded-xs";
  return (
    <div
      className={`animate-pulse bg-bg-elevated/80 border border-border-subtle/30 ${shapeClass} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      aria-hidden="true"
      {...restProps}
    />
  );
};

export interface SkeletonRowProps {
  size?: "sm" | "md" | "lg";
  hasIcon?: boolean;
  hasDescription?: boolean;
  hasMeta?: boolean;
  hasActions?: boolean;
  titleWidth?: string;
  descWidth?: string;
  metaWidth?: string;
  className?: string;
}

const resolveHeightClass = (size: "sm" | "md" | "lg"): string => {
  switch (size) {
    case "sm":
      return "h-row-sm";
    case "lg":
      return "h-row-lg";
    case "md":
    default:
      return "h-row";
  }
};

export const SkeletonRow: React.FC<SkeletonRowProps> = ({
  size = "md",
  hasIcon = true,
  hasDescription = false,
  hasMeta = true,
  hasActions = false,
  titleWidth = "45%",
  descWidth = "28%",
  metaWidth = "48px",
  className = "",
}) => {
  const heightClass = resolveHeightClass(size);

  return (
    <div
      role="progressbar"
      aria-label="Loading row"
      className={`flex items-center w-full px-sm gap-xs select-none border-l-2 border-l-transparent ${heightClass} ${className}`}
    >
      {hasIcon && <Skeleton className="w-4 h-4 shrink-0" />}
      <div className="flex flex-col justify-center min-w-0 flex-1 gap-1">
        <Skeleton height="11px" width={titleWidth} />
        {hasDescription && <Skeleton height="9px" width={descWidth} />}
      </div>
      {hasMeta && <Skeleton height="14px" width={metaWidth} />}
      {hasActions && <Skeleton className="w-4 h-4 shrink-0" />}
    </div>
  );
};

const SKELETON_PRESETS = [
  { title: "52%", desc: "30%", meta: "52px" },
  { title: "68%", desc: "40%", meta: "44px" },
  { title: "38%", desc: "24%", meta: "60px" },
  { title: "58%", desc: "34%", meta: "48px" },
  { title: "44%", desc: "28%", meta: "56px" },
];

export interface SkeletonListProps extends SkeletonRowProps {
  count?: number;
  separator?: boolean;
  listClassName?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  separator = true,
  listClassName = "",
  ...rowProps
}) => {
  const rows = Array.from({ length: count }, (_, i) => i);
  const separatorClass = separator ? "divide-y divide-border-subtle/20" : "";

  return (
    <div
      role="status"
      aria-label="Loading list content"
      className={`w-full flex flex-col ${separatorClass} ${listClassName}`}
    >
      {rows.map((index) => {
        const preset = SKELETON_PRESETS[index % SKELETON_PRESETS.length];
        return (
          <SkeletonRow
            key={index}
            {...rowProps}
            titleWidth={rowProps.titleWidth ?? preset.title}
            descWidth={rowProps.descWidth ?? preset.desc}
            metaWidth={rowProps.metaWidth ?? preset.meta}
          />
        );
      })}
    </div>
  );
};
