import React, { useState } from 'react';
import { Faculty, Subject, TimetableSlot, ClassLevel, StreamType, BatchShift, AdminUser } from '../../types';
import { CLASS_LEVELS, STREAMS_FOR_CLASS, ACADEMY_ROOMS, MAX_CONCURRENT_ROOMS } from '../../utils/academicUtils';
import { evaluateSectionAuthorization, hasPermission } from '../../utils/auth';
import { SectionAuthHeader } from '../common/SectionAuthHeader';
import { RoutinePrintModal } from './RoutinePrintModal';
import {
  Users,
  Plus,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Mail,
  Phone,
  Award,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  GraduationCap,
  Lock,
  Layers,
  MapPin,
  Sparkles,
  Printer,
  CalendarDays,
  UserCheck,
  Building,
  Filter,
  AlertTriangle,
  DoorClosed,
  Check,
} from 'lucide-react';

interface FacultyViewProps {
  faculty: Faculty[];
  subjects: Subject[];
  timetable: TimetableSlot[];
  onAddFaculty: (fac: Faculty) => void;
  onUpdateFaculty: (fac: Faculty) => void;
  onDeleteFaculty: (facultyId: string) => void;
  onAddTimetableSlot: (slot: TimetableSlot) => void;
  onUpdateTimetableSlot: (slot: TimetableSlot) => void;
  onDeleteTimetableSlot: (slotId: string) => void;
  currentAdmin?: AdminUser | null;
  onOpenAdminLogin?: () => void;
  onOpenPermissionsMatrix?: () => void;
}

const PRESET_TIME_SLOTS = [
  '06:30 AM - 08:00 AM', // 1 hr 30 mins
  '08:00 AM - 09:30 AM', // 1 hr 30 mins
  '08:30 AM - 10:00 AM', // 1 hr 30 mins
  '09:00 AM - 10:30 AM', // 1 hr 30 mins
  '09:30 AM - 11:00 AM', // 1 hr 30 mins
  '10:00 AM - 11:30 AM', // 1 hr 30 mins
  '11:30 AM - 01:00 PM', // 1 hr 30 mins
  '01:00 PM - 02:30 PM', // 1 hr 30 mins
  '03:00 PM - 04:30 PM', // 1 hr 30 mins
  '04:00 PM - 05:30 PM', // 1 hr 30 mins
  '04:30 PM - 06:00 PM', // 1 hr 30 mins
  '05:00 PM - 06:30 PM', // 1 hr 30 mins
  '05:30 PM - 07:00 PM', // 1 hr 30 mins
  '06:00 PM - 07:30 PM', // 1 hr 30 mins
  '06:30 PM - 08:00 PM', // 1 hr 30 mins
  '07:00 PM - 08:30 PM', // 1 hr 30 mins
];

const BATCH_OPTIONS: BatchShift[] = [
  'Morning Batch (6:30 AM - 9:00 AM)',
  'Evening Batch (4:00 PM - 8:30 PM)',
  'Saturday Evening Batch (3:00 PM - 8:30 PM)',
  'Sunday Morning Batch (6:30 AM - 11:30 AM)',
  'Sunday Evening Batch (3:00 PM - 8:30 PM)',
  'Weekend Intensive (Sat-Sun)',
];

export const FacultyView: React.FC<FacultyViewProps> = ({
  faculty,
  subjects,
  timetable,
  onAddFaculty,
  onUpdateFaculty,
  onDeleteFaculty,
  onAddTimetableSlot,
  onUpdateTimetableSlot,
  onDeleteTimetableSlot,
  currentAdmin,
  onOpenAdminLogin,
  onOpenPermissionsMatrix,
}) => {
  const auth = evaluateSectionAuthorization(currentAdmin, 'faculty');
  const canManageFaculty = auth.canWrite && hasPermission(currentAdmin, 'FACULTY_ALLOCATION_WRITE');
  const canManageTimetable = auth.canWrite && hasPermission(currentAdmin, 'TIMETABLE_MANAGE');
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'class-routine' | 'faculty-routine' | 'room-allocation' | 'timetable' | 'directory'>('class-routine');
  
  // Class Routine View State
  const [selectedClassRoutine, setSelectedClassRoutine] = useState<ClassLevel>('10');
  const [selectedStreamRoutine, setSelectedStreamRoutine] = useState<StreamType>('General');

  // Faculty Routine View State
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(faculty[0]?.id || 'FAC-09');

  // Room Allocation View State
  const [selectedRoomDay, setSelectedRoomDay] = useState<string>('Monday');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');

  // Print Modal State
  const [printModalConfig, setPrintModalConfig] = useState<{
    isOpen: boolean;
    type: 'class' | 'faculty';
    classLevel?: ClassLevel;
    stream?: StreamType;
    facultyMember?: Faculty;
  }>({
    isOpen: false,
    type: 'class',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  // Timetable slot modal state
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [editingTimetableSlot, setEditingTimetableSlot] = useState<TimetableSlot | null>(null);

  // Timetable day filter
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  // Faculty form data
  const [formData, setFormData] = useState<Partial<Faculty>>({
    name: '',
    designation: 'Senior Faculty',
    qualification: '',
    email: '',
    phone: '',
    joiningDate: new Date().toISOString().split('T')[0],
    experienceYears: 5,
    assignedSubjectIds: [],
    maxWeeklyHours: 24,
    bio: '',
  });

  // Timetable slot form data
  const [slotFormData, setSlotFormData] = useState<Partial<TimetableSlot>>({
    day: 'Monday',
    timeSlot: '04:00 PM - 05:30 PM',
    classLevel: '10',
    stream: 'General',
    batch: 'Evening Batch (4:00 PM - 8:30 PM)',
    subjectId: '',
    facultyId: '',
    room: 'ROOM-1',
  });

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setFormData({
      name: '',
      designation: 'Senior Faculty',
      qualification: '',
      email: '',
      phone: '',
      joiningDate: new Date().toISOString().split('T')[0],
      experienceYears: 5,
      assignedSubjectIds: [],
      maxWeeklyHours: 24,
      bio: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (f: Faculty) => {
    setEditingFaculty(f);
    setFormData(f);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.qualification || !formData.phone) {
      alert('Please fill in faculty name, qualification, and phone number.');
      return;
    }

    if (editingFaculty) {
      const updated: Faculty = {
        ...editingFaculty,
        ...(formData as Faculty),
      };
      onUpdateFaculty(updated);
    } else {
      const newFaculty: Faculty = {
        id: `FAC-${String(faculty.length + 1).padStart(2, '0')}`,
        name: formData.name || '',
        designation: (formData.designation as any) || 'Senior Faculty',
        qualification: formData.qualification || '',
        email: formData.email || '',
        phone: formData.phone || '',
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        experienceYears: Number(formData.experienceYears) || 1,
        assignedSubjectIds: formData.assignedSubjectIds || [],
        maxWeeklyHours: Number(formData.maxWeeklyHours) || 24,
        bio: formData.bio,
      };
      onAddFaculty(newFaculty);
    }
    setIsAddModalOpen(false);
  };

  // Open Add Timetable Slot modal
  const handleOpenAddSlot = () => {
    setEditingTimetableSlot(null);
    const initialSubject = subjects.find((s) => s.classLevel === '10')?.id || subjects[0]?.id || '';
    const initialFaculty = faculty[0]?.id || '';
    const currentDay = (selectedDay as any) || 'Monday';
    const currentTime = '04:00 PM - 05:30 PM';
    
    // Find next available room in ROOM-1..ROOM-8 for this day and time
    const activeRoomsInSlot = new Set(
      timetable
        .filter((s) => s.day === currentDay && s.timeSlot === currentTime)
        .map((s) => s.room)
    );
    const nextFreeRoom = ACADEMY_ROOMS.find((r) => !activeRoomsInSlot.has(r)) || 'ROOM-1';

    setSlotFormData({
      day: currentDay,
      timeSlot: currentTime,
      classLevel: '10',
      stream: 'General',
      batch: 'Evening Batch (4:00 PM - 8:30 PM)',
      subjectId: initialSubject,
      facultyId: initialFaculty,
      room: nextFreeRoom,
    });
    setIsTimetableModalOpen(true);
  };

  // Open Edit Timetable Slot modal
  const handleOpenEditSlot = (slot: TimetableSlot) => {
    setEditingTimetableSlot(slot);
    setSlotFormData({
      day: slot.day,
      timeSlot: slot.timeSlot,
      classLevel: slot.classLevel,
      stream: slot.stream,
      batch: slot.batch,
      subjectId: slot.subjectId,
      facultyId: slot.facultyId,
      room: slot.room,
    });
    setIsTimetableModalOpen(true);
  };

  // Handle Timetable Slot Submit with 5 concurrent rooms validation
  const handleSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const day = (slotFormData.day as any) || 'Monday';
    const timeSlot = slotFormData.timeSlot?.trim();
    const targetRoom = slotFormData.room?.trim() || 'ROOM-1';
    const chosenFacultyId = slotFormData.facultyId;

    if (!timeSlot) {
      alert('Please enter or select a valid time slot.');
      return;
    }
    if (!slotFormData.subjectId) {
      alert('Please select a subject for this slot.');
      return;
    }
    if (!chosenFacultyId) {
      alert('Please select an allocated teacher.');
      return;
    }

    // Check existing slots in the exact same day & timeSlot (excluding the current one being edited)
    const otherSlotsInSameSlot = timetable.filter(
      (s) =>
        s.day === day &&
        s.timeSlot === timeSlot &&
        (!editingTimetableSlot || s.id !== editingTimetableSlot.id)
    );

    // 1. Room double-booking conflict check
    const roomConflict = otherSlotsInSameSlot.find((s) => s.room.toLowerCase() === targetRoom.toLowerCase());
    if (roomConflict) {
      const conflictSub = subjects.find((sub) => sub.id === roomConflict.subjectId)?.name || roomConflict.subjectId;
      const conflictTeacher = faculty.find((f) => f.id === roomConflict.facultyId)?.name || 'Teacher';
      alert(
        `Room Allocation Conflict: ${targetRoom} is already in use by Class ${roomConflict.classLevel} (${conflictSub} - ${conflictTeacher}) on ${day} at ${timeSlot}. Please choose another available room from ROOM-1 through ROOM-8.`
      );
      return;
    }

    // 2. Maximum 5 concurrent rooms allocation limit check
    const distinctRoomsInSlot = new Set(otherSlotsInSameSlot.map((s) => s.room));
    if (!distinctRoomsInSlot.has(targetRoom) && distinctRoomsInSlot.size >= MAX_CONCURRENT_ROOMS) {
      alert(
        `Institutional Room Limit Exceeded: At most ${MAX_CONCURRENT_ROOMS} rooms can be allocated concurrently for classes (Policy: 8 Available Rooms, Max ${MAX_CONCURRENT_ROOMS} active at a time). Current allocated rooms on ${day} (${timeSlot}): ${Array.from(distinctRoomsInSlot).join(', ')}.`
      );
      return;
    }

    // 3. Faculty clash check (teacher cannot be in two classrooms at the same time)
    const teacherConflict = otherSlotsInSameSlot.find((s) => s.facultyId === chosenFacultyId);
    if (teacherConflict) {
      const conflictTeacher = faculty.find((f) => f.id === chosenFacultyId)?.name || 'This teacher';
      alert(
        `Teacher Conflict: ${conflictTeacher} is already assigned to Class ${teacherConflict.classLevel} in ${teacherConflict.room} on ${day} at ${timeSlot}.`
      );
      return;
    }

    if (editingTimetableSlot) {
      const updated: TimetableSlot = {
        ...editingTimetableSlot,
        day: (slotFormData.day as any) || editingTimetableSlot.day,
        timeSlot: timeSlot,
        classLevel: (slotFormData.classLevel as ClassLevel) || editingTimetableSlot.classLevel,
        stream: (slotFormData.stream as StreamType) || editingTimetableSlot.stream,
        batch: (slotFormData.batch as BatchShift) || editingTimetableSlot.batch,
        subjectId: slotFormData.subjectId,
        facultyId: chosenFacultyId,
        room: targetRoom,
      };
      onUpdateTimetableSlot(updated);
    } else {
      const newSlot: TimetableSlot = {
        id: `TS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        day: (slotFormData.day as any) || 'Monday',
        timeSlot: timeSlot,
        classLevel: (slotFormData.classLevel as ClassLevel) || '10',
        stream: (slotFormData.stream as StreamType) || 'General',
        batch: (slotFormData.batch as BatchShift) || 'Evening Batch (4:00 PM - 8:30 PM)',
        subjectId: slotFormData.subjectId,
        facultyId: chosenFacultyId,
        room: targetRoom,
      };
      onAddTimetableSlot(newSlot);
    }
    setIsTimetableModalOpen(false);
  };

  const filteredFaculty = faculty.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.qualification.toLowerCase().includes(q) ||
      f.designation.toLowerCase().includes(q)
    );
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Subjects filtered for current selected classLevel and stream in slotFormData
  const filteredSubjectsForSlot = subjects.filter(
    (s) =>
      s.classLevel === (slotFormData.classLevel || '10') &&
      (s.stream === (slotFormData.stream || 'General') || s.stream === 'General')
  );

  // Selected faculty object for Faculty Routine view
  const currentFacultyMember = faculty.find((f) => f.id === selectedFacultyId) || faculty[0];

  return (
    <div className="space-y-6">
      
      {/* Section Authorization Unit Status Banner */}
      <SectionAuthHeader
        currentAdmin={currentAdmin || null}
        sectionTab="faculty"
        onOpenAdminLogin={onOpenAdminLogin || (() => {})}
        onOpenPermissionsMatrix={onOpenPermissionsMatrix}
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Class Routine & Faculty Allocation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full class-by-class routines (Classes 1–12), individual teacher duty sheets, and weekly time schedule matrix.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-tab switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('class-routine')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'class-routine'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Class Routine (1-12)</span>
            </button>

            <button
              onClick={() => setActiveTab('faculty-routine')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'faculty-routine'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Faculty Routine</span>
            </button>

            <button
              onClick={() => setActiveTab('room-allocation')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'room-allocation'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Room Allocations (Max 5/8)</span>
            </button>

            <button
              onClick={() => setActiveTab('timetable')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'timetable'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Master Grid</span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'directory'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Directory ({faculty.length})</span>
            </button>
          </div>

          {canManageFaculty && (
            <button
              onClick={handleOpenAdd}
              id="add-faculty-btn"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Mentor
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: CLASS ROUTINE (CLASS 1 TO 12) */}
      {activeTab === 'class-routine' && (
        <div className="space-y-6">
          
          {/* Class Level Selector Ribbon */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  ACADEMIC CLASS ROUTINE
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Select Target Class Routine</h3>
                <p className="text-xs text-slate-500">View complete weekly timetable schedule for any coaching batch.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPrintModalConfig({
                      isOpen: true,
                      type: 'class',
                      classLevel: selectedClassRoutine,
                      stream: (selectedClassRoutine === '11' || selectedClassRoutine === '12') ? selectedStreamRoutine : 'General',
                    })
                  }
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Class {selectedClassRoutine} Routine</span>
                </button>
              </div>
            </div>

            {/* Class Buttons Grid */}
            <div>
              <div className="flex flex-wrap gap-1.5">
                {CLASS_LEVELS.map((cls) => {
                  const isSelected = selectedClassRoutine === cls;
                  const clsSlotsCount = timetable.filter((s) => s.classLevel === cls).length;

                  return (
                    <button
                      key={cls}
                      onClick={() => {
                        setSelectedClassRoutine(cls);
                        const validStreams = STREAMS_FOR_CLASS[cls];
                        if (!validStreams.includes(selectedStreamRoutine)) {
                          setSelectedStreamRoutine(validStreams[0] as StreamType);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-slate-900 text-amber-300 shadow-md scale-102 ring-2 ring-purple-600'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Class {cls}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-amber-400/20 text-amber-200' : 'bg-slate-200 text-slate-600'}`}>
                        {clsSlotsCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Stream Switcher for Senior Secondary (Class 11 & 12) */}
              {(selectedClassRoutine === '11' || selectedClassRoutine === '12') && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600">Stream Track:</span>
                  <div className="flex gap-1.5">
                    {STREAMS_FOR_CLASS[selectedClassRoutine].map((st) => (
                      <button
                        key={st}
                        onClick={() => setSelectedStreamRoutine(st as StreamType)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          selectedStreamRoutine === st
                            ? 'bg-purple-700 text-white font-bold shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {st} Stream
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Class Routine Schedule Cards by Day */}
          {(() => {
            const classSlots = timetable.filter(
              (s) =>
                s.classLevel === selectedClassRoutine &&
                (selectedClassRoutine === '11' || selectedClassRoutine === '12'
                  ? s.stream === selectedStreamRoutine
                  : true)
            );

            return (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                
                {/* Routine Overview Ribbon */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-purple-50/70 border border-purple-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      {selectedClassRoutine}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                          Weekly Routine for Class {selectedClassRoutine}
                          {(selectedClassRoutine === '11' || selectedClassRoutine === '12') && ` (${selectedStreamRoutine})`}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          Number(selectedClassRoutine) <= 5
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : Number(selectedClassRoutine) <= 8
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}>
                          {Number(selectedClassRoutine) <= 5
                            ? 'Primary: Mon, Wed & Fri'
                            : selectedClassRoutine === '7' || selectedClassRoutine === '8'
                            ? 'Upper Primary: Tue, Thu, Sat & Sun'
                            : Number(selectedClassRoutine) <= 8
                            ? 'Upper Primary: Tue, Thu & Sat'
                            : 'Board Special: Mon to Sun (7 Days)'}
                        </span>
                      </div>
                      <p className="text-xs text-purple-900 font-medium">
                        {classSlots.length} Total Scheduled Lecture Periods (1 hr 30 mins each)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-white px-3 py-1.5 rounded-lg border border-purple-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Class Mentor</span>
                      <strong className="text-slate-800">
                        {selectedClassRoutine === '12' || selectedClassRoutine === '11'
                          ? 'Dr. Anirban Mukherjee / Mr. Buddhadev Chakraborty'
                          : Number(selectedClassRoutine) >= 9
                          ? 'Mr. Buddhadev Chakraborty / Mr. Soumyadip Dinda'
                          : selectedClassRoutine === '8'
                          ? 'Mr. Ayan Dinda / Mr. Buddhadev Chakraborty'
                          : selectedClassRoutine === '7'
                          ? 'Mr. Ayan Dinda / Mr. Sourav Dinda'
                          : selectedClassRoutine === '6'
                          ? 'Mr. Sourav Dinda / Ms. Sharmila Bose'
                          : 'Mrs. Madhumita Maity Dinda / Monalisa Maity / Mr. Subhadip Dinda'}
                      </strong>
                    </div>

                    {canManageTimetable && (
                      <button
                        onClick={handleOpenAddSlot}
                        className="px-3 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Slot</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 7 Days Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
                  {daysOfWeek.map((day) => {
                    const daySlots = classSlots.filter((s) => s.day === day);
                    const isRest = daySlots.length === 0;

                    return (
                      <div
                        key={day}
                        className={`flex flex-col rounded-xl border p-3 min-h-[220px] transition-all ${
                          isRest
                            ? 'bg-slate-50/50 border-slate-200 text-slate-400'
                            : 'bg-white border-slate-300 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                          <span className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                            {day.slice(0, 3)}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isRest ? 'bg-slate-200 text-slate-500' : 'bg-purple-100 text-purple-800'}`}>
                            {daySlots.length}
                          </span>
                        </div>

                        {isRest ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
                            <span className="text-[10px] text-slate-400 italic">No class</span>
                            <span className="text-[9px] text-slate-400">Self-study / Break</span>
                          </div>
                        ) : (
                          <div className="space-y-2 flex-1">
                            {daySlots.map((slot) => {
                              const subject = subjects.find((s) => s.id === slot.subjectId);
                              const teacher = faculty.find((f) => f.id === slot.facultyId);

                              return (
                                <div
                                  key={slot.id}
                                  className="p-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all text-xs flex flex-col justify-between space-y-1 group"
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="font-mono font-bold text-[10px] text-slate-900">
                                      {slot.timeSlot}
                                    </span>
                                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1 rounded">
                                      {slot.room}
                                    </span>
                                  </div>

                                  <div>
                                    <p className="font-bold text-purple-950 text-[11px] truncate">
                                      {subject?.name || slot.subjectId}
                                    </p>
                                    <p className="text-[10px] text-slate-600 truncate mt-0.5">
                                      👨‍🏫 {teacher?.name?.split(' ').slice(-2).join(' ') || 'Unassigned'}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-200/50">
                                    <span className="truncate">{slot.batch.split('(')[0]}</span>
                                    {canManageTimetable && (
                                      <button
                                        onClick={() => handleOpenEditSlot(slot)}
                                        className="text-purple-600 hover:text-purple-900 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                        title="Edit slot"
                                      >
                                        <Edit2 className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>
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
            );
          })()}

        </div>
      )}

      {/* TAB 2: FACULTY ROUTINE (TEACHER-WISE) */}
      {activeTab === 'faculty-routine' && (
        <div className="space-y-6">
          
          {/* Teacher Selector Ribbon */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  INDIVIDUAL TEACHER SCHEDULE
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Select Academic Mentor Duty Sheet</h3>
                <p className="text-xs text-slate-500">View weekly lecture timetable, room assignments, and teaching hours per teacher.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPrintModalConfig({
                      isOpen: true,
                      type: 'faculty',
                      facultyMember: currentFacultyMember,
                    })
                  }
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print {currentFacultyMember?.name}'s Routine</span>
                </button>
              </div>
            </div>

            {/* Teacher Pills */}
            <div className="flex flex-wrap gap-2">
              {faculty.map((f) => {
                const isSelected = f.id === selectedFacultyId;
                const teacherSlots = timetable.filter((s) => s.facultyId === f.id);

                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFacultyId(f.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-slate-900 text-amber-300 shadow-md scale-102 ring-2 ring-purple-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{f.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-amber-400/20 text-amber-200' : 'bg-slate-200 text-slate-600'}`}>
                      {teacherSlots.length} slots
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Teacher Profile & Day-by-Day Schedule */}
          {currentFacultyMember && (() => {
            const facultySlots = timetable.filter((s) => s.facultyId === currentFacultyMember.id);
            const loadPercent = Math.min(100, Math.round((facultySlots.length / currentFacultyMember.maxWeeklyHours) * 100));

            return (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                
                {/* Faculty Detail Ribbon */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow shrink-0">
                      {currentFacultyMember.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{currentFacultyMember.name}</h4>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {currentFacultyMember.designation}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{currentFacultyMember.qualification}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{currentFacultyMember.bio}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs border-t md:border-t-0 md:border-l md:border-slate-200 pt-3 md:pt-0 md:pl-6">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Weekly Workload</span>
                      <strong className="text-slate-900 text-sm">
                        {facultySlots.length} Slots / {currentFacultyMember.maxWeeklyHours} hrs cap
                      </strong>
                      <div className="w-28 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${Math.min(100, (facultySlots.length / currentFacultyMember.maxWeeklyHours) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Contact</span>
                      <span className="font-mono text-xs text-slate-800 font-semibold">{currentFacultyMember.phone}</span>
                    </div>
                  </div>
                </div>

                {/* 7 Days Grid for this Teacher */}
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
                  {daysOfWeek.map((day) => {
                    const daySlots = facultySlots.filter((s) => s.day === day);
                    const isFree = daySlots.length === 0;

                    return (
                      <div
                        key={day}
                        className={`flex flex-col rounded-xl border p-3 min-h-[220px] transition-all ${
                          isFree
                            ? 'bg-slate-50/50 border-slate-200 text-slate-400'
                            : 'bg-white border-purple-300 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                          <span className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                            {day.slice(0, 3)}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isFree ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-800'}`}>
                            {daySlots.length}
                          </span>
                        </div>

                        {isFree ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
                            <span className="text-[10px] text-slate-400 italic">Off / Research</span>
                            <span className="text-[9px] text-slate-400">No scheduled periods</span>
                          </div>
                        ) : (
                          <div className="space-y-2 flex-1">
                            {daySlots.map((slot) => {
                              const subject = subjects.find((s) => s.id === slot.subjectId);

                              return (
                                <div
                                  key={slot.id}
                                  className="p-2 bg-purple-50/50 rounded-lg border border-purple-200 hover:border-purple-400 transition-all text-xs flex flex-col justify-between space-y-1 group"
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="font-mono font-bold text-[10px] text-purple-950">
                                      {slot.timeSlot}
                                    </span>
                                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1 rounded">
                                      {slot.room}
                                    </span>
                                  </div>

                                  <div>
                                    <p className="font-bold text-slate-900 text-[11px]">
                                      Class {slot.classLevel} ({slot.stream})
                                    </p>
                                    <p className="text-[10px] text-purple-900 font-semibold truncate mt-0.5">
                                      📖 {subject?.name || slot.subjectId}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-purple-100">
                                    <span className="truncate">{slot.batch.split('(')[0]}</span>
                                    {canManageTimetable && (
                                      <button
                                        onClick={() => handleOpenEditSlot(slot)}
                                        className="text-purple-600 hover:text-purple-900 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                        title="Edit slot"
                                      >
                                        <Edit2 className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>
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
            );
          })()}

        </div>
      )}

      {/* TAB: ROOM ALLOCATION & CAPACITY (MAX 5 OF 8 ROOMS) */}
      {activeTab === 'room-allocation' && (
        <div className="space-y-6">
          {/* Institutional Capacity & Policy Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    INSTITUTIONAL FACILITY ALLOCATION POLICY
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Policy Active & Enforced
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1.5 flex items-center gap-2">
                  <span>8 Available Classrooms (ROOM-1 to ROOM-8)</span>
                  <span className="text-purple-600">•</span>
                  <span className="text-purple-700">Max 5 Concurrent Rooms Allocated</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  The academy infrastructure comprises 8 fully-equipped classrooms. To ensure optimal acoustics, mentor invigilation, and student corridor safety, at any given time slot a maximum of <strong>5 rooms</strong> are allocated for lectures, while remaining rooms serve as self-study lounges or contingency reserves.
                </p>
              </div>

              {canManageTimetable && (
                <button
                  onClick={handleOpenAddSlot}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 shrink-0 self-start lg:self-center"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Allocate New Room Slot</span>
                </button>
              )}
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Facility Classrooms</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900">{ACADEMY_ROOMS.length}</span>
                  <span className="text-[11px] font-bold text-slate-600">Rooms (ROOM-1 to ROOM-8)</span>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-purple-700 block">Max Concurrent Limit</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-purple-900">{MAX_CONCURRENT_ROOMS}</span>
                  <span className="text-[11px] font-bold text-purple-700">Rooms at a time</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">Standby / Buffer Rooms</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-emerald-900">{ACADEMY_ROOMS.length - MAX_CONCURRENT_ROOMS}</span>
                  <span className="text-[11px] font-bold text-emerald-700">Reserve per peak slot</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-amber-800 block">Total Scheduled Slots</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-amber-900">{timetable.length}</span>
                  <span className="text-[11px] font-bold text-amber-800">Weekly 1.5h sessions</span>
                </div>
              </div>
            </div>
          </div>

          {/* 8 Room Infrastructure Overview Cards */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-600" />
                  Academy Classroom Fleet Status (8 Rooms)
                </h4>
                <p className="text-xs text-slate-500">Weekly lecture distribution and assigned curriculum across all 8 rooms.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {ACADEMY_ROOMS.map((roomName, idx) => {
                const roomSlots = timetable.filter((s) => s.room === roomName);
                const distinctClasses = Array.from(new Set(roomSlots.map((s) => `Cl-${s.classLevel}`)));
                const weeklyHours = (roomSlots.length * 1.5).toFixed(1);
                const isHeavyLoad = roomSlots.length >= 10;

                return (
                  <div
                    key={roomName}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-purple-300 hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                          {roomName}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${roomSlots.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-slate-500 font-semibold">Weekly Load</div>
                        <div className="text-sm font-black text-slate-900">{roomSlots.length} <span className="text-[10px] font-normal text-slate-500">slots ({weeklyHours}h)</span></div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Classes</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {distinctClasses.slice(0, 3).map((cl) => (
                          <span key={cl} className="text-[9px] font-bold bg-white text-slate-700 px-1 py-0.2 rounded border border-slate-200">
                            {cl}
                          </span>
                        ))}
                        {distinctClasses.length > 3 && (
                          <span className="text-[8px] text-slate-500 font-bold">+{distinctClasses.length - 3}</span>
                        )}
                        {distinctClasses.length === 0 && (
                          <span className="text-[9px] text-slate-400 italic">Standby</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day & Shift Concurrency Inspector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Live Time-Slot Room Allocation Matrix
                </h4>
                <p className="text-xs text-slate-500">
                  Select day to inspect concurrent room utilization in each 1 hr 30 mins period.
                </p>
              </div>

              {/* Day Selector */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-100 p-1 rounded-xl">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedRoomDay(day)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedRoomDay === day
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Room Utilization Rows */}
            {(() => {
              const daySlots = timetable.filter((s) => s.day === selectedRoomDay);
              const distinctTimeSlots = Array.from(new Set(daySlots.map((s) => s.timeSlot))).sort();

              if (distinctTimeSlots.length === 0) {
                return (
                  <div className="p-10 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                    <Building className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p>No active room allocations scheduled for {selectedRoomDay}.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {distinctTimeSlots.map((timeSlot) => {
                    const slotsInThisTime = daySlots.filter((s) => s.timeSlot === timeSlot);
                    const occupiedRooms = new Map<string, TimetableSlot>(slotsInThisTime.map((s) => [s.room, s]));
                    const concurrentCount = occupiedRooms.size;
                    const isAtMaxLimit = concurrentCount >= MAX_CONCURRENT_ROOMS;
                    const isOverLimit = concurrentCount > MAX_CONCURRENT_ROOMS;

                    return (
                      <div
                        key={timeSlot}
                        className={`p-4 rounded-xl border transition-all ${
                          isOverLimit
                            ? 'bg-rose-50/60 border-rose-300'
                            : isAtMaxLimit
                            ? 'bg-amber-50/50 border-amber-200'
                            : 'bg-slate-50/70 border-slate-200'
                        }`}
                      >
                        {/* Header for Time Slot */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200/70">
                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded-lg font-mono font-bold text-xs text-slate-900 shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                              <span>{timeSlot}</span>
                            </div>
                            <span className="text-xs text-slate-500 font-semibold">
                              {slotsInThisTime[0]?.batch.split('(')[0]}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Concurrency Counter */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-slate-600">Active Rooms:</span>
                              <span
                                className={`text-xs font-black px-2 py-0.5 rounded-full border ${
                                  isOverLimit
                                    ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                                    : isAtMaxLimit
                                    ? 'bg-amber-500 text-white border-amber-600'
                                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                }`}
                              >
                                {concurrentCount} / {MAX_CONCURRENT_ROOMS} Rooms Allocated
                              </span>
                            </div>

                            {isAtMaxLimit && (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                                Maximum Allocation Cap Reached
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 8 Rooms Visual Grid for this Slot */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                          {ACADEMY_ROOMS.map((roomName) => {
                            const activeSlot = occupiedRooms.get(roomName);
                            const subject = activeSlot ? subjects.find((s) => s.id === activeSlot.subjectId) : null;
                            const teacher = activeSlot ? faculty.find((f) => f.id === activeSlot.facultyId) : null;

                            if (activeSlot) {
                              return (
                                <div
                                  key={roomName}
                                  className="p-2.5 bg-white rounded-lg border-2 border-purple-500 shadow-xs flex flex-col justify-between space-y-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-[11px] text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded">
                                      {roomName}
                                    </span>
                                    <span className="text-[9px] font-bold bg-purple-700 text-white px-1.5 py-0.2 rounded">
                                      Class {activeSlot.classLevel}
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-bold text-slate-900 truncate" title={subject?.name}>
                                    {subject?.name || activeSlot.subjectId}
                                  </div>
                                  <div className="text-[10px] text-slate-600 truncate flex items-center gap-1">
                                    <UserCheck className="w-3 h-3 text-purple-600 shrink-0" />
                                    <span className="truncate">{teacher?.name.split(' ')[0]}</span>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={roomName}
                                className="p-2.5 bg-white/60 rounded-lg border border-dashed border-slate-300 text-slate-400 flex flex-col justify-between"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-[10px] text-slate-500">{roomName}</span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                </div>
                                <div className="text-[10px] text-slate-400 italic mt-2">Standby / Free</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 4: MASTER SCHEDULE GRID (DAY-WISE SLOT MANAGER) */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Master Day-Wise Schedule Grid</h3>
                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                  Editable Schedule Matrix
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage and customize lecture timings, teacher allocations, classrooms, and batches across all days.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Day Selector */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-100 p-1 rounded-xl">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedDay === day
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Add New Slot Button */}
              {canManageTimetable && (
                <button
                  id="add-timetable-slot-btn"
                  onClick={handleOpenAddSlot}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>+ Schedule Time Slot</span>
                </button>
              )}
            </div>
          </div>

          {/* Slots Table for Selected Day */}
          {(() => {
            const daySlots = timetable.filter((slot) => slot.day === selectedDay);
            if (daySlots.length === 0) {
              return (
                <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl space-y-3">
                  <Clock className="w-8 h-8 mx-auto text-slate-300" />
                  <p>No classes scheduled for {selectedDay}. Click "+ Schedule Time Slot" to allocate lectures.</p>
                  {canManageTimetable && (
                    <button
                      onClick={handleOpenAddSlot}
                      className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-800"
                    >
                      + Add First Slot for {selectedDay}
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Class & Batch</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Allocated Teacher</th>
                      <th className="py-3 px-4">Room / Lab</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {daySlots.map((slot) => {
                      const subject = subjects.find((s) => s.id === slot.subjectId);
                      const teacher = faculty.find((f) => f.id === slot.facultyId);

                      return (
                        <tr key={slot.id} className="hover:bg-slate-50/70 transition-colors group">
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => canManageTimetable && handleOpenEditSlot(slot)}
                              className="font-mono font-bold text-slate-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                              title={canManageTimetable ? "Click to edit this time slot" : slot.timeSlot}
                            >
                              <Clock className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                              <span>{slot.timeSlot}</span>
                              {canManageTimetable && (
                                <Edit2 className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                              )}
                            </button>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              Class {slot.classLevel} ({slot.stream})
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-0.5">{slot.batch.split('(')[0]}</span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {subject?.name || slot.subjectId}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {teacher?.name || 'Unassigned'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                              {slot.room}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {canManageTimetable ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenEditSlot(slot)}
                                  id={`edit-slot-${slot.id}`}
                                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                                  title="Edit Timetable Slot"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Remove timetable slot "${slot.timeSlot}" for Class ${slot.classLevel}?`)) {
                                      onDeleteTimetableSlot(slot.id);
                                    }
                                  }}
                                  id={`delete-slot-${slot.id}`}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                  title="Delete Slot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">Read-Only</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}

        </div>
      )}

      {/* TAB 4: FACULTY DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search teacher by name, qualification or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
              />
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Showing {filteredFaculty.length} Academic Mentors
            </span>
          </div>

          {/* Faculty Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculty.map((fac) => {
              // Find subjects assigned to this faculty
              const assignedSubs = subjects.filter((s) => s.facultyId === fac.id);
              const totalHours = assignedSubs.reduce((sum, s) => sum + s.weeklyHours, 0);
              const loadPercent = Math.min(100, Math.round((totalHours / fac.maxWeeklyHours) * 100));

              return (
                <div
                  key={fac.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 font-bold text-lg flex items-center justify-center shadow shrink-0">
                        {fac.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          {fac.designation}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1 truncate">{fac.name}</h3>
                        <p className="text-xs text-slate-600 truncate">{fac.qualification}</p>
                      </div>
                    </div>

                    {/* Bio */}
                    {fac.bio && (
                      <p className="text-xs text-slate-500 italic mb-4 line-clamp-2">
                        "{fac.bio}"
                      </p>
                    )}

                    {/* Contact details */}
                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{fac.phone}</span>
                      </p>
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{fac.email}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>{fac.experienceYears} Years Teaching Experience</span>
                      </p>
                    </div>

                    {/* Assigned Subjects */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-700">Assigned Subjects ({assignedSubs.length})</span>
                        <span className="text-[11px] font-bold text-slate-900">
                          {totalHours} / {fac.maxWeeklyHours} hrs/wk ({loadPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all ${
                            loadPercent > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${loadPercent}%` }}
                        ></div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {assignedSubs.length === 0 ? (
                          <span className="text-xs text-slate-400">No subjects assigned yet.</span>
                        ) : (
                          assignedSubs.map((sub) => (
                            <span
                              key={sub.id}
                              className="text-[10px] font-semibold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200"
                            >
                              Class {sub.classLevel} {sub.code} ({sub.weeklyHours}h)
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-slate-400">{fac.id}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedFacultyId(fac.id);
                          setActiveTab('faculty-routine');
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                      >
                        View Routine
                      </button>
                      {canManageFaculty && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(fac)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                            title="Edit Faculty Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${fac.name} from faculty directory?`)) {
                                onDeleteFaculty(fac.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                            title="Delete Faculty"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Routine Print Modal */}
      {printModalConfig.isOpen && (
        <RoutinePrintModal
          type={printModalConfig.type}
          classLevel={printModalConfig.classLevel}
          stream={printModalConfig.stream}
          facultyMember={printModalConfig.facultyMember}
          timetable={timetable}
          faculty={faculty}
          subjects={subjects}
          onClose={() => setPrintModalConfig({ ...printModalConfig, isOpen: false })}
        />
      )}

      {/* Add / Edit Timetable Slot Modal */}
      {isTimetableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  {editingTimetableSlot ? 'Edit Timetable Slot Timing & Allocation' : 'Schedule New Class Timetable Slot'}
                </h3>
              </div>
              <button
                onClick={() => setIsTimetableModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSlotSubmit} className="p-6 space-y-4 text-xs font-sans">
              
              {/* Day of Week */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Day of Week *</label>
                <select
                  value={slotFormData.day || 'Monday'}
                  onChange={(e) => setSlotFormData({ ...slotFormData, day: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {daysOfWeek.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Slot Editable Field & Presets */}
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-purple-950 font-bold">
                    Class Time Slot (e.g. 06:30 AM - 07:30 AM) *
                  </label>
                  <span className="text-[10px] text-purple-700 font-semibold">Editable</span>
                </div>
                
                <input
                  type="text"
                  required
                  placeholder="e.g. 06:30 AM - 07:30 AM"
                  value={slotFormData.timeSlot || ''}
                  onChange={(e) => setSlotFormData({ ...slotFormData, timeSlot: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white font-mono text-xs font-bold text-slate-900"
                />

                {/* Quick Presets Pills */}
                <div>
                  <p className="text-[10px] uppercase font-bold text-purple-800 tracking-wider mb-1">
                    Quick Preset Timing Options:
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {PRESET_TIME_SLOTS.map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setSlotFormData({ ...slotFormData, timeSlot: preset })}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-all cursor-pointer ${
                          slotFormData.timeSlot === preset
                            ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                            : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Class Level & Stream */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Class Level *</label>
                  <select
                    value={slotFormData.classLevel || '10'}
                    onChange={(e) => {
                      const newCls = e.target.value as ClassLevel;
                      const validStreams = STREAMS_FOR_CLASS[newCls];
                      const newStream = validStreams[0] as StreamType;
                      // Find first subject matching new class
                      const newSub = subjects.find((s) => s.classLevel === newCls)?.id || '';
                      setSlotFormData({
                        ...slotFormData,
                        classLevel: newCls,
                        stream: newStream,
                        subjectId: newSub || slotFormData.subjectId,
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    {CLASS_LEVELS.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Stream</label>
                  <select
                    value={slotFormData.stream || 'General'}
                    onChange={(e) => setSlotFormData({ ...slotFormData, stream: e.target.value as StreamType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    {STREAMS_FOR_CLASS[(slotFormData.classLevel as ClassLevel) || '10'].map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Batch Shift */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Batch / Shift</label>
                <select
                  value={slotFormData.batch || BATCH_OPTIONS[0]}
                  onChange={(e) => setSlotFormData({ ...slotFormData, batch: e.target.value as BatchShift })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {BATCH_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned Subject *</label>
                <select
                  value={slotFormData.subjectId || ''}
                  onChange={(e) => {
                    const subId = e.target.value;
                    const subObj = subjects.find((s) => s.id === subId);
                    const autoFaculty = subObj?.facultyId || slotFormData.facultyId;
                    setSlotFormData({ ...slotFormData, subjectId: subId, facultyId: autoFaculty });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="">-- Select Subject --</option>
                  {(filteredSubjectsForSlot.length > 0 ? filteredSubjectsForSlot : subjects).map((s) => (
                    <option key={s.id} value={s.id}>
                      Class {s.classLevel} - {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Allocated Faculty & Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Allocated Teacher *</label>
                  <select
                    value={slotFormData.facultyId || ''}
                    onChange={(e) => setSlotFormData({ ...slotFormData, facultyId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="">-- Select Teacher --</option>
                    {faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Room Assignment (8 Rooms, Max 5 Concurrent) *
                  </label>
                  {(() => {
                    const currentDay = slotFormData.day || 'Monday';
                    const currentTime = slotFormData.timeSlot || '04:00 PM - 05:30 PM';
                    const activeSlots = timetable.filter(
                      (s) =>
                        s.day === currentDay &&
                        s.timeSlot === currentTime &&
                        (!editingTimetableSlot || s.id !== editingTimetableSlot.id)
                    );
                    const occupiedMap = new Map<string, TimetableSlot>(activeSlots.map((s) => [s.room, s]));
                    const isSelectedRoomOccupied = occupiedMap.has(slotFormData.room || '');
                    const currentOccupiedCount = occupiedMap.size;
                    const willExceed = !isSelectedRoomOccupied && currentOccupiedCount >= MAX_CONCURRENT_ROOMS;

                    return (
                      <div className="space-y-1.5">
                        <select
                          required
                          value={slotFormData.room || 'ROOM-1'}
                          onChange={(e) => setSlotFormData({ ...slotFormData, room: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                            willExceed
                              ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/40'
                              : isSelectedRoomOccupied
                              ? 'border-amber-300 focus:ring-amber-500 bg-amber-50/40'
                              : 'border-slate-300 focus:ring-slate-900'
                          }`}
                        >
                          {ACADEMY_ROOMS.map((rm) => {
                            const occ = occupiedMap.get(rm);
                            return (
                              <option key={rm} value={rm}>
                                {rm} {occ ? `(In Use: Cl-${occ.classLevel})` : '(Available)'}
                              </option>
                            );
                          })}
                        </select>

                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-semibold">
                            Slot Concurrency: <strong className={currentOccupiedCount >= 5 ? 'text-amber-700' : 'text-emerald-700'}>{currentOccupiedCount} / {MAX_CONCURRENT_ROOMS} Active</strong>
                          </span>
                          {willExceed && (
                            <span className="text-rose-600 font-bold">Max 5 room limit reached</span>
                          )}
                          {isSelectedRoomOccupied && (
                            <span className="text-amber-700 font-bold">Room already in use</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTimetableModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  {editingTimetableSlot ? 'Save Time Slot' : 'Add Time Slot'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Add / Edit Faculty Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  {editingFaculty ? 'Edit Faculty Record' : 'Register New Faculty Mentor'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Faculty Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Soumyadip Dinda"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Designation</label>
                  <select
                    value={formData.designation || 'Senior Faculty'}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="Subject Lead">Subject Lead</option>
                    <option value="Senior Faculty">Senior Faculty</option>
                    <option value="Assistant Faculty">Assistant Faculty</option>
                    <option value="Computer Instructor">Computer Instructor</option>
                    <option value="Guest Lecturer">Guest Lecturer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experienceYears || 5}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Academic Qualifications *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M.Sc. Physics (IIT), B.Ed"
                  value={formData.qualification || ''}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98301 XXXXX"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="faculty@bileyacademy.edu"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Weekly Teaching Hours</label>
                  <input
                    type="number"
                    min="5"
                    max="40"
                    value={formData.maxWeeklyHours || 24}
                    onChange={(e) => setFormData({ ...formData, maxWeeklyHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Short Faculty Bio & Specialization</label>
                <textarea
                  rows={2}
                  placeholder="Specialization topics, past results, research interests..."
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  {editingFaculty ? 'Save Changes' : 'Add Faculty'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
