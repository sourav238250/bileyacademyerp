import { jsPDF } from 'jspdf';
import { Faculty, Subject, TimetableSlot, ClassLevel, StreamType } from '../types';

export interface RoutinePDFOptions {
  type: 'class' | 'faculty';
  classLevel?: ClassLevel | string;
  stream?: StreamType | string;
  facultyMember?: Faculty;
  timetable: TimetableSlot[];
  faculty: Faculty[];
  subjects: Subject[];
}


export function generateRoutinePDF(options: RoutinePDFOptions): jsPDF {
  const {
    type,
    classLevel = '10',
    stream = 'General',
    facultyMember,
    timetable,
    faculty,
    subjects,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 14;
      drawSubHeader();
    }
  };

  const drawSubHeader = () => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(245, 158, 11); // amber-500
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const subTitle = type === 'class'
      ? `BILEY ACADEMY • CLASS ${classLevel} (${stream}) OFFICIAL ROUTINE • 2026–2027`
      : `BILEY ACADEMY • ${facultyMember?.name?.toUpperCase()} FACULTY DUTY SCHEDULE • 2026–2027`;
    doc.text(subTitle, margin + 4, y + 5.5);
    y += 12;
  };

  // Outer decorative border
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.6);
  doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin * 2) + 8);

  // Institution Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 24, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BILEY ACADEMY', margin + 6, y + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(251, 191, 36); // amber-400
  doc.text('ACADEMIC GOVERNANCE & TIMETABLE CELL', margin + 6, y + 13);

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7.5);
  doc.text('Jamna, Pingla, Paschim Medinipur, WB-721140 | Helpline: +91 9732531730', margin + 6, y + 18.5);

  // Badge on the right
  const badgeTitle = type === 'class' ? 'CLASS ROUTINE' : 'FACULTY SCHEDULE';
  doc.setFillColor(245, 158, 11); // amber-500
  doc.roundedRect(pageWidth - margin - 52, y + 4, 46, 16, 2, 2, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(badgeTitle, pageWidth - margin - 29, y + 10, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Session: 2026–2027', pageWidth - margin - 29, y + 15, { align: 'center' });

  y += 28;

  // Metadata Summary Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

  doc.setFontSize(7.5);
  if (type === 'class') {
    doc.setTextColor(100, 116, 139);
    doc.text('TARGET CLASS', margin + 6, y + 5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`Class ${classLevel} (${stream})`, margin + 6, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('WEEKLY LOAD', margin + 55, y + 5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`${totalPeriods} Periods / Week`, margin + 55, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('CURRICULUM STREAM', margin + 105, y + 5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(stream, margin + 105, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('STATUS', margin + 148, y + 5);
    doc.setTextColor(5, 150, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('Verified Official', margin + 148, y + 10);
  } else {
    doc.setTextColor(100, 116, 139);
    doc.text('FACULTY MEMBER', margin + 6, y + 5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(facultyMember?.name || 'Faculty Member', margin + 6, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('DESIGNATION', margin + 60, y + 5);
    doc.setTextColor(126, 34, 206);
    doc.setFont('helvetica', 'bold');
    doc.text(facultyMember?.designation || 'Faculty', margin + 60, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('ASSIGNED WORKLOAD', margin + 115, y + 5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`${totalPeriods} Periods (${facultyMember?.maxWeeklyHours || 20}h Max)`, margin + 115, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('PHONE', margin + 155, y + 5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(facultyMember?.phone || 'N/A', margin + 155, y + 10);
  }

  y += 18;

  // Day-by-Day Schedule Section
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('WEEKLY SCHEDULE BREAKDOWN (MONDAY - SUNDAY)', margin, y);
  y += 4;

  daysOfWeek.forEach((day) => {
    const daySlots = slotsByDay[day] || [];
    const isRestDay = daySlots.length === 0;

    const blockHeight = isRestDay ? 10 : 8 + daySlots.length * 9;
    checkPageBreak(blockHeight + 4);

    // Day Container Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(isRestDay ? 248 : 255, isRestDay ? 250 : 255, isRestDay ? 252 : 255);
    doc.roundedRect(margin, y, contentWidth, blockHeight, 1.5, 1.5, 'FD');

    // Day Header Strip
    doc.setFillColor(isRestDay ? 241 : 15, isRestDay ? 245 : 23, isRestDay ? 249 : 42);
    doc.rect(margin, y, 26, isRestDay ? blockHeight : 7, 'F');
    doc.setTextColor(isRestDay ? 71 : 255, isRestDay ? 85 : 255, isRestDay ? 105 : 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(day, margin + 3, y + (isRestDay ? 6.5 : 5));

    if (isRestDay) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('No scheduled classes (Institutional recess & self-study period)', margin + 32, y + 6.5);
      y += blockHeight + 3;
      return;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`${daySlots.length} Scheduled Slot${daySlots.length > 1 ? 's' : ''}`, margin + 32, y + 5);

    let slotY = y + 9;
    daySlots.forEach((slot, idx) => {
      const subject = subjects.find((s) => s.id === slot.subjectId);
      const teacher = faculty.find((f) => f.id === slot.facultyId);

      // Slot line background
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin + 2, slotY - 2.5, contentWidth - 4, 7.5, 'F');
      }

      // Time Slot
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(slot.timeSlot, margin + 4, slotY + 2.5);

      // Room
      doc.setFillColor(209, 250, 229); // emerald-100
      doc.roundedRect(margin + 44, slotY - 1.5, 16, 5, 1, 1, 'F');
      doc.setTextColor(6, 95, 70); // emerald-800
      doc.setFontSize(6.5);
      doc.text(slot.room, margin + 52, slotY + 2, { align: 'center' });

      // Subject
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      const subjectText = `${subject?.name || slot.subjectId} ${type === 'faculty' ? `(Class ${slot.classLevel})` : ''}`;
      doc.text(subjectText, margin + 64, slotY + 2.5);

      // Teacher (for class view) or Batch (for faculty view)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      if (type === 'class') {
        const teacherName = `Faculty: ${teacher?.name || 'Staff'}`;
        doc.text(teacherName, margin + 120, slotY + 2.5);
      } else {
        const batchName = slot.batch.split('(')[0].trim();
        doc.text(batchName, margin + 120, slotY + 2.5);
      }

      slotY += 9;
    });

    y += blockHeight + 3;
  });

  // Footer / Institutional Signatures
  checkPageBreak(25);
  y += 4;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('BILEY ACADEMY ACADEMIC COUNCIL', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`, margin, y + 4);
  doc.text('Automated Institutional Timetable & Examination Governance System', margin, y + 8);

  // Signatures on right
  const sigX1 = pageWidth - margin - 75;
  const sigX2 = pageWidth - margin - 35;

  doc.setDrawColor(148, 163, 184);
  doc.line(sigX1, y + 8, sigX1 + 32, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Mr. Sourav Dinda', sigX1 + 16, y + 6, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Director Authority', sigX1 + 16, y + 12, { align: 'center' });

  doc.line(sigX2, y + 8, sigX2 + 32, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Prof. Ananya Sen', sigX2 + 16, y + 6, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Academic Dean', sigX2 + 16, y + 12, { align: 'center' });

  return doc;
}
