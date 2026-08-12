import nodemailer from "nodemailer";
import { db } from "@/src/server/db";
import { contacts, templates } from "@/src/server/db/schema";
import { eq } from "drizzle-orm";

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface SendEmailInput {
  contactId: string;
  templateId: string;
  attachments?: EmailAttachment[];
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

function textToHtml(text: string): string {
  return text
    .split("\n")
    .map((line) => `<p style="margin:0 0 4px 0">${line.trim() === "" ? "&nbsp;" : line}</p>`)
    .join("\n");
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

  // If the body already contains HTML tags, send as-is; otherwise convert newlines to <p> tags
  const isHtml = /<[a-z][\s\S]*>/i.test(body);
  const htmlBody = isHtml ? body : textToHtml(body);

  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: `"Cyrus" <${process.env.SMTP_USER}>`,
    to: contact.email,
    subject,
    html: htmlBody,
    attachments: (input.attachments ?? []).map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
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
