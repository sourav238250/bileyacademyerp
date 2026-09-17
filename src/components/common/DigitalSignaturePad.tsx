import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PenTool,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  Sparkles,
  Image as ImageIcon,
  Palette,
  ShieldCheck,
  Undo2,
  FileCheck,
  X,
  Maximize2
} from 'lucide-react';

interface DigitalSignaturePadProps {
  value?: string;
  signatureType?: 'drawn' | 'uploaded' | 'preset' | 'none';
  signatoryName?: string;
  signatoryDesignation?: string;
  onChange: (dataUrl: string, type: 'drawn' | 'uploaded' | 'preset' | 'none') => void;
  onClear?: () => void;
}

const INK_COLORS = [
  { id: 'royal-blue', name: 'Royal Blue (Official)', hex: '#1e3a8a' },
  { id: 'deep-black', name: 'Midnight Black', hex: '#0f172a' },
  { id: 'classic-blue', name: 'Ink Blue', hex: '#2563eb' },
  { id: 'emerald', name: 'Auditor Emerald', hex: '#047857' },
];

const PEN_WIDTHS = [
  { id: 'fine', label: 'Fine (2px)', width: 2 },
  { id: 'medium', label: 'Regular (3.5px)', width: 3.5 },
  { id: 'bold', label: 'Bold (5px)', width: 5 },
];

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  value,
  signatureType = 'preset',
  signatoryName = 'Mr. Sourav Dinda',
  signatoryDesignation = 'Director & Authorized Signatory',
  onChange,
  onClear,
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'upload' | 'preset'>('draw');
  const [selectedColor, setSelectedColor] = useState(INK_COLORS[0].hex);
  const [selectedWidth, setSelectedWidth] = useState(PEN_WIDTHS[1].width);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnStrokes, setHasDrawnStrokes] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesHistoryRef = useRef<ImageData[]>([]);
  const isPointerDownRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions matching display size for sharp rendering
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual pixel dimensions
    canvas.width = (rect.width || 480) * dpr;
    canvas.height = (rect.height || 180) * dpr;

    // Normalize coordinates
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear transparent background
    ctx.clearRect(0, 0, rect.width || 480, rect.height || 180);
    strokesHistoryRef.current = [];
    setHasDrawnStrokes(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'draw') {
      // Delay slightly for modal layout to settle
      const timer = setTimeout(() => {
        initCanvas();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab, initCanvas]);

  // Save canvas stroke snapshot for undo
  const saveStrokeSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    strokesHistoryRef.current.push(imageData);
    setHasDrawnStrokes(true);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isPointerDownRef.current = true;
    lastPointRef.current = { x, y };
    setIsDrawing(true);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = selectedWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = selectedWidth;

    // Quadratic curve for smoother stroke
    const midX = (lastPointRef.current.x + x) / 2;
    const midY = (lastPointRef.current.y + y) / 2;

    ctx.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midX, midY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(midX, midY);

    lastPointRef.current = { x, y };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    lastPointRef.current = null;
    setIsDrawing(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore pointer release error
    }

    saveStrokeSnapshot();
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (strokesHistoryRef.current.length > 1) {
      strokesHistoryRef.current.pop(); // Remove last
      const prev = strokesHistoryRef.current[strokesHistoryRef.current.length - 1];
      ctx.putImageData(prev, 0, 0);
    } else if (strokesHistoryRef.current.length === 1) {
      strokesHistoryRef.current.pop();
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawnStrokes(false);
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesHistoryRef.current = [];
    setHasDrawnStrokes(false);
  };

  // Convert canvas to transparent PNG data URL and apply
  const handleApplyDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawnStrokes) return;

    // Create a trimmed high-res copy
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl, 'drawn');
  };

  // Process uploaded image file
  const processImageFile = (file: File) => {
    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size is too large. Please upload an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        // Optimize and resize image on an offscreen canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const maxW = 500;
          const maxH = 200;
          let w = img.width;
          let h = img.height;

          if (w > maxW || h > maxH) {
            const ratio = Math.min(maxW / w, maxH / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }

          const offCanvas = document.createElement('canvas');
          offCanvas.width = w;
          offCanvas.height = h;
          const offCtx = offCanvas.getContext('2d');
          if (offCtx) {
            offCtx.drawImage(img, 0, 0, w, h);
            const optimizedDataUrl = offCanvas.toDataURL('image/png', 0.95);
            onChange(optimizedDataUrl, 'uploaded');
          } else {
            onChange(result, 'uploaded');
          }
        };
        img.src = result;
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read the uploaded image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Generate stylized SVG cursive presets
  const applyPresetSignature = (presetId: string) => {
    let svgString = '';
    const cleanName = signatoryName.replace(/^Mr\.\s*|^Mrs\.\s*|^Dr\.\s*|^Prof\.\s*/i, '');

    if (presetId === 'formal') {
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 110" width="360" height="110"><path d="M 30,70 Q 50,15 70,35 Q 90,65 110,30 Q 130,5 145,50 Q 160,85 180,45 Q 200,15 220,40 Q 240,65 260,35 Q 280,10 300,50 Q 315,75 340,30 M 45,82 C 110,75 220,70 345,64" fill="none" stroke="#1e3a8a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><text x="45" y="60" font-family="'Brush Script MT', cursive, sans-serif" font-size="28" font-style="italic" fill="#1e3a8a" opacity="0.9">${cleanName}</text></svg>`;
    } else if (presetId === 'calligraphic') {
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 110" width="360" height="110"><path d="M 25,60 C 50,20 65,80 90,30 C 115,-10 135,75 160,40 C 185,10 205,65 235,35 C 265,5 285,60 325,25 M 35,78 C 95,70 200,66 335,58" fill="none" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><text x="40" y="58" font-family="'Great Vibes', 'Brush Script MT', cursive" font-size="32" font-style="italic" fill="#0f172a">${cleanName}</text></svg>`;
    } else {
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 110" width="360" height="110"><path d="M 25,65 Q 45,20 60,35 Q 75,55 90,30 Q 105,10 115,45 Q 125,75 140,50 Q 155,25 175,40 Q 195,55 210,35 Q 225,18 240,48 Q 255,70 280,30 M 45,78 C 100,72 200,68 295,62" fill="none" stroke="#1e3a8a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }

    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    onChange(dataUrl, 'preset');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-4 sm:p-5">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              Official Institutional Digital Signature
            </h4>
            <p className="text-[11px] text-slate-500">
              Draw on canvas, upload scanned png/jpg, or choose an official cursive preset.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'draw'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'preset'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DRAW CANVAS */}
      {activeTab === 'draw' && (
        <div className="space-y-3">
          {/* Canvas Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
            {/* Ink Colors */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Ink:</span>
              {INK_COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color.hex)}
                  title={color.name}
                  className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                    selectedColor === color.hex
                      ? 'scale-110 border-indigo-600 shadow-xs'
                      : 'border-white opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {selectedColor === color.hex && <Check className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>

            {/* Pen Width */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Pen:</span>
              {PEN_WIDTHS.map((pw) => (
                <button
                  key={pw.id}
                  type="button"
                  onClick={() => setSelectedWidth(pw.width)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    selectedWidth === pw.width
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {pw.label}
                </button>
              ))}
            </div>

            {/* Undo & Clear */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!hasDrawnStrokes}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Undo last stroke"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClearCanvas}
                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Clear signature pad"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Canvas Area */}
          <div className="relative rounded-2xl border-2 border-dashed border-indigo-200 bg-radial from-white via-indigo-50/20 to-slate-50 overflow-hidden touch-none select-none">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="w-full h-44 cursor-crosshair block"
              style={{ touchAction: 'none' }}
            />

            {!hasDrawnStrokes && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-1">
                <PenTool className="w-6 h-6 text-indigo-300 animate-pulse" />
                <span className="text-xs font-medium">Draw your digital signature here</span>
                <span className="text-[10px] text-slate-400">Mouse, touchpad or stylus touch supported</span>
              </div>
            )}

            {/* Baseline Guide */}
            <div className="absolute bottom-6 left-8 right-8 border-b border-dashed border-slate-300/80 pointer-events-none flex justify-end">
              <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 mr-2 -mb-4">
                Signature Baseline
              </span>
            </div>
          </div>

          {/* Draw Actions */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              * The drawn signature is converted into a transparent vector-grade PNG.
            </span>

            <button
              type="button"
              onClick={handleApplyDrawnSignature}
              disabled={!hasDrawnStrokes}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Apply Drawn Signature</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD IMAGE */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer ${
              isDragOver
                ? 'border-indigo-600 bg-indigo-50/50'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
            }`}
            onClick={() => document.getElementById('signature-file-upload-input')?.click()}
          >
            <input
              id="signature-file-upload-input"
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">
                Click to browse or drag & drop signature file
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                PNG with transparent background, JPG, SVG or WebP (Max 5MB)
              </p>
            </div>

            <span className="px-3 py-1 bg-white border border-slate-200 text-indigo-700 text-xs font-bold rounded-xl shadow-2xs">
              Choose Image File
            </span>
          </div>

          {uploadError && (
            <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
          )}

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Pro Tip:</strong> For best results on printed receipts and report cards, upload a high-contrast signature on white paper or a transparent PNG.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CURSIVE SCRIPT PRESETS */}
      {activeTab === 'preset' && (
        <div className="space-y-3">
          <p className="text-[11px] text-slate-600">
            Quickly generate an authorized cursive calligraphic signature for <strong>{signatoryName}</strong>:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => applyPresetSignature('formal')}
              className="p-4 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Preset 1 • Royal Script
              </span>
              <div className="h-14 flex items-center justify-center bg-white rounded-lg border border-slate-100 p-2">
                <span className="font-serif italic font-bold text-blue-900 text-lg group-hover:scale-105 transition-transform">
                  {signatoryName.replace(/^Mr\.\s*|^Mrs\.\s*/i, '')}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-indigo-700 mt-2 block">
                Use Royal Navy Style →
              </span>
            </button>

            <button
              type="button"
              onClick={() => applyPresetSignature('calligraphic')}
              className="p-4 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Preset 2 • Executive Ink
              </span>
              <div className="h-14 flex items-center justify-center bg-white rounded-lg border border-slate-100 p-2">
                <span className="font-mono italic font-black text-slate-950 text-base tracking-tight group-hover:scale-105 transition-transform">
                  {signatoryName.replace(/^Mr\.\s*|^Mrs\.\s*/i, '')}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-indigo-700 mt-2 block">
                Use Executive Black →
              </span>
            </button>

            <button
              type="button"
              onClick={() => applyPresetSignature('standard')}
              className="p-4 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Preset 3 • Fluid Flourish
              </span>
              <div className="h-14 flex items-center justify-center bg-white rounded-lg border border-slate-100 p-2">
                <svg viewBox="0 0 160 40" className="w-full h-full text-indigo-900">
                  <path
                    d="M 10,25 Q 25,5 40,15 Q 60,30 80,10 Q 100,5 120,25 Q 140,5 155,20 M 15,32 C 45,30 110,28 150,25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-semibold text-indigo-700 mt-2 block">
                Use Abstract Flourish →
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE SIGNATURE PREVIEW & STATUS */}
      {value ? (
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              Active Rendered Signature ({signatureType.toUpperCase()})
            </span>

            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="text-[10px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Remove Signature
              </button>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Signature Graphic Display */}
            <div className="h-16 sm:h-20 w-48 sm:w-56 bg-white rounded-lg border border-slate-200 p-2 flex items-center justify-center shadow-inner overflow-hidden">
              <img
                src={value}
                alt="Authorized Institutional Digital Signature"
                className="max-h-full max-w-full object-contain filter contrast-125"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Document Signature Context */}
            <div className="text-left sm:text-right text-xs">
              <div className="w-36 border-b border-slate-400 mb-1 sm:ml-auto"></div>
              <p className="font-bold text-slate-900">{signatoryName}</p>
              <p className="text-[10px] text-slate-600 font-medium">{signatoryDesignation}</p>
              <p className="text-[9px] text-emerald-700 font-semibold mt-0.5 flex sm:justify-end items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" /> Digitally Authorized & Certified
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
          No digital signature configured yet. Draw, upload or choose a preset above.
        </div>
      )}

    </div>
  );
};
