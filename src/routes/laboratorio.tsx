import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/tl/Header";
import { FlaskConical, ChevronRight, MessageSquare, Send, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { sendChatMessage, type ChatMessage } from "@/lib/chat.server";

export const Route = createFileRoute("/laboratorio")({
  head: () => ({
    meta: [
      { title: "Laboratorio Reactivo · TensorLabs" },
      { name: "description", content: "Exploración interactiva de modelos predictivos e impacto industrial." },
    ],
  }),
  component: Laboratorio,
});

const NOTEBOOK_EXAMPLES = [
  {
    file: "01_sanidad_vegetal_mip.html",
    title: "Sanidad Vegetal y MIP",
    description: "Manejo integrado de plagas y modelos de umbral económico.",
    tags: ["Agronomía", "MIP"],
  },
  {
    file: "modulo_2_nutricion.html",
    title: "Nutrición Animal",
    description: "Balance de raciones y requerimientos nutricionales por categoría.",
    tags: ["Ganadería", "Nutrición"],
  },
  {
    file: "modulo_1_produccion_leche.html",
    title: "Producción de Leche",
    description: "Curvas de lactancia y proyección de producción individual.",
    tags: ["Lechería", "Proyección"],
  },
  {
    file: "10_economia_agraria.html",
    title: "Economía Agraria y Decisiones",
    description: "Márgenes brutos y toma de decisiones bajo incertidumbre.",
    tags: ["Economía", "Gestión"],
  },
];

function Laboratorio() {
  const [selected, setSelected] = useState(NOTEBOOK_EXAMPLES[0]);

  return (
    <div className="flex flex-col h-dvh bg-[#f8f9fa] dark:bg-[#0d1117] text-foreground transition-colors">
      <Header />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">

        {/* Mobile tab bar */}
        <div className="md:hidden shrink-0 border-b border-border/50 bg-background">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-glow shrink-0" />
              <span className="text-xs font-medium text-glow">Research Lab</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-glow/20 text-glow border border-glow/30">
              <MessageSquare className="h-3 w-3" />
              Lab AI
            </div>
          </div>
          <div className="flex overflow-x-auto scrollbar-none px-2 py-2 gap-1.5">
            {NOTEBOOK_EXAMPLES.map((nb) => {
              const isActive = selected.file === nb.file;
              return (
                <button
                  key={nb.file}
                  onClick={() => setSelected(nb)}
                  className={[
                    "shrink-0 px-3 py-2 rounded-lg border text-left transition-all duration-150",
                    isActive
                      ? "bg-glow/10 border-glow/20"
                      : "border-transparent bg-muted/40 hover:bg-muted/60",
                  ].join(" ")}
                >
                  <span className={["text-xs font-medium whitespace-nowrap", isActive ? "text-glow" : ""].join(" ")}>
                    {nb.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-72 shrink-0 border-r border-border/50 bg-background flex-col">
          <div className="px-4 py-5 border-b border-border/50 space-y-1">
            <div className="flex items-center gap-2 text-glow">
              <FlaskConical className="h-4 w-4" />
              <span className="text-sm font-medium">Research Lab</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Seleccioná un notebook para explorarlo en pantalla completa.
            </p>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {NOTEBOOK_EXAMPLES.map((nb) => {
              const isActive = selected.file === nb.file;
              return (
                <button
                  key={nb.file}
                  onClick={() => setSelected(nb)}
                  className={[
                    "w-full text-left px-3 py-3 rounded-lg transition-all duration-150 border",
                    isActive
                      ? "bg-glow/10 border-glow/20"
                      : "border-transparent hover:bg-muted/50",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={["text-sm font-medium leading-snug", isActive ? "text-glow" : ""].join(" ")}>
                      {nb.title}
                    </span>
                    <ChevronRight
                      className={[
                        "h-3.5 w-3.5 shrink-0 mt-0.5 transition-transform",
                        isActive ? "text-glow rotate-90" : "text-muted-foreground/30",
                      ].join(" ")}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{nb.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {nb.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="px-4 py-3 border-t border-border/50">
            <span className="text-[10px] font-mono-data text-muted-foreground/40 uppercase tracking-widest">
              python · marimo
            </span>
          </div>
        </aside>

        {/* Iframe + chat panel */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          <main className="flex-1 overflow-hidden bg-background min-h-0">
            <iframe
              key={selected.file}
              src={`/notebooks/${selected.file}`}
              className="w-full h-full border-0"
              title={selected.title}
            />
          </main>

          <ChatPanel
            notebookFile={selected.file}
            notebookTitle={selected.title}
          />
        </div>
      </div>

      <footer className="shrink-0 border-t border-border/50 px-4 md:px-6 py-2.5 flex items-center justify-between bg-background">
        <span className="text-[10px] font-mono-data text-muted-foreground/50 uppercase tracking-widest">
          © 2026 TensorLabs
        </span>
        <div className="flex items-center gap-3 md:gap-4 text-[10px] font-mono-data text-muted-foreground/40">
          <span>Uptime 99.998%</span>
          <span className="hidden sm:inline">python · marimo</span>
        </div>
      </footer>
    </div>
  );
}

function ChatPanel({
  notebookFile,
  notebookTitle,
}: {
  notebookFile: string;
  notebookTitle: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setMessages([]);
  }, [notebookFile]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { reply } = await sendChatMessage({
        data: { message: text, notebookFile, history: messages as { role: "user" | "assistant"; content: string }[] },
      });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err instanceof Error ? err.message : String(err)}` },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const SUGGESTIONS = [
    "¿Qué modelos usa esta notebook?",
    "Explicame el concepto principal",
    "¿Cómo interpreto los resultados?",
  ];

  return (
    <div className="w-80 shrink-0 border-l border-border/50 bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-1.5 text-glow">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Lab AI</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{notebookTitle}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <MessageSquare className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Preguntame sobre la notebook activa.
            </p>
            <div className="space-y-1.5">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="block w-full text-left px-2.5 py-1.5 rounded-md text-[11px] text-muted-foreground border border-border/50 hover:bg-muted/50 hover:text-foreground transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={["flex", msg.role === "user" ? "justify-end" : "justify-start"].join(" ")}>
            <div
              className={[
                "max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-foreground text-background rounded-br-sm"
                  : "bg-muted/60 text-foreground rounded-bl-sm border border-border/40",
              ].join(" ")}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted/60 border border-border/40 px-3 py-2 rounded-xl rounded-bl-sm flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Analizando...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border/50 p-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Preguntá sobre la notebook..."
            rows={1}
            className="flex-1 resize-none bg-muted/40 border border-border/50 rounded-lg px-3 py-2 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-glow/40 transition-colors max-h-28 leading-relaxed"
            style={{ minHeight: "36px" }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg bg-foreground text-background disabled:opacity-30 hover:opacity-80 transition-all"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/30 mt-1.5 text-center">
          Enter para enviar · Shift+Enter nueva línea
        </p>
      </div>
    </div>
  );
}
