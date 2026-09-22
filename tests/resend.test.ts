import assert from "node:assert/strict";
import test from "node:test";

import { ResendApiError, sendResendBatch } from "../lib/resend";

function configureTestEnvironment() {
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.RESEND_FROM_EMAIL = "sender@example.com";
  process.env.RESEND_FROM_NAME = "KKS Camp";
}

const message = {
  to: "student@example.com",
  subject: "เตือนเข้าค่าย",
  html: "<p>ทดสอบ</p>",
  text: "ทดสอบ",
};

test("an ambiguous request retries once with the same idempotency key", async () => {
  configureTestEnvironment();
  const originalFetch = globalThis.fetch;
  const requests: Array<{ body: string; key: string | null }> = [];

  globalThis.fetch = async (_input, init) => {
    requests.push({
      body: String(init?.body),
      key: new Headers(init?.headers).get("idempotency-key"),
    });

    if (requests.length === 1) throw new TypeError("connection reset");

    return Response.json({ data: [{ id: "email_123" }] });
  };

  try {
    const result = await sendResendBatch({
      idempotencyKey: "stable-key",
      messages: [message],
    });

    assert.deepEqual(result.messageIds, ["email_123"]);
    assert.equal(requests.length, 2);
    assert.equal(requests[0].body, requests[1].body);
    assert.equal(requests[0].key, "stable-key");
    assert.equal(requests[1].key, "stable-key");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("a definite Resend rejection is not retried immediately", async () => {
  configureTestEnvironment();
  const originalFetch = globalThis.fetch;
  let calls = 0;

  globalThis.fetch = async () => {
    calls += 1;

    return Response.json(
      {
        name: "validation_error",
        message: "Invalid sender",
        statusCode: 400,
      },
      { status: 400 },
    );
  };

  try {
    await assert.rejects(
      sendResendBatch({
        idempotencyKey: "rejected-key",
        messages: [message],
      }),
      ResendApiError,
    );
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects batches over the Resend limit before making a request", async () => {
  configureTestEnvironment();

  await assert.rejects(
    sendResendBatch({
      idempotencyKey: "too-large",
      messages: Array.from({ length: 101 }, () => message),
    }),
    /at most 100/,
  );
});
