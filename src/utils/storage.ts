import {
  AttendanceRecord,
  Faculty,
  Student,
  Subject,
  Exam,
  ExamResult,
  FeeDeposit,
  TimetableSlot,
  QuestionBankItem,
  AssignmentSet,
  PaymentDisbursement,
  InstitutionalAuthorizationConfig,
} from '../types';
import {
  INITIAL_ATTENDANCE,
  INITIAL_FACULTY,
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_EXAMS,
  INITIAL_RESULTS,
  INITIAL_DEPOSITS,
  INITIAL_TIMETABLE,
} from '../data/initialData';
import {
  INITIAL_QUESTION_BANK,
  INITIAL_ASSIGNMENT_SETS,
} from '../data/initialQuestionBankData';
import { INITIAL_DISBURSEMENTS } from '../data/initialDisbursementsData';

export const DEFAULT_AUTHORIZATION_CONFIG: InstitutionalAuthorizationConfig = {
  directorName: 'Mr. Sourav Dinda',
  directorDesignation: 'Director & Founder',
  directorAuthoritySubtext: 'Biley Academy Governing Board',

  academicHeadName: 'Prof. Ananya Sen',
  academicHeadDesignation: 'Academic Dean & Admissions Head',
  academicAuthoritySubtext: 'Biley Academy Academic Council',
  classMentorDefaultName: 'Prof. Ananya Sen',
  classMentorDefaultDesignation: 'Class Mentor & Faculty In-Charge',

  accountsSignatoryName: 'S. Dinda',
  accountsSignatoryDesignation: 'Chief Accounts Officer',
  accountsAuthoritySubtext: 'Biley Academy Treasury',
  defaultCollectedBy: 'Accounts Dept - S. Dinda',

  examControllerName: 'Mr. Soumyadip Dinda',
  examControllerDesignation: 'Controller of Examinations',
  preparedByFacultyName: 'Dr. Anirban Mukherjee',
  preparedByDesignation: 'Senior Faculty Specialist',

  sealInstitutionName: 'BILEY ACADEMY',
  sealVerificationText: 'AUTHORIZED & VERIFIED',

  isAdmissionLocked: false,
  admissionLockReason: '',
  isFeeDepositLocked: false,
  feeDepositLockReason: '',
  monthlyDisbursementBudgetCap: 350000,
  minimumProfitReserveTarget: 100000,
};

export interface AppStateData {
  students: Student[];
  faculty: Faculty[];
  subjects: Subject[];
  exams: Exam[];
  results: ExamResult[];
  deposits: FeeDeposit[];
  disbursements: PaymentDisbursement[];
  timetable: TimetableSlot[];
  attendance: AttendanceRecord[];
  questionBank: QuestionBankItem[];
  assignments: AssignmentSet[];
  authConfig?: InstitutionalAuthorizationConfig;
}

const STORAGE_KEYS = {
  STUDENTS: 'biley_academy_students_v1',
  FACULTY: 'biley_academy_faculty_v1',
  SUBJECTS: 'biley_academy_subjects_v1',
  EXAMS: 'biley_academy_exams_v1',
  RESULTS: 'biley_academy_results_v1',
  DEPOSITS: 'biley_academy_deposits_v1',
  DISBURSEMENTS: 'biley_academy_disbursements_v1',
  TIMETABLE: 'biley_academy_timetable_v1',
  ATTENDANCE: 'biley_academy_attendance_v1',
  QUESTION_BANK: 'biley_academy_question_bank_v1',
  ASSIGNMENTS: 'biley_academy_assignments_v1',
  AUTH_CONFIG: 'biley_academy_auth_config_v1',
};

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
}

export function saveItemToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

export function loadInitialState(): AppStateData {
  const loadedAuthConfig = loadFromStorage<InstitutionalAuthorizationConfig>(STORAGE_KEYS.AUTH_CONFIG, DEFAULT_AUTHORIZATION_CONFIG);
  if (loadedAuthConfig) {
    if (loadedAuthConfig.directorName === 'Dr. Birendra Nath Biley' || !loadedAuthConfig.directorName) {
      loadedAuthConfig.directorName = 'Mr. Sourav Dinda';
    }
    if (loadedAuthConfig.accountsSignatoryName === 'S. Mukherjee' || !loadedAuthConfig.accountsSignatoryName) {
      loadedAuthConfig.accountsSignatoryName = 'S. Dinda';
    }
    if (loadedAuthConfig.defaultCollectedBy === 'Accounts Dept - S. Mukherjee' || !loadedAuthConfig.defaultCollectedBy) {
      loadedAuthConfig.defaultCollectedBy = 'Accounts Dept - S. Dinda';
    }
  }

  const loadedSubjects = loadFromStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  // Filter out any obsolete subjects for standardized classes 1 to 12 that no longer exist in INITIAL_SUBJECTS
  const standardClassLevels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sanitizedLoadedSubjects = loadedSubjects.filter((sub) => {
    if (standardClassLevels.includes(sub.classLevel)) {
      return INITIAL_SUBJECTS.some((init) => init.id === sub.id);
    }
    return true;
  });

  // Merge and sync curriculum subjects into loaded subjects
  const subjectIdMap = new Set(sanitizedLoadedSubjects.map((s) => s.id));
  const mergedSubjects = sanitizedLoadedSubjects.map((sub) => {
    const initSub = INITIAL_SUBJECTS.find((s) => s.id === sub.id);
    if (initSub) {
      return {
        ...sub,
        name: initSub.name,
        code: initSub.code,
        textbook: initSub.textbook,
        description: initSub.description,
        facultyId: sub.facultyId || initSub.facultyId,
        weeklyHours: sub.weeklyHours || initSub.weeklyHours,
      };
    }
    return sub;
  });
  for (const initSub of INITIAL_SUBJECTS) {
    if (!subjectIdMap.has(initSub.id)) {
      mergedSubjects.push(initSub);
      subjectIdMap.add(initSub.id);
    }
  }

  const validSubjectIds = new Set(mergedSubjects.map((s) => s.id));

  const loadedFaculty = loadFromStorage<Faculty[]>(STORAGE_KEYS.FACULTY, INITIAL_FACULTY);
  // Ensure faculty assignedSubjectIds reflect updated curriculum subjects
  const mergedFaculty = loadedFaculty.map((fac) => {
    const initFac = INITIAL_FACULTY.find((f) => f.id === fac.id);
    if (initFac) {
      const combinedSubjectIds = Array.from(new Set([...(fac.assignedSubjectIds || []), ...(initFac.assignedSubjectIds || [])]))
        .filter((id) => validSubjectIds.has(id));
      if (
        fac.id === 'FAC-05' || fac.name === 'Mr. Rajeshwar Ghosh' ||
        fac.id === 'FAC-03' || fac.name === 'Dr. Debabrata Roy' ||
        fac.id === 'FAC-02' || fac.name === 'Prof. Sangeeta Sharma'
      ) {
        return {
          ...fac,
          ...initFac,
          assignedSubjectIds: combinedSubjectIds,
        };
      }
      return {
        ...fac,
        assignedSubjectIds: combinedSubjectIds,
      };
    }
    return {
      ...fac,
      assignedSubjectIds: (fac.assignedSubjectIds || []).filter((id) => validSubjectIds.has(id)),
    };
  });

  const loadedStudents = loadFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const sanitizedStudents = loadedStudents.map((st) => {
    if (standardClassLevels.includes(st.classLevel) && st.enrolledSubjectIds) {
      const filteredEnrolled = st.enrolledSubjectIds.filter((id) => validSubjectIds.has(id));
      if (filteredEnrolled.length === 0) {
        // Default to all subjects for that class
        const classSubs = mergedSubjects.filter((s) => s.classLevel === st.classLevel).map((s) => s.id);
        return {
          ...st,
          enrolledSubjectIds: classSubs,
        };
      }
      return {
        ...st,
        enrolledSubjectIds: filteredEnrolled,
      };
    }
    return st;
  });

  const loadedExams = loadFromStorage<Exam[]>(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
  const sanitizedExams = loadedExams.map((ex) => {
    const initEx = INITIAL_EXAMS.find((e) => e.id === ex.id);
    if (initEx && standardClassLevels.includes(ex.classLevel)) {
      return initEx;
    }
    return ex;
  });

  const loadedResults = loadFromStorage<ExamResult[]>(STORAGE_KEYS.RESULTS, INITIAL_RESULTS);
  const sanitizedResults = loadedResults.map((res) => {
    const initRes = INITIAL_RESULTS.find((r) => r.id === res.id);
    if (initRes && standardClassLevels.includes(res.classLevel)) {
      return initRes;
    }
    return res;
  });

  const loadedTimetable = loadFromStorage<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE);
  const sanitizedTimetable = loadedTimetable.map((slot) => {
    const initSlot = INITIAL_TIMETABLE.find((t) => t.id === slot.id);
    if (initSlot && standardClassLevels.includes(slot.classLevel)) {
      return initSlot;
    }
    return slot;
  });

  const loadedAttendance = loadFromStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  const sanitizedAttendance = loadedAttendance.map((att) => {
    const initAtt = INITIAL_ATTENDANCE.find((a) => a.id === att.id);
    if (initAtt && standardClassLevels.includes(att.classLevel)) {
      return initAtt;
    }
    return att;
  });

  return {
    students: sanitizedStudents,
    faculty: mergedFaculty,
    subjects: mergedSubjects,
    exams: sanitizedExams,
    results: sanitizedResults,
    deposits: loadFromStorage<FeeDeposit[]>(STORAGE_KEYS.DEPOSITS, INITIAL_DEPOSITS),
    disbursements: loadFromStorage<PaymentDisbursement[]>(STORAGE_KEYS.DISBURSEMENTS, INITIAL_DISBURSEMENTS),
    timetable: sanitizedTimetable,
    attendance: sanitizedAttendance,
    questionBank: loadFromStorage<QuestionBankItem[]>(STORAGE_KEYS.QUESTION_BANK, INITIAL_QUESTION_BANK),
    assignments: loadFromStorage<AssignmentSet[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENT_SETS),
    authConfig: loadedAuthConfig,
  };
}

export function saveToStorage(data: AppStateData): void {
  saveItemToStorage(STORAGE_KEYS.STUDENTS, data.students);
  saveItemToStorage(STORAGE_KEYS.FACULTY, data.faculty);
  saveItemToStorage(STORAGE_KEYS.SUBJECTS, data.subjects);
  saveItemToStorage(STORAGE_KEYS.EXAMS, data.exams);
  saveItemToStorage(STORAGE_KEYS.RESULTS, data.results);
  saveItemToStorage(STORAGE_KEYS.DEPOSITS, data.deposits);
  saveItemToStorage(STORAGE_KEYS.DISBURSEMENTS, data.disbursements);
  saveItemToStorage(STORAGE_KEYS.TIMETABLE, data.timetable);
  saveItemToStorage(STORAGE_KEYS.ATTENDANCE, data.attendance);
  saveItemToStorage(STORAGE_KEYS.QUESTION_BANK, data.questionBank);
  saveItemToStorage(STORAGE_KEYS.ASSIGNMENTS, data.assignments);
  if (data.authConfig) {
    saveItemToStorage(STORAGE_KEYS.AUTH_CONFIG, data.authConfig);
  }
}

export function resetToInitialMockData(): AppStateData {
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.FACULTY);
  localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
  localStorage.removeItem(STORAGE_KEYS.EXAMS);
  localStorage.removeItem(STORAGE_KEYS.RESULTS);
  localStorage.removeItem(STORAGE_KEYS.DEPOSITS);
  localStorage.removeItem(STORAGE_KEYS.DISBURSEMENTS);
  localStorage.removeItem(STORAGE_KEYS.TIMETABLE);
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  localStorage.removeItem(STORAGE_KEYS.QUESTION_BANK);
  localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
  localStorage.removeItem(STORAGE_KEYS.AUTH_CONFIG);
  return loadInitialState();
}

export interface BackupPayload {
  version: string;
  institution: string;
  curriculum: string;
  exportTimestamp: string;
  exportDateFormatted: string;
  counts: {
    students: number;
    faculty: number;
    subjects: number;
    exams: number;
    results: number;
    deposits: number;
    disbursements: number;
    timetable: number;
    attendance: number;
    questionBank: number;
    assignments: number;
  };
  data: AppStateData;
}

export function exportDatabaseBackup(data: AppStateData): { filename: string; sizeKb: string } {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const dateFormatted = now.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const payload: BackupPayload = {
    version: '2.3.0',
    institution: 'Biley Academy ERP System',
    curriculum: 'Standardized Classes 1 to 12 (Math, Physics, Chemistry, Biology, CS, CA, English, Question Bank, Fee Receipts, Ledgers & Profit Disbursements)',
    exportTimestamp: now.toISOString(),
    exportDateFormatted: dateFormatted,
    counts: {
      students: data.students.length,
      faculty: data.faculty.length,
      subjects: data.subjects.length,
      exams: data.exams.length,
      results: data.results.length,
      deposits: data.deposits.length,
      disbursements: (data.disbursements || []).length,
      timetable: data.timetable.length,
      attendance: (data.attendance || []).length,
      questionBank: (data.questionBank || []).length,
      assignments: (data.assignments || []).length,
    },
    data,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const filename = `biley_academy_db_backup_${now.toISOString().slice(0, 10)}_${now.getHours()}${now.getMinutes().toString().padStart(2, '0')}.json`;
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  const sizeKb = (new Blob([jsonString]).size / 1024).toFixed(1);
  return { filename, sizeKb };
}

export function parseDatabaseBackup(jsonString: string): AppStateData {
  const parsed = JSON.parse(jsonString);
  // Support both wrapped payload and direct AppStateData object
  const stateData: AppStateData = parsed.data ? parsed.data : parsed;

  if (
    !Array.isArray(stateData.students) ||
    !Array.isArray(stateData.faculty) ||
    !Array.isArray(stateData.subjects) ||
    !Array.isArray(stateData.exams) ||
    !Array.isArray(stateData.results) ||
    !Array.isArray(stateData.deposits) ||
    !Array.isArray(stateData.timetable)
  ) {
    throw new Error('Invalid database backup structure. Required entities are missing.');
  }

  // Ensure arrays exist with fallbacks
  if (!Array.isArray(stateData.disbursements)) {
    stateData.disbursements = INITIAL_DISBURSEMENTS;
  }
  if (!Array.isArray(stateData.attendance)) {
    stateData.attendance = [];
  }
  if (!Array.isArray(stateData.questionBank)) {
    stateData.questionBank = INITIAL_QUESTION_BANK;
  }
  if (!Array.isArray(stateData.assignments)) {
    stateData.assignments = INITIAL_ASSIGNMENT_SETS;
  }

  return stateData;
}

export function getEstimatedStorageUsage(): string {
  try {
    let totalLength = 0;
    for (const key of Object.values(STORAGE_KEYS)) {
      const val = localStorage.getItem(key);
      if (val) totalLength += val.length;
    }
    return (totalLength / 1024).toFixed(1) + ' KB';
  } catch {
    return '0.0 KB';
  }
}

export { STORAGE_KEYS };
