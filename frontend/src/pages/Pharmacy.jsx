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
import { formatLKR } from '../utils/currencyFormatter';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pharmacy & Formulary Inventory
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
              Dispensary & Stock
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pharmaceutical catalog, batch-level stock balances, FEFO expiry tracking, and outpatient prescription fulfillment.
          </p>
        </div>
        {isPharmacistOrAdmin && (
          <button
            onClick={() => { setEditMed(null); setShowMedModal(true); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Register Medication
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/90 text-xs font-medium">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'inventory'
              ? 'border-sky-700 text-sky-800 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Medication Stock ({medicines.length})
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'prescriptions'
              ? 'border-sky-700 text-sky-800 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Dispensing Queue ({prescriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('expiring')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'expiring'
              ? 'border-rose-700 text-rose-800 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          FEFO Expiry Horizon ({expiringBatches.length})
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">{error}</div>
      )}

      {/* TAB 1: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3 flex flex-wrap gap-2.5 items-center justify-between text-xs">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search brand, generic name, category..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white"
                />
              </div>
              <button type="submit" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors">
                Search
              </button>
            </form>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                Low Stock Thresholds Only
              </label>

              <button
                onClick={fetchData}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                title="Refresh formulary"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Medication & Strength</th>
                    <th className="px-4 py-2.5 text-left">Category & Form</th>
                    <th className="px-4 py-2.5 text-right">Unit Tariff</th>
                    <th className="px-4 py-2.5 text-center">Available Stock</th>
                    <th className="px-4 py-2.5 text-center">Reorder Level</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-3.5 bg-slate-100 rounded animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : medicines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        <Pill className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-500" />
                        <p className="font-semibold text-slate-700 text-sm">No Medications In Formulary</p>
                      </td>
                    </tr>
                  ) : (
                    medicines.map((med) => {
                      const isLowStock = med.total_stock <= med.reorder_level;
                      return (
                        <tr key={med.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900 leading-tight">{med.name}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {med.generic_name || '—'} {med.strength ? `• ${med.strength}` : ''}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800">{med.category}</p>
                            <p className="text-[11px] text-slate-400">{med.dosage_form}</p>
                          </td>

                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                            {formatLKR(med.unit_price)}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                                isLowStock
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-slate-100 text-slate-800 border-slate-200'
                              }`}
                            >
                              {med.total_stock} units
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center text-[11px] text-slate-500 font-mono">
                            {med.reorder_level} units
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPharmacistOrAdmin && (
                                <button
                                  onClick={() => setBatchMed(med)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-200 text-xs font-medium hover:bg-sky-100 transition-colors"
                                  title="Add Batch Stock"
                                >
                                  <PackagePlus className="w-3.5 h-3.5" />
                                  Receive Batch
                                </button>
                              )}
                              {isPharmacistOrAdmin && (
                                <button
                                  onClick={() => { setEditMed(med); setShowMedModal(true); }}
                                  className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 text-xs font-medium transition-colors"
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
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Rx ID & Date</th>
                <th className="px-4 py-2.5 text-left">Patient Details</th>
                <th className="px-4 py-2.5 text-left">Prescribing Physician</th>
                <th className="px-4 py-2.5 text-center">Items</th>
                <th className="px-4 py-2.5 text-left">Fulfillment Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {prescriptions.map((pr) => (
                <tr key={pr.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      RX-{String(pr.id).padStart(5, '0')}
                    </span>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      {new Date(pr.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{pr.patient_first_name} {pr.patient_last_name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{pr.patient_mrn}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">Dr. {pr.doctor_name}</p>
                    <p className="text-[11px] text-slate-500">{pr.doctor_specialization}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-medium text-slate-800">
                    {pr.total_items} items
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        pr.status === 'dispensed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {pr.status === 'dispensed' ? 'Dispensed' : 'Pending Fulfillment'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {pr.status === 'pending' && isPharmacistOrAdmin ? (
                      <button
                        onClick={() => handleOpenDispense(pr.id)}
                        className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white text-xs font-medium rounded transition-colors"
                      >
                        Dispense Rx
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">Completed</span>
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
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Batch Identifier</th>
                <th className="px-4 py-2.5 text-left">Medication</th>
                <th className="px-4 py-2.5 text-left">Expiration Date</th>
                <th className="px-4 py-2.5 text-center">Remaining Balance</th>
                <th className="px-4 py-2.5 text-right">FEFO Urgency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {expiringBatches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] font-semibold text-slate-800">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {b.batch_number}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{b.medicine_name}</p>
                    <p className="text-[11px] text-slate-500">{b.dosage_form}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-700">
                    {new Date(b.expiry_date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">{b.quantity_available}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        b.days_left <= 30
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : b.days_left <= 90
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
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
