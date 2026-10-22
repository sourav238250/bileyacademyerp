import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Faculty, Subject, TimetableSlot, ClassLevel, StreamType } from '../../types';
import { InstituteLogo } from '../common/InstituteLogo';
import { generateRoutinePDF } from '../../utils/routinePdfGenerator';
import { Printer, X, Calendar, User, Clock, MapPin, Phone, FileDown, CheckCircle2 } from 'lucide-react';

interface RoutinePrintModalProps {
  type: 'class' | 'faculty';
  classLevel?: ClassLevel | string;
  stream?: StreamType | string;
  curriculum?: 'CBSE' | 'W.B. Board';
  facultyMember?: Faculty;
  timetable: TimetableSlot[];
  faculty: Faculty[];
  subjects: Subject[];
  onClose: () => void;
}


export const RoutinePrintModal: React.FC<RoutinePrintModalProps> = ({
  type,
  classLevel = '10',
  stream = 'General',
  curriculum,
  facultyMember,
  timetable,
  faculty,
  subjects,
  onClose,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Add body class on mount so print media queries specifically target active routine printing
  useEffect(() => {
    document.body.classList.add('has-routine-print-open');
    return () => {
      document.body.classList.remove('has-routine-print-open');
    };
  }, []);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 120);
  };

  const handleDownloadPDF = () => {
    try {
      setIsDownloadingPdf(true);
      const doc = generateRoutinePDF({
        type,
        classLevel,
        stream,
        facultyMember,
        timetable,
        faculty,
        subjects,
      });

      const filename = type === 'class'
        ? `Biley_Academy_Class_${classLevel}_${stream}_Routine_2026-27.pdf`
        : `Biley_Academy_Routine_${(facultyMember?.name || 'Faculty').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

      doc.save(filename);
      setDownloadSuccessNotice(`Downloaded ${filename} successfully!`);
      setTimeout(() => setDownloadSuccessNotice(null), 4000);
    } catch (err) {
      console.error('Failed to generate routine PDF:', err);
      // Fallback to browser print dialog
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Filter slots
  const relevantSlots = type === 'class'
    ? timetable.filter(
        (s) =>
          s.classLevel === classLevel &&
          (classLevel === '11' || classLevel === '12' ? s.stream === stream : true) &&
          (!curriculum || s.curriculum === curriculum)
      )
    : timetable.filter((s) => s.facultyId === facultyMember?.id);

  // Group slots by day
  const slotsByDay: Record<string, TimetableSlot[]> = {};
  daysOfWeek.forEach((day) => {
    slotsByDay[day] = relevantSlots.filter((s) => s.day === day);
  });

  const totalPeriods = relevantSlots.length;

  const modalContent = (
    <div
      id="routine-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-transparent print:static print:inset-auto print:overflow-visible print:block print:w-full print:h-auto"
    >
      <div
        id="routine-modal-card"
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 border border-slate-200 flex flex-col max-h-[92vh] sm:max-h-[90vh] print:max-h-none print:h-auto print:border-none print:shadow-none print:m-0 print:w-full print:max-w-none print:rounded-none print:block print:static"
      >
        
        {/* Modal Top Action Bar (strictly hidden on print) */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between print:hidden shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate">
                {type === 'class' ? `Class Routine • Class ${classLevel} (${stream})` : `Faculty Routine • ${facultyMember?.name}`}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">Official Institutional Weekly Schedule</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {downloadSuccessNotice && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {downloadSuccessNotice}
              </span>
            )}

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              id="routine-download-pdf-btn"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Download vector PDF directly"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span className="hidden xs:inline">Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              id="routine-print-dialog-btn"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              title="Open browser print and 'Save as PDF' dialog box"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              id="routine-modal-close-btn"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Routine Area */}
        <div
          ref={printAreaRef}
          id="printable-routine-content"
          className="flex-1 overflow-y-auto p-6 sm:p-10 md:p-12 bg-white text-slate-900 font-sans custom-scrollbar print:overflow-visible print:p-0 print:m-0 print:block"
        >
          {/* Institutional Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-5 sm:pb-6 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-4">
                <InstituteLogo size="lg" variant="rounded" withBorder={true} />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase">
                    BILEY ACADEMY
                  </h1>
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mt-0.5">
                    Academic Governance & Timetable Cell
                  </p>
                  <p className="text-[11px] text-slate-500 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> Jamna, Pingla, Paschim Medinipur, Pin-721140, W.B.</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> +91 9732531730</span>
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l sm:border-slate-200 pt-3 sm:pt-0 sm:pl-6 shrink-0">
                <span className="inline-block px-3 py-1 bg-slate-900 text-amber-400 rounded-lg text-xs font-black uppercase tracking-wider mb-1">
                  {type === 'class' ? 'CLASS ROUTINE' : 'FACULTY DUTY SCHEDULE'}
                </span>
                <p className="text-xs font-bold text-slate-800">
                  Academic Session: 2026 – 2027
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {type === 'class' ? `Target: Class ${classLevel} (${stream})` : `Mentor: ${facultyMember?.name}`}
                </p>
              </div>
            </div>
          </div>

          {/* Routine Meta Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6 text-xs print:bg-slate-50/70 print:border-slate-300">
            {type === 'class' ? (
              <>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Class Level</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">Class {classLevel}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Board / Stream</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{curriculum ? `${curriculum} (${stream})` : stream}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Weekly Lectures</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{totalPeriods} Scheduled Periods</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Schedule Status</span>
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 print:border print:border-emerald-300 font-bold rounded text-[10px] uppercase mt-0.5">
                    Official & Verified
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Faculty Member</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{facultyMember?.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Designation</span>
                  <p className="font-bold text-purple-800 text-xs mt-0.5">{facultyMember?.designation}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Workload / Cap</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{totalPeriods} Periods / {facultyMember?.maxWeeklyHours || 20} hrs max</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Staff Contact</span>
                  <p className="font-mono font-bold text-slate-700 text-xs mt-0.5">{facultyMember?.phone || '+91 9732531730'}</p>
                </div>
              </>
            )}
          </div>

          {/* Timetable Weekly Day-By-Day Schedule */}
          <div className="space-y-4 mb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-200">
              Weekly Class & Lecture Distribution (Monday – Sunday)
            </h4>

            <div className="space-y-3">
              {daysOfWeek.map((day) => {
                const daySlots = slotsByDay[day] || [];
                const isRestDay = daySlots.length === 0;

                return (
                  <div
                    key={day}
                    className={`routine-day-card rounded-xl border p-3.5 transition-colors print:break-inside-avoid print:page-break-inside-avoid print:mb-3 ${
                      isRestDay ? 'bg-slate-50/50 border-slate-200 print:bg-slate-50/40 print:border-slate-200' : 'bg-white border-slate-300 shadow-xs print:bg-white print:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-900 print:bg-slate-900"></span>
                        <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                          {day}
                        </h5>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">
                        {isRestDay ? 'No Scheduled Classes (Study / Recess)' : `${daySlots.length} Lecture Slot${daySlots.length > 1 ? 's' : ''}`}
                      </span>
                    </div>

                    {isRestDay ? (
                      <p className="text-[11px] text-slate-400 italic pl-4.5">Self-study, doubt clearing, or institution recess.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-2 pl-4.5">
                        {daySlots.map((slot) => {
                          const subject = subjects.find((s) => s.id === slot.subjectId);
                          const teacher = faculty.find((f) => f.id === slot.facultyId);

                          return (
                            <div
                              key={slot.id}
                              className="p-2.5 bg-slate-50 print:bg-slate-50/80 rounded-lg border border-slate-200 print:border-slate-300 text-xs flex flex-col justify-between space-y-1.5 print:break-inside-avoid"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                                  <span className="font-mono font-bold text-slate-900">{slot.timeSlot}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                    slot.curriculum === 'W.B. Board'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                                  }`}>
                                    {slot.curriculum || 'CBSE'}
                                  </span>
                                  <span className="bg-emerald-100 text-emerald-800 print:border print:border-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                    {slot.room}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-900">
                                  {subject?.name || slot.subjectId} {type === 'faculty' ? `(Class ${slot.classLevel})` : ''}
                                </span>
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  {slot.batch.split('(')[0]}
                                </span>
                              </div>

                              {type === 'class' && (
                                <div className="text-[10px] text-slate-600 flex items-center gap-1 pt-1 border-t border-slate-200/60">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span>Faculty: <strong className="text-slate-800">{teacher?.name || 'Unassigned'}</strong> ({teacher?.designation})</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Institutional Stamp & Signature Area */}
          <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs print:break-inside-avoid">
            <div className="text-center sm:text-left">
              <p className="font-bold text-slate-900 uppercase">Biley Academy Academic Council</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Automated Academic Management & Timetable System</p>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">Generated: {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
            </div>

            <div className="flex items-center gap-8 text-center">
              <div>
                <div className="w-32 h-10 border-b border-slate-400 flex items-end justify-center pb-1">
                  <span className="font-serif italic font-bold text-slate-800 text-sm">Mr. Sourav Dinda</span>
                </div>
                <p className="text-[10px] font-bold text-slate-700 uppercase mt-1">Director Authority</p>
              </div>

              <div>
                <div className="w-32 h-10 border-b border-slate-400 flex items-end justify-center pb-1">
                  <span className="font-serif italic font-bold text-slate-800 text-sm">Prof. Ananya Sen</span>
                </div>
                <p className="text-[10px] font-bold text-slate-700 uppercase mt-1">Academic Dean</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
