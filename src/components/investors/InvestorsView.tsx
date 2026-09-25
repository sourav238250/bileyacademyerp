import React, { useState, useMemo } from 'react';
import {
  Investor,
  InvestorTransaction,
  InvestorTransactionType,
  FeeDeposit,
  PaymentDisbursement,
  AdminUser,
  InstitutionalAuthorizationConfig,
} from '../../types';
import { formatCurrency } from '../../utils/academicUtils';
import {
  computeInvestorAccountSummary,
  computeAllInvestorsSummary,
  computeAcademyLiquiditySummary,
  exportInvestorLedgerCSV,
} from '../../utils/investorUtils';
import { SectionAuthHeader } from '../common/SectionAuthHeader';
import { InvestorModal } from './InvestorModal';
import { InvestorTransactionModal } from './InvestorTransactionModal';
import { InvestorVoucherModal } from './InvestorVoucherModal';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  ShieldCheck,
  Building,
  Calendar,
  CreditCard,
  Layers,
  ArrowUpRight,
  Sparkles,
  PieChart,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  FileText,
  UserPlus,
  Edit2,
  Trash2,
  DollarSign,
  Wallet,
  Landmark,
  Coins,
  Percent,
} from 'lucide-react';

interface InvestorsViewProps {
  investors: Investor[];
  investorTransactions: InvestorTransaction[];
  deposits: FeeDeposit[];
  disbursements: PaymentDisbursement[];
  currentAdmin?: AdminUser | null;
  authConfig?: InstitutionalAuthorizationConfig;
  onAddInvestor: (investor: Investor) => void;
  onUpdateInvestor: (investor: Investor) => void;
  onDeleteInvestor: (id: string) => void;
  onAddTransaction: (transaction: InvestorTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAdminLogin?: () => void;
  onOpenPermissionsMatrix?: () => void;
  onOpenAuthSettings?: () => void;
}

export const InvestorsView: React.FC<InvestorsViewProps> = ({
  investors,
  investorTransactions,
  deposits,
  disbursements,
  currentAdmin,
  authConfig,
  onAddInvestor,
  onUpdateInvestor,
  onDeleteInvestor,
  onAddTransaction,
  onDeleteTransaction,
  onOpenAdminLogin,
  onOpenPermissionsMatrix,
  onOpenAuthSettings,
}) => {
  // Tabs within Investors view
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'ledger' | 'liquidity'>('directory');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvestorFilter, setSelectedInvestorFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'Investment' | 'Withdrawal'>('all');
  const [selectedHeadFilter, setSelectedHeadFilter] = useState('all');

  // Modals state
  const [isInvestorModalOpen, setIsInvestorModalOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);

  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [txnModalType, setTxnModalType] = useState<InvestorTransactionType>('Investment');
  const [preselectedInvestorForTxn, setPreselectedInvestorForTxn] = useState<string | undefined>(undefined);

  const [activeVoucherTxn, setActiveVoucherTxn] = useState<InvestorTransaction | null>(null);

  // Summaries
  const {
    summaries: investorSummaries,
    totalCapitalInfused,
    totalCapitalWithdrawn,
    totalActiveCapitalHolding,
    activeInvestorsCount,
  } = useMemo(
    () => computeAllInvestorsSummary(investors, investorTransactions),
    [investors, investorTransactions]
  );

  const liquiditySummary = useMemo(
    () =>
      computeAcademyLiquiditySummary(
        deposits,
        disbursements,
        investorTransactions,
        authConfig?.monthlyDisbursementBudgetCap || 350000
      ),
    [deposits, disbursements, investorTransactions, authConfig]
  );

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return investorTransactions.filter((txn) => {
      const matchesSearch =
        txn.investorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (txn.transactionRef && txn.transactionRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (txn.purposeDescription && txn.purposeDescription.toLowerCase().includes(searchQuery.toLowerCase())) ||
        txn.head.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesInvestor =
        selectedInvestorFilter === 'all' || txn.investorId === selectedInvestorFilter;

      const matchesType =
        selectedTypeFilter === 'all' || txn.transactionType === selectedTypeFilter;

      const matchesHead =
        selectedHeadFilter === 'all' || txn.head === selectedHeadFilter;

      return matchesSearch && matchesInvestor && matchesType && matchesHead;
    });
  }, [investorTransactions, searchQuery, selectedInvestorFilter, selectedTypeFilter, selectedHeadFilter]);

  // Handlers
  const handleOpenAddInvestment = (invId?: string) => {
    setPreselectedInvestorForTxn(invId);
    setTxnModalType('Investment');
    setIsTxnModalOpen(true);
  };

  const handleOpenAddWithdrawal = (invId?: string) => {
    setPreselectedInvestorForTxn(invId);
    setTxnModalType('Withdrawal');
    setIsTxnModalOpen(true);
  };

  const handleOpenEditInvestor = (inv: Investor) => {
    setEditingInvestor(inv);
    setIsInvestorModalOpen(true);
  };

  const handleOpenNewInvestor = () => {
    setEditingInvestor(null);
    setIsInvestorModalOpen(true);
  };

  const handleExportCSV = () => {
    exportInvestorLedgerCSV(investors, investorTransactions);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Section Authorization Header */}
      <SectionAuthHeader
        sectionTitle="Investor Head & Capital Treasury Management"
        sectionDescription="Manage institutional investors, track working capital infusions, process scheduled repayments/withdrawals & monitor academy treasury liquidity."
        currentAdmin={currentAdmin}
        requiredRole="Super Admin / Director"
        onOpenAdminLogin={onOpenAdminLogin}
        onOpenPermissionsMatrix={onOpenPermissionsMatrix}
      />

      {/* Top Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Investor Head & Capital Inflow / Outflow
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-700" /> Capital Reserve
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Empower smooth academy operations, faculty payroll guarantees, and smart classroom expansions with managed investor accounts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => handleOpenAddInvestment()}
            id="investor-record-investment-btn"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>Record Capital Inflow (Invest)</span>
          </button>

          <button
            onClick={() => handleOpenAddWithdrawal()}
            id="investor-record-withdrawal-btn"
            className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingDown className="w-4 h-4 text-indigo-300" />
            <span>Record Withdrawal (Repay)</span>
          </button>

          <button
            onClick={handleOpenNewInvestor}
            id="investor-add-account-btn"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>New Investor Account</span>
          </button>

          <button
            onClick={handleExportCSV}
            title="Download complete investor transactions CSV"
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Net Active Investor Capital */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-5 rounded-2xl shadow-md border border-indigo-900/50 relative overflow-hidden">
          <div className="absolute right-2 -bottom-2 text-indigo-500/10 pointer-events-none">
            <Landmark className="w-24 h-24" />
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            Active Working Capital Holding
          </span>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            {formatCurrency(totalActiveCapitalHolding)}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-300">
            <span className="bg-indigo-800/80 border border-indigo-600/50 px-2 py-0.5 rounded-full font-bold text-amber-300">
              {activeInvestorsCount} Active Investors
            </span>
            <span>Available for Academy</span>
          </div>
        </div>

        {/* Metric 2: Total Capital Infused */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Cumulative Capital Infused (Inflow)
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(totalCapitalInfused)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total principal funds invested to date
          </p>
        </div>

        {/* Metric 3: Total Capital Repaid / Withdrawn */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-indigo-600" />
            Capital Repaid / Withdrawn (Outflow)
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(totalCapitalWithdrawn)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Principal withdrawals & ROI distributions
          </p>
        </div>

        {/* Metric 4: Academy Total Liquid Treasury Pool */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-slate-600" />
            Academy Available Cash & Treasury
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {formatCurrency(liquiditySummary.totalAvailableTreasuryLiquidity)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Buffer Cushion: <strong className="text-slate-800">{liquiditySummary.workingCapitalCushionMonths} Mo</strong> Operating Reserve
          </p>
        </div>

      </div>

      {/* Subtabs Selector */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('directory')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'directory'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Investor Profiles & Holdings ({investors.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'ledger'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Capital Transactions Ledger ({investorTransactions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('liquidity')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'liquidity'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Treasury Liquidity & Working Capital</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: INVESTOR DIRECTORY & HOLDINGS */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {investorSummaries.map((s) => {
              const inv = s.investor;
              const hasActiveBalance = s.netActiveInvestment > 0;

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  
                  {/* Card Top */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {inv.investorCode}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'Settled'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {s.status}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 mt-1">
                          {inv.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {inv.phone} {inv.email ? `• ${inv.email}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditInvestor(inv)}
                          title="Edit Profile"
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove investor account "${inv.name}"?`)) {
                              onDeleteInvestor(inv.id);
                            }
                          }}
                          title="Delete Profile"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Net Holding Amount Box */}
                    <div className="p-3.5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl text-white">
                      <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                        Current Active Investment
                      </span>
                      <p className="text-xl font-black text-white mt-0.5">
                        {formatCurrency(s.netActiveInvestment)}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1.5 pt-1.5 border-t border-slate-800">
                        <span>Total Infused: <strong className="text-white">{formatCurrency(s.totalInvested)}</strong></span>
                        <span>Withdrawn: <strong className="text-amber-300">{formatCurrency(s.totalWithdrawn)}</strong></span>
                      </div>
                    </div>

                    {/* Terms & Purpose Details */}
                    <div className="space-y-1 text-xs text-slate-600">
                      {inv.targetRoiPercent && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Agreed Target ROI:</span>
                          <span className="font-bold text-emerald-700">{inv.targetRoiPercent}% p.a.</span>
                        </div>
                      )}
                      {inv.panNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">PAN Card:</span>
                          <span className="font-mono font-bold text-slate-800">{inv.panNumber}</span>
                        </div>
                      )}
                      {inv.bankAccountOrUpi && (
                        <div className="flex items-center justify-between truncate">
                          <span className="text-slate-500">Bank / UPI:</span>
                          <span className="font-medium text-slate-700 truncate max-w-[150px]">{inv.bankAccountOrUpi}</span>
                        </div>
                      )}
                      {inv.investmentPurpose && (
                        <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-2">
                          &ldquo;{inv.investmentPurpose}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Quick Action Buttons */}
                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddInvestment(inv.id)}
                      className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Invest</span>
                    </button>

                    <button
                      onClick={() => handleOpenAddWithdrawal(inv.id)}
                      disabled={!hasActiveBalance}
                      className={`flex-1 py-1.5 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        hasActiveBalance
                          ? 'bg-indigo-700 hover:bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Withdraw</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedInvestorFilter(inv.id);
                        setActiveSubTab('ledger');
                      }}
                      title="View Ledger Statement"
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Ledger
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {investors.length === 0 && (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Investor Accounts Registered</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Register an angel patron, academic investor, or working capital partner to support the academy.
              </p>
              <button
                onClick={handleOpenNewInvestor}
                className="mt-4 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
              >
                + Register First Investor
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: CAPITAL TRANSACTIONS LEDGER */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by Investor, Voucher No, UTR, or Head..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedInvestorFilter}
                onChange={(e) => setSelectedInvestorFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Investors ({investors.length})</option>
                {investors.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} ({inv.investorCode})
                  </option>
                ))}
              </select>

              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
                className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types (Inflows & Returns)</option>
                <option value="Investment">Capital Inflow (Investment)</option>
                <option value="Withdrawal">Capital Outflow (Withdrawal)</option>
              </select>

              {(searchQuery || selectedInvestorFilter !== 'all' || selectedTypeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedInvestorFilter('all');
                    setSelectedTypeFilter('all');
                  }}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                    <th className="p-3.5 pl-4">Voucher No</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Investor Name</th>
                    <th className="p-3.5">Transaction Type</th>
                    <th className="p-3.5">Investment Head</th>
                    <th className="p-3.5">Payment Channel & UTR</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5 text-center pr-4">Voucher & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredTransactions.map((txn) => {
                    const isInflow = txn.transactionType === 'Investment';
                    const inv = investors.find((i) => i.id === txn.investorId);

                    return (
                      <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 pl-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {txn.voucherNo}
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-slate-600">
                          {new Date(txn.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <p className="font-bold text-slate-900">{txn.investorName}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {inv?.investorCode || 'INV'}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            isInflow
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          }`}>
                            {isInflow ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            <span>{isInflow ? 'Capital Inflow (Invest)' : 'Capital Outflow (Withdraw)'}</span>
                          </span>
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-800">{txn.head}</p>
                          {txn.purposeDescription && (
                            <p className="text-[10px] text-slate-500 truncate max-w-xs">
                              {txn.purposeDescription}
                            </p>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <p className="font-medium text-slate-800">{txn.paymentMode}</p>
                          {txn.transactionRef && (
                            <p className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">
                              {txn.transactionRef}
                            </p>
                          )}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <span className={`text-sm font-black ${
                            isInflow ? 'text-emerald-700' : 'text-indigo-800'
                          }`}>
                            {isInflow ? '+' : '-'} {formatCurrency(txn.amount)}
                          </span>
                        </td>
                        <td className="p-3.5 text-center pr-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setActiveVoucherTxn(txn)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Voucher</span>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete transaction voucher ${txn.voucherNo}?`)) {
                                  onDeleteTransaction(txn.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredTransactions.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <p className="font-semibold text-xs">No capital transactions match the selected filters.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 3: LIQUIDITY & TREASURY CUSHION */}
      {activeSubTab === 'liquidity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Liquidity Breakdown Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-indigo-700" />
                <span>Academy Capital Liquidity Architecture</span>
              </h3>
              <p className="text-xs text-slate-500">
                How investor working capital protects the academy during seasonal admission & examination fee collection cycles:
              </p>

              <div className="space-y-3 pt-2">
                
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-900 block">Student Fee Collections Revenue</span>
                    <span className="text-[10px] text-emerald-700">Gross inflows from tuition, admission, exam & lab fees</span>
                  </div>
                  <span className="text-sm font-black text-emerald-800">
                    +{formatCurrency(liquiditySummary.totalStudentFeeRevenue)}
                  </span>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-blue-900 block">Realized Investor Capital Inflow</span>
                    <span className="text-[10px] text-blue-700">Funds infused by patrons to guarantee faculty salaries & tech</span>
                  </div>
                  <span className="text-sm font-black text-blue-800">
                    +{formatCurrency(liquiditySummary.totalInvestorCapitalInfused)}
                  </span>
                </div>

                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-rose-900 block">Realized Academy Operating Expenses</span>
                    <span className="text-[10px] text-rose-700">Faculty salaries, utilities, vendors, contractor maintenance & assets</span>
                  </div>
                  <span className="text-sm font-black text-rose-800">
                    -{formatCurrency(liquiditySummary.totalOperationalDisbursements)}
                  </span>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-purple-900 block">Investor Withdrawals & Repayments</span>
                    <span className="text-[10px] text-purple-700">Principal capital returns and quarterly profit distributions</span>
                  </div>
                  <span className="text-sm font-black text-purple-800">
                    -{formatCurrency(liquiditySummary.totalInvestorCapitalWithdrawn)}
                  </span>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">Net Available Treasury Liquidity</span>
                    <span className="text-[10px] text-slate-300">Ready cash in bank & treasury vault</span>
                  </div>
                  <span className="text-lg font-black text-emerald-400">
                    {formatCurrency(liquiditySummary.totalAvailableTreasuryLiquidity)}
                  </span>
                </div>

              </div>
            </div>

            {/* Investor Governance Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Investor Head Policy & Governance Terms</span>
              </h3>
              <p className="text-xs text-slate-500">
                Institutional guidelines for capital infusion, liquidity guarantees, and withdrawal clearance:
              </p>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900">1. On-Demand Principal Withdrawal Protection</h4>
                  <p className="text-slate-600 text-[11px]">
                    Investors can request partial or complete withdrawal of their unencumbered invested capital at any time. The system automatically enforces holding checks to disallow over-withdrawing.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900">2. Operational Smoothness Guarantee</h4>
                  <p className="text-slate-600 text-[11px]">
                    Capital is deployed strictly into academic working capital, faculty compensation consistency, laboratory instrumentation, and study material publication.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900">3. Verified Official Vouchers</h4>
                  <p className="text-slate-600 text-[11px]">
                    Every capital deposit or withdrawal generates a verifiable, printable certificate with UTR references, official institute seal, and director signatory credentials.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: INVESTOR PROFILE MODAL */}
      <InvestorModal
        isOpen={isInvestorModalOpen}
        onClose={() => {
          setEditingInvestor(null);
          setIsInvestorModalOpen(false);
        }}
        onSaveInvestor={(inv) => {
          const isExisting = investors.some((i) => i.id === inv.id);
          if (isExisting || editingInvestor) {
            onUpdateInvestor(inv);
          } else {
            onAddInvestor(inv);
          }
          setEditingInvestor(null);
          setIsInvestorModalOpen(false);
        }}
        investorToEdit={editingInvestor}
        existingInvestorsCount={investors.length}
      />

      {/* MODAL 2: INVESTOR TRANSACTION (INVEST / WITHDRAW) MODAL */}
      <InvestorTransactionModal
        isOpen={isTxnModalOpen}
        onClose={() => {
          setPreselectedInvestorForTxn(undefined);
          setIsTxnModalOpen(false);
        }}
        investors={investors}
        allTransactions={investorTransactions}
        onSaveTransaction={(txn) => {
          onAddTransaction(txn);
          setPreselectedInvestorForTxn(undefined);
          setIsTxnModalOpen(false);
        }}
        preselectedInvestorId={preselectedInvestorForTxn}
        defaultType={txnModalType}
        authConfig={authConfig}
      />

      {/* MODAL 3: OFFICIAL PRINTABLE VOUCHER MODAL */}
      <InvestorVoucherModal
        transaction={activeVoucherTxn}
        investor={investors.find((i) => i.id === activeVoucherTxn?.investorId)}
        onClose={() => setActiveVoucherTxn(null)}
        authConfig={authConfig}
      />

    </div>
  );
};
