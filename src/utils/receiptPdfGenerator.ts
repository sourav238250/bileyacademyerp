import { jsPDF } from 'jspdf';
import { FeeDeposit, Student, InstitutionalAuthorizationConfig } from '../types';
import {
  computeCandidateDuesTillCurrentMonth,
  getCandidatePreviousTransactions,
} from './academicUtils';

export interface ReceiptPDFOptions {
  authConfig?: InstitutionalAuthorizationConfig;
  signatoryName?: string;
  signatoryDesignation?: string;
  authoritySubtext?: string;
  collectedByName?: string;
  sealText?: string;
  digitalSignatureUrl?: string;
  deposits?: FeeDeposit[];
}

export function generateFeeReceiptPDF(
  deposit: FeeDeposit,
  student: Student,
  options: ReceiptPDFOptions = {}
): jsPDF {
  const {
    authConfig,
    signatoryName = authConfig?.accountsSignatoryName || 'S. Dinda',
    signatoryDesignation = authConfig?.accountsSignatoryDesignation || 'Chief Accounts Officer',
    authoritySubtext = authConfig?.accountsAuthoritySubtext || 'Biley Academy Treasury',
    collectedByName = deposit.collectedBy || authConfig?.defaultCollectedBy || 'Accounts Dept - S. Dinda',
    sealText = authConfig?.sealVerificationText || 'PAID',
    digitalSignatureUrl = authConfig?.digitalSignatureUrl,
    deposits = [],
  } = options;

  const allDeposits = deposits.length > 0 ? deposits : [deposit];
  const previousTransactions = getCandidatePreviousTransactions(student.id, deposit.receiptNo || deposit.id, allDeposits);
  const duesSummary = computeCandidateDuesTillCurrentMonth(student, allDeposits, 'September 2026');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const institutionName = authConfig?.sealInstitutionName || 'BILEY ACADEMY';

  // Helper currency formatter safe for standard PDF fonts
  const formatPdfAmount = (amt: number): string => {
    return `Rs. ${Number(amt).toLocaleString('en-IN')}`;
  };

  // Outer Certificate Border
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.6);
  doc.roundedRect(margin - 4, y - 4, contentWidth + 8, pageHeight - (y * 2) + 8, 3, 3, 'S');

  // Inner Accent Border
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.3);
  doc.roundedRect(margin - 2, y - 2, contentWidth + 4, pageHeight - (y * 2) + 4, 2, 2, 'S');

  // Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 26, 'F');

  // Institution Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(251, 191, 36); // amber-400
  doc.text(institutionName.toUpperCase(), margin + 6, y + 9);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240); // slate-200
  doc.text('Center for Secondary & Higher Secondary Academic Excellence', margin + 6, y + 15);

  // Contact info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('42/1 Academy Avenue, Kolkata 700029  |  Ph: +91 98301 00000  |  Email: bileyacademy@gmail.com', margin + 6, y + 21);

  // Receipt Badge on top right
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.roundedRect(pageWidth - margin - 46, y + 4, 40, 8, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('FEE DEPOSIT RECEIPT', pageWidth - margin - 26, y + 9.5, { align: 'center' });

  // Receipt No & Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`No: ${deposit.receiptNo}`, pageWidth - margin - 6, y + 17, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date: ${deposit.depositDate}`, pageWidth - margin - 6, y + 22, { align: 'right' });

  y += 30;

  // Student & Payment Information Section (2 Columns Box)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  // Left Column - Student Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('STUDENT DETAILS', margin + 5, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(student.name, margin + 5, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Student ID: `, margin + 5, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(student.id, margin + 22, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Roll No: `, margin + 5, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.text(student.rollNo, margin + 17, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.text(`Class & Stream: `, margin + 5, y + 28);
  doc.setFont('helvetica', 'bold');
  doc.text(`Class ${student.classLevel} (${student.stream})`, margin + 27, y + 28);

  // Vertical Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin + (contentWidth / 2), y + 4, margin + (contentWidth / 2), y + 30);

  // Right Column - Guardian & Payment Details
  const rightColX = margin + (contentWidth / 2) + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('GUARDIAN & PAYMENT INFO', rightColX, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`${student.guardianName} (${student.guardianRelation})`, rightColX, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Contact: `, rightColX, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(student.contactNumber, rightColX + 16, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Batch: `, rightColX, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.text(student.batch, rightColX + 13, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Mode: `, rightColX, y + 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87); // emerald-700
  doc.text(deposit.paymentMode, rightColX + 23, y + 28);

  y += 38;

  // Table of Fee Particulars Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('#', margin + 4, y + 5.5);
  doc.text('FEE PARTICULARS / HEAD DESCRIPTION', margin + 14, y + 5.5);
  doc.text('COVERAGE PERIOD', margin + 105, y + 5.5);
  doc.text('AMOUNT', pageWidth - margin - 4, y + 5.5, { align: 'right' });

  y += 8;

  // Table Rows (Itemized Breakdown)
  const items = deposit.headBreakdown && deposit.headBreakdown.length > 0
    ? deposit.headBreakdown
    : [{
        head: deposit.feeHead,
        amount: deposit.amountPaid,
        details: deposit.remarks,
      }];

  const coverageText = deposit.monthsCovered && deposit.monthsCovered.length > 0
    ? deposit.monthsCovered.join(', ')
    : 'Current Academic Session';

  items.forEach((item, index) => {
    const rowHeight = item.details ? 11 : 8.5;
    
    // Alternating background
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(String(index + 1).padStart(2, '0'), margin + 4, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(item.head, margin + 14, y + 5.5);

    if (item.details) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      doc.text(item.details, margin + 14, y + 9);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(coverageText, margin + 105, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(formatPdfAmount(item.amount), pageWidth - margin - 4, y + 5.5, { align: 'right' });

    y += rowHeight;
  });

  // Scholarship / Discount Row if applicable
  if (deposit.discountApplied && deposit.discountApplied > 0) {
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.line(margin, y + 8, margin + contentWidth, y + 8);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(21, 128, 61);
    doc.text('- Scholarship / Merit Concession Applied', margin + 14, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.text(`- ${formatPdfAmount(deposit.discountApplied)}`, pageWidth - margin - 4, y + 5.5, { align: 'right' });

    y += 8;
  }

  // Total Footer Row
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, contentWidth, 10, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('NET TOTAL AMOUNT RECEIVED:', margin + 80, y + 6.5, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(4, 120, 87); // emerald-700
  doc.text(formatPdfAmount(deposit.amountPaid), pageWidth - margin - 4, y + 7, { align: 'right' });

  y += 15;

  // Transaction Reference Note
  if (deposit.transactionRef || deposit.remarks) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    let noteText = '';
    if (deposit.transactionRef) noteText += `Txn / Reference ID: ${deposit.transactionRef}    `;
    if (deposit.remarks) noteText += `Notes: ${deposit.remarks}`;
    doc.text(noteText, margin + 4, y + 5);

    y += 11;
  } else {
    y += 2;
  }

  // ----------------------------------------------------
  // PREVIOUS TRANSACTIONS FOR THIS CANDIDATE
  // ----------------------------------------------------
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(`PREVIOUS DEPOSIT TRANSACTIONS (CANDIDATE: ${student.name.toUpperCase()})`, margin + 4, y + 4.2);

  y += 6;

  if (previousTransactions.length > 0) {
    const prevToShow = previousTransactions.slice(0, 3);
    prevToShow.forEach((prevDep, pIdx) => {
      const pRowH = 5.5;
      if (pIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, pRowH, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, y + pRowH, margin + contentWidth, y + pRowH);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(51, 65, 85);
      doc.text(prevDep.receiptNo, margin + 4, y + 3.8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      doc.text(prevDep.depositDate, margin + 45, y + 3.8);

      const prevCoverage = prevDep.monthsCovered && prevDep.monthsCovered.length > 0
        ? prevDep.monthsCovered.join(', ')
        : prevDep.feeHead;
      const truncatedCoverage = prevCoverage.length > 35 ? prevCoverage.slice(0, 32) + '...' : prevCoverage;
      doc.text(truncatedCoverage, margin + 75, y + 3.8);

      doc.text(prevDep.paymentMode, margin + 130, y + 3.8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(formatPdfAmount(prevDep.amountPaid), pageWidth - margin - 4, y + 3.8, { align: 'right' });

      y += pRowH;
    });

    if (previousTransactions.length > 3) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.2);
      doc.setTextColor(100, 116, 139);
      doc.text(`+ ${previousTransactions.length - 3} older previous transaction(s) recorded in student ledger`, margin + 4, y + 3.5);
      y += 5;
    }
  } else {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('First deposit transaction of academic session (No prior records).', margin + 4, y + 3.8);
    y += 5.5;
  }

  y += 3;

  // ----------------------------------------------------
  // REMAINING DUES TILL CURRENT MONTH (SEPTEMBER 2026)
  // ----------------------------------------------------
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 15, 1.5, 1.5, 'FD');

  // Left col: Summary till current month
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`CANDIDATE DUES & BALANCE STATEMENT (TILL ${duesSummary.currentSessionMonth.toUpperCase()})`, margin + 4, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(`Net Payable till ${duesSummary.currentSessionMonth}: ${formatPdfAmount(duesSummary.netPayableTillCurrentMonth)}`, margin + 4, y + 9);
  doc.text(`Total Cumulative Deposited: ${formatPdfAmount(duesSummary.totalPaidTillDate)}`, margin + 4, y + 13);

  // Right col: Remaining Dues status
  const duesColX = margin + (contentWidth / 2) + 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  if (duesSummary.remainingDuesTillCurrentMonth === 0) {
    doc.setTextColor(4, 120, 87); // emerald-700
    doc.text(`Remaining Dues (${duesSummary.currentSessionMonth}): Rs. 0 (Nil - Account Cleared)`, duesColX, y + 6);
  } else {
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text(`Remaining Dues (${duesSummary.currentSessionMonth}): ${formatPdfAmount(duesSummary.remainingDuesTillCurrentMonth)} (Pending)`, duesColX, y + 6);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total Annual Session Balance Remaining: ${formatPdfAmount(duesSummary.totalAnnualDuesRemaining)}`, duesColX, y + 11.5);

  y += 18;

  // Bottom Section: Stamp Seal & Signatures
  const footerY = Math.max(y + 4, pageHeight - margin - 36);

  // Circular Paid Stamp Simulation
  doc.setDrawColor(4, 120, 87); // emerald-700
  doc.setLineWidth(0.8);
  doc.circle(margin + 16, footerY + 12, 12, 'S');

  doc.setLineWidth(0.3);
  doc.circle(margin + 16, footerY + 12, 10.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(4, 120, 87);
  doc.text(institutionName.slice(0, 16).toUpperCase(), margin + 16, footerY + 6.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 95, 70);
  doc.text(sealText, margin + 16, footerY + 12.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(4, 120, 87);
  doc.text(deposit.depositDate, margin + 16, footerY + 17.5, { align: 'center' });

  // Center: Collector Note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Receipt generated electronically.', margin + 35, footerY + 10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(`Collected By: ${collectedByName}`, margin + 35, footerY + 15);

  // Right: Authorized Signature & Digital Signature Graphic
  const sigX = pageWidth - margin - 45;

  if (digitalSignatureUrl && authConfig?.showSignatureOnReceipts !== false) {
    try {
      // Add digital signature image above signature line
      doc.addImage(digitalSignatureUrl, 'PNG', sigX - 5, footerY - 2, 38, 11);
    } catch {
      // Gracefully ignore if image parsing fails in PDF engine
    }
  }

  doc.setDrawColor(148, 163, 184); // slate-400
  doc.setLineWidth(0.4);
  doc.line(sigX - 10, footerY + 11, pageWidth - margin, footerY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(signatoryName, sigX + 15, footerY + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(signatoryDesignation, sigX + 15, footerY + 20, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(authoritySubtext, sigX + 15, footerY + 24, { align: 'center' });

  // Bottom Disclaimer Bar
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    '* This is an official computer-generated fee acknowledgement receipt valid for all institutional and academic records.',
    pageWidth / 2,
    pageHeight - margin + 1,
    { align: 'center' }
  );

  return doc;
}
