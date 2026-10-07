import React, { useState, useEffect } from 'react';
import { billingService } from '../../services/billingService';
import { patientService } from '../../services/patientService';
import {
  X, Receipt, Plus, Trash2, Loader2, AlertCircle, Sparkles, Check,
} from 'lucide-react';

const ITEM_TYPES = [
  { value: 'consultation', label: 'Doctor Consultation' },
  { value: 'laboratory', label: 'Lab Investigation' },
  { value: 'pharmacy', label: 'Pharmacy Medicine' },
  { value: 'admission', label: 'Inpatient / Room Charge' },
  { value: 'other', label: 'Other Procedure / Service' },
];

const CreateInvoiceModal = ({ onClose, onSuccess }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Unbilled services
  const [unbilled, setUnbilled] = useState(null);
  const [loadingUnbilled, setLoadingUnbilled] = useState(false);

  // Invoice form
  const [items, setItems] = useState([
    { item_type: 'consultation', description: 'Physician Consultation Fee', quantity: 1, unit_price: 25.00 },
  ]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    patientService.getAll({ limit: 100 })
      .then((res) => {
        const list = res.data.data || [];
        setPatients(list);
        if (list.length > 0) {
          setSelectedPatientId(list[0].id);
        }
      })
      .catch(() => setError('Failed to load patients list'))
      .finally(() => setLoadingInitial(false));
  }, []);

  // Fetch unbilled services when patient changes
  useEffect(() => {
    if (!selectedPatientId) return;
    setLoadingUnbilled(true);
    billingService.getUnbilledServices(selectedPatientId)
      .then((res) => {
        setUnbilled(res.data.data || null);
      })
      .catch(() => {})
      .finally(() => setLoadingUnbilled(false));
  }, [selectedPatientId]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { item_type: 'other', description: '', quantity: 1, unit_price: 0 },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleImportUnbilled = (serviceType, s) => {
    if (serviceType === 'appointment') {
      setItems([
        ...items,
        {
          item_type: 'consultation',
          reference_id: s.id,
          description: `Consultation with Dr. ${s.doctor_name} (${s.specialization})`,
          quantity: 1,
          unit_price: parseFloat(s.consultation_fee) || 25.00,
        },
      ]);
    } else if (serviceType === 'lab') {
      setItems([
        ...items,
        {
          item_type: 'laboratory',
          reference_id: s.id,
          description: `Laboratory Test: ${s.test_name}`,
          quantity: 1,
          unit_price: parseFloat(s.standard_cost) || 15.00,
        },
      ]);
    } else if (serviceType === 'prescription') {
      setItems([
        ...items,
        {
          item_type: 'pharmacy',
          reference_id: s.prescription_id,
          description: `${s.medicine_name} (${s.quantity_prescribed} units)`,
          quantity: parseInt(s.quantity_prescribed, 10),
          unit_price: parseFloat(s.unit_price) || 0,
        },
      ]);
    }
  };

  // Calculations
  const grossTotal = items.reduce(
    (sum, item) => sum + (parseInt(item.quantity, 10) || 1) * (parseFloat(item.unit_price) || 0),
    0
  );
  const netTotal = Math.max(0, grossTotal - (parseFloat(discountAmount) || 0) + (parseFloat(taxAmount) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('At least one bill item is required');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await billingService.createInvoice({
        patient_id: parseInt(selectedPatientId, 10),
        discount_amount: parseFloat(discountAmount) || 0,
        tax_amount: parseFloat(taxAmount) || 0,
        due_date: dueDate,
        items: items.map((it) => ({
          ...it,
          quantity: parseInt(it.quantity, 10) || 1,
          unit_price: parseFloat(it.unit_price) || 0,
        })),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Generate Patient Bill & Invoice</h2>
              <p className="text-xs text-slate-500">Consolidated hospital fees, diagnostics, and medicines</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loadingInitial ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Patient Selector */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Billable Patient *</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} ({p.mrn}) — {p.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Smart Import Unbilled Services Helper */}
            {unbilled && (unbilled.appointments?.length > 0 || unbilled.labRequests?.length > 0 || unbilled.prescriptions?.length > 0) && (
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Available Completed Hospital Services (Click to Add to Bill):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {unbilled.appointments?.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handleImportUnbilled('appointment', a)}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-medium"
                    >
                      + Dr. {a.doctor_name} (${parseFloat(a.consultation_fee).toFixed(2)})
                    </button>
                  ))}
                  {unbilled.labRequests?.map((lr) => (
                    <button
                      key={lr.id}
                      type="button"
                      onClick={() => handleImportUnbilled('lab', lr)}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-medium"
                    >
                      + Lab: {lr.test_name} (${parseFloat(lr.standard_cost).toFixed(2)})
                    </button>
                  ))}
                  {unbilled.prescriptions?.map((pr) => (
                    <button
                      key={pr.id}
                      type="button"
                      onClick={() => handleImportUnbilled('prescription', pr)}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-medium"
                    >
                      + Rx: {pr.medicine_name} (${parseFloat(pr.total_medicine_cost).toFixed(2)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Itemized Services Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Itemized Charges ({items.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  <Plus className="w-3 h-3" />
                  + Add Line Item
                </button>
              </div>

              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 items-center">
                    <div className="col-span-12 sm:col-span-3">
                      <select
                        value={it.item_type}
                        onChange={(e) => handleItemChange(idx, 'item_type', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-white border rounded-lg"
                      >
                        {ITEM_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-12 sm:col-span-4">
                      <input
                        type="text"
                        required
                        value={it.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Service / procedure description"
                        className="w-full px-2 py-1.5 text-xs bg-white border rounded-lg"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        required
                        value={it.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="w-full px-2 py-1.5 text-xs bg-white border rounded-lg"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={it.unit_price}
                        onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                        placeholder="Price"
                        className="w-full px-2 py-1.5 text-xs bg-white border rounded-lg"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Gross Charges:</span>
                <span className="font-mono font-semibold">${grossTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Discount / Concession:</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-24 px-2 py-1 text-right text-xs bg-white border rounded-lg font-mono"
                />
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Tax / Surcharge:</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(e.target.value)}
                  className="w-24 px-2 py-1 text-right text-xs bg-white border rounded-lg font-mono"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 font-bold text-sm">
                <span>Net Payable Amount:</span>
                <span className="font-mono text-emerald-700 text-base">${netTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Generating...' : 'Issue Invoice'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
