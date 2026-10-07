const BillingModel = require('../models/billingModel');
const PatientModel = require('../models/patientModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAudit } = require('../utils/auditLogger');

class BillingController {
  // --- Invoices ---
  static async getInvoices(req, res, next) {
    try {
      const { status, patientId, limit = 50, page = 1 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const invoices = await BillingModel.findAll({
        status: status || null,
        patientId: patientId ? parseInt(patientId, 10) : null,
        limit: parseInt(limit, 10),
        offset,
      });
      return successResponse(res, 'Invoices retrieved', invoices);
    } catch (err) {
      next(err);
    }
  }

  static async getInvoiceById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const invoice = await BillingModel.findById(id);
      if (!invoice) {
        return errorResponse(res, 'Invoice not found', null, 404);
      }
      return successResponse(res, 'Invoice details retrieved', invoice);
    } catch (err) {
      next(err);
    }
  }

  static async createInvoice(req, res, next) {
    try {
      const { patient_id } = req.body;
      const patient = await PatientModel.findById(patient_id);
      if (!patient) return errorResponse(res, 'Patient not found', null, 404);

      const id = await BillingModel.createInvoice(req.body);
      const invoice = await BillingModel.findById(id);

      await logAudit(req, 'CREATE_INVOICE', 'bills', id, {
        invoiceNumber: invoice.invoice_number,
        patient: `${patient.first_name} ${patient.last_name}`,
        netAmount: invoice.net_amount,
      });

      return successResponse(res, 'Invoice generated successfully', invoice, 201);
    } catch (err) {
      next(err);
    }
  }

  // --- Payment Processing ---
  static async recordPayment(req, res, next) {
    try {
      const bill_id = parseInt(req.params.id, 10);
      const { amount, payment_method, transaction_reference, notes } = req.body;

      const paymentId = await BillingModel.recordPayment({
        bill_id,
        received_by_user_id: req.user.id,
        amount,
        payment_method,
        transaction_reference,
        notes,
      });

      const updatedInvoice = await BillingModel.findById(bill_id);

      await logAudit(req, 'RECORD_PAYMENT', 'payments', paymentId, {
        invoiceNumber: updatedInvoice.invoice_number,
        amount,
        payment_method,
        newBalance: updatedInvoice.balance_due,
      });

      return successResponse(res, 'Payment processed successfully', updatedInvoice);
    } catch (err) {
      return errorResponse(res, err.message, null, 400);
    }
  }

  // --- Unbilled Services Helper ---
  static async getUnbilledServices(req, res, next) {
    try {
      const patientId = parseInt(req.params.patientId, 10);
      const services = await BillingModel.getUnbilledPatientServices(patientId);
      return successResponse(res, 'Unbilled services retrieved', services);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BillingController;
