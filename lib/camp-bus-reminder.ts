export const BUS_REMINDER_TTL_MS = 30 * 60 * 1000;
export const BUS_REMINDER_COOLDOWN_MS = 60 * 1000;

export type BusReminderAction = "board" | "alight";

export interface BusReminderEvent {
  event_type: string;
  created_at: Date | string;
}

export interface ActiveBusReminder {
  action: BusReminderAction;
  sentAt: string;
  message: string;
}

export function getActiveBusReminder(
  events: BusReminderEvent[] | undefined,
  isOnBus: boolean,
  now = new Date(),
): ActiveBusReminder | null {
  const expectedType = isOnBus ? "REMIND_ALIGHT" : "REMIND_BOARD";
  const event = events?.[0];

  if (!event || event.event_type !== expectedType) return null;

  const createdAt = new Date(event.created_at);

  if (
    Number.isNaN(createdAt.getTime()) ||
    now.getTime() - createdAt.getTime() > BUS_REMINDER_TTL_MS
  ) {
    return null;
  }

  return {
    action: isOnBus ? "alight" : "board",
    sentAt: createdAt.toISOString(),
    message: isOnBus
      ? "ครูประจำรถแจ้งว่ารถจอดแล้ว กรุณากดลงจากรถ"
      : "ครูประจำรถกำลังเช็กจำนวนคน กรุณากดยืนยันขึ้นรถ",
  };
}
