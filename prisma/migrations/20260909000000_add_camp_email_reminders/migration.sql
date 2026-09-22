-- Durable queue and idempotency record for camp reminder emails.
CREATE TABLE `camp_email_reminder` (
    `reminder_id` INTEGER NOT NULL AUTO_INCREMENT,
    `camp_camp_id` INTEGER NOT NULL,
    `recipient_key` VARCHAR(64) NOT NULL,
    `recipient_email` VARCHAR(255) NOT NULL,
    `recipient_name` VARCHAR(255) NOT NULL,
    `camp_start_date_key` VARCHAR(10) NOT NULL,
    `reminder_type` VARCHAR(30) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `brevo_message_id` VARCHAR(255) NULL,
    `batch_key` VARCHAR(64) NULL,
    `claim_token` VARCHAR(64) NULL,
    `claimed_at` DATETIME(3) NULL,
    `sent_at` DATETIME(3) NULL,
    `last_error` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`reminder_id`),
    UNIQUE INDEX `camp_email_reminder_camp_recipient_date_type_key`(`camp_camp_id`, `recipient_key`, `camp_start_date_key`, `reminder_type`),
    INDEX `camp_email_reminder_status_date_created_idx`(`status`, `camp_start_date_key`, `created_at`),
    INDEX `camp_email_reminder_camp_status_idx`(`camp_camp_id`, `status`),
    CONSTRAINT `camp_email_reminder_camp_camp_id_fkey` FOREIGN KEY (`camp_camp_id`) REFERENCES `camp`(`camp_id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- One row per Bangkok day prevents overlapping Cron runs and persists the
-- daily Brevo quota across duplicate/manual invocations.
CREATE TABLE `camp_email_daily_run` (
    `date_key` VARCHAR(10) NOT NULL,
    `attempted_count` INTEGER NOT NULL DEFAULT 0,
    `sent_count` INTEGER NOT NULL DEFAULT 0,
    `failed_count` INTEGER NOT NULL DEFAULT 0,
    `uncertain_count` INTEGER NOT NULL DEFAULT 0,
    `lock_token` VARCHAR(64) NULL,
    `locked_at` DATETIME(3) NULL,
    `last_started_at` DATETIME(3) NULL,
    `last_finished_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`date_key`),
    INDEX `camp_email_daily_run_locked_at_idx`(`locked_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
