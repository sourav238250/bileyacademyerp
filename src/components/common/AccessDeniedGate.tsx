import React, { useState } from 'react';
import { NavigationTab, AdminUser } from '../../types';
import {
  Lock,
  Key,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Smartphone,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  getStaffCredentials,
  verifyStaffCredentials,
  DEFAULT_STAFF_CREDENTIALS,
} from '../../utils/storage';

interface AccessDeniedGateProps {
  sectionName: string;
  onOpenAdminLogin: () => void;
  onNavigateToPortal: () => void;
  onNavigateToTab?: (tab: NavigationTab) => void;
  onOpenPermissionsMatrix?: () => void;
  requiredRoleHint?: string;
  onDirectLogin?: (user: AdminUser) => void;
}

export const AccessDeniedGate: React.FC<AccessDeniedGateProps> = ({
  sectionName,
  onOpenAdminLogin,
  onNavigateToPortal,
  onNavigateToTab,
  onOpenPermissionsMatrix,
  requiredRoleHint = 'Institutional Staff / Admin',
  onDirectLogin,
}) => {
  const staffCredentials = getStaffCredentials();
  const [usernameOrEmail, setUsernameOrEmail] = useState('director');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInlineLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = verifyStaffCredentials(usernameOrEmail, password);
      if (result.success && result.user) {
        if (onDirectLogin) {
          onDirectLogin(result.user);
        } else {
          onOpenAdminLogin();
        }
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify your username and password.');
      }
      setIsLoading(false);
    }, 200);
  };

  const handleSelectStaff = (username: string, defaultPw: string) => {
    setUsernameOrEmail(username);
    setPassword(defaultPw);
    setErrorMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto my-8 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-9 animate-in fade-in zoom-in-95">
      
      {/* Header Badge & Title */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700 bg-slate-100 border border-slate-300 px-3 py-1 rounded-full">
          ERP Section Locked • Authentication Required
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-3 mb-1.5">
          Sign In to Access {sectionName}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Please enter your authorized username/email and password to unlock this management section.
        </p>
      </div>

      {/* Inline Authentication Form */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6">
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleInlineLogin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Staff User Name / Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. director, accounts, academic, faculty"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Staff Password
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Demo: admin</span>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            id="gate-verify-login-btn"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Verify Password & Open {sectionName}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </>
            )}
          </button>
        </form>

        {/* Quick Staff Selection Chips */}
        <div className="mt-4 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Select Staff Profile to Fill:
            </span>
            {onOpenPermissionsMatrix && (
              <button
                onClick={onOpenPermissionsMatrix}
                className="text-[10px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3 h-3" />
                <span>Role Matrix</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {staffCredentials.slice(0, 4).map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleSelectStaff(acc.username || acc.email, acc.password || 'admin')}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  usernameOrEmail.toLowerCase() === (acc.username || '').toLowerCase() ||
                  usernameOrEmail.toLowerCase() === acc.email.toLowerCase()
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-400'
                    : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs'
                }`}
              >
                <div className="text-[11px] font-bold truncate">{acc.name}</div>
                <div className="text-[9px] text-slate-500 flex items-center justify-between">
                  <span>{acc.username || acc.role.split('/')[0]}</span>
                  <span className="text-amber-700 font-mono">admin</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
        <span className="text-[11px]">
          Authorization Role: <strong className="text-slate-800">{requiredRoleHint}</strong>
        </span>
        <button
          onClick={onNavigateToPortal}
          id="access-denied-portal-btn"
          className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
          <span>Switch to Student Portal</span>
        </button>
      </div>

    </div>
  );
};
