import React, { useState, useEffect } from 'react';
import {
  Student,
  FeeDeposit,
  FeeHeadType,
  PaymentMode,
  ClassLevel,
  FeeStructure,
  AdminUser,
} from '../../types';
import {
  formatCurrency,
  computeStudentFeeSummary,
  generateReceiptNumber,
  DEFAULT_FEE_STRUCTURE,
  CLASS_LEVELS,
  ACADEMIC_SESSION_MONTHS,
  MONTH_SHORT_NAMES,
  getStudentTuitionMonthsStatus,
  getNextUnpaidTuitionMonth,
} from '../../utils/academicUtils';
import { evaluateSectionAuthorization, hasPermission } from '../../utils/auth';
import { SectionAuthHeader } from '../common/SectionAuthHeader';
import { RestrictionBanner } from '../common/RestrictionBanner';
import { SessionRevenueGoalTracker } from './SessionRevenueGoalTracker';
import { MonthlyTuitionTracker } from './MonthlyTuitionTracker';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  TrendingUp,
  Receipt,
  Layers,
  ArrowUpRight,
  Filter,
  Trash2,
  X,
  FileText,
  DollarSign,
  Send,
  Lock,
  Download,
  Calculator,
  FileSpreadsheet,
  Edit3,
  SlidersHorizontal,
  Sparkles,
  RefreshCw,
  Info,
  Check,
  Calendar,
} from 'lucide-react';

interface FeesViewProps {
  students: Student[];
  deposits: FeeDeposit[];
  subjects?: import('../../types').Subject[];
  authConfig?: import('../../types').InstitutionalAuthorizationConfig;
  onAddDeposit: (deposit: FeeDeposit) => void;
  onDeleteDeposit: (depositId: string) => void;
  onViewReceipt: (deposit: FeeDeposit) => void;
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  preselectedStudentId?: string;
  preselectedMonth?: string;
  initialActiveTab?: 'deposits' | 'dues' | 'monthly-tracker' | 'structure';
  currentAdmin?: AdminUser | null;
  onOpenAdminLogin?: () => void;
  onOpenPermissionsMatrix?: () => void;
  onOpenAuthorizationSettings?: () => void;
  onOpenAuthSettings?: () => void;
}

export const FeesView: React.FC<FeesViewProps> = ({
  students,
  deposits,
  subjects,
  authConfig,
  onAddDeposit,
  onDeleteDeposit,
  onViewReceipt,
  isDepositModalOpen,
  setIsDepositModalOpen,
  preselectedStudentId,
  preselectedMonth,
  initialActiveTab,
  currentAdmin,
  onOpenAdminLogin,
  onOpenPermissionsMatrix,
  onOpenAuthorizationSettings,
  onOpenAuthSettings,
}) => {
  const auth = evaluateSectionAuthorization(currentAdmin, 'fees');
  const isFeeDepositLocked = authConfig?.isFeeDepositLocked || false;
  const canCollectFees = auth.canWrite && hasPermission(currentAdmin, 'FEES_COLLECT_DEPOSIT') && !isFeeDepositLocked;
  const canManageStructures = auth.canWrite && hasPermission(currentAdmin, 'FEES_MANAGE_STRUCTURE');
  const handleOpenAuthSettings = onOpenAuthorizationSettings || onOpenAuthSettings;
  const [activeTab, setActiveTab] = useState<'deposits' | 'dues' | 'monthly-tracker' | 'structure'>(
    initialActiveTab || 'deposits'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');

  // Sync initial tab when changed from props
  useEffect(() => {
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);

  // Fee Structures State with Local Persistence
  const [feeStructures, setFeeStructures] = useState<Record<string, FeeStructure>>(() => {
    try {
      const saved = localStorage.getItem('biley_academy_custom_fee_structure_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_FEE_STRUCTURE, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load fee structures:', e);
    }
    return DEFAULT_FEE_STRUCTURE;
  });

  // Fee Structure UI Filter & Search
  const [structureCategoryFilter, setStructureCategoryFilter] = useState<
    'ALL' | 'PRIMARY' | 'MIDDLE' | 'SECONDARY' | 'SENIOR' | 'SCIENCE' | 'COMMERCE' | 'ARTS'
  >('ALL');

  // Interactive Fee Calculator State
  const [calcClass, setCalcClass] = useState<ClassLevel>('10');
  const [calcStream, setCalcStream] = useState<string>('General');
  const [calcMode, setCalcMode] = useState<'full' | 'perSubject'>('perSubject');
  const [calcSubjectCount, setCalcSubjectCount] = useState<number>(4);
  const [calcScholarship, setCalcScholarship] = useState<number>(0);

  // Edit Fee Rate Modal State
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editAdmissionFee, setEditAdmissionFee] = useState<number>(100);
  const [editMonthlyFee, setEditMonthlyFee] = useState<number>(400);
  const [editPerSubjectFee, setEditPerSubjectFee] = useState<number>(400);
  const [editExamFee, setEditExamFee] = useState<number>(100);
  const [editMaterialsFee, setEditMaterialsFee] = useState<number>(50);
  const [editAnnualDevFee, setEditAnnualDevFee] = useState<number>(50);
  const [structureSuccessNotice, setStructureSuccessNotice] = useState<string | null>(null);

  // Batch Bracket Update State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [batchTargetBracket, setBatchTargetBracket] = useState<'PRIMARY' | 'MIDDLE' | 'SECONDARY' | 'SENIOR' | 'ALL'>('PRIMARY');
  const [batchAdmissionFee, setBatchAdmissionFee] = useState<number>(100);
  const [batchTuitionFee, setBatchTuitionFee] = useState<number>(300);
  const [batchExamFee, setBatchExamFee] = useState<number>(50);
  const [batchMaterialsFee, setBatchMaterialsFee] = useState<number>(50);
  const [batchAnnualDevFee, setBatchAnnualDevFee] = useState<number>(50);

  // Form State for Fee Deposit Modal - Supports Multiple Simultaneous Fee Heads
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preselectedStudentId || students[0]?.id || ''
  );
  const [selectedFeeHeads, setSelectedFeeHeads] = useState<FeeHeadType[]>(['Tuition Fee']);
  const [amountPaid, setAmountPaid] = useState<number>(1400);
  const [tuitionSubjectCount, setTuitionSubjectCount] = useState<number>(4);
  const [tuitionMonthsCount, setTuitionMonthsCount] = useState<number>(1);
  const [examTermCount, setExamTermCount] = useState<number>(1);
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI / GPay / PhonePe');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['Current Month']);
  const [collectedBy, setCollectedBy] = useState<string>('Accounts Dept - S. Dinda');
  const [remarks, setRemarks] = useState<string>('Tuition installment received with receipt issued.');

  // Helper to compute individual head rate & amount
  const getHeadRateAndAmount = (
    head: FeeHeadType,
    studentId: string,
    subjectsCount: number,
    monthsCount: number,
    termsCount: number
  ): { amount: number; rateDisplay: string; details: string } => {
    const student = students.find((s) => s.id === studentId);
    const structKey = student ? `${student.classLevel}-${student.stream}` : '1-General';
    const st =
      feeStructures[structKey] ||
      feeStructures[`${student?.classLevel || '1'}-General`] ||
      DEFAULT_FEE_STRUCTURE[structKey] ||
      DEFAULT_FEE_STRUCTURE['1-General'];

    switch (head) {
      case 'Tuition Fee': {
        const perSub = st.perSubjectMonthlyFee || 350;
        const amount = perSub * Math.max(1, subjectsCount) * Math.max(1, monthsCount);
        return {
          amount,
          rateDisplay: `₹${perSub}/subj/mo`,
          details: `Tuition for ${subjectsCount} subject(s) × ${monthsCount} month(s)`,
        };
      }
      case 'Admission Fee':
        return {
          amount: st.admissionFee,
          rateDisplay: `₹${st.admissionFee}`,
          details: 'One-time admission & session enrollment fee',
        };
      case 'Exam Fee': {
        const amount = st.examFeePerTerm * Math.max(1, termsCount);
        return {
          amount,
          rateDisplay: `₹${st.examFeePerTerm}/term`,
          details: `Term exam assessment fee (${termsCount} term(s))`,
        };
      }
      case 'Study Material and Lab Fees':
      case 'Study Material & Lab Fee':
        return {
          amount: st.materialsFee,
          rateDisplay: `₹${st.materialsFee}`,
          details: 'Study materials, worksheets & laboratory fee',
        };
      case 'Annual Development Fees and others':
      case 'Annual Development Fee':
        return {
          amount: st.annualDevelopmentFee ?? 50,
          rateDisplay: `₹${st.annualDevelopmentFee ?? 50}/yr`,
          details: 'Annual development, library & amenities fee',
        };
      default:
        return {
          amount: 300,
          rateDisplay: '₹300',
          details: 'Institutional fee',
        };
    }
  };

  // Helper to compute combined total across multiple selected fee heads
  const calculateTotalForHeads = (
    heads: FeeHeadType[],
    studentId: string,
    subjectsCount: number,
    monthsCount: number,
    termsCount: number
  ) => {
    let total = 0;
    const breakdown: { head: FeeHeadType; amount: number; rateDisplay: string; details: string }[] = [];

    for (const h of heads) {
      const item = getHeadRateAndAmount(h, studentId, subjectsCount, monthsCount, termsCount);
      total += item.amount;
      breakdown.push({
        head: h,
        amount: item.amount,
        rateDisplay: item.rateDisplay,
        details: item.details,
      });
    }

    return { total, breakdown };
  };

  const handleOpenDepositModal = (
    studentId?: string,
    customAmount?: number,
    defaultHead?: FeeHeadType,
    preselectedMonthsInput?: string | string[]
  ) => {
    const sId = studentId || preselectedStudentId || students[0]?.id || '';
    setSelectedStudentId(sId);
    
    const targetStudent = students.find((s) => s.id === sId);
    const initialHead = defaultHead || 'Tuition Fee';
    const initialHeads: FeeHeadType[] = [initialHead];
    setSelectedFeeHeads(initialHeads);

    const initialSubjCount =
      targetStudent?.enrolledSubjectIds?.length && targetStudent.enrolledSubjectIds.length > 0
        ? targetStudent.enrolledSubjectIds.length
        : 4;
    setTuitionSubjectCount(initialSubjCount);

    // Determine initial months for tuition
    let initMonths: string[] = [];
    if (preselectedMonthsInput) {
      initMonths = Array.isArray(preselectedMonthsInput)
        ? preselectedMonthsInput
        : [preselectedMonthsInput];
    } else if (preselectedMonth) {
      initMonths = [preselectedMonth];
    } else {
      const nextUnpaid = getNextUnpaidTuitionMonth(sId, deposits);
      initMonths = [nextUnpaid || ACADEMIC_SESSION_MONTHS[0]];
    }

    const initMonthsCount = Math.max(1, initMonths.length);
    setTuitionMonthsCount(initMonthsCount);
    setSelectedMonths(initMonths);
    setExamTermCount(1);

    if (customAmount !== undefined) {
      setAmountPaid(customAmount);
      setIsCustomAmount(true);
    } else {
      const { total } = calculateTotalForHeads(initialHeads, sId, initialSubjCount, initMonthsCount, 1);
      setAmountPaid(total);
      setIsCustomAmount(false);
    }

    if (initialHead === 'Admission Fee') {
      setRemarks('One-time institutional admission & registration fee.');
    } else if (initialHead === 'Tuition Fee') {
      setRemarks(`Tuition fee for ${initMonths.join(', ')} (${initialSubjCount} subjects).`);
    } else if (initialHead === 'Exam Fee') {
      setRemarks('Term examination assessment fee.');
    } else if (initialHead === 'Study Material and Lab Fees') {
      setRemarks('Study material and lab fees.');
    } else if (initialHead === 'Annual Development Fees and others') {
      setRemarks('Annual development fees and others fund.');
    }

    setTransactionRef(`UPI/${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`);
    setIsDepositModalOpen(true);
  };

  // Toggle Fee Head in multi-selection mode
  const handleToggleFeeHeadInDeposit = (head: FeeHeadType) => {
    let nextHeads: FeeHeadType[];
    if (selectedFeeHeads.includes(head)) {
      if (selectedFeeHeads.length === 1) {
        // Prevent deselecting all heads (keep at least one)
        return;
      }
      nextHeads = selectedFeeHeads.filter((h) => h !== head);
    } else {
      nextHeads = [...selectedFeeHeads, head];
    }
    setSelectedFeeHeads(nextHeads);
    setIsCustomAmount(false);

    const { total, breakdown } = calculateTotalForHeads(
      nextHeads,
      selectedStudentId,
      tuitionSubjectCount,
      tuitionMonthsCount,
      examTermCount
    );
    setAmountPaid(total);

    const desc = breakdown.map((b) => b.head).join(', ');
    setRemarks(`Fee payment received for: ${desc}.`);
  };

  // Apply Quick Preset for heads
  const handleApplyHeadsPreset = (preset: 'tuition' | 'admission_tuition' | 'all') => {
    let nextHeads: FeeHeadType[];
    if (preset === 'tuition') {
      nextHeads = ['Tuition Fee'];
    } else if (preset === 'admission_tuition') {
      nextHeads = ['Admission Fee', 'Tuition Fee'];
    } else {
      nextHeads = [
        'Tuition Fee',
        'Admission Fee',
        'Exam Fee',
        'Study Material and Lab Fees',
        'Annual Development Fees and others',
      ];
    }
    setSelectedFeeHeads(nextHeads);
    setIsCustomAmount(false);

    const { total, breakdown } = calculateTotalForHeads(
      nextHeads,
      selectedStudentId,
      tuitionSubjectCount,
      tuitionMonthsCount,
      examTermCount
    );
    setAmountPaid(total);
    const desc = breakdown.map((b) => b.head).join(', ');
    setRemarks(`Fee payment received for: ${desc}.`);
  };

  const handleStudentChangeInDeposit = (newStudentId: string) => {
    setSelectedStudentId(newStudentId);
    const targetStudent = students.find((s) => s.id === newStudentId);
    const newSubjCount =
      targetStudent?.enrolledSubjectIds?.length && targetStudent.enrolledSubjectIds.length > 0
        ? targetStudent.enrolledSubjectIds.length
        : tuitionSubjectCount;
    setTuitionSubjectCount(newSubjCount);

    // Auto calculate next unpaid month for this student
    const nextUnpaid = getNextUnpaidTuitionMonth(newStudentId, deposits);
    const newMonths = [nextUnpaid || ACADEMIC_SESSION_MONTHS[0]];
    setSelectedMonths(newMonths);
    setTuitionMonthsCount(newMonths.length);

    if (!isCustomAmount) {
      const { total } = calculateTotalForHeads(
        selectedFeeHeads,
        newStudentId,
        newSubjCount,
        newMonths.length,
        examTermCount
      );
      setAmountPaid(total);
    }
  };

  const handleToggleTuitionMonth = (month: string) => {
    let nextMonths: string[];
    if (selectedMonths.includes(month)) {
      if (selectedMonths.length === 1) {
        // keep at least 1 month or allow deselecting
        nextMonths = [];
      } else {
        nextMonths = selectedMonths.filter((m) => m !== month);
      }
    } else {
      nextMonths = [...selectedMonths, month];
    }

    const monthsCount = Math.max(1, nextMonths.length);
    setSelectedMonths(nextMonths);
    setTuitionMonthsCount(monthsCount);
    setIsCustomAmount(false);

    const { total } = calculateTotalForHeads(
      selectedFeeHeads,
      selectedStudentId,
      tuitionSubjectCount,
      monthsCount,
      examTermCount
    );
    setAmountPaid(total);
    setRemarks(`Tuition fee for: ${nextMonths.length > 0 ? nextMonths.join(', ') : 'None selected'} (${tuitionSubjectCount} subjects).`);
  };

  const handleApplyMonthPreset = (preset: 'next_1' | 'quarter_3' | 'semester_6' | 'all_unpaid' | 'clear') => {
    const studentStatuses = getStudentTuitionMonthsStatus(selectedStudentId, deposits);
    const unpaidMonths = studentStatuses.filter((s) => !s.isPaid).map((s) => s.month);

    let nextMonths: string[] = [];
    if (preset === 'next_1') {
      nextMonths = unpaidMonths.slice(0, 1);
      if (nextMonths.length === 0) nextMonths = [ACADEMIC_SESSION_MONTHS[0]];
    } else if (preset === 'quarter_3') {
      nextMonths = unpaidMonths.slice(0, 3);
      if (nextMonths.length === 0) nextMonths = ACADEMIC_SESSION_MONTHS.slice(0, 3) as unknown as string[];
    } else if (preset === 'semester_6') {
      nextMonths = unpaidMonths.slice(0, 6);
      if (nextMonths.length === 0) nextMonths = ACADEMIC_SESSION_MONTHS.slice(0, 6) as unknown as string[];
    } else if (preset === 'all_unpaid') {
      nextMonths = unpaidMonths.length > 0 ? unpaidMonths : (ACADEMIC_SESSION_MONTHS as unknown as string[]);
    } else if (preset === 'clear') {
      nextMonths = [];
    }

    const monthsCount = Math.max(1, nextMonths.length);
    setSelectedMonths(nextMonths);
    setTuitionMonthsCount(monthsCount);
    setIsCustomAmount(false);

    const { total } = calculateTotalForHeads(
      selectedFeeHeads,
      selectedStudentId,
      tuitionSubjectCount,
      monthsCount,
      examTermCount
    );
    setAmountPaid(total);
    setRemarks(`Tuition fee for: ${nextMonths.length > 0 ? nextMonths.join(', ') : 'None'} (${tuitionSubjectCount} subjects).`);
  };

  const handleTuitionParamsChange = (newSubjCount: number, newMonthsCount: number) => {
    setTuitionSubjectCount(newSubjCount);
    setTuitionMonthsCount(newMonthsCount);
    setIsCustomAmount(false);

    // Pick top N unpaid months
    const studentStatuses = getStudentTuitionMonthsStatus(selectedStudentId, deposits);
    const unpaidMonths = studentStatuses.filter((s) => !s.isPaid).map((s) => s.month);
    const pickedMonths = unpaidMonths.slice(0, newMonthsCount);
    const finalMonths = pickedMonths.length > 0 ? pickedMonths : (ACADEMIC_SESSION_MONTHS.slice(0, newMonthsCount) as unknown as string[]);
    setSelectedMonths(finalMonths);

    const { total } = calculateTotalForHeads(
      selectedFeeHeads,
      selectedStudentId,
      newSubjCount,
      newMonthsCount,
      examTermCount
    );
    setAmountPaid(total);
  };

  const handleExamTermsChange = (newTerms: number) => {
    setExamTermCount(newTerms);
    setIsCustomAmount(false);
    const { total } = calculateTotalForHeads(
      selectedFeeHeads,
      selectedStudentId,
      tuitionSubjectCount,
      tuitionMonthsCount,
      newTerms
    );
    setAmountPaid(total);
    setSelectedMonths(newTerms === 1 ? ['Term Examination'] : ['Annual (2 Terms) Examination']);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || amountPaid < 0 || selectedFeeHeads.length === 0) {
      alert('Please select a student, at least one fee head, and enter a valid non-negative amount.');
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);
    const receiptNo = generateReceiptNumber(deposits.length);

    const { total: standardCalculatedTotal, breakdown } = calculateTotalForHeads(
      selectedFeeHeads,
      selectedStudentId,
      tuitionSubjectCount,
      tuitionMonthsCount,
      examTermCount
    );

    // If custom amount override, distribute proportionally across breakdown items
    const finalBreakdown = breakdown.map((b) => ({
      head: b.head,
      amount: isCustomAmount
        ? Math.round((Number(amountPaid) * (b.amount / (standardCalculatedTotal || 1))))
        : b.amount,
      details: b.details,
    }));

    const primaryFeeHead = selectedFeeHeads.join(', ');

    const newDeposit: FeeDeposit = {
      id: receiptNo,
      receiptNo,
      studentId: selectedStudentId,
      depositDate: new Date().toISOString().split('T')[0],
      amountPaid: Number(amountPaid),
      feeHead: (selectedFeeHeads.length === 1 ? selectedFeeHeads[0] : primaryFeeHead) as any,
      selectedFeeHeads: selectedFeeHeads,
      headBreakdown: finalBreakdown,
      monthsCovered: selectedMonths,
      paymentMode,
      transactionRef: transactionRef || undefined,
      collectedBy,
      remarks,
      discountApplied: student?.scholarshipPercent
        ? Math.round((Number(amountPaid) * student.scholarshipPercent) / 100)
        : undefined,
    };

    onAddDeposit(newDeposit);
    setIsDepositModalOpen(false);

    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {}

    // Auto show receipt
    onViewReceipt(newDeposit);
  };

  // Find the most recent deposit transaction of the currently selected student
  const lastDepositOfSelectedStudent = React.useMemo(() => {
    if (!selectedStudentId) return null;
    const studentDeposits = deposits.filter((d) => d.studentId === selectedStudentId);
    if (studentDeposits.length === 0) return null;
    return [...studentDeposits].sort((a, b) => {
      const timeA = new Date(a.depositDate).getTime();
      const timeB = new Date(b.depositDate).getTime();
      if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
        return timeB - timeA;
      }
      return (b.receiptNo || b.id).localeCompare(a.receiptNo || a.id);
    })[0];
  }, [deposits, selectedStudentId]);

  const handlePrintLastReceipt = () => {
    if (lastDepositOfSelectedStudent) {
      onViewReceipt(lastDepositOfSelectedStudent);
    }
  };

  // Fee Structure Handlers
  const handleExportFeeScheduleCSV = () => {
    const headers = [
      'Class Level',
      'Stream Track',
      'Admission Fee (INR)',
      'Tuition Fee Per Subject (INR)',
      'Monthly Tuition Full Combo (INR)',
      'Exam Fee Per Term (INR)',
      'Study Material and Lab Fees (INR)',
      'Annual Development Fees and others (INR)',
      'Total Estimated Annual Fee (INR)',
    ];

    const rows = (Object.values(feeStructures) as FeeStructure[]).map((st: FeeStructure) => {
      const estAnnual =
        st.admissionFee +
        (st.perSubjectMonthlyFee || 350) * 4 * 12 +
        st.examFeePerTerm * 2 +
        st.materialsFee +
        (st.annualDevelopmentFee ?? 50);
      return [
        `"Class ${st.classLevel}"`,
        `"${st.stream}"`,
        st.admissionFee,
        st.perSubjectMonthlyFee || 0,
        st.monthlyTuitionFee,
        st.examFeePerTerm,
        st.materialsFee,
        st.annualDevelopmentFee ?? 50,
        estAnnual,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `biley_academy_active_fee_structure_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFeeStructures = () => {
    if (window.confirm('Reset all class fee structures back to academy standard defaults?')) {
      setFeeStructures(DEFAULT_FEE_STRUCTURE);
      localStorage.removeItem('biley_academy_custom_fee_structure_v1');
      localStorage.removeItem('biley_academy_custom_fee_structure_v2');
      setStructureSuccessNotice('Fee structures successfully reset to Academy standard active rates.');
      setTimeout(() => setStructureSuccessNotice(null), 4000);
    }
  };

  const handleStartEditStructure = (key: string, st: FeeStructure) => {
    setEditingKey(key);
    setEditAdmissionFee(st.admissionFee);
    setEditMonthlyFee(st.monthlyTuitionFee);
    setEditPerSubjectFee(st.perSubjectMonthlyFee || 350);
    setEditExamFee(st.examFeePerTerm);
    setEditMaterialsFee(st.materialsFee);
    setEditAnnualDevFee(st.annualDevelopmentFee ?? 50);
  };

  const handleOpenBatchModal = (bracket: 'PRIMARY' | 'MIDDLE' | 'SECONDARY' | 'SENIOR' | 'ALL') => {
    setBatchTargetBracket(bracket);
    if (bracket === 'PRIMARY') {
      setBatchAdmissionFee(100);
      setBatchTuitionFee(300);
      setBatchExamFee(50);
      setBatchMaterialsFee(50);
      setBatchAnnualDevFee(50);
    } else if (bracket === 'MIDDLE') {
      setBatchAdmissionFee(100);
      setBatchTuitionFee(350);
      setBatchExamFee(50);
      setBatchMaterialsFee(50);
      setBatchAnnualDevFee(50);
    } else if (bracket === 'SECONDARY') {
      setBatchAdmissionFee(100);
      setBatchTuitionFee(400);
      setBatchExamFee(100);
      setBatchMaterialsFee(50);
      setBatchAnnualDevFee(50);
    } else if (bracket === 'SENIOR') {
      setBatchAdmissionFee(100);
      setBatchTuitionFee(450);
      setBatchExamFee(100);
      setBatchMaterialsFee(50);
      setBatchAnnualDevFee(50);
    } else {
      setBatchAdmissionFee(100);
      setBatchTuitionFee(350);
      setBatchExamFee(75);
      setBatchMaterialsFee(50);
      setBatchAnnualDevFee(50);
    }
    setIsBatchModalOpen(true);
  };

  const handleSaveBatchStructureEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedMap = { ...feeStructures };

    Object.keys(updatedMap).forEach((key) => {
      const st = updatedMap[key];
      const classNum = parseInt(st.classLevel, 10);
      let matches = false;

      if (batchTargetBracket === 'PRIMARY' && classNum >= 1 && classNum <= 4) matches = true;
      if (batchTargetBracket === 'MIDDLE' && classNum >= 5 && classNum <= 8) matches = true;
      if (batchTargetBracket === 'SECONDARY' && classNum >= 9 && classNum <= 10) matches = true;
      if (batchTargetBracket === 'SENIOR' && classNum >= 11 && classNum <= 12) matches = true;
      if (batchTargetBracket === 'ALL') matches = true;

      if (matches) {
        updatedMap[key] = {
          ...st,
          admissionFee: Number(batchAdmissionFee),
          monthlyTuitionFee: Number(batchTuitionFee),
          perSubjectMonthlyFee: Number(batchTuitionFee),
          examFeePerTerm: Number(batchExamFee),
          materialsFee: Number(batchMaterialsFee),
          annualDevelopmentFee: Number(batchAnnualDevFee),
        };
      }
    });

    setFeeStructures(updatedMap);
    try {
      localStorage.setItem('biley_academy_custom_fee_structure_v2', JSON.stringify(updatedMap));
    } catch (err) {
      console.error('Failed to save custom fee structures:', err);
    }

    setIsBatchModalOpen(false);
    setStructureSuccessNotice(
      `Active fee rates for ${
        batchTargetBracket === 'PRIMARY'
          ? 'Classes 1 to 4'
          : batchTargetBracket === 'MIDDLE'
          ? 'Classes 5 to 8'
          : batchTargetBracket === 'SECONDARY'
          ? 'Classes 9 to 10'
          : batchTargetBracket === 'SENIOR'
          ? 'Classes 11 to 12'
          : 'All Classes (1 to 12)'
      } updated successfully!`
    );
    setTimeout(() => setStructureSuccessNotice(null), 4000);
  };

  const handleSaveStructureEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;
    const current = feeStructures[editingKey];
    if (!current) return;

    const updated: FeeStructure = {
      ...current,
      admissionFee: Number(editAdmissionFee),
      monthlyTuitionFee: Number(editMonthlyFee),
      perSubjectMonthlyFee: Number(editPerSubjectFee),
      examFeePerTerm: Number(editExamFee),
      materialsFee: Number(editMaterialsFee),
      annualDevelopmentFee: Number(editAnnualDevFee),
    };

    const updatedMap = {
      ...feeStructures,
      [editingKey]: updated,
    };

    setFeeStructures(updatedMap);
    try {
      localStorage.setItem('biley_academy_custom_fee_structure_v2', JSON.stringify(updatedMap));
    } catch (err) {
      console.error('Failed to save custom fee structures:', err);
    }
    setEditingKey(null);
    setStructureSuccessNotice(`Rates for Class ${current.classLevel} (${current.stream}) updated successfully!`);
    setTimeout(() => setStructureSuccessNotice(null), 4000);
  };

  // Calculations for Dues & Collections
  const allFeeSummaries = students.map((s) => ({
    student: s,
    summary: computeStudentFeeSummary(s, deposits),
  }));

  const totalCollectedGross = deposits.reduce((sum, d) => sum + d.amountPaid, 0);
  const totalOutstandingDues = allFeeSummaries.reduce((sum, item) => sum + item.summary.dueAmount, 0);
  const defaultersList = allFeeSummaries.filter((item) => item.summary.dueAmount > 0);

  // Filtered deposits
  const filteredDeposits = deposits.filter((dep) => {
    const student = students.find((s) => s.id === dep.studentId);
    const matchesSearch =
      (student && student.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      dep.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.feeHead.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dep.transactionRef && dep.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass =
      selectedClassFilter === 'all' || (student && student.classLevel === selectedClassFilter);

    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      
      {/* Section Authorization Unit Status Banner */}
      <SectionAuthHeader
        currentAdmin={currentAdmin || null}
        sectionTab="fees"
        onOpenAdminLogin={onOpenAdminLogin || (() => {})}
        onOpenPermissionsMatrix={onOpenPermissionsMatrix}
      />

      {/* Institutional Policy Restriction Banner (if Fee Deposit locked) */}
      <RestrictionBanner
        type="fee_deposit"
        authConfig={authConfig}
        currentAdmin={currentAdmin}
        onOpenSettings={handleOpenAuthSettings}
      />

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            Student Fees Deposit & Receipt Treasury
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Collect student fees, manage class 5-12 tuition fee structures, track outstanding arrears & generate official receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('deposits')}
              id="fee-deposits-tab-btn"
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'deposits'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Collection Ledger ({deposits.length})
            </button>
            <button
              onClick={() => setActiveTab('monthly-tracker')}
              id="fee-monthly-tracker-tab-btn"
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'monthly-tracker'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Monthly Tuition Tracker</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeTab === 'monthly-tracker' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                12 Mo
              </span>
            </button>
            <button
              onClick={() => setActiveTab('dues')}
              id="fee-dues-tab-btn"
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'dues'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Dues ({defaultersList.length})
            </button>
            <button
              onClick={() => setActiveTab('structure')}
              id="fee-structure-tab-btn"
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'structure'
                  ? 'bg-slate-900 text-amber-300 shadow-xs border border-slate-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Active Fee Structure</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-extrabold">
                12 Classes
              </span>
            </button>

            {handleOpenAuthSettings && (
              <button
                onClick={handleOpenAuthSettings}
                id="fee-signatory-settings-btn"
                title="Edit Authorized Accounts Signatory Name, Designation, and Receipt Seal"
                className="px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 text-emerald-800 hover:bg-emerald-100 bg-emerald-50 border border-emerald-200"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Receipt Signatory</span>
              </button>
            )}
          </div>

          {isFeeDepositLocked ? (
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-bold whitespace-nowrap">
              <Lock className="w-4 h-4 text-rose-600" />
              <span>Deposits Restricted by Policy</span>
            </div>
          ) : canCollectFees ? (
            <button
              onClick={() => handleOpenDepositModal()}
              id="open-deposit-modal-btn"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Record Fee Deposit
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold whitespace-nowrap">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Treasury Locked</span>
            </div>
          )}
        </div>
      </div>

      {/* Academic Session Revenue Goal & Collection Velocity Progress Tracker */}
      <SessionRevenueGoalTracker
        students={students}
        deposits={deposits}
        onOpenDepositModal={() => handleOpenDepositModal()}
      />

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gross Total Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">
            {formatCurrency(totalCollectedGross)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all active batches (Class 5 - 12)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Outstanding Dues</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">
            {formatCurrency(totalOutstandingDues)}
          </div>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">
            {defaultersList.length} students with unpaid balance
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Receipts Issued</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {deposits.length} Official Invoices
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Instant printable / PDF receipts available</p>
        </div>
      </div>

      {activeTab === 'deposits' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student, receipt number or txn ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
              >
                <option value="all">All Classes</option>
                {CLASS_LEVELS.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredDeposits.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No deposit records found. Click "Record Fee Deposit" to add a new transaction.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Receipt No & Date</th>
                    <th className="py-3 px-4">Student & Class</th>
                    <th className="py-3 px-4">Fee Head</th>
                    <th className="py-3 px-4">Mode / Reference</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDeposits.map((dep) => {
                    const student = students.find((s) => s.id === dep.studentId);
                    return (
                      <tr key={dep.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-900 block">{dep.receiptNo}</span>
                          <span className="text-[10px] text-slate-400">{dep.depositDate}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">
                            {student?.name || 'Unknown Student'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Class {student?.classLevel} ({student?.stream}) • {student?.rollNo}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {dep.feeHead}
                            </span>
                            {dep.monthsCovered && dep.monthsCovered.length > 0 && (
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-1.5 py-0.2 rounded text-[10px] font-bold">
                                📅 {dep.monthsCovered.length === 1 ? dep.monthsCovered[0] : `${dep.monthsCovered.length} Mo: ${dep.monthsCovered.map(m => m.split(' ')[0]).join(', ')}`}
                              </span>
                            )}
                          </div>
                          {dep.remarks && (
                            <span className="block text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">
                              {dep.remarks}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-700">{dep.paymentMode}</span>
                          {dep.transactionRef && (
                            <span className="block font-mono text-[10px] text-slate-500">
                              {dep.transactionRef}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-black text-sm text-emerald-700">
                            {formatCurrency(dep.amountPaid)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onViewReceipt(dep)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              <Printer className="w-3 h-3 text-amber-400" />
                              View / Print
                            </button>
                            {canCollectFees && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete receipt ${dep.receiptNo}?`)) {
                                    onDeleteDeposit(dep.id);
                                  }
                                }}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                title="Delete Transaction"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'dues' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Outstanding Fees &amp; Defaulters Tracker</h3>
              <p className="text-xs text-slate-500">Students with pending annual tuition, admission or exam dues</p>
            </div>
            {defaultersList.length > 0 && (
              <button
                onClick={() => {
                  const escapeCsv = (val: string | number | undefined | null) => {
                    if (val === undefined || val === null) return '""';
                    const s = String(val).replace(/"/g, '""');
                    return `"${s}"`;
                  };
                  const headers = [
                    'Student ID',
                    'Roll No',
                    'Student Name',
                    'Class Level',
                    'Stream',
                    'Guardian Name',
                    'Contact Number',
                    'Email',
                    'Net Annual Fee (INR)',
                    'Total Paid (INR)',
                    'Outstanding Due (INR)',
                    'Fee Status',
                    'Scholarship Percent',
                  ];
                  const rows = defaultersList.map(({ student, summary }) => [
                    escapeCsv(student.id),
                    escapeCsv(student.rollNo),
                    escapeCsv(student.name),
                    escapeCsv(`Class ${student.classLevel}`),
                    escapeCsv(student.stream),
                    escapeCsv(student.guardianName),
                    escapeCsv(student.contactNumber),
                    escapeCsv(student.email),
                    summary.netPayable,
                    summary.totalPaid,
                    summary.dueAmount,
                    escapeCsv(summary.feeStatus),
                    student.scholarshipPercent || 0,
                  ].join(','));
                  const csvContent = [headers.join(','), ...rows].join('\r\n');
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.setAttribute('href', url);
                  link.setAttribute('download', `biley_academy_fee_dues_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Dues CSV ({defaultersList.length})</span>
              </button>
            )}
          </div>

          {defaultersList.length === 0 ? (
            <div className="p-12 text-center text-emerald-600 font-bold text-sm bg-emerald-50/50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              All student fee accounts are 100% up-to-date! No pending dues.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Student Name & ID</th>
                    <th className="py-3 px-4">Class & Stream</th>
                    <th className="py-3 px-4">Guardian Contact</th>
                    <th className="py-3 px-4 text-center">Net Annual Fee</th>
                    <th className="py-3 px-4 text-center">Total Paid</th>
                    <th className="py-3 px-4 text-center">Outstanding Due</th>
                    <th className="py-3 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {defaultersList.map(({ student, summary }) => (
                    <tr key={student.id} className="hover:bg-amber-50/40">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 text-sm block">{student.name}</span>
                        <span className="text-[11px] font-mono text-slate-400">{student.id}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">Class {student.classLevel}</span>
                        <span className="block text-[11px] text-slate-500">{student.stream}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">{student.guardianName}</p>
                        <p className="font-mono text-[11px] text-slate-500">{student.contactNumber}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {formatCurrency(summary.netPayable)}
                        {student.scholarshipPercent > 0 && (
                          <span className="block text-[9px] text-emerald-700 font-bold">
                            ({student.scholarshipPercent}% Scholarship applied)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                        {formatCurrency(summary.totalPaid)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-sm text-amber-700">
                        {formatCurrency(summary.dueAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              alert(`Simulating SMS / WhatsApp payment reminder sent to ${student.guardianName} (${student.contactNumber}) for pending due of ${formatCurrency(summary.dueAmount)}.`);
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                            title="Send Payment Reminder Alert"
                          >
                            <Send className="w-3 h-3 text-slate-500" />
                            Remind
                          </button>
                          {canCollectFees && (
                            <button
                              onClick={() => handleOpenDepositModal(student.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              Deposit Now
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'monthly-tracker' && (
        <MonthlyTuitionTracker
          students={students}
          deposits={deposits}
          subjects={subjects}
          currentAdmin={currentAdmin}
          onOpenFeeDepositModal={(studentId, month) => {
            handleOpenDepositModal(studentId, undefined, 'Tuition Fee', month ? [month] : undefined);
          }}
          onViewReceipt={onViewReceipt}
        />
      )}

      {activeTab === 'structure' && (
        <div className="space-y-6">
          
          {/* Active Fee Policy Header Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden border border-slate-800">
            <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 bg-amber-400 text-slate-950 text-[11px] font-extrabold rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Active Fee Policy (2025–2026)
                  </span>
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-[11px] font-semibold rounded-full border border-slate-700">
                    Classes 1 to 12 Covered
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 text-[11px] font-semibold rounded-full border border-emerald-800/60">
                    Standard INR (₹)
                  </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Biley Academy Official Fee Structure & Rate Card
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Transparent, structured fee schedule covering Admission, Monthly Tuition, Examination cycles, and Lab/Study Material packages for all classes and senior secondary academic streams.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {canManageStructures && (
                  <button
                    onClick={() => handleOpenBatchModal('PRIMARY')}
                    id="batch-update-bracket-btn"
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Update Class Fee Brackets</span>
                  </button>
                )}
                <button
                  onClick={handleExportFeeScheduleCSV}
                  id="export-fee-structure-csv-btn"
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export Schedule CSV</span>
                </button>
                <button
                  onClick={() => window.print()}
                  id="print-fee-structure-btn"
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Print Schedule</span>
                </button>
                {canManageStructures && (
                  <button
                    onClick={handleResetFeeStructures}
                    id="reset-fee-structure-btn"
                    title="Reset to Academy Standard Defaults"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification alert */}
            {structureSuccessNotice && (
              <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{structureSuccessNotice}</span>
              </div>
            )}
          </div>

          {/* Interactive Live Fee Calculator & Admission Estimator */}
          <div className="bg-gradient-to-br from-amber-50/70 via-white to-slate-50 rounded-2xl border border-amber-200/80 shadow-xs p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Interactive Live Fee & Admission Estimator
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Instantly project monthly tuition, annual package, and scholarship concessions for any prospective student.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full w-fit">
                Live Dynamic Calculator
              </span>
            </div>

            {/* Calculator Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Class Level</label>
                <select
                  value={calcClass}
                  onChange={(e) => {
                    const newClass = e.target.value as ClassLevel;
                    setCalcClass(newClass);
                    if (['11', '12'].includes(newClass)) {
                      setCalcStream('Science');
                    } else {
                      setCalcStream('General');
                    }
                  }}
                  id="calc-class-select"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {CLASS_LEVELS.map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Academic Stream</label>
                <select
                  value={calcStream}
                  onChange={(e) => setCalcStream(e.target.value)}
                  disabled={!['11', '12'].includes(calcClass)}
                  id="calc-stream-select"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {['11', '12'].includes(calcClass) ? (
                    <>
                      <option value="Science">Science (PCB / PCM)</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Arts">Arts / Humanities</option>
                      <option value="General">General Track</option>
                    </>
                  ) : (
                    <option value="General">General Foundation</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Enrollment Package</label>
                <div className="flex bg-slate-200 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setCalcMode('full')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      calcMode === 'full'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Full Combo
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcMode('perSubject')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      calcMode === 'perSubject'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Per-Subject ({calcSubjectCount})
                  </button>
                </div>
                {calcMode === 'perSubject' && (
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">Subjects:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCalcSubjectCount(num)}
                          className={`w-6 h-6 rounded-md text-[10px] font-bold cursor-pointer ${
                            calcSubjectCount === num
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Merit Scholarship</label>
                <select
                  value={calcScholarship}
                  onChange={(e) => setCalcScholarship(Number(e.target.value))}
                  id="calc-scholarship-select"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value={0}>0% - Standard Rate</option>
                  <option value={10}>10% - Early Bird / Sibling</option>
                  <option value={25}>25% - Academic Merit</option>
                  <option value={50}>50% - High Distinction</option>
                  <option value={100}>100% - Full Academy Scholarship</option>
                </select>
              </div>
            </div>

            {/* Calculated Breakdown Display */}
            {(() => {
              const structKey = `${calcClass}-${calcStream}`;
              const st = feeStructures[structKey] || feeStructures[`${calcClass}-General`] || Object.values(feeStructures)[0];
              const perSubRate = st.perSubjectMonthlyFee || 350;
              const monthlyRate =
                calcMode === 'full'
                  ? st.monthlyTuitionFee
                  : perSubRate * calcSubjectCount;
              const annualTuition = monthlyRate * 12;
              const admissionFee = st.admissionFee;
              const examFees = st.examFeePerTerm * 2;
              const materialsFee = st.materialsFee;
              const annualDevFee = st.annualDevelopmentFee ?? 50;
              const grossAnnual = admissionFee + annualTuition + examFees + materialsFee + annualDevFee;
              const scholarshipSavings = Math.round((grossAnnual * calcScholarship) / 100);
              const netAnnual = grossAnnual - scholarshipSavings;

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Tuition</span>
                    <p className="text-base font-extrabold text-emerald-700 mt-0.5">
                      {formatCurrency(monthlyRate)}
                      <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                    </p>
                    <span className="text-[9px] text-slate-400">{calcMode === 'perSubject' ? `${calcSubjectCount} sub × ₹${perSubRate}` : '12 installments'}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">One-time Admission</span>
                    <p className="text-base font-extrabold text-slate-800 mt-0.5">
                      {formatCurrency(admissionFee)}
                    </p>
                    <span className="text-[9px] text-slate-400">Enrollment & Reg.</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Exam Cycles</span>
                    <p className="text-base font-extrabold text-slate-800 mt-0.5">
                      {formatCurrency(examFees)}
                    </p>
                    <span className="text-[9px] text-slate-400">2 Terms (Mid & Final)</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Annual Dev. & Others</span>
                    <p className="text-base font-extrabold text-amber-700 mt-0.5">
                      {formatCurrency(annualDevFee)}
                    </p>
                    <span className="text-[9px] text-slate-400">Campus & Dev Fund</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Study Material & Lab</span>
                    <p className="text-base font-extrabold text-slate-800 mt-0.5">
                      {formatCurrency(materialsFee)}
                    </p>
                    <span className="text-[9px] text-slate-400">Kit, Notes & Lab</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Scholarship</span>
                    <p className="text-base font-extrabold text-rose-600 mt-0.5">
                      {scholarshipSavings > 0 ? `-${formatCurrency(scholarshipSavings)}` : '₹0'}
                    </p>
                    <span className="text-[9px] text-slate-400">{calcScholarship}% Concession</span>
                  </div>

                  <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 block">Net Est. Annual</span>
                      <p className="text-base font-black text-white mt-0.5">
                        {formatCurrency(netAnnual)}
                      </p>
                    </div>
                    {auth.canWrite && (
                      <button
                        onClick={() => handleOpenDepositModal(undefined, monthlyRate, 'Tuition Fee')}
                        className="mt-1 px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Collect Rate
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Fee Schedule Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
            
            {/* Table Filters Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Standard Class Fee Matrix (Grades 1 to 12)
                </h4>
                <p className="text-xs text-slate-500">
                  Click 'Edit Rates' to modify amounts or 'Estimate / Collect' to deposit fees for that class.
                </p>
              </div>

              {/* Category Segment Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'ALL', label: 'All Classes' },
                  { id: 'PRIMARY', label: 'Primary (1-4)' },
                  { id: 'MIDDLE', label: 'Middle (5-8)' },
                  { id: 'SECONDARY', label: 'Secondary (9-10)' },
                  { id: 'SENIOR', label: 'Senior (11-12)' },
                  { id: 'SCIENCE', label: 'Science' },
                  { id: 'COMMERCE', label: 'Commerce' },
                  { id: 'ARTS', label: 'Arts' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStructureCategoryFilter(tab.id as any)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                      structureCategoryFilter === tab.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Class Level</th>
                    <th className="py-3 px-3">Stream Track</th>
                    <th className="py-3 px-3 text-right">Admission Fee</th>
                    <th className="py-3 px-3 text-right">Tuition / Subj</th>
                    <th className="py-3 px-3 text-right">Exam Fee / Term</th>
                    <th className="py-3 px-3 text-right">Study Material & Lab</th>
                    <th className="py-3 px-3 text-right">Annual Dev. & Others</th>
                    <th className="py-3 px-3 text-right">Est. Annual (4 Subj)</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(Object.entries(feeStructures) as [string, FeeStructure][])
                    .filter(([key, st]) => {
                      const classNum = parseInt(st.classLevel, 10);
                      if (structureCategoryFilter === 'PRIMARY') return classNum >= 1 && classNum <= 4;
                      if (structureCategoryFilter === 'MIDDLE') return classNum >= 5 && classNum <= 8;
                      if (structureCategoryFilter === 'SECONDARY') return classNum >= 9 && classNum <= 10;
                      if (structureCategoryFilter === 'SENIOR') return classNum >= 11 && classNum <= 12;
                      if (structureCategoryFilter === 'SCIENCE') return st.stream === 'Science';
                      if (structureCategoryFilter === 'COMMERCE') return st.stream === 'Commerce';
                      if (structureCategoryFilter === 'ARTS') return st.stream === 'Arts';
                      return true;
                    })
                    .map(([key, st]) => {
                      const perSub = st.perSubjectMonthlyFee || 350;
                      const annualDev = st.annualDevelopmentFee ?? 50;
                      const estAnnual =
                        st.admissionFee +
                        perSub * 4 * 12 +
                        st.examFeePerTerm * 2 +
                        st.materialsFee +
                        annualDev;

                      return (
                        <tr key={key} className="hover:bg-amber-50/40 transition-colors">
                          <td className="py-3 px-3 font-black text-slate-900">
                            Class {st.classLevel}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] ${
                                st.stream === 'Science'
                                  ? 'bg-blue-100 text-blue-800'
                                  : st.stream === 'Commerce'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : st.stream === 'Arts'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {st.stream}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-700 font-medium">
                            {formatCurrency(st.admissionFee)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-700">
                            {formatCurrency(perSub)}/sub
                          </td>
                          <td className="py-3 px-3 text-right text-slate-700">
                            {formatCurrency(st.examFeePerTerm)}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-700">
                            {formatCurrency(st.materialsFee)}
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-amber-700">
                            {formatCurrency(annualDev)}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-slate-950">
                            {formatCurrency(estAnnual)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setCalcClass(st.classLevel);
                                  setCalcStream(st.stream);
                                  window.scrollTo({ top: 300, behavior: 'smooth' });
                                }}
                                title="Load into live fee calculator"
                                className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md font-bold text-[10px] transition-colors cursor-pointer"
                              >
                                Estimate
                              </button>
                              {canManageStructures && (
                                <button
                                  onClick={() => handleStartEditStructure(key, st)}
                                  title="Edit fee amounts for this class"
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[10px] transition-colors cursor-pointer flex items-center gap-0.5"
                                >
                                  <Edit3 className="w-2.5 h-2.5" />
                                  <span>Edit</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* Record Fee Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">Record Student Fee Deposit</h3>
                  <p className="text-[11px] text-slate-300">
                    Auto-calculates by enrolled subjects, selected heads & 2026 academic cycle
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="header-print-last-receipt-btn"
                  onClick={handlePrintLastReceipt}
                  disabled={!lastDepositOfSelectedStudent}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    lastDepositOfSelectedStudent
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer shadow-xs'
                      : 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                  }`}
                  title={
                    lastDepositOfSelectedStudent
                      ? `Print Last Receipt (${lastDepositOfSelectedStudent.receiptNo || lastDepositOfSelectedStudent.id} • ${formatCurrency(lastDepositOfSelectedStudent.amountPaid)})`
                      : 'No previous deposit receipt for this student'
                  }
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Print Last Receipt</span>
                  <span className="sm:hidden">Last Receipt</span>
                  {lastDepositOfSelectedStudent && (
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono hidden md:inline">
                      {lastDepositOfSelectedStudent.receiptNo || lastDepositOfSelectedStudent.id}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setIsDepositModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleDepositSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs font-sans">
              
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 custom-scrollbar">
                
                {/* Row 1: Student Selection + Live Student Fee Profile */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                  <div className="md:col-span-7 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-700 font-bold text-xs">Select Enrolled Student *</label>
                      {lastDepositOfSelectedStudent && (
                        <button
                          type="button"
                          onClick={handlePrintLastReceipt}
                          className="text-[10px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Last: {lastDepositOfSelectedStudent.receiptNo || lastDepositOfSelectedStudent.id} ({formatCurrency(lastDepositOfSelectedStudent.amountPaid)})</span>
                        </button>
                      )}
                    </div>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => handleStudentChangeInDeposit(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-xs font-medium"
                    >
                      {students.map((st) => {
                        const sum = computeStudentFeeSummary(st, deposits);
                        return (
                          <option key={st.id} value={st.id}>
                            {st.name} (Class {st.classLevel} - {st.stream}) • Enrolled: {st.enrolledSubjectIds?.length || 4} Subj • Due: {formatCurrency(sum.dueAmount)}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="md:col-span-5">
                    {(() => {
                      const targetStudent = students.find((s) => s.id === selectedStudentId);
                      if (!targetStudent) return null;
                      const summary = computeStudentFeeSummary(targetStudent, deposits);
                      const structKey = `${targetStudent.classLevel}-${targetStudent.stream}`;
                      const st = feeStructures[structKey] || feeStructures[`${targetStudent.classLevel}-General`] || DEFAULT_FEE_STRUCTURE[structKey] || DEFAULT_FEE_STRUCTURE['1-General'];

                      return (
                        <div className="h-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center gap-1 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Class & Stream:</span>
                            <strong className="text-slate-800 font-semibold">Class {targetStudent.classLevel} ({targetStudent.stream})</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Tuition Rate:</span>
                            <strong className="text-emerald-700 font-bold">{formatCurrency(st.perSubjectMonthlyFee || 350)}/sub/mo</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Pending Due:</span>
                            <strong className="text-amber-700 font-bold">{formatCurrency(summary.dueAmount)}</strong>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Fee Particulars / Heads Multi-Select Section */}
                <div className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className="block text-slate-700 font-bold text-xs">
                      Select Fee Particulars / Heads *
                    </label>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-semibold mr-0.5">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyHeadsPreset('tuition')}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                      >
                        Tuition Only
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyHeadsPreset('admission_tuition')}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                      >
                        Admission + Tuition
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyHeadsPreset('all')}
                        className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[10px] font-bold cursor-pointer"
                      >
                        All Heads (Full Session)
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const targetStudent = students.find((s) => s.id === selectedStudentId);
                    const structKey = targetStudent ? `${targetStudent.classLevel}-${targetStudent.stream}` : '1-General';
                    const st = feeStructures[structKey] || feeStructures[`${targetStudent?.classLevel || '1'}-General`] || DEFAULT_FEE_STRUCTURE[structKey] || DEFAULT_FEE_STRUCTURE['1-General'];

                    const headsList: { id: FeeHeadType; label: string; rateDisplay: string; subDesc: string }[] = [
                      {
                        id: 'Tuition Fee',
                        label: 'Tuition Fee',
                        rateDisplay: `₹${st.perSubjectMonthlyFee || 350}/sub/mo`,
                        subDesc: `${tuitionSubjectCount} subj × ${selectedMonths.length} mo`,
                      },
                      {
                        id: 'Admission Fee',
                        label: 'Admission Fee',
                        rateDisplay: `₹${st.admissionFee}`,
                        subDesc: 'One-time registration',
                      },
                      {
                        id: 'Exam Fee',
                        label: 'Exam Fee',
                        rateDisplay: `₹${st.examFeePerTerm}/term`,
                        subDesc: `${examTermCount} Term(s)`,
                      },
                      {
                        id: 'Study Material and Lab Fees',
                        label: 'Study Material & Lab',
                        rateDisplay: `₹${st.materialsFee}`,
                        subDesc: 'Annual Worksheets & Kit',
                      },
                      {
                        id: 'Annual Development Fees and others',
                        label: 'Annual Development',
                        rateDisplay: `₹${st.annualDevelopmentFee ?? 50}/yr`,
                        subDesc: 'Campus & Amenities',
                      },
                    ];

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {headsList.map((h) => {
                          const isSelected = selectedFeeHeads.includes(h.id);
                          return (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => handleToggleFeeHeadInDeposit(h.id)}
                              className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-amber-400/40'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1 w-full">
                                <span className="font-bold text-[11px] leading-tight truncate">{h.label}</span>
                                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? 'bg-amber-400 border-amber-400 text-slate-950 font-black'
                                    : 'bg-white border-slate-300'
                                }`}>
                                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                              </div>
                              <div className="mt-1.5 pt-1 border-t border-slate-100/10">
                                <span className={`text-[10px] font-bold block ${isSelected ? 'text-amber-300' : 'text-emerald-700'}`}>
                                  {h.rateDisplay}
                                </span>
                                <span className={`text-[9px] block truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                  {h.subDesc}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Dynamic Sub-Controls when Tuition Fee is selected */}
                {selectedFeeHeads.includes('Tuition Fee') && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                        Tuition Fee Academic Months (2026: Jan – Dec)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-amber-200/90 text-amber-950 font-extrabold px-2 py-0.5 rounded-full">
                          {selectedMonths.length} Mo Selected
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleApplyMonthPreset('next_1')}
                            className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-amber-100 text-[10px] font-bold text-slate-700 rounded-md cursor-pointer"
                          >
                            Next Unpaid
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyMonthPreset('quarter_3')}
                            className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-amber-100 text-[10px] font-bold text-slate-700 rounded-md cursor-pointer"
                          >
                            3 Mo (Qtr)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyMonthPreset('semester_6')}
                            className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-amber-100 text-[10px] font-bold text-slate-700 rounded-md cursor-pointer"
                          >
                            6 Mo (Sem)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyMonthPreset('all_unpaid')}
                            className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-amber-100 text-[10px] font-bold text-slate-700 rounded-md cursor-pointer"
                          >
                            All Unpaid
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Enrolled Subject Multiplier */}
                    <div className="flex items-center gap-2">
                      <label className="text-slate-700 font-bold text-[11px] shrink-0">
                        Enrolled Subjects Count:
                      </label>
                      <div className="flex gap-1 max-w-xs">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleTuitionParamsChange(num, Math.max(1, selectedMonths.length))}
                            className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              tuitionSubjectCount === num
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 12 Academic Months Grid (Compact 12-col or 6-col) */}
                    <div>
                      {(() => {
                        const studentStatus = getStudentTuitionMonthsStatus(selectedStudentId, deposits);
                        return (
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
                            {ACADEMIC_SESSION_MONTHS.map((m) => {
                              const st = studentStatus.find((s) => s.month === m);
                              const isPaidAlready = st?.isPaid;
                              const isSelected = selectedMonths.includes(m);

                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => handleToggleTuitionMonth(m)}
                                  className={`p-1.5 rounded-xl text-center transition-all border cursor-pointer relative ${
                                    isSelected
                                      ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-xs ring-2 ring-amber-300'
                                      : isPaidAlready
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold block leading-none mx-auto">
                                      {m.split(' ')[0].slice(0, 3)}
                                    </span>
                                  </div>
                                  <span className={`text-[8px] block mt-0.5 ${
                                    isSelected
                                      ? 'text-slate-900 font-bold'
                                      : isPaidAlready
                                      ? 'text-emerald-700 font-extrabold'
                                      : 'text-slate-400'
                                  }`}>
                                    {isPaidAlready ? 'Paid' : isSelected ? '✓' : 'Due'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {(() => {
                      const targetStudent = students.find((s) => s.id === selectedStudentId);
                      const structKey = targetStudent ? `${targetStudent.classLevel}-${targetStudent.stream}` : '1-General';
                      const st = feeStructures[structKey] || feeStructures[`${targetStudent?.classLevel || '1'}-General`] || DEFAULT_FEE_STRUCTURE[structKey] || DEFAULT_FEE_STRUCTURE['1-General'];
                      const perSub = st.perSubjectMonthlyFee || 350;
                      const calculated = perSub * tuitionSubjectCount * Math.max(1, selectedMonths.length);

                      return (
                        <div className="p-2 bg-white rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                          <span className="text-slate-600">
                            Calculation: <strong>{tuitionSubjectCount} subj</strong> × <strong>₹{perSub}/sub/mo</strong> × <strong>{selectedMonths.length} month(s)</strong>
                            {selectedMonths.length > 0 && (
                              <span className="text-amber-800 font-medium ml-1">
                                ({selectedMonths.map(m => m.split(' ')[0].slice(0, 3)).join(', ')})
                              </span>
                            )}
                          </span>
                          <strong className="text-emerald-700 font-black text-xs shrink-0">= {formatCurrency(calculated)}</strong>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Dynamic Sub-Controls when Exam Fee is selected */}
                {selectedFeeHeads.includes('Exam Fee') && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-blue-600" />
                        Exam Fee Assessment Cycles
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {[
                        { terms: 1, label: '1 Term (Mid-Term or Final Assessment)' },
                        { terms: 2, label: '2 Terms (Full Year - Both Terms)' },
                      ].map((item) => (
                        <button
                          key={item.terms}
                          type="button"
                          onClick={() => handleExamTermsChange(item.terms)}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-left ${
                            examTermCount === item.terms
                              ? 'bg-blue-900 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Itemized Calculation Summary of Selected Fee Heads */}
                {(() => {
                  const { total: calculatedSum, breakdown } = calculateTotalForHeads(
                    selectedFeeHeads,
                    selectedStudentId,
                    tuitionSubjectCount,
                    tuitionMonthsCount,
                    examTermCount
                  );

                  return (
                    <div className="p-2.5 bg-slate-900 text-white rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Selected Heads Breakdown ({selectedFeeHeads.length})
                        </span>
                        <span className="text-xs font-bold text-slate-300">
                          Total: <strong className="text-emerald-400 text-xs sm:text-sm font-black">{formatCurrency(calculatedSum)}</strong>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {breakdown.map((item, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 rounded-lg text-[10px] border border-slate-700">
                            <span className="font-semibold text-slate-200">{item.head}:</span>
                            <strong className="text-amber-300">{formatCurrency(item.amount)}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Amount Deposited, Payment Mode & Ledger Controls in a clean 3-col/2-col grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-700 font-bold text-xs">Amount to Deposit (₹) *</label>
                      {isCustomAmount && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomAmount(false);
                            const { total } = calculateTotalForHeads(
                              selectedFeeHeads,
                              selectedStudentId,
                              tuitionSubjectCount,
                              tuitionMonthsCount,
                              examTermCount
                            );
                            setAmountPaid(total);
                          }}
                          className="text-[9px] text-amber-700 hover:underline font-bold cursor-pointer"
                        >
                          Reset Auto-Sum
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      required
                      value={amountPaid}
                      onChange={(e) => {
                        setAmountPaid(Number(e.target.value));
                        setIsCustomAmount(true);
                      }}
                      className="w-full px-3 py-1.5 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-black text-slate-900 text-sm bg-amber-50/20"
                    />
                    <span className="text-[9px] text-slate-400 mt-0.5 block">
                      {isCustomAmount
                        ? '⚠️ Custom amount override applied'
                        : `✓ Auto-summed across all ${selectedFeeHeads.length} heads`}
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">Payment Mode *</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-xs font-medium"
                    >
                      <option value="UPI / GPay / PhonePe">UPI / GPay / PhonePe</option>
                      <option value="Cash">Cash Counter</option>
                      <option value="Net Banking">Net Banking / IMPS</option>
                      <option value="Debit/Credit Card">Debit/Credit Card (POS)</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">Transaction / Ref ID</label>
                    <input
                      type="text"
                      placeholder="e.g. UPI/260405118942"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">Collected By / Officer</label>
                    <input
                      type="text"
                      value={collectedBy}
                      onChange={(e) => setCollectedBy(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold text-xs mb-1">Deposit Remarks / Ledger Note</label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Tuition fee received with verified receipt."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                    />
                  </div>
                </div>

              </div>

              {/* Fixed Modal Action Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600">
                    Grand Total:
                  </span>
                  <span className="text-base font-black text-emerald-700">
                    {formatCurrency(amountPaid)}
                  </span>
                  {selectedMonths.length > 0 && selectedFeeHeads.includes('Tuition Fee') && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md hidden sm:inline">
                      {selectedMonths.length} Months Covered
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="modal-footer-print-last-receipt-btn"
                    onClick={handlePrintLastReceipt}
                    disabled={!lastDepositOfSelectedStudent}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
                      lastDepositOfSelectedStudent
                        ? 'bg-white hover:bg-amber-50 text-slate-800 border-slate-300 hover:border-amber-400 cursor-pointer shadow-xs active:scale-98'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                    }`}
                    title={
                      lastDepositOfSelectedStudent
                        ? `Print last receipt (${lastDepositOfSelectedStudent.receiptNo || lastDepositOfSelectedStudent.id} • ${formatCurrency(lastDepositOfSelectedStudent.amountPaid)})`
                        : 'No prior deposit records found for this student'
                    }
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-600" />
                    <span>Print Last Receipt</span>
                    {lastDepositOfSelectedStudent && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-mono px-1.5 py-0.5 rounded font-bold hidden sm:inline">
                        {lastDepositOfSelectedStudent.receiptNo || lastDepositOfSelectedStudent.id}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDepositModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-fee-deposit-btn"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Generate Official Fee Receipt</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Edit Class Fee Structure Modal */}
      {editingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base">
                    Edit Fee Rates: Class {feeStructures[editingKey]?.classLevel} ({feeStructures[editingKey]?.stream})
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Adjust standard session charges for this specific academic track
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingKey(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStructureEdit} className="p-6 space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Admission Fee (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={editAdmissionFee}
                    onChange={(e) => setEditAdmissionFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-400">One-time registration fee</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Per-Subject Tuition (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={editPerSubjectFee}
                    onChange={(e) => setEditPerSubjectFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-emerald-700"
                  />
                  <span className="text-[10px] text-slate-400">Rate per subject / month</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Exam Fee / Term (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={editExamFee}
                    onChange={(e) => setEditExamFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400">Per term (2 terms/yr)</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Annual Dev. Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={editAnnualDevFee}
                    onChange={(e) => setEditAnnualDevFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400">Annual infrastructure</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Study Materials (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={editMaterialsFee}
                    onChange={(e) => setEditMaterialsFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400">Annual kit & notes</span>
                </div>
              </div>

              {/* Calculated Annual Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Computed Est. Annual Fee (4 Subjects)</span>
                  <span className="text-xs text-slate-500">Admission + (12 × 4 × Tuition) + (2 × Exam) + Materials + Annual Dev</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">
                    {formatCurrency(
                      editAdmissionFee + (editPerSubjectFee * 4 * 12) + (editExamFee * 2) + editMaterialsFee + editAnnualDevFee
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingKey(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-fee-structure-edit-btn"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Save Class Rates</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Batch Bracket Fee Update Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Batch Update Class Fee Structure</h3>
                  <p className="text-[11px] text-amber-300">
                    Update all classes in selected bracket simultaneously
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatchStructureEdit} className="p-6 space-y-4 text-xs">
              
              {/* Bracket Selector Tabs */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Select Target Class Bracket</label>
                <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  {[
                    { id: 'PRIMARY', label: 'Class 1–4', sub: 'Primary' },
                    { id: 'MIDDLE', label: 'Class 5–8', sub: 'Middle' },
                    { id: 'SECONDARY', label: 'Class 9–10', sub: 'Secondary' },
                    { id: 'SENIOR', label: 'Class 11–12', sub: 'Sr. Sec' },
                    { id: 'ALL', label: 'All Classes', sub: '1 to 12' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleOpenBatchModal(b.id as any)}
                      className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                        batchTargetBracket === b.id
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200 font-semibold'
                      }`}
                    >
                      <div className="text-[11px] leading-tight">{b.label}</div>
                      <div className="text-[9px] opacity-75">{b.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Admission Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={batchAdmissionFee}
                    onChange={(e) => setBatchAdmissionFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-400">One-time registration</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Monthly Tuition / Subject (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={batchTuitionFee}
                    onChange={(e) => setBatchTuitionFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-emerald-700"
                  />
                  <span className="text-[10px] text-slate-400">Monthly per subject</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Exam Fee / Term (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={batchExamFee}
                    onChange={(e) => setBatchExamFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400">Per term (2 terms/yr)</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Annual Dev. Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={batchAnnualDevFee}
                    onChange={(e) => setBatchAnnualDevFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400">Annual amenities</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Study Materials (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={batchMaterialsFee}
                    onChange={(e) => setBatchMaterialsFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400">Annual kit & notes</span>
                </div>
              </div>

              {/* Calculated Annual Preview */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">
                    Calculated Est. Annual Fee (4 Subjects)
                  </span>
                  <span className="text-[11px] text-slate-600">
                    {batchAdmissionFee} + (12 × 4 × {batchTuitionFee}) + (2 × {batchExamFee}) + {batchMaterialsFee} + {batchAnnualDevFee}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-950">
                    {formatCurrency(
                      batchAdmissionFee + (batchTuitionFee * 4 * 12) + (batchExamFee * 2) + batchMaterialsFee + batchAnnualDevFee
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-batch-fee-structure-btn"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Apply to {batchTargetBracket === 'ALL' ? 'All Classes' : `${batchTargetBracket} Classes`}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
