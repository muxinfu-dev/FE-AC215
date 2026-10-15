// src/components/layout/AppLayout.tsx
// 外框：左侧栏固定，右边放“当前页面”（children）
// 以后加路由，切换页面时只换 children，侧栏不动

import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      {children}
    </div>
  );
}
