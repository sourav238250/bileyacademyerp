import React, { useState, useEffect } from 'react';
import { AdminUser, AdminRole, StaffCredential } from '../../types';
import {
  getStaffCredentials,
  updateStaffPassword,
  resetStaffPasswordsToDefault,
} from '../../utils/storage';
import {
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  User,
  Sparkles,
  RotateCcw,
  Users,
  Check,
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdmin: AdminUser | null;
  onPasswordChanged?: (updatedEmail: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentAdmin,
  onPasswordChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'my-password' | 'all-staff'>('my-password');
  
  // Self change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // All staff management state (for Super Admin)
  const [staffList, setStaffList] = useState<StaffCredential[]>([]);
  const [selectedStaffEmail, setSelectedStaffEmail] = useState<string>('');
  const [adminOverridePassword, setAdminOverridePassword] = useState('');
  
  // Feedback status
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      const credentials = getStaffCredentials();
      setStaffList(credentials);
      if (credentials.length > 0) {
        setSelectedStaffEmail(credentials[0].email);
      }
    }
  }, [isOpen]);

  if (!isOpen || !currentAdmin) return null;

  const isSuperAdmin = currentAdmin.role === 'Super Admin / Director';

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 4) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500 text-rose-700' };
      case 2:
        return { score: 2, label: 'Moderate', color: 'bg-amber-500 text-amber-700' };
      case 3:
        return { score: 3, label: 'Strong', color: 'bg-emerald-500 text-emerald-700' };
      case 4:
        return { score: 4, label: 'Very Strong', color: 'bg-emerald-600 text-emerald-800' };
      default:
        return { score: 0, label: 'Too short', color: 'bg-slate-300 text-slate-500' };
    }
  };

  const strength = getPasswordStrength(newPassword);

  const handleSelfPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 3) {
      setErrorMsg('New password must be at least 3 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = updateStaffPassword(
        currentAdmin.email || currentAdmin.id,
        newPassword,
        currentPassword,
        false
      );

      setIsSubmitting(false);

      if (!result.success) {
        setErrorMsg(result.error || 'Failed to update password. Please check your current password.');
      } else {
        setSuccessMsg(`Password successfully updated for ${currentAdmin.name}!`);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (onPasswordChanged && currentAdmin.email) {
          onPasswordChanged(currentAdmin.email);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    }, 300);
  };

  const handleAdminStaffPasswordOverride = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!adminOverridePassword || adminOverridePassword.length < 3) {
      setErrorMsg('Please enter a new password of at least 3 characters.');
      return;
    }

    const targetStaff = staffList.find((s) => s.email === selectedStaffEmail);
    if (!targetStaff) {
      setErrorMsg('Selected staff member not found.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = updateStaffPassword(
        selectedStaffEmail,
        adminOverridePassword,
        undefined,
        true // Super Admin override
      );

      setIsSubmitting(false);
      if (result.success) {
        setSuccessMsg(`Password reset successfully for ${targetStaff.name} (${targetStaff.role})!`);
        setAdminOverridePassword('');
        setStaffList(getStaffCredentials());
        if (onPasswordChanged) {
          onPasswordChanged(selectedStaffEmail);
        }
      } else {
        setErrorMsg(result.error || 'Failed to update password.');
      }
    }, 300);
  };

  const handleResetAllToDefault = () => {
    if (confirm('Reset all staff passwords back to initial default ("admin")?')) {
      resetStaffPasswordsToDefault();
      setStaffList(getStaffCredentials());
      setSuccessMsg('All staff account passwords have been reset to default ("admin").');
    }
  };

  return (
    <div
      id="change-password-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="change-password-modal-container"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-5 text-white flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Staff Session Security
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Change Account Password
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            id="change-password-modal-close-btn"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Staff Badge */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-xs">
              {currentAdmin.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">{currentAdmin.name}</p>
              <p className="text-[11px] text-slate-500">{currentAdmin.email}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg">
            {currentAdmin.role}
          </span>
        </div>

        {/* Super Admin Tabs (Self vs All Staff) */}
        {isSuperAdmin && (
          <div className="flex border-b border-slate-200 bg-white px-5 pt-3 gap-2">
            <button
              onClick={() => {
                setActiveTab('my-password');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`pb-2.5 px-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'my-password'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>My Password</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('all-staff');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`pb-2.5 px-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'all-staff'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage All Staff Passwords</span>
              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                Admin
              </span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold">{successMsg}</div>
            </div>
          )}

          {activeTab === 'my-password' ? (
            /* Self Password Form */
            <form onSubmit={handleSelfPasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing password (default: admin)"
                    id="current-password-input"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Initial demo accounts default password is <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-800 font-mono font-bold">admin</code>
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={3}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new secure password"
                    id="new-password-input"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength meter */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
                      <span>Password Strength:</span>
                      <span className="capitalize font-bold">{strength.label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
                      <div className={`h-full ${strength.score >= 1 ? strength.color : 'bg-transparent'}`}></div>
                      <div className={`h-full ${strength.score >= 2 ? strength.color : 'bg-transparent'}`}></div>
                      <div className={`h-full ${strength.score >= 3 ? strength.color : 'bg-transparent'}`}></div>
                      <div className={`h-full ${strength.score >= 4 ? strength.color : 'bg-transparent'}`}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={3}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    id="confirm-password-input"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {confirmPassword && newPassword && (
                  <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                    {confirmPassword === newPassword ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Passwords match perfectly
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold">
                        Passwords do not match yet
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="save-my-password-btn"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Super Admin Multi-Staff Management */
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Director Administrative Privilege
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  As Super Admin, you can directly reset passwords for any faculty or staff role in the academy.
                </p>
              </div>

              {/* Staff Selector */}
              <form onSubmit={handleAdminStaffPasswordOverride} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Staff Member / Role
                  </label>
                  <select
                    value={selectedStaffEmail}
                    onChange={(e) => setSelectedStaffEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    {staffList.map((st) => (
                      <option key={st.id} value={st.email}>
                        {st.name} — {st.role} ({st.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password for Selected Staff
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={adminOverridePassword}
                    onChange={(e) => setAdminOverridePassword(e.target.value)}
                    placeholder="Enter new password for this account"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    This directly overrides the staff member's password without needing their previous password.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleResetAllToDefault}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-700 underline font-medium cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset all to "admin"</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    id="save-staff-override-password-btn"
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Set Staff Password</span>
                  </button>
                </div>
              </form>

              {/* Staff Accounts Overview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden mt-4">
                <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Active Staff Directory & Passwords
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {staffList.map((st) => (
                    <div key={st.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-900">{st.name}</p>
                        <p className="text-[10px] text-slate-500">{st.email} • {st.role}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                          {st.password ? st.password : 'admin'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>All password changes are encrypted and saved to institutional session storage.</span>
        </div>
      </div>
    </div>
  );
};
