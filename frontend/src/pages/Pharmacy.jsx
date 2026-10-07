import React, { useState, useEffect } from 'react';
import { pharmacyService } from '../services/pharmacyService';
import { useAuth } from '../context/AuthContext';
import {
  Pill, Plus, Search, Filter, AlertTriangle, Package,
  Clock, CheckCircle2, RefreshCw, Eye, PackagePlus,
} from 'lucide-react';
import MedicineModal from '../components/pharmacy/MedicineModal';
import AddBatchModal from '../components/pharmacy/AddBatchModal';
import DispenseModal from '../components/pharmacy/DispenseModal';

const Pharmacy = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'prescriptions' | 'expiring'

  // Inventory State
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Prescriptions Queue
  const [prescriptions, setPrescriptions] = useState([]);

  // Expiring Batches
  const [expiringBatches, setExpiringBatches] = useState([]);

  // Modals
  const [showMedModal, setShowMedModal] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [batchMed, setBatchMed] = useState(null);
  const [dispensePrescription, setDispensePrescription] = useState(null);

  const isPharmacistOrAdmin = hasRole('Administrator') || hasRole('Pharmacist');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [medRes, prescRes, expRes] = await Promise.all([
        pharmacyService.getMedicines({
          search: search || undefined,
          lowStockOnly: lowStockOnly || undefined,
        }),
        pharmacyService.getPrescriptions(),
        pharmacyService.getExpiringBatches(180),
      ]);
      setMedicines(medRes.data.data || []);
      setPrescriptions(prescRes.data.data || []);
      setExpiringBatches(expRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pharmacy data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lowStockOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenDispense = async (prescriptionId) => {
    try {
      const res = await pharmacyService.getPrescriptionDetail(prescriptionId);
      setDispensePrescription(res.data.data);
    } catch (err) {
      alert('Failed to load prescription order');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-7 h-7 text-teal-600" />
            Pharmacy & Formulary Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Drug catalog, stock batch levels, automated FIFO/FEFO expiry tracking, and prescription dispensing.
          </p>
        </div>
        {isPharmacistOrAdmin && (
          <button
            onClick={() => { setEditMed(null); setShowMedModal(true); }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-sm shadow-teal-600/20"
          >
            <Plus className="w-4 h-4" />
            Register Medication
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'inventory'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Package className="w-4 h-4" />
          Medication Stock ({medicines.length})
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'prescriptions'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          Prescription Queue ({prescriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('expiring')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'expiring'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          Expiring Batches ({expiringBatches.length})
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">{error}</div>
      )}

      {/* TAB 1: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search brand, generic name, category..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-500">
                Search
              </button>
            </form>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600"
                />
                Show Low Stock Only
              </label>

              <button
                onClick={fetchData}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Drug Name</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Category & Form</th>
                    <th className="px-5 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Unit Price</th>
                    <th className="px-5 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Stock Available</th>
                    <th className="px-5 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Reorder Benchmark</th>
                    <th className="px-5 py-3 text-right font-semibold text-slate-600 text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 bg-slate-100 rounded animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : medicines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        <Pill className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="font-semibold text-slate-600">No drugs found in formulary</p>
                      </td>
                    </tr>
                  ) : (
                    medicines.map((med) => {
                      const isLowStock = med.total_stock <= med.reorder_level;
                      return (
                        <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-900 leading-tight">{med.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{med.generic_name || '—'} {med.strength ? `• ${med.strength}` : ''}</p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-800 text-xs">{med.category}</p>
                            <p className="text-xs text-slate-500">{med.dosage_form}</p>
                          </td>

                          <td className="px-5 py-4 text-center font-mono font-medium text-slate-800">
                            ${parseFloat(med.unit_price).toFixed(2)}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                                isLowStock
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {med.total_stock} units
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center text-xs text-slate-500 font-mono">
                            {med.reorder_level} units
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPharmacistOrAdmin && (
                                <button
                                  onClick={() => setBatchMed(med)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold hover:bg-teal-100"
                                  title="Add Batch Stock"
                                >
                                  <PackagePlus className="w-3.5 h-3.5" />
                                  + Inflow
                                </button>
                              )}
                              {isPharmacistOrAdmin && (
                                <button
                                  onClick={() => { setEditMed(med); setShowMedModal(true); }}
                                  className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                                  title="Edit Medicine"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRESCRIPTIONS QUEUE */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Rx ID & Date</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Patient</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Prescribing Physician</th>
                <th className="px-5 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Total Items</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-600 text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescriptions.map((pr) => (
                <tr key={pr.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100">
                      RX-{String(pr.id).padStart(5, '0')}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{new Date(pr.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-900">{pr.patient_first_name} {pr.patient_last_name}</p>
                    <p className="text-xs text-slate-500 font-mono">{pr.patient_mrn}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-900">Dr. {pr.doctor_name}</p>
                    <p className="text-xs text-slate-500">{pr.doctor_specialization}</p>
                  </td>
                  <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                    {pr.total_items} drugs
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        pr.status === 'dispensed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {pr.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {pr.status === 'pending' && isPharmacistOrAdmin ? (
                      <button
                        onClick={() => handleOpenDispense(pr.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
                      >
                        Dispense Rx
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: EXPIRING BATCHES */}
      {activeTab === 'expiring' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Batch Number</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Medicine</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Expiry Date</th>
                <th className="px-5 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Remaining Units</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-600 text-xs uppercase tracking-wider">Time Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expiringBatches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-800">{b.batch_number}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-900">{b.medicine_name}</p>
                    <p className="text-xs text-slate-500">{b.dosage_form}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-mono text-slate-700">
                    {new Date(b.expiry_date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-center font-bold text-slate-800">{b.quantity_available}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        b.days_left <= 30
                          ? 'bg-rose-100 text-rose-700'
                          : b.days_left <= 90
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {b.days_left} days left
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showMedModal && (
        <MedicineModal
          medicine={editMed}
          onClose={() => { setShowMedModal(false); setEditMed(null); }}
          onSuccess={() => { setShowMedModal(false); setEditMed(null); fetchData(); }}
        />
      )}

      {batchMed && (
        <AddBatchModal
          medicine={batchMed}
          onClose={() => setBatchMed(null)}
          onSuccess={() => { setBatchMed(null); fetchData(); }}
        />
      )}

      {dispensePrescription && (
        <DispenseModal
          prescription={dispensePrescription}
          onClose={() => setDispensePrescription(null)}
          onSuccess={() => { setDispensePrescription(null); fetchData(); }}
        />
      )}
    </div>
  );
};

export default Pharmacy;
