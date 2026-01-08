-- CreateTable
CREATE TABLE `teachers` (
    `teachers_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` ENUM('TEACHER', 'CAMP_LEADER', 'ADMIN') NOT NULL DEFAULT 'TEACHER',
    `firstname` VARCHAR(255) NOT NULL,
    `lastname` VARCHAR(255) NOT NULL,
    `tel` VARCHAR(10) NOT NULL,
    `email` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`teachers_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `students_id` INTEGER NOT NULL,
    `firstname` VARCHAR(255) NOT NULL,
    `lastname` VARCHAR(255) NOT NULL,
    `food_allergy` VARCHAR(255) NULL,
    `chronic_disease` VARCHAR(255) NULL,
    `remark` VARCHAR(255) NULL,
    `tel` VARCHAR(10) NULL,
    `email` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`students_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parents` (
    `parents_id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstname` VARCHAR(255) NOT NULL,
    `lastname` VARCHAR(255) NOT NULL,
    `tel` VARCHAR(10) NOT NULL,
    `Student_student_id` INTEGER NOT NULL,

    PRIMARY KEY (`parents_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `academic_years` (
    `years_id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` YEAR NOT NULL,

    PRIMARY KEY (`years_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classrooms` (
    `classroom_id` INTEGER NOT NULL AUTO_INCREMENT,
    `type_classroom` VARCHAR(255) NOT NULL,
    `grade` ENUM('1', '2', '3', '4', '5', '6') NOT NULL,
    `academic_years_years_id` INTEGER NOT NULL,
    `teachers_teachers_id` INTEGER NOT NULL,

    PRIMARY KEY (`classroom_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classroom_teacher` (
    `classroom_teacher_id` INTEGER NOT NULL AUTO_INCREMENT,
    `classroom_classroom_id` INTEGER NOT NULL,
    `teacher_teachers_id` INTEGER NOT NULL,

    PRIMARY KEY (`classroom_teacher_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classroom_students` (
    `classroom_students_id` INTEGER NOT NULL AUTO_INCREMENT,
    `classroom_classroom_id` INTEGER NOT NULL,
    `student_students_id` INTEGER NOT NULL,

    PRIMARY KEY (`classroom_students_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `camp` (
    `camp_id` INTEGER NOT NULL AUTO_INCREMENT,
    `location` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `start_shirt_date` DATETIME(3) NOT NULL,
    `end_shirt_date` DATETIME(3) NOT NULL,
    `start_regis_date` DATETIME(3) NOT NULL,
    `end_regis_date` DATETIME(3) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `has_shirt` BOOLEAN NOT NULL DEFAULT false,
    `plan_type_plane_id` INTEGER NOT NULL,
    `created_by_teacher_id` INTEGER NOT NULL,

    PRIMARY KEY (`camp_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_type` (
    `plane_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` ENUM('new', 'continue') NOT NULL,

    PRIMARY KEY (`plane_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `camp_daily_schedule` (
    `daily_schedule_id` INTEGER NOT NULL AUTO_INCREMENT,
    `camp_camp_id` INTEGER NOT NULL,
    `day` INTEGER NOT NULL,

    PRIMARY KEY (`daily_schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `camp_time_slot` (
    `time_slot_id` INTEGER NOT NULL AUTO_INCREMENT,
    `daily_schedule_id` INTEGER NOT NULL,
    `startTime` VARCHAR(5) NOT NULL,
    `endTime` VARCHAR(5) NOT NULL,
    `activity` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`time_slot_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `camp_template` (
    `camp_template_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `camp_camp_id` INTEGER NOT NULL,

    PRIMARY KEY (`camp_template_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `camp_classroom` (
    `camp_classroom_id` INTEGER NOT NULL AUTO_INCREMENT,
    `camp_camp_id` INTEGER NOT NULL,
    `classroom_classroom_id` INTEGER NOT NULL,

    PRIMARY KEY (`camp_classroom_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher_enrollment` (
    `teacher_enrollment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `teacher_teachers_id` INTEGER NOT NULL,
    `camp_camp_id` INTEGER NOT NULL,

    PRIMARY KEY (`teacher_enrollment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_enrollment` (
    `student_enrollment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `enrolled_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `shirt_size` VARCHAR(10) NOT NULL,
    `student_students_id` INTEGER NOT NULL,
    `camp_camp_id` INTEGER NOT NULL,

    PRIMARY KEY (`student_enrollment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_record_student` (
    `record_id` INTEGER NOT NULL AUTO_INCREMENT,
    `checkin_time` DATETIME(3) NOT NULL,
    `attendance_teacher_session_id` INTEGER NOT NULL,

    PRIMARY KEY (`record_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_teachers` (
    `session_id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` TEXT NOT NULL,
    `methed` ENUM('QR', 'NFC', 'default') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `camp_camp_id` INTEGER NOT NULL,
    `teacher_enrollment_teacher_enrollment_id` INTEGER NOT NULL,

    PRIMARY KEY (`session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificate` (
    `certificate_id` INTEGER NOT NULL AUTO_INCREMENT,
    `issue_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `file_url` VARCHAR(255) NOT NULL,
    `certificate_no` INTEGER NOT NULL,
    `certificate_no_star` INTEGER NOT NULL,
    `student_enrollment_id` INTEGER NOT NULL,

    PRIMARY KEY (`certificate_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `station` (
    `station_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `camp_camp_id` INTEGER NOT NULL,

    PRIMARY KEY (`station_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mission` (
    `mission_id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(255) NOT NULL,
    `station_station_id` INTEGER NOT NULL,

    PRIMARY KEY (`mission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mission_result` (
    `mission_result_id` INTEGER NOT NULL AUTO_INCREMENT,
    `mothod` ENUM('NFC', 'QR', 'Code', 'Aws', 'Photo') NOT NULL,
    `status` ENUM('pending', 'comple', 'completed') NOT NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `student_enrollment_id` INTEGER NOT NULL,
    `mission_mission_id` INTEGER NOT NULL,

    PRIMARY KEY (`mission_result_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mission_question` (
    `question_id` INTEGER NOT NULL AUTO_INCREMENT,
    `question_text` VARCHAR(255) NOT NULL,
    `question_type` ENUM('MCQ', 'TEXT') NOT NULL,
    `mission_mission_id` INTEGER NOT NULL,

    PRIMARY KEY (`question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_mcq_detail` (
    `question_mcq_detail_id` INTEGER NOT NULL AUTO_INCREMENT,
    `choice_a` VARCHAR(255) NOT NULL,
    `choice_b` VARCHAR(255) NOT NULL,
    `choice_c` VARCHAR(255) NOT NULL,
    `choice_d` VARCHAR(255) NOT NULL,
    `correct_choice` VARCHAR(1) NOT NULL,

    PRIMARY KEY (`question_mcq_detail_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mission_answer` (
    `answer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `mission_result_mission_result_id` INTEGER NOT NULL,
    `mission_question_question_id` INTEGER NOT NULL,

    PRIMARY KEY (`answer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answer_mcq` (
    `mission_answer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `question_text` VARCHAR(1) NOT NULL,

    PRIMARY KEY (`mission_answer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answer_text` (
    `mission_answer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `answer_text` TEXT NOT NULL,

    PRIMARY KEY (`mission_answer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation` (
    `evaluation_id` INTEGER NOT NULL AUTO_INCREMENT,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('pending', 'completed') NOT NULL,
    `student_enrollment_id` INTEGER NOT NULL,
    `camp_camp_id` INTEGER NOT NULL,

    PRIMARY KEY (`evaluation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation_question` (
    `question_id` INTEGER NOT NULL AUTO_INCREMENT,
    `question_text` VARCHAR(255) NOT NULL,
    `question_type` ENUM('scale', 'text') NOT NULL,
    `scale_max` INTEGER NULL,

    PRIMARY KEY (`question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation_answer` (
    `answer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `scale_value` INTEGER NULL,
    `text_answer` TEXT NULL,
    `evaluation_evaluation_id` INTEGER NOT NULL,
    `evaluation_question_question_id` INTEGER NOT NULL,

    PRIMARY KEY (`answer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suggestion_analysis_summary` (
    `suggestion_analysis_summary_id` INTEGER NOT NULL AUTO_INCREMENT,
    `summary_text` TEXT NOT NULL,
    `overall_sentiment` VARCHAR(255) NOT NULL,
    `positive_themes` TEXT NOT NULL,
    `improvement_areas` TEXT NOT NULL,
    `positive_percentage` DOUBLE NOT NULL,
    `negative_percentage` DOUBLE NOT NULL,
    `evaluation_answer_evaluation_id` INTEGER NOT NULL,

    PRIMARY KEY (`suggestion_analysis_summary_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `parents` ADD CONSTRAINT `parents_Student_student_id_fkey` FOREIGN KEY (`Student_student_id`) REFERENCES `students`(`students_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classrooms` ADD CONSTRAINT `classrooms_academic_years_years_id_fkey` FOREIGN KEY (`academic_years_years_id`) REFERENCES `academic_years`(`years_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classrooms` ADD CONSTRAINT `classrooms_teachers_teachers_id_fkey` FOREIGN KEY (`teachers_teachers_id`) REFERENCES `teachers`(`teachers_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classroom_teacher` ADD CONSTRAINT `classroom_teacher_classroom_classroom_id_fkey` FOREIGN KEY (`classroom_classroom_id`) REFERENCES `classrooms`(`classroom_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classroom_teacher` ADD CONSTRAINT `classroom_teacher_teacher_teachers_id_fkey` FOREIGN KEY (`teacher_teachers_id`) REFERENCES `teachers`(`teachers_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classroom_students` ADD CONSTRAINT `classroom_students_classroom_classroom_id_fkey` FOREIGN KEY (`classroom_classroom_id`) REFERENCES `classrooms`(`classroom_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classroom_students` ADD CONSTRAINT `classroom_students_student_students_id_fkey` FOREIGN KEY (`student_students_id`) REFERENCES `students`(`students_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `camp` ADD CONSTRAINT `camp_plan_type_plane_id_fkey` FOREIGN KEY (`plan_type_plane_id`) REFERENCES `plan_type`(`plane_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `camp` ADD CONSTRAINT `camp_created_by_teacher_id_fkey` FOREIGN KEY (`created_by_teacher_id`) REFERENCES `teachers`(`teachers_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `camp_daily_schedule` ADD CONSTRAINT `camp_daily_schedule_camp_camp_id_fkey` FOREIGN KEY (`camp_camp_id`) REFERENCES `camp`(`camp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `camp_time_slot` ADD CONSTRAINT `camp_time_slot_daily_schedule_id_fkey` FOREIGN KEY (`daily_schedule_id`) REFERENCES `camp_daily_schedule`(`daily_schedule_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `camp_template` ADD CONSTRAINT `camp_template_camp_camp_id_fkey` FOREIGN KEY (`camp_camp_id`) REFERENCES `camp`(`camp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `camp_classroom` ADD CONSTRAINT `camp_classroom_camp_camp_id_fkey` FOREIGN KEY (`camp_camp_id`) REFERENCES `camp`(`camp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `camp_classroom` ADD CONSTRAINT `camp_classroom_classroom_classroom_id_fkey` FOREIGN KEY (`classroom_classroom_id`) REFERENCES `classrooms`(`classroom_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher_enrollment` ADD CONSTRAINT `teacher_enrollment_teacher_teachers_id_fkey` FOREIGN KEY (`teacher_teachers_id`) REFERENCES `teachers`(`teachers_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher_enrollment` ADD CONSTRAINT `teacher_enrollment_camp_camp_id_fkey` FOREIGN KEY (`camp_camp_id`) REFERENCES `camp`(`camp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_enrollment` ADD CONSTRAINT `student_enrollment_student_students_id_fkey` FOREIGN KEY (`student_students_id`) REFERENCES `students`(`students_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_enrollment` ADD CONSTRAINT `student_enrollment_camp_camp_id_fkey` FOREIGN KEY (`camp_camp_id`) REFERENCES `camp`(`camp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_record_student` ADD CONSTRAINT `attendance_record_student_attendance_teacher_session_id_fkey` FOREIGN KEY (`attendance_teacher_session_id`) REFERENCES `attendance_teachers`(`session_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_teachers` ADD CONSTRAINT `attendance_teachers_camp_camp_id_fkey` FOREIGN KEY (`camp_camp_id`) REFERENCES `camp`(`camp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_teachers` ADD CONSTRAINT `attendance_teachers_teacher_enrollment_teacher_enrollment_i_fkey` FOREIGN KEY (`teacher_enrollment_teacher_enrollment_id`) REFERENCES `teacher_enrollment`(`teacher_enrollment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificate` ADD CONSTRAINT `certificate_student_enrollment_id_fkey` FOREIGN KEY (`student_enrollment_id`) REFERENCES `student_enrollment`(`student_enrollment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `station` ADD CONSTRAINT `station_camp_camp_id_fkey` FOREIGN KEY (`camp_camp_id`) REFERENCES `camp`(`camp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mission` ADD CONSTRAINT `mission_station_station_id_fkey` FOREIGN KEY (`station_station_id`) REFERENCES `station`(`station_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mission_result` ADD CONSTRAINT `mission_result_student_enrollment_id_fkey` FOREIGN KEY (`student_enrollment_id`) REFERENCES `student_enrollment`(`student_enrollment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mission_result` ADD CONSTRAINT `mission_result_mission_mission_id_fkey` FOREIGN KEY (`mission_mission_id`) REFERENCES `mission`(`mission_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mission_question` ADD CONSTRAINT `mission_question_mission_mission_id_fkey` FOREIGN KEY (`mission_mission_id`) REFERENCES `mission`(`mission_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mission_answer` ADD CONSTRAINT `mission_answer_mission_result_mission_result_id_fkey` FOREIGN KEY (`mission_result_mission_result_id`) REFERENCES `mission_result`(`mission_result_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mission_answer` ADD CONSTRAINT `mission_answer_mission_question_question_id_fkey` FOREIGN KEY (`mission_question_question_id`) REFERENCES `mission_question`(`question_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluation` ADD CONSTRAINT `evaluation_student_enrollment_id_fkey` FOREIGN KEY (`student_enrollment_id`) REFERENCES `student_enrollment`(`student_enrollment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluation` ADD CONSTRAINT `evaluation_camp_camp_id_fkey` FOREIGN KEY (`camp_camp_id`) REFERENCES `camp`(`camp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluation_answer` ADD CONSTRAINT `evaluation_answer_evaluation_evaluation_id_fkey` FOREIGN KEY (`evaluation_evaluation_id`) REFERENCES `evaluation`(`evaluation_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluation_answer` ADD CONSTRAINT `evaluation_answer_evaluation_question_question_id_fkey` FOREIGN KEY (`evaluation_question_question_id`) REFERENCES `evaluation_question`(`question_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `suggestion_analysis_summary` ADD CONSTRAINT `suggestion_analysis_summary_evaluation_answer_evaluation_id_fkey` FOREIGN KEY (`evaluation_answer_evaluation_id`) REFERENCES `evaluation_answer`(`answer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
