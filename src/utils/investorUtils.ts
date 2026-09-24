import {
  Investor,
  InvestorTransaction,
  InvestorAccountSummary,
  InvestorTransactionType,
  FeeDeposit,
  PaymentDisbursement,
} from '../types';
import { formatCurrency } from './academicUtils';

export function computeInvestorAccountSummary(
  investor: Investor,
  transactions: InvestorTransaction[]
): InvestorAccountSummary {
  const investorTxns = transactions.filter(
    (t) => t.investorId === investor.id && t.status === 'Realized'
  );

  const totalInvested = investorTxns
    .filter((t) => t.transactionType === 'Investment')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalWithdrawn = investorTxns
    .filter((t) => t.transactionType === 'Withdrawal')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netActiveInvestment = Math.max(0, totalInvested - totalWithdrawn);

  const sortedTxns = [...investorTxns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const lastTransactionDate = sortedTxns.length > 0 ? sortedTxns[0].date : undefined;

  let status: 'Active' | 'Inactive' | 'Settled' = investor.status;
  if (totalInvested > 0 && netActiveInvestment === 0 && totalWithdrawn >= totalInvested) {
    status = 'Settled';
  }

  return {
    investor,
    totalInvested,
    totalWithdrawn,
    netActiveInvestment,
    lastTransactionDate,
    transactionsCount: investorTxns.length,
    status,
  };
}

export function computeAllInvestorsSummary(
  investors: Investor[],
  transactions: InvestorTransaction[]
) {
  const summaries = investors.map((inv) => computeInvestorAccountSummary(inv, transactions));

  const totalCapitalInfused = summaries.reduce((sum, s) => sum + s.totalInvested, 0);
  const totalCapitalWithdrawn = summaries.reduce((sum, s) => sum + s.totalWithdrawn, 0);
  const totalActiveCapitalHolding = summaries.reduce((sum, s) => sum + s.netActiveInvestment, 0);
  const activeInvestorsCount = summaries.filter((s) => s.netActiveInvestment > 0).length;

  return {
    summaries,
    totalCapitalInfused,
    totalCapitalWithdrawn,
    totalActiveCapitalHolding,
    activeInvestorsCount,
    totalRegisteredInvestors: investors.length,
  };
}

export interface AcademyLiquiditySummary {
  totalStudentFeeRevenue: number;
  totalOperationalDisbursements: number;
  netOperationalProfit: number;
  totalInvestorCapitalInfused: number;
  totalInvestorCapitalWithdrawn: number;
  netActiveInvestorCapital: number;
  totalAvailableTreasuryLiquidity: number; // (Fee Revenue + Realized Investor Capital) - (Operational Expenses + Investor Withdrawals)
  workingCapitalCushionMonths: number; // How many months of operating budget can be covered
}

export function computeAcademyLiquiditySummary(
  deposits: FeeDeposit[],
  disbursements: PaymentDisbursement[],
  investorTransactions: InvestorTransaction[],
  monthlyOperatingBudgetCap = 350000
): AcademyLiquiditySummary {
  const totalStudentFeeRevenue = deposits.reduce((sum, d) => sum + (d.amountPaid || 0), 0);
  
  const totalOperationalDisbursements = disbursements
    .filter((d) => d.status === 'Disbursed')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const netOperationalProfit = totalStudentFeeRevenue - totalOperationalDisbursements;

  const realizedInvestorTxns = investorTransactions.filter((t) => t.status === 'Realized');
  
  const totalInvestorCapitalInfused = realizedInvestorTxns
    .filter((t) => t.transactionType === 'Investment')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalInvestorCapitalWithdrawn = realizedInvestorTxns
    .filter((t) => t.transactionType === 'Withdrawal')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netActiveInvestorCapital = Math.max(0, totalInvestorCapitalInfused - totalInvestorCapitalWithdrawn);

  // Total Available Cash Pool = (Fees In + Investor Capital In) - (Expenses Out + Investor Withdrawals Out)
  const totalAvailableTreasuryLiquidity = Math.max(
    0,
    totalStudentFeeRevenue + totalInvestorCapitalInfused - (totalOperationalDisbursements + totalInvestorCapitalWithdrawn)
  );

  const workingCapitalCushionMonths = monthlyOperatingBudgetCap > 0
    ? Number((totalAvailableTreasuryLiquidity / monthlyOperatingBudgetCap).toFixed(1))
    : 0;

  return {
    totalStudentFeeRevenue,
    totalOperationalDisbursements,
    netOperationalProfit,
    totalInvestorCapitalInfused,
    totalInvestorCapitalWithdrawn,
    netActiveInvestorCapital,
    totalAvailableTreasuryLiquidity,
    workingCapitalCushionMonths,
  };
}

export function generateInvestorTransactionVoucherNo(type: InvestorTransactionType): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const prefix = type === 'Investment' ? 'INV-VCH' : 'INV-WD';
  return `${prefix}-${year}-${randomSuffix}`;
}

export function generateInvestorCode(count: number): string {
  const num = count + 1;
  return `INV-${num.toString().padStart(3, '0')}`;
}

export function exportInvestorLedgerCSV(
  investors: Investor[],
  transactions: InvestorTransaction[]
): void {
  const headers = [
    'Transaction Voucher No',
    'Date',
    'Investor Name',
    'Investor Code',
    'Transaction Type (Inflow / Outflow)',
    'Investment Head',
    'Amount (INR)',
    'Payment Mode',
    'Transaction Ref / UTR',
    'Authorized By',
    'Status',
    'Purpose / Notes',
  ];

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const rows = sorted.map((t) => {
    const inv = investors.find((i) => i.id === t.investorId);
    return [
      `"${t.voucherNo}"`,
      `"${t.date}"`,
      `"${t.investorName}"`,
      `"${inv?.investorCode || 'INV'}"`,
      `"${t.transactionType === 'Investment' ? 'Capital Infusion (Inflow)' : 'Withdrawal Return (Outflow)'}"`,
      `"${t.head}"`,
      t.amount,
      `"${t.paymentMode}"`,
      `"${t.transactionRef || 'N/A'}"`,
      `"${t.authorizedBy}"`,
      `"${t.status}"`,
      `"${(t.purposeDescription || t.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `biley_academy_investor_ledger_${new Date().toISOString().split('T')[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
