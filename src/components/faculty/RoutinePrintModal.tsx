import React, { useRef } from 'react';
import { Faculty, Subject, TimetableSlot, ClassLevel, StreamType } from '../../types';
import { InstituteLogo } from '../common/InstituteLogo';
import { Printer, X, Calendar, User, Clock, MapPin, Phone } from 'lucide-react';

interface RoutinePrintModalProps {
  type: 'class' | 'faculty';
  classLevel?: ClassLevel;
  stream?: StreamType;
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
  facultyMember,
  timetable,
  faculty,
  subjects,
  onClose,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handlePrint = () => {
    window.print();
  };

  // Filter slots
  const relevantSlots = type === 'class'
    ? timetable.filter((s) => s.classLevel === classLevel && (classLevel === '11' || classLevel === '12' ? s.stream === stream : true))
    : timetable.filter((s) => s.facultyId === facultyMember?.id);

  // Group slots by day
  const slotsByDay: Record<string, TimetableSlot[]> = {};
  daysOfWeek.forEach((day) => {
    slotsByDay[day] = relevantSlots.filter((s) => s.day === day);
  });

  const totalPeriods = relevantSlots.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Top Action Bar (hidden on print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {type === 'class' ? `Class Routine • Class ${classLevel} (${stream})` : `Faculty Routine • ${facultyMember?.name}`}
              </h3>
              <p className="text-[11px] text-slate-400">Official Institutional Weekly Schedule</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Routine Area */}
        <div
          ref={printAreaRef}
          id="printable-routine-content"
          className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white text-slate-900 font-sans custom-scrollbar print:overflow-visible print:p-0"
        >
          {/* Institutional Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
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
                  <p className="text-[11px] text-slate-500 flex items-center justify-center sm:justify-start gap-3 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> Jamna, Pingla, Paschim Medinipur, Pin-721140, W.B.</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> +91 9732531730</span>
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l sm:border-slate-200 pt-3 sm:pt-0 sm:pl-6">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6 text-xs">
            {type === 'class' ? (
              <>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Class Level</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">Class {classLevel}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Stream / Track</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{stream}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Weekly Lectures</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{totalPeriods} Scheduled Periods</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Schedule Status</span>
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px] uppercase mt-0.5">
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
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{totalPeriods} Periods / {facultyMember?.maxWeeklyHours} hrs max</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Staff Contact</span>
                  <p className="font-mono font-bold text-slate-700 text-xs mt-0.5">{facultyMember?.phone}</p>
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
                    className={`rounded-xl border p-3.5 transition-colors ${
                      isRestDay ? 'bg-slate-50/50 border-slate-200' : 'bg-white border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4.5">
                        {daySlots.map((slot) => {
                          const subject = subjects.find((s) => s.id === slot.subjectId);
                          const teacher = faculty.find((f) => f.id === slot.facultyId);

                          return (
                            <div
                              key={slot.id}
                              className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col justify-between space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                                  <span className="font-mono font-bold text-slate-900">{slot.timeSlot}</span>
                                </div>
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                  {slot.room}
                                </span>
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
          <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
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
};
