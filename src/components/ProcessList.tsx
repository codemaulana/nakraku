import React from "react";
import { Row } from "./Row";
import { Icon } from "./Icon";
import { Tooltip } from "./Tooltip";
import { Button } from "./Button";
import { Badge } from "./Badge";
import type { ProcessItem } from "../data/sampleProcesses";

export interface ProcessListProps {
  items: ProcessItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onContextMenu: (event: React.MouseEvent, item: ProcessItem) => void;
}

export const ProcessList: React.FC<ProcessListProps> = ({
  items,
  selectedId,
  onSelect,
  onContextMenu,
}) => (
  <div className="flex flex-col w-full divide-y divide-border-subtle/50">
    {items.map((item) => (
      <Row
        key={item.id}
        icon={<Icon name={item.iconName} size="sm" className={item.iconColor} />}
        label={item.title}
        description={item.desc}
        selected={selectedId === item.id}
        onClick={() => onSelect(item.id)}
        onContextMenu={(e) => onContextMenu(e, item)}
        actions={
          <Tooltip content={`Pin ${item.title}`} shortcut="Alt+P" position="left">
            <Button
              variant="ghost"
              iconOnly
              size="sm"
              icon="pin"
              aria-label={`Pin ${item.title}`}
            />
          </Tooltip>
        }
        meta={
          <div className="flex items-center gap-xs">
            <Badge variant={item.status} size="sm" dot={item.status !== "neutral"}>
              {item.statusText}
            </Badge>
            <span className="text-text-disabled">{item.pid}</span>
            <span className="text-text-mono">{item.ram}</span>
          </div>
        }
      />
    ))}
  </div>
);
