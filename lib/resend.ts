import { Resend } from "resend";

export type ResendMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type ResendBatchResponse = {
  messageIds: string[];
};

export class ResendApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(`Resend API returned ${status} (${code}): ${message.slice(0, 500)}`);
    this.name = "ResendApiError";
    this.status = status;
    this.code = code;
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) throw new Error(`Missing environment variable: ${name}`);

  return value;
}

function sender(): string {
  const email = requiredEnv("RESEND_FROM_EMAIL");
  const name = (process.env.RESEND_FROM_NAME?.trim() || "KKS Camp").replace(
    /[<>\r\n]/g,
    "",
  );

  return `${name} <${email}>`;
}

export function validateResendConfig(): void {
  requiredEnv("RESEND_API_KEY");
  requiredEnv("RESEND_FROM_EMAIL");
}

/**
 * Sends personalized transactional messages in one Resend batch request.
 * An ambiguous request is retried once with the same 24-hour idempotency key.
 */
export async function sendResendBatch(options: {
  messages: ResendMessage[];
  idempotencyKey: string;
}): Promise<ResendBatchResponse> {
  if (options.messages.length === 0) return { messageIds: [] };
  if (options.messages.length > 100) {
    throw new Error("Resend accepts at most 100 emails per batch");
  }

  validateResendConfig();
  const resend = new Resend(requiredEnv("RESEND_API_KEY"));
  const payload = options.messages.map((message) => ({
    from: sender(),
    to: [message.to],
    subject: message.subject,
    html: message.html,
    text: message.text,
  }));

  const sendOnce = async () => {
    const { data, error } = await resend.batch.send(payload, {
      idempotencyKey: options.idempotencyKey,
    });

    if (error) {
      throw new ResendApiError(
        error.statusCode ?? 500,
        error.name,
        error.message,
      );
    }

    return { messageIds: data.data.map((message) => message.id) };
  };

  try {
    return await sendOnce();
  } catch (firstError) {
    // A non-timeout 4xx is a definite rejection. Network failures, 408 and
    // 5xx responses are ambiguous and are retried once with the same key.
    if (
      firstError instanceof ResendApiError &&
      firstError.status >= 400 &&
      firstError.status < 500 &&
      firstError.status !== 408
    ) {
      throw firstError;
    }

    try {
      return await sendOnce();
    } catch {
      // Preserve the ambiguous first result so the queue quarantines the batch
      // instead of sending it again after the provider's 24-hour key expires.
      throw firstError;
    }
  }
}
