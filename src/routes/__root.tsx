import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="font-mono-data text-xs text-glow mb-3">ERR · 404 · ROUTE_NOT_FOUND</div>
        <h1 className="font-display text-7xl font-semibold tracking-tight">404</h1>
        <h2 className="mt-4 font-display text-xl">Nodo no encontrado</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La ruta solicitada no está registrada en el grafo del sistema.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TensorLabs — Inteligencia de precisión para cada industria" },
      { name: "description", content: "Plataforma de Inteligencia de Precisión: Ciencia de Datos y Machine Learning para Agricultura, Ganadería, Medicina, Manufactura 4.0, Tecnología y Oil & Gas." },
      { name: "author", content: "TensorLabs" },
      { property: "og:title", content: "TensorLabs — Inteligencia de precisión" },
      { property: "og:description", content: "Inteligencia de precisión para sectores industriales críticos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}
