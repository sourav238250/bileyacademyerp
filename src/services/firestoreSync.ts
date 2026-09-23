import {
  db,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from './firebase';
import {
  AppStateData,
  DEFAULT_AUTHORIZATION_CONFIG,
  loadInitialState,
  saveToStorage,
} from '../utils/storage';

// Root document collection for the institutional workspace
const INSTITUTION_COLLECTION = 'biley_academy_erp';
const ROOT_DOC_ID = 'institutional_state_v1';

export type SyncCallback = (data: AppStateData, source: 'cloud' | 'local') => void;
export type SyncStatusCallback = (status: {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
}) => void;

function createDataHash(data: AppStateData): string {
  try {
    return JSON.stringify({
      students: data.students || [],
      faculty: data.faculty || [],
      subjects: data.subjects || [],
      exams: data.exams || [],
      results: data.results || [],
      deposits: data.deposits || [],
      disbursements: data.disbursements || [],
      timetable: data.timetable || [],
      attendance: data.attendance || [],
      questionBank: data.questionBank || [],
      assignments: data.assignments || [],
      authConfig: data.authConfig || DEFAULT_AUTHORIZATION_CONFIG,
    });
  } catch {
    return '';
  }
}

class FirebaseSyncService {
  private unsubscribeFirestore: (() => void) | null = null;
  private isWritingToCloud = false;
  private pendingWriteData: AppStateData | null = null;
  private lastSyncedHash = '';
  private lastCloudSyncTime: Date | null = null;
  private isConnected = false;
  private writeTimer: any = null;
  private statusListeners: Set<SyncStatusCallback> = new Set();
  public isRemoteUpdateUnderway = false;

  public subscribeToStatus(listener: SyncStatusCallback): () => void {
    this.statusListeners.add(listener);
    listener({
      isConnected: this.isConnected,
      isSyncing: this.isWritingToCloud,
      lastSyncedAt: this.lastCloudSyncTime,
      error: null,
    });
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyStatus(error: string | null = null) {
    for (const listener of this.statusListeners) {
      try {
        listener({
          isConnected: this.isConnected,
          isSyncing: this.isWritingToCloud,
          lastSyncedAt: this.lastCloudSyncTime,
          error,
        });
      } catch (e) {
        console.error('Status listener error:', e);
      }
    }
  }

  /**
   * Initializes real-time listener with Firestore.
   */
  public initRealtimeSync(onDataReceived: SyncCallback): () => void {
    try {
      const docRef = doc(db, INSTITUTION_COLLECTION, ROOT_DOC_ID);

      this.unsubscribeFirestore = onSnapshot(
        docRef,
        { includeMetadataChanges: true },
        (snapshot) => {
          this.isConnected = true;

          // If snapshot is from local cache write (hasPendingWrites), do not echo back
          if (snapshot.metadata.hasPendingWrites) {
            return;
          }

          if (snapshot.exists()) {
            const remoteData = snapshot.data() as Partial<AppStateData>;

            const merged: AppStateData = {
              students: remoteData.students || [],
              faculty: remoteData.faculty || [],
              subjects: remoteData.subjects || [],
              exams: remoteData.exams || [],
              results: remoteData.results || [],
              deposits: remoteData.deposits || [],
              disbursements: remoteData.disbursements || [],
              timetable: remoteData.timetable || [],
              attendance: remoteData.attendance || [],
              questionBank: remoteData.questionBank || [],
              assignments: remoteData.assignments || [],
              authConfig: remoteData.authConfig || DEFAULT_AUTHORIZATION_CONFIG,
            };

            const incomingHash = createDataHash(merged);

            // Skip if identical to what was already synced
            if (incomingHash && incomingHash === this.lastSyncedHash) {
              return;
            }

            this.lastSyncedHash = incomingHash;
            this.lastCloudSyncTime = new Date();
            this.notifyStatus(null);

            // Save locally for offline support
            saveToStorage(merged);

            // Flag remote update to prevent App.tsx from immediately re-pushing
            this.isRemoteUpdateUnderway = true;
            onDataReceived(merged, 'cloud');
            setTimeout(() => {
              this.isRemoteUpdateUnderway = false;
            }, 300);
          } else {
            // First-time database bootstrap
            const initialLocalState = loadInitialState();
            this.lastSyncedHash = createDataHash(initialLocalState);
            this.scheduleCloudPush(initialLocalState);
            onDataReceived(initialLocalState, 'local');
          }
        },
        (error) => {
          // Firestore operates in offline mode when unavailable
          this.isConnected = false;
          const isUnavailable =
            error?.code === 'unavailable' ||
            error?.message?.includes('offline') ||
            error?.message?.includes('backend');
          
          if (!isUnavailable) {
            console.warn('Firestore real-time sync notification:', error);
          }
          this.notifyStatus(isUnavailable ? 'Working in offline mode (auto-syncing when online)' : error.message);
        }
      );

      return () => {
        if (this.unsubscribeFirestore) {
          this.unsubscribeFirestore();
          this.unsubscribeFirestore = null;
        }
      };
    } catch (err: any) {
      console.error('Failed to initialize Firestore real-time listener:', err);
      this.isConnected = false;
      this.notifyStatus(err?.message || 'Connection failed');
      return () => {};
    }
  }

  /**
   * Schedules a debounced, rate-limited push to Firestore to eliminate write exhaustion.
   */
  public scheduleCloudPush(data: AppStateData): void {
    // If an update was just triggered from remote cloud snapshot, skip pushing it back!
    if (this.isRemoteUpdateUnderway) {
      return;
    }

    const currentHash = createDataHash(data);
    if (!currentHash || currentHash === this.lastSyncedHash) {
      // Nothing changed, don't write
      return;
    }

    this.pendingWriteData = data;

    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
    }

    this.writeTimer = setTimeout(() => {
      this.flushPendingWrite();
    }, 1000);
  }

  private async flushPendingWrite(): Promise<void> {
    if (this.isWritingToCloud || !this.pendingWriteData) {
      return;
    }

    const dataToSave = this.pendingWriteData;
    this.pendingWriteData = null;

    const dataHash = createDataHash(dataToSave);
    if (dataHash === this.lastSyncedHash) {
      return;
    }

    this.isWritingToCloud = true;
    this.notifyStatus(null);

    try {
      const docRef = doc(db, INSTITUTION_COLLECTION, ROOT_DOC_ID);
      const sanitized: AppStateData = {
        students: JSON.parse(JSON.stringify(dataToSave.students || [])),
        faculty: JSON.parse(JSON.stringify(dataToSave.faculty || [])),
        subjects: JSON.parse(JSON.stringify(dataToSave.subjects || [])),
        exams: JSON.parse(JSON.stringify(dataToSave.exams || [])),
        results: JSON.parse(JSON.stringify(dataToSave.results || [])),
        deposits: JSON.parse(JSON.stringify(dataToSave.deposits || [])),
        disbursements: JSON.parse(JSON.stringify(dataToSave.disbursements || [])),
        timetable: JSON.parse(JSON.stringify(dataToSave.timetable || [])),
        attendance: JSON.parse(JSON.stringify(dataToSave.attendance || [])),
        questionBank: JSON.parse(JSON.stringify(dataToSave.questionBank || [])),
        assignments: JSON.parse(JSON.stringify(dataToSave.assignments || [])),
        authConfig: JSON.parse(JSON.stringify(dataToSave.authConfig || DEFAULT_AUTHORIZATION_CONFIG)),
      };

      await setDoc(
        docRef,
        {
          ...sanitized,
          updatedAt: new Date().toISOString(),
          institutionName: 'Biley Academy',
        },
        { merge: true }
      );

      this.lastSyncedHash = dataHash;
      this.lastCloudSyncTime = new Date();
      this.isConnected = true;
      this.notifyStatus(null);
    } catch (err: any) {
      console.warn('Firestore write warning:', err);
      this.notifyStatus(err?.message || 'Cloud write delayed');
    } finally {
      this.isWritingToCloud = false;
      this.notifyStatus(null);

      // If more mutations accumulated while this write was in flight, schedule next write
      if (this.pendingWriteData) {
        setTimeout(() => this.flushPendingWrite(), 800);
      }
    }
  }

  /**
   * Direct push wrapper
   */
  public async pushStateToCloud(data: AppStateData): Promise<void> {
    this.scheduleCloudPush(data);
  }

  /**
   * Force manual pull from cloud database
   */
  public async pullStateFromCloud(): Promise<AppStateData | null> {
    try {
      const docRef = doc(db, INSTITUTION_COLLECTION, ROOT_DOC_ID);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const remoteData = snapshot.data() as Partial<AppStateData>;
        const merged: AppStateData = {
          students: remoteData.students || [],
          faculty: remoteData.faculty || [],
          subjects: remoteData.subjects || [],
          exams: remoteData.exams || [],
          results: remoteData.results || [],
          deposits: remoteData.deposits || [],
          disbursements: remoteData.disbursements || [],
          timetable: remoteData.timetable || [],
          attendance: remoteData.attendance || [],
          questionBank: remoteData.questionBank || [],
          assignments: remoteData.assignments || [],
          authConfig: remoteData.authConfig || DEFAULT_AUTHORIZATION_CONFIG,
        };
        this.lastSyncedHash = createDataHash(merged);
        this.lastCloudSyncTime = new Date();
        this.isConnected = true;
        this.notifyStatus(null);
        return merged;
      }
      return null;
    } catch (err: any) {
      console.error('Failed to pull from Firestore:', err);
      this.notifyStatus(err?.message || 'Manual pull failed');
      return null;
    }
  }
}

export const firebaseSyncService = new FirebaseSyncService();
