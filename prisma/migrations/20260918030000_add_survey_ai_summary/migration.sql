ALTER TABLE `survey`
  ADD COLUMN `ai_summary` JSON NULL,
  ADD COLUMN `ai_summary_updated_at` DATETIME(3) NULL;
