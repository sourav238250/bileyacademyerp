import React, { useRef } from 'react';
import {
  InvestorTransaction,
  Investor,
  InstitutionalAuthorizationConfig,
} from '../../types';
import { formatCurrency, numberToWords } from '../../utils/academicUtils';
import { InstituteLogo } from '../common/InstituteLogo';
import {
  Printer,
  Download,
  X,
  ShieldCheck,
  Building,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  FileCheck2,
} from 'lucide-react';

interface InvestorVoucherModalProps {
  transaction: InvestorTransaction | null;
  investor?: Investor | null;
  onClose: () => void;
  authConfig?: InstitutionalAuthorizationConfig;
}

export const InvestorVoucherModal: React.FC<InvestorVoucherModalProps> = ({
  transaction,
  investor,
  onClose,
  authConfig,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isInflow = transaction.transactionType === 'Investment';
  const amountInWords = numberToWords(transaction.amount);

  return (
    <div
      id="voucher-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/80 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="voucher-modal-card"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] my-auto animate-in fade-in zoom-in-95"
      >
        
        {/* Pinned Header Toolbar (Hidden during print) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800 shrink-0 no-print">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isInflow ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isInflow ? 'Official Certificate of Investment' : 'Capital Withdrawal Payout Voucher'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Voucher Ref: <span className="font-mono text-amber-300 font-bold">{transaction.voucherNo}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="print-investor-voucher-btn"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Voucher</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Certificate Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 bg-slate-50/50">
          <div
            ref={contentRef}
            id="printable-voucher-content"
            className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-800 font-sans"
          >
            
            {/* Certificate Institutional Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-200 gap-4 text-center sm:text-left">
              <div className="flex items-center gap-4">
                <InstituteLogo size="lg" variant="rounded" withBorder={true} withGlow={false} />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    BILEY ACADEMY
                  </h1>
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mt-0.5">
                    Treasury & Institutional Capital Division
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Registered Educational Coaching Institution • Since 2026
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  isInflow ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                }`}>
                  {isInflow ? 'Capital Infusion' : 'Capital Repayment'}
                </span>
                <p className="text-xs font-mono font-bold text-slate-700 mt-1.5">
                  VOUCHER: {transaction.voucherNo}
                </p>
                <p className="text-[11px] text-slate-500">
                  Date: <strong>{new Date(transaction.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong>
                </p>
              </div>
            </div>

            {/* Investor & Transaction Particulars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Investor Particulars
                </span>
                <p className="text-sm font-black text-slate-900">{transaction.investorName}</p>
                {investor && (
                  <>
                    <p className="text-slate-600">Investor Code: <strong className="text-slate-900">{investor.investorCode}</strong></p>
                    {investor.panNumber && <p className="text-slate-600">PAN Card: <strong className="text-slate-900">{investor.panNumber}</strong></p>}
                    {investor.phone && <p className="text-slate-600">Phone: {investor.phone}</p>}
                    {investor.bankAccountOrUpi && <p className="text-slate-600 truncate">Account / UPI: {investor.bankAccountOrUpi}</p>}
                  </>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Transaction & Settlement Details
                </span>
                <p className="text-slate-600">
                  Transaction Type: <strong className="text-slate-900">{isInflow ? 'Capital Investment (Inflow)' : 'Capital Return (Outflow)'}</strong>
                </p>
                <p className="text-slate-600">
                  Category Head: <strong className="text-slate-900">{transaction.head}</strong>
                </p>
                <p className="text-slate-600">
                  Payment Channel: <strong className="text-slate-900">{transaction.paymentMode}</strong>
                </p>
                {transaction.transactionRef && (
                  <p className="text-slate-600 truncate">
                    UTR / Ref No: <strong className="font-mono text-slate-900">{transaction.transactionRef}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Amount Banner */}
            <div className={`p-5 rounded-2xl border text-center ${
              isInflow ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-600">
                {isInflow ? 'Total Capital Amount Invested & Credited' : 'Total Capital Amount Disbursed & Withdrawn'}
              </span>
              <p className="text-2xl sm:text-3xl font-black mt-1">
                {formatCurrency(transaction.amount)}
              </p>
              <p className="text-xs font-semibold text-slate-600 italic mt-1 capitalize">
                (Rupees {amountInWords} Only)
              </p>
            </div>

            {/* Purpose & Description */}
            {(transaction.purposeDescription || transaction.notes) && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                  Purpose / Executive Summary
                </span>
                <p className="text-slate-800 font-medium">
                  {transaction.purposeDescription || transaction.notes}
                </p>
              </div>
            )}

            {/* Verification Notice */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Official Institutional Record & Acknowledgement
              </p>
              <p className="text-amber-800 text-[10px]">
                This voucher serves as verified documentary proof of capital allocation within Biley Academy Treasury. All capital infusions and repayments are recorded under institutional financial governance.
              </p>
            </div>

            {/* Signatures & Institutional Seal */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 items-end">
              <div className="text-center sm:text-left">
                <div className="inline-block p-2 border border-slate-300 rounded-lg bg-slate-50 text-[10px] text-slate-600 font-bold uppercase tracking-wider text-center">
                  <span>{authConfig?.sealInstitutionName || 'BILEY ACADEMY'}</span>
                  <p className="text-emerald-700 font-black text-[9px] mt-0.5">★ {authConfig?.sealVerificationText || 'AUTHORIZED & VERIFIED'} ★</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Official Academy Treasury Seal</p>
              </div>

              <div className="text-right flex flex-col items-end">
                {authConfig?.digitalSignatureUrl && (
                  <div className="h-10 mb-1">
                    <img
                      src={authConfig.digitalSignatureUrl}
                      alt="Authorized Signature"
                      className="h-full object-contain"
                    />
                  </div>
                )}
                <p className="text-xs font-bold text-slate-900">
                  {transaction.authorizedBy || authConfig?.directorName || 'Mr. Sourav Dinda'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {authConfig?.directorDesignation || 'Director & Founder'}
                </p>
                <p className="text-[9px] text-slate-400">
                  Authorized Signatory
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Pinned Footer (Hidden during print) */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between no-print">
          <p className="text-xs text-slate-500 hidden sm:block">
            Document ID: <strong className="font-mono text-slate-700">{transaction.id}</strong>
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Voucher</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
