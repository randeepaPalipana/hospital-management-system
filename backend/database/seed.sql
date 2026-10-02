-- =====================================================================
-- Hospital Management System (HMS) — Initial Master Data Seed Script
-- =====================================================================

USE `hms_db`;

-- ---------------------------------------------------------------------
-- 1. SEED ROLES (Matching PDF Specification)
-- ---------------------------------------------------------------------
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'Administrator', 'Full system access, user administration, HR oversight, and institutional reports'),
(2, 'Doctor', 'Clinical examinations, patient diagnosis, prescriptions, and lab test orders'),
(3, 'Nurse', 'Inpatient care, vitals tracking, ward bed monitoring, and nursing observations'),
(4, 'Receptionist', 'Front desk registration, patient intake, and appointment booking'),
(5, 'Laboratory Staff', 'Diagnostic sample collection, test processing, and lab results entry'),
(6, 'Pharmacist', 'Prescription fulfillment, medicine inventory, and stock batch tracking'),
(7, 'Accountant', 'Billing ledger, invoice generation, payment receipting, and financial accounts')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- ---------------------------------------------------------------------
-- 2. SEED DEPARTMENTS
-- ---------------------------------------------------------------------
INSERT INTO `departments` (`id`, `name`, `code`, `description`) VALUES
(1, 'General Medicine', 'GMED', 'Primary healthcare, general adult diagnosis and non-surgical care'),
(2, 'Cardiology', 'CARD', 'Heart, cardiovascular disease diagnosis, ECG, and treatment'),
(3, 'Pediatrics', 'PED', 'Medical care for infants, children, and adolescents'),
(4, 'Orthopedics', 'ORTH', 'Musculoskeletal system, bone fractures, and joint care'),
(5, 'Neurology', 'NEUR', 'Disorders of the nervous system and brain'),
(6, 'Emergency & Trauma', 'EMER', '24/7 urgent trauma, acute triage, and critical resuscitation'),
(7, 'Laboratory Services', 'LAB', 'Diagnostic pathology, hematology, and biochemistry tests'),
(8, 'Pharmacy Services', 'PHARM', 'Hospital drug dispensing and pharmaceutical inventory')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- ---------------------------------------------------------------------
-- 3. SEED DEFAULT ROOT ADMINISTRATOR USER
-- Default Password: Admin@123456 (bcrypt hash, 10 rounds)
-- ---------------------------------------------------------------------
INSERT INTO `users` (`id`, `role_id`, `username`, `email`, `password_hash`, `is_active`) VALUES
(1, 1, 'admin', 'admin@hospital.com', '$2a$10$LdZlaqZkB5PxrSNz3ImSb.biXmpEbJK5RvVzzG7Rv0wV785SMYfDy', TRUE)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `password_hash` = VALUES(`password_hash`);

-- Link default admin user to an Employee profile
INSERT INTO `employees` (`id`, `user_id`, `department_id`, `employee_code`, `first_name`, `last_name`, `gender`, `phone`, `email`, `designation`, `hire_date`, `salary`, `status`) VALUES
(1, 1, 1, 'EMP-0001', 'System', 'Administrator', 'Male', '+1-555-0100', 'admin@hospital.com', 'Hospital Chief Administrator', '2026-01-01', 95000.00, 'active')
ON DUPLICATE KEY UPDATE `employee_code` = VALUES(`employee_code`);

-- ---------------------------------------------------------------------
-- 4. SEED STANDARD LABORATORY TESTS CATALOG
-- ---------------------------------------------------------------------
INSERT INTO `lab_tests` (`id`, `test_code`, `name`, `category`, `standard_cost`, `reference_range`, `unit`) VALUES
(1, 'CBC', 'Complete Blood Count', 'Hematology', 25.00, 'WBC: 4.5-11.0, RBC: 4.5-5.9, Hb: 13.5-17.5', 'cells/mcL'),
(2, 'FBS', 'Fasting Blood Sugar', 'Biochemistry', 15.00, '70 - 99', 'mg/dL'),
(3, 'LIPID', 'Lipid Profile Panel', 'Biochemistry', 45.00, 'Cholesterol < 200, Triglycerides < 150', 'mg/dL'),
(4, 'LFT', 'Liver Function Test', 'Biochemistry', 50.00, 'ALT: 7-56, AST: 10-40, Bilirubin: 0.1-1.2', 'U/L'),
(5, 'RFT', 'Renal Function Test (Creatinine + BUN)', 'Biochemistry', 35.00, 'Creatinine: 0.7-1.3, BUN: 7-20', 'mg/dL'),
(6, 'URINE_R', 'Urine Routine Examination', 'Pathology', 20.00, 'Color: Pale Yellow, Protein: Nil, Sugar: Nil', 'N/A'),
(7, 'THYROID', 'Thyroid Stimulating Hormone (TSH)', 'Biochemistry', 40.00, '0.4 - 4.0', 'mIU/L'),
(8, 'XRAY_CHEST', 'Chest X-Ray (PA View)', 'Radiology', 60.00, 'Normal lung fields and cardiac silhouette', 'N/A')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ---------------------------------------------------------------------
-- 5. SEED ESSENTIAL MEDICINES CATALOG
-- ---------------------------------------------------------------------
INSERT INTO `medicines` (`id`, `name`, `generic_name`, `category`, `dosage_form`, `strength`, `unit_price`, `reorder_level`) VALUES
(1, 'Amoxil', 'Amoxicillin', 'Antibiotic', 'Capsule', '500mg', 0.85, 100),
(2, 'Panadol', 'Paracetamol', 'Analgesic / Antipyretic', 'Tablet', '500mg', 0.25, 200),
(3, 'Brufen', 'Ibuprofen', 'NSAID / Anti-inflammatory', 'Tablet', '400mg', 0.40, 150),
(4, 'Glucophage', 'Metformin', 'Antidiabetic', 'Tablet', '500mg', 0.50, 100),
(5, 'Lipitor', 'Atorvastatin', 'Antihyperlipidemic', 'Tablet', '20mg', 1.20, 80),
(6, 'Prilosec', 'Omeprazole', 'Proton Pump Inhibitor (PPI)', 'Capsule', '20mg', 0.75, 120),
(7, 'Zyrtec', 'Cetirizine', 'Antihistamine', 'Tablet', '10mg', 0.35, 100),
(8, 'Ventolin Inhaler', 'Salbutamol', 'Bronchodilator', 'Inhaler', '100mcg', 12.50, 30),
(9, 'Augmentin', 'Amoxicillin + Clavulanate', 'Antibiotic', 'Tablet', '625mg', 2.10, 60),
(10, 'Norvasc', 'Amlodipine', 'Antihypertensive', 'Tablet', '5mg', 0.60, 100)
ON DUPLICATE KEY UPDATE `generic_name` = VALUES(`generic_name`);

-- Seed Initial Batches for stock availability
INSERT INTO `medicine_batches` (`id`, `medicine_id`, `batch_number`, `quantity_received`, `quantity_available`, `unit_cost`, `expiry_date`) VALUES
(1, 1, 'BATCH-AMX-001', 500, 500, 0.50, '2027-12-31'),
(2, 2, 'BATCH-PAN-001', 1000, 1000, 0.10, '2028-06-30'),
(3, 3, 'BATCH-BRU-001', 600, 600, 0.20, '2027-09-30'),
(4, 4, 'BATCH-GLU-001', 400, 400, 0.25, '2027-11-30'),
(5, 5, 'BATCH-LIP-001', 300, 300, 0.70, '2027-08-31'),
(6, 6, 'BATCH-PRI-001', 450, 450, 0.40, '2028-01-31'),
(7, 7, 'BATCH-ZYR-001', 500, 500, 0.15, '2027-10-31'),
(8, 8, 'BATCH-VEN-001', 100, 100, 8.00, '2028-03-31')
ON DUPLICATE KEY UPDATE `quantity_available` = VALUES(`quantity_available`);
