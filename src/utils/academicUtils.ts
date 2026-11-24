import {
  AttendanceRecord,
  AttendanceStatus,
  ClassLevel,
  CurriculumBoard,
  ExamResult,
  Faculty,
  FeeDeposit,
  FeeHeadType,
  FeeStructure,
  Student,
  StudentAttendanceSummary,
  StudentFeeSummary,
  StudentSubjectEnrollment,
  Subject,
  SubjectAttendanceStat,
} from '../types';

export const CLASS_LEVELS: ClassLevel[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export const CURRICULUM_BOARDS: CurriculumBoard[] = ['CBSE', 'W.B. Board'];

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

export const ACADEMY_ROOMS = [
  'ROOM-1',
  'ROOM-2',
  'ROOM-3',
  'ROOM-4',
  'ROOM-5',
  'ROOM-6',
  'ROOM-7',
  'ROOM-8',
] as const;

export type AcademyRoom = (typeof ACADEMY_ROOMS)[number];

export const MAX_CONCURRENT_ROOMS = 6;

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
  // CBSE Fee Structures
  // Class 1 to 4: for all subjects, Rs 1500 /- (one package)
  '1-General-CBSE': { classLevel: '1', stream: 'General', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 1500, perSubjectMonthlyFee: 1500, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '2-General-CBSE': { classLevel: '2', stream: 'General', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 1500, perSubjectMonthlyFee: 1500, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '3-General-CBSE': { classLevel: '3', stream: 'General', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 1500, perSubjectMonthlyFee: 1500, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '4-General-CBSE': { classLevel: '4', stream: 'General', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 1500, perSubjectMonthlyFee: 1500, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },

  // Class 5 to 8: Rs 750 /- per subject
  '5-General-CBSE': { classLevel: '5', stream: 'General', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 3000, perSubjectMonthlyFee: 750, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '6-General-CBSE': { classLevel: '6', stream: 'General', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 3000, perSubjectMonthlyFee: 750, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '7-General-CBSE': { classLevel: '7', stream: 'General', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 3000, perSubjectMonthlyFee: 750, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '8-General-CBSE': { classLevel: '8', stream: 'General', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 3000, perSubjectMonthlyFee: 750, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },

  // Class 9 & 10: Rs 800 /- per subject
  '9-General-CBSE': { classLevel: '9', stream: 'General', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 3200, perSubjectMonthlyFee: 800, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '10-General-CBSE': { classLevel: '10', stream: 'General', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 3200, perSubjectMonthlyFee: 800, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },

  // Class 11 & 12: Rs 1000 /- per subject
  '11-Science-CBSE': { classLevel: '11', stream: 'Science', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 4000, perSubjectMonthlyFee: 1000, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '11-Commerce-CBSE': { classLevel: '11', stream: 'Commerce', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 4000, perSubjectMonthlyFee: 1000, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '11-Arts-CBSE': { classLevel: '11', stream: 'Arts', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 4000, perSubjectMonthlyFee: 1000, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '11-General-CBSE': { classLevel: '11', stream: 'General', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 4000, perSubjectMonthlyFee: 1000, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-Science-CBSE': { classLevel: '12', stream: 'Science', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 4000, perSubjectMonthlyFee: 1000, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-Commerce-CBSE': { classLevel: '12', stream: 'Commerce', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 4000, perSubjectMonthlyFee: 1000, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-Arts-CBSE': { classLevel: '12', stream: 'Arts', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 4000, perSubjectMonthlyFee: 1000, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-General-CBSE': { classLevel: '12', stream: 'General', curriculum: 'CBSE', admissionFee: 100, monthlyTuitionFee: 4000, perSubjectMonthlyFee: 1000, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },

  // W.B. Board Fee Structures
  // Class 1 to 4: for all subjects, Rs 800 /- (one package)
  '1-General-W.B. Board': { classLevel: '1', stream: 'General', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 800, perSubjectMonthlyFee: 800, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '2-General-W.B. Board': { classLevel: '2', stream: 'General', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 800, perSubjectMonthlyFee: 800, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '3-General-W.B. Board': { classLevel: '3', stream: 'General', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 800, perSubjectMonthlyFee: 800, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '4-General-W.B. Board': { classLevel: '4', stream: 'General', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 800, perSubjectMonthlyFee: 800, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },

  // Class 5 to 8: Rs 300 /- per subject
  '5-General-W.B. Board': { classLevel: '5', stream: 'General', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 1200, perSubjectMonthlyFee: 300, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '6-General-W.B. Board': { classLevel: '6', stream: 'General', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 1200, perSubjectMonthlyFee: 300, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '7-General-W.B. Board': { classLevel: '7', stream: 'General', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 1200, perSubjectMonthlyFee: 300, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '8-General-W.B. Board': { classLevel: '8', stream: 'General', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 1200, perSubjectMonthlyFee: 300, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },

  // Class 9 to 10: Rs 350 /- per subject
  '9-General-W.B. Board': { classLevel: '9', stream: 'General', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 1400, perSubjectMonthlyFee: 350, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '10-General-W.B. Board': { classLevel: '10', stream: 'General', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 1400, perSubjectMonthlyFee: 350, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },

  // Class 11 and 12: Rs 450 /- per subject
  '11-Science-W.B. Board': { classLevel: '11', stream: 'Science', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 1800, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '11-Commerce-W.B. Board': { classLevel: '11', stream: 'Commerce', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 1800, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '11-Arts-W.B. Board': { classLevel: '11', stream: 'Arts', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 1800, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '11-General-W.B. Board': { classLevel: '11', stream: 'General', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 1800, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-Science-W.B. Board': { classLevel: '12', stream: 'Science', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 1800, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-Commerce-W.B. Board': { classLevel: '12', stream: 'Commerce', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 1800, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-Arts-W.B. Board': { classLevel: '12', stream: 'Arts', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 1800, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-General-W.B. Board': { classLevel: '12', stream: 'General', curriculum: 'W.B. Board', admissionFee: 100, monthlyTuitionFee: 1800, perSubjectMonthlyFee: 450, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },

  // General Fallback Structures
  '1-General': { classLevel: '1', stream: 'General', admissionFee: 100, monthlyTuitionFee: 1150, perSubjectMonthlyFee: 1150, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '2-General': { classLevel: '2', stream: 'General', admissionFee: 100, monthlyTuitionFee: 1150, perSubjectMonthlyFee: 1150, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '3-General': { classLevel: '3', stream: 'General', admissionFee: 100, monthlyTuitionFee: 1150, perSubjectMonthlyFee: 1150, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '4-General': { classLevel: '4', stream: 'General', admissionFee: 100, monthlyTuitionFee: 1150, perSubjectMonthlyFee: 1150, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '5-General': { classLevel: '5', stream: 'General', admissionFee: 100, monthlyTuitionFee: 2100, perSubjectMonthlyFee: 525, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '6-General': { classLevel: '6', stream: 'General', admissionFee: 100, monthlyTuitionFee: 2100, perSubjectMonthlyFee: 525, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '7-General': { classLevel: '7', stream: 'General', admissionFee: 100, monthlyTuitionFee: 2100, perSubjectMonthlyFee: 525, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '8-General': { classLevel: '8', stream: 'General', admissionFee: 100, monthlyTuitionFee: 2100, perSubjectMonthlyFee: 525, examFeePerTerm: 50, materialsFee: 50, annualDevelopmentFee: 50 },
  '9-General': { classLevel: '9', stream: 'General', admissionFee: 100, monthlyTuitionFee: 2300, perSubjectMonthlyFee: 575, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '10-General': { classLevel: '10', stream: 'General', admissionFee: 100, monthlyTuitionFee: 2300, perSubjectMonthlyFee: 575, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '11-Science': { classLevel: '11', stream: 'Science', admissionFee: 100, monthlyTuitionFee: 2900, perSubjectMonthlyFee: 725, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '11-Commerce': { classLevel: '11', stream: 'Commerce', admissionFee: 100, monthlyTuitionFee: 2900, perSubjectMonthlyFee: 725, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '11-Arts': { classLevel: '11', stream: 'Arts', admissionFee: 100, monthlyTuitionFee: 2900, perSubjectMonthlyFee: 725, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '11-General': { classLevel: '11', stream: 'General', admissionFee: 100, monthlyTuitionFee: 2900, perSubjectMonthlyFee: 725, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-Science': { classLevel: '12', stream: 'Science', admissionFee: 100, monthlyTuitionFee: 2900, perSubjectMonthlyFee: 725, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-Commerce': { classLevel: '12', stream: 'Commerce', admissionFee: 100, monthlyTuitionFee: 2900, perSubjectMonthlyFee: 725, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-Arts': { classLevel: '12', stream: 'Arts', admissionFee: 100, monthlyTuitionFee: 2900, perSubjectMonthlyFee: 725, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
  '12-General': { classLevel: '12', stream: 'General', admissionFee: 100, monthlyTuitionFee: 2900, perSubjectMonthlyFee: 725, examFeePerTerm: 100, materialsFee: 50, annualDevelopmentFee: 50 },
};

export function getFeeStructure(
  classLevel: ClassLevel,
  stream: string,
  curriculum?: CurriculumBoard,
  feeStructures: Record<string, FeeStructure> = DEFAULT_FEE_STRUCTURE
): FeeStructure {
  const targetCurriculum: CurriculumBoard = curriculum || 'CBSE';
  const boardKey = `${classLevel}-${stream}-${targetCurriculum}`;
  if (feeStructures[boardKey]) return feeStructures[boardKey];
  const boardGeneralKey = `${classLevel}-General-${targetCurriculum}`;
  if (feeStructures[boardGeneralKey]) return feeStructures[boardGeneralKey];

  if (curriculum) {
    const directKey = `${classLevel}-${stream}-${curriculum}`;
    if (feeStructures[directKey]) return feeStructures[directKey];
  }
  const key = `${classLevel}-${stream}`;
  if (feeStructures[key]) return feeStructures[key];
  const generalKey = `${classLevel}-General`;
  if (feeStructures[generalKey]) return feeStructures[generalKey];
  return feeStructures['1-General-CBSE'] || feeStructures['1-General'] || DEFAULT_FEE_STRUCTURE['1-General-CBSE'] || DEFAULT_FEE_STRUCTURE['1-General'];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateGrade(
  percentage: number,
  curriculum: CurriculumBoard = 'CBSE'
): { grade: string; remarks: string; gpa: number } {
  if (curriculum === 'W.B. Board') {
    if (percentage >= 90) return { grade: 'AA', remarks: 'Outstanding Academic Performance (উৎকৃষ্ট)', gpa: 10.0 };
    if (percentage >= 80) return { grade: 'A+', remarks: 'Excellent Mastery & Understanding (চমৎকার)', gpa: 9.0 };
    if (percentage >= 60) return { grade: 'A', remarks: 'Very Good Standard (খুব ভালো)', gpa: 8.0 };
    if (percentage >= 45) return { grade: 'B+', remarks: 'Good Competence (ভালো)', gpa: 7.0 };
    if (percentage >= 35) return { grade: 'B', remarks: 'Satisfactory, Regular Practice Needed (সন্তোষজনক)', gpa: 6.0 };
    if (percentage >= 25) return { grade: 'C', remarks: 'Marginal Pass, Intensive Support Recommended (প্রান্তিক উত্তীর্ণ)', gpa: 4.0 };
    return { grade: 'D', remarks: 'Needs Immediate Remedial Coaching (অকৃতকার্য)', gpa: 0.0 };
  }

  // CBSE Grading Scale
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
 * Returns all curriculum subjects available for a student's class, stream, and curriculum board.
 * Strictly isolates subjects: W.B. Board candidates only see W.B. Board subjects,
 * and CBSE candidates only see CBSE subjects.
 */
export function getAvailableSubjectsForStudent(
  classLevel: ClassLevel,
  stream: string,
  subjects: Subject[],
  curriculum?: CurriculumBoard
): Subject[] {
  const targetCurriculum: CurriculumBoard = curriculum || 'CBSE';
  return subjects.filter((s) => {
    if (s.classLevel !== classLevel) return false;
    const subCurriculum: CurriculumBoard = s.curriculum || (s.id.startsWith('SUB-WB-') ? 'W.B. Board' : 'CBSE');
    if (subCurriculum !== targetCurriculum) return false;
    // For Higher Secondary (Class 11 & 12), all standardized subjects in this board
    // are available for comprehensive coaching enrollment regardless of stream selection
    if (['11', '12'].includes(classLevel)) {
      return true;
    }
    return s.stream === 'General' || s.stream === stream || stream === 'General';
  });
}

/**
 * Returns the exact list of subjects a student is enrolled in for coaching.
 * If enrolledSubjectIds is not specified or empty, assumes all available subjects for class & stream & curriculum.
 */
export function getEnrolledSubjectsForStudent(student: Student, subjects: Subject[]): Subject[] {
  const available = getAvailableSubjectsForStudent(student.classLevel, student.stream, subjects, student.curriculum);
  const enrolledIds =
    student.subjectEnrollments && student.subjectEnrollments.length > 0
      ? student.subjectEnrollments.map((e) => e.subjectId)
      : student.enrolledSubjectIds;

  if (enrolledIds && enrolledIds.length > 0) {
    const enrolled = available.filter((s) => enrolledIds.includes(s.id));
    return enrolled.length > 0 ? enrolled : available;
  }
  return available;
}

export const ACADEMIC_SESSION_2026_MONTHS = [
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

export const ACADEMIC_SESSION_2027_MONTHS = [
  'January 2027',
  'February 2027',
  'March 2027',
  'April 2027',
  'May 2027',
  'June 2027',
  'July 2027',
  'August 2027',
  'September 2027',
  'October 2027',
  'November 2027',
  'December 2027',
] as const;

// CBSE (Classes 1–12) and W.B. Board Higher Secondary (Classes 11–12) follow April to March
export const APRIL_TO_MARCH_SESSION_2026_MONTHS = [
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026',
  'January 2027',
  'February 2027',
  'March 2027',
] as const;

export const APRIL_TO_MARCH_SESSION_2027_MONTHS = [
  'April 2027',
  'May 2027',
  'June 2027',
  'July 2027',
  'August 2027',
  'September 2027',
  'October 2027',
  'November 2027',
  'December 2027',
  'January 2028',
  'February 2028',
  'March 2028',
] as const;

export const CBSE_SESSION_2026_MONTHS = APRIL_TO_MARCH_SESSION_2026_MONTHS;
export const CBSE_SESSION_2027_MONTHS = APRIL_TO_MARCH_SESSION_2027_MONTHS;

export const ALL_ACADEMIC_SESSION_MONTHS = [
  ...ACADEMIC_SESSION_2026_MONTHS,
  ...ACADEMIC_SESSION_2027_MONTHS,
  'January 2028',
  'February 2028',
  'March 2028',
] as const;

// Default session months (Session 2026) maintained for backward-compatibility
export const ACADEMIC_SESSION_MONTHS = ACADEMIC_SESSION_2026_MONTHS;

export type AcademicSessionMonth = (typeof ALL_ACADEMIC_SESSION_MONTHS)[number];

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
  'January 2027': "Jan '27",
  'February 2027': "Feb '27",
  'March 2027': "Mar '27",
  'April 2027': "Apr '27",
  'May 2027': "May '27",
  'June 2027': "Jun '27",
  'July 2027': "Jul '27",
  'August 2027': "Aug '27",
  'September 2027': "Sep '27",
  'October 2027': "Oct '27",
  'November 2027': "Nov '27",
  'December 2027': "Dec '27",
  'January 2028': "Jan '28",
  'February 2028': "Feb '28",
  'March 2028': "Mar '28",
};

/**
 * Returns true if the given curriculum & class level follows an April-to-March academic session:
 * - CBSE (Classes 1 to 12): April to March
 * - W.B. Board (Classes 11 to 12 — WBCHSE): April to March
 * - W.B. Board (Classes 1 to 10 — WBBPE / WBBSE): January to December
 */
export function isAprilToMarchCalendar(
  curriculum?: CurriculumBoard | string,
  classLevel?: ClassLevel | string
): boolean {
  if (curriculum === 'CBSE') return true;
  if (curriculum === 'W.B. Board') {
    return classLevel === '11' || classLevel === '12';
  }
  return false;
}

/**
 * Returns the 12 academic session months for a given session ('2026' or '2027'), curriculum board, and optional class level.
 * - CBSE (Classes 1 to 12) & W.B. Board (Classes 11 to 12): April to March (2026 = Apr 2026–Mar 2027, 2027 = Apr 2027–Mar 2028)
 * - W.B. Board (Classes 1 to 10): January to December (2026 = Jan–Dec 2026, 2027 = Jan–Dec 2027)
 */
export function getSessionMonthsForBoard(
  session: '2026' | '2027' = '2026',
  curriculum?: CurriculumBoard | string,
  classLevel?: ClassLevel | string
): readonly string[] {
  if (isAprilToMarchCalendar(curriculum, classLevel)) {
    return session === '2027' ? APRIL_TO_MARCH_SESSION_2027_MONTHS : APRIL_TO_MARCH_SESSION_2026_MONTHS;
  }
  return session === '2027' ? ACADEMIC_SESSION_2027_MONTHS : ACADEMIC_SESSION_2026_MONTHS;
}

/**
 * Returns a human-readable academic session label for UI badges & documents.
 */
export function getSessionDisplayLabel(
  session: '2026' | '2027',
  curriculum?: CurriculumBoard | string,
  classLevel?: ClassLevel | string
): string {
  if (isAprilToMarchCalendar(curriculum, classLevel)) {
    return session === '2027' ? '2027–28 (Apr 2027 – Mar 2028)' : '2026–27 (Apr 2026 – Mar 2027)';
  }
  if (curriculum === 'W.B. Board') {
    if (classLevel) {
      return session === '2027' ? '2027 (Jan – Dec 2027)' : '2026 (Jan – Dec 2026)';
    }
    return session === '2027'
      ? '2027 (Cls 1–10 Jan–Dec / Cls 11–12 Apr–Mar)'
      : '2026 (Cls 1–10 Jan–Dec / Cls 11–12 Apr–Mar)';
  }
  if (classLevel === '11' || classLevel === '12') {
    return session === '2027' ? '2027–28 (Apr 2027 – Mar 2028)' : '2026–27 (Apr 2026 – Mar 2027)';
  }
  return session === '2027'
    ? '2027 (WB 1–10 Jan–Dec / CBSE & WB 11–12 Apr–Mar)'
    : '2026 (WB 1–10 Jan–Dec / CBSE & WB 11–12 Apr–Mar)';
}

/**
 * Resolves the academic session ('2026' or '2027') for a student.
 * CBSE (Classes 1–12) & W.B. Board (Classes 11–12) follow April to March (Jan–Mar 2027 belong to Session 2026–27).
 * W.B. Board (Classes 1–10) follows January to December.
 * Supports early admissions intake for Session 2027 commencing in November 2026.
 */
export function getStudentSession(student?: Student | null): '2026' | '2027' {
  if (!student) return '2026';
  if (student.academicSession === '2027' || (student.academicSession && student.academicSession.includes('2027'))) {
    return '2027';
  }
  if (student.academicSession === '2026' || (student.academicSession && student.academicSession.includes('2026'))) {
    return '2026';
  }

  const isAprMar = isAprilToMarchCalendar(student.curriculum || 'CBSE', student.classLevel);
  const isMonthInSession2027 = (m?: string) => {
    if (!m) return false;
    if (m.includes('2028')) return true;
    if (!isAprMar) return m.includes('2027');
    // For April-to-March sessions, Jan-Mar 2027 are the final quarter of Session 2026-27 (Apr 2026 - Mar 2027)
    return APRIL_TO_MARCH_SESSION_2027_MONTHS.some((aprMarM) => matchMonth(aprMarM, m));
  };

  // Check enrollment month
  if (isMonthInSession2027(student.enrollmentMonth)) return '2027';
  if (student.subjectEnrollments?.some((e) => isMonthInSession2027(e.enrollmentMonth))) return '2027';

  if (student.id?.startsWith('BA-2027-')) return '2027';

  // Check admission date
  if (student.admissionDate) {
    if (isAprMar) {
      if (student.admissionDate >= '2027-04-01') return '2027';
    } else {
      if (student.admissionDate.startsWith('2027')) return '2027';
    }
  }

  return '2026';
}

/**
 * Returns the 12 session months for a student's board, class level & academic session:
 * - CBSE (Classes 1–12) & W.B. Board (Classes 11–12): April to March (Session 2026 = Apr 2026–Mar 2027; Session 2027 = Apr 2027–Mar 2028)
 * - W.B. Board (Classes 1–10): January to December (Session 2026 = Jan–Dec 2026; Session 2027 = Jan–Dec 2027)
 */
export function getStudentSessionMonths(student?: Student | null): readonly string[] {
  const session = getStudentSession(student);
  return getSessionMonthsForBoard(session, student?.curriculum, student?.classLevel);
}

/**
 * Normalizes string representations of months for accurate matching
 * e.g., "April 2026", "April", "Apr 2026", "Apr", "January 2027"
 */
export function matchMonth(monthNameA: string, monthNameB: string): boolean {
  if (!monthNameA || !monthNameB) return false;
  const cleanA = monthNameA.trim().toLowerCase();
  const cleanB = monthNameB.trim().toLowerCase();
  if (cleanA === cleanB) return true;

  const partsA = cleanA.split(' ');
  const partsB = cleanB.split(' ');
  const prefixA = partsA[0].slice(0, 3);
  const prefixB = partsB[0].slice(0, 3);
  
  if (prefixA !== prefixB || prefixA.length < 3) return false;

  // If both have years, years must match
  if (partsA.length > 1 && partsB.length > 1) {
    return partsA[1] === partsB[1];
  }
  return true;
}

/**
 * Resolves normalized subject enrollments for a candidate.
 * If student has individual subject enrollment months, returns them.
 * Otherwise defaults all enrolled subjects to the student's admission/enrollment month.
 */
export function getStudentSubjectEnrollments(
  student?: Student | null,
  availableSubjects?: Subject[]
): StudentSubjectEnrollment[] {
  if (!student) return [];

  const defaultMonth = getStudentEnrollmentMonth(student);
  const sessionMonths = getStudentSessionMonths(student);

  // If explicit subjectEnrollments exists and has items
  if (student.subjectEnrollments && student.subjectEnrollments.length > 0) {
    return student.subjectEnrollments.map((enr) => {
      let matchedMonth = enr.enrollmentMonth;
      const inStudentSession = matchedMonth && sessionMonths.some((m) => matchMonth(m, matchedMonth));
      if (!matchedMonth || (!inStudentSession && !ALL_ACADEMIC_SESSION_MONTHS.some((m) => matchMonth(m, matchedMonth)))) {
        matchedMonth = defaultMonth;
      } else if (!inStudentSession && isAprilToMarchCalendar(student.curriculum, student.classLevel)) {
        matchedMonth = defaultMonth;
      }
      return {
        ...enr,
        enrollmentMonth: matchedMonth,
        status: enr.status || 'Active',
      };
    });
  }

  // Fallback to enrolledSubjectIds
  if (student.enrolledSubjectIds && student.enrolledSubjectIds.length > 0) {
    return student.enrolledSubjectIds.map((subId) => ({
      subjectId: subId,
      enrollmentMonth: defaultMonth,
      status: 'Active',
    }));
  }

  // Fallback to all available subjects if combo
  if (availableSubjects && availableSubjects.length > 0) {
    const classAvailable = getAvailableSubjectsForStudent(student.classLevel, student.stream, availableSubjects, student.curriculum);
    return classAvailable.map((sub) => ({
      subjectId: sub.id,
      enrollmentMonth: defaultMonth,
      status: 'Active',
    }));
  }

  return [];
}

/**
 * Resolves the academic session month name from a date string (e.g., '2026-04-12' -> 'April 2026')
 * respecting the curriculum board & class level calendar:
 * - CBSE (Classes 1–12) & W.B. Board (Classes 11–12): April to March (Session 2026 = Apr 2026–Mar 2027, Session 2027 = Apr 2027–Mar 2028)
 * - W.B. Board (Classes 1–10): January to December (admissions in Nov/Dec 2026 for 2027 start Jan 2027; Apr–Mar sessions start Apr 2027)
 */
export function getSessionMonthFromDate(
  dateStr?: string,
  targetSession?: string,
  curriculum?: CurriculumBoard | string,
  classLevel?: ClassLevel | string
): string {
  const isAprMar = isAprilToMarchCalendar(curriculum, classLevel);
  const is2027 = targetSession === '2027';
  const fallback = isAprMar
    ? is2027
      ? 'April 2027'
      : 'April 2026'
    : is2027
    ? 'January 2027'
    : 'January 2026';

  if (!dateStr) return fallback;
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    const year = parseInt(parts[0], 10);
    const monthNum = parseInt(parts[1], 10);
    if (!isNaN(year) && !isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      if (isAprMar) {
        if (is2027) {
          // Apr-Mar 2027-28 (Apr 2027 - Mar 2028): early intake before Apr 2027 commences April 2027
          if (year < 2027 || (year === 2027 && monthNum < 4)) {
            return 'April 2027';
          }
          if (year === 2027 && monthNum >= 4) {
            return APRIL_TO_MARCH_SESSION_2027_MONTHS[monthNum - 4] || 'April 2027';
          }
          if (year === 2028 && monthNum <= 3) {
            return APRIL_TO_MARCH_SESSION_2027_MONTHS[9 + (monthNum - 1)] || 'March 2028';
          }
          return 'March 2028';
        } else {
          // Apr-Mar 2026-27 (Apr 2026 - Mar 2027)
          if (year < 2026 || (year === 2026 && monthNum < 4)) {
            return 'April 2026';
          }
          if (year === 2026 && monthNum >= 4) {
            return APRIL_TO_MARCH_SESSION_2026_MONTHS[monthNum - 4] || 'April 2026';
          }
          if (year === 2027 && monthNum <= 3) {
            return APRIL_TO_MARCH_SESSION_2026_MONTHS[9 + (monthNum - 1)] || 'March 2027';
          }
          return 'March 2027';
        }
      }

      if (is2027) {
        // W.B. Board (Classes 1-10) admissions in Nov/Dec 2026 start classes in January 2027
        if (year === 2026 && monthNum >= 11) {
          return 'January 2027';
        }
        if (year === 2027) {
          return ACADEMIC_SESSION_2027_MONTHS[monthNum - 1] || 'January 2027';
        }
        return 'January 2027';
      }

      if (year === 2026) {
        return ACADEMIC_SESSION_2026_MONTHS[monthNum - 1] || 'January 2026';
      } else if (year === 2027) {
        return ACADEMIC_SESSION_2027_MONTHS[monthNum - 1] || 'January 2027';
      } else if (year < 2026) {
        return 'January 2026';
      } else if (year > 2027) {
        return 'December 2027';
      }
    }
  }
  return fallback;
}

/**
 * Returns the effective enrollment month for a specific subject of a student.
 */
export function getSubjectEffectiveMonth(student?: Student | null, subjectId?: string): string {
  if (!student) return 'January 2026';
  const sessionMonths = getStudentSessionMonths(student);
  if (student.subjectEnrollments && student.subjectEnrollments.length > 0 && subjectId) {
    const enr = student.subjectEnrollments.find((e) => e.subjectId === subjectId);
    if (enr && enr.enrollmentMonth) {
      const matched = sessionMonths.find((m) => matchMonth(m, enr.enrollmentMonth));
      if (matched) return matched;
      if (!isAprilToMarchCalendar(student.curriculum, student.classLevel)) {
        const anyMatched = ALL_ACADEMIC_SESSION_MONTHS.find((m) => matchMonth(m, enr.enrollmentMonth));
        if (anyMatched) return anyMatched;
      }
    }
  }
  return getStudentEnrollmentMonth(student);
}

/**
 * Resolves the earliest subject enrollment month for a candidate.
 * If individual subject enrollments exist, finds the earliest start month within their board's session.
 * Otherwise parses student admissionDate for their board & session.
 */
export function getStudentEnrollmentMonth(student?: Student | null): string {
  if (!student) return 'January 2026';
  const is2027 = getStudentSession(student) === '2027';
  const sessionMonths = getStudentSessionMonths(student);
  const defaultFallback = sessionMonths[0] || (is2027 ? 'January 2027' : 'January 2026');

  // Check if subjectEnrollments exist and pick the earliest valid enrollment month in the student's session
  if (student.subjectEnrollments && student.subjectEnrollments.length > 0) {
    let earliestIdx = 999;
    student.subjectEnrollments.forEach((enr) => {
      const idx = sessionMonths.findIndex((m) => matchMonth(m, enr.enrollmentMonth));
      if (idx >= 0 && idx < earliestIdx) {
        earliestIdx = idx;
      }
    });
    if (earliestIdx >= 0 && earliestIdx < sessionMonths.length) {
      return sessionMonths[earliestIdx];
    }
  }

  if (student.enrollmentMonth && typeof student.enrollmentMonth === 'string' && student.enrollmentMonth.trim()) {
    const matched = sessionMonths.find((m) => matchMonth(m, student.enrollmentMonth!));
    if (matched) return matched;
    if (!isAprilToMarchCalendar(student.curriculum, student.classLevel)) {
      const anyMatched = ALL_ACADEMIC_SESSION_MONTHS.find((m) => matchMonth(m, student.enrollmentMonth!));
      if (anyMatched) return anyMatched;
    }
  }

  if (student.admissionDate) {
    return getSessionMonthFromDate(student.admissionDate, is2027 ? '2027' : '2026', student.curriculum, student.classLevel);
  }

  return defaultFallback;
}

/**
 * Returns the list of academic session months applicable to this candidate
 * calculated strictly from their earliest subject enrollment month to the session end
 * (December 2026 for Session 2026, or December 2027 for Session 2027).
 */
export function getApplicableSessionMonthsForStudent(
  student?: Student | null,
  sessionMonths?: readonly string[]
): string[] {
  const months = sessionMonths || getStudentSessionMonths(student);
  const enrollmentMonth = getStudentEnrollmentMonth(student);
  const startIdx = months.findIndex((m) => matchMonth(m, enrollmentMonth));
  const effectiveStart = startIdx >= 0 ? startIdx : 0;
  return months.slice(effectiveStart) as string[];
}

/**
 * Returns the subjects that are active (enrolled on or before the given session month)
 * for a student in a specific academic session month.
 */
export function getStudentActiveSubjectsForMonth(
  student: Student,
  sessionMonth: string,
  subjects?: Subject[]
): { enrollment: StudentSubjectEnrollment; subject?: Subject }[] {
  const sessionMonths = getStudentSessionMonths(student);
  const targetIdx = sessionMonths.findIndex((m) => matchMonth(m, sessionMonth));
  if (targetIdx < 0) return [];

  const enrollments = getStudentSubjectEnrollments(student, subjects);
  const activeList: { enrollment: StudentSubjectEnrollment; subject?: Subject }[] = [];

  enrollments.forEach((enr) => {
    if (enr.status === 'Dropped') return;
    const enrIdx = sessionMonths.findIndex((m) => matchMonth(m, enr.enrollmentMonth));
    if (enrIdx >= 0 && enrIdx <= targetIdx) {
      const matchedSub = subjects?.find((s) => s.id === enr.subjectId);
      activeList.push({
        enrollment: enr,
        subject: matchedSub,
      });
    }
  });

  return activeList;
}

/**
 * Calculates the exact tuition rate for a specific student in a given academic session month,
 * taking into account how many subjects are currently active in that month.
 */
export function getStudentMonthTuitionRate(
  student: Student,
  sessionMonth: string,
  feeStructures: Record<string, FeeStructure> = DEFAULT_FEE_STRUCTURE,
  subjects?: Subject[]
): {
  month: string;
  activeSubjectCount: number;
  activeSubjectNames: string[];
  requiredTuition: number;
  isPreEnrollment: boolean;
} {
  const activeSubs = getStudentActiveSubjectsForMonth(student, sessionMonth, subjects);
  const activeCount = activeSubs.length;

  if (activeCount === 0) {
    return {
      month: sessionMonth,
      activeSubjectCount: 0,
      activeSubjectNames: [],
      requiredTuition: 0,
      isPreEnrollment: true,
    };
  }

  const structure = getFeeStructure(student.classLevel, student.stream, student.curriculum, feeStructures);
  const isPrimary = ['1', '2', '3', '4'].includes(student.classLevel);
  // For Primary (Classes 1-4), all subjects are one combined package:
  // W.B. Board: Rs 800 /- (one package); CBSE: Rs 1500 /- (one package)
  const tuition = isPrimary
    ? (structure.monthlyTuitionFee || (student.curriculum === 'W.B. Board' ? 800 : 1500))
    : activeCount * (structure.perSubjectMonthlyFee || (student.curriculum === 'W.B. Board' ? 350 : 800));

  const names = activeSubs.map((item) => item.subject?.name || item.enrollment.subjectId);

  return {
    month: sessionMonth,
    activeSubjectCount: activeCount,
    activeSubjectNames: names,
    requiredTuition: tuition,
    isPreEnrollment: false,
  };
}

/**
 * Determines whether a student is taking Single Subject, Multiple Subjects, or All Subjects Combo.
 */
export function getStudentCoachingMode(
  student: Student,
  subjects?: Subject[]
): 'Single Subject' | 'Multiple Subjects' | 'All Subjects Combo' {
  if (['1', '2', '3', '4'].includes(student.classLevel)) {
    return 'All Subjects Combo';
  }

  if (subjects && subjects.length > 0) {
    const available = getAvailableSubjectsForStudent(student.classLevel, student.stream, subjects, student.curriculum);
    const enrolled = getEnrolledSubjectsForStudent(student, subjects);
    if (enrolled.length === 1) return 'Single Subject';
    if (enrolled.length > 1 && enrolled.length < available.length) return 'Multiple Subjects';
    return 'All Subjects Combo';
  }

  const count = student.subjectEnrollments && student.subjectEnrollments.length > 0
    ? student.subjectEnrollments.length
    : student.enrolledSubjectIds ? student.enrolledSubjectIds.length : 0;

  if (count === 1) return 'Single Subject';
  if (count > 1 && count <= 4) return 'Multiple Subjects';
  return 'All Subjects Combo';
}

/**
 * Computes the annual fee summary for a student adhering to the institutional policy:
 * 1. Fees are calculated from subject enrollment month to session end (December 2026).
 *    Different subjects can be enrolled in different months, prorating tuition accurately!
 * 2. One-time fees (Admission Fee, Study Material & Lab Fee, Annual Development Fee) are submitted only once.
 */
export function computeStudentFeeSummary(
  student: Student,
  deposits: FeeDeposit[],
  feeStructures: Record<string, FeeStructure> = DEFAULT_FEE_STRUCTURE,
  subjects?: Subject[]
): StudentFeeSummary {
  const structure = getFeeStructure(student.classLevel, student.stream, student.curriculum, feeStructures);

  // Determine enrolled subject count & coaching mode
  const allEnrollments = getStudentSubjectEnrollments(student, subjects);
  const enrolledCount = Math.max(allEnrollments.length, 1);
  const coachingMode = getStudentCoachingMode(student, subjects);

  // Available subjects for proportional material fees
  let totalAvailableCount = 6;
  if (subjects && subjects.length > 0) {
    const available = getAvailableSubjectsForStudent(student.classLevel, student.stream, subjects, student.curriculum);
    totalAvailableCount = Math.max(available.length, 1);
  }

  // Calculate month-by-month tuition across the 12 session months
  const sessionMonths = getStudentSessionMonths(student);
  const isSession2027 = getStudentSession(student) === '2027';
  const sessionEndMonth = sessionMonths[sessionMonths.length - 1] || (isSession2027 ? 'December 2027' : 'December 2026');

  let totalTuitionForSession = 0;
  const monthWiseTuitionBreakdown = sessionMonths.map((m) => {
    const rate = getStudentMonthTuitionRate(student, m, feeStructures, subjects);
    totalTuitionForSession += rate.requiredTuition;
    return {
      month: m,
      activeCount: rate.activeSubjectCount,
      activeSubjectNames: rate.activeSubjectNames,
      monthlyTuition: rate.requiredTuition,
      isPreEnrollment: rate.isPreEnrollment,
    };
  });

  // Calculate applicable months from earliest subject enrollment month to session end
  const enrollmentMonth = getStudentEnrollmentMonth(student);
  const applicableMonths = getApplicableSessionMonthsForStudent(student, sessionMonths);
  const applicableMonthsCount = applicableMonths.length;

  // Active monthly tuition for current month or latest active rate
  const targetCurrentMonth = isSession2027
    ? (isAprilToMarchCalendar(student.curriculum, student.classLevel) ? 'April 2027' : 'January 2027')
    : 'September 2026';
  const activeNowBreakdown =
    monthWiseTuitionBreakdown.find((b) => matchMonth(b.month, targetCurrentMonth)) ||
    monthWiseTuitionBreakdown.filter((b) => !b.isPreEnrollment).slice(-1)[0] ||
    monthWiseTuitionBreakdown[0];
  const isPrimary = ['1', '2', '3', '4'].includes(student.classLevel);
  const fallbackTuition = isPrimary
    ? (structure.monthlyTuitionFee || (student.curriculum === 'W.B. Board' ? 800 : 1500))
    : enrolledCount * (structure.perSubjectMonthlyFee || (student.curriculum === 'W.B. Board' ? 350 : 800));
  const effectiveMonthlyTuition = activeNowBreakdown?.monthlyTuition || fallbackTuition;

  // One-time non-tuition fees (submitted only once per candidate)
  const admissionFee = structure.admissionFee;
  const annualDevFee = structure.annualDevelopmentFee ?? 50;

  // Materials & Lab fee: full package or proportional for single/multi subjects (One-time)
  const effectiveMaterialsFee = coachingMode === 'All Subjects Combo'
    ? (structure.materialsFee ?? 50)
    : Math.round((structure.materialsFee ?? 50) * (enrolledCount / (totalAvailableCount || 1)));

  // Exam fee terms: 2 terms for students enrolled in H1 (Jan-Jun), 1 term for students enrolled in H2 (Jul-Dec)
  const enrollmentMonthIdx = sessionMonths.findIndex((m) => matchMonth(m, enrollmentMonth));
  const applicableExamTerms = enrollmentMonthIdx <= 6 ? 2 : 1;
  const totalExamFee = structure.examFeePerTerm * applicableExamTerms;

  const totalNonTuition = admissionFee + totalExamFee + effectiveMaterialsFee + annualDevFee;

  // Total calculated fee for the session: (Sum of Tuition for all 12 Months) + One-Time Fees + Exam Terms
  const grossAnnual = totalTuitionForSession + totalNonTuition;

  const scholarshipDiscount = Math.round((grossAnnual * (student.scholarshipPercent || 0)) / 100);
  const netPayable = grossAnnual - scholarshipDiscount;

  const studentDeposits = deposits.filter((d) => d.studentId === student.id);
  const totalPaid = studentDeposits.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);
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
    totalTuitionFee: totalTuitionForSession,
    totalNonTuitionFee: totalNonTuition,
    totalDiscount: scholarshipDiscount,
    netPayable,
    totalPaid,
    dueAmount,
    feeStatus,
    lastPaymentDate: lastPayment ? lastPayment.depositDate : undefined,
    monthlyTuitionFee: effectiveMonthlyTuition,
    enrolledSubjectCount: enrolledCount,
    coachingMode,
    enrollmentMonth,
    applicableMonthsCount,
    sessionEndMonth,
    applicableMonths,
    subjectEnrollments: allEnrollments,
    monthWiseTuitionBreakdown,
  };
}

export interface NonTuitionFeeHeadStatus {
  head: string;
  category: 'Admission' | 'Exam' | 'MaterialLab' | 'AnnualDev';
  isOneTime: boolean;
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
 * are submitted or pending for a candidate. One-time fees are verified as submitted once.
 */
export function getStudentFeeHeadsSubmissionStatus(
  student: Student,
  deposits: FeeDeposit[],
  feeStructures: Record<string, FeeStructure> = DEFAULT_FEE_STRUCTURE,
  subjects?: Subject[]
): StudentFeeHeadsTracking {
  const structure = getFeeStructure(student.classLevel, student.stream, student.curriculum, feeStructures);
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
  const availableCount = subjects ? getAvailableSubjectsForStudent(student.classLevel, student.stream, subjects, student.curriculum).length : 6;
  const effectiveMaterialsFee = coachingMode === 'All Subjects Combo'
    ? (structure.materialsFee ?? 50)
    : Math.round((structure.materialsFee ?? 50) * (enrolledCount / (availableCount || 1)));

  const admissionRequired = structure.admissionFee || 100;
  const annualDevRequired = structure.annualDevelopmentFee ?? 50;
  const materialsRequired = effectiveMaterialsFee;

  const sessionMonths = getStudentSessionMonths(student);
  const enrollmentMonth = getStudentEnrollmentMonth(student);
  const enrollmentMonthIdx = sessionMonths.findIndex((m) => matchMonth(m, enrollmentMonth));
  const totalExamTerms = enrollmentMonthIdx <= 6 ? 2 : 1;
  const examRequired = (structure.examFeePerTerm || 100) * totalExamTerms;

  const examTermsPaid = Math.min(totalExamTerms, Math.floor(examPaid / Math.max(1, structure.examFeePerTerm || 50)));

  const admissionStatus: NonTuitionFeeHeadStatus = {
    head: 'Admission Fee',
    category: 'Admission',
    isOneTime: true,
    requiredAmount: admissionRequired,
    paidAmount: admissionPaid,
    isSubmitted: admissionPaid >= admissionRequired || admissionPaid > 0,
    lastPaymentDate: admissionLastDate,
    receiptNo: admissionLastReceipt,
  };

  const examStatus: NonTuitionFeeHeadStatus = {
    head: 'Exam Assessment Fee',
    category: 'Exam',
    isOneTime: false,
    requiredAmount: examRequired,
    paidAmount: examPaid,
    termsPaid: examTermsPaid,
    totalTerms: totalExamTerms,
    isSubmitted: examPaid >= examRequired || examTermsPaid >= totalExamTerms,
    lastPaymentDate: examLastDate,
    receiptNo: examLastReceipt,
  };

  const materialsStatus: NonTuitionFeeHeadStatus = {
    head: 'Study Material & Lab Fee',
    category: 'MaterialLab',
    isOneTime: true,
    requiredAmount: materialsRequired,
    paidAmount: materialsPaid,
    isSubmitted: materialsPaid >= materialsRequired || materialsPaid > 0,
    lastPaymentDate: materialsLastDate,
    receiptNo: materialsLastReceipt,
  };

  const annualDevStatus: NonTuitionFeeHeadStatus = {
    head: 'Annual Development Fee',
    category: 'AnnualDev',
    isOneTime: true,
    requiredAmount: annualDevRequired,
    paidAmount: annualDevPaid,
    isSubmitted: annualDevPaid >= annualDevRequired || annualDevPaid > 0,
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
  currentSessionMonth: string; // e.g. "September 2026" or "January 2027"
  enrollmentMonth: string; // e.g. "April 2026" or "January 2027"
  elapsedMonthsCount: number; // e.g. 9
  applicableElapsedMonthsCount: number; // e.g. 6 (April to September)
  applicableMonthsInSessionCount: number; // e.g. 9 (April to December)
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
 * Strictly adheres to:
 * - Tuition calculated from subject enrollment month to current month.
 * - For New Session 2027 admissions taken in Nov/Dec 2026, tuition begins in January 2027,
 *   while admission and non-tuition fees are immediately payable.
 * - One-time fees (Admission, Material & Lab, Annual Dev) submitted once.
 */
export function computeCandidateDuesTillCurrentMonth(
  student: Student,
  deposits: FeeDeposit[],
  currentSessionMonth?: string,
  feeStructures: Record<string, FeeStructure> = DEFAULT_FEE_STRUCTURE,
  subjects?: Subject[]
): CandidateCurrentMonthDuesSummary {
  const sessionMonths = getStudentSessionMonths(student);
  const is2027 = getStudentSession(student) === '2027';
  const isAprMar = isAprilToMarchCalendar(student.curriculum, student.classLevel);
  const defaultCurrentMonth = is2027
    ? (isAprMar ? 'April 2027' : 'January 2027')
    : 'September 2026';
  const effectiveMonthStr = currentSessionMonth || defaultCurrentMonth;

  const currentMonthIdx = sessionMonths.findIndex((m) => matchMonth(m, effectiveMonthStr));

  // If student is enrolled for 2027 session and current date is before session commencement
  // (2026 for W.B. Board, or 2026 / Jan–Mar 2027 for CBSE Apr–Mar), 0 tuition months have elapsed.
  const isPreSessionCommencement = is2027 && (effectiveMonthStr.includes('2026') || currentMonthIdx < 0);
  const effectiveCurrentIdx = isPreSessionCommencement ? -1 : (currentMonthIdx >= 0 ? currentMonthIdx : 0);
  const elapsedMonthsCount = effectiveCurrentIdx >= 0 ? effectiveCurrentIdx + 1 : 0;

  const enrollmentMonth = getStudentEnrollmentMonth(student);

  // Calculate tuition sum across elapsed months based on active subjects in each month
  let totalTuitionDueTillCurrentMonth = 0;
  const applicableElapsedMonths: string[] = [];

  if (effectiveCurrentIdx >= 0) {
    for (let i = 0; i <= effectiveCurrentIdx; i++) {
      const monthName = sessionMonths[i];
      const rate = getStudentMonthTuitionRate(student, monthName, feeStructures, subjects);
      totalTuitionDueTillCurrentMonth += rate.requiredTuition;
      if (!rate.isPreEnrollment) {
        applicableElapsedMonths.push(monthName);
      }
    }
  }

  const applicableElapsedMonthsCount = applicableElapsedMonths.length;
  const annualSummary = computeStudentFeeSummary(student, deposits, feeStructures, subjects);
  const monthlyTuition = annualSummary.monthlyTuitionFee;

  const structure = getFeeStructure(student.classLevel, student.stream, student.curriculum, feeStructures);
  const tracking = getStudentFeeHeadsSubmissionStatus(student, deposits, feeStructures, subjects);

  // One-time fees + applicable exam terms till current month
  const examFeeApplicable = structure.examFeePerTerm || 100;
  const nonTuitionDueTillCurrentMonth =
    structure.admissionFee +
    tracking.materialsAndLab.requiredAmount +
    tracking.annualDevelopment.requiredAmount +
    (isPreSessionCommencement ? 0 : examFeeApplicable);

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
  const monthsToEvaluate = effectiveCurrentIdx >= 0 ? sessionMonths.slice(0, effectiveCurrentIdx + 1) : [];
  const monthStatuses = getStudentTuitionMonthsStatus(
    student,
    deposits,
    monthsToEvaluate,
    feeStructures,
    subjects
  );
  const unpaidElapsed = monthStatuses
    .filter((s) => !s.isPreEnrollment && !s.isPaid)
    .map((s) => s.month);
  const paidElapsedCount = monthStatuses.filter((s) => !s.isPreEnrollment && s.isPaid).length;

  return {
    studentId: student.id,
    currentSessionMonth: effectiveCurrentIdx >= 0
      ? sessionMonths[effectiveCurrentIdx]
      : (is2027 ? (isAprMar ? 'Session 2027–28 Intake (Starts Apr 2027)' : 'Session 2027 Intake') : effectiveMonthStr),
    enrollmentMonth,
    elapsedMonthsCount,
    applicableElapsedMonthsCount,
    applicableMonthsInSessionCount: annualSummary.applicableMonthsCount || 12,
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

export interface StudentMonthTuitionStatus {
  month: string;
  shortMonth: string;
  isPaid: boolean;
  isPreEnrollment?: boolean; // True if this month has 0 active subjects enrolled
  activeSubjectCount?: number;
  activeSubjectNames?: string[];
  requiredTuition?: number;
  depositId?: string;
  receiptNo?: string;
  depositDate?: string;
  amountPaid?: number;
  paymentMode?: string;
  matchingDeposit?: FeeDeposit;
}

/**
 * Retrieves the month-by-month tuition payment status for a specific student,
 * respecting pre-enrollment months where tuition was not applicable and active subject counts.
 */
export function getStudentTuitionMonthsStatus(
  studentOrId: Student | string,
  deposits: FeeDeposit[],
  sessionMonths?: readonly string[],
  feeStructures: Record<string, FeeStructure> = DEFAULT_FEE_STRUCTURE,
  subjects?: Subject[]
): StudentMonthTuitionStatus[] {
  const studentId = typeof studentOrId === 'string' ? studentOrId : studentOrId.id;
  const student = typeof studentOrId === 'object' ? studentOrId : null;
  const effectiveMonths = sessionMonths || (student ? getStudentSessionMonths(student) : ACADEMIC_SESSION_MONTHS);

  // Find all tuition deposits for this student
  const studentTuitionDeposits = deposits.filter((d) => {
    if (d.studentId !== studentId) return false;
    const isTuition =
      d.feeHead === 'Tuition Fee' ||
      d.selectedFeeHeads?.includes('Tuition Fee') ||
      (d.monthsCovered && d.monthsCovered.length > 0);
    return isTuition;
  });

  return effectiveMonths.map((sessionMonth) => {
    let isPreEnrollment = false;
    let activeSubjectCount: number | undefined = undefined;
    let activeSubjectNames: string[] | undefined = undefined;
    let requiredTuition: number | undefined = undefined;

    if (student) {
      const rate = getStudentMonthTuitionRate(student, sessionMonth, feeStructures, subjects);
      isPreEnrollment = rate.isPreEnrollment;
      activeSubjectCount = rate.activeSubjectCount;
      activeSubjectNames = rate.activeSubjectNames;
      requiredTuition = rate.requiredTuition;
    } else {
      const enrollmentMonth = effectiveMonths[0] || 'January 2026';
      const enrollmentIdx = effectiveMonths.findIndex((m) => matchMonth(m, enrollmentMonth));
      const sessionIdx = effectiveMonths.findIndex((m) => matchMonth(m, sessionMonth));
      isPreEnrollment = sessionIdx >= 0 && sessionIdx < (enrollmentIdx >= 0 ? enrollmentIdx : 0);
    }

    const matchingDeposit = studentTuitionDeposits.find((d) =>
      d.monthsCovered?.some((covMonth) => matchMonth(covMonth, sessionMonth))
    );

    return {
      month: sessionMonth,
      shortMonth: MONTH_SHORT_NAMES[sessionMonth] || sessionMonth.slice(0, 3),
      isPaid: !!matchingDeposit,
      isPreEnrollment,
      activeSubjectCount,
      activeSubjectNames,
      requiredTuition,
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
 * Returns the first unpaid month for a student on or after their earliest subject enrollment month.
 */
export function getNextUnpaidTuitionMonth(
  studentOrId: Student | string,
  deposits: FeeDeposit[],
  sessionMonths?: readonly string[]
): string | null {
  const student = typeof studentOrId === 'object' ? studentOrId : null;
  const effectiveMonths = sessionMonths || (student ? getStudentSessionMonths(student) : ACADEMIC_SESSION_MONTHS);
  const statuses = getStudentTuitionMonthsStatus(studentOrId, deposits, effectiveMonths);
  const unpaid = statuses.find((s) => !s.isPreEnrollment && !s.isPaid);
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

  return sessionMonths.map((month) => {
    const applicableStudents = activeStudents.filter((student) =>
      getStudentSessionMonths(student).some((m) => matchMonth(m, month))
    );
    const totalApplicable = applicableStudents.length;
    let paidCount = 0;
    let totalCollected = 0;

    applicableStudents.forEach((student) => {
      const monthStatus = getStudentTuitionMonthsStatus(student, deposits, [month])[0];
      if (monthStatus?.isPaid) {
        paidCount++;
        if (monthStatus.matchingDeposit) {
          totalCollected += Number(monthStatus.matchingDeposit.amountPaid) || 0;
        }
      }
    });

    const unpaidCount = Math.max(0, totalApplicable - paidCount);
    const percentage = totalApplicable > 0 ? Math.round((paidCount / totalApplicable) * 100) : 0;

    return {
      month,
      shortMonth: MONTH_SHORT_NAMES[month] || month.slice(0, 3),
      totalStudents: totalApplicable,
      paidStudentsCount: paidCount,
      unpaidStudentsCount: unpaidCount,
      collectionPercentage: percentage,
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

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  if (num < 0) return 'Minus ' + numberToWords(Math.abs(num));

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = [
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertBelowThousand(n: number): string {
    let str = '';
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n >= 10) {
      str += teens[n - 10] + ' ';
      n = 0;
    }
    if (n > 0) {
      str += units[n] + ' ';
    }
    return str.trim();
  }

  let words = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remainder = Math.floor(num);

  if (crore > 0) {
    words += convertBelowThousand(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertBelowThousand(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertBelowThousand(thousand) + ' Thousand ';
  }
  if (remainder > 0) {
    words += convertBelowThousand(remainder);
  }

  return words.trim();
}


