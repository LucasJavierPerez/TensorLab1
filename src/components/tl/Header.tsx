import { Link } from "@tanstack/react-router";
import { Moon, Sun, ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";
import { useTheme } from "../theme-provider";

export function Header() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-50">
      <div className="glass-strong border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/"><Logo /></Link>
            <nav className="hidden md:flex items-center gap-1 text-[13px]">
              {[
                { to: "/", label: "Plataforma" },
                { to: "/soluciones", label: "Soluciones" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  activeOptions={{ exact: true }}
                  className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition"
                  activeProps={{ className: "px-3 py-1.5 rounded-md text-foreground bg-accent/50" }}
                >
                  {l.label}
                </Link>
              ))}
              <span className="px-3 py-1.5 rounded-md text-muted-foreground/60 cursor-default">Industrias</span>
              <span className="px-3 py-1.5 rounded-md text-muted-foreground/60 cursor-default">Investigación</span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full glass text-[11px] font-mono-data">
              <span className="pulse-dot" />
              <span className="text-muted-foreground">SISTEMA</span>
              <span className="text-foreground">OPERATIVO</span>
            </div>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-accent/50 transition"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
            <Link
              to="/soluciones"
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-foreground text-background text-[12px] font-medium hover:opacity-90 transition"
            >
              Acceder al panel <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
