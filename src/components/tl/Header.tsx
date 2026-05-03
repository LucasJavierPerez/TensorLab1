import { Link } from "@tanstack/react-router";
import { Moon, Sun, ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useTheme } from "../theme-provider";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export function Header() {
  const { theme, toggle } = useTheme();

  const navLinks = [
    { to: "/", label: "Plataforma", exact: true },
    { to: "/industria", label: "Industrias" },
    { to: "/laboratorio", label: "Laboratorio" },
    { to: "/contacto", label: "Contacto" },
  ];

  return (
    <header className="sticky top-0 z-50">
      <div className="glass-strong border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-accent/50 transition">
                    <Menu className="h-4 w-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px] bg-background border-r-border/60">
                  <div className="flex flex-col h-full">
                    <div className="h-14 border-b border-border/60 flex items-center px-6">
                      <Logo />
                    </div>
                    <nav className="flex-1 p-6 flex flex-col gap-2">
                      {navLinks.map((link) => (
                        <SheetClose asChild key={link.label}>
                          {link.to ? (
                            <Link
                              to={link.to}
                              activeOptions={link.exact ? { exact: true } : undefined}
                              className="flex items-center h-10 px-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/30 transition text-sm font-medium"
                              activeProps={{ className: "text-foreground bg-accent/50" }}
                            >
                              {link.label}
                            </Link>
                          ) : (
                            <a
                              href={link.href}
                              className="flex items-center h-10 px-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/30 transition text-sm font-medium"
                            >
                              {link.label}
                            </a>
                          )}
                        </SheetClose>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <Link to="/"><Logo /></Link>
            
            <nav className="hidden md:flex items-center gap-1 text-[13px]">
              {navLinks.map((link) => (
                link.to ? (
                  <Link
                    key={link.label}
                    to={link.to}
                    activeOptions={link.exact ? { exact: true } : undefined}
                    className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition"
                    activeProps={{ className: "px-3 py-1.5 rounded-md text-foreground bg-accent/50" }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition">
                    {link.label}
                  </a>
                )
              ))}
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
              to="/contacto"
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-foreground text-background text-[12px] font-medium hover:opacity-90 transition"
            >
              Solicitar demo <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
