import { createServerFn } from "@tanstack/react-start";
import { Resend } from "resend";

// Es recomendable mover esta clave a una variable de entorno (.env)
const resend = new Resend("re_Di84QaJW_Q9sFKP3tmuhr96fx86XaC5gV");

export const sendContactEmail = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { name: string; email: string; company: string; sector: string; kind: string; message: string } }) => {
    try {
      await resend.emails.send({
        from: "TensorLabs <onboarding@resend.dev>",
        to: ["lucasenrio@gmail.com"],
        subject: `Nuevo Ticket: ${data.kind} - ${data.company}`,
        html: `
          <h1>Nuevo mensaje de contacto</h1>
          <p><strong>Nombre:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Empresa:</strong> ${data.company}</p>
          <p><strong>Sector:</strong> ${data.sector}</p>
          <p><strong>Tipo de consulta:</strong> ${data.kind}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${data.message}</p>
        `,
      });
      return { success: true };
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  });
