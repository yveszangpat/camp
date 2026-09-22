ALTER TABLE `camp_bus_event`
  MODIFY COLUMN `event_type` ENUM(
    'BOARD',
    'ALIGHT',
    'PARK',
    'DEPART',
    'REMIND_BOARD',
    'REMIND_ALIGHT'
  ) NOT NULL;
