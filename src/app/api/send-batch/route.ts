import { NextRequest } from "next/server";
import { sendEmail, type EmailAttachment } from "@/src/server/modules/email/email.service";
import { createHistory } from "@/src/server/modules/histories/histories.repository";

const DELAY_MS = 5_000;

// Validation limits
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_ATTACHMENTS = 5;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
]);

export type BatchEvent =
  | { type: "start"; total: number }
  | { type: "sending"; index: number; contactId: string; contactName: string }
  | { type: "sent"; index: number; contactId: string; contactEmail: string; subject: string; historyId: string }
  | { type: "error"; index: number; contactId: string; contactName: string; message: string }
  | { type: "waiting"; seconds: number }
  | { type: "done"; sent: number; failed: number };

function encode(event: BatchEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const contactIds = JSON.parse(formData.get("contactIds") as string) as string[];
  const templateId = formData.get("templateId") as string;
  const contactNames = JSON.parse(formData.get("contactNames") as string) as Record<string, string>;

  // Parse and validate attachments — kept in memory as Buffers, never written to disk
  const rawFiles = formData.getAll("attachments") as File[];

  if (rawFiles.length > MAX_ATTACHMENTS) {
    return new Response(
      JSON.stringify({ error: `Máximo ${MAX_ATTACHMENTS} archivos por envío` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const attachments: EmailAttachment[] = [];

  for (const file of rawFiles) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return new Response(
        JSON.stringify({ error: `Tipo de archivo no permitido: ${file.name} (${file.type})` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return new Response(
        JSON.stringify({ error: `El archivo "${file.name}" supera el límite de ${MAX_FILE_SIZE_MB}MB` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const arrayBuffer = await file.arrayBuffer();
    attachments.push({
      filename: file.name,
      content: Buffer.from(arrayBuffer),
      contentType: file.type,
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: BatchEvent) =>
        controller.enqueue(new TextEncoder().encode(encode(event)));

      send({ type: "start", total: contactIds.length });

      let sent = 0;
      let failed = 0;

      for (let i = 0; i < contactIds.length; i++) {
        const contactId = contactIds[i];
        const contactName = contactNames[contactId] ?? contactId;

        send({ type: "sending", index: i, contactId, contactName });

        try {
          const result = await sendEmail({ contactId, templateId, attachments });

          const history = await createHistory({
            contactId,
            templateId,
            status: "enviado",
          });

          send({
            type: "sent",
            index: i,
            contactId,
            contactEmail: result.contactEmail,
            subject: result.subject,
            historyId: history.id,
          });

          sent++;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Error desconocido";
          send({ type: "error", index: i, contactId, contactName, message });
          failed++;
        }

        if (i < contactIds.length - 1) {
          send({ type: "waiting", seconds: DELAY_MS / 1000 });
          await delay(DELAY_MS);
        }
      }

      send({ type: "done", sent, failed });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
