import React, { useState, useMemo } from 'react';
import {
  Student,
  FeeDeposit,
  ClassLevel,
  StreamType,
  Subject,
  InstitutionalAuthorizationConfig,
  AdminUser,
} from '../../types';
import {
  ACADEMIC_SESSION_2026_MONTHS,
  ACADEMIC_SESSION_2027_MONTHS,
  MONTH_SHORT_NAMES,
  getStudentTuitionMonthsStatus,
  getTuitionMonthCollectionStats,
  getNextUnpaidTuitionMonth,
  getStudentFeeHeadsSubmissionStatus,
  getStudentEnrollmentMonth,
  getApplicableSessionMonthsForStudent,
  getStudentSession,
  getStudentSessionMonths,
  getSessionMonthsForBoard,
  getSessionDisplayLabel,
  isAprilToMarchCalendar,
  matchMonth,
  formatCurrency,
  CLASS_LEVELS,
} from '../../utils/academicUtils';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Download,
  Receipt,
  CreditCard,
  User,
  BookOpen,
  ArrowUpDown,
  Sparkles,
  ChevronRight,
  Eye,
  RefreshCw,
  Award,
  Layers,
  FlaskConical,
  GraduationCap,
} from 'lucide-react';

interface MonthlyTuitionTrackerProps {
  students: Student[];
  deposits: FeeDeposit[];
  subjects?: Subject[];
  currentAdmin?: AdminUser | null;
  onOpenFeeDepositModal: (studentId: string, preselectedMonth?: string) => void;
  onViewReceipt: (deposit: FeeDeposit) => void;
  authConfig?: InstitutionalAuthorizationConfig;
}

export const MonthlyTuitionTracker: React.FC<MonthlyTuitionTrackerProps> = ({
  students,
  deposits,
  subjects,
  onOpenFeeDepositModal,
  onViewReceipt,
  authConfig,
}) => {
  const [selectedSession, setSelectedSession] = useState<'2026' | '2027'>('2026');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DEFICIT' | 'CLEARED' | 'CURRENT_DUE'>('ALL');
  const [selectedFocusMonth, setSelectedFocusMonth] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'class' | 'paidCount' | 'dues'>('class');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const displayedSessionMonths = useMemo(() => {
    const classArg = selectedClass === 'ALL' ? undefined : selectedClass;
    if (selectedCurriculum === 'CBSE') {
      return getSessionMonthsForBoard(selectedSession, 'CBSE', classArg);
    }
    if (selectedCurriculum === 'W.B. Board' && selectedClass !== 'ALL') {
      return getSessionMonthsForBoard(selectedSession, 'W.B. Board', selectedClass);
    }
    if (selectedClass === '11' || selectedClass === '12') {
      // Both CBSE and W.B. Board Classes 11-12 follow April to March
      return getSessionMonthsForBoard(selectedSession, 'CBSE', selectedClass);
    }
    if (selectedSession === '2027') {
      return [...ACADEMIC_SESSION_2027_MONTHS, 'January 2028', 'February 2028', 'March 2028'] as const;
    }
    return [...ACADEMIC_SESSION_2026_MONTHS, 'January 2027', 'February 2027', 'March 2027'] as const;
  }, [selectedSession, selectedCurriculum, selectedClass]);

  const activeSessionStudents = useMemo(() => {
    return students.filter((s) => {
      if (s.status !== 'Active') return false;
      if (getStudentSession(s) !== selectedSession) return false;
      if (selectedCurriculum !== 'ALL' && (s.curriculum || 'CBSE') !== selectedCurriculum) return false;
      return true;
    });
  }, [students, selectedSession, selectedCurriculum]);

  // Compute stats for displayed academic months
  const monthlyStats = useMemo(() => {
    return getTuitionMonthCollectionStats(activeSessionStudents, deposits, displayedSessionMonths);
  }, [activeSessionStudents, deposits, displayedSessionMonths]);

  // Overall session summary
  const sessionSummary = useMemo(() => {
    let totalMonthsPaid = 0;
    let totalMonthsPossible = 0;

    let admissionSubmittedCount = 0;
    let examFeeSubmittedCount = 0;
    let studyMaterialLabSubmittedCount = 0;
    let annualDevSubmittedCount = 0;

    activeSessionStudents.forEach((student) => {
      const stMonths = getStudentSessionMonths(student);
      const applicable = getApplicableSessionMonthsForStudent(student, stMonths);
      totalMonthsPossible += applicable.length;
      const monthStatuses = getStudentTuitionMonthsStatus(student, deposits, stMonths, undefined, subjects);
      totalMonthsPaid += monthStatuses.filter((m) => !m.isPreEnrollment && m.isPaid).length;

      const heads = getStudentFeeHeadsSubmissionStatus(student, deposits, undefined, subjects);
      if (heads.admission.isSubmitted) admissionSubmittedCount++;
      if (heads.exam.isSubmitted) examFeeSubmittedCount++;
      if (heads.materialsAndLab.isSubmitted) studyMaterialLabSubmittedCount++;
      if (heads.annualDevelopment.isSubmitted) annualDevSubmittedCount++;
    });

    const overallPace = totalMonthsPossible > 0 ? Math.round((totalMonthsPaid / totalMonthsPossible) * 100) : 0;
    const activeIds = new Set(activeSessionStudents.map((s) => s.id));
    const totalCollectedAmount = deposits
      .filter((d) => activeIds.has(d.studentId) && (d.feeHead === 'Tuition Fee' || d.selectedFeeHeads?.includes('Tuition Fee')))
      .reduce((sum, d) => sum + d.amountPaid, 0);

    return {
      totalActiveStudents: activeSessionStudents.length,
      totalMonthsPaid,
      totalMonthsPossible,
      overallPace,
      totalCollectedAmount,
      admissionSubmittedCount,
      examFeeSubmittedCount,
      studyMaterialLabSubmittedCount,
      annualDevSubmittedCount,
    };
  }, [activeSessionStudents, deposits, subjects]);

  // Process student tuition month rows
  const studentRows = useMemo(() => {
    return activeSessionStudents.map((student) => {
      const studentMonths = getStudentSessionMonths(student);
      const enrollmentMonth = getStudentEnrollmentMonth(student);
      const applicableMonths = getApplicableSessionMonthsForStudent(student, studentMonths);
      const applicableCount = applicableMonths.length;
      const ownMonthStatuses = getStudentTuitionMonthsStatus(student, deposits, studentMonths, undefined, subjects);
      const paidCount = ownMonthStatuses.filter((m) => !m.isPreEnrollment && m.isPaid).length;
      const unpaidCount = Math.max(0, applicableCount - paidCount);
      const nextUnpaid = getNextUnpaidTuitionMonth(student, deposits, studentMonths);
      const feeHeadsStatus = getStudentFeeHeadsSubmissionStatus(student, deposits, undefined, subjects);

      const monthStatuses = displayedSessionMonths.map((month) => {
        const own = ownMonthStatuses.find((m) => matchMonth(m.month, month));
        if (own) return { ...own, isOutOfBoardCalendar: false };
        return {
          month,
          shortMonth: MONTH_SHORT_NAMES[month] || month.slice(0, 3),
          isPaid: false,
          isPreEnrollment: true,
          isOutOfBoardCalendar: true,
        };
      });

      const enrolledCount = student.enrolledSubjectIds && student.enrolledSubjectIds.length > 0
        ? student.enrolledSubjectIds.length
        : 4;

      return {
        student,
        enrollmentMonth,
        applicableCount,
        monthStatuses,
        paidCount,
        unpaidCount,
        nextUnpaid,
        enrolledCount,
        feeHeadsStatus,
      };
    });
  }, [activeSessionStudents, deposits, displayedSessionMonths, subjects]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return studentRows.filter(({ student, monthStatuses, unpaidCount }) => {
      // Class filter
      if (selectedClass !== 'ALL' && student.classLevel !== selectedClass) {
        return false;
      }
      // Stream filter
      if (selectedStream !== 'ALL' && student.stream !== selectedStream) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          student.name.toLowerCase().includes(q) ||
          student.id.toLowerCase().includes(q) ||
          student.rollNo.toLowerCase().includes(q) ||
          student.guardianName.toLowerCase().includes(q) ||
          student.contactNumber.includes(q);
        if (!matches) return false;
      }
      // Status filter
      if (statusFilter === 'DEFICIT' && unpaidCount === 0) return false;
      if (statusFilter === 'CLEARED' && unpaidCount > 0) return false;
      if (statusFilter === 'CURRENT_DUE') {
        const currentMonthName = selectedSession === '2027'
          ? (isAprilToMarchCalendar(student.curriculum || 'CBSE', student.classLevel) ? 'April 2027' : 'January 2027')
          : 'September 2026';
        const currentStatus = monthStatuses.find((m) => matchMonth(m.month, currentMonthName));
        if (!currentStatus || currentStatus.isPreEnrollment || currentStatus.isPaid) return false;
      }
      // Focus month filter
      if (selectedFocusMonth !== 'ALL') {
        const monthMatch = monthStatuses.find((m) => m.month === selectedFocusMonth);
        if (!monthMatch || monthMatch.isPreEnrollment || monthMatch.isPaid) return false;
      }

      return true;
    }).sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') {
        cmp = a.student.name.localeCompare(b.student.name);
      } else if (sortBy === 'class') {
        cmp = parseInt(a.student.classLevel, 10) - parseInt(b.student.classLevel, 10);
      } else if (sortBy === 'paidCount') {
        cmp = a.paidCount - b.paidCount;
      } else if (sortBy === 'dues') {
        cmp = a.unpaidCount - b.unpaidCount;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [studentRows, selectedClass, selectedStream, searchQuery, statusFilter, selectedFocusMonth, sortBy, sortOrder, selectedSession]);

  // Export Matrix to CSV
  const handleExportCSV = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Board',
      'Session',
      'Class Level',
      'Stream',
      'Roll No',
      'Contact',
      'Paid Months Count',
      'Unpaid Months Count',
      'Next Due Month',
      ...displayedSessionMonths,
    ];

    const rows = filteredRows.map(({ student, monthStatuses, paidCount, unpaidCount, nextUnpaid }) => {
      const monthCols = monthStatuses.map((m) =>
        m.isPreEnrollment ? 'N/A' : m.isPaid ? `PAID (${m.receiptNo || 'Yes'})` : 'DUE'
      );
      return [
        student.id,
        `"${student.name}"`,
        student.curriculum || 'CBSE',
        getSessionDisplayLabel(getStudentSession(student), student.curriculum, student.classLevel),
        `Class ${student.classLevel}`,
        student.stream,
        student.rollNo,
        student.contactNumber,
        paidCount,
        unpaidCount,
        nextUnpaid || 'Fully Cleared',
        ...monthCols,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `biley_academy_monthly_tuition_tracker_${selectedSession}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-2xl p-5 sm:p-6 text-white shadow-xl border border-amber-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase rounded-md tracking-wider">
                Financial Operations
              </span>
              <span className="px-2 py-0.5 bg-white/10 text-amber-300 text-[10px] font-mono rounded">
                {getSessionDisplayLabel(
                  selectedSession,
                  selectedCurriculum === 'ALL' ? undefined : selectedCurriculum,
                  selectedClass === 'ALL' ? undefined : selectedClass
                )}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-400" />
              Monthly Tuition Fee Tracking Matrix
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Real-time audit of monthly coaching tuition collections across board-aligned 12-month calendars (<strong>CBSE Cls 1–12 &amp; W.B. Board Cls 11–12: April – March</strong>; <strong>W.B. Board Cls 1–10: January – December</strong>). Identify pending months and collect dues with one click.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 bg-white/5 p-3 rounded-xl border border-white/10 shrink-0">
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Active Students</div>
              <div className="text-lg font-black text-white">{sessionSummary.totalActiveStudents}</div>
            </div>
            <div className="text-center px-2 border-x border-white/10">
              <div className="text-[10px] text-amber-300 font-bold uppercase">Months Cleared</div>
              <div className="text-lg font-black text-amber-400">
                {sessionSummary.totalMonthsPaid} <span className="text-xs text-slate-400 font-normal">/ {sessionSummary.totalMonthsPossible}</span>
              </div>
            </div>
            <div className="text-center px-2 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">Session Pacing</div>
              <div className="text-lg font-black text-emerald-300">{sessionSummary.overallPace}%</div>
            </div>
          </div>
        </div>

        {/* Non-Tuition Fee Heads Tracking Strip (Admission, Exam, Materials & Lab, Annual Dev) */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Session Fee Heads Tracking Status (Institutional Heads)
            </span>
            <span className="text-[10px] text-slate-400">Tracked independently from monthly tuition</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Admission Fee */}
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-emerald-400" />
                  Admission Fee
                </span>
                <p className="text-sm font-black text-white mt-0.5">
                  {sessionSummary.admissionSubmittedCount} / {sessionSummary.totalActiveStudents}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                sessionSummary.admissionSubmittedCount === sessionSummary.totalActiveStudents
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {sessionSummary.totalActiveStudents > 0
                  ? Math.round((sessionSummary.admissionSubmittedCount / sessionSummary.totalActiveStudents) * 100)
                  : 0}%
              </span>
            </div>

            {/* Exam Fee */}
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Award className="w-3 h-3 text-blue-400" />
                  Exam Fees
                </span>
                <p className="text-sm font-black text-white mt-0.5">
                  {sessionSummary.examFeeSubmittedCount} / {sessionSummary.totalActiveStudents}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                sessionSummary.examFeeSubmittedCount === sessionSummary.totalActiveStudents
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {sessionSummary.totalActiveStudents > 0
                  ? Math.round((sessionSummary.examFeeSubmittedCount / sessionSummary.totalActiveStudents) * 100)
                  : 0}%
              </span>
            </div>

            {/* Study Material & Lab Fees */}
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <FlaskConical className="w-3 h-3 text-purple-400" />
                  Study Material & Lab
                </span>
                <p className="text-sm font-black text-white mt-0.5">
                  {sessionSummary.studyMaterialLabSubmittedCount} / {sessionSummary.totalActiveStudents}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                sessionSummary.studyMaterialLabSubmittedCount === sessionSummary.totalActiveStudents
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}>
                {sessionSummary.totalActiveStudents > 0
                  ? Math.round((sessionSummary.studyMaterialLabSubmittedCount / sessionSummary.totalActiveStudents) * 100)
                  : 0}%
              </span>
            </div>

            {/* Annual Development Fees */}
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Annual Dev Fees
                </span>
                <p className="text-sm font-black text-white mt-0.5">
                  {sessionSummary.annualDevSubmittedCount} / {sessionSummary.totalActiveStudents}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                sessionSummary.annualDevSubmittedCount === sessionSummary.totalActiveStudents
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {sessionSummary.totalActiveStudents > 0
                  ? Math.round((sessionSummary.annualDevSubmittedCount / sessionSummary.totalActiveStudents) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* 12 Academic Months Progress Strip */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Academic Month Collection Health ({displayedSessionMonths.length} Months View)
            </span>
            <span className="text-[10px] text-slate-400">Click any month to filter pending students</span>
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 ${displayedSessionMonths.length === 12 ? 'xl:grid-cols-12' : 'xl:grid-cols-8'} gap-2`}>
            {monthlyStats.map((st) => {
              const isSelected = selectedFocusMonth === st.month;
              return (
                <button
                  key={st.month}
                  type="button"
                  onClick={() => setSelectedFocusMonth(isSelected ? 'ALL' : st.month)}
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-white/50'
                      : st.collectionPercentage >= 80
                      ? 'bg-emerald-950/40 text-emerald-200 border-emerald-800/60 hover:bg-emerald-900/50'
                      : st.collectionPercentage >= 40
                      ? 'bg-amber-950/40 text-amber-200 border-amber-800/60 hover:bg-amber-900/50'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-black ${isSelected ? 'text-slate-950' : 'text-white'}`}>
                      {st.shortMonth}
                    </span>
                    <span className={`text-[9px] font-bold px-1 rounded ${
                      isSelected ? 'bg-slate-950 text-amber-300' : 'bg-white/10 text-slate-300'
                    }`}>
                      {st.collectionPercentage}%
                    </span>
                  </div>

                  <div className="mt-1.5 w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isSelected ? 'bg-slate-950' : st.collectionPercentage >= 70 ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, st.collectionPercentage)}%` }}
                    />
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[9px]">
                    <span className={isSelected ? 'text-slate-900' : 'text-slate-400'}>
                      {st.paidStudentsCount}/{st.totalStudents}
                    </span>
                    <span className={`font-semibold ${isSelected ? 'text-slate-950 font-bold' : 'text-amber-300'}`}>
                      {formatCurrency(st.totalCollected)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, ID, roll number, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              id="export-tuition-tracker-csv"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Matrix CSV</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          
          {/* Class Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-semibold text-[11px]">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Classes (1 to 12)</option>
              {CLASS_LEVELS.map((cls) => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>

          {/* Stream Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-semibold text-[11px]">Stream:</span>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Streams</option>
              <option value="Science">Science</option>
              <option value="Commerce">Commerce</option>
              <option value="Arts">Arts</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Session Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-semibold text-[11px]">Session:</span>
            <select
              value={selectedSession}
              onChange={(e) => {
                setSelectedSession(e.target.value as '2026' | '2027');
                setSelectedFocusMonth('ALL');
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="2026">Session 2026 (2026–27)</option>
              <option value="2027">New Session 2027 (2027–28)</option>
            </select>
          </div>

          {/* Curriculum Board Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-semibold text-[11px]">Board:</span>
            <select
              value={selectedCurriculum}
              onChange={(e) => {
                setSelectedCurriculum(e.target.value);
                setSelectedFocusMonth('ALL');
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Boards</option>
              <option value="CBSE">CBSE Board (Apr–Mar)</option>
              <option value="W.B. Board">W.B. Board (1–10 Jan–Dec • 11–12 Apr–Mar)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-semibold text-[11px]">Status:</span>
            <div className="flex gap-1">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'DEFICIT', label: 'Pending Dues' },
                { id: 'CLEARED', label: 'Fully Paid (12/12)' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Month Indicator */}
          {selectedFocusMonth !== 'ALL' && (
            <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg text-[11px] font-bold">
              <span>Showing Unpaid for: {selectedFocusMonth}</span>
              <button
                onClick={() => setSelectedFocusMonth('ALL')}
                className="text-amber-700 hover:text-amber-950 font-black ml-1"
              >
                ✕
              </button>
            </div>
          )}

          <div className="ml-auto text-slate-500 text-[11px]">
            Showing <strong>{filteredRows.length}</strong> of {studentRows.length} active students
          </div>
        </div>
      </div>

      {/* Main Student × 12 Months Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider select-none">
              <tr>
                <th className="py-3.5 px-3 sticky left-0 z-20 bg-slate-900 min-w-[180px] shadow-sm">
                  <div className="flex items-center justify-between">
                    <span>Student Details</span>
                    <button
                      onClick={() => {
                        if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        else { setSortBy('name'); setSortOrder('asc'); }
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                </th>
                <th className="py-3.5 px-2 text-center min-w-[70px]">Class</th>
                <th className="py-3.5 px-2 text-center min-w-[85px]">
                  <div className="flex items-center justify-center gap-1">
                    <span>Tuition</span>
                    <button
                      onClick={() => {
                        if (sortBy === 'paidCount') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        else { setSortBy('paidCount'); setSortOrder('desc'); }
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                </th>
                <th className="py-3.5 px-2 text-center min-w-[150px]">
                  <span>Fee Heads (Adm/Exam/Lab/Dev)</span>
                </th>

                {/* Month Column Headers */}
                {displayedSessionMonths.map((month) => (
                  <th
                    key={month}
                    className={`py-3 px-1.5 text-center min-w-[68px] ${
                      selectedFocusMonth === month ? 'bg-amber-600 text-slate-950 font-black' : ''
                    }`}
                  >
                    <div className="text-[10px] leading-tight font-black">
                      {MONTH_SHORT_NAMES[month]}
                    </div>
                    <div className="text-[8px] opacity-75 font-normal">
                      {month.split(' ')[1]}
                    </div>
                  </th>
                ))}

                <th className="py-3.5 px-3 text-center min-w-[120px]">Next Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={displayedSessionMonths.length + 5} className="py-12 text-center text-slate-500">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No students found matching current filters</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting search query or month filters</p>
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ student, enrollmentMonth, applicableCount, monthStatuses, paidCount, unpaidCount, nextUnpaid, feeHeadsStatus }) => {
                  const isAllPaid = unpaidCount === 0;

                  return (
                    <tr key={student.id} className="hover:bg-amber-50/40 transition-colors group">
                      
                      {/* Student Info Cell (Sticky Left) */}
                      <td className="py-2.5 px-3 sticky left-0 z-10 bg-white group-hover:bg-amber-50/60 shadow-xs border-r border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate text-xs leading-tight">
                              {student.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>{student.id}</span>
                              <span>•</span>
                              <span>Roll: {student.rollNo}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Class / Stream / Board */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-100">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-black text-slate-900 text-xs">
                            {student.classLevel}
                          </span>
                          <span className={`text-[8.5px] font-bold px-1 py-0.2 rounded border ${
                            student.curriculum === 'W.B. Board'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}>
                            {student.curriculum === 'W.B. Board' ? 'WB' : 'CBSE'}
                          </span>
                        </div>
                        <span className="block text-[9px] text-slate-500 font-medium mt-0.5">
                          {student.stream === 'General' ? 'Gen' : student.stream}
                        </span>
                      </td>

                      {/* Progress Score (e.g. 5/9 mo) */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-100">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isAllPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : paidCount >= Math.ceil(applicableCount / 2)
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {paidCount} / {applicableCount} mo
                          </span>
                          <span className="text-[8px] text-slate-400 mt-0.5 font-medium">
                            {isAllPaid ? 'Completed' : `${unpaidCount} Due`}
                          </span>
                          {applicableCount < 12 && (
                            <span className="text-[7.5px] text-amber-700 font-semibold">
                              From {MONTH_SHORT_NAMES[enrollmentMonth] || enrollmentMonth}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Non-Tuition Fee Heads Status (Admission, Exam, Lab, Dev) */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-100">
                        <div className="flex items-center justify-center gap-1 flex-wrap max-w-[150px] mx-auto">
                          {/* Admission */}
                          <button
                            type="button"
                            onClick={() => {
                              if (feeHeadsStatus.admission.receiptNo) {
                                const match = deposits.find((d) => d.receiptNo === feeHeadsStatus.admission.receiptNo);
                                if (match) onViewReceipt(match);
                                else onOpenFeeDepositModal(student.id, undefined);
                              } else {
                                onOpenFeeDepositModal(student.id, undefined);
                              }
                            }}
                            title={`Admission Fee (One-Time): ${feeHeadsStatus.admission.isSubmitted ? `Submitted on ${feeHeadsStatus.admission.lastPaymentDate || 'Recorded'}` : 'Pending Due'}`}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                              feeHeadsStatus.admission.isSubmitted
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            Adm: {feeHeadsStatus.admission.isSubmitted ? '✓' : 'Due'}
                          </button>

                          {/* Exam */}
                          <button
                            type="button"
                            onClick={() => {
                              if (feeHeadsStatus.exam.receiptNo) {
                                const match = deposits.find((d) => d.receiptNo === feeHeadsStatus.exam.receiptNo);
                                if (match) onViewReceipt(match);
                                else onOpenFeeDepositModal(student.id, undefined);
                              } else {
                                onOpenFeeDepositModal(student.id, undefined);
                              }
                            }}
                            title={`Exam Fee: ${feeHeadsStatus.exam.isSubmitted ? `Submitted (${feeHeadsStatus.exam.termsPaid || 1}/${feeHeadsStatus.exam.totalTerms || 1} terms)` : 'Pending Due'}`}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                              feeHeadsStatus.exam.isSubmitted
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            Exam: {feeHeadsStatus.exam.isSubmitted ? '✓' : 'Due'}
                          </button>

                          {/* Lab & Materials */}
                          <button
                            type="button"
                            onClick={() => {
                              if (feeHeadsStatus.materialsAndLab.receiptNo) {
                                const match = deposits.find((d) => d.receiptNo === feeHeadsStatus.materialsAndLab.receiptNo);
                                if (match) onViewReceipt(match);
                                else onOpenFeeDepositModal(student.id, undefined);
                              } else {
                                onOpenFeeDepositModal(student.id, undefined);
                              }
                            }}
                            title={`Study Material & Lab (One-Time): ${feeHeadsStatus.materialsAndLab.isSubmitted ? 'Submitted' : 'Pending Due'}`}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                              feeHeadsStatus.materialsAndLab.isSubmitted
                                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            Lab: {feeHeadsStatus.materialsAndLab.isSubmitted ? '✓' : 'Due'}
                          </button>

                          {/* Annual Dev */}
                          <button
                            type="button"
                            onClick={() => {
                              if (feeHeadsStatus.annualDevelopment.receiptNo) {
                                const match = deposits.find((d) => d.receiptNo === feeHeadsStatus.annualDevelopment.receiptNo);
                                if (match) onViewReceipt(match);
                                else onOpenFeeDepositModal(student.id, undefined);
                              } else {
                                onOpenFeeDepositModal(student.id, undefined);
                              }
                            }}
                            title={`Annual Dev Fee (One-Time): ${feeHeadsStatus.annualDevelopment.isSubmitted ? 'Submitted' : 'Pending Due'}`}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                              feeHeadsStatus.annualDevelopment.isSubmitted
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            Dev: {feeHeadsStatus.annualDevelopment.isSubmitted ? '✓' : 'Due'}
                          </button>
                        </div>
                      </td>

                      {/* 12 Month Status Badges */}
                      {monthStatuses.map((st) => {
                        return (
                          <td
                            key={st.month}
                            className={`py-2 px-1 text-center border-r border-slate-100/80 ${
                              selectedFocusMonth === st.month ? 'bg-amber-50/80' : ''
                            }`}
                          >
                            {st.isPreEnrollment ? (
                              <div
                                title={
                                  (st as { isOutOfBoardCalendar?: boolean }).isOutOfBoardCalendar
                                    ? `${student.curriculum || 'CBSE'} (Class ${student.classLevel}) follows ${isAprilToMarchCalendar(student.curriculum || 'CBSE', student.classLevel) ? 'April–March' : 'January–December'} session. Not applicable.`
                                    : `Candidate enrolled in ${enrollmentMonth}.\nPre-enrollment month not payable.`
                                }
                                className="w-full py-1.5 px-1 bg-slate-100 border border-slate-200/80 rounded-lg text-slate-400 font-bold text-[8px] flex flex-col items-center justify-center gap-0.5 select-none"
                              >
                                <span className="w-1.5 h-0.5 bg-slate-300 rounded-full"></span>
                                <span className="text-[7.5px] uppercase tracking-tighter">N/A</span>
                              </div>
                            ) : st.isPaid ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (st.matchingDeposit) {
                                    onViewReceipt(st.matchingDeposit);
                                  }
                                }}
                                title={`Paid on ${st.depositDate || 'Verified'}\nReceipt: ${st.receiptNo || 'N/A'}\nClick to view official receipt`}
                                className="w-full py-1.5 px-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg text-emerald-700 font-black text-[9px] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer group/btn"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 group-hover/btn:scale-110 transition-transform" />
                                <span className="text-[8px] font-mono leading-none">PAID</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onOpenFeeDepositModal(student.id, st.month)}
                                title={`Due for ${st.month}\nClick to record tuition deposit for this month`}
                                className="w-full py-1.5 px-1 bg-amber-50 hover:bg-amber-500 hover:text-slate-950 border border-amber-300/80 rounded-lg text-amber-800 font-bold text-[9px] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer group/due"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover/due:bg-slate-950"></span>
                                <span className="text-[8px] leading-none">DUE</span>
                              </button>
                            )}
                          </td>
                        );
                      })}

                      {/* Action Cell */}
                      <td className="py-2.5 px-3 text-center">
                        {isAllPaid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            All Clear
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenFeeDepositModal(student.id, nextUnpaid || undefined)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Collect {nextUnpaid ? MONTH_SHORT_NAMES[nextUnpaid] || nextUnpaid.split(' ')[0] : 'Tuition'}</span>
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Legend */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              Legend & Actions:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID
              </span>
              <span className="text-[11px] text-slate-500">— Click to view official receipt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded border border-amber-300">
                ● DUE
              </span>
              <span className="text-[11px] text-slate-500">— Click to deposit tuition for that month</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Academic Calendar: <strong>CBSE (1–12) &amp; W.B. Board (11–12): Apr – Mar</strong> • <strong>W.B. Board (1–10): Jan – Dec</strong>
          </div>
        </div>
      </div>

    </div>
  );
};
