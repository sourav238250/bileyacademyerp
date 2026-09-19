import {
  AttendanceRecord,
  AttendanceStatus,
  ClassLevel,
  ExamResult,
  Faculty,
  FeeDeposit,
  FeeHeadType,
  FeeStructure,
  Student,
  StudentAttendanceSummary,
  StudentFeeSummary,
  Subject,
  SubjectAttendanceStat,
} from '../types';

export const CLASS_LEVELS: ClassLevel[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export const STANDARD_SUBJECT_NAMES = [
  'Mathematics',
  'Science',
  'English',
  'Computer',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Computer Application',
] as const;

export type StandardSubjectName = (typeof STANDARD_SUBJECT_NAMES)[number];

export const STANDARD_SUBJECT_CODES: Record<StandardSubjectName, string> = {
  'Mathematics': 'MTH',
  'Science': 'SCI',
  'English': 'ENG',
  'Computer': 'COMP',
  'Physics': 'PHY',
  'Chemistry': 'CHM',
  'Biology': 'BIO',
  'Computer Science': 'CS',
  'Computer Application': 'CA',
};

export const STREAMS_FOR_CLASS: Record<ClassLevel, string[]> = {
  '1': ['General'],
  '2': ['General'],
  '3': ['General'],
  '4': ['General'],
  '5': ['General'],
  '6': ['General'],
  '7': ['General'],
  '8': ['General'],
  '9': ['General'],
  '10': ['General'],
  '11': ['Science', 'Commerce', 'Arts', 'General'],
  '12': ['Science', 'Commerce', 'Arts', 'General'],
};

export const DEFAULT_FEE_STRUCTURE: Record<string, FeeStructure> = {
  // Class 1 to 4: Admission: 100, Tuition: 300/subject, Exam: 50, Study Material & Lab Fees: 50, Annual Development & others: 50
  '1-General': { classLevel: '1', stream: 'General', admissionFee: 100, monthlyTuitionFee: 300, perSubjectMonthlyFee: 300, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '2-General': { classLevel: '2', stream: 'General', admissionFee: 100, monthlyTuitionFee: 300, perSubjectMonthlyFee: 300, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '3-General': { classLevel: '3', stream: 'General', admissionFee: 100, monthlyTuitionFee: 300, perSubjectMonthlyFee: 300, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '4-General': { classLevel: '4', stream: 'General', admissionFee: 100, monthlyTuitionFee: 300, perSubjectMonthlyFee: 300, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },

  // Class 5 to 8: Admission: 100, Tuition: 350/subject, Exam: 50, Study Material & Lab Fees: 50, Annual Development & others: 50
  '5-General': { classLevel: '5', stream: 'General', admissionFee: 100, monthlyTuitionFee: 350, perSubjectMonthlyFee: 350, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '6-General': { classLevel: '6', stream: 'General', admissionFee: 100, monthlyTuitionFee: 350, perSubjectMonthlyFee: 350, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '7-General': { classLevel: '7', stream: 'General', admissionFee: 100, monthlyTuitionFee: 350, perSubjectMonthlyFee: 350, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '8-General': { classLevel: '8', stream: 'General', admissionFee: 100, monthlyTuitionFee: 350, perSubjectMonthlyFee: 350, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },

  // Class 9 to 10: Admission: 100, Tuition: 400/subject, Exam: 100, Study Material & Lab Fees: 50, Annual Development & others: 50
  '9-General': { classLevel: '9', stream: 'General', admissionFee: 100, monthlyTuitionFee: 400, perSubjectMonthlyFee: 400, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '10-General': { classLevel: '10', stream: 'General', admissionFee: 100, monthlyTuitionFee: 400, perSubjectMonthlyFee: 400, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },

  // Class 11 to 12: Admission: 100, Tuition: 450/subject, Exam: 100, Study Material & Lab Fees: 50, Annual Development & others: 50
  '11-Science': { classLevel: '11', stream: 'Science', admissionFee: 100, monthlyTuitionFee: 450, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '11-Commerce': { classLevel: '11', stream: 'Commerce', admissionFee: 100, monthlyTuitionFee: 450, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '11-Arts': { classLevel: '11', stream: 'Arts', admissionFee: 100, monthlyTuitionFee: 450, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '11-General': { classLevel: '11', stream: 'General', admissionFee: 100, monthlyTuitionFee: 450, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-Science': { classLevel: '12', stream: 'Science', admissionFee: 100, monthlyTuitionFee: 450, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-Commerce': { classLevel: '12', stream: 'Commerce', admissionFee: 100, monthlyTuitionFee: 450, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-Arts': { classLevel: '12', stream: 'Arts', admissionFee: 100, monthlyTuitionFee: 450, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-General': { classLevel: '12', stream: 'General', admissionFee: 100, monthlyTuitionFee: 450, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateGrade(percentage: number): { grade: string; remarks: string; gpa: number } {
  if (percentage >= 91) return { grade: 'A1', remarks: 'Outstanding Academic Performance', gpa: 10.0 };
  if (percentage >= 81) return { grade: 'A2', remarks: 'Excellent Mastery & Understanding', gpa: 9.0 };
  if (percentage >= 71) return { grade: 'B1', remarks: 'Very Good Academic Standard', gpa: 8.0 };
  if (percentage >= 61) return { grade: 'B2', remarks: 'Good Competence, Keep Aiming Higher', gpa: 7.0 };
  if (percentage >= 51) return { grade: 'C1', remarks: 'Satisfactory, Regular Practice Needed', gpa: 6.0 };
  if (percentage >= 41) return { grade: 'C2', remarks: 'Average Performance, Focus on Fundamentals', gpa: 5.0 };
  if (percentage >= 33) return { grade: 'D', remarks: 'Passing Standard, Intensive Support Recommended', gpa: 4.0 };
  return { grade: 'E', remarks: 'Needs Immediate Remedial Coaching', gpa: 0.0 };
}

/**
 * Returns all curriculum subjects available for a student's class and stream.
 */
export function getAvailableSubjectsForStudent(
  classLevel: ClassLevel,
  stream: string,
  subjects: Subject[]
): Subject[] {
  return subjects.filter((s) => {
    if (s.classLevel !== classLevel) return false;
    // For Higher Secondary (Class 11 & 12), all 7 standardized subjects
    // (Maths, Physics, Chemistry, Biology, English, Computer Application, Computer Science)
    // are available for comprehensive coaching enrollment regardless of stream selection
    if (['11', '12'].includes(classLevel)) {
      return true;
    }
    return s.stream === 'General' || s.stream === stream || stream === 'General';
  });
}

/**
 * Returns the exact list of subjects a student is enrolled in for coaching.
 * If enrolledSubjectIds is not specified or empty, assumes all available subjects for class & stream.
 */
export function getEnrolledSubjectsForStudent(student: Student, subjects: Subject[]): Subject[] {
  const available = getAvailableSubjectsForStudent(student.classLevel, student.stream, subjects);
  if (student.enrolledSubjectIds && student.enrolledSubjectIds.length > 0) {
    const enrolled = available.filter((s) => student.enrolledSubjectIds!.includes(s.id));
    return enrolled.length > 0 ? enrolled : available;
  }
  return available;
}

/**
 * Determines whether a student is taking Single Subject, Multiple Subjects, or All Subjects Combo.
 */
export function getStudentCoachingMode(
  student: Student,
  subjects?: Subject[]
): 'Single Subject' | 'Multiple Subjects' | 'All Subjects Combo' {
  if (subjects && subjects.length > 0) {
    const available = getAvailableSubjectsForStudent(student.classLevel, student.stream, subjects);
    const enrolled = getEnrolledSubjectsForStudent(student, subjects);
    if (enrolled.length === 1) return 'Single Subject';
    if (enrolled.length > 1 && enrolled.length < available.length) return 'Multiple Subjects';
    return 'All Subjects Combo';
  }

  const count = student.enrolledSubjectIds ? student.enrolledSubjectIds.length : 0;
  if (count === 1) return 'Single Subject';
  if (count > 1 && count <= 4) return 'Multiple Subjects';
  return 'All Subjects Combo';
}

export function computeStudentFeeSummary(
  student: Student,
  deposits: FeeDeposit[],
  feeStructures: Record<string, FeeStructure> = DEFAULT_FEE_STRUCTURE,
  subjects?: Subject[]
): StudentFeeSummary {
  const key = `${student.classLevel}-${student.stream}`;
  const structure = feeStructures[key] || DEFAULT_FEE_STRUCTURE['10-General'];

  // Determine enrolled subject count & coaching mode
  let enrolledCount = 6;
  let totalAvailableCount = 6;
  let coachingMode: 'Single Subject' | 'Multiple Subjects' | 'All Subjects Combo' = 'All Subjects Combo';

  if (subjects && subjects.length > 0) {
    const available = getAvailableSubjectsForStudent(student.classLevel, student.stream, subjects);
    totalAvailableCount = Math.max(available.length, 1);
    const enrolled = getEnrolledSubjectsForStudent(student, subjects);
    enrolledCount = enrolled.length;
    coachingMode = getStudentCoachingMode(student, subjects);
  } else if (student.enrolledSubjectIds && student.enrolledSubjectIds.length > 0) {
    enrolledCount = student.enrolledSubjectIds.length;
    if (enrolledCount === 1) {
      coachingMode = 'Single Subject';
    } else if (enrolledCount < 6) {
      coachingMode = 'Multiple Subjects';
    } else {
      coachingMode = 'All Subjects Combo';
    }
  }

  // Monthly Tuition calculation based on coaching enrollment
  const perSubRate = structure.perSubjectMonthlyFee || 350;
  const effectiveMonthlyTuition = Math.max(1, enrolledCount) * perSubRate;

  // Materials & Lab fee: full package or proportional for single/multi subjects
  const effectiveMaterialsFee = coachingMode === 'All Subjects Combo'
    ? (structure.materialsFee ?? 0)
    : Math.round((structure.materialsFee ?? 0) * (enrolledCount / (totalAvailableCount || 1)));

  // Base calculation for 1 Academic Year (12 months tuition + admission + 2 exam terms + materials + annual development fee)
  const annualDevFee = structure.annualDevelopmentFee ?? 50;
  const grossAnnual =
    structure.admissionFee +
    effectiveMonthlyTuition * 12 +
    structure.examFeePerTerm * 2 +
    effectiveMaterialsFee +
    annualDevFee;

  const scholarshipDiscount = Math.round((grossAnnual * (student.scholarshipPercent || 0)) / 100);
  const netPayable = grossAnnual - scholarshipDiscount;

  const studentDeposits = deposits.filter((d) => d.studentId === student.id);
  const totalPaid = studentDeposits.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const dueAmount = Math.max(0, netPayable - totalPaid);

  let feeStatus: 'Paid' | 'Partial' | 'Overdue' | 'Due Soon' = 'Paid';
  if (dueAmount === 0) {
    feeStatus = 'Paid';
  } else if (totalPaid === 0) {
    feeStatus = 'Overdue';
  } else {
    feeStatus = 'Partial';
  }

  const lastPayment = studentDeposits.sort(
    (a, b) => new Date(b.depositDate).getTime() - new Date(a.depositDate).getTime()
  )[0];

  return {
    studentId: student.id,
    totalAnnualFee: grossAnnual,
    totalDiscount: scholarshipDiscount,
    netPayable,
    totalPaid,
    dueAmount,
    feeStatus,
    lastPaymentDate: lastPayment ? lastPayment.depositDate : undefined,
    monthlyTuitionFee: effectiveMonthlyTuition,
    enrolledSubjectCount: enrolledCount,
    coachingMode,
  };
}

export interface NonTuitionFeeHeadStatus {
  head: string;
  category: 'Admission' | 'Exam' | 'MaterialLab' | 'AnnualDev';
  requiredAmount: number;
  paidAmount: number;
  isSubmitted: boolean;
  termsPaid?: number;
  totalTerms?: number;
  lastPaymentDate?: string;
  receiptNo?: string;
}

export interface StudentFeeHeadsTracking {
  admission: NonTuitionFeeHeadStatus;
  exam: NonTuitionFeeHeadStatus;
  materialsAndLab: NonTuitionFeeHeadStatus;
  annualDevelopment: NonTuitionFeeHeadStatus;
  allNonTuitionSubmitted: boolean;
  totalNonTuitionRequired: number;
  totalNonTuitionPaid: number;
  totalNonTuitionDue: number;
}

/**
 * Tracks whether Admission Fees, Exam Fees, Study Material & Lab Fees, and Annual Development Fees
 * are submitted or pending for a candidate.
 */
export function getStudentFeeHeadsSubmissionStatus(
  student: Student,
  deposits: FeeDeposit[],
  feeStructures: Record<string, FeeStructure> = DEFAULT_FEE_STRUCTURE,
  subjects?: Subject[]
): StudentFeeHeadsTracking {
  const key = `${student.classLevel}-${student.stream}`;
  const structure = feeStructures[key] || DEFAULT_FEE_STRUCTURE['10-General'];
  const studentDeposits = deposits.filter((d) => d.studentId === student.id);

  let admissionPaid = 0;
  let examPaid = 0;
  let materialsPaid = 0;
  let annualDevPaid = 0;

  let admissionLastDate: string | undefined;
  let admissionLastReceipt: string | undefined;
  let examLastDate: string | undefined;
  let examLastReceipt: string | undefined;
  let materialsLastDate: string | undefined;
  let materialsLastReceipt: string | undefined;
  let annualDevLastDate: string | undefined;
  let annualDevLastReceipt: string | undefined;

  studentDeposits.forEach((dep) => {
    if (dep.headBreakdown && dep.headBreakdown.length > 0) {
      dep.headBreakdown.forEach((item) => {
        const headLower = item.head.toLowerCase();
        if (headLower.includes('admission')) {
          admissionPaid += item.amount;
          admissionLastDate = dep.depositDate;
          admissionLastReceipt = dep.receiptNo || dep.id;
        } else if (headLower.includes('exam')) {
          examPaid += item.amount;
          examLastDate = dep.depositDate;
          examLastReceipt = dep.receiptNo || dep.id;
        } else if (headLower.includes('material') || headLower.includes('lab')) {
          materialsPaid += item.amount;
          materialsLastDate = dep.depositDate;
          materialsLastReceipt = dep.receiptNo || dep.id;
        } else if (headLower.includes('annual') || headLower.includes('development')) {
          annualDevPaid += item.amount;
          annualDevLastDate = dep.depositDate;
          annualDevLastReceipt = dep.receiptNo || dep.id;
        }
      });
    } else {
      const headLower = (dep.feeHead || '').toLowerCase();
      const headsList = (dep.selectedFeeHeads || []).map((h) => h.toLowerCase());
      const hasHead = (keyword: string) => headLower.includes(keyword) || headsList.some((h) => h.includes(keyword));

      if (hasHead('admission')) {
        admissionPaid += dep.amountPaid;
        admissionLastDate = dep.depositDate;
        admissionLastReceipt = dep.receiptNo || dep.id;
      } else if (hasHead('exam')) {
        examPaid += dep.amountPaid;
        examLastDate = dep.depositDate;
        examLastReceipt = dep.receiptNo || dep.id;
      } else if (hasHead('material') || hasHead('lab')) {
        materialsPaid += dep.amountPaid;
        materialsLastDate = dep.depositDate;
        materialsLastReceipt = dep.receiptNo || dep.id;
      } else if (hasHead('annual') || hasHead('development')) {
        annualDevPaid += dep.amountPaid;
        annualDevLastDate = dep.depositDate;
        annualDevLastReceipt = dep.receiptNo || dep.id;
      }
    }
  });

  const coachingMode = getStudentCoachingMode(student, subjects);
  const enrolledCount = student.enrolledSubjectIds?.length || 4;
  const availableCount = subjects ? getAvailableSubjectsForStudent(student.classLevel, student.stream, subjects).length : 6;
  const effectiveMaterialsFee = coachingMode === 'All Subjects Combo'
    ? (structure.materialsFee ?? 50)
    : Math.round((structure.materialsFee ?? 50) * (enrolledCount / (availableCount || 1)));

  const admissionRequired = structure.admissionFee || 100;
  const examRequired = (structure.examFeePerTerm || 100) * 2;
  const materialsRequired = effectiveMaterialsFee;
  const annualDevRequired = structure.annualDevelopmentFee ?? 50;

  const examTermsPaid = Math.min(2, Math.floor(examPaid / Math.max(1, structure.examFeePerTerm || 50)));

  const admissionStatus: NonTuitionFeeHeadStatus = {
    head: 'Admission Fee',
    category: 'Admission',
    requiredAmount: admissionRequired,
    paidAmount: admissionPaid,
    isSubmitted: admissionPaid >= admissionRequired,
    lastPaymentDate: admissionLastDate,
    receiptNo: admissionLastReceipt,
  };

  const examStatus: NonTuitionFeeHeadStatus = {
    head: 'Exam Assessment Fee',
    category: 'Exam',
    requiredAmount: examRequired,
    paidAmount: examPaid,
    termsPaid: examTermsPaid,
    totalTerms: 2,
    isSubmitted: examPaid >= examRequired || examTermsPaid >= 2,
    lastPaymentDate: examLastDate,
    receiptNo: examLastReceipt,
  };

  const materialsStatus: NonTuitionFeeHeadStatus = {
    head: 'Study Material & Lab Fee',
    category: 'MaterialLab',
    requiredAmount: materialsRequired,
    paidAmount: materialsPaid,
    isSubmitted: materialsPaid >= materialsRequired,
    lastPaymentDate: materialsLastDate,
    receiptNo: materialsLastReceipt,
  };

  const annualDevStatus: NonTuitionFeeHeadStatus = {
    head: 'Annual Development Fee',
    category: 'AnnualDev',
    requiredAmount: annualDevRequired,
    paidAmount: annualDevPaid,
    isSubmitted: annualDevPaid >= annualDevRequired,
    lastPaymentDate: annualDevLastDate,
    receiptNo: annualDevLastReceipt,
  };

  const totalNonTuitionRequired = admissionRequired + examRequired + materialsRequired + annualDevRequired;
  const totalNonTuitionPaid = admissionPaid + examPaid + materialsPaid + annualDevPaid;
  const totalNonTuitionDue = Math.max(0, totalNonTuitionRequired - totalNonTuitionPaid);
  const allNonTuitionSubmitted = admissionStatus.isSubmitted && examStatus.isSubmitted && materialsStatus.isSubmitted && annualDevStatus.isSubmitted;

  return {
    admission: admissionStatus,
    exam: examStatus,
    materialsAndLab: materialsStatus,
    annualDevelopment: annualDevStatus,
    allNonTuitionSubmitted,
    totalNonTuitionRequired,
    totalNonTuitionPaid,
    totalNonTuitionDue,
  };
}

export interface CandidateCurrentMonthDuesSummary {
  studentId: string;
  currentSessionMonth: string; // e.g. "September 2026"
  elapsedMonthsCount: number; // e.g. 9
  totalMonthsInSession: number; // 12
  monthlyTuitionFee: number;
  totalTuitionDueTillCurrentMonth: number;
  nonTuitionDueTillCurrentMonth: number;
  grossPayableTillCurrentMonth: number;
  scholarshipDiscountTillCurrentMonth: number;
  netPayableTillCurrentMonth: number;
  totalPaidTillDate: number;
  remainingDuesTillCurrentMonth: number;
  advanceCreditTillCurrentMonth: number;
  isCurrentMonthCleared: boolean;
  totalAnnualNetPayable: number;
  totalAnnualDuesRemaining: number;
  unpaidElapsedMonths: string[];
  paidElapsedMonthsCount: number;
}

/**
 * Calculates a candidate's remaining dues and payment balance up to the current session month.
 */
export function computeCandidateDuesTillCurrentMonth(
  student: Student,
  deposits: FeeDeposit[],
  currentSessionMonth: string = 'September 2026',
  feeStructures: Record<string, FeeStructure> = DEFAULT_FEE_STRUCTURE,
  subjects?: Subject[]
): CandidateCurrentMonthDuesSummary {
  const currentMonthIdx = ACADEMIC_SESSION_MONTHS.findIndex((m) => matchMonth(m, currentSessionMonth));
  const effectiveIdx = currentMonthIdx >= 0 ? currentMonthIdx : 8; // default to September 2026 (index 8)
  const elapsedMonthsCount = effectiveIdx + 1; // 9 months
  const elapsedSessionMonths = ACADEMIC_SESSION_MONTHS.slice(0, elapsedMonthsCount);

  const annualSummary = computeStudentFeeSummary(student, deposits, feeStructures, subjects);
  const monthlyTuition = annualSummary.monthlyTuitionFee;
  const totalTuitionDueTillCurrentMonth = monthlyTuition * elapsedMonthsCount;

  const key = `${student.classLevel}-${student.stream}`;
  const structure = feeStructures[key] || DEFAULT_FEE_STRUCTURE['10-General'];
  const tracking = getStudentFeeHeadsSubmissionStatus(student, deposits, feeStructures, subjects);

  // Till September (mid/Q3 of session), 1 term exam fee + admission + materials + annual dev are applicable
  const examFeeApplicable = structure.examFeePerTerm || 100;
  const nonTuitionDueTillCurrentMonth =
    structure.admissionFee +
    tracking.materialsAndLab.requiredAmount +
    tracking.annualDevelopment.requiredAmount +
    examFeeApplicable;

  const grossPayableTillCurrentMonth = totalTuitionDueTillCurrentMonth + nonTuitionDueTillCurrentMonth;
  const scholarshipDiscountTillCurrentMonth = Math.round(
    (grossPayableTillCurrentMonth * (student.scholarshipPercent || 0)) / 100
  );
  const netPayableTillCurrentMonth = grossPayableTillCurrentMonth - scholarshipDiscountTillCurrentMonth;

  const studentDeposits = deposits.filter((d) => d.studentId === student.id);
  const totalPaidTillDate = studentDeposits.reduce((sum, d) => sum + (Number(d.amountPaid) || 0), 0);

  const remainingDuesTillCurrentMonth = Math.max(0, netPayableTillCurrentMonth - totalPaidTillDate);
  const advanceCreditTillCurrentMonth = Math.max(0, totalPaidTillDate - netPayableTillCurrentMonth);

  // Calculate unpaid elapsed tuition months
  const monthStatuses = getStudentTuitionMonthsStatus(student.id, deposits, elapsedSessionMonths);
  const unpaidElapsed = monthStatuses.filter((s) => !s.isPaid).map((s) => s.month);
  const paidElapsedCount = monthStatuses.filter((s) => s.isPaid).length;

  return {
    studentId: student.id,
    currentSessionMonth: ACADEMIC_SESSION_MONTHS[effectiveIdx] || currentSessionMonth,
    elapsedMonthsCount,
    totalMonthsInSession: 12,
    monthlyTuitionFee: monthlyTuition,
    totalTuitionDueTillCurrentMonth,
    nonTuitionDueTillCurrentMonth,
    grossPayableTillCurrentMonth,
    scholarshipDiscountTillCurrentMonth,
    netPayableTillCurrentMonth,
    totalPaidTillDate,
    remainingDuesTillCurrentMonth,
    advanceCreditTillCurrentMonth,
    isCurrentMonthCleared: remainingDuesTillCurrentMonth === 0,
    totalAnnualNetPayable: annualSummary.netPayable,
    totalAnnualDuesRemaining: annualSummary.dueAmount,
    unpaidElapsedMonths: unpaidElapsed,
    paidElapsedMonthsCount: paidElapsedCount,
  };
}

/**
 * Returns previous transactions recorded for a candidate (excluding the currently viewed receipt)
 */
export function getCandidatePreviousTransactions(
  candidateId: string,
  currentReceiptNoOrId: string,
  deposits: FeeDeposit[]
): FeeDeposit[] {
  return deposits
    .filter((d) => d.studentId === candidateId && d.id !== currentReceiptNoOrId && d.receiptNo !== currentReceiptNoOrId)
    .sort((a, b) => {
      const timeA = new Date(a.depositDate).getTime();
      const timeB = new Date(b.depositDate).getTime();
      if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
        return timeB - timeA;
      }
      return (b.receiptNo || b.id).localeCompare(a.receiptNo || a.id);
    });
}

export const ACADEMIC_SESSION_MONTHS = [
  'January 2026',
  'February 2026',
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026',
] as const;

export type AcademicSessionMonth = (typeof ACADEMIC_SESSION_MONTHS)[number];

export const MONTH_SHORT_NAMES: Record<string, string> = {
  'January 2026': 'Jan',
  'February 2026': 'Feb',
  'March 2026': 'Mar',
  'April 2026': 'Apr',
  'May 2026': 'May',
  'June 2026': 'Jun',
  'July 2026': 'Jul',
  'August 2026': 'Aug',
  'September 2026': 'Sep',
  'October 2026': 'Oct',
  'November 2026': 'Nov',
  'December 2026': 'Dec',
};

export interface StudentMonthTuitionStatus {
  month: string;
  shortMonth: string;
  isPaid: boolean;
  depositId?: string;
  receiptNo?: string;
  depositDate?: string;
  amountPaid?: number;
  paymentMode?: string;
  matchingDeposit?: FeeDeposit;
}

/**
 * Normalizes string representations of months for accurate matching
 * e.g., "April 2026", "April", "Apr 2026", "Apr"
 */
export function matchMonth(monthNameA: string, monthNameB: string): boolean {
  const cleanA = monthNameA.trim().toLowerCase();
  const cleanB = monthNameB.trim().toLowerCase();
  if (cleanA === cleanB) return true;

  const prefixA = cleanA.split(' ')[0].slice(0, 3);
  const prefixB = cleanB.split(' ')[0].slice(0, 3);
  return prefixA === prefixB && prefixA.length >= 3;
}

/**
 * Retrieves the month-by-month tuition payment status for a specific student
 */
export function getStudentTuitionMonthsStatus(
  studentId: string,
  deposits: FeeDeposit[],
  sessionMonths: readonly string[] = ACADEMIC_SESSION_MONTHS
): StudentMonthTuitionStatus[] {
  // Find all tuition deposits for this student
  const studentTuitionDeposits = deposits.filter((d) => {
    if (d.studentId !== studentId) return false;
    const isTuition =
      d.feeHead === 'Tuition Fee' ||
      d.selectedFeeHeads?.includes('Tuition Fee') ||
      (d.monthsCovered && d.monthsCovered.length > 0);
    return isTuition;
  });

  return sessionMonths.map((sessionMonth) => {
    const matchingDeposit = studentTuitionDeposits.find((d) =>
      d.monthsCovered?.some((covMonth) => matchMonth(covMonth, sessionMonth))
    );

    return {
      month: sessionMonth,
      shortMonth: MONTH_SHORT_NAMES[sessionMonth] || sessionMonth.slice(0, 3),
      isPaid: !!matchingDeposit,
      depositId: matchingDeposit?.id,
      receiptNo: matchingDeposit?.receiptNo,
      depositDate: matchingDeposit?.depositDate,
      amountPaid: matchingDeposit?.amountPaid,
      paymentMode: matchingDeposit?.paymentMode,
      matchingDeposit,
    };
  });
}

/**
 * Returns the first unpaid month for a student in the academic session
 */
export function getNextUnpaidTuitionMonth(
  studentId: string,
  deposits: FeeDeposit[],
  sessionMonths: readonly string[] = ACADEMIC_SESSION_MONTHS
): string | null {
  const statuses = getStudentTuitionMonthsStatus(studentId, deposits, sessionMonths);
  const unpaid = statuses.find((s) => !s.isPaid);
  return unpaid ? unpaid.month : null;
}

/**
 * Computes tuition collection statistics for each month across all active students
 */
export function getTuitionMonthCollectionStats(
  students: Student[],
  deposits: FeeDeposit[],
  sessionMonths: readonly string[] = ACADEMIC_SESSION_MONTHS
): {
  month: string;
  shortMonth: string;
  totalStudents: number;
  paidStudentsCount: number;
  unpaidStudentsCount: number;
  collectionPercentage: number;
  totalCollected: number;
}[] {
  const activeStudents = students.filter((s) => s.status === 'Active');
  const totalActive = activeStudents.length || 1;

  return sessionMonths.map((month) => {
    let paidCount = 0;
    let totalCollected = 0;

    activeStudents.forEach((student) => {
      const monthStatus = getStudentTuitionMonthsStatus(student.id, deposits, [month])[0];
      if (monthStatus?.isPaid) {
        paidCount++;
        if (monthStatus.matchingDeposit) {
          // If deposit covers multiple months, attribute proportional share
          const monthsCount = monthStatus.matchingDeposit.monthsCovered?.length || 1;
          totalCollected += Math.round(monthStatus.matchingDeposit.amountPaid / monthsCount);
        }
      }
    });

    const unpaidCount = Math.max(0, activeStudents.length - paidCount);
    const collectionPercentage = Math.round((paidCount / totalActive) * 100);

    return {
      month,
      shortMonth: MONTH_SHORT_NAMES[month] || month.slice(0, 3),
      totalStudents: activeStudents.length,
      paidStudentsCount: paidCount,
      unpaidStudentsCount: unpaidCount,
      collectionPercentage,
      totalCollected,
    };
  });
}

export function generateStudentId(classLevel: ClassLevel, existingCount: number): string {
  const currentYear = new Date().getFullYear();
  const sequence = String(existingCount + 1).padStart(3, '0');
  const classPadded = String(classLevel).padStart(2, '0');
  return `BA-${currentYear}-${classPadded}${sequence}`;
}

export function generateReceiptNumber(existingCount: number): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `REC-${currentYear}-${String(existingCount + 1).padStart(3, '0')}-${randomSuffix}`;
}

export function assignRanksToResults(results: ExamResult[]): ExamResult[] {
  // Sort descending by percentage
  const sorted = [...results].sort((a, b) => b.percentage - a.percentage);
  return sorted.map((res, index) => ({
    ...res,
    rankInClass: index + 1,
  }));
}

/**
 * Returns students who are enrolled in a specific subject.
 * Checks both individual subject enrollments and full-combo students in that class/stream.
 */
export function getStudentsEnrolledInSubject(
  subjectId: string,
  students: Student[],
  subjects: Subject[]
): Student[] {
  const targetSubject = subjects.find((s) => s.id === subjectId);
  if (!targetSubject) return [];

  return students.filter((student) => {
    if (student.status !== 'Active') return false;
    if (student.classLevel !== targetSubject.classLevel) return false;

    // Check explicit enrolled subjects array
    if (student.enrolledSubjectIds && student.enrolledSubjectIds.length > 0) {
      return student.enrolledSubjectIds.includes(subjectId);
    }

    // If no explicit array or All Subjects Combo, check matching class & stream
    if (student.enrollmentType === 'All Subjects Combo' || !student.enrollmentType) {
      if (['11', '12'].includes(student.classLevel)) {
        return student.stream === targetSubject.stream;
      }
      return true;
    }

    return false;
  });
}

/**
 * Calculates complete student attendance statistics overall and subject-by-subject.
 */
export function computeStudentAttendanceSummary(
  student: Student,
  attendanceRecords: AttendanceRecord[],
  subjects: Subject[],
  facultyList?: Faculty[]
): StudentAttendanceSummary {
  // Filter all attendance records for this student
  const studentRecords = attendanceRecords
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalClasses = studentRecords.length;
  const presentCount = studentRecords.filter((r) => r.status === 'Present').length;
  const absentCount = studentRecords.filter((r) => r.status === 'Absent').length;
  const lateCount = studentRecords.filter((r) => r.status === 'Late').length;
  const excusedCount = studentRecords.filter((r) => r.status === 'Excused').length;

  // Effective presence (Present + Excused + 0.5 * Late) or standard Present + Late
  const effectivePresent = presentCount + lateCount + excusedCount;
  const attendancePercentage = totalClasses > 0 ? Math.round((effectivePresent / totalClasses) * 100) : 100;

  let status: 'Excellent' | 'Good' | 'Average' | 'Critical Shortage' = 'Good';
  if (attendancePercentage >= 90) {
    status = 'Excellent';
  } else if (attendancePercentage >= 75) {
    status = 'Good';
  } else if (attendancePercentage >= 65) {
    status = 'Average';
  } else {
    status = 'Critical Shortage';
  }

  // Calculate subject-wise breakdown for enrolled subjects
  const enrolledSubs = getEnrolledSubjectsForStudent(student, subjects);
  const subjectWise: SubjectAttendanceStat[] = enrolledSubs.map((sub) => {
    const subRecords = studentRecords.filter((r) => r.subjectId === sub.id);
    const subTotal = subRecords.length;
    const subPresent = subRecords.filter((r) => r.status === 'Present').length;
    const subAbsent = subRecords.filter((r) => r.status === 'Absent').length;
    const subLate = subRecords.filter((r) => r.status === 'Late').length;
    const subExcused = subRecords.filter((r) => r.status === 'Excused').length;

    const subEffective = subPresent + subLate + subExcused;
    const subPercentage = subTotal > 0 ? Math.round((subEffective / subTotal) * 100) : 100;
    const assignedFaculty = facultyList?.find((f) => f.id === sub.facultyId);

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code,
      facultyName: assignedFaculty ? assignedFaculty.name : undefined,
      totalClasses: subTotal,
      presentCount: subPresent,
      absentCount: subAbsent,
      lateCount: subLate,
      excusedCount: subExcused,
      percentage: subPercentage,
    };
  });

  return {
    studentId: student.id,
    totalClasses,
    presentCount,
    absentCount,
    lateCount,
    excusedCount,
    attendancePercentage,
    status,
    subjectWise,
    recentLogs: studentRecords.slice(0, 15),
  };
}

export function getAttendanceStatusBadge(status: AttendanceStatus): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (status) {
    case 'Present':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Present',
      };
    case 'Absent':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        label: 'Absent',
      };
    case 'Late':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'Late',
      };
    case 'Excused':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'Excused Leave',
      };
  }
}

// ----------------------------------------------------
// FINANCIAL & DISBURSEMENT LEDGER UTILITIES
// ----------------------------------------------------

export interface LedgerMeta {
  ledger: import('../types').DisbursementLedgerCategory;
  title: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconColor: string;
  cardBorder: string;
  commonSubCategories: string[];
}

export const LEDGER_DEFINITIONS: Record<import('../types').DisbursementLedgerCategory, LedgerMeta> = {
  Salary: {
    ledger: 'Salary',
    title: 'Staff & Faculty Remuneration',
    description: 'Faculty monthly compensation, guest lecturer honorariums, administrative assistants & lab staff salaries.',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    iconColor: 'text-blue-600',
    cardBorder: 'border-blue-100',
    commonSubCategories: [
      'Senior Faculty Monthly Remuneration',
      'Subject Lead Honorarium',
      'Assistant Faculty Stipend',
      'Administrative & Cashier Salary',
      'Lab Assistant & Technician Pay',
      'Invigilation & Paper Setting Honorarium',
    ],
  },
  Vendors: {
    ledger: 'Vendors',
    title: 'Suppliers & Educational Vendors',
    description: 'Booklets printing, stationery, lab consumables, study materials, student uniforms & answer sheets.',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    iconColor: 'text-amber-600',
    cardBorder: 'border-amber-100',
    commonSubCategories: [
      'Study Materials & DPP Printing',
      'Board Mock Test Booklets & OMR Sheets',
      'Science Laboratory Chemicals & Glassware',
      'Student ID Cards & Certificates Printing',
      'Classroom Stationery & Whiteboard Markers',
      'Curriculum Textbooks & Reference Guides',
    ],
  },
  Contractor: {
    ledger: 'Contractor',
    title: 'Maintenance & Service Contractors',
    description: 'Electrical rigging, HVAC air conditioning, facility repairs, plumbing, painting & campus security.',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    cardBorder: 'border-emerald-100',
    commonSubCategories: [
      'HVAC Air Conditioning Maintenance & Servicing',
      'Electrical Cabling & Digital Classroom Network',
      'Campus Security & Surveillance AMC',
      'Sanitization, Deep Cleaning & Pest Control',
      'Classroom Acoustic & Civil Repair Work',
      'Fire Safety Equipment Inspection',
    ],
  },
  Assets: {
    ledger: 'Assets',
    title: 'Capital Equipment & Fixed Assets',
    description: 'Smart interactive whiteboards, desktop workstations, lab apparatus, high-capacity UPS & classroom furniture.',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    iconColor: 'text-purple-600',
    cardBorder: 'border-purple-100',
    commonSubCategories: [
      'Computer Lab Workstation Upgrades',
      'Interactive Digital Whiteboard Displays',
      'High-Capacity Solar/Inverter Power Backup',
      'Optics & Physics Precision Lab Apparatus',
      'Ergonomic Classroom Benches & Podiums',
      'Audio-Visual Projectors & Microphones',
    ],
  },
  Grocery: {
    ledger: 'Grocery',
    title: 'Cafeteria, Pantry & Provisions',
    description: 'Faculty pantry consumables, tea/coffee, mineral water dispensaries, cafeteria groceries & student refreshments.',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    badgeBorder: 'border-teal-200',
    iconColor: 'text-teal-600',
    cardBorder: 'border-teal-100',
    commonSubCategories: [
      'Faculty Pantry, Beverages & Consumables',
      'Packaged Mineral Water Jar Refills',
      'Examination Days Refreshments & Snacks',
      'Sanitary, Soap & Pantry Paper Supplies',
      'Staff Meeting Hospitality & Tea Service',
    ],
  },
  Utilities: {
    ledger: 'Utilities',
    title: 'Institutional Utilities & Infrastructure',
    description: 'Electricity power bills, dedicated symmetric fiber broadband, municipal water taxes & leased premises.',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    iconColor: 'text-indigo-600',
    cardBorder: 'border-indigo-100',
    commonSubCategories: [
      'Electricity & Power Utilities (Commercial Meter)',
      'High-Speed Enterprise Broadband Internet',
      'Commercial Property Lease & Facility Rent',
      'Municipal Corporation Water & Tax Dues',
      'Cloud Server Hosting & SMS Gateway Gateway',
    ],
  },
  Marketing: {
    ledger: 'Marketing',
    title: 'Admissions Outreach & Promotion',
    description: 'Street hoardings, metro station banners, digital social campaigns, information brochures & orientation seminars.',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    iconColor: 'text-rose-600',
    cardBorder: 'border-rose-100',
    commonSubCategories: [
      'Academic Session Hoardings & Metro Banners',
      'Digital Ads & Local Social Media Outreach',
      'School Outreach Flyers & Information Prospectus',
      'Career Guidance & Scholarship Seminar Costs',
      'Academic Merit Felicitation Banners',
    ],
  },
  Miscellaneous: {
    ledger: 'Miscellaneous',
    title: 'Contingency & General Operations',
    description: 'Courier & postal dispatches, bank transactional charges, audit filings, legal compliance & petty emergency cash.',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    iconColor: 'text-slate-600',
    cardBorder: 'border-slate-100',
    commonSubCategories: [
      'Official Postal Dispatch & DTDC Courier',
      'Statutory Audit, CA & Legal Compliance',
      'Emergency Contingency & Petty Cash Refill',
      'Bank Guarantee & POS Transaction Surcharges',
      'Staff First-Aid & Emergency Medical Kit',
    ],
  },
};

export function generateDisbursementVoucherNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const serial = Math.floor(10 + Math.random() * 90);
  return `PV-${year}-${serial.toString().padStart(3, '0')}-${randomSuffix}`;
}

export function computeProfitAndLossSummary(
  deposits: FeeDeposit[],
  disbursements: import('../types').PaymentDisbursement[],
  students: Student[],
  customBudgetCap?: number,
  customReserveTarget?: number
): import('../types').ProfitAndLossSummary {
  // 1. Gross Revenue Inflow from collections
  const grossRevenue = deposits.reduce((sum, d) => sum + (d.amountPaid || 0), 0);

  // 2. Projected Annual Billable Fee from all active students
  const projectedAnnualRevenue = students.reduce((sum, student) => {
    const summary = computeStudentFeeSummary(student, deposits);
    return sum + (summary.netPayable || 0);
  }, 0);

  // 3. Total Disbursed (Paid / Realized Outflow)
  const totalDisbursed = disbursements
    .filter((d) => d.status === 'Disbursed')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  // 4. Pending / Queued Disbursements
  const pendingDisbursements = disbursements
    .filter((d) => d.status === 'Approved' || d.status === 'Pending Approval')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  // 5. Net Operating Profit & Margin
  const netOperatingProfit = grossRevenue - totalDisbursed;
  const profitMarginPercent = grossRevenue > 0 ? (netOperatingProfit / grossRevenue) * 100 : 0;
  const projectedAnnualProfit = projectedAnnualRevenue - (totalDisbursed + pendingDisbursements);

  // 6. Ledger-wise breakdown
  const ledgers: import('../types').DisbursementLedgerCategory[] = [
    'Salary',
    'Vendors',
    'Contractor',
    'Assets',
    'Grocery',
    'Utilities',
    'Marketing',
    'Miscellaneous',
  ];

  const ledgerBreakdown = ledgers.map((ledger) => {
    const ledgerDisbursements = disbursements.filter(
      (d) => d.ledger === ledger && d.status === 'Disbursed'
    );
    const totalAmount = ledgerDisbursements.reduce((sum, d) => sum + (d.amount || 0), 0);
    const transactionCount = ledgerDisbursements.length;
    const percentageOfTotalExpense = totalDisbursed > 0 ? (totalAmount / totalDisbursed) * 100 : 0;
    const percentageOfRevenue = grossRevenue > 0 ? (totalAmount / grossRevenue) * 100 : 0;

    return {
      ledger,
      totalAmount,
      transactionCount,
      percentageOfTotalExpense,
      percentageOfRevenue,
    };
  });

  return {
    grossRevenue,
    totalDisbursed,
    pendingDisbursements,
    netOperatingProfit,
    profitMarginPercent,
    projectedAnnualRevenue,
    projectedAnnualProfit,
    monthlyDisbursementBudgetCap: customBudgetCap || 350000,
    minimumProfitReserveTarget: customReserveTarget || 100000,
    ledgerBreakdown,
  };
}


