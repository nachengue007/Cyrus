"use server";

import { sendEmail, type SendEmailInput, type SendEmailResult } from "./email.service";
import { createHistory } from "@/src/server/modules/histories/histories.repository";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface SendEmailActionResult {
  messageId: string;
  contactEmail: string;
  subject: string;
  historyId: string;
}

export async function sendEmailAction(
  input: SendEmailInput
): Promise<ActionResult<SendEmailActionResult>> {
  try {
    const result = await sendEmail(input);

    // Save to history with status "enviado"
    const history = await createHistory({
      contactId: input.contactId,
      templateId: input.templateId,
      status: "enviado",
    });

    return {
      success: true,
      data: {
        messageId: result.messageId,
        contactEmail: result.contactEmail,
        subject: result.subject,
        historyId: history.id,
      },
    };
  } catch (error) {
    // If email sent but history creation failed, still report success for email
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { success: false, error: message };
  }
}
