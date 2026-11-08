import React, { useEffect, useRef, useState, useCallback } from "react";
import { Icon, type IconName } from "./Icon";

export { useContextMenu } from "../hooks/useContextMenu";

export interface ContextMenuItem {
  id: string;
  label?: string;
  icon?: IconName;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  onClick?: () => void;
  subMenu?: ContextMenuItem[];
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number } | null;
  onClose: () => void;
  className?: string;
}

const clampPosition = (
  x: number,
  y: number,
  menuWidth = 190,
  menuHeight = 220
) => {
  const winWidth = typeof window === "undefined" ? 900 : window.innerWidth;
  const winHeight = typeof window === "undefined" ? 600 : window.innerHeight;
  const clampedX = x + menuWidth > winWidth ? Math.max(8, x - menuWidth) : x;
  const clampedY = y + menuHeight > winHeight ? Math.max(8, y - menuHeight) : y;
  return { x: clampedX, y: clampedY };
};

const getNavigableIndices = (items: ContextMenuItem[]): number[] => {
  return items
    .map((item, index) => (!item.separator && !item.disabled ? index : -1))
    .filter((index) => index !== -1);
};

const resolveItemClasses = (
  disabled?: boolean,
  danger?: boolean,
  isActive?: boolean
): string => {
  if (disabled) {
    return "opacity-40 cursor-not-allowed pointer-events-none text-text-disabled";
  }
  if (danger) {
    return isActive ? "bg-danger-muted text-danger" : "text-danger hover:bg-danger-muted";
  }
  return isActive ? "bg-bg-hover text-text-primary" : "text-text-primary hover:bg-bg-hover";
};

const ContextMenuSeparator: React.FC = () => (
  <div className="h-px my-1 bg-border-subtle" role="separator" />
);

interface SubMenuWrapperProps {
  subMenu: ContextMenuItem[];
  onSelect: () => void;
  onCloseSub: () => void;
}

const SubMenuWrapper: React.FC<SubMenuWrapperProps> = ({
  subMenu,
  onSelect,
  onCloseSub,
}) => (
  <div className="absolute left-full -top-1 ml-1 z-50">
    <ContextMenuList
      items={subMenu}
      onClose={() => {
        onCloseSub();
        onSelect();
      }}
    />
  </div>
);

const ItemContent: React.FC<{
  icon?: IconName;
  label?: string;
  danger?: boolean;
  shortcut?: string;
  hasSub?: boolean;
}> = ({ icon, label, danger, shortcut, hasSub }) => (
  <>
    {icon && (
      <Icon
        name={icon}
        size="sm"
        className={danger ? "text-danger" : "text-text-secondary group-hover:text-text-primary"}
      />
    )}
    <span className="truncate flex-1">{label}</span>
    {shortcut && (
      <span className="ml-auto pl-sm font-mono text-2xs text-text-disabled">
        {shortcut}
      </span>
    )}
    {hasSub && <Icon name="chevron-right" size={12} className="ml-auto text-text-secondary" />}
  </>
);

interface ItemViewProps {
  item: ContextMenuItem;
  isActive: boolean;
  onHover: () => void;
  onSelect: () => void;
  onOpenSub: () => void;
  isSubOpen: boolean;
  onCloseSub: () => void;
}

const ContextMenuItemView: React.FC<ItemViewProps> = ({
  item,
  isActive,
  onHover,
  onSelect,
  onOpenSub,
  isSubOpen,
  onCloseSub,
}) => {
  if (item.separator) {
    return <ContextMenuSeparator />;
  }

  const hasSub = Boolean(item.subMenu && item.subMenu.length > 0);
  const stateClasses = resolveItemClasses(item.disabled, item.danger, isActive);

  return (
    <div
      role="menuitem"
      tabIndex={-1}
      aria-disabled={item.disabled}
      className={`group relative flex items-center h-7 px-sm gap-xs text-xs rounded-xs select-none cursor-pointer transition-colors ${stateClasses}`}
      onMouseEnter={() => {
        onHover();
        if (hasSub) onOpenSub();
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!item.disabled && item.onClick) onSelect();
      }}
    >
      <ItemContent
        icon={item.icon}
        label={item.label}
        danger={item.danger}
        shortcut={item.shortcut}
        hasSub={hasSub}
      />
      {hasSub && isSubOpen && item.subMenu && (
        <SubMenuWrapper
          subMenu={item.subMenu}
          onSelect={onSelect}
          onCloseSub={onCloseSub}
        />
      )}
    </div>
  );
};

interface MenuListProps {
  items: ContextMenuItem[];
  onClose: () => void;
  className?: string;
}

const useMenuNav = (
  items: ContextMenuItem[],
  validIndices: number[],
  onClose: () => void
) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        const next = validIndices.indexOf(activeIndex) + 1;
        setActiveIndex(validIndices[next >= validIndices.length ? 0 : next]);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const prev = validIndices.indexOf(activeIndex) - 1;
        setActiveIndex(validIndices[prev < 0 ? validIndices.length - 1 : prev]);
      } else if (event.key === "Enter") {
        event.preventDefault();
        const current = items[activeIndex];
        if (current && !current.disabled && current.onClick) {
          current.onClick();
          onClose();
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    },
    [activeIndex, validIndices, items, onClose]
  );

  return { activeIndex, setActiveIndex, handleKeyDown };
};

const ContextMenuList: React.FC<MenuListProps> = ({
  items,
  onClose,
  className = "",
}) => {
  const [openSubIndex, setOpenSubIndex] = useState<number | null>(null);
  const validIndices = getNavigableIndices(items);
  const { activeIndex, setActiveIndex, handleKeyDown } = useMenuNav(
    items,
    validIndices,
    onClose
  );

  return (
    <div
      role="menu"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`min-w-[180px] p-1 bg-bg-elevated border border-border-subtle rounded-xs shadow-lg backdrop-blur-md outline-none ${className}`}
    >
      {items.map((item, index) => (
        <ContextMenuItemView
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          isSubOpen={openSubIndex === index}
          onHover={() => setActiveIndex(index)}
          onSelect={() => {
            item.onClick?.();
            onClose();
          }}
          onOpenSub={() => setOpenSubIndex(index)}
          onCloseSub={() => setOpenSubIndex(null)}
        />
      ))}
    </div>
  );
};

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  position,
  onClose,
  className = "",
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!position) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleScroll = () => onClose();
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [position, onClose]);

  if (!position) return null;

  const clamped = clampPosition(position.x, position.y);

  return (
    <div
      ref={menuRef}
      style={{ top: `${clamped.y}px`, left: `${clamped.x}px` }}
      className={`fixed z-50 animate-in fade-in zoom-in-95 duration-75 ${className}`}
    >
      <ContextMenuList items={items} onClose={onClose} />
    </div>
  );
};
