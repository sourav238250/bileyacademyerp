import React, { useState, useEffect } from 'react';
import { Investor } from '../../types';
import { generateInvestorCode } from '../../utils/investorUtils';
import {
  X,
  UserPlus,
  Briefcase,
  Mail,
  Phone,
  CreditCard,
  Building,
  MapPin,
  Percent,
  FileText,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

interface InvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveInvestor: (investor: Investor) => void;
  investorToEdit?: Investor | null;
  existingInvestorsCount: number;
}

export const InvestorModal: React.FC<InvestorModalProps> = ({
  isOpen,
  onClose,
  onSaveInvestor,
  investorToEdit,
  existingInvestorsCount,
}) => {
  const [name, setName] = useState('');
  const [investorCode, setInvestorCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [bankAccountOrUpi, setBankAccountOrUpi] = useState('');
  const [bankName, setBankName] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Settled'>('Active');
  const [targetRoiPercent, setTargetRoiPercent] = useState<number | ''>(8.5);
  const [investmentPurpose, setInvestmentPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [joinedDate, setJoinedDate] = useState(new Date().toISOString().slice(0, 10));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
    if (investorToEdit) {
      setName(investorToEdit.name || '');
      setInvestorCode(investorToEdit.investorCode || '');
      setEmail(investorToEdit.email || '');
      setPhone(investorToEdit.phone || '');
      setPanNumber(investorToEdit.panNumber || '');
      setAadhaarNumber(investorToEdit.aadhaarNumber || '');
      setBankAccountOrUpi(investorToEdit.bankAccountOrUpi || '');
      setBankName(investorToEdit.bankName || '');
      setAddress(investorToEdit.address || '');
      setStatus(investorToEdit.status || 'Active');
      setTargetRoiPercent(investorToEdit.targetRoiPercent ?? '');
      setInvestmentPurpose(investorToEdit.investmentPurpose || '');
      setNotes(investorToEdit.notes || '');
      setJoinedDate(investorToEdit.joinedDate || new Date().toISOString().slice(0, 10));
    } else {
      setName('');
      setInvestorCode(generateInvestorCode(existingInvestorsCount));
      setEmail('');
      setPhone('');
      setPanNumber('');
      setAadhaarNumber('');
      setBankAccountOrUpi('');
      setBankName('');
      setAddress('');
      setStatus('Active');
      setTargetRoiPercent(8.5);
      setInvestmentPurpose('Working Capital Infusion & Academy Expansion Fund');
      setNotes('');
      setJoinedDate(new Date().toISOString().slice(0, 10));
    }
  }, [investorToEdit, existingInvestorsCount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Investor Full Name is required.');
      return;
    }

    const payload: Investor = {
      id: investorToEdit && investorToEdit.id ? investorToEdit.id : `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      investorCode: investorCode.trim() || generateInvestorCode(existingInvestorsCount),
      name: trimmedName,
      email: email.trim(),
      phone: phone.trim() || '+91 - Not Provided',
      panNumber: panNumber.trim().toUpperCase() || undefined,
      aadhaarNumber: aadhaarNumber.trim() || undefined,
      bankAccountOrUpi: bankAccountOrUpi.trim() || undefined,
      bankName: bankName.trim() || undefined,
      address: address.trim() || undefined,
      status,
      targetRoiPercent: targetRoiPercent !== '' ? Number(targetRoiPercent) : undefined,
      investmentPurpose: investmentPurpose.trim() || undefined,
      notes: notes.trim() || undefined,
      joinedDate: joinedDate || new Date().toISOString().slice(0, 10),
      createdAt: investorToEdit?.createdAt || new Date().toISOString(),
    };

    onSaveInvestor(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                {investorToEdit ? 'Edit Investor Account' : 'Register New Academy Investor'}
              </h2>
              <p className="text-xs text-slate-300">
                Institutional investor profile for capital infusion, liquidity support & withdrawal tracking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Notice */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-4 flex-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Investor Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Subir Sen"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full pl-3 pr-3 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Investor Code / ID Ref
              </label>
              <input
                type="text"
                placeholder="e.g. INV-001"
                value={investorCode}
                onChange={(e) => setInvestorCode(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold text-indigo-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="e.g. +91 98302 11984"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="e.g. dr.subir.sen@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                PAN Card Number
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="e.g. AAFPS8912K"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm font-bold uppercase tracking-wider border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Agreed ROI / Interest %
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 8.5"
                  value={targetRoiPercent}
                  onChange={(e) => setTargetRoiPercent(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-3 pr-8 py-2 text-sm font-bold text-emerald-700 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">% p.a.</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Onboarding Date
              </label>
              <input
                type="date"
                value={joinedDate}
                onChange={(e) => setJoinedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </div>

          {/* Banking / UPI Disbursement details */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              <span>Investor Bank Account & Repayment Settlement Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bank Account No / IFSC / UPI ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC A/C 50100482910291 or upi@okhdfc"
                  value={bankAccountOrUpi}
                  onChange={(e) => setBankAccountOrUpi(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bank Name & Branch
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, Salt Lake Branch"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Primary Purpose / Investment Head
            </label>
            <input
              type="text"
              placeholder="e.g. Core Working Capital Infusion & Smart Physics Lab Expansion"
              value={investmentPurpose}
              onChange={(e) => setInvestmentPurpose(e.target.value)}
              className="w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Address & Institutional Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Terms of investment, withdrawal terms, quarterly profit share agreement..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-investor-btn"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-600 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{investorToEdit ? 'Update Investor Profile' : 'Save Investor Profile'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
