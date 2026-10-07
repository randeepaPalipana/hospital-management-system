const { query, transaction } = require('../config/db');

class LaboratoryModel {
  // --- Test Catalog ---
  static async findAllTests({ category } = {}) {
    let sql = `SELECT id, test_code, name, category, standard_cost, reference_range, unit, created_at FROM lab_tests WHERE 1=1`;
    const params = [];
    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }
    sql += ` ORDER BY name ASC`;
    return query(sql, params);
  }

  static async findTestById(id) {
    const sql = `SELECT * FROM lab_tests WHERE id = ? LIMIT 1`;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async createTest({ test_code, name, category, standard_cost, reference_range, unit }) {
    const sql = `
      INSERT INTO lab_tests (test_code, name, category, standard_cost, reference_range, unit)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      test_code.toUpperCase(),
      name,
      category,
      standard_cost || 0.00,
      reference_range || null,
      unit || null,
    ]);
    return result.insertId;
  }

  // --- Lab Requisitions / Requests ---
  static async findAllRequests({ status, patientId, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT 
        lr.id, lr.patient_id, lr.doctor_id, lr.test_id, lr.medical_record_id,
        lr.status, lr.sample_type, lr.sample_collected_at, lr.ordered_at,
        p.mrn AS patient_mrn, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
        p.gender AS patient_gender, p.blood_group,
        TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) AS patient_age,
        CONCAT(e.first_name, ' ', e.last_name) AS doctor_name,
        d.specialization AS doctor_specialization,
        lt.test_code, lt.name AS test_name, lt.category AS test_category,
        lt.standard_cost, lt.reference_range, lt.unit,
        res.id AS result_id, res.result_value, res.is_abnormal, res.remarks, res.verified_at,
        u.username AS verified_by_username
      FROM lab_requests lr
      JOIN patients p ON lr.patient_id = p.id
      JOIN doctors d ON lr.doctor_id = d.id
      JOIN employees e ON d.employee_id = e.id
      JOIN lab_tests lt ON lr.test_id = lt.id
      LEFT JOIN lab_results res ON lr.id = res.lab_request_id
      LEFT JOIN users u ON res.recorded_by_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ` AND lr.status = ?`;
      params.push(status);
    }
    if (patientId) {
      sql += ` AND lr.patient_id = ?`;
      params.push(patientId);
    }

    sql += ` ORDER BY lr.ordered_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    return query(sql, params);
  }

  static async findRequestById(id) {
    const sql = `
      SELECT 
        lr.id, lr.patient_id, lr.doctor_id, lr.test_id, lr.medical_record_id,
        lr.status, lr.sample_type, lr.sample_collected_at, lr.ordered_at,
        p.mrn AS patient_mrn, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
        p.gender AS patient_gender, p.blood_group, p.dob,
        TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) AS patient_age,
        CONCAT(e.first_name, ' ', e.last_name) AS doctor_name,
        d.specialization AS doctor_specialization,
        lt.test_code, lt.name AS test_name, lt.category AS test_category,
        lt.standard_cost, lt.reference_range, lt.unit,
        res.id AS result_id, res.result_value, res.is_abnormal, res.remarks, res.verified_at,
        u.username AS verified_by_username
      FROM lab_requests lr
      JOIN patients p ON lr.patient_id = p.id
      JOIN doctors d ON lr.doctor_id = d.id
      JOIN employees e ON d.employee_id = e.id
      JOIN lab_tests lt ON lr.test_id = lt.id
      LEFT JOIN lab_results res ON lr.id = res.lab_request_id
      LEFT JOIN users u ON res.recorded_by_user_id = u.id
      WHERE lr.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async createRequest({ patient_id, doctor_id, test_id, medical_record_id, sample_type }) {
    const sql = `
      INSERT INTO lab_requests (patient_id, doctor_id, test_id, medical_record_id, status, sample_type)
      VALUES (?, ?, ?, ?, 'ordered', ?)
    `;
    const result = await query(sql, [
      patient_id,
      doctor_id,
      test_id,
      medical_record_id || null,
      sample_type || 'Blood',
    ]);
    return result.insertId;
  }

  static async updateRequestStatus(id, status, sampleCollected = false) {
    let sql = `UPDATE lab_requests SET status = ?`;
    const params = [status];
    if (sampleCollected) {
      sql += `, sample_collected_at = NOW()`;
    }
    sql += ` WHERE id = ?`;
    params.push(id);
    return query(sql, params);
  }

  // --- Lab Results ---
  static async recordResult({ lab_request_id, recorded_by_user_id, result_value, is_abnormal = false, remarks }) {
    return transaction(async (conn) => {
      // 1. Insert or update result record
      const checkSql = `SELECT id FROM lab_results WHERE lab_request_id = ? LIMIT 1`;
      const [existing] = await conn.query(checkSql, [lab_request_id]);

      let resultId;
      if (existing.length > 0) {
        resultId = existing[0].id;
        await conn.query(
          `UPDATE lab_results 
           SET recorded_by_user_id = ?, result_value = ?, is_abnormal = ?, remarks = ?, verified_at = NOW()
           WHERE id = ?`,
          [recorded_by_user_id, result_value, is_abnormal, remarks || null, resultId]
        );
      } else {
        const insertSql = `
          INSERT INTO lab_results (lab_request_id, recorded_by_user_id, result_value, is_abnormal, remarks, verified_at)
          VALUES (?, ?, ?, ?, ?, NOW())
        `;
        const [res] = await conn.query(insertSql, [
          lab_request_id,
          recorded_by_user_id,
          result_value,
          is_abnormal,
          remarks || null,
        ]);
        resultId = res.insertId;
      }

      // 2. Mark lab_request as 'completed'
      await conn.query(`UPDATE lab_requests SET status = 'completed' WHERE id = ?`, [lab_request_id]);

      return resultId;
    });
  }
}

module.exports = LaboratoryModel;
