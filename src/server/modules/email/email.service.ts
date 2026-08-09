import nodemailer from "nodemailer";
import { db } from "@/src/server/db";
import { contacts, templates } from "@/src/server/db/schema";
import { eq } from "drizzle-orm";

export interface SendEmailInput {
  contactId: string;
  templateId: string;
}

export interface SendEmailResult {
  messageId: string;
  contactEmail: string;
  subject: string;
}

function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error(
      "Faltan las variables de entorno SMTP_USER y SMTP_PASS. " +
      "Agrégalas en tu archivo .env"
    );
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    auth: { user, pass },
  });
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  // Fetch contact
  const contactResult = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, input.contactId));

  const contact = contactResult[0];
  if (!contact) {
    throw new Error("Contacto no encontrado");
  }
  if (!contact.email) {
    throw new Error(`El contacto "${contact.name}" no tiene email registrado`);
  }

  // Fetch template
  const templateResult = await db
    .select()
    .from(templates)
    .where(eq(templates.id, input.templateId));

  const template = templateResult[0];
  if (!template) {
    throw new Error("Plantilla no encontrada");
  }
  if (!template.subject || !template.body) {
    throw new Error("La plantilla está incompleta (falta asunto o cuerpo)");
  }

  // Replace placeholders in subject and body
  const subject = replacePlaceholders(template.subject, contact);
  const body = replacePlaceholders(template.body, contact);

  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME ?? "Cyrus"}" <${process.env.SMTP_USER}>`,
    to: contact.email,
    subject,
    html: body,
  });

  return {
    messageId: info.messageId,
    contactEmail: contact.email,
    subject,
  };
}

/**
 * Replaces {{name}}, {{company}}, {{email}} placeholders in a string.
 */
function replacePlaceholders(
  text: string,
  contact: { name: string | null; company: string | null; email: string | null }
): string {
  return text
    .replace(/\{\{name\}\}/gi, contact.name ?? "")
    .replace(/\{\{company\}\}/gi, contact.company ?? "")
    .replace(/\{\{email\}\}/gi, contact.email ?? "");
}
