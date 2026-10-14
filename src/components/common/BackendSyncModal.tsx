import React, { useState, useEffect } from 'react';
import { backendApi, BackendHealthResponse } from '../../services/backendApi';
import { firebaseSyncService } from '../../services/firestoreSync';
import { useAuth } from '../../services/AuthContext';
import {
  Server,
  Database,
  Cloud,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Activity,
  Cpu,
  Clock,
  Layers,
  Code2,
  X,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

interface BackendSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const BackendSyncModal: React.FC<BackendSyncModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const { syncStatus } = useAuth();
  const [healthData, setHealthData] = useState<BackendHealthResponse | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/health');
  const [endpointResponse, setEndpointResponse] = useState<string | null>(null);
  const [isLoadingEndpoint, setIsLoadingEndpoint] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    const start = performance.now();
    try {
      const data = await backendApi.getHealth();
      const end = performance.now();
      setLatencyMs(Math.round(end - start));
      setHealthData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestEndpoint = async () => {
    setIsLoadingEndpoint(true);
    try {
      const res = await fetch(selectedEndpoint);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setEndpointResponse(JSON.stringify(json, null, 2));
      } catch {
        setEndpointResponse(text);
      }
    } catch (err: any) {
      setEndpointResponse(`Error fetching endpoint: ${err.message}`);
    } finally {
      setIsLoadingEndpoint(false);
    }
  };

  const handleManualSync = async () => {
    setActionNotice('Synchronizing data with Cloud Firestore and Express backend...');
    try {
      await firebaseSyncService.pullStateFromCloud();
      await fetchHealth();
      if (onRefreshData) onRefreshData();
      setActionNotice('Successfully synchronized state across all backend tiers!');
    } catch (err: any) {
      setActionNotice(`Sync error: ${err.message}`);
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleExportBackup = async () => {
    setActionNotice('Preparing JSON database snapshot download...');
    const ok = await backendApi.downloadBackup();
    if (ok) {
      setActionNotice('Database backup downloaded successfully!');
    } else {
      setActionNotice('Failed to download backup from backend.');
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const json = JSON.parse(text);
        setActionNotice('Restoring database snapshot to backend server...');
        const res = await backendApi.restoreBackup(json);
        if (res.success) {
          setActionNotice('Database restored! Reloading application data...');
          if (onRefreshData) onRefreshData();
          await fetchHealth();
        } else {
          setActionNotice(`Restore failed: ${res.error}`);
        }
      } catch (err: any) {
        setActionNotice(`Invalid backup file: ${err.message}`);
      }
      setTimeout(() => setActionNotice(null), 5000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Full-Stack Backend System Console</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Node.js + Express + Firestore
                </span>
              </div>
              <p className="text-xs text-slate-400">REST API Server & Real-Time Cloud Database Integration</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          
          {actionNotice && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl flex items-center gap-2 animate-in fade-in">
              <Activity className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{actionNotice}</span>
            </div>
          )}

          {/* Tier Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Express Backend Server */}
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-slate-200">Express REST API</span>
                  </div>
                  {healthData ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400">
                      <XCircle className="w-3.5 h-3.5" /> Offline
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Running on Port 3000 (`server.ts`). Serves `/api/*` endpoints and SPA bundle.
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Latency:</span>
                <span className="font-mono text-amber-300 font-bold">{latencyMs !== null ? `${latencyMs}ms` : '--'}</span>
              </div>
            </div>

            {/* Cloud Firestore */}
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-200">Cloud Firestore</span>
                  </div>
                  {syncStatus.isConnected ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400">
                      <XCircle className="w-3.5 h-3.5" /> Disconnected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Real-time multi-device database sync with automated snapshot listening.
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Security Rules:</span>
                <span className="text-emerald-300 font-bold">Deployed</span>
              </div>
            </div>

            {/* Local Disk Storage */}
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-slate-200">Disk Store & Cache</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Persistent JSON storage at `./data/biley_academy_db.json` with browser cache fallback.
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Version:</span>
                <span className="font-mono text-blue-300 font-bold">v{healthData?.stateVersion || 1}</span>
              </div>
            </div>

          </div>

          {/* Live Server Stats */}
          {healthData && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-slate-200">Backend Server Diagnostics</span>
                </div>
                <button
                  onClick={fetchHealth}
                  disabled={isLoadingHealth}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingHealth ? 'animate-spin' : ''}`} />
                  <span>Refresh Stats</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Uptime</span>
                  <span className="font-mono font-bold text-amber-400 text-sm mt-0.5 block">
                    {Math.floor(healthData.uptimeSeconds / 60)}m {healthData.uptimeSeconds % 60}s
                  </span>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Node Runtime</span>
                  <span className="font-mono font-bold text-slate-200 text-sm mt-0.5 block">
                    {healthData.nodeVersion}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Memory Heap</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
                    {healthData.memory.heapUsedMB} MB
                  </span>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Students</span>
                  <span className="font-mono font-bold text-blue-400 text-sm mt-0.5 block">
                    {healthData.recordsSummary.students} Enrolled
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive REST API Explorer */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">Interactive REST API Endpoint Tester</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Live HTTP Testing</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono outline-hidden focus:border-amber-400"
              >
                <option value="/api/health">GET /api/health (Diagnostics)</option>
                <option value="/api/sync/state">GET /api/sync/state (Full State Payload)</option>
                <option value="/api/students">GET /api/students (All Student Admissions)</option>
                <option value="/api/faculty">GET /api/faculty (All Teaching Staff)</option>
                <option value="/api/timetable">GET /api/timetable (All Schedule Slots)</option>
                <option value="/api/attendance">GET /api/attendance (Attendance Logs)</option>
                <option value="/api/fees/deposits">GET /api/fees/deposits (Fee Receipts)</option>
                <option value="/api/disbursements">GET /api/disbursements (Institutional Expenses)</option>
                <option value="/api/exams">GET /api/exams (Scheduled Examinations)</option>
                <option value="/api/results">GET /api/results (Academic Results)</option>
              </select>

              <button
                onClick={handleTestEndpoint}
                disabled={isLoadingEndpoint}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEndpoint ? 'animate-spin' : ''}`} />
                <span>Execute Request</span>
              </button>
            </div>

            {endpointResponse && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Response Output:</span>
                  <button
                    onClick={() => setEndpointResponse(null)}
                    className="text-slate-500 hover:text-slate-300 text-[10px]"
                  >
                    Clear
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-48 custom-scrollbar">
                  {endpointResponse}
                </pre>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <button
              onClick={handleManualSync}
              className="flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Force Synchronize</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download JSON Backup</span>
            </button>

            <label className="flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Restore from Backup</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestoreFile}
              />
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Biley Academy ERP • Multi-Tier Backend (Express & Firebase)</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
};
