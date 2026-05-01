import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Building2, BarChart3, FileText, Settings,
  Database, Cpu, ShieldCheck, Activity, ChevronLeft,
} from "lucide-react";
import { Logo } from "./Logo";

type Item = {
  icon: typeof LayoutDashboard;
  label: string;
  to: "/soluciones" | "/soluciones/datasets" | "/soluciones/telemetria";
  badge?: string;
  disabled?: boolean;
};

const groups: { label: string; items: (Item | { icon: typeof LayoutDashboard; label: string; badge?: string; disabled: true })[] }[] = [
  {
    label: "OPERACIÓN",
    items: [
      { icon: LayoutDashboard, label: "Panel", to: "/soluciones" },
      { icon: Building2, label: "Empresas", badge: "12", disabled: true },
      { icon: BarChart3, label: "Análisis", disabled: true },
      { icon: FileText, label: "Informes", disabled: true },
    ],
  },
  {
    label: "INFRAESTRUCTURA",
    items: [
      { icon: Database, label: "Datasets", to: "/soluciones/datasets" },
      { icon: Cpu, label: "Modelos", badge: "42", disabled: true },
      { icon: Activity, label: "Telemetría", to: "/soluciones/telemetria" },
      { icon: ShieldCheck, label: "Cumplimiento", disabled: true },
    ],
  },
  {
    label: "SISTEMA",
    items: [{ icon: Settings, label: "Ajustes", disabled: true }],
  },
];

export function SideNav() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  return (
    <aside
      className={`shrink-0 border-r border-border/60 bg-sidebar transition-[width] duration-300 ${collapsed ? "w-[68px]" : "w-[244px]"} flex flex-col sticky top-0 h-screen`}
    >
      <div className="h-14 border-b border-sidebar-border flex items-center px-4 gap-2">
        <Link to="/">{collapsed ? <Logo className="[&>span]:hidden" /> : <Logo />}</Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto h-7 w-7 grid place-items-center rounded-md hover:bg-sidebar-accent transition"
          aria-label="collapse"
        >
          <ChevronLeft className={`h-3.5 w-3.5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {groups.map((g) => (
          <div key={g.label}>
            {!collapsed && <div className="label-tag px-2 mb-2">{g.label}</div>}
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = "to" in it && it.to === pathname;
                const cls = `w-full flex items-center gap-2.5 h-9 px-2 rounded-md text-[13px] transition group
                  ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"}`;
                const inner = (
                  <>
                    <it.icon className={`h-4 w-4 ${active ? "text-glow" : ""}`} />
                    {!collapsed && <span className="flex-1 text-left">{it.label}</span>}
                    {!collapsed && it.badge && (
                      <span className="font-mono-data text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">{it.badge}</span>
                    )}
                  </>
                );
                return (
                  <li key={it.label}>
                    {"to" in it && it.to ? (
                      <Link to={it.to} className={cls}>{inner}</Link>
                    ) : (
                      <button className={`${cls} opacity-50 cursor-not-allowed`} disabled>{inner}</button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="pulse-dot" />
              <div className="label-tag">CLUSTER · OK</div>
            </div>
            <div className="font-mono-data text-[10px] text-muted-foreground space-y-0.5">
              <div className="flex justify-between"><span>cpu</span><span className="text-foreground">62%</span></div>
              <div className="flex justify-between"><span>mem</span><span className="text-foreground">48%</span></div>
              <div className="flex justify-between"><span>gpu</span><span className="text-glow">88%</span></div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export function DashboardTopBar({ crumbs }: { crumbs: string[] }) {
  return (
    <header className="h-14 border-b border-border/60 glass-strong flex items-center px-5 gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-2 text-[12px] font-mono-data text-muted-foreground">
        <Link to="/" className="hover:text-foreground">TENSORLABS</Link>
        {crumbs.map((c, i) => (
          <span key={c} className="flex items-center gap-2">
            <span>›</span>
            <span className={i === crumbs.length - 1 ? "text-foreground" : ""}>{c}</span>
          </span>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full border border-border text-[11px] font-mono-data">
          <span className="pulse-dot" /> <span className="text-muted-foreground">CLUSTER</span> <span className="text-foreground">us-east · primary</span>
        </div>
      </div>
    </header>
  );
}
