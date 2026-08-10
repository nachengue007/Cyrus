import { NextRequest } from "next/server";
import { sendEmail } from "@/src/server/modules/email/email.service";
import { createHistory } from "@/src/server/modules/histories/histories.repository";

const DELAY_MS = 30_000;

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
  const { contactIds, templateId, contactNames } = (await req.json()) as {
    contactIds: string[];
    templateId: string;
    contactNames: Record<string, string>;
  };

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
          const result = await sendEmail({ contactId, templateId });

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

        // Wait between sends, but not after the last one
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
