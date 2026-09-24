import React, { useRef, useState, useEffect, useCallback } from 'react';
import { NavigationTab, AdminUser } from '../types';
import {
  LayoutDashboard,
  UserPlus,
  BookOpen,
  Users,
  CalendarCheck,
  FileCheck2,
  Award,
  CreditCard,
  Smartphone,
  HelpCircle,
  FileCheck,
  Receipt,
  Wallet,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavigationProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  currentAdmin?: AdminUser | null;
  studentCount?: number;
  facultyCount?: number;
  examCount?: number;
  resultsCount?: number;
  feeDepositsCount?: number;
  pendingDuesCount?: number;
  upcomingExamsCount?: number;
  attendanceRecordsCount?: number;
  questionBankCount?: number;
  assignmentCount?: number;
  disbursementsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  currentAdmin,
  studentCount,
  pendingDuesCount,
  upcomingExamsCount,
  attendanceRecordsCount,
  questionBankCount,
  assignmentCount,
  disbursementsCount,
}) => {
  const isSignedOut = !currentAdmin;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const tabs: {
    id: NavigationTab;
    label: string;
    icon: React.FC<any>;
    badge?: string | number;
    badgeColor?: string;
    requiresAuth?: boolean;
    openBadge?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'students',
      label: 'Student Admissions',
      icon: UserPlus,
      badge: studentCount,
      badgeColor: 'bg-slate-700',
      requiresAuth: true,
    },
    { id: 'subjects', label: 'Subject Distribution', icon: BookOpen, requiresAuth: true },
    { id: 'faculty', label: 'Faculty Allocation', icon: Users, requiresAuth: true },
    {
      id: 'attendance',
      label: 'Daily Attendance',
      icon: CalendarCheck,
      badge: attendanceRecordsCount && attendanceRecordsCount > 0 ? `${attendanceRecordsCount}` : undefined,
      badgeColor: 'bg-emerald-700',
      requiresAuth: true,
    },
    {
      id: 'question-bank',
      label: 'Question Bank & Assignments',
      icon: HelpCircle,
      badge: questionBankCount && questionBankCount > 0 ? questionBankCount : undefined,
      badgeColor: 'bg-amber-600',
      requiresAuth: true,
    },
    {
      id: 'exams',
      label: 'Examinations',
      icon: FileCheck2,
      badge: upcomingExamsCount && upcomingExamsCount > 0 ? upcomingExamsCount : undefined,
      badgeColor: 'bg-blue-600',
      requiresAuth: true,
    },
    { id: 'results', label: 'Results & Report Cards', icon: Award, requiresAuth: true },
    {
      id: 'fees',
      label: 'Fee Deposit & Receipts',
      icon: CreditCard,
      badge: pendingDuesCount && pendingDuesCount > 0 ? `${pendingDuesCount} Dues` : undefined,
      badgeColor: 'bg-amber-600',
      requiresAuth: true,
    },
    {
      id: 'disbursements',
      label: 'Disbursements & P&L',
      icon: Wallet,
      badge: disbursementsCount && disbursementsCount > 0 ? `${disbursementsCount}` : undefined,
      badgeColor: 'bg-indigo-700',
      requiresAuth: true,
    },
    {
      id: 'student-portal',
      label: 'Student Portal',
      icon: Smartphone,
    },
  ];

  // Update scroll indicators state
  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [checkScrollability]);

  // Auto-scroll active tab into view when activeTab changes
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const activeBtn = el.querySelector<HTMLElement>(`#nav-tab-${activeTab}`);
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
    // Re-check scroll state after animation completes
    const timer = setTimeout(checkScrollability, 350);
    return () => clearTimeout(timer);
  }, [activeTab, checkScrollability]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(200, Math.floor(el.clientWidth * 0.65));
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScrollability, 350);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (el && Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 2) {
      el.scrollLeft += e.deltaY;
      checkScrollability();
    }
  };

  return (
    <nav
      id="navigation-bar"
      className="bg-white border-b border-slate-200 sticky top-16 sm:top-18 z-30 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 relative flex items-center">
        
        {/* Left Scroll Navigation Button */}
        {canScrollLeft && (
          <div className="absolute left-1 sm:left-2 z-20 flex items-center h-full pr-2 bg-gradient-to-r from-white via-white/95 to-transparent">
            <button
              onClick={() => handleScroll('left')}
              aria-label="Scroll tab menu left"
              title="Scroll left"
              className="p-1.5 sm:p-2 rounded-full bg-white hover:bg-slate-900 hover:text-white text-slate-700 shadow-md border border-slate-200 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Tabs Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          onWheel={handleWheel}
          className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-2.5 px-1 w-full custom-scrollbar scroll-smooth select-none items-center"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isLocked = isSignedOut && tab.requiresAuth;

            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10'
                    : isLocked
                    ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : isLocked ? 'text-slate-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>

                {/* Lock icon for protected administrative tabs in signed out state */}
                {isLocked && (
                  <span className="flex items-center text-slate-400 ml-0.5" title="Requires Staff Sign In">
                    <Lock className="w-3 h-3" />
                  </span>
                )}

                {/* Open tag for unauthenticated accessible tabs */}
                {tab.openBadge && !tab.badge && (
                  <span className="ml-1 text-[9px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300/60 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                    {tab.openBadge}
                  </span>
                )}

                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-amber-500 text-slate-950 font-black' : tab.badgeColor || 'bg-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Navigation Button */}
        {canScrollRight && (
          <div className="absolute right-1 sm:right-2 z-20 flex items-center h-full pl-2 bg-gradient-to-l from-white via-white/95 to-transparent">
            <button
              onClick={() => handleScroll('right')}
              aria-label="Scroll tab menu right"
              title="Scroll right"
              className="p-1.5 sm:p-2 rounded-full bg-white hover:bg-slate-900 hover:text-white text-slate-700 shadow-md border border-slate-200 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </nav>
  );
};
