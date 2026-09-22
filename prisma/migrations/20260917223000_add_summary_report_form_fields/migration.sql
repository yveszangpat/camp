ALTER TABLE `camp_project_summary_document`
    ADD COLUMN `plan_alignment` VARCHAR(30) NOT NULL DEFAULT 'IN_EVALUATION_PLAN',
    ADD COLUMN `objectives` JSON NULL;

UPDATE `camp_project_summary_document`
SET `objectives` = JSON_ARRAY()
WHERE `objectives` IS NULL;

ALTER TABLE `camp_project_summary_document`
    MODIFY COLUMN `objectives` JSON NOT NULL;
