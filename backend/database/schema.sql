-- =====================================================================
-- Hospital Management System (HMS) — Database Schema Definition (DDL)
-- Compliant with HMS Software Specification Document
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `hms_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `hms_db`;

-- ---------------------------------------------------------------------
-- 1. ACCESS CONTROL & USER MANAGEMENT
-- ---------------------------------------------------------------------

-- Roles Master Table
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `role_id` INT NOT NULL,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `last_login` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. DEPARTMENTS & STAFF MANAGEMENT
-- ---------------------------------------------------------------------

-- Hospital Departments
CREATE TABLE IF NOT EXISTS `departments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Hospital Employees / Staff
CREATE TABLE IF NOT EXISTS `employees` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL UNIQUE,
    `department_id` INT NOT NULL,
    `employee_code` VARCHAR(30) NOT NULL UNIQUE,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `designation` VARCHAR(100) NOT NULL,
    `hire_date` DATE NOT NULL,
    `salary` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `status` ENUM('active', 'inactive', 'on_leave', 'terminated') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Doctors Profile Table
CREATE TABLE IF NOT EXISTS `doctors` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` INT NOT NULL UNIQUE,
    `department_id` INT NOT NULL,
    `specialization` VARCHAR(100) NOT NULL,
    `license_number` VARCHAR(50) NOT NULL UNIQUE,
    `consultation_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `room_number` VARCHAR(30) NULL,
    `biography` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Doctor Weekly Availability Schedule
CREATE TABLE IF NOT EXISTS `doctor_schedules` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `doctor_id` INT NOT NULL,
    `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `slot_duration_minutes` INT NOT NULL DEFAULT 15,
    `max_patients` INT NOT NULL DEFAULT 20,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE KEY `unique_doctor_day_time` (`doctor_id`, `day_of_week`, `start_time`)
) ENGINE=InnoDB;

-- Staff Daily Attendance
CREATE TABLE IF NOT EXISTS `attendance` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` INT NOT NULL,
    `date` DATE NOT NULL,
    `clock_in` TIME NULL,
    `clock_out` TIME NULL,
    `status` ENUM('present', 'absent', 'late', 'half_day', 'on_leave') NOT NULL DEFAULT 'present',
    `remarks` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE KEY `unique_employee_date` (`employee_id`, `date`)
) ENGINE=InnoDB;

-- Staff Leave Records
CREATE TABLE IF NOT EXISTS `leave_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` INT NOT NULL,
    `leave_type` ENUM('casual', 'sick', 'annual', 'maternity', 'emergency') NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `approved_by` INT NULL,
    `decision_notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. PATIENT MANAGEMENT & ADMISSIONS
-- ---------------------------------------------------------------------

-- Patients Master Table
CREATE TABLE IF NOT EXISTS `patients` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `mrn` VARCHAR(30) NOT NULL UNIQUE, -- Medical Record Number (e.g., HOSP-2026-00001)
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `dob` DATE NOT NULL,
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
    `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown') DEFAULT 'Unknown',
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NULL,
    `address` TEXT NULL,
    `emergency_contact_name` VARCHAR(100) NULL,
    `emergency_contact_phone` VARCHAR(20) NULL,
    `emergency_contact_relation` VARCHAR(50) NULL,
    `allergies` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_patient_name` (`last_name`, `first_name`),
    INDEX `idx_patient_phone` (`phone`)
) ENGINE=InnoDB;

-- Patient Uploaded Documents
CREATE TABLE IF NOT EXISTS `patient_documents` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `patient_id` INT NOT NULL,
    `uploaded_by` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `file_path` VARCHAR(255) NOT NULL,
    `file_type` VARCHAR(50) NOT NULL,
    `file_size_bytes` BIGINT NOT NULL,
    `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Inpatient Admissions (IPD)
CREATE TABLE IF NOT EXISTS `admissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `patient_id` INT NOT NULL,
    `attending_doctor_id` INT NOT NULL,
    `ward_type` ENUM('General', 'Semi-Private', 'Private', 'ICU', 'Emergency') NOT NULL DEFAULT 'General',
    `bed_number` VARCHAR(30) NOT NULL,
    `admission_date` DATETIME NOT NULL,
    `discharge_date` DATETIME NULL DEFAULT NULL,
    `admission_reason` TEXT NOT NULL,
    `discharge_summary` TEXT NULL,
    `daily_rate` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `status` ENUM('admitted', 'discharged', 'transferred') NOT NULL DEFAULT 'admitted',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (`attending_doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. APPOINTMENT MANAGEMENT
-- ---------------------------------------------------------------------

-- Appointments Table
CREATE TABLE IF NOT EXISTS `appointments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `patient_id` INT NOT NULL,
    `doctor_id` INT NOT NULL,
    `appointment_date` DATE NOT NULL,
    `time_slot` TIME NOT NULL,
    `status` ENUM('scheduled', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'scheduled',
    `reason_for_visit` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX `idx_doctor_date` (`doctor_id`, `appointment_date`),
    INDEX `idx_patient_date` (`patient_id`, `appointment_date`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. ELECTRONIC MEDICAL RECORDS (EMR) & PRESCRIPTIONS
-- ---------------------------------------------------------------------

-- Clinical Consultations / Medical Records
CREATE TABLE IF NOT EXISTS `medical_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `patient_id` INT NOT NULL,
    `doctor_id` INT NOT NULL,
    `appointment_id` INT NULL UNIQUE,
    `encounter_date` DATETIME NOT NULL,
    `chief_complaint` TEXT NOT NULL,
    `vitals_bp` VARCHAR(20) NULL,        -- e.g. 120/80 mmHg
    `vitals_pulse` INT NULL,              -- bpm
    `vitals_temp_c` DECIMAL(4, 1) NULL,   -- Celsius
    `vitals_spo2` INT NULL,               -- Oxygen Saturation %
    `vitals_weight_kg` DECIMAL(5, 2) NULL,
    `examination_notes` TEXT NULL,
    `diagnosis` TEXT NOT NULL,
    `treatment_plan` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Prescriptions Header
CREATE TABLE IF NOT EXISTS `prescriptions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `medical_record_id` INT NOT NULL,
    `patient_id` INT NOT NULL,
    `doctor_id` INT NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('pending', 'partially_dispensed', 'dispensed', 'cancelled') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. PHARMACY & INVENTORY MANAGEMENT
-- ---------------------------------------------------------------------

-- Medicines Master Catalog
CREATE TABLE IF NOT EXISTS `medicines` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `generic_name` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL, -- Antibiotic, Analgesic, Antipyretic, etc.
    `dosage_form` ENUM('Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler') NOT NULL,
    `strength` VARCHAR(50) NOT NULL, -- e.g. 500mg, 10ml
    `unit_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `reorder_level` INT NOT NULL DEFAULT 50,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_medicine_name` (`name`),
    INDEX `idx_generic_name` (`generic_name`)
) ENGINE=InnoDB;

-- Medicine Stock Batches (with Expiry Tracking)
CREATE TABLE IF NOT EXISTS `medicine_batches` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `medicine_id` INT NOT NULL,
    `batch_number` VARCHAR(50) NOT NULL,
    `quantity_received` INT NOT NULL,
    `quantity_available` INT NOT NULL,
    `unit_cost` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `expiry_date` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    UNIQUE KEY `unique_batch_per_med` (`medicine_id`, `batch_number`),
    INDEX `idx_expiry` (`expiry_date`)
) ENGINE=InnoDB;

-- Prescription Items (Line Items)
CREATE TABLE IF NOT EXISTS `prescription_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `prescription_id` INT NOT NULL,
    `medicine_id` INT NOT NULL,
    `dosage` VARCHAR(50) NOT NULL,           -- e.g. 1 tablet
    `frequency` VARCHAR(50) NOT NULL,        -- e.g. Twice daily after meals
    `duration_days` INT NOT NULL DEFAULT 5,
    `quantity_prescribed` INT NOT NULL,
    `quantity_dispensed` INT NOT NULL DEFAULT 0,
    `instructions` VARCHAR(255) NULL,
    FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. LABORATORY MANAGEMENT
-- ---------------------------------------------------------------------

-- Lab Tests Master Catalog
CREATE TABLE IF NOT EXISTS `lab_tests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `test_code` VARCHAR(30) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL, -- Hematology, Biochemistry, Microbiology, Pathology
    `standard_cost` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `reference_range` VARCHAR(150) NULL,
    `unit` VARCHAR(30) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Lab Test Requisitions / Requests
CREATE TABLE IF NOT EXISTS `lab_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `patient_id` INT NOT NULL,
    `doctor_id` INT NOT NULL,
    `test_id` INT NOT NULL,
    `medical_record_id` INT NULL,
    `status` ENUM('ordered', 'sample_collected', 'in_process', 'completed', 'cancelled') NOT NULL DEFAULT 'ordered',
    `sample_type` VARCHAR(50) NULL, -- Blood, Urine, Sputum, etc.
    `sample_collected_at` DATETIME NULL,
    `ordered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (`test_id`) REFERENCES `lab_tests`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records`(`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Lab Test Results
CREATE TABLE IF NOT EXISTS `lab_results` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `lab_request_id` INT NOT NULL UNIQUE,
    `recorded_by_user_id` INT NOT NULL,
    `result_value` VARCHAR(255) NOT NULL,
    `is_abnormal` BOOLEAN NOT NULL DEFAULT FALSE,
    `remarks` TEXT NULL,
    `verified_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`lab_request_id`) REFERENCES `lab_requests`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. BILLING, INVOICING & PAYMENTS
-- ---------------------------------------------------------------------

-- Master Invoices / Bills
CREATE TABLE IF NOT EXISTS `bills` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `invoice_number` VARCHAR(30) NOT NULL UNIQUE, -- e.g. INV-2026-00001
    `patient_id` INT NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `tax_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `net_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `paid_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `balance_due` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `status` ENUM('unpaid', 'partially_paid', 'paid', 'cancelled') NOT NULL DEFAULT 'unpaid',
    `due_date` DATE NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX `idx_bill_status` (`status`)
) ENGINE=InnoDB;

-- Bill Line Items (Unified Ledger for all services)
CREATE TABLE IF NOT EXISTS `bill_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `bill_id` INT NOT NULL,
    `item_type` ENUM('consultation', 'laboratory', 'pharmacy', 'admission', 'other') NOT NULL,
    `reference_id` INT NULL, -- links to appointment_id, lab_request_id, prescription_id, admission_id
    `description` VARCHAR(255) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Payments Received Table
CREATE TABLE IF NOT EXISTS `payments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `receipt_number` VARCHAR(30) NOT NULL UNIQUE, -- e.g. REC-2026-00001
    `bill_id` INT NOT NULL,
    `received_by_user_id` INT NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 'mobile_money') NOT NULL DEFAULT 'cash',
    `transaction_reference` VARCHAR(100) NULL,
    `payment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `notes` VARCHAR(255) NULL,
    FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (`received_by_user_id`) REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. AUDIT LOGGING & SYSTEM SECURITY
-- ---------------------------------------------------------------------

-- Immutable Audit Log Trail
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `action` VARCHAR(50) NOT NULL,          -- e.g. LOGIN, LOGOUT, CREATE, UPDATE, DELETE, DISPENSE
    `entity_name` VARCHAR(50) NOT NULL,     -- e.g. patients, bills, prescriptions
    `entity_id` INT NULL,
    `details` JSON NULL,                    -- Snapshot of changes / parameters
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX `idx_audit_user` (`user_id`),
    INDEX `idx_audit_action` (`action`),
    INDEX `idx_audit_entity` (`entity_name`, `entity_id`)
) ENGINE=InnoDB;
