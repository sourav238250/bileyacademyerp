import React, { useState } from 'react';
import {
  Book,
  BookIssueRecord,
  Student,
  Faculty,
  LibrarySessionUser,
  BorrowerType,
} from '../../types';
import {
  X,
  BookOpen,
  Calendar,
  User,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  MapPin,
  Clock,
} from 'lucide-react';

interface IssueBookModalProps {
  book: Book | null;
  students: Student[];
  faculty: Faculty[];
  currentUser: LibrarySessionUser | null;
  onClose: () => void;
  onConfirmIssue: (newIssue: BookIssueRecord) => void;
}

export const IssueBookModal: React.FC<IssueBookModalProps> = ({
  book,
  students,
  faculty,
  currentUser,
  onClose,
  onConfirmIssue,
}) => {
  const isStudent = currentUser?.role === 'Student';
  const isFaculty = currentUser?.role === 'Faculty';
  const isStaff = currentUser?.role === 'Staff';

  const [borrowerType, setBorrowerType] = useState<BorrowerType>(
    isStudent ? 'Student' : isFaculty ? 'Faculty' : 'Student'
  );

  // Default borrower selection based on active session
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>(() => {
    if (isStudent && currentUser) return currentUser.id;
    if (isFaculty && currentUser) return currentUser.id;
    return students[0]?.id || '';
  });

  // Calculate default dates (14 days for students, 30 days for faculty)
  const today = new Date().toISOString().split('T')[0];
  const defaultDueDate = new Date(Date.now() + (isFaculty ? 30 : 14) * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!book) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (book.availableCopies <= 0) {
      setError('No physical copies currently available in stock to issue.');
      return;
    }

    let borrowerName = '';
    let borrowerContact = '';
    let borrowerDetails = '';

    if (borrowerType === 'Student') {
      const st = students.find((s) => s.id === selectedBorrowerId);
      if (!st) {
        setError('Please select a valid registered student.');
        return;
      }
      borrowerName = st.name;
      borrowerContact = st.contactNumber;
      borrowerDetails = `Class ${st.classLevel} • Roll ${st.rollNo} (${st.stream})`;
    } else {
      const f = faculty.find((fac) => fac.id === selectedBorrowerId);
      if (!f) {
        setError('Please select a valid faculty member.');
        return;
      }
      borrowerName = f.name;
      borrowerContact = f.phone;
      borrowerDetails = `${f.designation} • ${f.email}`;
    }

    const uniqueId = `ISSUE-${Date.now()}`;
    const voucherNo = `LIB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newIssue: BookIssueRecord = {
      id: uniqueId,
      issueNo: voucherNo,
      bookId: book.id,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      borrowerType,
      borrowerId: selectedBorrowerId,
      borrowerName,
      borrowerContact,
      borrowerDetails,
      issueDate: today,
      dueDate,
      status: 'Active',
      issuedByStaffName: currentUser
        ? `${currentUser.name} (${currentUser.role})`
        : 'Mr. Sourav Dinda (Director & Librarian)',
      remarks: remarks.trim() || undefined,
    };

    onConfirmIssue(newIssue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-teal-400 uppercase font-bold tracking-wider block">
                Library Circulation Desk
              </span>
              <h2 className="text-lg font-black text-white">
                {isStaff ? 'Issue Book to Borrower' : 'Borrow Book / Loan Slip'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Target Book Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Book to be issued
              </span>
              <h4 className="font-bold text-sm text-slate-900 truncate">
                {book.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                By {book.author} • Shelf: {book.shelfLocation}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {book.availableCopies} available
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Borrower Type Selector (for Staff) */}
          {isStaff ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Borrower Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBorrowerType('Student');
                    setSelectedBorrowerId(students[0]?.id || '');
                    setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    borrowerType === 'Student'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span>Enrolled Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBorrowerType('Faculty');
                    setSelectedBorrowerId(faculty[0]?.id || '');
                    setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    borrowerType === 'Faculty'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Faculty Member</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Borrowing as: <strong>{currentUser?.name}</strong> ({currentUser?.subTitle})</span>
            </div>
          )}

          {/* Borrower Dropdown (When Staff is issuing) */}
          {isStaff && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {borrowerType === 'Student' ? 'Select Registered Student' : 'Select Faculty Member'}
              </label>
              {borrowerType === 'Student' ? (
                <select
                  value={selectedBorrowerId}
                  onChange={(e) => setSelectedBorrowerId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      [Class {st.classLevel} - Roll {st.rollNo}] {st.name} ({st.contactNumber})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedBorrowerId}
                  onChange={(e) => setSelectedBorrowerId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.designation} ({f.phone})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Dates Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={today}
                disabled
                className="w-full py-2 px-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Return Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                min={today}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Issue Notes / Purpose (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Class 10 Board exam preparation, lecture reference"
              className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-slate-900 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Confirm & Generate Loan Slip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
