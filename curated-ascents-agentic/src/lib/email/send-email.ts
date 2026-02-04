import { resend, EMAIL_FROM } from "./resend-client";
import { db } from "@/db";
import { emailLogs } from "@/db/schema";
import type { ReactElement } from "react";

interface Attachment {
  filename: string;
  content: Buffer;
}

interface EmailLogContext {
  templateType: string;
  toName?: string;
  clientId?: number;
  quoteId?: number;
  bookingId?: number;
  metadata?: Record<string, unknown>;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
  attachments?: Attachment[];
  logContext?: EmailLogContext;
}

export async function sendEmail(
  options: SendEmailOptions
): Promise<{ sent: boolean; error?: string; emailLogId?: number }> {
  const { logContext } = options;

  // Create log entry if context provided
  let logId: number | undefined;
  if (logContext) {
    try {
      const logResult = await db
        .insert(emailLogs)
        .values({
          toEmail: options.to,
          toName: logContext.toName,
          subject: options.subject,
          templateType: logContext.templateType,
          clientId: logContext.clientId,
          quoteId: logContext.quoteId,
          bookingId: logContext.bookingId,
          metadata: logContext.metadata,
          status: "pending",
        })
        .returning({ id: emailLogs.id });
      logId = logResult[0]?.id;
    } catch (err) {
      console.error("Failed to create email log:", err);
    }
  }

  if (!resend) {
    console.log("Email skipped: RESEND_API_KEY not configured");
    if (logId) {
      await updateEmailLog(logId, "failed", undefined, "RESEND_API_KEY not configured");
    }
    return { sent: false, error: "RESEND_API_KEY not configured", emailLogId: logId };
  }

  if (!options.to) {
    console.log("Email skipped: no recipient address");
    if (logId) {
      await updateEmailLog(logId, "failed", undefined, "No recipient address");
    }
    return { sent: false, error: "No recipient address", emailLogId: logId };
  }

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      react: options.react,
      attachments: options.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });

    const resendId = result.data?.id;
    if (logId) {
      await updateEmailLog(logId, "sent", resendId);
    }
    return { sent: true, emailLogId: logId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("Email send failed:", message);
    if (logId) {
      await updateEmailLog(logId, "failed", undefined, message);
    }
    return { sent: false, error: message, emailLogId: logId };
  }
}

async function updateEmailLog(
  logId: number,
  status: "sent" | "failed",
  resendId?: string,
  errorMessage?: string
) {
  try {
    const { eq } = await import("drizzle-orm");
    await db
      .update(emailLogs)
      .set({
        status,
        resendId,
        errorMessage,
        sentAt: status === "sent" ? new Date() : undefined,
      })
      .where(eq(emailLogs.id, logId));
  } catch (err) {
    console.error("Failed to update email log:", err);
  }
}
