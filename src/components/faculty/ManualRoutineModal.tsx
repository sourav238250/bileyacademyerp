import React, { useState } from 'react';
import {
  BatchShift,
  ClassLevel,
  Faculty,
  ManualRoutine,
  ManualRoutineSlot,
  StreamType,
  Subject,
  TimetableSlot,
} from '../../types';
import {
  ACADEMY_ROOMS,
  CLASS_LEVELS,
  MAX_CONCURRENT_ROOMS,
  STREAMS_FOR_CLASS,
} from '../../utils/academicUtils';
import {
  CalendarDays,
  Check,
  Clock,
  Copy,
  Layers,
  Plus,
  Sparkles,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';

interface ManualRoutineModalProps {
  existingRoutine?: ManualRoutine | null;
  faculty: Faculty[];
  subjects: Subject[];
  timetable: TimetableSlot[];
  defaultClassLevel?: ClassLevel;
  defaultStream?: StreamType;
  defaultFacultyId?: string;
  onSave: (
    routine: ManualRoutine,
    syncOptions?: {
      syncToTimetable: boolean;
      replaceExisting: boolean;
    }
  ) => void;
  onClose: () => void;
}

const DAYS_OF_WEEK: ManualRoutineSlot['day'][] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const PRESET_TIME_SLOTS = [
  '06:30 AM - 08:00 AM',
  '08:00 AM - 09:30 AM',
  '09:30 AM - 11:00 AM',
  '11:30 AM - 01:00 PM',
  '01:00 PM - 02:30 PM',
  '03:00 PM - 04:30 PM',
  '04:00 PM - 05:30 PM',
  '05:30 PM - 07:00 PM',
  '06:00 PM - 07:30 PM',
  '07:00 PM - 08:30 PM',
];

const BATCH_OPTIONS: BatchShift[] = [
  'Morning Batch (6:30 AM - 9:00 AM)',
  'Evening Batch (4:00 PM - 8:30 PM)',
  'Saturday Evening Batch (3:00 PM - 8:30 PM)',
  'Sunday Morning Batch (6:30 AM - 11:30 AM)',
  'Sunday Evening Batch (3:00 PM - 8:30 PM)',
  'Weekend Intensive (Sat-Sun)',
];

const SESSION_OPTIONS = [
  '2026–2027 (CBSE & W.B. 11–12 Apr–Mar)',
  '2027–2028 (CBSE & W.B. 11–12 Apr–Mar)',
  'New Session 2027 (W.B. 1–10 Jan–Dec)',
  '2026 (W.B. 1–10 Jan–Dec)',
  '2026–2027',
];

export const ManualRoutineModal: React.FC<ManualRoutineModalProps> = ({
  existingRoutine,
  faculty,
  subjects,
  timetable,
  defaultClassLevel = '10',
  defaultStream = 'General',
  defaultFacultyId,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(
    existingRoutine?.title || `Manual Routine • Class ${defaultClassLevel}`
  );
  const [routineType, setRoutineType] = useState<'class' | 'faculty' | 'custom'>(
    existingRoutine?.routineType || 'class'
  );
  const [classLevel, setClassLevel] = useState<ClassLevel>(
    existingRoutine?.classLevel || defaultClassLevel
  );
  const [stream, setStream] = useState<StreamType>(
    existingRoutine?.stream || defaultStream
  );
  const [curriculum, setCurriculum] = useState<'CBSE' | 'W.B. Board' | 'Combined'>(
    existingRoutine?.curriculum || 'CBSE'
  );
  const [facultyId, setFacultyId] = useState<string>(
    existingRoutine?.facultyId || defaultFacultyId || faculty[0]?.id || ''
  );
  const [academicSession, setAcademicSession] = useState<string>(
    existingRoutine?.academicSession || '2026–2027'
  );
  const [effectiveFrom, setEffectiveFrom] = useState<string>(
    existingRoutine?.effectiveFrom || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(existingRoutine?.notes || '');

  const [slots, setSlots] = useState<ManualRoutineSlot[]>(
    existingRoutine?.slots || []
  );

  // Sync to Live Timetable options
  const [syncToTimetable, setSyncToTimetable] = useState<boolean>(false);
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Quick Row Builder State
  const [selectedDays, setSelectedDays] = useState<ManualRoutineSlot['day'][]>([
    'Monday',
    'Wednesday',
    'Friday',
  ]);
  const [draftTimeSlot, setDraftTimeSlot] = useState<string>('04:00 PM - 05:30 PM');
  const [draftSubjectMode, setDraftSubjectMode] = useState<'catalog' | 'custom'>('catalog');
  const [draftSubjectId, setDraftSubjectId] = useState<string>(() => {
    const match = subjects.find((s) => s.classLevel === defaultClassLevel);
    return match?.id || subjects[0]?.id || '';
  });
  const [draftCustomSubject, setDraftCustomSubject] = useState<string>('');
  const [draftFacultyMode, setDraftFacultyMode] = useState<'catalog' | 'custom'>('catalog');
  const [draftFacultyId, setDraftFacultyId] = useState<string>(() => {
    const match = subjects.find((s) => s.classLevel === defaultClassLevel);
    return match?.facultyId || faculty[0]?.id || '';
  });
  const [draftCustomFaculty, setDraftCustomFaculty] = useState<string>('');
  const [draftRoom, setDraftRoom] = useState<string>('ROOM-1');
  const [draftTeachingMode, setDraftTeachingMode] = useState<'Offline' | 'Online' | 'Hybrid'>('Offline');
  const [draftBatch, setDraftBatch] = useState<string>(BATCH_OPTIONS[1]);
  const [draftCurriculum, setDraftCurriculum] = useState<'CBSE' | 'W.B. Board'>(
    curriculum === 'W.B. Board' ? 'W.B. Board' : 'CBSE'
  );

  const matchingSubjects = subjects.filter((s) => {
    if (routineType !== 'class') return true;
    const matchClass = s.classLevel === classLevel;
    const matchStream =
      classLevel === '11' || classLevel === '12'
        ? s.stream === stream || s.stream === 'General'
        : true;
    const matchBoard = curriculum === 'Combined' || s.curriculum === curriculum;
    return matchClass && matchStream && matchBoard;
  });

  const handleToggleDay = (day: ManualRoutineSlot['day']) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddDraftRows = () => {
    setValidationError(null);
    if (selectedDays.length === 0) {
      setValidationError('Please select at least one day of the week to add period rows.');
      return;
    }
    if (!draftTimeSlot.trim()) {
      setValidationError('Please specify a class timing (e.g. 04:00 PM - 05:30 PM).');
      return;
    }

    const subObj = subjects.find((s) => s.id === draftSubjectId);
    const resolvedSubjectName =
      draftSubjectMode === 'custom'
        ? draftCustomSubject.trim()
        : subObj?.name || draftCustomSubject.trim();

    if (!resolvedSubjectName) {
      setValidationError('Please choose a subject or enter a custom subject/activity name.');
      return;
    }

    const facObj = faculty.find((f) => f.id === draftFacultyId);
    const resolvedFacultyName =
      draftFacultyMode === 'custom'
        ? draftCustomFaculty.trim()
        : facObj?.name || draftCustomFaculty.trim() || 'Assigned Mentor';

    const newRows: ManualRoutineSlot[] = selectedDays.map((day, idx) => ({
      id: `MR-SLOT-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      day,
      timeSlot: draftTimeSlot.trim(),
      subjectId: draftSubjectMode === 'catalog' ? draftSubjectId : undefined,
      subjectName: resolvedSubjectName,
      facultyId: draftFacultyMode === 'catalog' ? draftFacultyId : undefined,
      facultyName: resolvedFacultyName,
      room: draftTeachingMode === 'Online' && draftRoom.startsWith('ROOM-') ? 'Online (Virtual Lab)' : draftRoom,
      batch: draftBatch,
      curriculum: draftCurriculum,
      teachingMode: draftTeachingMode,
    }));

    setSlots((prev) => [...prev, ...newRows]);
  };

  const handleCloneExistingSchedule = () => {
    setValidationError(null);
    let sourceSlots: TimetableSlot[] = [];
    if (routineType === 'faculty' && facultyId) {
      sourceSlots = timetable.filter((s) => s.facultyId === facultyId);
    } else {
      sourceSlots = timetable.filter(
        (s) =>
          s.classLevel === classLevel &&
          (classLevel === '11' || classLevel === '12' ? s.stream === stream : true) &&
          (curriculum === 'Combined' || s.curriculum === curriculum)
      );
    }

    if (sourceSlots.length === 0) {
      setValidationError('No existing timetable slots found for the selected filter to clone.');
      return;
    }

    const cloned: ManualRoutineSlot[] = sourceSlots.map((s, idx) => {
      const subObj = subjects.find((sub) => sub.id === s.subjectId);
      const facObj = faculty.find((f) => f.id === s.facultyId);
      return {
        id: `MR-SLOT-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        day: s.day,
        timeSlot: s.timeSlot,
        subjectId: s.subjectId,
        subjectName: s.customSubjectName || subObj?.name || s.subjectId,
        facultyId: s.facultyId,
        facultyName: s.customFacultyName || facObj?.name || 'Assigned Mentor',
        room: s.room,
        batch: s.batch,
        curriculum: s.curriculum || 'CBSE',
        teachingMode: s.teachingMode || (s.room.includes('Online') ? 'Online' : 'Offline'),
      };
    });

    setSlots(cloned);
  };

  const handleUpdateSlotRow = (id: string, patch: Partial<ManualRoutineSlot>) => {
    setSlots((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleDuplicateRow = (row: ManualRoutineSlot) => {
    const copy: ManualRoutineSlot = {
      ...row,
      id: `MR-SLOT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    };
    setSlots((prev) => [...prev, copy]);
  };

  const handleDeleteRow = (id: string) => {
    setSlots((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('Please enter a Routine Title.');
      return;
    }
    if (slots.length === 0) {
      setValidationError('Please add at least one period row to this manual routine before saving.');
      return;
    }

    // If syncing physical rooms to live timetable, validate max 6 out of 8 concurrency limit
    if (syncToTimetable) {
      const baseTimetable = replaceExisting
        ? timetable.filter((existing) => {
            if (routineType === 'faculty' && facultyId) {
              return existing.facultyId !== facultyId;
            }
            if (routineType === 'class') {
              const sameClass = existing.classLevel === classLevel;
              const sameStream =
                classLevel === '11' || classLevel === '12' ? existing.stream === stream : true;
              const sameBoard = curriculum === 'Combined' || existing.curriculum === curriculum;
              return !(sameClass && sameStream && sameBoard);
            }
            return true;
          })
        : [...timetable];

      // Group physical room usage by day+timeSlot
      const roomOccupancyByDayTime = new Map<string, Set<string>>();
      baseTimetable.forEach((s) => {
        if (!ACADEMY_ROOMS.includes(s.room as any)) return;
        const key = `${s.day}__${s.timeSlot}`;
        if (!roomOccupancyByDayTime.has(key)) roomOccupancyByDayTime.set(key, new Set());
        roomOccupancyByDayTime.get(key)!.add(s.room);
      });

      for (const ms of slots) {
        if (!ACADEMY_ROOMS.includes(ms.room as any)) continue;
        const key = `${ms.day}__${ms.timeSlot}`;
        if (!roomOccupancyByDayTime.has(key)) roomOccupancyByDayTime.set(key, new Set());
        const set = roomOccupancyByDayTime.get(key)!;
        set.add(ms.room);
        if (set.size > MAX_CONCURRENT_ROOMS) {
          setValidationError(
            `Room Limit Exceeded when syncing to Live Timetable: ${ms.day} (${ms.timeSlot}) would allocate ${set.size} physical rooms (Policy max: ${MAX_CONCURRENT_ROOMS} out of ${ACADEMY_ROOMS.length}). Switch one slot to Online or another time slot, or uncheck "Sync to Live Timetable".`
          );
          return;
        }
      }
    }

    const nowIso = new Date().toISOString();
    const routine: ManualRoutine = {
      id: existingRoutine?.id || `MR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      routineType,
      classLevel: routineType === 'class' ? classLevel : undefined,
      stream: routineType === 'class' ? stream : undefined,
      curriculum: routineType === 'class' ? curriculum : undefined,
      facultyId: routineType === 'faculty' ? facultyId : undefined,
      academicSession,
      effectiveFrom,
      notes: notes.trim() || undefined,
      slots,
      createdAt: existingRoutine?.createdAt || nowIso,
      updatedAt: nowIso,
      syncedToTimetable: syncToTimetable || existingRoutine?.syncedToTimetable,
    };

    onSave(routine, { syncToTimetable, replaceExisting });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden my-4 border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {existingRoutine ? 'Edit Manual Routine' : 'Create Manual Routine'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Build a custom weekly schedule manually for any class, batch, or faculty member.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Routine Metadata & Scope */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                1. Routine Details & Target Scope
              </h4>

              {routineType !== 'custom' && (
                <button
                  type="button"
                  onClick={handleCloneExistingSchedule}
                  className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold rounded-lg border border-purple-300 flex items-center gap-1.5 cursor-pointer transition-colors text-[11px] self-start"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                  <span>Load / Clone Current Schedule into Builder</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Routine Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Class 10 Special Evening Batch Routine"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Routine Scope</label>
                <select
                  value={routineType}
                  onChange={(e) => {
                    const nextType = e.target.value as 'class' | 'faculty' | 'custom';
                    setRoutineType(nextType);
                    if (!existingRoutine) {
                      if (nextType === 'class') setTitle(`Manual Routine • Class ${classLevel}`);
                      else if (nextType === 'faculty') {
                        const facName = faculty.find((f) => f.id === facultyId)?.name || 'Faculty';
                        setTitle(`Manual Routine • ${facName}`);
                      } else {
                        setTitle('Custom Special Batch Routine');
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold"
                >
                  <option value="class">Class Routine (Classes 1–12)</option>
                  <option value="faculty">Faculty / Mentor Routine</option>
                  <option value="custom">Custom / Special Batch Routine</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {routineType === 'class' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Class Level</label>
                    <select
                      value={classLevel}
                      onChange={(e) => {
                        const cls = e.target.value as ClassLevel;
                        setClassLevel(cls);
                        const validStreams = STREAMS_FOR_CLASS[cls];
                        if (!validStreams.includes(stream)) setStream(validStreams[0] as StreamType);
                        const sub = subjects.find((s) => s.classLevel === cls);
                        if (sub) {
                          setDraftSubjectId(sub.id);
                          setDraftFacultyId(sub.facultyId);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {CLASS_LEVELS.map((c) => (
                        <option key={c} value={c}>
                          Class {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Stream</label>
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value as StreamType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {STREAMS_FOR_CLASS[classLevel].map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Curriculum Board</label>
                    <select
                      value={curriculum}
                      onChange={(e) => {
                        const val = e.target.value as 'CBSE' | 'W.B. Board' | 'Combined';
                        setCurriculum(val);
                        if (val !== 'Combined') setDraftCurriculum(val);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="CBSE">CBSE</option>
                      <option value="W.B. Board">W.B. Board</option>
                      <option value="Combined">Combined (CBSE & W.B.)</option>
                    </select>
                  </div>
                </>
              )}

              {routineType === 'faculty' && (
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Target Faculty Member</label>
                  <select
                    value={facultyId}
                    onChange={(e) => {
                      setFacultyId(e.target.value);
                      setDraftFacultyId(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.designation})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Session</label>
                <select
                  value={academicSession}
                  onChange={(e) => setAcademicSession(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {SESSION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Effective From</label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className={routineType === 'class' ? 'sm:col-span-2 lg:col-span-3' : 'sm:col-span-2'}>
                <label className="block font-semibold text-slate-700 mb-1">Remarks / Instructions (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Doubt clearing & mock test included every Sunday."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Quick Multi-Day Period Adder */}
          <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-bold text-purple-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-purple-700" />
                2. Add Class Period(s) Manually
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDays(['Monday', 'Wednesday', 'Friday'])}
                  className="px-2 py-1 text-[10px] font-bold bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-md cursor-pointer"
                >
                  Mon / Wed / Fri
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDays(['Tuesday', 'Thursday', 'Saturday'])}
                  className="px-2 py-1 text-[10px] font-bold bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-md cursor-pointer"
                >
                  Tue / Thu / Sat
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDays([...DAYS_OF_WEEK])}
                  className="px-2 py-1 text-[10px] font-bold bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-md cursor-pointer"
                >
                  All 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDays(['Sunday'])}
                  className="px-2 py-1 text-[10px] font-bold bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-md cursor-pointer"
                >
                  Sunday Only
                </button>
              </div>
            </div>

            {/* Day checkboxes */}
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      active
                        ? 'bg-purple-700 text-white border-purple-800 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {active && <Check className="w-3 h-3" />}
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>

            {/* Row fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              {/* Time */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Time Slot *</label>
                <input
                  type="text"
                  list="manual-routine-preset-times"
                  value={draftTimeSlot}
                  onChange={(e) => setDraftTimeSlot(e.target.value)}
                  placeholder="04:00 PM - 05:30 PM"
                  className="w-full px-2.5 py-2 border border-purple-300 rounded-lg bg-white font-mono font-bold text-slate-900"
                />
                <datalist id="manual-routine-preset-times">
                  {PRESET_TIME_SLOTS.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">Subject / Topic *</label>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftSubjectMode((m) => (m === 'catalog' ? 'custom' : 'catalog'))
                    }
                    className="text-[10px] font-bold text-purple-700 hover:underline cursor-pointer"
                  >
                    {draftSubjectMode === 'catalog' ? 'Type Custom' : 'Pick Subject'}
                  </button>
                </div>
                {draftSubjectMode === 'catalog' ? (
                  <select
                    value={draftSubjectId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setDraftSubjectId(id);
                      const subObj = subjects.find((s) => s.id === id);
                      if (subObj?.facultyId && routineType !== 'faculty') {
                        setDraftFacultyId(subObj.facultyId);
                      }
                    }}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {(matchingSubjects.length > 0 ? matchingSubjects : subjects).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.curriculum || 'CBSE'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={draftCustomSubject}
                    onChange={(e) => setDraftCustomSubject(e.target.value)}
                    placeholder="e.g. Mock Test / Doubt Session"
                    className="w-full px-2.5 py-2 border border-purple-300 rounded-lg bg-white"
                  />
                )}
              </div>

              {/* Faculty */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">Faculty / Mentor</label>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftFacultyMode((m) => (m === 'catalog' ? 'custom' : 'catalog'))
                    }
                    className="text-[10px] font-bold text-purple-700 hover:underline cursor-pointer"
                  >
                    {draftFacultyMode === 'catalog' ? 'Type Custom' : 'Pick Staff'}
                  </button>
                </div>
                {draftFacultyMode === 'catalog' ? (
                  <select
                    value={draftFacultyId}
                    onChange={(e) => setDraftFacultyId(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={draftCustomFaculty}
                    onChange={(e) => setDraftCustomFaculty(e.target.value)}
                    placeholder="e.g. Guest Faculty"
                    className="w-full px-2.5 py-2 border border-purple-300 rounded-lg bg-white"
                  />
                )}
              </div>

              {/* Room & Mode */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Room / Mode</label>
                <div className="flex gap-1.5">
                  <select
                    value={draftRoom}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftRoom(val);
                      setDraftTeachingMode(val.includes('Online') ? 'Online' : 'Offline');
                    }}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {ACADEMY_ROOMS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                    <option value="Online (Virtual Lab)">Online (Virtual Lab)</option>
                  </select>
                </div>
              </div>

              {/* Add Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddDraftRows}
                  className="w-full py-2 px-3 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Period ({selectedDays.length})</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Batch / Shift</label>
                <select
                  value={draftBatch}
                  onChange={(e) => setDraftBatch(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-[11px]"
                >
                  {BATCH_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Board Tag</label>
                <select
                  value={draftCurriculum}
                  onChange={(e) => setDraftCurriculum(e.target.value as 'CBSE' | 'W.B. Board')}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-[11px]"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="W.B. Board">W.B. Board</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Editable Routine Periods Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-700" />
                3. Scheduled Routine Periods ({slots.length} total)
              </h4>
              {slots.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSlots([])}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  Clear All Rows
                </button>
              )}
            </div>

            {slots.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                <CalendarDays className="w-7 h-7 mx-auto mb-1.5 text-slate-300" />
                <p className="font-semibold text-slate-500">No periods added yet.</p>
                <p className="text-[11px] mt-0.5">
                  Use Section 2 above to add periods manually, or click "Load / Clone Current Schedule" to customize an existing routine.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Day</th>
                      <th className="py-2.5 px-3">Time Slot</th>
                      <th className="py-2.5 px-3">Subject / Activity</th>
                      <th className="py-2.5 px-3">Mentor</th>
                      <th className="py-2.5 px-3">Room / Mode</th>
                      <th className="py-2.5 px-3">Board</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {slots.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3">
                          <select
                            value={row.day}
                            onChange={(e) =>
                              handleUpdateSlotRow(row.id, {
                                day: e.target.value as ManualRoutineSlot['day'],
                              })
                            }
                            className="px-2 py-1 border border-slate-200 rounded bg-white font-semibold"
                          >
                            {DAYS_OF_WEEK.map((d) => (
                              <option key={d} value={d}>
                                {d.slice(0, 3)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.timeSlot}
                            onChange={(e) =>
                              handleUpdateSlotRow(row.id, { timeSlot: e.target.value })
                            }
                            className="w-36 px-2 py-1 border border-slate-200 rounded bg-white font-mono font-bold text-slate-800"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.subjectName}
                            onChange={(e) =>
                              handleUpdateSlotRow(row.id, {
                                subjectName: e.target.value,
                                subjectId: undefined,
                              })
                            }
                            className="w-40 px-2 py-1 border border-slate-200 rounded bg-white font-semibold text-slate-900"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.facultyName}
                            onChange={(e) =>
                              handleUpdateSlotRow(row.id, {
                                facultyName: e.target.value,
                                facultyId: undefined,
                              })
                            }
                            className="w-36 px-2 py-1 border border-slate-200 rounded bg-white"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={row.room}
                            onChange={(e) => {
                              const rm = e.target.value;
                              handleUpdateSlotRow(row.id, {
                                room: rm,
                                teachingMode: rm.includes('Online') ? 'Online' : 'Offline',
                              });
                            }}
                            className="px-2 py-1 border border-slate-200 rounded bg-white font-semibold"
                          >
                            {ACADEMY_ROOMS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                            <option value="Online (Virtual Lab)">Online</option>
                            {!ACADEMY_ROOMS.includes(row.room as any) &&
                              row.room !== 'Online (Virtual Lab)' && (
                                <option value={row.room}>{row.room}</option>
                              )}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={row.curriculum || 'CBSE'}
                            onChange={(e) =>
                              handleUpdateSlotRow(row.id, {
                                curriculum: e.target.value as 'CBSE' | 'W.B. Board',
                              })
                            }
                            className="px-2 py-1 border border-slate-200 rounded bg-white"
                          >
                            <option value="CBSE">CBSE</option>
                            <option value="W.B. Board">W.B. Board</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDuplicateRow(row)}
                              title="Duplicate Row"
                              className="p-1 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row.id)}
                              title="Remove Row"
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 4: Optional Live Timetable Sync */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
            <label className="flex items-center gap-2 font-bold text-amber-950 cursor-pointer">
              <input
                type="checkbox"
                checked={syncToTimetable}
                onChange={(e) => setSyncToTimetable(e.target.checked)}
                className="w-4 h-4 accent-purple-700"
              />
              <span>Also publish these periods directly into the Live Academy Timetable</span>
            </label>
            <p className="text-[11px] text-amber-900 pl-6">
              Leave unchecked to keep this as a standalone printable Manual Routine, or check to push these periods into Class Routine / Faculty Routine / Master Grid (subject to the {MAX_CONCURRENT_ROOMS}/{ACADEMY_ROOMS.length} room limit).
            </p>
            {syncToTimetable && routineType !== 'custom' && (
              <div className="pl-6 pt-1">
                <label className="flex items-center gap-2 text-[11px] font-semibold text-amber-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    className="w-3.5 h-3.5 accent-rose-600"
                  />
                  <span>
                    Replace existing live slots for{' '}
                    {routineType === 'class'
                      ? `Class ${classLevel} (${curriculum})`
                      : faculty.find((f) => f.id === facultyId)?.name || 'this faculty'}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-manual-routine-btn"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-amber-400" />
              <span>{existingRoutine ? 'Save Manual Routine Updates' : 'Save Manual Routine'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
