import React, { useState } from 'react';
import { Book, LibrarySessionUser } from '../../types';
import {
  X,
  FileText,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Bookmark,
  Share2,
  Printer,
  Sparkles,
  CheckCircle2,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface DigitalReaderModalProps {
  book: Book | null;
  currentUser: LibrarySessionUser | null;
  onClose: () => void;
}

export const DigitalReaderModal: React.FC<DigitalReaderModalProps> = ({
  book,
  currentUser,
  onClose,
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal');

  if (!book) return null;

  // Curated chapters/topics for the book
  const sampleChapters = [
    {
      title: 'Chapter Overview & Core Concepts',
      subtitle: 'Syllabus Alignment • Key Theorems & Fundamentals',
      content: [
        `Welcome to the digital academic edition of "${book.title}". This digital repository version is maintained by Biley Academy for verified academic study and revision.`,
        'Section 1: Conceptual Building Blocks',
        'In this section, foundational laws, axiomatic principles, and real-world representations are examined in rigorous detail. Every concept is mapped to the board standards and competitive examinations (JEE/NEET/Olympiad foundations).',
        'Section 2: Step-by-Step Problem Deconstructions',
        '1. Identify given variables and target quantities.\n2. Apply first-principle equations and boundary conditions.\n3. Verify units, dimensions, and sign conventions.\n4. Validate physical interpretation of final numerical values.',
      ],
      formulas: [
        'Fundamental Relation: f(x) = ∑ (a_n · x^n)',
        'Conservation Law: ΔE_total = 0',
        'Equilibrium Criterion: ΣF_ext = 0',
      ],
    },
    {
      title: 'Classroom Lecture Notes & Board Insights',
      subtitle: 'Exam High-Weightage Chapters & Examiner Tips',
      content: [
        'Important Examiner Instructions:',
        '• Always write complete formula derivations showing intermediate steps for 3-mark and 5-mark board questions.',
        '• Highlight final numerical answers with SI units in clean rectangular answer boxes.',
        '• Draw neat, clearly labelled circuit diagrams, ray diagrams, or anatomical sketches using pencil.',
        '• In reasoning questions, quote the specific law or theorem before applying it to the scenario.',
      ],
      formulas: [
        'Standard Deviation: σ = √[ Σ(x_i - μ)² / N ]',
        'Thermodynamic Efficiency: η = 1 - (T_cold / T_hot)',
      ],
    },
    {
      title: 'Practice Question Bank & Self-Assessment',
      subtitle: 'Graded MCQ & Numerical Problems',
      content: [
        'Question 1 (Conceptual): Explain why the principle holds true under adiabatic vs isothermal expansions.',
        'Question 2 (Application): Calculate the percentage change in output efficiency when input parameters scale by 1.25x.',
        'Question 3 (Board Exemplar): Provide three real-life engineering applications of this law and justify with mathematical proofs.',
      ],
      formulas: [
        'Target Accuracy Goal: ≥ 85% for Board Distinction',
      ],
    },
  ];

  const currentChapter = sampleChapters[currentChapterIndex] || sampleChapters[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-4xl h-[92vh] rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden text-slate-100">
        
        {/* Reader Top Bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950 select-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Digital E-Book Reader
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Verified Reader Access: {currentUser?.name || 'Authorized Reader'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-1">
                {book.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Font Size Selector */}
            <div className="hidden sm:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                  fontSize === 'normal' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                  fontSize === 'large' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xl')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                  fontSize === 'xl' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                A++
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Print reading excerpt"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-rose-900/50 rounded-xl transition-colors cursor-pointer"
              title="Close Reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chapter Outline Sidebar (Desktop) */}
          <div className="hidden md:block w-64 bg-slate-950/60 border-r border-slate-800 p-4 overflow-y-auto custom-scrollbar">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Table of Contents
            </h4>
            <div className="space-y-1.5">
              {sampleChapters.map((chap, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentChapterIndex(idx)}
                  className={`w-full text-left p-3 rounded-2xl text-xs transition-all cursor-pointer ${
                    currentChapterIndex === idx
                      ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 uppercase block">Chapter {idx + 1}</span>
                  <span className="line-clamp-2 leading-snug">{chap.title}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 p-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>Watermark Protection</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">
                Licensed to Biley Academy for internal student & faculty academic use only.
              </p>
            </div>
          </div>

          {/* Main Reading Surface */}
          <div className="flex-1 bg-slate-900 p-6 sm:p-10 overflow-y-auto custom-scrollbar flex flex-col justify-between">
            <div className="max-w-2xl mx-auto w-full space-y-6">
              
              {/* Chapter Header */}
              <div className="border-b border-slate-800 pb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  Chapter {currentChapterIndex + 1} of {sampleChapters.length}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white mt-2">
                  {currentChapter.title}
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {currentChapter.subtitle}
                </p>
              </div>

              {/* Text paragraphs */}
              <div className={`space-y-4 text-slate-300 leading-relaxed ${
                fontSize === 'large' ? 'text-base leading-loose' : fontSize === 'xl' ? 'text-lg leading-loose' : 'text-sm'
              }`}>
                {currentChapter.content.map((p, idx) => (
                  <p key={idx} className="whitespace-pre-line bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/60">
                    {p}
                  </p>
                ))}
              </div>

              {/* Key Formulas / Key Points Callout */}
              {currentChapter.formulas && currentChapter.formulas.length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Essential Memory Formulary</span>
                  </h4>
                  <ul className="space-y-1 font-mono text-xs text-amber-200">
                    {currentChapter.formulas.map((f, idx) => (
                      <li key={idx} className="bg-slate-900/60 p-2 rounded-xl border border-amber-500/20">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                disabled={currentChapterIndex === 0}
                onClick={() => setCurrentChapterIndex((prev) => Math.max(0, prev - 1))}
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentChapterIndex === 0
                    ? 'text-slate-600 bg-slate-800/40 cursor-not-allowed'
                    : 'text-white bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Section</span>
              </button>

              <span className="text-xs font-bold text-slate-400">
                {currentChapterIndex + 1} / {sampleChapters.length}
              </span>

              <button
                type="button"
                disabled={currentChapterIndex >= sampleChapters.length - 1}
                onClick={() => setCurrentChapterIndex((prev) => Math.min(sampleChapters.length - 1, prev + 1))}
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentChapterIndex >= sampleChapters.length - 1
                    ? 'text-slate-600 bg-slate-800/40 cursor-not-allowed'
                    : 'text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md'
                }`}
              >
                <span>Next Section</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
