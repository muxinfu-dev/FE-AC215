// src/components/layout/Sidebar.tsx
// 左侧导航栏：品牌区 + 菜单 + 底部用户卡片

import {
  LayoutGrid,
  PawPrint,
  Plus,
  ChartColumn,
  House,
  Ellipsis,
  type LucideIcon,
} from "lucide-react";

// ---------- 菜单数据 ----------
// 菜单项写成数组，再用 map 渲染，以后增删菜单只改这里
interface NavItemData {
  label: string;
  icon: LucideIcon;
}

const navItems: NavItemData[] = [
  { label: "Dashboard", icon: LayoutGrid },
  { label: "Animals", icon: PawPrint },
  { label: "New Intake", icon: Plus },
  { label: "Model Monitoring", icon: ChartColumn },
  { label: "Shelter Profile", icon: House },
];

// 暂时写死当前页面；第 10 步加路由后改成根据网址判断
const ACTIVE_ITEM = "Dashboard";

// ---------- 主组件 ----------
export default function Sidebar() {
  return (
    // flex-col：子元素竖向排列
    // w-64 = 256px 宽；shrink-0 = 不被中间区域挤窄
    <aside className="flex w-64 shrink-0 flex-col bg-[#0F1A2B] px-4 py-6 text-slate-300">
      <ShelterBrand />

      <nav className="mt-10 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            active={item.label === ACTIVE_ITEM}
          />
        ))}
      </nav>

      {/* mt-auto：把用户卡片推到最底部 */}
      <div className="mt-auto">
        <UserCard name="Jessica Martinez" role="Staff Intake Lead" />
      </div>
    </aside>
  );
}

// ---------- 子组件 ----------
// 只在 Sidebar 里用，所以先放在同一个文件；以后变大了再拆出去

function ShelterBrand() {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500 text-white">
        <PawPrint className="size-5" />
      </div>
      <div>
        <div className="font-semibold text-white">Riverside Shelter</div>
        <div className="text-xs text-slate-400">Intake Portal</div>
      </div>
    </div>
  );
}

interface NavItemProps {
  label: string;
  icon: LucideIcon;
  active: boolean;
}

function NavItem({ label, icon: Icon, active }: NavItemProps) {
  return (
    <button
      // 根据 active 拼出不同的 class：选中时浅色底 + 青色字，否则 hover 才变色
      className={
        "relative flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-colors " +
        (active
          ? "bg-white/5 font-medium text-teal-400"
          : "hover:bg-white/5 hover:text-white")
      }
    >
      <Icon className="size-5" />
      {label}

      {/* 选中时右侧的小竖条 */}
      {active && (
        <span className="absolute right-3 h-5 w-1 rounded-full bg-teal-400" />
      )}
    </button>
  );
}

interface UserCardProps {
  name: string;
  role: string;
}

function UserCard({ name, role }: UserCardProps) {
  // "Jessica Martinez" → "JM"
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
      <div className="flex size-10 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-white">{name}</div>
        <div className="truncate text-xs text-slate-400">{role}</div>
      </div>
      <button className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white">
        <Ellipsis className="size-4" />
      </button>
    </div>
  );
}
