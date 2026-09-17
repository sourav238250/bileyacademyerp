import React, { useState, useMemo } from 'react';
import {
  Student,
  FeeDeposit,
  ClassLevel,
  StreamType,
  Subject,
  InstitutionalAuthorizationConfig,
} from '../../types';
import {
  ACADEMIC_SESSION_MONTHS,
  MONTH_SHORT_NAMES,
  getStudentTuitionMonthsStatus,
  getTuitionMonthCollectionStats,
  getNextUnpaidTuitionMonth,
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
} from 'lucide-react';

interface MonthlyTuitionTrackerProps {
  students: Student[];
  deposits: FeeDeposit[];
  subjects?: Subject[];
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
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DEFICIT' | 'CLEARED' | 'CURRENT_DUE'>('ALL');
  const [selectedFocusMonth, setSelectedFocusMonth] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'class' | 'paidCount' | 'dues'>('class');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Compute stats for all 12 academic months
  const monthlyStats = useMemo(() => {
    return getTuitionMonthCollectionStats(students, deposits, ACADEMIC_SESSION_MONTHS);
  }, [students, deposits]);

  // Overall session summary
  const sessionSummary = useMemo(() => {
    const active = students.filter((s) => s.status === 'Active');
    let totalMonthsPaid = 0;
    let totalMonthsPossible = active.length * 12;

    active.forEach((student) => {
      const monthStatuses = getStudentTuitionMonthsStatus(student.id, deposits, ACADEMIC_SESSION_MONTHS);
      totalMonthsPaid += monthStatuses.filter((m) => m.isPaid).length;
    });

    const overallPace = totalMonthsPossible > 0 ? Math.round((totalMonthsPaid / totalMonthsPossible) * 100) : 0;
    const totalCollectedAmount = deposits
      .filter((d) => d.feeHead === 'Tuition Fee' || d.selectedFeeHeads?.includes('Tuition Fee'))
      .reduce((sum, d) => sum + d.amountPaid, 0);

    return {
      totalActiveStudents: active.length,
      totalMonthsPaid,
      totalMonthsPossible,
      overallPace,
      totalCollectedAmount,
    };
  }, [students, deposits]);

  // Process student tuition month rows
  const studentRows = useMemo(() => {
    return students
      .filter((s) => s.status === 'Active')
      .map((student) => {
        const monthStatuses = getStudentTuitionMonthsStatus(student.id, deposits, ACADEMIC_SESSION_MONTHS);
        const paidCount = monthStatuses.filter((m) => m.isPaid).length;
        const unpaidCount = 12 - paidCount;
        const nextUnpaid = monthStatuses.find((m) => !m.isPaid)?.month || null;
        
        // Check if student has enrolled subjects
        const enrolledCount = student.enrolledSubjectIds && student.enrolledSubjectIds.length > 0
          ? student.enrolledSubjectIds.length
          : 4;

        return {
          student,
          monthStatuses,
          paidCount,
          unpaidCount,
          nextUnpaid,
          enrolledCount,
        };
      });
  }, [students, deposits]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return studentRows.filter(({ student, monthStatuses, paidCount, unpaidCount }) => {
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
        // Find if unpaid in the current calendar month
        const currentMonthName = 'September 2026';
        const currentStatus = monthStatuses.find((m) => m.month === currentMonthName);
        if (currentStatus?.isPaid) return false;
      }
      // Focus month filter
      if (selectedFocusMonth !== 'ALL') {
        const monthMatch = monthStatuses.find((m) => m.month === selectedFocusMonth);
        if (monthMatch?.isPaid) return false; // Show students who haven't paid this month
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
  }, [studentRows, selectedClass, selectedStream, searchQuery, statusFilter, selectedFocusMonth, sortBy, sortOrder]);

  // Export Matrix to CSV
  const handleExportCSV = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Class Level',
      'Stream',
      'Roll No',
      'Contact',
      'Paid Months Count',
      'Unpaid Months Count',
      'Next Due Month',
      ...ACADEMIC_SESSION_MONTHS,
    ];

    const rows = filteredRows.map(({ student, monthStatuses, paidCount, unpaidCount, nextUnpaid }) => {
      const monthCols = monthStatuses.map((m) => (m.isPaid ? `PAID (${m.receiptNo || 'Yes'})` : 'DUE'));
      return [
        student.id,
        `"${student.name}"`,
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
    link.setAttribute('download', `biley_academy_monthly_tuition_tracker_${new Date().toISOString().split('T')[0]}.csv`);
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
                Session 2026 (Jan – Dec)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-400" />
              Monthly Tuition Fee Tracking Matrix
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Real-time audit of monthly coaching tuition collections across all 12 academic months (January 2026 to December 2026). Identify pending months, collect dues with one click, and track session pacing.
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

        {/* 12 Academic Months Progress Strip */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Academic Month Collection Health (12 Months Session)
            </span>
            <span className="text-[10px] text-slate-400">Click any month to filter pending students</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2">
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
                    <span>Progress</span>
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

                {/* 12 Month Column Headers */}
                {ACADEMIC_SESSION_MONTHS.map((month) => (
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
                  <td colSpan={16} className="py-12 text-center text-slate-500">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No students found matching current filters</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting search query or month filters</p>
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ student, monthStatuses, paidCount, unpaidCount, nextUnpaid }) => {
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

                      {/* Class / Stream */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-100">
                        <span className="font-black text-slate-900 text-xs">
                          {student.classLevel}
                        </span>
                        <span className="block text-[9px] text-slate-500 font-medium">
                          {student.stream === 'General' ? 'Gen' : student.stream}
                        </span>
                      </td>

                      {/* Progress Score (e.g. 5/12) */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-100">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isAllPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : paidCount >= 6
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {paidCount} / 12
                          </span>
                          <span className="text-[8px] text-slate-400 mt-0.5 font-medium">
                            {isAllPaid ? 'Completed' : `${unpaidCount} Due`}
                          </span>
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
                            {st.isPaid ? (
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
            Official Academic Session: <strong>January 2026 – December 2026</strong>
          </div>
        </div>
      </div>

    </div>
  );
};
