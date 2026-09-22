-- The reminder queue now uses Resend. Keep the provider receipt field generic
-- so future provider changes do not require another schema rename.
ALTER TABLE `camp_email_reminder`
    CHANGE COLUMN `brevo_message_id` `provider_message_id` VARCHAR(255) NULL;
