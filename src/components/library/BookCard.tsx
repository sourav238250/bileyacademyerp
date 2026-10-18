import React from 'react';
import { Book, LibrarySessionUser } from '../../types';
import {
  BookOpen,
  MapPin,
  FileText,
  Bookmark,
  Share2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  ArrowRight,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';

interface BookCardProps {
  book: Book;
  currentUser: LibrarySessionUser | null;
  onViewDetails: (book: Book) => void;
  onOpenDigitalReader: (book: Book) => void;
  onIssueBook: (book: Book) => void;
  onEditBook?: (book: Book) => void;
  onDeleteBook?: (bookId: string) => void;
}

const COVER_GRADIENTS: Record<string, string> = {
  indigo: 'from-indigo-900 via-indigo-950 to-slate-950 text-indigo-100 border-indigo-700/50',
  emerald: 'from-emerald-900 via-emerald-950 to-slate-950 text-emerald-100 border-emerald-700/50',
  amber: 'from-amber-900 via-amber-950 to-slate-950 text-amber-100 border-amber-700/50',
  rose: 'from-rose-900 via-rose-950 to-slate-950 text-rose-100 border-rose-700/50',
  blue: 'from-blue-900 via-blue-950 to-slate-950 text-blue-100 border-blue-700/50',
  purple: 'from-purple-900 via-purple-950 to-slate-950 text-purple-100 border-purple-700/50',
  cyan: 'from-cyan-900 via-cyan-950 to-slate-950 text-cyan-100 border-cyan-700/50',
};

const ACCENT_BARS: Record<string, string> = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  cyan: 'bg-cyan-500',
};

export const BookCard: React.FC<BookCardProps> = ({
  book,
  currentUser,
  onViewDetails,
  onOpenDigitalReader,
  onIssueBook,
  onEditBook,
  onDeleteBook,
}) => {
  const isAvailable = book.availableCopies > 0;
  const isStaff = currentUser?.role === 'Staff';

  const gradientClass = COVER_GRADIENTS[book.coverColor] || COVER_GRADIENTS.indigo;
  const accentClass = ACCENT_BARS[book.coverColor] || ACCENT_BARS.indigo;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Book Visual Header Card */}
        <div className={`p-5 bg-gradient-to-br ${gradientClass} border-b relative overflow-hidden select-none`}>
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

          {/* Spine indicator */}
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentClass}`}></div>

          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white backdrop-blur-xs border border-white/15">
              {book.classLevel === 'All' ? 'All Classes' : `Class ${book.classLevel}`}
            </span>

            {book.digitalAvailable && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                <FileText className="w-3 h-3" />
                <span>E-Book</span>
              </span>
            )}
          </div>

          <h3 className="font-black text-sm text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
            {book.title}
          </h3>

          <p className="text-xs text-white/70 mt-1 line-clamp-1 font-medium">
            By {book.author}
          </p>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
            <span className="truncate max-w-[150px]">{book.publisher}</span>
            <span className="font-mono text-white/80">{book.editionYear.split(' ')[0]}</span>
          </div>
        </div>

        {/* Book Metadata Body */}
        <div className="p-5 space-y-3 text-xs">
          {/* Category & Subject */}
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">
              {book.category}
            </span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold text-[10px]">
              {book.subjectName}
            </span>
          </div>

          {/* Description snippet */}
          <p className="text-slate-600 line-clamp-2 text-xs leading-relaxed">
            {book.description}
          </p>

          {/* Shelf Location & Copies Count */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium truncate max-w-[120px]">{book.shelfLocation}</span>
            </div>

            <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span>{book.availableCopies} / {book.totalCopies} Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 pt-0">
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onViewDetails(book)}
            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span>Details</span>
          </button>

          {book.digitalAvailable && (
            <button
              type="button"
              onClick={() => onOpenDigitalReader(book)}
              className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              title="Open Digital Reader Preview"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>Read</span>
            </button>
          )}

          <button
            type="button"
            disabled={!isAvailable}
            onClick={() => onIssueBook(book)}
            className={`py-2 px-3.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isAvailable
                ? 'bg-slate-900 hover:bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isStaff ? 'Issue' : 'Borrow'}</span>
          </button>

          {isStaff && (
            <div className="flex items-center gap-1 pl-1">
              {onEditBook && (
                <button
                  type="button"
                  onClick={() => onEditBook(book)}
                  className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Edit Book Details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDeleteBook && (
                <button
                  type="button"
                  onClick={() => onDeleteBook(book.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Book"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
