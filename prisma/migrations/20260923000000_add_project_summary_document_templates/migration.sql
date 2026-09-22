CREATE TABLE `project_summary_document_template` (
    `project_summary_document_template_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(500) NULL,
    `template_data` JSON NOT NULL,
    `created_by_teacher_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `summary_doc_template_teacher_name_key`(`created_by_teacher_id`, `name`),
    INDEX `summary_doc_template_teacher_updated_idx`(`created_by_teacher_id`, `updated_at`),
    PRIMARY KEY (`project_summary_document_template_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `project_summary_document_template`
    ADD CONSTRAINT `summary_doc_template_teacher_fkey`
    FOREIGN KEY (`created_by_teacher_id`) REFERENCES `teachers`(`teachers_id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
