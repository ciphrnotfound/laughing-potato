"use client";

import { Suspense } from "react";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardSidebarWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function DashboardSidebarWrapper({ isOpen, onClose, onCollapseChange }: DashboardSidebarWrapperProps) {
  return (
    <Suspense fallback={
      <div className="fixed left-0 top-0 h-full w-64 bg-black/95 border-r border-white/10" />
    }>
      <DashboardSidebar isOpen={isOpen} onClose={onClose} onCollapseChange={onCollapseChange} />
    </Suspense>
  );
}

