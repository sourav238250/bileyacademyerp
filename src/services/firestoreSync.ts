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
import {
  Student,
  Faculty,
  Subject,
  Exam,
  ExamResult,
  FeeDeposit,
  PaymentDisbursement,
  TimetableSlot,
  AttendanceRecord,
  QuestionBankItem,
  AssignmentSet,
  InstitutionalAuthorizationConfig,
} from '../types';

// Root document collection for the single institutional workspace
const INSTITUTION_COLLECTION = 'biley_academy_erp';
const ROOT_DOC_ID = 'institutional_state_v1';

export type SyncCallback = (data: AppStateData, source: 'cloud' | 'local') => void;
export type SyncStatusCallback = (status: {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
}) => void;

class FirebaseSyncService {
  private unsubscribeFirestore: (() => void) | null = null;
  private isWritingToCloud = false;
  private lastCloudSyncTime: Date | null = null;
  private isConnected = false;
  private statusListeners: Set<SyncStatusCallback> = new Set();

  public subscribeToStatus(listener: SyncStatusCallback): () => void {
    this.statusListeners.add(listener);
    // Send immediate current status
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
      listener({
        isConnected: this.isConnected,
        isSyncing: this.isWritingToCloud,
        lastSyncedAt: this.lastCloudSyncTime,
        error,
      });
    }
  }

  /**
   * Initializes real-time bidirectional sync with Firestore.
   * If Firestore is empty, it seeds the initial mock dataset.
   */
  public initRealtimeSync(onDataReceived: SyncCallback): () => void {
    try {
      const docRef = doc(db, INSTITUTION_COLLECTION, ROOT_DOC_ID);

      this.unsubscribeFirestore = onSnapshot(
        docRef,
        (snapshot) => {
          this.isConnected = true;
          if (snapshot.exists()) {
            const remoteData = snapshot.data() as Partial<AppStateData>;

            // Parse and merge data safely
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

            this.lastCloudSyncTime = new Date();
            this.notifyStatus(null);

            // Update local storage copy as offline fallback
            saveToStorage(merged);

            // Notify application listeners only if not triggered by our own write
            if (!this.isWritingToCloud) {
              onDataReceived(merged, 'cloud');
            }
          } else {
            // First time connection: seed local storage state to cloud
            const initialLocalState = loadInitialState();
            this.pushStateToCloud(initialLocalState).catch((err) => {
              console.warn('Initial cloud seed attempt:', err);
            });
            onDataReceived(initialLocalState, 'local');
          }
        },
        (error) => {
          console.error('Firestore real-time sync error:', error);
          this.isConnected = false;
          this.notifyStatus(error.message);
          // Fallback to local storage state
          const localState = loadInitialState();
          onDataReceived(localState, 'local');
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
   * Pushes full or updated state data to Firestore backend document.
   */
  public async pushStateToCloud(data: AppStateData): Promise<void> {
    this.isWritingToCloud = true;
    this.notifyStatus(null);

    try {
      const docRef = doc(db, INSTITUTION_COLLECTION, ROOT_DOC_ID);
      
      // Sanitize payload (ensure no undefined properties)
      const sanitized: AppStateData = {
        students: JSON.parse(JSON.stringify(data.students || [])),
        faculty: JSON.parse(JSON.stringify(data.faculty || [])),
        subjects: JSON.parse(JSON.stringify(data.subjects || [])),
        exams: JSON.parse(JSON.stringify(data.exams || [])),
        results: JSON.parse(JSON.stringify(data.results || [])),
        deposits: JSON.parse(JSON.stringify(data.deposits || [])),
        disbursements: JSON.parse(JSON.stringify(data.disbursements || [])),
        timetable: JSON.parse(JSON.stringify(data.timetable || [])),
        attendance: JSON.parse(JSON.stringify(data.attendance || [])),
        questionBank: JSON.parse(JSON.stringify(data.questionBank || [])),
        assignments: JSON.parse(JSON.stringify(data.assignments || [])),
        authConfig: JSON.parse(JSON.stringify(data.authConfig || DEFAULT_AUTHORIZATION_CONFIG)),
      };

      await setDoc(docRef, {
        ...sanitized,
        updatedAt: new Date().toISOString(),
        institutionName: 'Biley Academy',
      }, { merge: true });

      this.lastCloudSyncTime = new Date();
      this.isConnected = true;
      this.notifyStatus(null);
    } catch (err: any) {
      console.error('Error saving state to Firestore backend:', err);
      this.notifyStatus(err?.message || 'Failed to save to cloud');
      throw err;
    } finally {
      // Delay releasing write lock slightly to ignore immediate local snapshot echo
      setTimeout(() => {
        this.isWritingToCloud = false;
      }, 500);
    }
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
