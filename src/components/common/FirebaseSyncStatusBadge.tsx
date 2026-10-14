import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { firebaseSyncService } from '../../services/firestoreSync';
import { BackendSyncModal } from './BackendSyncModal';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Database,
  Server,
  Settings,
} from 'lucide-react';

interface FirebaseSyncStatusBadgeProps {
  onRefreshData?: () => void;
}

export const FirebaseSyncStatusBadge: React.FC<FirebaseSyncStatusBadgeProps> = ({
  onRefreshData,
}) => {
  const { syncStatus } = useAuth();
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const isSyncing = syncStatus.isSyncing;
  const isConnected = syncStatus.isConnected;

  return (
    <>
      <div className="relative inline-flex items-center">
        <button
          onClick={() => setIsConsoleOpen(true)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          title="Open Full-Stack Backend & Database Console"
          id="firebase-sync-status-badge"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
            isConnected
              ? 'bg-slate-800/90 text-emerald-300 border-emerald-500/30 hover:bg-slate-800'
              : 'bg-rose-950/80 text-rose-300 border-rose-500/30 hover:bg-rose-900/90'
          }`}
        >
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          ) : isConnected ? (
            <Server className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <CloudOff className="w-3.5 h-3.5 text-rose-400" />
          )}

          <span className="hidden lg:inline">
            {isSyncing
              ? 'Syncing...'
              : isConnected
              ? 'Backend Live'
              : 'DB Offline'}
          </span>

          {/* Live Pulse Dot */}
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSyncing
                ? 'bg-amber-400 animate-ping'
                : isConnected
                ? 'bg-emerald-400'
                : 'bg-rose-400'
            }`}
          />
        </button>

        {/* Hover Info Tooltip */}
        {showTooltip && !isConsoleOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700 text-xs z-50 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">Full-Stack Backend Active</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                Port 3000
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <span>API Architecture:</span>
                <span className="font-mono text-amber-300">Node.js + Express</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Database Sync:</span>
                <span className={`font-bold ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isConnected ? 'Firestore Cloud Live' : 'Local Fallback'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Synced:</span>
                <span className="text-slate-300 font-medium">
                  {syncStatus.lastSyncedAt
                    ? syncStatus.lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : 'Real-time'}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-amber-400 mt-2.5 pt-2 border-t border-slate-800 font-medium">
              Click badge to open REST API Console & Diagnostics.
            </p>
          </div>
        )}
      </div>

      {/* Backend Console Modal */}
      <BackendSyncModal
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        onRefreshData={onRefreshData}
      />
    </>
  );
};
