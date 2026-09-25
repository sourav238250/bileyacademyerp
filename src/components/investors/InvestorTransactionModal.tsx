import React, { useState, useEffect } from 'react';
import {
  Investor,
  InvestorTransaction,
  InvestorTransactionType,
  InvestorTransactionHead,
  InstitutionalAuthorizationConfig,
} from '../../types';
import { formatCurrency } from '../../utils/academicUtils';
import {
  computeInvestorAccountSummary,
  generateInvestorTransactionVoucherNo,
} from '../../utils/investorUtils';
import {
  X,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Building,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  DollarSign,
  FileText,
} from 'lucide-react';

interface InvestorTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  investors: Investor[];
  allTransactions: InvestorTransaction[];
  onSaveTransaction: (transaction: InvestorTransaction) => void;
  preselectedInvestorId?: string;
  defaultType?: InvestorTransactionType;
  authConfig?: InstitutionalAuthorizationConfig;
}

export const InvestorTransactionModal: React.FC<InvestorTransactionModalProps> = ({
  isOpen,
  onClose,
  investors,
  allTransactions,
  onSaveTransaction,
  preselectedInvestorId,
  defaultType = 'Investment',
  authConfig,
}) => {
  const [investorId, setInvestorId] = useState<string>('');
  const [transactionType, setTransactionType] = useState<InvestorTransactionType>(defaultType);
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [head, setHead] = useState<InvestorTransactionHead>('Working Capital Infusion');
  const [paymentMode, setPaymentMode] = useState<string>('Bank NEFT / RTGS');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [authorizedBy, setAuthorizedBy] = useState<string>(
    authConfig?.directorName || 'Mr. Sourav Dinda'
  );
  const [purposeDescription, setPurposeDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
    if (preselectedInvestorId && investors.some((i) => i.id === preselectedInvestorId)) {
      setInvestorId(preselectedInvestorId);
    } else if (investors.length > 0 && !investorId) {
      setInvestorId(investors[0].id);
    }
    setTransactionType(defaultType);
    if (defaultType === 'Investment') {
      setHead('Working Capital Infusion');
      setPurposeDescription('Capital infusion for operational liquidity and faculty compensation support.');
    } else {
      setHead('Principal Capital Withdrawal');
      setPurposeDescription('Capital withdrawal from invested funds as per investor agreement.');
    }
  }, [preselectedInvestorId, defaultType, investors, isOpen]);

  // When type changes, adjust head default
  const handleTypeChange = (newType: InvestorTransactionType) => {
    setTransactionType(newType);
    setErrorMessage(null);
    if (newType === 'Investment') {
      setHead('Working Capital Infusion');
      setPurposeDescription('Capital infusion for operational liquidity and faculty compensation support.');
    } else {
      setHead('Principal Capital Withdrawal');
      setPurposeDescription('Capital withdrawal from invested balance as per investor request.');
    }
  };

  const selectedInvestor = investors.find((i) => i.id === investorId);
  const investorSummary = selectedInvestor
    ? computeInvestorAccountSummary(selectedInvestor, allTransactions)
    : null;

  const currentActiveHolding = investorSummary ? investorSummary.netActiveInvestment : 0;
  const numAmount = typeof amount === 'number' ? amount : 0;
  const isWithdrawalExceeding = transactionType === 'Withdrawal' && numAmount > currentActiveHolding;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!investorId) {
      setErrorMessage('Please select an Investor.');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setErrorMessage('Please enter a valid non-negative transaction amount.');
      return;
    }

    if (transactionType === 'Withdrawal' && numAmount > currentActiveHolding) {
      setErrorMessage(
        `Withdrawal amount (${formatCurrency(numAmount)}) exceeds the investor's active holding balance (${formatCurrency(currentActiveHolding)}). Please reduce the withdrawal amount.`
      );
      return;
    }

    const voucherNo = generateInvestorTransactionVoucherNo(transactionType);

    const newTxn: InvestorTransaction = {
      id: `INV-TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      voucherNo,
      investorId,
      investorName: selectedInvestor ? selectedInvestor.name : 'Investor',
      transactionType,
      head,
      amount: numAmount,
      date,
      paymentMode: paymentMode as any,
      transactionRef: transactionRef.trim() || undefined,
      authorizedBy: authorizedBy || 'Mr. Sourav Dinda',
      status: 'Realized',
      purposeDescription: purposeDescription.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveTransaction(newTxn);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 text-white ${
          transactionType === 'Investment'
            ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900'
            : 'bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/15 text-white border border-white/20">
              {transactionType === 'Investment' ? (
                <TrendingUp className="w-5 h-5 text-emerald-300" />
              ) : (
                <TrendingDown className="w-5 h-5 text-amber-300" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                {transactionType === 'Investment'
                  ? 'Record Capital Investment (Money In)'
                  : 'Record Capital Withdrawal (Money Out)'}
              </h2>
              <p className="text-xs text-slate-200">
                {transactionType === 'Investment'
                  ? 'Investor infuses capital to fuel academy operations & liquidity'
                  : 'Disburse principal repayment or ROI profit share to investor'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Notice */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-4 flex-1">
          
          {/* Toggle Type */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleTypeChange('Investment')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                transactionType === 'Investment'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Capital Infusion (Investment Inflow)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('Withdrawal')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                transactionType === 'Withdrawal'
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Capital Return (Withdrawal Outflow)</span>
            </button>
          </div>

          {/* Select Investor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Investor Account *
              </label>
              <select
                required
                value={investorId}
                onChange={(e) => {
                  setInvestorId(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full px-3 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {investors.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} ({inv.investorCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Investor Balance Summary Pill */}
            {selectedInvestor && investorSummary && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Current Active Investment
                  </span>
                  <p className="text-base font-black text-indigo-900">
                    {formatCurrency(investorSummary.netActiveInvestment)}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <p>Total Infused: <strong className="text-slate-700">{formatCurrency(investorSummary.totalInvested)}</strong></p>
                  <p>Withdrawn: <strong className="text-slate-700">{formatCurrency(investorSummary.totalWithdrawn)}</strong></p>
                </div>
              </div>
            )}
          </div>

          {/* Over-withdrawal Warning Alert */}
          {isWithdrawalExceeding && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Withdrawal Amount Exceeds Active Balance!</p>
                <p className="text-[11px] mt-0.5">
                  The requested amount of <strong>{formatCurrency(numAmount)}</strong> exceeds this investor&apos;s net active holding balance of <strong>{formatCurrency(currentActiveHolding)}</strong>. Please adjust the withdrawal amount.
                </p>
              </div>
            </div>
          )}

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Transaction Amount (INR ₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-black text-slate-400">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 200000"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value === '' ? '' : Number(e.target.value));
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full pl-8 pr-3 py-2 text-base font-black text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Transaction Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </div>

          {/* Head & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Investment Head / Category
              </label>
              <select
                value={head}
                onChange={(e) => setHead(e.target.value as InvestorTransactionHead)}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
              >
                {transactionType === 'Investment' ? (
                  <>
                    <option value="Working Capital Infusion">Working Capital Infusion (Smooth Operations)</option>
                    <option value="Infrastructure & Smart Classroom Fund">Infrastructure & Smart Classroom Fund</option>
                    <option value="Emergency Liquidity Cushion">Emergency Liquidity Cushion</option>
                    <option value="General Academy Investment">General Academy Investment</option>
                  </>
                ) : (
                  <>
                    <option value="Principal Capital Withdrawal">Principal Capital Withdrawal</option>
                    <option value="ROI / Profit Share Withdrawal">ROI / Profit Share Withdrawal</option>
                    <option value="Full Account Liquidation / Settlement">Full Account Liquidation / Settlement</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Channel / Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
              >
                <option value="Bank NEFT / RTGS">Bank NEFT / RTGS (Direct Bank Transfer)</option>
                <option value="Corporate UPI / IMPS">Corporate UPI / IMPS (Instant Settlement)</option>
                <option value="Cheque">Account Payee Cheque</option>
                <option value="Cash Voucher">Cash Voucher / Treasury Vault</option>
              </select>
            </div>
          </div>

          {/* Reference & Signatory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Transaction Ref / UTR / Cheque No
              </label>
              <input
                type="text"
                placeholder="e.g. NEFT-HDFC-20260924-00129"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Authorized Signatory
              </label>
              <input
                type="text"
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900"
              />
            </div>
          </div>

          {/* Purpose / Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Purpose & Transaction Notes
            </label>
            <textarea
              rows={2}
              value={purposeDescription}
              onChange={(e) => setPurposeDescription(e.target.value)}
              placeholder="e.g. Inflow to support Q3 batch expansion and faculty honorarium reserve..."
              className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-investor-txn-btn"
              disabled={isWithdrawalExceeding}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                isWithdrawalExceeding
                  ? 'bg-slate-400 cursor-not-allowed'
                  : transactionType === 'Investment'
                  ? 'bg-emerald-700 hover:bg-emerald-600'
                  : 'bg-indigo-700 hover:bg-indigo-600'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {transactionType === 'Investment'
                  ? 'Confirm Capital Infusion'
                  : 'Confirm Capital Withdrawal'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
