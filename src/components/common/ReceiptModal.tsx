import React, { useState } from 'react';
import { FeeDeposit, Student, InstitutionalAuthorizationConfig } from '../../types';
import {
  formatCurrency,
  computeCandidateDuesTillCurrentMonth,
  getCandidatePreviousTransactions,
} from '../../utils/academicUtils';
import { DEFAULT_AUTHORIZATION_CONFIG } from '../../utils/storage';
import { generateFeeReceiptPDF } from '../../utils/receiptPdfGenerator';
import { InstituteLogo } from './InstituteLogo';
import {
  Printer,
  X,
  CheckCircle,
  GraduationCap,
  Building2,
  Phone,
  Mail,
  MapPin,
  Loader2,
  FileDown,
  Edit3,
  Check,
  RotateCcw,
  Download,
  Share2,
  History,
  CalendarCheck,
  AlertTriangle,
  Receipt,
} from 'lucide-react';

interface ReceiptModalProps {
  deposit: FeeDeposit | null;
  student: Student | null;
  deposits?: FeeDeposit[];
  onClose: () => void;
  authConfig?: InstitutionalAuthorizationConfig;
  onUpdateAuthConfig?: (config: InstitutionalAuthorizationConfig) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  deposit,
  student,
  deposits = [],
  onClose,
  authConfig = DEFAULT_AUTHORIZATION_CONFIG,
  onUpdateAuthConfig,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);
  const [isEditingAuth, setIsEditingAuth] = useState(false);

  // Editable authorization signatory fields
  const [signatoryName, setSignatoryName] = useState(
    authConfig.accountsSignatoryName || 'S. Dinda'
  );
  const [signatoryDesignation, setSignatoryDesignation] = useState(
    authConfig.accountsSignatoryDesignation || 'Chief Accounts Officer'
  );
  const [authoritySubtext, setAuthoritySubtext] = useState(
    authConfig.accountsAuthoritySubtext || 'Biley Academy Treasury'
  );
  const [collectedByName, setCollectedByName] = useState(
    deposit?.collectedBy || authConfig.defaultCollectedBy || 'Accounts Dept - S. Dinda'
  );
  const [sealText, setSealText] = useState(
    authConfig.sealVerificationText || 'PAID'
  );

  if (!deposit || !student) return null;

  const allDeposits = deposits.length > 0 ? deposits : [deposit];
  const previousTransactions = getCandidatePreviousTransactions(
    student.id,
    deposit.receiptNo || deposit.id,
    allDeposits
  );
  const totalPreviouslyPaid = previousTransactions.reduce(
    (sum, d) => sum + (Number(d.amountPaid) || 0),
    0
  );
  const duesSummary = computeCandidateDuesTillCurrentMonth(student, allDeposits, 'September 2026');

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  const handleDownloadPDF = () => {
    try {
      setIsDownloadingPdf(true);
      const doc = generateFeeReceiptPDF(deposit, student, {
        authConfig,
        signatoryName,
        signatoryDesignation,
        authoritySubtext,
        collectedByName,
        sealText,
        deposits: allDeposits,
      });

      const sanitizedStudentName = student.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Fee_Receipt_${deposit.receiptNo}_${sanitizedStudentName}.pdf`;
      doc.save(filename);

      setDownloadSuccessNotice(`Downloaded ${filename} successfully!`);
      setTimeout(() => setDownloadSuccessNotice(null), 4000);
    } catch (err) {
      console.error('Failed to generate fee receipt PDF:', err);
      alert('Unable to generate PDF. Falling back to browser print window.');
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSaveAuth = () => {
    if (onUpdateAuthConfig) {
      onUpdateAuthConfig({
        ...authConfig,
        accountsSignatoryName: signatoryName,
        accountsSignatoryDesignation: signatoryDesignation,
        accountsAuthoritySubtext: authoritySubtext,
        defaultCollectedBy: collectedByName,
        sealVerificationText: sealText,
      });
    }
    setIsEditingAuth(false);
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-2 sm:p-4 md:p-6 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-transparent print:static print:inset-auto print:overflow-visible"
    >
      <div
        id="receipt-modal-card"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh] sm:max-h-[90vh] print:max-h-none print:h-auto print:border-none print:shadow-none print:m-0 print:w-full print:max-w-none"
      >
        
        {/* Header Actions (hidden in print) */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-sm block leading-tight">Official Fee Deposit Receipt</span>
              <span className="text-[10px] text-slate-400 font-mono">Receipt #{deposit.receiptNo}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setIsEditingAuth(!isEditingAuth)}
              id="edit-receipt-auth-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                isEditingAuth
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                  : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Edit Authorized Signatory Name, Designation and Collector"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingAuth ? 'Done Editing' : 'Edit Authorization'}</span>
            </button>

            {/* Direct PDF Download Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              id="download-receipt-pdf-btn"
              title="Download official PDF document directly"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-75"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Save PDF</span>
                </>
              )}
            </button>

            {/* Browser Print Button */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              id="print-receipt-btn"
              title="Open browser print dialogue (A4 format)"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-75"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5 text-slate-300" />
                  <span>Print</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              id="close-receipt-btn"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download Success Banner */}
        {downloadSuccessNotice && (
          <div className="shrink-0 bg-emerald-50 border-b border-emerald-200 px-5 py-2 text-xs font-semibold text-emerald-800 flex items-center justify-between print:hidden">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {downloadSuccessNotice}
            </span>
            <button
              onClick={() => setDownloadSuccessNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Authorization Inline Edit Toolbar (Hidden in Print) */}
        {isEditingAuth && (
          <div className="shrink-0 bg-amber-50 border-b border-amber-200 p-4 print:hidden animate-in fade-in space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                Customize Authorization Name & Signature Lines
              </span>
              <button
                onClick={handleSaveAuth}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save to Settings</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                  Authorized Signatory Name:
                </label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-md font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                  Signatory Designation:
                </label>
                <input
                  type="text"
                  value={signatoryDesignation}
                  onChange={(e) => setSignatoryDesignation(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-md font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                  Collected By Tag:
                </label>
                <input
                  type="text"
                  value={collectedByName}
                  onChange={(e) => setCollectedByName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-md font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Printable Receipt Body */}
        <div id="printable-receipt-content" className="flex-1 overflow-y-auto p-5 sm:p-8 bg-white text-slate-800 font-sans custom-scrollbar print:overflow-visible print:p-0">
          {/* Institute Watermark & Header */}
          <div className="border-b-2 border-emerald-800/20 pb-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <InstituteLogo size="lg" variant="rounded" withBorder={true} />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
                      {authConfig.sealInstitutionName || 'BILEY ACADEMY'}
                    </h1>
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Since 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Center for Secondary & Higher Secondary Academic Excellence (Class 5 to 12)
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> 42/1 Academy Avenue, Kolkata 700029</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> +91 98301 00000</span>
                  </p>
                </div>
              </div>

              {/* Receipt Pill */}
              <div className="text-right">
                <span className="inline-block border-2 border-emerald-600 bg-emerald-50 text-emerald-800 font-bold text-xs uppercase px-3 py-1 rounded-md tracking-wider">
                  FEE DEPOSIT RECEIPT
                </span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-2">
                  No: {deposit.receiptNo}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Date: {deposit.depositDate}
                </p>
              </div>
            </div>
          </div>

          {/* Student & Payment Summary Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
            <div>
              <p className="text-slate-500 font-medium uppercase text-[10px]">Student Details</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{student.name}</p>
              <p className="text-slate-600 mt-0.5"><span className="font-semibold">Student ID:</span> {student.id}</p>
              <p className="text-slate-600 mt-0.5"><span className="font-semibold">Roll No:</span> {student.rollNo}</p>
              <p className="text-slate-600 mt-0.5"><span className="font-semibold">Class / Stream:</span> Class {student.classLevel} ({student.stream})</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase text-[10px]">Guardian & Batch Info</p>
              <p className="font-semibold text-slate-800 mt-0.5">{student.guardianName} ({student.guardianRelation})</p>
              <p className="text-slate-600 mt-0.5"><span className="font-semibold">Contact:</span> {student.contactNumber}</p>
              <p className="text-slate-600 mt-0.5"><span className="font-semibold">Batch:</span> {student.batch}</p>
              <p className="text-slate-600 mt-0.5"><span className="font-semibold">Payment Mode:</span> {deposit.paymentMode}</p>
            </div>
          </div>

          {/* Table of Fee Particulars */}
          <table className="w-full text-xs text-left mb-6 border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Fee Particulars / Description</th>
                <th className="py-2.5 px-4">Coverage Period</th>
                <th className="py-2.5 px-4 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {deposit.headBreakdown && deposit.headBreakdown.length > 0 ? (
                deposit.headBreakdown.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-4 text-slate-500 font-mono">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {item.head}
                      {item.details && (
                        <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                          {item.details}
                        </span>
                      )}
                      {idx === 0 && deposit.transactionRef && (
                        <span className="block font-mono text-[10px] text-emerald-700 mt-0.5">
                          Ref / Txn ID: {deposit.transactionRef}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {deposit.monthsCovered && deposit.monthsCovered.length > 0
                        ? deposit.monthsCovered.join(', ')
                        : 'Current Academic Session'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 px-4 text-slate-500 font-mono">01</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {deposit.feeHead}
                    {deposit.remarks && (
                      <span className="block text-[11px] font-normal text-slate-500 mt-0.5">{deposit.remarks}</span>
                    )}
                    {deposit.transactionRef && (
                      <span className="block font-mono text-[10px] text-emerald-700 mt-0.5">Ref / Txn ID: {deposit.transactionRef}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {deposit.monthsCovered && deposit.monthsCovered.length > 0
                      ? deposit.monthsCovered.join(', ')
                      : 'Current Academic Session'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {formatCurrency(deposit.amountPaid)}
                  </td>
                </tr>
              )}
              {deposit.discountApplied && deposit.discountApplied > 0 ? (
                <tr className="bg-emerald-50/50">
                  <td className="py-2 px-4 text-emerald-700 font-mono">-</td>
                  <td colSpan={2} className="py-2 px-4 text-emerald-800 font-medium italic">
                    Scholarship / Merit Concession Applied
                  </td>
                  <td className="py-2 px-4 text-right text-emerald-700 font-semibold">
                    - {formatCurrency(deposit.discountApplied)}
                  </td>
                </tr>
              ) : null}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
              <tr>
                <td colSpan={3} className="py-3 px-4 text-right uppercase text-[11px] text-slate-700">
                  Net Amount Received (This Receipt):
                </td>
                <td className="py-3 px-4 text-right text-base text-emerald-700">
                  {formatCurrency(deposit.amountPaid)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Section: Previous Deposit Transactions for Candidate */}
          <div className="mb-6">
            <div className="flex items-center justify-between bg-slate-100 px-3.5 py-2 rounded-t-lg border border-slate-200 border-b-0">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-600" />
                Previous Transactions History (Candidate: {student.name})
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                {previousTransactions.length > 0
                  ? `${previousTransactions.length} prior deposit record(s)`
                  : 'First transaction'}
              </span>
            </div>

            {previousTransactions.length > 0 ? (
              <div className="border border-slate-200 rounded-b-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-[10px] text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Receipt No</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Fee Particulars / Coverage</th>
                      <th className="py-2 px-3">Mode</th>
                      <th className="py-2 px-3 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {previousTransactions.map((prev, idx) => (
                      <tr key={prev.id || idx} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3 font-mono font-semibold text-slate-800 text-[11px]">
                          {prev.receiptNo}
                        </td>
                        <td className="py-2 px-3 text-slate-600 text-[11px]">
                          {prev.depositDate}
                        </td>
                        <td className="py-2 px-3 text-slate-700 text-[11px]">
                          {prev.monthsCovered && prev.monthsCovered.length > 0
                            ? prev.monthsCovered.join(', ')
                            : prev.feeHead}
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[10px]">
                          {prev.paymentMode}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 text-[11px]">
                          {formatCurrency(prev.amountPaid)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/80 border-t border-slate-200 font-semibold text-[11px]">
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-right text-slate-600">
                        Total Previously Deposited Amount:
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(totalPreviouslyPaid)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-b-lg text-center text-xs text-slate-500 italic">
                First deposit transaction of the academic session — no previous transactions recorded for this candidate.
              </div>
            )}
          </div>

          {/* Section: Candidate Remaining Dues & Account Statement Till Current Month */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200">
              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-700" />
                Dues & Balance Statement (Till Current Month: {duesSummary.currentSessionMonth})
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                Session Progress: {duesSummary.elapsedMonthsCount} / 12 Months
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-500">Total Net Payable till {duesSummary.currentSessionMonth}</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {formatCurrency(duesSummary.netPayableTillCurrentMonth)}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Includes {duesSummary.elapsedMonthsCount} mos tuition + session fees
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-500">Total Cumulative Deposited</p>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">
                  {formatCurrency(duesSummary.totalPaidTillDate)}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Includes current receipt ({deposit.receiptNo})
                </p>
              </div>

              <div className={`p-2.5 rounded-lg border ${
                duesSummary.remainingDuesTillCurrentMonth === 0
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-amber-50/80 border-amber-300'
              }`}>
                <p className="text-[10px] uppercase font-bold text-slate-600">
                  Remaining Dues till {duesSummary.currentSessionMonth}
                </p>
                <p className={`text-base font-black mt-0.5 ${
                  duesSummary.remainingDuesTillCurrentMonth === 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {duesSummary.remainingDuesTillCurrentMonth === 0 ? (
                    <span>₹0 (Nil - Cleared)</span>
                  ) : (
                    <span>{formatCurrency(duesSummary.remainingDuesTillCurrentMonth)}</span>
                  )}
                </p>
                {duesSummary.advanceCreditTillCurrentMonth > 0 ? (
                  <p className="text-[9px] text-emerald-700 font-semibold mt-0.5">
                    Advance credit: {formatCurrency(duesSummary.advanceCreditTillCurrentMonth)}
                  </p>
                ) : (
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    {duesSummary.remainingDuesTillCurrentMonth === 0 ? 'Up-to-date for session' : 'Payment pending'}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>Full Annual Academic Session Net Fee: <strong className="text-slate-700">{formatCurrency(duesSummary.totalAnnualNetPayable)}</strong></span>
              <span>Total Annual Session Balance Remaining: <strong className="text-slate-800">{formatCurrency(duesSummary.totalAnnualDuesRemaining)}</strong></span>
            </div>
          </div>

          {/* Stamp & Authorized Signature Footer */}
          <div className="flex items-end justify-between pt-6 border-t border-slate-200 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-700/60 flex items-center justify-center p-1 text-center rotate-[-8deg] select-none opacity-85">
                <div className="border border-emerald-700/40 rounded-full w-full h-full flex flex-col items-center justify-center">
                  <span className="text-[8px] font-bold text-emerald-800 uppercase tracking-tight">
                    {authConfig.sealInstitutionName || 'BILEY ACADEMY'}
                  </span>
                  <span className="text-[10px] font-black text-emerald-900 tracking-wider">
                    {sealText}
                  </span>
                  <span className="text-[7px] text-emerald-700 font-mono">{deposit.depositDate}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 max-w-[220px]">
                <p>Receipt generated electronically.</p>
                <p className="font-semibold text-slate-700">Collected by: {collectedByName}</p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              {authConfig.digitalSignatureUrl && authConfig.showSignatureOnReceipts !== false ? (
                <div className="h-12 w-36 flex items-center justify-end mb-1">
                  <img
                    src={authConfig.digitalSignatureUrl}
                    alt="Authorized Signatory Signature"
                    className="max-h-full max-w-full object-contain filter contrast-125"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="h-4"></div>
              )}
              <div className="w-40 border-b border-slate-400 mb-1 ml-auto"></div>
              <p className="text-xs font-bold text-slate-900">
                {signatoryName}
              </p>
              <p className="text-[10px] font-semibold text-slate-700">
                {signatoryDesignation}
              </p>
              <p className="text-[9px] text-slate-500">
                {authoritySubtext}
              </p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 mt-6 pt-3 border-t border-slate-100">
            * This is an official computer-generated fee acknowledgement receipt. Please preserve for academic records.
          </div>
        </div>

        {/* Modal Bottom Action Footer (Hidden in Print) */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-200 print:hidden">
          <div className="text-[11px] text-slate-500">
            <span>Verified System Receipt • </span>
            <span className="font-mono text-slate-700 font-semibold">{deposit.receiptNo}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-75"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-emerald-200" />
                  <span>Download PDF Document</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-75"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
