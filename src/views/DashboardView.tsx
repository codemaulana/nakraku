import React from "react";
import { MainContent } from "../components/MainContent";
import type { ProcessItem } from "../data/sampleProcesses";

export interface DashboardViewProps {
  selectedProcess: string;
  searchQuery: string;
  isLoading: boolean;
  searchRef?: React.RefObject<HTMLInputElement>;
  onRefresh: () => void;
  onSearchChange: (query: string) => void;
  onSelectProcess: (id: string) => void;
  onOpenStashModal: () => void;
  onContextMenu: (event: React.MouseEvent, item: ProcessItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedProcess,
  searchQuery,
  isLoading,
  searchRef,
  onRefresh,
  onSearchChange,
  onSelectProcess,
  onOpenStashModal,
  onContextMenu,
}) => {
  return (
    <MainContent
      activeTab="Dashboard"
      selectedProcess={selectedProcess}
      searchQuery={searchQuery}
      isLoading={isLoading}
      searchRef={searchRef}
      onRefresh={onRefresh}
      onSearchChange={onSearchChange}
      onSelectProcess={onSelectProcess}
      onOpenStashModal={onOpenStashModal}
      onContextMenu={onContextMenu}
    />
  );
};
