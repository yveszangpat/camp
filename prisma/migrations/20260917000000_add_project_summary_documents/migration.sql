CREATE TABLE `camp_project_summary_document` (
    `camp_project_summary_document_id` INTEGER NOT NULL AUTO_INCREMENT,
    `camp_camp_id` INTEGER NOT NULL,
    `fiscal_year` INTEGER NOT NULL,
    `project_name` VARCHAR(500) NOT NULL,
    `project_code` VARCHAR(100) NULL,
    `activity_name` VARCHAR(500) NULL,
    `activity_order` VARCHAR(100) NULL,
    `project_type` VARCHAR(30) NOT NULL DEFAULT 'CONTINUING',
    `standards` TEXT NULL,
    `strategy` TEXT NULL,
    `responsible_people` TEXT NULL,
    `department` VARCHAR(500) NULL,
    `execution_status` VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    `duration_text` VARCHAR(500) NULL,
    `location_text` VARCHAR(500) NULL,
    `budget_received` DOUBLE NOT NULL DEFAULT 0,
    `budget_spent` DOUBLE NOT NULL DEFAULT 0,
    `budget_source` VARCHAR(100) NULL,
    `quantitative_results` JSON NOT NULL,
    `qualitative_results` JSON NOT NULL,
    `success_indicators` JSON NOT NULL,
    `evaluation_results` JSON NOT NULL,
    `evaluation_summary` LONGTEXT NULL,
    `overall_average` DOUBLE NULL,
    `overall_sd` DOUBLE NULL,
    `top_strengths` JSON NOT NULL,
    `suggestions` JSON NOT NULL,
    `operation_assessment` JSON NOT NULL,
    `problems` LONGTEXT NULL,
    `recommendations` LONGTEXT NULL,
    `continuation_reason` LONGTEXT NULL,
    `signatories` JSON NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    `finalized_at` DATETIME(3) NULL,
    `source_snapshot_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `camp_project_summary_document_camp_camp_id_key`(`camp_camp_id`),
    INDEX `camp_project_summary_document_camp_camp_id_idx`(`camp_camp_id`),
    INDEX `camp_project_summary_document_status_idx`(`status`),
    PRIMARY KEY (`camp_project_summary_document_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `camp_project_summary_photo` (
    `camp_project_summary_photo_id` INTEGER NOT NULL AUTO_INCREMENT,
    `summary_document_id` INTEGER NOT NULL,
    `image_url` TEXT NOT NULL,
    `public_id` VARCHAR(255) NULL,
    `caption` VARCHAR(500) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `camp_project_summary_photo_summary_document_id_sort_order_idx`(`summary_document_id`, `sort_order`),
    PRIMARY KEY (`camp_project_summary_photo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `camp_project_summary_document` ADD CONSTRAINT `camp_project_summary_document_camp_camp_id_fkey` FOREIGN KEY (`camp_camp_id`) REFERENCES `camp`(`camp_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `camp_project_summary_photo` ADD CONSTRAINT `camp_project_summary_photo_summary_document_id_fkey` FOREIGN KEY (`summary_document_id`) REFERENCES `camp_project_summary_document`(`camp_project_summary_document_id`) ON DELETE CASCADE ON UPDATE CASCADE;
