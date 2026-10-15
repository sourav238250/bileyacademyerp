import React, { useState } from 'react';
import {
  Student,
  Subject,
  Faculty,
  Exam,
  ExamResult,
  FeeDeposit,
  TimetableSlot,
  AttendanceRecord,
  AssignmentSet,
  QuestionBankItem,
  AdminUser,
} from '../../types';

import {
  formatCurrency,
  computeStudentFeeSummary,
  computeStudentAttendanceSummary,
  getEnrolledSubjectsForStudent,
  getStudentCoachingMode,
  getAttendanceStatusBadge,
  DEFAULT_FEE_STRUCTURE,
  ACADEMIC_SESSION_MONTHS,
  getStudentTuitionMonthsStatus,
} from '../../utils/academicUtils';
import { downloadAssignmentPDF } from '../../utils/pdfGenerator';
import { PrintPreviewModal } from '../question-bank/PrintPreviewModal';
import { loadFromStorage, saveItemToStorage } from '../../utils/storage';
import { InstituteLogo } from '../common/InstituteLogo';
import {
  GraduationCap,
  Award,
  CreditCard,
  Calendar,
  CalendarCheck,
  Clock,
  Printer,
  IdCard,
  BookOpen,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Check,
  XCircle,
  HelpCircle,
  FileCheck,
  Download,
  Paperclip,
  Tag,
  Smartphone,
  LogOut,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  RefreshCw,
  Users,
  Search,
  Eye,
} from 'lucide-react';

interface StudentPortalViewProps {
  students: Student[];
  subjects: Subject[];
  faculty: Faculty[];
  exams: Exam[];
  results: ExamResult[];
  deposits: FeeDeposit[];
  timetable: TimetableSlot[];
  attendance?: AttendanceRecord[];
  assignments?: AssignmentSet[];
  questionBank?: QuestionBankItem[];
  currentAdmin?: AdminUser | null;
  onOpenAdminLogin?: () => void;
  onOpenFeeDepositModal: (studentId: string) => void;
  onViewReceipt: (deposit: FeeDeposit) => void;
  onViewReportCard: (result: ExamResult) => void;
  onOpenIdCardModal: (student: Student) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  students,
  subjects,
  faculty,
  exams,
  results,
  deposits,
  timetable,
  attendance = [],
  assignments = [],
  questionBank = [],
  currentAdmin,
  onOpenAdminLogin,
  onOpenFeeDepositModal,
  onViewReceipt,
  onViewReportCard,
  onOpenIdCardModal,
}) => {
  // Authenticated Student State (persisted in localStorage)
  const [authenticatedStudentId, setAuthenticatedStudentId] = useState<string | null>(() => {
    return loadFromStorage<string | null>('biley_student_portal_auth_student_id', null);
  });

  const [mobileInput, setMobileInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('1234');
  const [matchedStudents, setMatchedStudents] = useState<Student[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [portalTab, setPortalTab] = useState<'overview' | 'academics' | 'attendance' | 'assignments' | 'exams' | 'fees'>('overview');
  const [previewAssignment, setPreviewAssignment] = useState<AssignmentSet | null>(null);

  // Staff Session Portal State
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffClassFilter, setStaffClassFilter] = useState('ALL');
  const [staffViewMode, setStaffViewMode] = useState<'directory' | 'phone_test'>('directory');

  // Helper to normalize phone numbers to last 10 digits
  const normalizePhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
  };

  const student = students.find((s) => s.id === authenticatedStudentId) || null;

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    const cleanNumber = normalizePhone(mobileInput);
    if (cleanNumber.length !== 10) {
      setLoginError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const matches = students.filter((s) => normalizePhone(s.contactNumber) === cleanNumber);
    if (matches.length === 0) {
      setLoginError(`Mobile number (+91 ${cleanNumber}) is not registered with any enrolled student in academy records.`);
      return;
    }

    if (matches.length > 1) {
      setMatchedStudents(matches);
      return;
    }

    setGeneratedOtp('1234');
    setIsOtpStep(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsVerifying(true);

    setTimeout(() => {
      if (otpInput !== generatedOtp && otpInput !== '1234') {
        setLoginError('Invalid verification code. Please enter the 4-digit OTP sent to your phone (Demo code: 1234).');
        setIsVerifying(false);
        return;
      }

      const cleanNumber = normalizePhone(mobileInput);
      const matched = students.find((s) => normalizePhone(s.contactNumber) === cleanNumber);
      if (matched) {
        saveItemToStorage('biley_student_portal_auth_student_id', matched.id);
        setAuthenticatedStudentId(matched.id);
        setIsOtpStep(false);
        setOtpInput('');
        setMobileInput('');
      } else {
        setLoginError('Student record could not be loaded.');
      }
      setIsVerifying(false);
    }, 250);
  };

  const handleInstantLogin = () => {
    setLoginError(null);
    const cleanNumber = normalizePhone(mobileInput);
    if (cleanNumber.length !== 10) {
      setLoginError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const matches = students.filter((s) => normalizePhone(s.contactNumber) === cleanNumber);
    if (matches.length === 0) {
      setLoginError(`Mobile number (+91 ${cleanNumber}) is not registered with any enrolled student in academy records.`);
      return;
    }

    if (matches.length > 1) {
      setMatchedStudents(matches);
      return;
    }

    const found = matches[0];
    saveItemToStorage('biley_student_portal_auth_student_id', found.id);
    setAuthenticatedStudentId(found.id);
    setMobileInput('');
  };

  const handleSelectStudent = (st: Student) => {
    saveItemToStorage('biley_student_portal_auth_student_id', st.id);
    setAuthenticatedStudentId(st.id);
    setMatchedStudents([]);
    setIsOtpStep(false);
    setMobileInput('');
  };

  const handleQuickLoginWithPhone = (phone: string) => {
    const clean = normalizePhone(phone);
    setMobileInput(clean);
    setLoginError(null);
    const matches = students.filter((s) => normalizePhone(s.contactNumber) === clean);
    if (matches.length === 1) {
      saveItemToStorage('biley_student_portal_auth_student_id', matches[0].id);
      setAuthenticatedStudentId(matches[0].id);
      setMobileInput('');
    } else if (matches.length > 1) {
      setMatchedStudents(matches);
    }
  };

  const handleLogoutStudent = () => {
    saveItemToStorage('biley_student_portal_auth_student_id', null);
    setAuthenticatedStudentId(null);
    setMobileInput('');
    setOtpInput('');
    setIsOtpStep(false);
    setMatchedStudents([]);
  };

  const sampleTestStudents = students.slice(0, 4);

  // When an authenticated Staff session is active and no student is currently chosen:
  // Render the Staff Student Portal Inspection Directory
  if (currentAdmin && !student) {
    const q = staffSearchQuery.toLowerCase().trim();
    const filteredStaffStudents = students.filter((s) => {
      const matchesSearch =
        q === '' ||
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.contactNumber.includes(q) ||
        s.classLevel.toLowerCase().includes(q) ||
        s.stream.toLowerCase().includes(q) ||
        s.guardianName.toLowerCase().includes(q);
      const matchesClass = staffClassFilter === 'ALL' || s.classLevel === staffClassFilter;
      return matchesSearch && matchesClass;
    });

    const uniqueClasses = (Array.from(new Set(students.map((s) => String(s.classLevel)))) as string[]).sort(
      (a: string, b: string) => parseInt(a, 10) - parseInt(b, 10)
    );

    return (
      <div className="space-y-6 max-w-6xl mx-auto my-4 animate-in fade-in zoom-in-95">
        {/* Institutional Staff Access Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <InstituteLogo size="md" variant="rounded" withBorder={true} withGlow={true} />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Staff Session Active</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentAdmin.email}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                  Student Portal — Staff Inspection Mode
                </h1>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Logged in as <strong>{currentAdmin.name}</strong> ({currentAdmin.role}). You have direct administrative clearance to inspect any student's portal view, check attendance records, report cards, fee statements, and syllabus assignments.
                </p>
              </div>
            </div>

            {/* Quick Dropdown Picker */}
            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 min-w-[280px]">
              <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2">
                Quick Student Selector:
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    saveItemToStorage('biley_student_portal_auth_student_id', e.target.value);
                    setAuthenticatedStudentId(e.target.value);
                  }
                }}
                defaultValue=""
                className="w-full py-2.5 px-3 bg-slate-900 border border-slate-600 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="" disabled>-- Select student to open portal --</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    [Class {st.classLevel}] {st.name} (Roll: {st.rollNo})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
                placeholder="Search by student name, roll no, mobile, class..."
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
              />
            </div>

            {/* Mode Toggle: Directory vs Mobile Test */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                onClick={() => setStaffViewMode('directory')}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  staffViewMode === 'directory'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Student Directory ({filteredStaffStudents.length})</span>
              </button>
              <button
                onClick={() => setStaffViewMode('phone_test')}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  staffViewMode === 'phone_test'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Simulate Phone Lookup</span>
              </button>
            </div>
          </div>

          {/* Class Filter Pills */}
          {staffViewMode === 'directory' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Class:</span>
              <button
                onClick={() => setStaffClassFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-all ${
                  staffClassFilter === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Classes ({students.length})
              </button>
              {uniqueClasses.map((cl) => (
                <button
                  key={cl}
                  onClick={() => setStaffClassFilter(cl)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-all ${
                    staffClassFilter === cl
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Class {cl}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Directory Cards Grid */}
        {staffViewMode === 'directory' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaffStudents.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-sm">No students match your search filter</p>
                <p className="text-xs text-slate-400 mt-1">Try searching for a different student name, roll number, or clear your class filter.</p>
              </div>
            ) : (
              filteredStaffStudents.map((st) => (
                <div
                  key={st.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 font-bold text-lg flex items-center justify-center shrink-0 border border-amber-200">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                            {st.name}
                          </h3>
                          <span className="text-[11px] text-slate-500 block">
                            Roll: <strong className="text-slate-800">{st.rollNo}</strong> • Class {st.classLevel} ({st.stream})
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {st.gender}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Mobile:</span>
                        <span className="font-mono font-bold text-slate-800">{st.contactNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Guardian:</span>
                        <span className="font-medium text-slate-800 truncate max-w-[150px]">{st.guardianName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => {
                        saveItemToStorage('biley_student_portal_auth_student_id', st.id);
                        setAuthenticatedStudentId(st.id);
                      }}
                      className="flex-1 py-2 px-3 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Student Portal</span>
                    </button>
                    <button
                      onClick={() => onOpenFeeDepositModal(st.id)}
                      title="Deposit Fee"
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenIdCardModal(st)}
                      title="View ID Card"
                      className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <IdCard className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Phone Lookup Simulator inside Staff Hub */
          <div className="max-w-xl mx-auto my-4 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>Simulate Student Mobile Lookup</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter a registered student mobile number to verify and open their portal directly in staff session:
            </p>
            <div className="flex gap-2">
              <input
                type="tel"
                maxLength={10}
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit mobile number"
                className="flex-1 px-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
              />
              <button
                type="button"
                onClick={handleInstantLogin}
                className="px-4 py-2 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Open Portal
              </button>
            </div>
            {loginError && (
              <p className="text-xs text-rose-600 font-medium mt-2">{loginError}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // If not in staff session and not authenticated with mobile number, show Student Mobile Login Gate
  if (!student) {
    return (
      <div className="max-w-xl mx-auto my-6 sm:my-10 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-slate-800 animate-in fade-in zoom-in-95">
        {/* Institutional Branding */}
        <div className="text-center mb-6">
          <div className="inline-block mb-3">
            <InstituteLogo size="lg" variant="rounded" withBorder={true} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Student & Parent Portal</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Student Mobile Login
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
            Please enter your registered 10-digit mobile number to access your student attendance records, exam results, report cards, syllabus, and fee receipts.
          </p>
        </div>

        {/* Error Notice */}
        {loginError && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{loginError}</div>
          </div>
        )}

        {/* Multiple Matched Students Selection (Siblings) */}
        {matchedStudents.length > 1 ? (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
              <strong>Multiple student records found!</strong> Please select your student profile to enter:
            </div>
            <div className="space-y-2.5">
              {matchedStudents.map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleSelectStudent(st)}
                  className="w-full p-4 bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm shadow-xs">
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-900">{st.name}</h4>
                      <p className="text-xs text-slate-500">
                        Class {st.classLevel} • {st.stream} • Roll: {st.rollNo}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700" />
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setMatchedStudents([]);
                setIsOtpStep(false);
              }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 underline mt-2 cursor-pointer"
            >
              Use a different mobile number
            </button>
          </div>
        ) : isOtpStep ? (
          /* OTP Verification Step */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Mobile Number</span>
                <span className="font-mono font-bold text-slate-800 text-sm">+91 {mobileInput}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOtpStep(false);
                  setOtpInput('');
                  setLoginError(null);
                }}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer"
              >
                Change
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verification code sent via SMS. <strong>(Demo OTP: {generatedOtp})</strong></span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Enter 4-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
                className="w-full tracking-widest text-center font-mono text-xl py-3 px-4 bg-white border-2 border-slate-300 rounded-xl focus:border-amber-500 focus:outline-none"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>Verify & Enter Student Portal</span>
            </button>
          </form>
        ) : (
          /* Mobile Number Input Form */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Registered Mobile Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-slate-500 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileInput}
                  onChange={(e) => {
                    setMobileInput(e.target.value.replace(/\D/g, ''));
                    setLoginError(null);
                  }}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-amber-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter the phone number registered during student admission.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="submit"
                disabled={isVerifying}
                className="py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Verify with OTP</span>
              </button>

              <button
                type="button"
                onClick={handleInstantLogin}
                disabled={isVerifying}
                className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Instant Mobile Login</span>
              </button>
            </div>
          </form>
        )}

        {/* Demo Student Mobile Numbers (Quick Testing) */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-2.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Quick Test Mobile Numbers (Sample Registered Students)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Click any enrolled student below to test instant mobile login:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sampleTestStudents.map((st) => (
              <button
                key={st.id}
                onClick={() => handleQuickLoginWithPhone(st.contactNumber)}
                className="p-2.5 bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="min-w-0">
                  <span className="font-bold text-xs text-slate-900 block truncate group-hover:text-amber-900">
                    {st.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Class {st.classLevel} • {st.stream}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-lg shrink-0">
                  {st.contactNumber.replace('+91', '').trim()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Security Privacy Notice */}
        <div className="mt-6 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[10px] text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Strict Academic Privacy: Individual report cards, attendance scores, fee receipts, and homework DPPs are visible only after verifying the student's registered mobile number.
          </span>
        </div>

        {/* Staff Session Login Gateway */}
        {onOpenAdminLogin && (
          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500 mb-2 font-medium">
              Are you an academy staff member, director, or teacher?
            </p>
            <button
              type="button"
              onClick={onOpenAdminLogin}
              id="student-portal-staff-session-login-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer border border-slate-700"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Log in to Authenticated Staff Session</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  const enrolledSubjects = getEnrolledSubjectsForStudent(student, subjects);
  const studentResults = results.filter((r) => r.studentId === student.id);
  const studentDeposits = deposits.filter((d) => d.studentId === student.id);
  const feeSummary = computeStudentFeeSummary(student, deposits, DEFAULT_FEE_STRUCTURE, subjects);
  const coachingMode = getStudentCoachingMode(student, subjects);
  const attendanceSummary = computeStudentAttendanceSummary(student, attendance, subjects, faculty);
  const studentAttendanceRecords = attendance.filter((a) => a.studentId === student.id);
  const studentAssignments = assignments.filter((a) => a.classLevel === student.classLevel);

  return (
    <div className="space-y-6">
      {/* Top Administrative Staff Session Bar */}
      {currentAdmin && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-2 border-emerald-500/40 text-white p-4 sm:p-5 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Authenticated Staff Session
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {currentAdmin.name} ({currentAdmin.role})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Staff Inspection Mode: Inspecting <strong>{student.name}</strong> (Roll: {student.rollNo}, Class {student.classLevel} {student.stream})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Switch Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Switch:</span>
              <select
                value={student.id}
                onChange={(e) => {
                  saveItemToStorage('biley_student_portal_auth_student_id', e.target.value);
                  setAuthenticatedStudentId(e.target.value);
                }}
                className="bg-transparent text-xs text-amber-300 font-bold focus:outline-none cursor-pointer max-w-[200px] truncate"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                    [Cl {st.classLevel}] {st.name} (Roll: {st.rollNo})
                  </option>
                ))}
              </select>
            </div>

            {/* Browse Directory Button */}
            <button
              onClick={() => {
                saveItemToStorage('biley_student_portal_auth_student_id', null);
                setAuthenticatedStudentId(null);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Browse All Students</span>
            </button>

            {/* Quick Staff Actions for Student */}
            <button
              onClick={() => onOpenFeeDepositModal(student.id)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Deposit fee for this student"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Deposit Fee</span>
            </button>

            <button
              onClick={() => onOpenIdCardModal(student)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Generate student ID card"
            >
              <IdCard className="w-3.5 h-3.5" />
              <span>ID Card</span>
            </button>
          </div>
        </div>
      )}

      {/* Student Banner Card */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 font-bold text-2xl flex items-center justify-center shadow-lg border-2 border-amber-300">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{student.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Class {student.classLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span>Roll No: <strong className="text-slate-200">{student.rollNo}</strong></span>
                <span>•</span>
                <span>Stream: <strong className="text-slate-200">{student.stream}</strong></span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">{coachingMode}</span>
              </p>
            </div>
          </div>

          {/* Authenticated Student Mobile Badge & Logout Action */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700 backdrop-blur-xs flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <div>
                <span className="text-[9px] text-emerald-400 uppercase font-bold tracking-wider block">
                  {currentAdmin ? 'Staff Inspection Mode' : 'Verified Mobile Access'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {student.contactNumber}
                </span>
              </div>
            </div>

            {currentAdmin ? (
              <button
                onClick={() => {
                  saveItemToStorage('biley_student_portal_auth_student_id', null);
                  setAuthenticatedStudentId(null);
                }}
                id="student-portal-switch-student-btn"
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs transition-all cursor-pointer shadow-xs"
                title="Return to Staff Student Directory"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Switch Student</span>
              </button>
            ) : (
              <button
                onClick={handleLogoutStudent}
                id="student-portal-logout-btn"
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/60 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Log out and switch mobile number"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>


        {/* Portal Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto custom-scrollbar scroll-smooth pb-1">
          {[
            { id: 'overview', label: 'My Academic Overview', icon: GraduationCap },
            { id: 'academics', label: `Enrolled Subjects (${enrolledSubjects.length})`, icon: BookOpen },
            { id: 'assignments', label: `Assignments & DPPs (${studentAssignments.length})`, icon: FileCheck },
            { id: 'attendance', label: `Daily Attendance (${attendanceSummary.attendancePercentage}%)`, icon: CalendarCheck },
            { id: 'exams', label: `Exams & Report Cards (${studentResults.length})`, icon: Award },
            { id: 'fees', label: `Fees & Receipts (${studentDeposits.length})`, icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = portalTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPortalTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400'
                    : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {portalTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Metrics & Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Class Batch & Slot</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{student.batch}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Fee Payment Status</span>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {feeSummary.dueAmount === 0 ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Fully Paid
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Due: {formatCurrency(feeSummary.dueAmount)}
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-slate-500">Paid: {formatCurrency(feeSummary.totalPaid)}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Attendance Score</span>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {attendanceSummary.totalClasses > 0 ? `${attendanceSummary.attendancePercentage}%` : '100%'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {attendanceSummary.presentCount} / {attendanceSummary.totalClasses} Lectures
                </p>
              </div>
            </div>

            {/* Attendance Track Summary in Overview */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  Daily Attendance Track
                </h3>
                <button
                  onClick={() => setPortalTab('attendance')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  View Details &rarr;
                </button>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${
                    attendanceSummary.attendancePercentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${attendanceSummary.attendancePercentage}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-900 font-semibold">
                  <span className="block text-[10px] uppercase font-bold text-emerald-700">Present</span>
                  {attendanceSummary.presentCount}
                </div>
                <div className="p-2 bg-rose-50 rounded-lg text-rose-900 font-semibold">
                  <span className="block text-[10px] uppercase font-bold text-rose-700">Absent</span>
                  {attendanceSummary.absentCount}
                </div>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-900 font-semibold">
                  <span className="block text-[10px] uppercase font-bold text-amber-700">Late</span>
                  {attendanceSummary.lateCount}
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-900 font-semibold">
                  <span className="block text-[10px] uppercase font-bold text-blue-700">Excused</span>
                  {attendanceSummary.excusedCount}
                </div>
              </div>
            </div>

            {/* Weekly Timetable Schedule */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                My Weekly Coaching Schedule
              </h3>

              {timetable.filter((t) => t.classLevel === student.classLevel).length === 0 ? (
                <p className="text-xs text-slate-400">No timetable slots scheduled for Class {student.classLevel} yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {timetable
                    .filter((t) => t.classLevel === student.classLevel)
                    .map((slot) => {
                      const sub = subjects.find((s) => s.id === slot.subjectId);
                      const fac = faculty.find((f) => f.id === slot.facultyId);
                      return (
                        <div
                          key={slot.id}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-indigo-700 block">{slot.day}</span>
                            <span className="font-semibold text-slate-900">{sub?.name || 'Class'}</span>
                            <p className="text-[10px] text-slate-500 mt-0.5">{fac?.name || 'Staff'} • {slot.room}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                            {slot.timeSlot}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

          </div>

          {/* Student Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 h-fit">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-20 h-20 rounded-full bg-slate-900 text-amber-400 font-bold text-2xl flex items-center justify-center mx-auto shadow-md mb-3">
                {student.name.charAt(0)}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{student.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{student.id}</p>
              
              <button
                onClick={() => onOpenIdCardModal(student)}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                <IdCard className="w-3.5 h-3.5 text-amber-400" /> View Digital ID Card
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p><span className="text-slate-400">Guardian:</span> <strong>{student.guardianName}</strong></p>
              <p><span className="text-slate-400">Contact:</span> <strong>{student.contactNumber}</strong></p>
              <p><span className="text-slate-400">Email:</span> {student.email}</p>
              <p><span className="text-slate-400">Admission Date:</span> {student.admissionDate}</p>
              <p><span className="text-slate-400">Scholarship:</span> <strong className="text-amber-700">{student.scholarshipPercent}% Concession</strong></p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => onOpenFeeDepositModal(student.id)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                Deposit Fee Installment
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Enrolled Subjects */}
      {portalTab === 'academics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolledSubjects.map((sub) => {
            const assignedTeacher = faculty.find((f) => f.id === sub.facultyId);
            return (
              <div
                key={sub.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      {sub.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{sub.name}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{sub.weeklyHours}h/wk</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl text-xs flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-amber-300 font-bold flex items-center justify-center text-xs">
                    {assignedTeacher?.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Faculty Mentor</span>
                    <strong className="text-slate-800">{assignedTeacher?.name || 'Assigned Staff'}</strong>
                  </div>
                </div>

                {sub.textbook && (
                  <p className="text-[11px] text-slate-500">
                    <strong className="text-slate-700">Book:</strong> {sub.textbook}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Attendance Track & Lesson History */}
      {portalTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              Subject-Wise Attendance Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Faculty Mentor</th>
                    <th className="py-3 px-4 text-center">Lectures Attended</th>
                    <th className="py-3 px-4 text-center">Attendance Rate</th>
                    <th className="py-3 px-4">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceSummary.subjectWise.map((stat) => (
                    <tr key={stat.subjectId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{stat.subjectName}</td>
                      <td className="py-3 px-4 text-slate-500">{stat.facultyName}</td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-800">
                        {stat.presentCount} / {stat.totalClasses}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            stat.percentage >= 75
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {stat.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${
                              stat.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${stat.percentage}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Lesson Log & History */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              Recent Lecture History & Topics Covered
            </h3>

            {studentAttendanceRecords.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">No individual lecture logs recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {studentAttendanceRecords.map((rec) => {
                  const sub = subjects.find((s) => s.id === rec.subjectId);
                  const fac = faculty.find((f) => f.id === rec.facultyId);
                  const badge = getAttendanceStatusBadge(rec.status);

                  return (
                    <div key={rec.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{sub?.name || 'Class Session'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">• {rec.date}</span>
                        </div>
                        {rec.topicCovered && (
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            <strong className="text-slate-700">Topic:</strong> {rec.topicCovered}
                          </p>
                        )}
                        {rec.remarks && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Note: {rec.remarks}</p>
                        )}
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}>
                        {rec.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Exams & Report Cards */}
      {portalTab === 'exams' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Examinations & Official Scorecards</h3>
            </div>

            {studentResults.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No exam results published for this student yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {studentResults.map((res) => {
                  const exam = exams.find((e) => e.id === res.examId);
                  return (
                    <div
                      key={res.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">{exam?.examType || 'Term Test'}</span>
                        <h4 className="font-bold text-slate-900 text-sm">{exam?.name || 'Evaluation Exam'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Score: <strong className="text-slate-800">{res.totalMarksObtained} / {res.totalMaxMarks}</strong> ({res.percentage}%) • Grade: <span className="font-bold text-indigo-700">{res.grade}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => onViewReportCard(res)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" /> View / Print Report Card
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Assignments & DPP Question Sets */}
      {portalTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Class {student.classLevel} Homework, DPPs & Practice Papers ({studentAssignments.length})
            </h3>
            <span className="text-xs text-slate-500">Download formatted PDFs for printing</span>
          </div>

          {studentAssignments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-xs">
                No assignments or question sets currently published for Class {student.classLevel}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentAssignments.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 font-bold rounded-md text-[10px]">
                        {a.subjectName}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        a.difficulty === 'Easy'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : a.difficulty === 'Medium'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}>
                        {a.difficulty}
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-sm">{a.title}</h4>
                    <p className="text-slate-500 text-xs">Chapter: {a.chapter}</p>

                    {a.topicTags && a.topicTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        {a.topicTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Marks</span>
                      <span className="font-black text-emerald-700">{a.totalMarks}M</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Questions</span>
                      <span className="font-bold text-slate-800">
                        {(a.questionIds?.length || 0) + (a.customQuestions?.length || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Time</span>
                      <span className="font-bold text-slate-800">{a.timeAllowedMinutes || 45}m</span>
                    </div>
                  </div>

                  {a.attachmentFileName && a.attachmentData && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-blue-950 truncate text-[11px]">{a.attachmentFileName}</span>
                      </div>
                      <a
                        href={a.attachmentData}
                        download={a.attachmentFileName}
                        className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200"
                      >
                        Download File
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setPreviewAssignment(a)}
                      className="flex-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Download PDF / Print</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Fees & Receipts */}
      {portalTab === 'fees' && (
        <div className="space-y-6">
          
          {/* Fee Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Annual Tuition Payable</span>
              <p className="text-base font-bold text-slate-900 mt-1">{formatCurrency(feeSummary.netPayable)}</p>
              <p className="text-[10px] text-slate-500">Monthly: {formatCurrency(feeSummary.monthlyTuitionFee)}/mo</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-emerald-600">Total Deposited</span>
              <p className="text-base font-bold text-emerald-700 mt-1">{formatCurrency(feeSummary.totalPaid)}</p>
              <p className="text-[10px] text-slate-500">{studentDeposits.length} Payment(s) Cleared</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-rose-600">Outstanding Due</span>
              <p className="text-base font-bold text-rose-700 mt-1">{formatCurrency(feeSummary.dueAmount)}</p>
              <p className="text-[10px] text-slate-500">Status: {feeSummary.feeStatus}</p>
            </div>
          </div>

          {/* Academic Session Monthly Tuition Fee Tracker Card */}
          {(() => {
            const monthsStatus = getStudentTuitionMonthsStatus(student, deposits);
            const applicableStatus = monthsStatus.filter((m) => !m.isPreEnrollment);
            const paidCount = applicableStatus.filter((m) => m.isPaid).length;
            const dueCount = applicableStatus.length - paidCount;

            return (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      Academic Session Monthly Tuition Track (Jan – Dec 2026)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fees calculated from subject enrollment months to session end (Dec 2026) • Current Active Rate: {formatCurrency(feeSummary.monthlyTuitionFee)}/month
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                      ✓ {paidCount} / {applicableStatus.length} Cleared
                    </span>
                    {dueCount > 0 && (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
                        ⏳ {dueCount} Due
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {monthsStatus.map((m) => (
                    <div
                      key={m.month}
                      className={`p-3 rounded-xl border transition-all ${
                        m.isPreEnrollment
                          ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-75'
                          : m.isPaid
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-2xs'
                          : 'bg-amber-50/50 border-amber-200/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{m.shortMonth}</span>
                        {m.isPreEnrollment ? (
                          <span className="text-[9px] text-slate-400 font-bold bg-slate-200/70 px-1.5 py-0.2 rounded">
                            N/A
                          </span>
                        ) : m.isPaid ? (
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-100/80 px-1.5 py-0.2 rounded">
                            Due
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">{m.month.split(' ')[1]}</p>
                      {m.isPreEnrollment ? (
                        <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[9px] text-slate-400">
                          <span>Pre-enrollment</span>
                        </div>
                      ) : m.isPaid ? (
                        <div className="mt-2 pt-1.5 border-t border-emerald-200/60 text-[10px]">
                          <p className="font-semibold text-emerald-800 truncate">{m.receiptNo || 'Cleared'}</p>
                          <p className="text-emerald-700 font-bold">{formatCurrency(m.amountPaid || m.requiredTuition || feeSummary.monthlyTuitionFee)}</p>
                        </div>
                      ) : (
                        <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-600">
                          <span>Payable: <strong className="text-slate-900 font-bold">{formatCurrency(m.requiredTuition || feeSummary.monthlyTuitionFee)}</strong></span>
                          {m.activeSubjectCount !== undefined && (
                            <span className="block text-[8.5px] text-slate-400 mt-0.5 font-medium">({m.activeSubjectCount} subjects)</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Receipts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Official Money Receipts</h3>
              <button
                onClick={() => onOpenFeeDepositModal(student.id)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
              >
                <CreditCard className="w-3.5 h-3.5" /> Deposit Fee
              </button>
            </div>

            {studentDeposits.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No fee deposits logged yet for this student.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {studentDeposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        {dep.receiptNo}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{formatCurrency(dep.amount)}</h4>
                      <p className="text-xs text-slate-500">
                        Paid on {dep.depositDate} via {dep.paymentMode} • {dep.periodCovered}
                      </p>
                    </div>

                    <button
                      onClick={() => onViewReceipt(dep)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" /> Print Official Receipt
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Print Preview & PDF Modal for Student */}
      {previewAssignment && (
        <PrintPreviewModal
          isOpen={!!previewAssignment}
          onClose={() => setPreviewAssignment(null)}
          assignment={previewAssignment}
          allQuestions={questionBank}
        />
      )}

    </div>
  );
};
