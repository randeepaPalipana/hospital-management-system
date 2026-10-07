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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-emerald-600" />
            Billing, Invoices & Payments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Hospital consultation charges, laboratory investigations, pharmacy medication bills, and settlement receipts.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-sm shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          Generate Invoice
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Filter by Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Invoices</option>
            <option value="unpaid">Unpaid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <button
          onClick={fetchInvoices}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Invoice #</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Patient Details</th>
                <th className="px-5 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Net Amount</th>
                <th className="px-5 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Amount Paid</th>
                <th className="px-5 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Balance Due</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-600 text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <Receipt className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">No invoices found</p>
                    <p className="text-xs text-slate-400 mt-1">Generate invoices for completed consultations, labs, and medicines.</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const statusInfo = STATUS_CONFIG[inv.status] || STATUS_CONFIG.unpaid;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                          {inv.invoice_number}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">{new Date(inv.created_at).toLocaleDateString()}</p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900 leading-tight">
                          {inv.patient_first_name} {inv.patient_last_name}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{inv.patient_mrn} • {inv.patient_phone}</p>
                      </td>

                      <td className="px-5 py-4 text-center font-mono font-semibold text-slate-800">
                        {formatLKR(inv.net_amount)}
                      </td>

                      <td className="px-5 py-4 text-center font-mono text-emerald-700 font-medium">
                        {formatLKR(inv.paid_amount)}
                      </td>

                      <td className="px-5 py-4 text-center font-mono font-bold text-rose-700">
                        {formatLKR(inv.balance_due)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(inv.id)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => setPaymentInvoice(inv)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                            >
                              Pay
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
