import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { loadInitialState, AppStateData } from './src/utils/storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'biley_academy_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory state cache
let stateCache: AppStateData;
let stateVersion = 1;
let lastServerSavedAt = new Date().toISOString();

// Initialize database from file or initial dataset
function initDatabase(): AppStateData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.students) && Array.isArray(parsed.faculty)) {
        console.log(`[Backend DB] Loaded existing institutional database from ${DB_FILE}`);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Backend DB] Failed reading database file, regenerating from seed:', err);
  }

  // Generate initial state
  const seedState = loadInitialState();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(seedState, null, 2), 'utf-8');
    console.log(`[Backend DB] Seeded fresh institutional database at ${DB_FILE}`);
  } catch (err) {
    console.error('[Backend DB] Error saving initial seed:', err);
  }
  return seedState;
}

stateCache = initDatabase();

function persistStateToDisk(): boolean {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(stateCache, null, 2), 'utf-8');
    lastServerSavedAt = new Date().toISOString();
    return true;
  } catch (err) {
    console.error('[Backend DB] Failed to persist state to disk:', err);
    return false;
  }
}

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ==========================================
  // BACKEND REST API ROUTES (/api/*)
  // ==========================================

  // 1. Health & Diagnostic Check
  app.get('/api/health', (req: Request, res: Response) => {
    const memory = process.memoryUsage();
    res.json({
      status: 'healthy',
      service: 'Biley Academy ERP Backend',
      version: '1.0.0',
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      lastSavedAt: lastServerSavedAt,
      stateVersion,
      recordsSummary: {
        students: stateCache.students?.length || 0,
        faculty: stateCache.faculty?.length || 0,
        subjects: stateCache.subjects?.length || 0,
        timetableSlots: stateCache.timetable?.length || 0,
        attendanceRecords: stateCache.attendance?.length || 0,
        feeDeposits: stateCache.deposits?.length || 0,
        disbursements: stateCache.disbursements?.length || 0,
        exams: stateCache.exams?.length || 0,
        results: stateCache.results?.length || 0,
        questionBank: stateCache.questionBank?.length || 0,
        assignments: stateCache.assignments?.length || 0,
      },
      memory: {
        rssMB: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMB: Math.round(memory.heapUsed / (1024 * 1024)),
      },
    });
  });

  // 2. Full State Synchronization (GET / POST)
  app.get('/api/sync/state', (req: Request, res: Response) => {
    res.json({
      success: true,
      version: stateVersion,
      lastSavedAt: lastServerSavedAt,
      data: stateCache,
    });
  });

  app.post('/api/sync/state', (req: Request, res: Response) => {
    const incomingData = req.body;
    if (!incomingData || typeof incomingData !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid state payload' });
    }

    stateCache = {
      ...stateCache,
      ...incomingData,
    };
    stateVersion += 1;
    persistStateToDisk();

    res.json({
      success: true,
      message: 'State synchronized and persisted to server storage',
      version: stateVersion,
      savedAt: lastServerSavedAt,
    });
  });

  // 3. Students CRUD
  app.get('/api/students', (req: Request, res: Response) => {
    let list = stateCache.students || [];
    const { classLevel, stream, batch, search } = req.query;

    if (classLevel) {
      list = list.filter((s) => s.classLevel === classLevel);
    }
    if (stream) {
      list = list.filter((s) => s.stream === stream);
    }
    if (batch) {
      list = list.filter((s) => s.batch === batch);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: list.length, data: list });
  });

  app.post('/api/students', (req: Request, res: Response) => {
    const student = req.body;
    if (!student || !student.id || !student.name) {
      return res.status(400).json({ success: false, error: 'Student ID and name are required' });
    }

    const index = (stateCache.students || []).findIndex((s) => s.id === student.id);
    if (index >= 0) {
      stateCache.students[index] = { ...stateCache.students[index], ...student };
    } else {
      stateCache.students = [student, ...(stateCache.students || [])];
    }

    stateVersion += 1;
    persistStateToDisk();
    res.json({ success: true, student, version: stateVersion });
  });

  app.put('/api/students/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const index = (stateCache.students || []).findIndex((s) => s.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: `Student ${id} not found` });
    }

    stateCache.students[index] = { ...stateCache.students[index], ...updates };
    stateVersion += 1;
    persistStateToDisk();
    res.json({ success: true, student: stateCache.students[index] });
  });

  app.delete('/api/students/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    stateCache.students = (stateCache.students || []).filter((s) => s.id !== id);
    stateVersion += 1;
    persistStateToDisk();
    res.json({ success: true, message: `Student ${id} deleted` });
  });

  // 4. Faculty CRUD
  app.get('/api/faculty', (req: Request, res: Response) => {
    res.json({ success: true, count: (stateCache.faculty || []).length, data: stateCache.faculty || [] });
  });

  app.post('/api/faculty', (req: Request, res: Response) => {
    const member = req.body;
    if (!member || !member.id || !member.name) {
      return res.status(400).json({ success: false, error: 'Faculty ID and name required' });
    }

    const index = (stateCache.faculty || []).findIndex((f) => f.id === member.id);
    if (index >= 0) {
      stateCache.faculty[index] = { ...stateCache.faculty[index], ...member };
    } else {
      stateCache.faculty = [...(stateCache.faculty || []), member];
    }

    stateVersion += 1;
    persistStateToDisk();
    res.json({ success: true, faculty: member });
  });

  // 5. Timetable Schedule Endpoints
  app.get('/api/timetable', (req: Request, res: Response) => {
    let slots = stateCache.timetable || [];
    const { classLevel, day, facultyId } = req.query;

    if (classLevel) slots = slots.filter((s) => s.classLevel === classLevel);
    if (day) slots = slots.filter((s) => s.day === day);
    if (facultyId) slots = slots.filter((s) => s.facultyId === facultyId);

    res.json({ success: true, count: slots.length, data: slots });
  });

  app.post('/api/timetable', (req: Request, res: Response) => {
    const slot = req.body;
    if (!slot || !slot.id) {
      return res.status(400).json({ success: false, error: 'Timetable slot ID required' });
    }

    const index = (stateCache.timetable || []).findIndex((s) => s.id === slot.id);
    if (index >= 0) {
      stateCache.timetable[index] = { ...stateCache.timetable[index], ...slot };
    } else {
      stateCache.timetable = [...(stateCache.timetable || []), slot];
    }

    stateVersion += 1;
    persistStateToDisk();
    res.json({ success: true, slot });
  });

  // 6. Attendance Endpoints
  app.get('/api/attendance', (req: Request, res: Response) => {
    let records = stateCache.attendance || [];
    const { classLevel, date, studentId } = req.query;

    if (classLevel) records = records.filter((r) => r.classLevel === classLevel);
    if (date) records = records.filter((r) => r.date === date);
    if (studentId) records = records.filter((r) => r.studentId === studentId);

    res.json({ success: true, count: records.length, data: records });
  });

  app.post('/api/attendance', (req: Request, res: Response) => {
    const records = Array.isArray(req.body) ? req.body : [req.body];
    const existing = stateCache.attendance || [];

    records.forEach((rec) => {
      const idx = existing.findIndex((e) => e.id === rec.id);
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...rec };
      } else {
        existing.push(rec);
      }
    });

    stateCache.attendance = existing;
    stateVersion += 1;
    persistStateToDisk();
    res.json({ success: true, count: records.length });
  });

  // 7. Fee Deposits & Disbursements
  app.get('/api/fees/deposits', (req: Request, res: Response) => {
    let list = stateCache.deposits || [];
    const { studentId } = req.query;
    if (studentId) list = list.filter((d) => d.studentId === studentId);
    res.json({ success: true, count: list.length, data: list });
  });

  app.post('/api/fees/deposits', (req: Request, res: Response) => {
    const deposit = req.body;
    if (!deposit || !deposit.id) {
      return res.status(400).json({ success: false, error: 'Deposit record ID required' });
    }

    stateCache.deposits = [deposit, ...(stateCache.deposits || [])];
    stateVersion += 1;
    persistStateToDisk();
    res.json({ success: true, deposit });
  });

  app.get('/api/disbursements', (req: Request, res: Response) => {
    res.json({ success: true, count: (stateCache.disbursements || []).length, data: stateCache.disbursements || [] });
  });

  app.post('/api/disbursements', (req: Request, res: Response) => {
    const item = req.body;
    if (!item || !item.id) {
      return res.status(400).json({ success: false, error: 'Disbursement ID required' });
    }

    stateCache.disbursements = [item, ...(stateCache.disbursements || [])];
    stateVersion += 1;
    persistStateToDisk();
    res.json({ success: true, disbursement: item });
  });

  // 8. Exams and Results
  app.get('/api/exams', (req: Request, res: Response) => {
    res.json({ success: true, count: (stateCache.exams || []).length, data: stateCache.exams || [] });
  });

  app.get('/api/results', (req: Request, res: Response) => {
    let list = stateCache.results || [];
    const { studentId, examId } = req.query;
    if (studentId) list = list.filter((r) => r.studentId === studentId);
    if (examId) list = list.filter((r) => r.examId === examId);
    res.json({ success: true, count: list.length, data: list });
  });

  // 9. Full Snapshot Backup and Restore
  app.get('/api/backup', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="biley_academy_backup_${new Date().toISOString().slice(0, 10)}.json"`);
    res.send(JSON.stringify(stateCache, null, 2));
  });

  app.post('/api/restore', (req: Request, res: Response) => {
    const restored = req.body;
    if (!restored || !Array.isArray(restored.students)) {
      return res.status(400).json({ success: false, error: 'Invalid backup file structure' });
    }

    stateCache = restored;
    stateVersion += 1;
    persistStateToDisk();
    res.json({ success: true, message: 'Database restored successfully', version: stateVersion });
  });

  app.post('/api/reset', (req: Request, res: Response) => {
    stateCache = loadInitialState();
    stateVersion += 1;
    persistStateToDisk();
    res.json({ success: true, message: 'Database reset to initial institutional seed' });
  });

  // ==========================================
  // VITE / STATIC CLIENT MOUNT
  // ==========================================
  if (process.env.NODE_ENV === 'production' || process.env.VITE_PROD === 'true') {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      console.warn('[Server] Production dist directory not found, falling back to Vite middleware');
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }
  } else {
    // In development mode, mount Vite as Express middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Biley Academy Full-Stack Server running at http://0.0.0.0:${PORT}`);
    console.log(`📦 REST API available at http://0.0.0.0:${PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting Biley Academy server:', err);
  process.exit(1);
});
