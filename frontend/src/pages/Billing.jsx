import React, { useState, useEffect } from 'react';
import { billingService } from '../services/billingService';
import { formatLKR } from '../utils/currencyFormatter';
import { useAuth } from '../context/AuthContext';
import {
  Receipt, Plus, Search, Filter, DollarSign,
  CheckCircle2, Clock, AlertCircle, RefreshCw, Eye, CreditCard,
} from 'lucide-react';
import CreateInvoiceModal from '../components/billing/CreateInvoiceModal';
import PaymentModal from '../components/billing/PaymentModal';
import InvoiceDetailModal from '../components/billing/InvoiceDetailModal';

const STATUS_CONFIG = {
  unpaid: { label: 'Unpaid', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  partially_paid: { label: 'Partially Paid', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  paid: { label: 'Paid in Full', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const Billing = () => {
  const { hasRole } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentInvoice, setPaymentInvoice] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await billingService.getInvoices({
        status: selectedStatus || undefined,
      });
      setInvoices(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [selectedStatus]);

  const handleOpenDetail = async (id) => {
    try {
      const res = await billingService.getInvoiceById(id);
      setSelectedInvoice(res.data.data);
    } catch (err) {
      alert('Failed to load invoice details');
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Hospital Billing, Invoices & Cashier
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
              Cashier & Settlement
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consultation tariffs, diagnostic laboratory orders, pharmacy medication invoices, and payment receipts in LKR.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Invoice
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 flex flex-wrap gap-2.5 items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Settlement Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">All Invoices</option>
            <option value="unpaid">Unpaid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid in Full</option>
          </select>
        </div>
        <button
          onClick={fetchInvoices}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          title="Refresh ledger"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Invoice # / Date</th>
                <th className="px-4 py-2.5 text-left">Patient Details</th>
                <th className="px-4 py-2.5 text-right">Net Amount</th>
                <th className="px-4 py-2.5 text-right">Settled Amount</th>
                <th className="px-4 py-2.5 text-right">Balance Due</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3.5 bg-slate-100 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-500" />
                    <p className="font-semibold text-slate-700 text-sm">No Invoices Found</p>
                    <p className="text-xs text-slate-400 mt-1">Generate invoices for completed consultations, labs, and medicines.</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const statusInfo = STATUS_CONFIG[inv.status] || STATUS_CONFIG.unpaid;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {inv.invoice_number}
                        </span>
                        <p className="text-[11px] text-slate-400 font-mono mt-1">
                          {new Date(inv.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 leading-tight">
                          {inv.patient_first_name} {inv.patient_last_name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{inv.patient_mrn} • {inv.patient_phone}</p>
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                        {formatLKR(inv.net_amount)}
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-medium text-emerald-800">
                        {formatLKR(inv.paid_amount)}
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {inv.balance_due > 0 ? (
                          <span className="text-rose-700">{formatLKR(inv.balance_due)}</span>
                        ) : (
                          <span className="text-slate-400">Rs. 0.00</span>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(inv.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => setPaymentInvoice(inv)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium transition-colors"
                            >
                              Receive Payment
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

      {/* Modals */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchInvoices();
          }}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onOpenPayment={(inv) => setPaymentInvoice(inv)}
        />
      )}

      {paymentInvoice && (
        <PaymentModal
          invoice={paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onSuccess={() => {
            setPaymentInvoice(null);
            fetchInvoices();
            if (selectedInvoice && selectedInvoice.id === paymentInvoice.id) {
              handleOpenDetail(paymentInvoice.id);
            }
          }}
        />
      )}
    </div>
  );
};

export default Billing;
