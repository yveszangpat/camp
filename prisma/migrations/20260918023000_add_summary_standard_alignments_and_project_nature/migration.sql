ALTER TABLE `camp_project_summary_document`
  ADD COLUMN `project_nature` VARCHAR(30) NOT NULL DEFAULT 'CONTINUING' AFTER `activity_order`,
  ADD COLUMN `standard_alignments` JSON NULL AFTER `standards`;

UPDATE `camp_project_summary_document`
SET `project_nature` = CASE
  WHEN `project_type` = 'NEW' THEN 'NEW'
  WHEN `project_type` = 'CONTINUING' THEN 'CONTINUING'
  WHEN `plan_alignment` = 'OUTSIDE_ACTION_PLAN' THEN 'OUTSIDE_ACTION_PLAN'
  ELSE 'IN_EVALUATION_PLAN'
END;

UPDATE `camp_project_summary_document`
SET `standard_alignments` = JSON_ARRAY()
WHERE `standard_alignments` IS NULL;

ALTER TABLE `camp_project_summary_document`
  MODIFY COLUMN `standard_alignments` JSON NOT NULL;
