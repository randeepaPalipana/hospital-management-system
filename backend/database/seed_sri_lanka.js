/**
 * Sri Lankan Hospital Seed Generator & Database Reset
 * Populates realistic Sri Lankan datasets across all 24 normalized tables.
 */

const path = require('path');
const dotenv = require(path.join(__dirname, '../node_modules/dotenv'));
dotenv.config({ path: path.join(__dirname, '../.env') });

const { query, transaction } = require('../src/config/db');
const bcrypt = require(path.join(__dirname, '../node_modules/bcryptjs'));

async function seedSriLanka() {
  console.log('================================================================');
  console.log('🇱🇰 HMS SRI LANKAN DATASET SEEDING & RESET PROCEDURE');
  console.log('================================================================\n');

  const adminHash = await bcrypt.hash('Admin@123456', 10);
  const staffHash = await bcrypt.hash('Staff@123456', 10);

  // 1. CLEAR EXISTING DATA IN CORRECT DEPENDENCY ORDER
  console.log('🧹 1. Safely purging existing demo records...');
  await query('SET FOREIGN_KEY_CHECKS = 0');
  const tablesToTruncate = [
    'audit_logs', 'payments', 'bill_items', 'bills',
    'lab_results', 'lab_requests', 'lab_tests',
    'prescription_items', 'prescriptions', 'medicine_batches', 'medicines',
    'medical_records', 'appointments', 'admissions', 'patient_documents', 'patients',
    'leave_records', 'attendance', 'doctor_schedules', 'doctors', 'employees',
    'users', 'departments', 'roles'
  ];
  for (const table of tablesToTruncate) {
    await query(`TRUNCATE TABLE \`${table}\``);
  }
  await query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('   Tables truncated successfully.\n');

  // 2. SEED ROLES
  console.log('👑 2. Seeding 7 RBAC Master Roles...');
  const roles = [
    [1, 'Administrator', 'Full system access, user administration, HR oversight, and institutional reports'],
    [2, 'Doctor', 'Clinical examinations, patient diagnosis, prescriptions, and lab test orders'],
    [3, 'Nurse', 'Inpatient care, vitals tracking, ward bed monitoring, and nursing observations'],
    [4, 'Receptionist', 'Front desk registration, patient intake, and appointment booking'],
    [5, 'Laboratory Staff', 'Diagnostic sample collection, test processing, and lab results entry'],
    [6, 'Pharmacist', 'Prescription fulfillment, medicine inventory, and stock batch tracking'],
    [7, 'Accountant', 'Billing ledger, invoice generation, payment receipting, and financial accounts'],
  ];
  for (const r of roles) {
    await query('INSERT INTO roles (id, name, description) VALUES (?, ?, ?)', r);
  }

  // 3. SEED SRI LANKAN HOSPITAL DEPARTMENTS
  console.log('🏥 3. Seeding 10 Sri Lankan Clinical & Operational Departments...');
  const departments = [
    [1, 'General Medicine', 'GMED', 'Adult outpatient triage, non-surgical diagnostics, acute medical care'],
    [2, 'Cardiology', 'CARD', 'Comprehensive cardiac assessment, ECG, echocardiography, hypertension clinic'],
    [3, 'Pediatrics & Neonatology', 'PED', 'Child wellness, immunizations, and pediatric medical care'],
    [4, 'General Surgery', 'GSURG', 'Elective and emergency general surgical procedures and postoperative care'],
    [5, 'Orthopedics & Trauma', 'ORTH', 'Bone fractures, arthritic joint management, sports injuries, and spinal care'],
    [6, 'Obstetrics & Gynecology', 'OBGYN', 'Antenatal care, maternal wellness, obstetrical delivery, and gynecology'],
    [7, 'Neurology', 'NEUR', 'Central and peripheral nervous system disorders, stroke management, epilepsy'],
    [8, 'Emergency & Trauma Unit (ETU)', 'ETU', '24/7 urgent trauma, acute triage, and critical resuscitation'],
    [9, 'Laboratory Services', 'LAB', 'Diagnostic clinical pathology, hematology, biochemistry, and microbiology'],
    [10, 'Pharmacy & Formulary', 'PHARM', 'Central pharmaceutical drug dispensing, inventory, and pharmacovigilance'],
  ];
  for (const d of departments) {
    await query('INSERT INTO departments (id, name, code, description) VALUES (?, ?, ?, ?)', d);
  }

  // 4. SEED USERS & EMPLOYEES
  console.log('👥 4. Seeding 25 Sri Lankan Staff Members & User Accounts...');
  const usersData = [
    // Admins
    [1, 1, 'admin', 'admin@lankahospital.lk', adminHash],
    [2, 1, 'director.chathura', 'chathura.s@lankahospital.lk', staffHash],
    // Doctors (Users 3-12)
    [3, 2, 'dr.anura', 'anura.kumara@lankahospital.lk', staffHash],
    [4, 2, 'dr.malini', 'malini.fonseka@lankahospital.lk', staffHash],
    [5, 2, 'dr.gamini', 'gamini.dissanayake@lankahospital.lk', staffHash],
    [6, 2, 'dr.priyantha', 'priyantha.senanayake@lankahospital.lk', staffHash],
    [7, 2, 'dr.hiruni', 'hiruni.perera@lankahospital.lk', staffHash],
    [8, 2, 'dr.rohan', 'rohan.jayawardena@lankahospital.lk', staffHash],
    [9, 2, 'dr.dilshan', 'dilshan.silva@lankahospital.lk', staffHash],
    [10, 2, 'dr.kavinda', 'kavinda.wijesinghe@lankahospital.lk', staffHash],
    [11, 2, 'dr.nadeeka', 'nadeeka.fernando@lankahospital.lk', staffHash],
    [12, 2, 'dr.sanjaya', 'sanjaya.gunasekara@lankahospital.lk', staffHash],
    // Standard role aliases for demo/testing
    [13, 2, 'doctor1', 'doctor1@lankahospital.lk', staffHash],
    [14, 3, 'nurse1', 'nurse1@lankahospital.lk', staffHash],
    [15, 3, 'nurse.kushani', 'kushani.wickramasinghe@lankahospital.lk', staffHash],
    [16, 3, 'nurse.ishara', 'ishara.bandara@lankahospital.lk', staffHash],
    [17, 4, 'receptionist1', 'receptionist1@lankahospital.lk', staffHash],
    [18, 4, 'recep.dinithi', 'dinithi.alwis@lankahospital.lk', staffHash],
    [19, 5, 'labtech1', 'labtech1@lankahospital.lk', staffHash],
    [20, 5, 'lab.nuwan', 'nuwan.pathirana@lankahospital.lk', staffHash],
    [21, 6, 'pharmacist1', 'pharmacist1@lankahospital.lk', staffHash],
    [22, 6, 'pharm.tharindu', 'tharindu.rathnayake@lankahospital.lk', staffHash],
    [23, 7, 'accountant1', 'accountant1@lankahospital.lk', staffHash],
    [24, 7, 'acc.chamari', 'chamari.atigala@lankahospital.lk', staffHash],
    [25, 4, 'recep.saman', 'saman.kumara@lankahospital.lk', staffHash],
  ];

  for (const u of usersData) {
    await query('INSERT INTO users (id, role_id, username, email, password_hash, is_active) VALUES (?, ?, ?, ?, ?, 1)', u);
  }

  const employeesData = [
    // id, user_id, dept_id, code, first_name, last_name, gender, phone, email, designation, hire_date, salary
    [1, 1, 1, 'EMP-2026-0001', 'Kavinda', 'Senanayake', 'Male', '077 1234501', 'admin@lankahospital.lk', 'Chief Executive Administrator', '2020-01-15', 385000.00],
    [2, 2, 1, 'EMP-2026-0002', 'Chathura', 'Samarakoon', 'Male', '071 2345602', 'chathura.s@lankahospital.lk', 'Medical Director', '2021-03-01', 420000.00],
    // Doctors
    [3, 3, 1, 'EMP-2026-0003', 'Anura', 'Kumara', 'Male', '077 3456703', 'anura.kumara@lankahospital.lk', 'Consultant Physician', '2021-06-15', 350000.00],
    [4, 4, 2, 'EMP-2026-0004', 'Malini', 'Fonseka', 'Female', '072 4567804', 'malini.fonseka@lankahospital.lk', 'Consultant Cardiologist', '2022-01-10', 380000.00],
    [5, 5, 3, 'EMP-2026-0005', 'Gamini', 'Dissanayake', 'Male', '078 5678905', 'gamini.dissanayake@lankahospital.lk', 'Consultant Pediatrician', '2022-04-12', 320000.00],
    [6, 6, 4, 'EMP-2026-0006', 'Priyantha', 'Senanayake', 'Male', '076 6789006', 'priyantha.senanayake@lankahospital.lk', 'Consultant General Surgeon', '2022-08-01', 370000.00],
    [7, 7, 5, 'EMP-2026-0007', 'Hiruni', 'Perera', 'Female', '071 7890107', 'hiruni.perera@lankahospital.lk', 'Consultant Orthopedic Surgeon', '2023-02-15', 360000.00],
    [8, 8, 6, 'EMP-2026-0008', 'Rohan', 'Jayawardena', 'Male', '075 8901208', 'rohan.jayawardena@lankahospital.lk', 'Consultant Obstetrician & Gynaecologist', '2023-05-10', 365000.00],
    [9, 9, 7, 'EMP-2026-0009', 'Dilshan', 'Silva', 'Male', '077 9012309', 'dilshan.silva@lankahospital.lk', 'Consultant Neurologist', '2023-09-01', 375000.00],
    [10, 10, 8, 'EMP-2026-0010', 'Kavinda', 'Wijesinghe', 'Male', '070 0123410', 'kavinda.wijesinghe@lankahospital.lk', 'Emergency Medicine Specialist', '2024-01-15', 290000.00],
    [11, 11, 1, 'EMP-2026-0011', 'Nadeeka', 'Fernando', 'Female', '071 1234511', 'nadeeka.fernando@lankahospital.lk', 'Senior Medical Officer - OPD', '2024-03-01', 240000.00],
    [12, 12, 2, 'EMP-2026-0012', 'Sanjaya', 'Gunasekara', 'Male', '076 2345612', 'sanjaya.gunasekara@lankahospital.lk', 'Cardiology Registrar', '2024-06-10', 250000.00],
    [13, 13, 1, 'EMP-2026-0013', 'Sarah', 'Jayasekara', 'Female', '077 3456713', 'doctor1@lankahospital.lk', 'General Medical Officer', '2024-07-01', 230000.00],
    // Nurses
    [14, 14, 1, 'EMP-2026-0014', 'Kumari', 'Ekanayake', 'Female', '071 4567814', 'nurse1@lankahospital.lk', 'Chief Nursing Officer', '2021-02-10', 145000.00],
    [15, 15, 3, 'EMP-2026-0015', 'Kushani', 'Wickramasinghe', 'Female', '078 5678915', 'kushani.wickramasinghe@lankahospital.lk', 'Senior Pediatric Nurse', '2022-09-15', 125000.00],
    [16, 16, 8, 'EMP-2026-0016', 'Ishara', 'Bandara', 'Female', '072 6789016', 'ishara.bandara@lankahospital.lk', 'ETU Triage Staff Nurse', '2023-04-10', 115000.00],
    // Receptionists
    [17, 17, 1, 'EMP-2026-0017', 'Nalinda', 'Ranasinghe', 'Male', '077 7890117', 'receptionist1@lankahospital.lk', 'Head Receptionist', '2022-05-15', 95000.00],
    [18, 18, 1, 'EMP-2026-0018', 'Dinithi', 'Alwis', 'Female', '076 8901218', 'dinithi.alwis@lankahospital.lk', 'Front Desk Executive', '2023-11-01', 85000.00],
    // Laboratory Staff
    [19, 19, 9, 'EMP-2026-0019', 'Asanka', 'Mendis', 'Male', '071 9012319', 'labtech1@lankahospital.lk', 'Chief Medical Laboratory Technologist', '2021-08-01', 160000.00],
    [20, 20, 9, 'EMP-2026-0020', 'Nuwan', 'Pathirana', 'Male', '075 0123420', 'nuwan.pathirana@lankahospital.lk', 'Laboratory Technologist', '2023-06-15', 120000.00],
    // Pharmacists
    [21, 21, 10, 'EMP-2026-0021', 'Manjula', 'Herath', 'Male', '077 1234521', 'pharmacist1@lankahospital.lk', 'Chief Pharmacist', '2021-07-10', 175000.00],
    [22, 22, 10, 'EMP-2026-0022', 'Tharindu', 'Rathnayake', 'Male', '076 2345622', 'tharindu.rathnayake@lankahospital.lk', 'Staff Dispensing Pharmacist', '2023-10-01', 130000.00],
    // Accountants
    [23, 23, 1, 'EMP-2026-0023', 'Sunil', 'Perera', 'Male', '071 3456723', 'accountant1@lankahospital.lk', 'Chief Financial Accountant', '2020-04-01', 220000.00],
    [24, 24, 1, 'EMP-2026-0024', 'Chamari', 'Atigala', 'Female', '078 4567824', 'chamari.atigala@lankahospital.lk', 'Cashier & Billing Officer', '2023-01-15', 95000.00],
    [25, 25, 1, 'EMP-2026-0025', 'Saman', 'Kumara', 'Male', '072 5678925', 'saman.kumara@lankahospital.lk', 'Registration Clerk', '2024-02-01', 80000.00],
  ];

  for (const emp of employeesData) {
    await query(`
      INSERT INTO employees 
        (id, user_id, department_id, employee_code, first_name, last_name, gender, phone, email, designation, hire_date, salary, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, emp);
  }

  // 5. SEED DOCTORS & SCHEDULES
  console.log('🩺 5. Seeding 11 Sri Lankan Doctors & Clinical Rosters...');
  const doctorsData = [
    // id, emp_id, dept_id, spec, license, fee, room, bio
    [1, 3, 1, 'Internal Medicine', 'SLMC-18294', 2500.00, 'Room 101', 'MBBS (Colombo), MD (Medicine), MRCP (UK). Specialist in adult non-communicable diseases and diabetes mellitus.'],
    [2, 4, 2, 'Cardiology', 'SLMC-15421', 3500.00, 'Room 205', 'MBBS (Peradeniya), MD (Cardiology), FRCP. Expert in ischemic heart disease, cardiac pacing, and preventive cardiology.'],
    [3, 5, 3, 'Pediatrics', 'SLMC-21043', 2500.00, 'Room 104', 'MBBS (Kelaniya), DCH, MD (Pediatrics). Special interest in pediatric asthma, developmental screening, and nutrition.'],
    [4, 6, 4, 'General & Laparoscopic Surgery', 'SLMC-14890', 3000.00, 'Room 302', 'MBBS (Colombo), MS (Surgery), FRCS. Advanced minimally invasive surgery and gastrointestinal procedures.'],
    [5, 7, 5, 'Orthopedic Surgery', 'SLMC-19832', 3000.00, 'Room 208', 'MBBS (Ruhuna), MS (Ortho), Fellowship in Arthroscopy. Joint replacements, fracture trauma, and sports injuries.'],
    [6, 8, 6, 'Obstetrics & Gynecology', 'SLMC-16782', 3200.00, 'Room 210', 'MBBS (Colombo), MS (Obs & Gyn), MRCOG (UK). Maternal-fetal medicine, high-risk pregnancies, and laparoscopic gynecology.'],
    [7, 9, 7, 'Neurology', 'SLMC-13941', 3500.00, 'Room 306', 'MBBS (Peradeniya), MD (Neurology). Comprehensive evaluation of epilepsy, migraine, stroke rehabilitation, and neuropathy.'],
    [8, 10, 8, 'Emergency Medicine', 'SLMC-24105', 2000.00, 'ETU Bay A', 'MBBS (Jaffna), MRCEM. Acute resuscitation, polytrauma resuscitation, and critical emergency intervention.'],
    [9, 11, 1, 'Family Medicine & OPD', 'SLMC-27419', 1800.00, 'Room 102', 'MBBS (Sri Jayewardenepura). Comprehensive general OPD screening and lifestyle illness management.'],
    [10, 12, 2, 'Clinical Cardiology', 'SLMC-28901', 2800.00, 'Room 206', 'MBBS (Peradeniya), PgDip in Cardiology. Cardiac rehabilitation and echocardiographic evaluation.'],
    [11, 13, 1, 'General Medicine', 'SLMC-29402', 2000.00, 'Room 103', 'MBBS (Colombo). General practitioner focusing on acute infections, fever clinics, and health checks.'],
  ];

  for (const doc of doctorsData) {
    await query(`
      INSERT INTO doctors 
        (id, employee_id, department_id, specialization, license_number, consultation_fee, room_number, biography)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, doc);
  }

  // Doctor Schedules (Multiple days per doctor)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let schedId = 1;
  for (let docId = 1; docId <= 11; docId++) {
    // Schedule Monday, Wednesday, Friday
    await query(`
      INSERT INTO doctor_schedules 
        (id, doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients, is_active)
      VALUES 
        (?, ?, 'Monday', '08:30:00', '12:30:00', 15, 20, 1),
        (?, ?, 'Wednesday', '14:00:00', '18:00:00', 15, 20, 1),
        (?, ?, 'Friday', '09:00:00', '13:00:00', 15, 20, 1)
    `, [schedId++, docId, schedId++, docId, schedId++, docId]);
  }

  // 6. SEED 30 SRI LANKAN FORMULARY MEDICINES & BATCHES
  console.log('💊 6. Seeding 30 Essential Formulary Medicines & LKR Inventory Batches...');
  const medicinesData = [
    // id, name, generic, category, dosage_form, strength, unit_price, reorder
    [1, 'Panadol', 'Paracetamol', 'Analgesic & Antipyretic', 'Tablet', '500mg', 5.50, 500],
    [2, 'Amoxil', 'Amoxicillin', 'Antibiotic (Penicillin)', 'Capsule', '500mg', 28.00, 200],
    [3, 'Augmentin', 'Amoxicillin + Clavulanate', 'Antibiotic (Broad Spectrum)', 'Tablet', '625mg', 145.00, 150],
    [4, 'Ciprobid', 'Ciprofloxacin', 'Antibiotic (Fluoroquinolone)', 'Tablet', '500mg', 38.00, 100],
    [5, 'Zithromax', 'Azithromycin', 'Antibiotic (Macrolide)', 'Tablet', '500mg', 120.00, 80],
    [6, 'Brufen', 'Ibuprofen', 'NSAID / Anti-inflammatory', 'Tablet', '400mg', 12.00, 300],
    [7, 'Voltaren', 'Diclofenac Sodium', 'NSAID Analgesic', 'Tablet', '50mg', 18.50, 250],
    [8, 'Omez', 'Omeprazole', 'Proton Pump Inhibitor', 'Capsule', '20mg', 22.00, 300],
    [9, 'Pantocid', 'Pantoprazole', 'Proton Pump Inhibitor', 'Tablet', '40mg', 35.00, 200],
    [10, 'Glucophage', 'Metformin Hydrochloride', 'Antidiabetic (Biguanide)', 'Tablet', '500mg', 14.00, 400],
    [11, 'Daonil', 'Glibenclamide', 'Antidiabetic (Sulfonylurea)', 'Tablet', '5mg', 9.50, 150],
    [12, 'Januvia', 'Sitagliptin', 'Antidiabetic (DPP-4 Inhibitor)', 'Tablet', '100mg', 165.00, 80],
    [13, 'Cardiprin', 'Aspirin (Low Dose)', 'Antiplatelet', 'Tablet', '100mg', 8.00, 300],
    [14, 'Lipitor', 'Atorvastatin', 'Statin / Lipid Lowering', 'Tablet', '20mg', 45.00, 250],
    [15, 'Crestor', 'Rosuvastatin', 'Statin / Lipid Lowering', 'Tablet', '10mg', 68.00, 150],
    [16, 'Norvasc', 'Amlodipine', 'Antihypertensive (CCB)', 'Tablet', '5mg', 16.50, 300],
    [17, 'Coversyl', 'Perindopril Arginine', 'Antihypertensive (ACE-I)', 'Tablet', '5mg', 72.00, 120],
    [18, 'Losar', 'Losartan Potassium', 'Antihypertensive (ARB)', 'Tablet', '50mg', 26.00, 250],
    [19, 'Tenormin', 'Atenolol', 'Antihypertensive (Beta Blocker)', 'Tablet', '50mg', 15.00, 200],
    [20, 'Lasix', 'Furosemide', 'Diuretic', 'Tablet', '40mg', 7.50, 150],
    [21, 'Zyrtec', 'Cetirizine Dihydrochloride', 'Antihistamine', 'Tablet', '10mg', 14.50, 300],
    [22, 'Telfast', 'Fexofenadine Hydrochloride', 'Antihistamine', 'Tablet', '120mg', 55.00, 150],
    [23, 'Piriton', 'Chlorpheniramine Maleate', 'Antihistamine', 'Tablet', '4mg', 4.00, 400],
    [24, 'Ventolin Inhaler', 'Salbutamol', 'Bronchodilator', 'Inhaler', '100mcg', 780.00, 50],
    [25, 'Seretide Evohaler', 'Fluticasone + Salmeterol', 'Corticosteroid Inhaler', 'Inhaler', '125mcg', 2450.00, 30],
    [26, 'Solvin Cough Syrup', 'Bromhexine + Pseudoephedrine', 'Expectorant', 'Syrup', '100ml', 380.00, 80],
    [27, 'Flagyl', 'Metronidazole', 'Antiprotozoal / Antibiotic', 'Tablet', '400mg', 12.00, 200],
    [28, 'Gaviscon Liquid', 'Sodium Alginate + Antacid', 'Antacid Suspension', 'Syrup', '150ml', 620.00, 60],
    [29, 'Neurobion', 'Vitamin B1 + B6 + B12', 'Neurotropic Multivitamin', 'Tablet', 'High Potency', 32.00, 200],
    [30, 'Cataflam Drop', 'Diclofenac Resinate', 'Pediatric Analgesic', 'Drops', '15ml', 450.00, 50],
  ];

  for (const m of medicinesData) {
    await query(`
      INSERT INTO medicines 
        (id, name, generic_name, category, dosage_form, strength, unit_price, reorder_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, m);
  }

  // Batches for medicines
  let batchId = 1;
  for (const m of medicinesData) {
    const medId = m[0];
    const cost = (m[6] * 0.65).toFixed(2);
    await query(`
      INSERT INTO medicine_batches 
        (id, medicine_id, batch_number, quantity_received, quantity_available, unit_cost, expiry_date)
      VALUES 
        (?, ?, 'SL-BAT-${medId}01', 500, 480, ?, '2027-10-31'),
        (?, ?, 'SL-BAT-${medId}02', 300, 300, ?, '2028-04-30')
    `, [batchId++, medId, cost, batchId++, medId, cost]);
  }

  // 7. SEED 20 SRI LANKAN LABORATORY TESTS
  console.log('🔬 7. Seeding 20 Sri Lankan Laboratory Diagnostic Tests & LKR Benchmarks...');
  const labTestsData = [
    // id, code, name, category, standard_cost, ref_range, unit
    [1, 'CBC', 'Full Blood Count (FBC/CBC)', 'Hematology', 850.00, 'WBC: 4.0-11.0, RBC: 4.5-5.9, Hb: 13.5-17.5, PLT: 150-450', 'x10^3/uL'],
    [2, 'FBS', 'Fasting Blood Sugar (FBS)', 'Biochemistry', 450.00, '70 - 100', 'mg/dL'],
    [3, 'PPBS', 'Post Prandial Blood Sugar (PPBS)', 'Biochemistry', 450.00, '< 140', 'mg/dL'],
    [4, 'HBA1C', 'Glycated Hemoglobin (HbA1c)', 'Biochemistry', 1850.00, 'Normal: < 5.7%, Prediabetes: 5.7-6.4%', '%'],
    [5, 'LIPID', 'Lipid Profile Panel (Total Chol, HDL, LDL, Trig)', 'Biochemistry', 1950.00, 'Chol: < 200, Trig: < 150, LDL: < 100, HDL: > 40', 'mg/dL'],
    [6, 'LFT', 'Liver Function Tests (SGOT, SGPT, Bilirubin, Alk Phos)', 'Biochemistry', 2200.00, 'ALT: 7-56, AST: 10-40, Total Bilirubin: 0.2-1.2', 'U/L'],
    [7, 'RFT', 'Renal Function Test (Serum Creatinine + Blood Urea)', 'Biochemistry', 1400.00, 'Creatinine: 0.6-1.2, Urea: 15-45', 'mg/dL'],
    [8, 'SE', 'Serum Electrolytes (Na+, K+, Cl-)', 'Biochemistry', 1650.00, 'Sodium: 135-145, Potassium: 3.5-5.0', 'mmol/L'],
    [9, 'UFR', 'Urine Full Report (UFR)', 'Pathology', 550.00, 'Pus cells: 0-2, RBC: Nil, Albumin: Nil, Sugar: Nil', 'hpf'],
    [10, 'UR_CULT', 'Urine Culture & ABST', 'Microbiology', 2400.00, 'No significant bacterial growth after 48 hrs', 'CFU/mL'],
    [11, 'ESR', 'Erythrocyte Sedimentation Rate (ESR)', 'Hematology', 450.00, 'Male: 0-15, Female: 0-20', 'mm/1st hr'],
    [12, 'CRP', 'C-Reactive Protein (Quantitative CRP)', 'Biochemistry', 1250.00, '< 5.0', 'mg/L'],
    [13, 'DENGUE_AG', 'Dengue NS1 Antigen Rapid Test', 'Serology', 2800.00, 'Negative (Non-reactive)', 'N/A'],
    [14, 'DENGUE_AB', 'Dengue IgM & IgG Antibodies', 'Serology', 3200.00, 'IgM: Negative, IgG: Negative', 'N/A'],
    [15, 'TSH', 'Thyroid Stimulating Hormone (Ultra TSH)', 'Endocrinology', 1900.00, '0.40 - 4.20', 'uIU/mL'],
    [16, 'TROP_I', 'Troponin I (High Sensitivity)', 'Cardiology', 3800.00, '< 0.04 (Normal cardiac status)', 'ng/mL'],
    [17, 'ECG', '12-Lead Electrocardiogram (ECG)', 'Cardiology', 950.00, 'Normal sinus rhythm, no ischemic ST changes', 'N/A'],
    [18, 'XRAY_CH', 'Chest X-Ray PA View (Digital)', 'Radiology', 1800.00, 'Clear lung parenchyma, cardiac shadow within normal limits', 'N/A'],
    [19, 'US_ABD', 'Ultrasound Scan of Whole Abdomen', 'Radiology', 4500.00, 'Normal liver, gallbladder, spleen, kidneys, and bladder', 'N/A'],
    [20, 'PT_INR', 'Prothrombin Time with INR', 'Hematology', 1100.00, 'Control: 12-14s, INR: 0.9-1.1', 'Ratio'],
  ];

  for (const lt of labTestsData) {
    await query(`
      INSERT INTO lab_tests 
        (id, test_code, name, category, standard_cost, reference_range, unit)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, lt);
  }

  // 8. SEED 65 REALISTIC SRI LANKAN PATIENTS
  console.log('🧑‍🤝‍🧑 8. Seeding 65 Realistic Sri Lankan Patients across Districts...');
  const firstNames = [
    'Chaminda', 'Niroshan', 'Kasun', 'Malith', 'Suresh', 'Buddhika', 'Dinesh', 'Ranjith', 'Roshan', 'Gayan',
    'Anushka', 'Sandun', 'Dimuth', 'Lakshan', 'Harsha', 'Pradeep', 'Nuwan', 'Sachith', 'Thilina', 'Kusal',
    'Dilani', 'Sewwandi', 'Nadeesha', 'Chathurika', 'Hasini', 'Piyumi', 'Oshadi', 'Gayathri', 'Kaveesha', 'Sanduni',
    'Thilini', 'Inoka', 'Shirani', 'Ruwanthi', 'Pavithra', 'Tharushi', 'Minoli', 'Poornima', 'Subhashini', 'Chamari',
    'Mohamed', 'Fathima', 'Abdul', 'Ayesha', 'Rizwan', 'Zainab', 'Farhan', 'Shabnam',
    'Selvarajah', 'Priya', 'Thivakaran', 'Kamaleshwari', 'Santhosh', 'Anushiya', 'Ramesh', 'Devika'
  ];

  const lastNames = [
    'Perera', 'Silva', 'Fernando', 'Jayawardena', 'Rajapaksa', 'Dissanayake', 'Bandara', 'Gunawardena',
    'Wickramasinghe', 'Senanayake', 'Rathnayake', 'Alwis', 'Herath', 'Pathirana', 'Samarakoon', 'Mendis',
    'Ranasinghe', 'Ekanayake', 'Wijesinghe', 'Gunasekara', 'Fonseka', 'Jayasekara', 'Karunaratne', 'Liyanage',
    'Abeysekara', 'Kulathunga', 'Kaluarachchi', 'Nanayakkara', 'Basnayake', 'Tennakoon', 'Balasuriya',
    'Farook', 'Mansoor', 'Razak', 'Nizar', 'Sundaram', 'Murugan', 'Kumarasamy', 'Pillai', 'Rajaratnam'
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'O+', 'O-'];
  const slDistricts = [
    { city: 'Colombo 03', dist: 'Colombo', addr: 'No. 42/B, Galle Road' },
    { city: 'Kandy', dist: 'Kandy', addr: 'No. 118, Peradeniya Road' },
    { city: 'Galle', dist: 'Galle', addr: 'No. 25, Wakwella Road' },
    { city: 'Kurunegala', dist: 'Kurunegala', addr: 'No. 88, Negombo Road' },
    { city: 'Negombo', dist: 'Gampaha', addr: 'No. 14, Main Street' },
    { city: 'Matara', dist: 'Matara', addr: 'No. 56, Anagarika Dharmapala Mawatha' },
    { city: 'Anuradhapura', dist: 'Anuradhapura', addr: 'No. 102, Maithripala Senanayake Mawatha' },
    { city: 'Jaffna', dist: 'Jaffna', addr: 'No. 77, Kandy Road' },
    { city: 'Gampaha', dist: 'Gampaha', addr: 'No. 33, Yakkala Road' },
    { city: 'Kalutara', dist: 'Kalutara', addr: 'No. 91, Nagoda Road' },
    { city: 'Ratnapura', dist: 'Ratnapura', addr: 'No. 12, Hospital Road' },
    { city: 'Badulla', dist: 'Badulla', addr: 'No. 45, Lower King Street' },
    { city: 'Nuwara Eliya', dist: 'Nuwara Eliya', addr: 'No. 8, Queen Elizabeth Drive' },
    { city: 'Matale', dist: 'Matale', addr: 'No. 61, Trincomalee Street' },
  ];

  const allergiesList = [
    'None reported', 'None', 'Penicillin', 'Sulfa drugs', 'Aspirin & NSAIDs',
    'Amoxicillin allergy', 'Iodine contrast dye', 'Paracetamol hypersensitivity', 'Dust mite asthma'
  ];

  for (let i = 1; i <= 65; i++) {
    const fName = firstNames[(i * 3 + 7) % firstNames.length];
    const lName = lastNames[(i * 5 + 11) % lastNames.length];
    const isMale = !['Dilani', 'Sewwandi', 'Nadeesha', 'Chathurika', 'Hasini', 'Piyumi', 'Oshadi', 'Gayathri', 'Kaveesha', 'Sanduni', 'Thilini', 'Inoka', 'Shirani', 'Ruwanthi', 'Pavithra', 'Tharushi', 'Minoli', 'Poornima', 'Subhashini', 'Chamari', 'Fathima', 'Ayesha', 'Zainab', 'Shabnam', 'Priya', 'Kamaleshwari', 'Anushiya', 'Devika'].includes(fName);
    const gender = isMale ? 'Male' : 'Female';
    const bg = bloodGroups[i % bloodGroups.length];
    
    // Realistic age between 5 and 78
    const birthYear = 2026 - (10 + (i * 17) % 65);
    const birthMonth = String(1 + (i % 12)).padStart(2, '0');
    const birthDay = String(1 + ((i * 3) % 28)).padStart(2, '0');
    const dob = `${birthYear}-${birthMonth}-${birthDay}`;

    const distInfo = slDistricts[i % slDistricts.length];
    const phone = `07${[1, 2, 5, 6, 7, 8][i % 6]} ${Math.floor(1000000 + (i * 98765) % 8999999)}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@gmail.com`;
    const mrn = `HOSP-2026-${String(i).padStart(5, '0')}`;
    const address = `${distInfo.addr}, ${distInfo.city}, ${distInfo.dist}`;
    const emerName = `${firstNames[(i + 4) % firstNames.length]} ${lName}`;
    const emerPhone = `07${[1, 6, 7][i % 3]} ${Math.floor(2000000 + (i * 45678) % 7999999)}`;
    const relation = isMale ? 'Spouse' : 'Brother';
    const allergies = allergiesList[i % allergiesList.length];

    await query(`
      INSERT INTO patients 
        (id, mrn, first_name, last_name, dob, gender, blood_group, phone, email, address,
         emergency_contact_name, emergency_contact_phone, emergency_contact_relation, allergies, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))
    `, [i, mrn, fName, lName, dob, gender, bg, phone, email, address, emerName, emerPhone, relation, allergies, 65 - i]);
  }

  // 9. SEED 50+ APPOINTMENTS
  console.log('📅 9. Seeding 55 Doctor Appointments (Past completed & Upcoming queue)...');
  const apptReasons = [
    'Annual routine wellness and blood pressure review',
    'Follow up for glycemic control and diabetes management',
    'Persistent chest discomfort on moderate exertion',
    'Acute onset dry cough and low grade evening fever',
    'Knee joint pain exacerbated by stair climbing',
    'Antenatal routine ultrasound review at 24 weeks',
    'Recurrent migraine with visual aura and nausea',
    'Pediatric immunization and growth milestone check',
    'General post-prandial abdominal bloating and acid reflux',
    'Low back pain with lumbar radiation',
  ];

  const apptTimes = ['08:30:00', '09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '14:00:00', '14:30:00', '15:00:00', '15:30:00', '16:00:00', '16:30:00'];

  for (let i = 1; i <= 55; i++) {
    const patientId = 1 + (i % 65);
    const doctorId = 1 + (i % 11);
    const dayOffset = (i <= 35) ? - (35 - i) : (i - 35); // 35 past, 20 today/future
    const status = (dayOffset < 0) ? 'completed' : ((dayOffset === 0 && i % 2 === 0) ? 'scheduled' : (i % 7 === 0 ? 'cancelled' : 'scheduled'));
    const timeSlot = apptTimes[i % apptTimes.length];
    const reason = apptReasons[i % apptReasons.length];

    await query(`
      INSERT INTO appointments 
        (id, patient_id, doctor_id, appointment_date, time_slot, status, reason_for_visit, notes, created_at)
      VALUES (?, ?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?, ?, 'OPD consultation entry', DATE_SUB(NOW(), INTERVAL 10 DAY))
    `, [i, patientId, doctorId, dayOffset, timeSlot, status, reason]);
  }

  // 10. SEED 35 EMR CLINICAL ENCOUNTERS, PRESCRIPTIONS & PRESCRIPTION ITEMS
  console.log('📝 10. Seeding 35 Clinical EMR Encounters & Prescriptions with Vitals...');
  const clinicalScenarios = [
    {
      cc: 'Headache and neck stiffness with intermittent dizziness for 4 days',
      diag: 'Essential Hypertension (Stage 1) with Tension Headache',
      plan: 'Initiate Losartan 50mg daily. Low sodium dietary counseling. Return in 2 weeks.',
      bp: '148/92', pulse: 82, temp: 36.8, spo2: 99, wt: 74.5,
      meds: [{ id: 18, dose: '50mg', freq: 'Once daily in morning', days: 30, qty: 30 }, { id: 1, dose: '500mg', freq: 'When needed for pain', days: 5, qty: 15 }]
    },
    {
      cc: 'Fever for 3 days with generalized myalgia, arthralgia, and retroactive eye pain',
      diag: 'Suspected Viral Fever / Dengue Fever Under Investigation',
      plan: 'Full Blood Count and Dengue NS1 Antigen stat. Adequate oral hydration with King Coconut water.',
      bp: '115/75', pulse: 94, temp: 38.6, spo2: 98, wt: 62.0,
      meds: [{ id: 1, dose: '500mg', freq: 'Every 6 hours strictly', days: 3, qty: 12 }, { id: 28, dose: '10ml', freq: 'Three times daily after food', days: 5, qty: 1 }]
    },
    {
      cc: 'Exertional shortness of breath with mild bilateral pedal edema',
      diag: 'Stable Ischemic Heart Disease with Mild Fluid Retention',
      plan: '12-lead ECG, Lipid panel, and Serum Electrolytes. Continue Statin and Antiplatelet.',
      bp: '135/85', pulse: 76, temp: 36.6, spo2: 97, wt: 81.0,
      meds: [{ id: 14, dose: '20mg', freq: 'At night', days: 30, qty: 30 }, { id: 13, dose: '100mg', freq: 'Once daily after lunch', days: 30, qty: 30 }, { id: 20, dose: '40mg', freq: 'Every morning', days: 14, qty: 14 }]
    },
    {
      cc: 'Severe productive cough with yellowish sputum and right-sided pleuritic chest tightness',
      diag: 'Acute Community-Acquired Bronchitis',
      plan: 'Oral Augmentin course, expectorant syrup, steam inhalation twice daily.',
      bp: '122/78', pulse: 88, temp: 37.8, spo2: 96, wt: 68.0,
      meds: [{ id: 3, dose: '625mg', freq: 'Twice daily after meals', days: 7, qty: 14 }, { id: 26, dose: '10ml', freq: 'Three times daily', days: 5, qty: 1 }]
    },
    {
      cc: 'Routine diabetic follow-up. Experiencing mild morning polyuria and thirst',
      diag: 'Type 2 Diabetes Mellitus - Inadequate Glycemic Control',
      plan: 'Fasting Blood Sugar and HbA1c review. Increase Metformin titration.',
      bp: '130/80', pulse: 74, temp: 36.7, spo2: 99, wt: 76.0,
      meds: [{ id: 10, dose: '500mg', freq: 'Twice daily with meals', days: 30, qty: 60 }, { id: 29, dose: '1 tablet', freq: 'Once daily after breakfast', days: 30, qty: 30 }]
    },
  ];

  let prescLineId = 1;
  for (let i = 1; i <= 35; i++) {
    const apptId = i; // Linked to completed appointments
    const patientId = 1 + (i % 65);
    const doctorId = 1 + (i % 11);
    const scen = clinicalScenarios[i % clinicalScenarios.length];

    await query(`
      INSERT INTO medical_records 
        (id, patient_id, doctor_id, appointment_id, encounter_date, chief_complaint,
         vitals_bp, vitals_pulse, vitals_temp_c, vitals_spo2, vitals_weight_kg,
         examination_notes, diagnosis, treatment_plan, created_at)
      VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), ?, ?, ?, ?, ?, ?, 'Clinical physical examination documented.', ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))
    `, [i, patientId, doctorId, apptId, 36 - i, scen.cc, scen.bp, scen.pulse, scen.temp, scen.spo2, scen.wt, scen.diag, scen.plan, 36 - i]);

    // Prescription header
    const prescStatus = (i <= 25) ? 'dispensed' : ((i <= 32) ? 'pending' : 'cancelled');
    await query(`
      INSERT INTO prescriptions 
        (id, medical_record_id, patient_id, doctor_id, notes, status, created_at)
      VALUES (?, ?, ?, ?, 'Dispense original formulations as directed.', ?, DATE_SUB(NOW(), INTERVAL ? DAY))
    `, [i, i, patientId, doctorId, prescStatus, 36 - i]);

    // Prescription items
    for (const item of scen.meds) {
      const isDispensed = (prescStatus === 'dispensed');
      await query(`
        INSERT INTO prescription_items 
          (id, prescription_id, medicine_id, dosage, frequency, duration_days, quantity_prescribed, quantity_dispensed, instructions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Take with potable water after meals')
      `, [prescLineId++, i, item.id, item.dose, item.freq, item.days, item.qty, isDispensed ? item.qty : 0]);
    }
  }

  // 11. SEED 35 LABORATORY REQUISITIONS & RESULTS
  console.log('🧪 11. Seeding 35 Laboratory Requisitions & Diagnostic Results...');
  for (let i = 1; i <= 35; i++) {
    const patientId = 1 + (i % 65);
    const doctorId = 1 + (i % 11);
    const testId = 1 + (i % 20);
    const medRecId = (i <= 35) ? i : null;
    const status = (i <= 28) ? 'completed' : ((i <= 32) ? 'in_process' : 'sample_collected');
    const sampleType = ['Blood (EDTA)', 'Blood (Serum)', 'Urine (Midstream)', 'Capillary Blood'][i % 4];

    await query(`
      INSERT INTO lab_requests 
        (id, patient_id, doctor_id, test_id, medical_record_id, status, sample_type, sample_collected_at, ordered_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), DATE_SUB(NOW(), INTERVAL ? DAY))
    `, [i, patientId, doctorId, testId, medRecId, status, sampleType, 36 - i, 36 - i]);

    // If completed, insert result
    if (status === 'completed') {
      const isAbnormal = (i % 4 === 0);
      const testNames = ['Hemoglobin 11.2 g/dL, WBC 12.4 x10^3/uL', 'Fasting Blood Sugar: 138 mg/dL (Elevated)', 'HbA1c: 7.4% (Suboptimal control)', 'Lipid Profile: Total Chol 242 mg/dL', 'Serum Creatinine: 1.1 mg/dL (Normal)', 'Dengue NS1 Antigen: Positive', 'CRP: 28.5 mg/L (Active inflammation)'];
      const resultVal = testNames[i % testNames.length];
      const remarks = isAbnormal ? 'Physician notified of flagged abnormal parameter.' : 'All assayed values within normative biological reference interval.';

      await query(`
        INSERT INTO lab_results 
          (id, lab_request_id, recorded_by_user_id, result_value, is_abnormal, remarks, verified_at)
        VALUES (?, ?, 19, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))
      `, [i, i, resultVal, isAbnormal, remarks, 36 - i]);
    }
  }

  // 12. SEED 35 INVOICES, BILL ITEMS & PAYMENTS (IN LKR / RS.)
  console.log('💰 12. Seeding 35 Invoices, Unified Bill Items & Payments in Sri Lankan Rupees...');
  let billItemId = 1;
  let paymentId = 1;

  for (let i = 1; i <= 35; i++) {
    const patientId = 1 + (i % 65);
    const invoiceNum = `INV-2026-${String(i).padStart(5, '0')}`;
    const consultFee = 2500.00;
    const labFee = (i % 2 === 0) ? 1850.00 : 850.00;
    const pharmFee = (i % 3 === 0) ? 1450.00 : 650.00;
    const grossTotal = consultFee + labFee + pharmFee;
    const discount = (i % 5 === 0) ? 500.00 : 0.00;
    const tax = 0.00;
    const netTotal = grossTotal - discount;

    let status = 'paid';
    let paidAmount = netTotal;
    let balanceDue = 0.00;

    if (i === 33) {
      status = 'partially_paid';
      paidAmount = 2500.00;
      balanceDue = netTotal - paidAmount;
    } else if (i >= 34) {
      status = 'unpaid';
      paidAmount = 0.00;
      balanceDue = netTotal;
    }

    await query(`
      INSERT INTO bills 
        (id, invoice_number, patient_id, total_amount, discount_amount, tax_amount, net_amount, paid_amount, balance_due, status, due_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL ? DAY))
    `, [i, invoiceNum, patientId, grossTotal, discount, tax, netTotal, paidAmount, balanceDue, status, 36 - i]);

    // Bill line items
    await query(`
      INSERT INTO bill_items (id, bill_id, item_type, reference_id, description, quantity, unit_price, total_price)
      VALUES (?, ?, 'consultation', ?, 'Specialist Clinical Consultation Fee', 1, ?, ?)
    `, [billItemId++, i, i, consultFee, consultFee]);

    await query(`
      INSERT INTO bill_items (id, bill_id, item_type, reference_id, description, quantity, unit_price, total_price)
      VALUES (?, ?, 'laboratory', ?, 'Laboratory Diagnostic Testing Panel', 1, ?, ?)
    `, [billItemId++, i, i, labFee, labFee]);

    await query(`
      INSERT INTO bill_items (id, bill_id, item_type, reference_id, description, quantity, unit_price, total_price)
      VALUES (?, ?, 'pharmacy', ?, 'Outpatient Prescribed Medications', 1, ?, ?)
    `, [billItemId++, i, i, pharmFee, pharmFee]);

    // Payments received
    if (paidAmount > 0) {
      const payMethod = ['cash', 'credit_card', 'bank_transfer', 'debit_card'][i % 4];
      const receiptNum = `REC-2026-${String(paymentId).padStart(5, '0')}`;
      const txnRef = (payMethod !== 'cash') ? `TXN-SL-${Date.now() + i}` : null;

      await query(`
        INSERT INTO payments 
          (id, receipt_number, bill_id, received_by_user_id, amount, payment_method, transaction_reference, payment_date, notes)
        VALUES (?, ?, ?, 23, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), 'Hospital cashier counter payment settlement')
      `, [paymentId++, receiptNum, i, paidAmount, payMethod, txnRef, 36 - i]);
    }
  }

  // 13. SEED REALISTIC ATTENDANCE & LEAVES
  console.log('📋 13. Seeding Staff Daily Attendance Roster & Leave Records...');
  const todayStr = new Date().toISOString().split('T')[0];
  for (let empId = 1; empId <= 25; empId++) {
    const isPresent = (empId !== 7 && empId !== 16);
    const status = isPresent ? 'present' : (empId === 7 ? 'on_leave' : 'absent');
    const clockIn = isPresent ? '08:00:00' : null;
    const clockOut = isPresent ? '16:30:00' : null;

    await query(`
      INSERT INTO attendance 
        (employee_id, date, clock_in, clock_out, status, remarks, created_at)
      VALUES (?, ?, ?, ?, ?, 'Standard weekday shift schedule', NOW())
    `, [empId, todayStr, clockIn, clockOut, status]);
  }

  // Approved leave for Dr. Hiruni Perera (EMP 7)
  await query(`
    INSERT INTO leave_records 
      (id, employee_id, leave_type, start_date, end_date, reason, status, approved_by, decision_notes, created_at)
    VALUES 
      (1, 7, 'annual', DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Attending Sri Lanka Orthopedic Association Annual Academic Sessions in Kandy.', 'approved', 1, 'Approved by Chief Administrator.', NOW()),
      (2, 16, 'casual', CURDATE(), CURDATE(), 'Personal family matter in Negombo.', 'approved', 1, 'Granted.', NOW())
  `);

  console.log('================================================================');
  console.log('🎉 SRI LANKAN DATASET POPULATED SUCCESSFULLY ACROSS ALL TABLES!');
  console.log('================================================================\n');
}

seedSriLanka().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
