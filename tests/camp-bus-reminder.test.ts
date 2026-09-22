import assert from "node:assert/strict";
import test from "node:test";

import {
  BUS_REMINDER_TTL_MS,
  getActiveBusReminder,
} from "../lib/camp-bus-reminder";

const now = new Date("2026-09-09T08:00:00.000Z");

test("uses the latest bus reminder when it matches the student's next action", () => {
  const reminder = getActiveBusReminder(
    [
      {
        event_type: "REMIND_BOARD",
        created_at: new Date("2026-09-09T07:59:00.000Z"),
      },
      {
        event_type: "REMIND_ALIGHT",
        created_at: new Date("2026-09-09T07:58:00.000Z"),
      },
    ],
    false,
    now,
  );

  assert.equal(reminder?.action, "board");
});

test("an updated bus reminder supersedes the previous action", () => {
  const reminder = getActiveBusReminder(
    [
      {
        event_type: "REMIND_ALIGHT",
        created_at: new Date("2026-09-09T07:59:00.000Z"),
      },
      {
        event_type: "REMIND_BOARD",
        created_at: new Date("2026-09-09T07:58:00.000Z"),
      },
    ],
    false,
    now,
  );

  assert.equal(reminder, null);
});

test("does not show a reminder after it expires", () => {
  const reminder = getActiveBusReminder(
    [
      {
        event_type: "REMIND_BOARD",
        created_at: new Date(now.getTime() - BUS_REMINDER_TTL_MS - 1),
      },
    ],
    false,
    now,
  );

  assert.equal(reminder, null);
});

test("does not show a boarding reminder after the student boards", () => {
  const reminder = getActiveBusReminder(
    [
      {
        event_type: "REMIND_BOARD",
        created_at: new Date("2026-09-09T07:59:00.000Z"),
      },
    ],
    true,
    now,
  );

  assert.equal(reminder, null);
});
