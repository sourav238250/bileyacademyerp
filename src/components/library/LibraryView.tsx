import React, { useState, useEffect } from 'react';
import {
  Book,
  BookIssueRecord,
  Student,
  Faculty,
  AdminUser,
  LibrarySessionUser,
  BookCategory,
  ClassLevel,
  NavigationTab,
} from '../../types';
import { loadFromStorage, saveItemToStorage } from '../../utils/storage';
import { LibraryAccessGate } from './LibraryAccessGate';
import { BookCard } from './BookCard';
import { BookDetailModal } from './BookDetailModal';
import { DigitalReaderModal } from './DigitalReaderModal';
import { IssueBookModal } from './IssueBookModal';
import { AddEditBookModal } from './AddEditBookModal';
import { InstituteLogo } from '../common/InstituteLogo';
import {
  Library,
  BookOpen,
  Search,
  Filter,
  Plus,
  Bookmark,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Users,
  GraduationCap,
  ShieldCheck,
  LogOut,
  FileText,
  Printer,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

interface LibraryViewProps {
  books: Book[];
  bookIssues: BookIssueRecord[];
  students: Student[];
  faculty: Faculty[];
  currentAdmin: AdminUser | null;
  onAddBook: (book: Book) => void;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onIssueBook: (issue: BookIssueRecord) => void;
  onReturnBook: (issueId: string) => void;
  onOpenAdminLogin: () => void;
  onNavigateToTab?: (tab: NavigationTab) => void;
}

const STORAGE_LIBRARY_USER_KEY = 'biley_library_session_user_v1';
const STUDENT_PORTAL_AUTH_KEY = 'biley_student_portal_auth_student_id';

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  bookIssues,
  students,
  faculty,
  currentAdmin,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onIssueBook,
  onReturnBook,
  onOpenAdminLogin,
  onNavigateToTab,
}) => {
  // Session resolution
  const [sessionUser, setSessionUser] = useState<LibrarySessionUser | null>(() => {
    // 1. If staff is authenticated via currentAdmin
    if (currentAdmin) {
      return {
        role: 'Staff',
        id: currentAdmin.id,
        name: currentAdmin.name,
        subTitle: `${currentAdmin.designation} (${currentAdmin.role})`,
        contactNumber: currentAdmin.email,
        avatarUrl: currentAdmin.avatarUrl,
        authenticatedAt: new Date().toISOString(),
      };
    }

    // 2. If student is authenticated via student portal
    const studentPortalId = loadFromStorage<string | null>(STUDENT_PORTAL_AUTH_KEY, null);
    if (studentPortalId) {
      const st = students.find((s) => s.id === studentPortalId);
      if (st) {
        return {
          role: 'Student',
          id: st.id,
          name: st.name,
          subTitle: `Class ${st.classLevel} • Roll ${st.rollNo} (${st.stream})`,
          contactNumber: st.contactNumber,
          authenticatedAt: new Date().toISOString(),
        };
      }
    }

    // 3. Fallback to saved library session
    return loadFromStorage<LibrarySessionUser | null>(STORAGE_LIBRARY_USER_KEY, null);
  });

  // Keep staff session in sync if currentAdmin changes
  useEffect(() => {
    if (currentAdmin) {
      const staffUser: LibrarySessionUser = {
        role: 'Staff',
        id: currentAdmin.id,
        name: currentAdmin.name,
        subTitle: `${currentAdmin.designation} (${currentAdmin.role})`,
        contactNumber: currentAdmin.email,
        avatarUrl: currentAdmin.avatarUrl,
        authenticatedAt: new Date().toISOString(),
      };
      setSessionUser(staffUser);
      saveItemToStorage(STORAGE_LIBRARY_USER_KEY, staffUser);
    }
  }, [currentAdmin]);

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'loans' | 'digital'>('catalog');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE_ONLY'>('ALL');

  // Modals state
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);
  const [selectedBookForDigital, setSelectedBookForDigital] = useState<Book | null>(null);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState<Book | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Authentication Handler from LibraryAccessGate
  const handleAuthenticate = (user: LibrarySessionUser) => {
    setSessionUser(user);
    saveItemToStorage(STORAGE_LIBRARY_USER_KEY, user);
  };

  const handleLogoutLibrary = () => {
    setSessionUser(null);
    saveItemToStorage(STORAGE_LIBRARY_USER_KEY, null);
  };

  // If NOT authenticated as a registered student, staff, or faculty, show the Access Gate
  if (!sessionUser) {
    return (
      <LibraryAccessGate
        students={students}
        faculty={faculty}
        currentAdmin={currentAdmin}
        onAuthenticate={handleAuthenticate}
        onOpenAdminLogin={onOpenAdminLogin}
      />
    );
  }

  // Filtered books
  const filteredBooks = books.filter((book) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.subjectName.toLowerCase().includes(q) ||
      book.isbn.toLowerCase().includes(q) ||
      book.shelfLocation.toLowerCase().includes(q) ||
      (book.tags && book.tags.some((t) => t.toLowerCase().includes(q)));

    const matchesClass = selectedClass === 'ALL' || book.classLevel === selectedClass || book.classLevel === 'All';
    const matchesCategory = selectedCategory === 'ALL' || book.category === selectedCategory;
    const matchesAvailability = availabilityFilter === 'ALL' || (availabilityFilter === 'AVAILABLE_ONLY' && book.availableCopies > 0);
    const matchesDigitalTab = activeSubTab !== 'digital' || book.digitalAvailable;

    return matchesSearch && matchesClass && matchesCategory && matchesAvailability && matchesDigitalTab;
  });

  // Calculate stats
  const totalBookCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const totalAvailableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const activeLoans = bookIssues.filter((i) => i.status === 'Active');
  const digitalBooksCount = books.filter((b) => b.digitalAvailable).length;

  // Filtered loans for the active user
  const userLoans = sessionUser.role === 'Staff'
    ? bookIssues
    : bookIssues.filter((i) => i.borrowerId === sessionUser.id);

  const isStaff = sessionUser.role === 'Staff';

  const categoriesList: (BookCategory | 'ALL')[] = [
    'ALL',
    'NCERT & Core Textbooks',
    'Reference & Practice Guides',
    'Board & Competitive PYQs',
    'Foundation JEE & NEET',
    'Literature & Language',
    'Science Experiments & Lab Manuals',
  ];

  return (
    <div className="space-y-6">
      
      {/* Institutional Library Header & Session Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <InstituteLogo size="md" variant="rounded" withBorder={true} withGlow={true} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Authorized Library Session</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Biley Academy Central Library
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                Library & Digital Book Repository
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Restricted access active for registered students, faculty members, and staff. Browse catalog, reserve physical copies, and study digital editions.
              </p>
            </div>
          </div>

          {/* User Session Card & Actions */}
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 min-w-[280px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                {sessionUser.role === 'Student' ? (
                  <GraduationCap className="w-5 h-5 text-slate-950" />
                ) : sessionUser.role === 'Faculty' ? (
                  <Users className="w-5 h-5 text-slate-950" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-slate-950" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    {sessionUser.role} Session
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate max-w-[150px]">
                  {sessionUser.name}
                </h4>
                <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                  {sessionUser.subTitle}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogoutLibrary}
              className="p-2 bg-slate-700 hover:bg-rose-900/60 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
              title="Exit Library Session / Switch Identity"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Library Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'catalog'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Book Catalog ({books.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('digital')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'digital'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Digital E-Books ({digitalBooksCount})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('loans')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'loans'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>
              {isStaff ? `Circulation & Loan Register (${bookIssues.length})` : `My Borrowed Books (${userLoans.length})`}
            </span>
          </button>

          {isStaff && (
            <button
              onClick={() => {
                setEditingBook(null);
                setIsAddEditModalOpen(true);
              }}
              className="ml-auto flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Book</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Catalog Titles</span>
            <span className="text-xl font-black text-slate-900">{books.length}</span>
            <span className="text-[11px] text-slate-500 block">({totalBookCopies} Total Physical Copies)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Available to Borrow</span>
            <span className="text-xl font-black text-emerald-600">{totalAvailableCopies}</span>
            <span className="text-[11px] text-slate-500 block">In Racks & Circulation</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Currently Issued</span>
            <span className="text-xl font-black text-amber-600">{activeLoans.length}</span>
            <span className="text-[11px] text-slate-500 block">Active Student & Faculty Loans</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Digital E-Books</span>
            <span className="text-xl font-black text-purple-600">{digitalBooksCount}</span>
            <span className="text-[11px] text-slate-500 block">With Instant Online Reader</span>
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      {(activeSubTab === 'catalog' || activeSubTab === 'digital') && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, subject, ISBN, shelf..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* Availability Filter Toggle */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  type="button"
                  onClick={() => setAvailabilityFilter('ALL')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    availabilityFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Copies
                </button>
                <button
                  type="button"
                  onClick={() => setAvailabilityFilter('AVAILABLE_ONLY')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    availabilityFilter === 'AVAILABLE_ONLY'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Available Only
                </button>
              </div>
            </div>

            {/* Class Level Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Class:</span>
              {['ALL', '5', '6', '7', '8', '9', '10', '11', '12'].map((cl) => (
                <button
                  key={cl}
                  type="button"
                  onClick={() => setSelectedClass(cl)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-all ${
                    selectedClass === cl
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cl === 'ALL' ? 'All Classes' : `Class ${cl}`}
                </button>
              ))}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Genre:</span>
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-all ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Book Cards Grid */}
          {filteredBooks.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-xs">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-slate-800">No books match your search or filter</h3>
              <p className="text-xs text-slate-400 mt-1">Try modifying your search keywords, clear category filter, or reset class level.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  currentUser={sessionUser}
                  onViewDetails={(b) => setSelectedBookForDetails(b)}
                  onOpenDigitalReader={(b) => setSelectedBookForDigital(b)}
                  onIssueBook={(b) => setSelectedBookForIssue(b)}
                  onEditBook={(b) => {
                    setEditingBook(b);
                    setIsAddEditModalOpen(true);
                  }}
                  onDeleteBook={(id) => {
                    if (window.confirm('Are you sure you want to delete this book from the library catalog?')) {
                      onDeleteBook(id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loans & Circulation Register Tab */}
      {activeSubTab === 'loans' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                {isStaff ? 'Circulation Ledger & Book Loan Records' : 'My Borrowed Books History'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isStaff
                  ? 'Real-time record of all active, overdue, and returned books issued to students and faculty.'
                  : 'Track your borrowed library books, return due dates, and renewal status.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-bold">
                {userLoans.filter((l) => l.status === 'Active').length} Currently Active
              </span>
            </div>
          </div>

          {userLoans.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-sm text-slate-800">No loan records found</h4>
              <p className="text-xs text-slate-400 mt-1">
                {isStaff
                  ? 'No books have been issued yet. Browse the catalog to issue books.'
                  : 'You have not borrowed any books from the library yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4">Issue No</th>
                    <th className="py-3.5 px-4">Book Title</th>
                    <th className="py-3.5 px-4">Borrower Details</th>
                    <th className="py-3.5 px-4">Issue Date</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {userLoans.map((loan) => {
                    const isOverdue = loan.status === 'Active' && new Date(loan.dueDate) < new Date();
                    return (
                      <tr key={loan.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {loan.issueNo}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block max-w-xs truncate">
                            {loan.bookTitle}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ISBN: {loan.bookIsbn}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{loan.borrowerName}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                              {loan.borrowerType}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{loan.borrowerDetails}</span>
                        </td>
                        <td className="py-3 px-4 font-mono">{loan.issueDate}</td>
                        <td className="py-3 px-4 font-mono font-bold">
                          <span className={isOverdue ? 'text-rose-600' : 'text-slate-800'}>
                            {loan.dueDate}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {loan.status === 'Returned' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Returned</span>
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>Overdue</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              <span>Active Loan</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {loan.status === 'Active' && isStaff && (
                            <button
                              type="button"
                              onClick={() => onReturnBook(loan.id)}
                              className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                            >
                              Mark Returned
                            </button>
                          )}
                          {loan.status === 'Returned' && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Ret: {loan.returnDate}
                            </span>
                          )}
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

      {/* Interactive Modals */}
      <BookDetailModal
        book={selectedBookForDetails}
        currentUser={sessionUser}
        onClose={() => setSelectedBookForDetails(null)}
        onOpenDigitalReader={(b) => setSelectedBookForDigital(b)}
        onIssueBook={(b) => setSelectedBookForIssue(b)}
      />

      <DigitalReaderModal
        book={selectedBookForDigital}
        currentUser={sessionUser}
        onClose={() => setSelectedBookForDigital(null)}
      />

      <IssueBookModal
        book={selectedBookForIssue}
        students={students}
        faculty={faculty}
        currentUser={sessionUser}
        onClose={() => setSelectedBookForIssue(null)}
        onConfirmIssue={(issue) => {
          onIssueBook(issue);
        }}
      />

      <AddEditBookModal
        isOpen={isAddEditModalOpen}
        editingBook={editingBook}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingBook(null);
        }}
        onSaveBook={(savedBook) => {
          if (editingBook) {
            onUpdateBook(savedBook);
          } else {
            onAddBook(savedBook);
          }
        }}
      />
    </div>
  );
};
