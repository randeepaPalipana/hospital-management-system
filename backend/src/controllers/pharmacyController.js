const PharmacyModel = require('../models/pharmacyModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAudit } = require('../utils/auditLogger');

class PharmacyController {
  // --- Inventory Medicines ---
  static async getMedicines(req, res, next) {
    try {
      const { search, category, lowStockOnly } = req.query;
      const medicines = await PharmacyModel.findAllMedicines({
        search: search?.trim() || null,
        category: category || null,
        lowStockOnly: lowStockOnly === 'true',
      });
      return successResponse(res, 'Medicines inventory retrieved', medicines);
    } catch (err) {
      next(err);
    }
  }

  static async getMedicineById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const medicine = await PharmacyModel.findMedicineById(id);
      if (!medicine) {
        return errorResponse(res, 'Medicine not found', null, 404);
      }
      const batches = await PharmacyModel.getBatches(id);
      medicine.batches = batches;
      return successResponse(res, 'Medicine details retrieved', medicine);
    } catch (err) {
      next(err);
    }
  }

  static async createMedicine(req, res, next) {
    try {
      const id = await PharmacyModel.createMedicine(req.body);
      const medicine = await PharmacyModel.findMedicineById(id);
      await logAudit(req, 'CREATE', 'medicines', id, { name: req.body.name, category: req.body.category });
      return successResponse(res, 'Medicine registered in formulary successfully', medicine, 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateMedicine(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const med = await PharmacyModel.findMedicineById(id);
      if (!med) return errorResponse(res, 'Medicine not found', null, 404);

      await PharmacyModel.updateMedicine(id, req.body);
      const updated = await PharmacyModel.findMedicineById(id);
      await logAudit(req, 'UPDATE', 'medicines', id, req.body);
      return successResponse(res, 'Medicine record updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }

  // --- Batches & Stock Inflow ---
  static async addBatch(req, res, next) {
    try {
      const medicine_id = parseInt(req.params.id, 10);
      const med = await PharmacyModel.findMedicineById(medicine_id);
      if (!med) return errorResponse(res, 'Medicine not found', null, 404);

      const batchId = await PharmacyModel.addBatch({ ...req.body, medicine_id });
      await logAudit(req, 'ADD_STOCK_BATCH', 'medicine_batches', batchId, {
        medicine: med.name,
        batch_number: req.body.batch_number,
        quantity: req.body.initial_quantity,
      });

      const batches = await PharmacyModel.getBatches(medicine_id);
      return successResponse(res, 'Stock batch added successfully', batches, 201);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return errorResponse(res, `Batch number '${req.body.batch_number}' already exists`, null, 409);
      }
      next(err);
    }
  }

  static async getExpiringBatches(req, res, next) {
    try {
      const days = parseInt(req.query.days || 90, 10);
      const expiring = await PharmacyModel.getExpiringBatches(days);
      return successResponse(res, `Batches expiring within ${days} days retrieved`, expiring);
    } catch (err) {
      next(err);
    }
  }

  // --- Prescriptions Queue & Dispensing ---
  static async getPrescriptionsQueue(req, res, next) {
    try {
      const { status = 'pending', limit = 50, page = 1 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const prescriptions = await PharmacyModel.getPrescriptionsQueue({
        status: status || null,
        limit: parseInt(limit, 10),
        offset,
      });
      return successResponse(res, 'Pharmacy prescription orders retrieved', prescriptions);
    } catch (err) {
      next(err);
    }
  }

  static async getPrescriptionDetail(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const prescription = await PharmacyModel.getPrescriptionDetail(id);
      if (!prescription) {
        return errorResponse(res, 'Prescription not found', null, 404);
      }
      return successResponse(res, 'Prescription details retrieved', prescription);
    } catch (err) {
      next(err);
    }
  }

  static async dispense(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const prescription = await PharmacyModel.getPrescriptionDetail(id);
      if (!prescription) {
        return errorResponse(res, 'Prescription not found', null, 404);
      }
      if (prescription.status === 'dispensed') {
        return errorResponse(res, 'This prescription has already been dispensed', null, 400);
      }

      await PharmacyModel.dispensePrescription(id);
      const updated = await PharmacyModel.getPrescriptionDetail(id);

      await logAudit(req, 'DISPENSE_PRESCRIPTION', 'prescriptions', id, {
        patient: `${prescription.patient_first_name} ${prescription.patient_last_name}`,
        itemsCount: prescription.items?.length,
      });

      return successResponse(res, 'Prescription dispensed and stock updated successfully', updated);
    } catch (err) {
      return errorResponse(res, err.message, null, 400);
    }
  }
}

module.exports = PharmacyController;
