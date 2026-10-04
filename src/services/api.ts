import {
  Employee,
  User,
  AuditLog,
  OrganizationSettings,
  DashboardStats,
  EmployeeDocument,
  PayrollRecord,
  FinanceSummary
} from '../types';
import { firestoreSync } from './firebase';

// State holder for active user
let currentUser: User = {
  id: 'usr-1',
  name: 'WIDI',
  username: 'admin.hrd',
  email: 'admin.hrd@yas.co.id',
  role: 'SUPER_ADMIN',
  status: 'AKTIF',
  created_at: '2024-01-01T08:00:00Z',
};

export const getStoredUser = (): User => {
  const saved = localStorage.getItem('yas_current_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return currentUser;
};

export const setStoredUser = (user: User | null) => {
  if (user) {
    currentUser = user;
    localStorage.setItem('yas_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('yas_current_user');
  }
};

const getHeaders = () => {
  const user = getStoredUser();
  return {
    'Content-Type': 'application/json',
    'x-user-id': user.id,
    'x-user-name': user.name,
    'x-user-role': user.role,
  };
};

export const api = {
  // Auth
  login: async (username: string, password?: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  getCurrentUser: async () => {
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    return res.json();
  },

  // Dashboard
  getDashboardStats: async (): Promise<{ success: boolean; stats: DashboardStats }> => {
    const res = await fetch('/api/dashboard/stats', { headers: getHeaders() });
    return res.json();
  },

  // Employees
  getEmployees: async (params: {
    q?: string;
    status?: string;
    department?: string;
    position?: string;
    gender?: string;
    employment_status?: string;
    contract_alert?: number;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_dir?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.status) query.set('status', params.status);
    if (params.department) query.set('department', params.department);
    if (params.position) query.set('position', params.position);
    if (params.gender) query.set('gender', params.gender);
    if (params.employment_status) query.set('employment_status', params.employment_status);
    if (params.contract_alert) query.set('contract_alert', String(params.contract_alert));
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.sort_dir) query.set('sort_dir', params.sort_dir);

    const res = await fetch(`/api/employees?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  getEmployeeById: async (id: string): Promise<{ success: boolean; data: Employee }> => {
    const res = await fetch(`/api/employees/${id}`, { headers: getHeaders() });
    return res.json();
  },

  createEmployee: async (data: Partial<Employee>) => {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success && result.data) {
      try {
        await firestoreSync.saveEmployee(result.data);
      } catch (e) {
        console.warn('Firestore cloud sync notice:', e);
      }
    }
    return result;
  },

  updateEmployee: async (id: string, data: Partial<Employee>) => {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success && result.data) {
      try {
        await firestoreSync.saveEmployee(result.data);
      } catch (e) {
        console.warn('Firestore cloud sync notice:', e);
      }
    }
    return result;
  },

  deactivateEmployee: async (id: string, payload: { deactivation_date: string; deactivation_reason: string; deactivation_note?: string }) => {
    const res = await fetch(`/api/employees/${id}/deactivate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success && result.data) {
      try {
        await firestoreSync.saveEmployee(result.data);
      } catch (e) {
        console.warn('Firestore cloud sync notice:', e);
      }
    }
    return result;
  },

  activateEmployee: async (id: string, payload: { activation_date: string; position?: string; department?: string; note?: string }) => {
    const res = await fetch(`/api/employees/${id}/activate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success && result.data) {
      try {
        await firestoreSync.saveEmployee(result.data);
      } catch (e) {
        console.warn('Firestore cloud sync notice:', e);
      }
    }
    return result;
  },

  deleteEmployeePermanent: async (id: string) => {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (result.success) {
      try {
        await firestoreSync.deleteEmployee(id);
      } catch (e) {
        console.warn('Firestore cloud sync notice:', e);
      }
    }
    return result;
  },

  batchDeleteEmployees: async (ids: string[]) => {
    const res = await fetch('/api/employees/batch-delete', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ids }),
    });
    const result = await res.json();
    if (result.success) {
      ids.forEach((id) => firestoreSync.deleteEmployee(id).catch(console.warn));
    }
    return result;
  },

  batchImportEmployees: async (items: any[]) => {
    const res = await fetch('/api/employees/batch-import', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ items }),
    });
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      result.data.forEach((emp: Employee) => firestoreSync.saveEmployee(emp).catch(console.warn));
    }
    return result;
  },

  // Documents
  uploadDocument: async (employeeId: string, docData: Partial<EmployeeDocument>) => {
    const res = await fetch(`/api/employees/${employeeId}/documents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(docData),
    });
    return res.json();
  },

  updateDocument: async (employeeId: string, documentId: string, data: Partial<EmployeeDocument>) => {
    const res = await fetch(`/api/employees/${employeeId}/documents/${documentId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteDocument: async (employeeId: string, documentId: string) => {
    const res = await fetch(`/api/employees/${employeeId}/documents/${documentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  batchDeleteDocuments: async (items: Array<{ employee_id: string; document_id: string }>) => {
    const res = await fetch('/api/documents/bulk-delete', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ items }),
    });
    return res.json();
  },

  clearAllDocuments: async () => {
    const res = await fetch('/api/documents/clear-all', {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  updateEmployeeContract: async (id: string, data: { contract_type?: string; contract_number?: string; contract_start?: string; contract_end?: string }) => {
    const res = await fetch(`/api/employees/${id}/contract`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteEmployeeContract: async (id: string) => {
    const res = await fetch(`/api/employees/${id}/contract`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Users
  getUsers: async (): Promise<{ success: boolean; data: User[] }> => {
    const res = await fetch('/api/users', { headers: getHeaders() });
    return res.json();
  },

  createUser: async (userData: Partial<User> & { password?: string }) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const result = await res.json();
    if (result.success && result.data) {
      firestoreSync.saveUser(result.data).catch(console.warn);
    }
    return result;
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const result = await res.json();
    if (result.success && result.data) {
      firestoreSync.saveUser(result.data).catch(console.warn);
    }
    return result;
  },

  deleteUser: async (id: string) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (result.success) {
      firestoreSync.deleteUser(id).catch(console.warn);
    }
    return result;
  },

  // Audit Logs
  getAuditLogs: async (params?: { module?: string; action?: string; q?: string }): Promise<{ success: boolean; data: AuditLog[] }> => {
    const query = new URLSearchParams();
    if (params?.module) query.set('module', params.module);
    if (params?.action) query.set('action', params.action);
    if (params?.q) query.set('q', params.q);

    const res = await fetch(`/api/audit-logs?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  // Settings
  getSettings: async (): Promise<{ success: boolean; data: OrganizationSettings }> => {
    const res = await fetch('/api/settings', { headers: getHeaders() });
    return res.json();
  },

  updateSettings: async (settings: Partial<OrganizationSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    const result = await res.json();
    if (result.success && result.data) {
      firestoreSync.saveSettings(result.data).catch(console.warn);
    }
    return result;
  },

  // Sync Cloud Data to Local Backend
  syncCloudToLocal: async (data: { employees?: Employee[]; settings?: Partial<OrganizationSettings>; users?: User[]; payroll?: PayrollRecord[] }) => {
    const res = await fetch('/api/database/sync-cloud', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Backup & Restore
  getBackupData: async () => {
    const res = await fetch('/api/backup', { headers: getHeaders() });
    return res.json();
  },

  restoreDatabase: async (backupData: any) => {
    const res = await fetch('/api/restore', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ backupData }),
    });
    return res.json();
  },

  // Public Verification
  verifyEmployeePublic: async (id: string) => {
    const res = await fetch(`/api/public/verify-employee/${id}`);
    return res.json();
  },

  // Finance & Payroll
  getPayrolls: async (params?: {
    month?: string;
    year?: number;
    department?: string;
    q?: string;
  }): Promise<{ success: boolean; data: PayrollRecord[]; summary?: FinanceSummary }> => {
    const query = new URLSearchParams();
    if (params?.month) query.set('month', params.month);
    if (params?.year) query.set('year', String(params.year));
    if (params?.department) query.set('department', params.department);
    if (params?.q) query.set('q', params.q);

    const res = await fetch(`/api/finance/payroll?${query.toString()}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  updatePayroll: async (id: string, data: Partial<PayrollRecord>) => {
    const res = await fetch(`/api/finance/payroll/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success && result.data) {
      firestoreSync.savePayroll(result.data).catch(console.warn);
    }
    return result;
  },

  bulkGeneratePayroll: async (month: string, year: number) => {
    const res = await fetch('/api/finance/payroll/bulk-generate', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ month, year }),
    });
    return res.json();
  },

  getFinanceSummary: async (params?: { month?: string; year?: number }): Promise<{ success: boolean; summary: FinanceSummary }> => {
    const query = new URLSearchParams();
    if (params?.month) query.set('month', params.month);
    if (params?.year) query.set('year', String(params.year));

    const res = await fetch(`/api/finance/summary?${query.toString()}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  deletePayroll: async (id: string) => {
    const res = await fetch(`/api/finance/payroll/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (result.success) {
      firestoreSync.deletePayroll(id).catch(console.warn);
    }
    return result;
  },

  clearPayroll: async (params?: { month?: string; year?: number; resetToDefault?: boolean }) => {
    const res = await fetch('/api/finance/payroll/clear', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params || {}),
    });
    return res.json();
  },

  updateAuditLog: async (id: string, data: { description?: string; action?: string }) => {
    const res = await fetch(`/api/audit-logs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteAuditLog: async (id: string) => {
    const res = await fetch(`/api/audit-logs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  clearAuditLogs: async () => {
    const res = await fetch('/api/audit-logs/clear', {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  resetUsers: async () => {
    const res = await fetch('/api/users/reset', {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  resetSettings: async () => {
    const res = await fetch('/api/settings/reset', {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  resetEmployees: async (mode: 'empty' | 'sample' = 'sample') => {
    const res = await fetch('/api/employees/reset-all', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ mode }),
    });
    return res.json();
  },

  factoryResetDatabase: async () => {
    const res = await fetch('/api/database/factory-reset', {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },
};
