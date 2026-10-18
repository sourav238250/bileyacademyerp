import React, { useState, useEffect } from 'react';
import { Book, BookCategory, ClassLevel, StreamType } from '../../types';
import {
  X,
  BookPlus,
  BookOpen,
  MapPin,
  Barcode,
  Layers,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AddEditBookModalProps {
  isOpen: boolean;
  editingBook: Book | null;
  onClose: () => void;
  onSaveBook: (book: Book) => void;
}

const CATEGORIES: BookCategory[] = [
  'NCERT & Core Textbooks',
  'Reference & Practice Guides',
  'Board & Competitive PYQs',
  'Foundation JEE & NEET',
  'Literature & Language',
  'Science Experiments & Lab Manuals',
];

const CLASS_LEVELS: (ClassLevel | 'All')[] = [
  'All',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
];

const COVER_COLORS: ('indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'cyan')[] = [
  'indigo',
  'emerald',
  'amber',
  'rose',
  'blue',
  'purple',
  'cyan',
];

export const AddEditBookModal: React.FC<AddEditBookModalProps> = ({
  isOpen,
  editingBook,
  onClose,
  onSaveBook,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [editionYear, setEditionYear] = useState('2025-26 Edition');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState<BookCategory>('NCERT & Core Textbooks');
  const [classLevel, setClassLevel] = useState<ClassLevel | 'All'>('10');
  const [stream, setStream] = useState<StreamType>('General');
  const [subjectName, setSubjectName] = useState('Mathematics');
  const [shelfLocation, setShelfLocation] = useState('Rack M-1, Shelf 2');
  const [totalCopies, setTotalCopies] = useState<number>(10);
  const [availableCopies, setAvailableCopies] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [coverColor, setCoverColor] = useState<'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'cyan'>('indigo');
  const [digitalAvailable, setDigitalAvailable] = useState<boolean>(true);
  const [digitalPagesCount, setDigitalPagesCount] = useState<number>(300);
  const [tagsInput, setTagsInput] = useState('NCERT, Board Exam, Syllabus');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingBook) {
      setTitle(editingBook.title);
      setAuthor(editingBook.author);
      setPublisher(editingBook.publisher);
      setEditionYear(editingBook.editionYear);
      setIsbn(editingBook.isbn);
      setCategory(editingBook.category);
      setClassLevel(editingBook.classLevel);
      setStream(editingBook.stream || 'General');
      setSubjectName(editingBook.subjectName);
      setShelfLocation(editingBook.shelfLocation);
      setTotalCopies(editingBook.totalCopies);
      setAvailableCopies(editingBook.availableCopies);
      setDescription(editingBook.description);
      setCoverColor(editingBook.coverColor || 'indigo');
      setDigitalAvailable(editingBook.digitalAvailable);
      setDigitalPagesCount(editingBook.digitalPagesCount || 300);
      setTagsInput(editingBook.tags ? editingBook.tags.join(', ') : '');
    } else {
      setTitle('');
      setAuthor('');
      setPublisher('NCERT / S. Chand');
      setEditionYear('2025-26 Edition');
      setIsbn(`978-93-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1 + Math.random() * 9)}`);
      setCategory('NCERT & Core Textbooks');
      setClassLevel('10');
      setStream('General');
      setSubjectName('Mathematics');
      setShelfLocation('Rack A-1, Shelf 2');
      setTotalCopies(10);
      setAvailableCopies(10);
      setDescription('');
      setCoverColor('indigo');
      setDigitalAvailable(true);
      setDigitalPagesCount(300);
      setTagsInput('Textbook, Board, Foundation');
    }
  }, [editingBook, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !author.trim() || !subjectName.trim()) {
      setError('Title, author, and subject name are required fields.');
      return;
    }

    if (totalCopies <= 0) {
      setError('Total copies count must be at least 1.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const bookToSave: Book = {
      id: editingBook ? editingBook.id : `BK-${Date.now()}`,
      isbn: isbn.trim() || `ISBN-${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      publisher: publisher.trim(),
      editionYear: editionYear.trim(),
      category,
      classLevel,
      stream,
      subjectName: subjectName.trim(),
      shelfLocation: shelfLocation.trim(),
      totalCopies: Number(totalCopies),
      availableCopies: Math.min(Number(availableCopies), Number(totalCopies)),
      description: description.trim() || `${title.trim()} standard curriculum reference textbook.`,
      coverColor,
      digitalAvailable,
      digitalPagesCount: Number(digitalPagesCount),
      tags,
      addedDate: editingBook ? editingBook.addedDate : new Date().toISOString().split('T')[0],
    };

    onSaveBook(bookToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <BookPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-teal-400 uppercase font-bold tracking-wider block">
                Library Inventory Management
              </span>
              <h2 className="text-lg font-black text-white">
                {editingBook ? 'Edit Book Specifications' : 'Add New Book to Library Catalog'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Book Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mathematics Textbook for Class 10"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Author(s) *</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Dr. H. C. Verma"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Publisher & Edition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Publisher</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="e.g. NCERT, S. Chand"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Edition / Academic Year</label>
              <input
                type="text"
                value={editionYear}
                onChange={(e) => setEditionYear(e.target.value)}
                placeholder="e.g. 2025-26 Edition"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ISBN Code</label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="e.g. 978-93-5292-120-1"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Category, Class, Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BookCategory)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Class Level</label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value as any)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                {CLASS_LEVELS.map((cl) => (
                  <option key={cl} value={cl}>
                    {cl === 'All' ? 'All Classes' : `Class ${cl}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Subject Name *</label>
              <input
                type="text"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Mathematics, Physics"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Shelf Location & Copies */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Shelf Location</label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="e.g. Rack M-1, Shelf 2"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Copies</label>
              <input
                type="number"
                min="1"
                value={totalCopies}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTotalCopies(val);
                  if (val < availableCopies) setAvailableCopies(val);
                }}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Available Copies</label>
              <input
                type="number"
                min="0"
                max={totalCopies}
                value={availableCopies}
                onChange={(e) => setAvailableCopies(Number(e.target.value))}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
              />
            </div>
          </div>

          {/* Cover Color Theme & Digital E-Book */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Book Cover Theme</label>
              <div className="flex items-center gap-2">
                {COVER_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setCoverColor(col)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                      col === 'indigo' ? 'bg-indigo-700' :
                      col === 'emerald' ? 'bg-emerald-700' :
                      col === 'amber' ? 'bg-amber-600' :
                      col === 'rose' ? 'bg-rose-700' :
                      col === 'blue' ? 'bg-blue-700' :
                      col === 'purple' ? 'bg-purple-700' : 'bg-cyan-700'
                    } ${coverColor === col ? 'scale-125 border-white ring-2 ring-slate-900 shadow-md' : 'border-transparent'}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Digital E-Book Facility</label>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={digitalAvailable}
                  onChange={(e) => setDigitalAvailable(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">Enable in-app Digital Reader Preview</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Book Description & Key Chapters</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the main topics, syllabus alignment, or textbook features..."
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. NCERT, Calculus, Board Exam, Formulae"
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-slate-900 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{editingBook ? 'Update Book Record' : 'Save New Book'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
