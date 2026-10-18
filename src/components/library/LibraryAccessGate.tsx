import React, { useState } from 'react';
import { Student, Faculty, AdminUser, LibrarySessionUser } from '../../types';
import { InstituteLogo } from '../common/InstituteLogo';
import {
  Library,
  GraduationCap,
  Users,
  ShieldCheck,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  KeyRound,
  UserCheck,
} from 'lucide-react';

interface LibraryAccessGateProps {
  students: Student[];
  faculty: Faculty[];
  currentAdmin: AdminUser | null;
  onAuthenticate: (user: LibrarySessionUser) => void;
  onOpenAdminLogin: () => void;
}

export const LibraryAccessGate: React.FC<LibraryAccessGateProps> = ({
  students,
  faculty,
  currentAdmin,
  onAuthenticate,
  onOpenAdminLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'faculty' | 'staff'>('student');
  
  // Student Mobile State
  const [mobileInput, setMobileInput] = useState('');
  const [studentError, setStudentError] = useState<string | null>(null);

  // Faculty State
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [facultyPin, setFacultyPin] = useState('');
  const [facultyError, setFacultyError] = useState<string | null>(null);

  // Helper to normalize phone numbers
  const normalizePhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
  };

  const handleStudentLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStudentError(null);
    const cleanNumber = normalizePhone(mobileInput);
    if (cleanNumber.length !== 10) {
      setStudentError('Please enter a valid 10-digit registered mobile number.');
      return;
    }

    const matched = students.find((s) => normalizePhone(s.contactNumber) === cleanNumber);
    if (!matched) {
      setStudentError(`Mobile number (+91 ${cleanNumber}) is not found in registered academy students records. Access to library books is restricted to registered students.`);
      return;
    }

    onAuthenticate({
      role: 'Student',
      id: matched.id,
      name: matched.name,
      subTitle: `Class ${matched.classLevel} • Roll ${matched.rollNo} (${matched.stream})`,
      contactNumber: matched.contactNumber,
      authenticatedAt: new Date().toISOString(),
    });
  };

  const handleQuickStudentLogin = (st: Student) => {
    onAuthenticate({
      role: 'Student',
      id: st.id,
      name: st.name,
      subTitle: `Class ${st.classLevel} • Roll ${st.rollNo} (${st.stream})`,
      contactNumber: st.contactNumber,
      authenticatedAt: new Date().toISOString(),
    });
  };

  const handleFacultyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFacultyError(null);
    if (!selectedFacultyId) {
      setFacultyError('Please select your faculty profile from the list.');
      return;
    }

    const matched = faculty.find((f) => f.id === selectedFacultyId);
    if (!matched) {
      setFacultyError('Faculty member not found.');
      return;
    }

    onAuthenticate({
      role: 'Faculty',
      id: matched.id,
      name: matched.name,
      subTitle: `${matched.designation} • ${matched.email}`,
      contactNumber: matched.phone,
      authenticatedAt: new Date().toISOString(),
    });
  };

  const sampleTestStudents = students.slice(0, 4);

  return (
    <div className="max-w-2xl mx-auto my-6 sm:my-10 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-slate-800 animate-in fade-in zoom-in-95">
      {/* Header Banner */}
      <div className="text-center mb-6">
        <div className="inline-block mb-3">
          <InstituteLogo size="lg" variant="rounded" withBorder={true} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 border border-teal-300 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
          <Library className="w-3.5 h-3.5 text-teal-600" />
          <span>Biley Academy Central Library</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Library & Digital Book Repository
        </h2>
        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl max-w-lg mx-auto text-xs text-amber-900 flex items-start gap-2.5 text-left">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Restricted Institutional Access:</strong> Only registered students, faculty members, and authorized staff can access the book catalog, borrow physical books, and read digital study materials.
          </div>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('student')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'student'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
          <span>Registered Student</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faculty')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'faculty'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-500" />
          <span>Faculty Member</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'staff'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Staff / Librarian</span>
        </button>
      </div>

      {/* Student Authentication Tab */}
      {activeTab === 'student' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-600" />
              <span>Verify Registered Student Mobile Number</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the 10-digit mobile number registered during academy admission to unlock your student library privileges:
            </p>

            {studentError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{studentError}</span>
              </div>
            )}

            <form onSubmit={handleStudentLogin} className="space-y-3">
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
                    setStudentError(null);
                  }}
                  placeholder="Enter 10-digit student mobile"
                  className="w-full pl-12 pr-4 py-2.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:border-amber-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Access Student Library</span>
              </button>
            </form>
          </div>

          {/* Quick Demo Test Students */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quick Test Access (Sample Registered Students)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleTestStudents.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleQuickStudentLogin(st)}
                  className="p-2.5 bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 block truncate group-hover:text-amber-900">
                      {st.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Class {st.classLevel} • Roll {st.rollNo}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Faculty Authentication Tab */}
      {activeTab === 'faculty' && (
        <form onSubmit={handleFacultyLogin} className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Your Faculty Profile</span>
            </h3>
            <p className="text-xs text-slate-500">
              Faculty members can borrow curriculum and reference books for department lecture preparation:
            </p>

            {facultyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{facultyError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Faculty Member
              </label>
              <select
                value={selectedFacultyId}
                onChange={(e) => {
                  setSelectedFacultyId(e.target.value);
                  setFacultyError(null);
                }}
                className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">-- Choose faculty member --</option>
                {faculty.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.designation} ({f.qualification})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Access Faculty Library Portal</span>
            </button>
          </div>
        </form>
      )}

      {/* Staff / Administrator Authentication Tab */}
      {activeTab === 'staff' && (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-4 animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Staff & Librarian Session Login
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Authorized academic administrators, directors, and library officers can manage book inventories, add new arrivals, and process book loans.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAdminLogin}
            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer border border-slate-700"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Sign In with Staff Account</span>
          </button>
        </div>
      )}
    </div>
  );
};
