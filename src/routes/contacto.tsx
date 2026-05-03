import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, ArrowUpRight, Building2, MessageSquare, Loader2, MessageCircle } from "lucide-react";
import { Header } from "@/components/tl/Header";
import { Footer } from "@/components/tl/Footer";
import { sendContactEmail } from "@/lib/contact.server";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto · TensorLabs" },
      { name: "description", content: "Contacte al equipo de TensorLabs para activar inteligencia de precisión en su organización." },
      { property: "og:title", content: "Contacto · TensorLabs" },
      { property: "og:description", content: "Hable con un ingeniero. Onboarding clínico en menos de 72h." },
    ],
  }),
  component: Contacto,
});

const channels = [
  { icon: Mail, label: "Canal Digital", value: "Mail", note: "Respuesta < 4h hábiles", link: "#ticket" },
  { icon: MessageCircle, label: "WhatsApp", value: "WhatsApp", note: "Atención inmediata", link: "https://wa.me/5493584241371" },
  { icon: MapPin, label: "Sede Central", value: "Río Cuarto · Córdoba", note: "Soporte 24/7/365", link: null },
];

const departments = [
  { code: "DEP · 01", title: "Ingeniería de plataforma", desc: "Integraciones, despliegues edge/cloud y SLAs." },
  { code: "DEP · 02", title: "Ciencia de datos", desc: "Co-desarrollo de modelos a medida por dominio." },
  { code: "DEP · 03", title: "Cumplimiento & Seguridad", desc: "SOC2, ISO 27001, gobernanza de datos." },
  { code: "DEP · 04", title: "Alianzas industriales", desc: "Programas de partner para verticales críticos." },
];

function Contacto() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      sector: formData.get("sector") as string,
      kind: formData.get("kind") as string,
      message: formData.get("message") as string,
    };

    try {
      await sendContactEmail({ data });
      setSent(true);
    } catch (err) {
      setError("Hubo un error al enviar el ticket. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-atmosphere">
      <Header />

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-[1400px] px-6 pt-20 pb-14 md:pt-28 md:pb-20">
          <div className="grid grid-cols-12 gap-6 mb-10">
            <div className="col-span-12 md:col-span-7">
              <div className="label-tag mb-4">— Canal directo · operación 24/7</div>
              <h1 className="font-display text-[44px] md:text-[80px] leading-[0.95] tracking-tight font-medium">
                Solicitar evaluación <span className="italic font-light text-glow"></span><br />
                
              </h1>
            </div>
            <div className="col-span-12 md:col-span-5 md:pl-6 md:border-l border-border/60 self-end">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cada solicitud entra al pipeline clínico: triage, asignación y respuesta firmada por el equipo responsable. Onboarding promedio: 72 horas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3">
            {channels.map((c) => (
              <div key={c.label} className="col-span-12 md:col-span-4">
                {c.link ? (
                  <a href={c.link} target={c.link.startsWith("http") ? "_blank" : "_self"} rel="noreferrer" className="block glass-strong rounded-xl p-5 hover:border-glow/40 transition group">
                    <div className="flex items-center justify-between mb-4">
                      <c.icon className="h-4 w-4 text-glow" />
                      <span className="data-tick">{c.label.toUpperCase()}</span>
                    </div>
                    <div className="font-display text-xl group-hover:text-glow transition flex items-center gap-2">
                      {c.value} <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <div className="font-mono-data text-[11px] text-muted-foreground mt-2">{c.note}</div>
                  </a>
                ) : (
                  <div className="glass-strong rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <c.icon className="h-4 w-4 text-glow" />
                      <span className="data-tick">{c.label.toUpperCase()}</span>
                    </div>
                    <div className="font-display text-xl">{c.value}</div>
                    <div className="font-mono-data text-[11px] text-muted-foreground mt-2">{c.note}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-[1400px] px-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7">
            <div id="ticket" className="glass rounded-xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="label-tag mb-1">Formulario · TICKET-NEW</div>
                  <div className="font-display text-2xl">Iniciar conversación</div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border text-[10px] font-mono-data">
                  <span className="pulse-dot" /> READY
                </span>
              </div>

              {sent ? (
                <div className="border border-glow/40 rounded-lg p-6 text-center">
                  <MessageSquare className="h-6 w-6 text-glow mx-auto mb-3" />
                  <div className="font-display text-xl mb-1">Ticket enviado con éxito.</div>
                  <p className="text-sm text-muted-foreground">Un ingeniero responderá en menos de 4 horas hábiles.</p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nombre" name="name" required />
                    <Field label="Empresa" name="company" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Correo corporativo" name="email" type="email" required />
                    <SelectField label="Sector" name="sector" options={["Agricultura", "Ganadería", "Medicina", "Manufactura 4.0", "Tecnología", "Oil & Gas", "Otro"]} />
                  </div>
                  <SelectField label="Tipo de consulta" name="kind" options={["Demo de plataforma", "Integración técnica", "Co-desarrollo de modelo", "Compliance / Auditoría", "Alianza industrial"]} />
                  <div>
                    <label className="label-tag block mb-1.5">Mensaje</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      className="w-full rounded-md border border-border bg-card/40 px-3 py-2 text-sm outline-none focus:border-glow transition resize-none"
                      placeholder="Describa contexto, escala y horizonte temporal del proyecto…"
                    />
                  </div>
                  
                  {error && (
                    <div className="text-xs text-red-500 font-mono-data bg-red-500/10 p-2 rounded border border-red-500/20">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="font-mono-data text-[10px] text-muted-foreground">PGP disponible · cifrado E2E opcional</span>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 h-10 px-5 rounded-md bg-foreground text-background font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>Procesando <Loader2 className="h-4 w-4 animate-spin" /></>
                      ) : (
                        <>Enviar ticket <ArrowUpRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 space-y-3">
            <div className="label-tag">Departamentos</div>
            {departments.map((d) => (
              <div key={d.code} className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="h-3.5 w-3.5 text-glow" />
                  <span className="data-tick">{d.code}</span>
                </div>
                <div className="font-display text-lg">{d.title}</div>
                <p className="text-sm text-muted-foreground mt-1">{d.desc}</p>
                <div className="mt-3 inline-flex items-center gap-1 font-mono-data text-[11px] text-glow">
                   CONTACTO VÍA TICKET <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="label-tag block mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full h-10 rounded-md border border-border bg-card/40 px-3 text-sm outline-none focus:border-glow transition"
      />
    </div>
  );
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <div>
      <label className="label-tag block mb-1.5">{label}</label>
      <select
        name={name}
        className="w-full h-10 rounded-md border border-border bg-card/40 px-3 text-sm outline-none focus:border-glow transition"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
