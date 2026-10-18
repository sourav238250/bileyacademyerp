import React from 'react';
import { Book, LibrarySessionUser } from '../../types';
import {
  X,
  BookOpen,
  MapPin,
  Barcode,
  Layers,
  FileText,
  Bookmark,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  Tag,
  Download,
  Share2,
} from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  currentUser: LibrarySessionUser | null;
  onClose: () => void;
  onOpenDigitalReader: (book: Book) => void;
  onIssueBook: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  currentUser,
  onClose,
  onOpenDigitalReader,
  onIssueBook,
}) => {
  if (!book) return null;

  const isAvailable = book.availableCopies > 0;
  const isStaff = currentUser?.role === 'Staff';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative my-6">
        {/* Header with Close */}
        <div className="flex items-center justify-between p-6 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-teal-400 uppercase font-black tracking-widest block">
                Biley Academy Library Catalog
              </span>
              <h2 className="text-lg font-black text-white line-clamp-1">
                {book.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Class Target</span>
              <span className="font-bold text-slate-900 text-sm">
                {book.classLevel === 'All' ? 'All Classes' : `Class ${book.classLevel}`}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Subject</span>
              <span className="font-bold text-slate-900 text-sm truncate block">
                {book.subjectName}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Shelf Location</span>
              <div className="flex items-center gap-1 font-bold text-slate-900 text-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{book.shelfLocation}</span>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border ${
              isAvailable
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <span className="text-[10px] uppercase font-bold block mb-1">Availability</span>
              <span className="font-bold text-xs flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                {book.availableCopies} of {book.totalCopies} Available
              </span>
            </div>
          </div>

          {/* Book Information Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Bibliographical Information
            </h4>
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Author(s):</span>
                <span className="font-bold text-slate-900 text-right">{book.author}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Publisher:</span>
                <span className="font-semibold text-slate-900 text-right">{book.publisher}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Edition / Academic Year:</span>
                <span className="font-semibold text-slate-900">{book.editionYear}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {book.category}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">ISBN Code:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-slate-600" />
                  {book.isbn}
                </span>
              </div>
            </div>
          </div>

          {/* Overview & Synopsis */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Curriculum Scope & Synopsis
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl">
              {book.description}
            </p>
          </div>

          {/* Tags */}
          {book.tags && book.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Curriculum Keywords & Tags</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {book.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {currentUser && (
              <span>Session: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role})</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {book.digitalAvailable && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDigitalReader(book);
                }}
                className="py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <FileText className="w-4 h-4 text-amber-700" />
                <span>Read Digital Chapter</span>
              </button>
            )}

            <button
              type="button"
              disabled={!isAvailable}
              onClick={() => {
                onClose();
                onIssueBook(book);
              }}
              className={`py-2.5 px-5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md ${
                isAvailable
                  ? 'bg-slate-900 hover:bg-teal-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{isStaff ? 'Issue This Book' : 'Borrow Book'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
