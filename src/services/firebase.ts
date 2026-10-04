import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Employee,
  User,
  OrganizationSettings,
  AuditLog,
  PayrollRecord,
} from '../types';

// 1. Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 2. Error handling per SKILL.md
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Test Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline mode. Please check Firebase connection.');
      return false;
    }
    // Expected if test/connection doesn't exist yet, but server was reached
    return true;
  }
}

// Automatically test connection on boot
testFirestoreConnection();

// 4. Firestore Sync Services
export const firestoreSync = {
  // Login with Google Popup
  loginWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user')) {
        return null;
      }
      console.error('Failed to sign in with Google:', err);
      throw err;
    }
  },

  logout: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  },

  // Save / Sync Employee to Firestore
  saveEmployee: async (emp: Employee) => {
    const path = `employees/${emp.id}`;
    try {
      await setDoc(doc(db, 'employees', emp.id), {
        ...emp,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Delete Employee from Firestore
  deleteEmployee: async (empId: string) => {
    const path = `employees/${empId}`;
    try {
      await deleteDoc(doc(db, 'employees', empId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Batch sync all employees
  syncAllEmployees: async (employees: Employee[]) => {
    for (const emp of employees) {
      await firestoreSync.saveEmployee(emp);
    }
  },

  // Subscribe to Employees in Real-Time
  subscribeEmployees: (onUpdate: (employees: Employee[]) => void) => {
    const colRef = collection(db, 'employees');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Employee[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Employee);
        });
        onUpdate(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'employees');
        } catch {
          // Logged above by handleFirestoreError
        }
      }
    );
  },

  // Save Settings to Firestore
  saveSettings: async (settings: OrganizationSettings) => {
    const path = 'settings/general';
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        ...settings,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Subscribe to Settings in Real-Time
  subscribeSettings: (onUpdate: (settings: OrganizationSettings) => void) => {
    const docRef = doc(db, 'settings', 'general');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as OrganizationSettings);
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, 'settings/general');
        } catch {
          // Logged above
        }
      }
    );
  },

  // Save Audit Log
  saveAuditLog: async (log: AuditLog) => {
    const path = `audit_logs/${log.id}`;
    try {
      await setDoc(doc(db, 'audit_logs', log.id), log);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Subscribe to Audit Logs in Real-Time
  subscribeAuditLogs: (onUpdate: (logs: AuditLog[]) => void) => {
    const colRef = collection(db, 'audit_logs');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: AuditLog[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as AuditLog);
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        onUpdate(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'audit_logs');
        } catch {
          // Logged above
        }
      }
    );
  },

  // Save Payroll Record
  savePayroll: async (record: PayrollRecord) => {
    const path = `payroll/${record.id}`;
    try {
      await setDoc(doc(db, 'payroll', record.id), record);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Delete Payroll Record
  deletePayroll: async (recordId: string) => {
    const path = `payroll/${recordId}`;
    try {
      await deleteDoc(doc(db, 'payroll', recordId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Subscribe to Payroll in Real-Time
  subscribePayroll: (onUpdate: (payrolls: PayrollRecord[]) => void) => {
    const colRef = collection(db, 'payroll');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: PayrollRecord[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as PayrollRecord);
        });
        onUpdate(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'payroll');
        } catch {
          // Logged above
        }
      }
    );
  },

  // Save / Update User
  saveUser: async (user: User) => {
    const path = `users/${user.id}`;
    try {
      await setDoc(doc(db, 'users', user.id), user);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Delete User
  deleteUser: async (userId: string) => {
    const path = `users/${userId}`;
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Subscribe to Users in Real-Time
  subscribeUsers: (onUpdate: (users: User[]) => void) => {
    const colRef = collection(db, 'users');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: User[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as User);
        });
        onUpdate(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'users');
        } catch {
          // Logged above
        }
      }
    );
  },
};
