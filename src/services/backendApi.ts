import { AppStateData } from '../utils/storage';
import { Student, Faculty, TimetableSlot, AttendanceRecord, FeeDeposit, PaymentDisbursement } from '../types';

export interface BackendHealthResponse {
  status: 'healthy' | 'degraded' | 'offline';
  service: string;
  version: string;
  nodeVersion: string;
  uptimeSeconds: number;
  timestamp: string;
  lastSavedAt: string;
  stateVersion: number;
  recordsSummary: {
    students: number;
    faculty: number;
    subjects: number;
    timetableSlots: number;
    attendanceRecords: number;
    feeDeposits: number;
    disbursements: number;
    exams: number;
    results: number;
    questionBank: number;
    assignments: number;
  };
  memory: {
    rssMB: number;
    heapUsedMB: number;
  };
}

class BackendApiService {
  private baseUrl = '';

  /**
   * Health check for Express backend
   */
  async getHealth(): Promise<BackendHealthResponse | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Pull entire persistent dataset from backend
   */
  async fetchState(): Promise<{ success: boolean; data?: AppStateData; version?: number; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/sync/state`);
      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}` };
      }
      const json = await res.json();
      return { success: true, data: json.data, version: json.version };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  }

  /**
   * Push state to backend server
   */
  async pushState(data: AppStateData): Promise<{ success: boolean; version?: number; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/sync/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}` };
      }
      const json = await res.json();
      return { success: true, version: json.version };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  }

  /**
   * Download database backup as JSON
   */
  async downloadBackup(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/backup`);
      if (!res.ok) return false;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `biley_academy_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('Backup download error:', err);
      return false;
    }
  }

  /**
   * Restore database from JSON
   */
  async restoreBackup(data: AppStateData): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}` };
      }
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Restore error' };
    }
  }

  /**
   * Reset server database to initial seed
   */
  async resetToSeed(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/reset`, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const backendApi = new BackendApiService();
