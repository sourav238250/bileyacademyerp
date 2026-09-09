import React, { useState } from 'react';
import { AdminUser, AdminRole } from '../../types';
import { InstituteLogo } from '../common/InstituteLogo';
import { auth, googleProvider, signInWithPopup } from '../../services/firebase';
import {
  GraduationCap,
  Lock,
  Mail,
  Key,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  X,
  AlertCircle,
  Globe,
} from 'lucide-react';

export const DEMO_ADMIN_ACCOUNTS: { user: AdminUser; password: string; description: string }[] = [
  {
    user: {
      id: 'ADM-001',
      name: 'Dr. Birendra Nath Biley',
      email: 'director@bileyacademy.edu',
      role: 'Super Admin / Director',
      designation: 'Director & Founder',
    },
    password: 'admin',
    description: 'Full administrative access across all modules, faculty & finances',
  },
  {
    user: {
      id: 'ADM-002',
      name: 'Prof. Ananya Sen',
      email: 'academic@bileyacademy.edu',
      role: 'Academic Administrator',
      designation: 'Academic Dean & Admissions Head',
    },
    password: 'admin',
    description: 'Admissions, curriculum distribution, examinations & report cards',
  },
  {
    user: {
      id: 'ADM-003',
      name: 'S. Mukherjee',
      email: 'accounts@bileyacademy.edu',
      role: 'Accounts & Cashier',
      designation: 'Chief Accounts Officer',
    },
    password: 'admin',
    description: 'Student fee deposits, receipts, dues tracking & financial ledgers',
  },
  {
    user: {
      id: 'ADM-004',
      name: 'Dr. Debabrata Roy',
      email: 'faculty@bileyacademy.edu',
      role: 'Faculty Mentor',
      designation: 'Senior Physics Lead',
    },
    password: 'admin',
    description: 'Class timetable, marks evaluation & student performance reviews',
  },
];

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (admin: AdminUser) => void;
  isMandatoryLock?: boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isMandatoryLock = false,
}) => {
  const [email, setEmail] = useState('director@bileyacademy.edu');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setErrorMessage('');
      setIsGoogleLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const adminProfile: AdminUser = {
        id: user.uid,
        name: user.displayName || 'Authorized Administrator',
        email: user.email || 'admin@bileyacademy.edu',
        role: 'Super Admin / Director',
        designation: 'Director & Authenticated Administrator',
        avatarUrl: user.photoURL || undefined,
        lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      onLoginSuccess(adminProfile);
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      setErrorMessage(err?.message || 'Google Sign-in failed. Please try again or use standard credentials.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const match = DEMO_ADMIN_ACCOUNTS.find(
        (acc) => acc.user.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (match && (match.password === password || password === 'admin' || password === 'admin123')) {
        const loggedUser: AdminUser = {
          ...match.user,
          lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        onLoginSuccess(loggedUser);
        if (onClose) onClose();
      } else {
        // Allow custom email if entered with simple password
        if (email.includes('@') && password.length >= 3) {
          const customAdmin: AdminUser = {
            id: `ADM-${Date.now().toString().slice(-4)}`,
            name: email.split('@')[0].toUpperCase(),
            email: email.trim(),
            role: 'Super Admin / Director',
            designation: 'Verified Administrator',
            lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          onLoginSuccess(customAdmin);
          if (onClose) onClose();
        } else {
          setErrorMessage('Invalid credentials. Select one of the quick demo roles below or enter valid credentials.');
        }
      }
      setIsLoading(false);
    }, 300);
  };

  const handleQuickLogin = (account: (typeof DEMO_ADMIN_ACCOUNTS)[0]) => {
    setEmail(account.user.email);
    setPassword(account.password);
    setErrorMessage('');
    const loggedUser: AdminUser = {
      ...account.user,
      lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onLoginSuccess(loggedUser);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-7 relative">
          {!isMandatoryLock && onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <InstituteLogo size="lg" variant="rounded" withGlow={true} withBorder={true} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded">
                  Secure ERP Access
                </span>
                <span className="text-[11px] text-amber-400/80 font-medium">Since 2026</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Biley Academy Staff Login
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Enter administrative credentials to manage student admissions, subject curriculum, exams, and fee registers.
          </p>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-7 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Firebase Google Auth Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              id="google-signin-btn"
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-2xl border-2 border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting Google Account...' : 'Continue with Google Account'}</span>
            </button>
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-3 text-[10px] uppercase font-bold text-slate-600 bg-white tracking-widest">
                Or Staff PIN Access
              </span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@bileyacademy.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Access Password / Security PIN
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Demo: admin</span>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              id="admin-login-submit-btn"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Authenticate & Open Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                1-Click Quick Demo Roles
              </span>
              <span className="text-[10px] text-slate-400">Click any role to test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_ADMIN_ACCOUNTS.map((acc) => (
                <button
                  key={acc.user.id}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50/70 hover:border-amber-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-amber-900 truncate">
                      {acc.user.name.split(' ')[0]} {acc.user.name.split(' ').slice(-1)[0]}
                    </span>
                    <span className="text-[9px] font-bold uppercase bg-slate-200 group-hover:bg-amber-200 text-slate-800 px-1.5 py-0.5 rounded">
                      {acc.user.role.split('/')[0].trim()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                    {acc.user.designation}
                  </p>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
