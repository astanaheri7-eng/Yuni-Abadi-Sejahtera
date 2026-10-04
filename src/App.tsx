import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { EmployeeListView } from './components/EmployeeListView';
import { DocumentsView } from './components/DocumentsView';
import { ReportsView } from './components/ReportsView';
import { ContractAlertsView } from './components/ContractAlertsView';
import { BackupView } from './components/BackupView';
import { AboutView } from './components/AboutView';
import { AuditLogsView } from './components/AuditLogsView';
import { UsersView } from './components/UsersView';
import { SettingsView } from './components/SettingsView';
import { FinanceView } from './components/FinanceView';
import { IdCardView } from './components/IdCardView';
import { LoginScreen } from './components/LoginScreen';
import { AndroidBottomNav } from './components/AndroidBottomNav';

import { EmployeeFormModal } from './components/EmployeeFormModal';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { IdCardModal } from './components/IdCardModal';
import { BiodataPrintModal } from './components/BiodataPrintModal';
import { DeactivateModal } from './components/DeactivateModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ExcelImportModal } from './components/ExcelImportModal';

import {
  Employee,
  User,
  Role,
  DeactivationReason,
  DashboardStats,
  OrganizationSettings,
} from './types';
import { api, setStoredUser } from './services/api';
import { firestoreSync } from './services/firebase';
import { CheckCircle2, AlertCircle, X, Smartphone, Wifi, Battery, Signal } from 'lucide-react';

export default function App() {
  // Current user state (Default to Super Admin for full initial access)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('yas_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: 'usr-1',
      username: 'admin.hrd',
      name: 'WIDI',
      email: 'admin.hrd@yas.co.id',
      role: 'SUPER_ADMIN',
      status: 'AKTIF',
      created_at: '2024-01-01T08:00:00Z',
    };
  });

  // Settings State
  const [settings, setSettings] = useState<OrganizationSettings>(() => {
    const saved = localStorage.getItem('yas_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      company_name: 'PT Yuni Abadi Sejahtera',
      organization_name: 'YUNI ABADI SEJAHTERA',
      app_name: 'YAS HRIS',
      tagline: 'Sistem Bank Data & Manajemen Kepegawaian',
      location: 'Kabupaten Karawang',
      company_address: 'Jl. Raya Klari - Karawang Timur No. 88, Anggadita, Kec. Klari',
      company_phone: '(0267) 845-6789 / 0812-9988-7766',
      company_email: 'hrd@yuniabadisejahtera.co.id',
      regency: 'Kabupaten Karawang',
      province: 'Jawa Barat',
      postal_code: '41371',
      tax_number: '01.234.567.8-408.000',
      director_name: 'H. Yuni Hermanto, S.E.',
      hr_head_name: 'WIDI',
      auto_id_prefix: 'YAS',
      employee_number_format: 'YAS-[YEAR]-[000]',
      logo_url: '/logo-yas.svg',
      login_title: 'Portal Bank Data Kepegawaian',
      login_subtitle: 'Autentikasi resmi sistem SDM & HRIS PT Yuni Abadi Sejahtera Karawang',
      login_welcome_message: 'Selamat datang di Aplikasi Kepegawaian YAS Karawang',
      login_bg_theme: 'yas_navy',
      allow_nip_login: true,
      allow_quick_pin: true,
      allow_remember_me: true,
      session_duration_hours: 24,
      show_forgot_password: true,
      login_footer_text: 'PT Yuni Abadi Sejahtera • Kabupaten Karawang, Jawa Barat',
    };
  });

  // Navigation State - supports ALL sidebar menus
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Android Simulation Frame Mode
  const [isAndroidMode, setIsAndroidMode] = useState(false);

  // Sidebar collapse on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Stats state for badges
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Employees data & pagination state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    status?: string;
    department?: string;
    gender?: string;
    employment_status?: string;
  }>({
    status: 'SEMUA',
    department: 'SEMUA',
    gender: 'SEMUA',
    employment_status: 'SEMUA',
  });

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<'add' | 'edit'>('add');
  const [selectedEmployeeForForm, setSelectedEmployeeForForm] = useState<Employee | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);

  const [idCardModalOpen, setIdCardModalOpen] = useState(false);
  const [selectedEmployeeForIdCard, setSelectedEmployeeForIdCard] = useState<Employee | null>(null);

  const [biodataModalOpen, setBiodataModalOpen] = useState(false);
  const [selectedEmployeeForBiodata, setSelectedEmployeeForBiodata] = useState<Employee | null>(null);

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [selectedEmployeeForDeactivate, setSelectedEmployeeForDeactivate] = useState<Employee | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployeeForDelete, setSelectedEmployeeForDelete] = useState<Employee | null>(null);

  const [importModalOpen, setImportModalOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Settings & Stats on mount
  const refreshStatsAndSettings = async () => {
    try {
      const [statsRes, settingsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getSettings(),
      ]);
      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
        localStorage.setItem('yas_settings', JSON.stringify(settingsRes.data));
      }
    } catch (e) {
      console.error('Failed to refresh stats/settings:', e);
    }
  };

  useEffect(() => {
    refreshStatsAndSettings();
  }, []);

  // Real-Time Cloud Storage Synchronization (Firebase Firestore)
  // Ensures shared link visitors and all tabs automatically receive up-to-date data
  useEffect(() => {
    const unsubEmployees = firestoreSync.subscribeEmployees(async (cloudEmployees) => {
      if (cloudEmployees && cloudEmployees.length > 0) {
        setEmployees(cloudEmployees);
        setTotalCount(cloudEmployees.length);
        await api.syncCloudToLocal({ employees: cloudEmployees }).catch(console.warn);
      }
    });

    const unsubSettings = firestoreSync.subscribeSettings(async (cloudSettings) => {
      if (cloudSettings && Object.keys(cloudSettings).length > 0) {
        setSettings((prev) => ({ ...prev, ...cloudSettings }));
        await api.syncCloudToLocal({ settings: cloudSettings }).catch(console.warn);
      }
    });

    return () => {
      unsubEmployees();
      unsubSettings();
    };
  }, []);

  // Sync document title and theme color CSS variable
  useEffect(() => {
    if (settings.app_name || settings.organization_name) {
      document.title = `${settings.app_name || 'YAS HRIS'} - ${settings.organization_name || settings.company_name || 'Yuni Abadi Sejahtera'}`;
    }
    if (settings.primary_color) {
      document.documentElement.style.setProperty('--theme-primary', settings.primary_color);
    }
    if (settings.accent_color) {
      document.documentElement.style.setProperty('--theme-accent', settings.accent_color);
    }
  }, [settings]);

  // Sync API auth headers
  useEffect(() => {
    if (currentUser) {
      setStoredUser(currentUser);
      localStorage.setItem('yas_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('yas_user');
    }
  }, [currentUser]);

  // Load Employees function
  const loadEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const isArchiveTab = activeTab === 'archive';
      const effectiveStatus = isArchiveTab
        ? 'NONAKTIF'
        : activeFilters.status !== 'SEMUA'
        ? activeFilters.status
        : undefined;

      const res = await api.getEmployees({
        page: currentPage,
        limit: limit,
        q: searchQuery || undefined,
        status: effectiveStatus,
        department: activeFilters.department !== 'SEMUA' ? activeFilters.department : undefined,
        gender: activeFilters.gender !== 'SEMUA' ? activeFilters.gender : undefined,
        employment_status:
          activeFilters.employment_status !== 'SEMUA' ? activeFilters.employment_status : undefined,
      });

      if (res.success) {
        setEmployees(res.data || []);
        setTotalCount(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Failed to load employees:', err);
      showToast('Gagal memuat data pegawai: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, searchQuery, activeFilters, activeTab]);

  useEffect(() => {
    if (activeTab === 'employees' || activeTab === 'archive' || activeTab === 'id-card') {
      loadEmployees();
    }
  }, [loadEmployees, activeTab]);

  // Role Changer
  const handleRoleChange = (newRole: Role) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      role: newRole,
      name:
        newRole === 'SUPER_ADMIN'
          ? 'WIDI'
          : newRole === 'ADMIN'
          ? 'Budi Santoso, S.Kom'
          : newRole === 'HR_STAFF'
          ? 'Siti Nurhaliza'
          : 'Pengamat / Direksi',
    };
    setCurrentUser(updatedUser);
    setStoredUser(updatedUser);
    showToast(`Beralih peran menjadi: ${newRole.replace('_', ' ')}`);
  };

  // HANDLERS FOR EMPLOYEE ACTIONS
  const handleOpenAddModal = () => {
    setSelectedEmployeeForForm(null);
    setFormModalMode('add');
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setSelectedEmployeeForForm(emp);
    setFormModalMode('edit');
    setFormModalOpen(true);
    setDetailModalOpen(false);
  };

  const handleSaveEmployee = async (formData: Partial<Employee>) => {
    if (formModalMode === 'add') {
      const res = await api.createEmployee(formData);
      if (res.success) {
        showToast(`Pegawai ${res.data?.name || 'baru'} berhasil ditambahkan!`);
      }
    } else if (selectedEmployeeForForm) {
      const res = await api.updateEmployee(selectedEmployeeForForm.id, formData);
      if (res.success) {
        showToast(`Data pegawai ${res.data?.name || 'terpilih'} berhasil diperbarui!`);
      }
    }
    loadEmployees();
    refreshStatsAndSettings();
  };

  const handleViewEmployee = (emp: Employee) => {
    setSelectedEmployeeForDetail(emp);
    setDetailModalOpen(true);
  };

  const handlePrintIdCard = (emp: Employee) => {
    setSelectedEmployeeForIdCard(emp);
    setIdCardModalOpen(true);
  };

  const handlePrintBiodata = (emp: Employee) => {
    setSelectedEmployeeForBiodata(emp);
    setBiodataModalOpen(true);
  };

  const handleDeactivateClick = (emp: Employee) => {
    setSelectedEmployeeForDeactivate(emp);
    setDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = async (reason: DeactivationReason, note: string) => {
    if (!selectedEmployeeForDeactivate) return;
    await api.deactivateEmployee(selectedEmployeeForDeactivate.id, {
      deactivation_date: new Date().toISOString().split('T')[0],
      deactivation_reason: reason,
      deactivation_note: note,
    });
    showToast(`Pegawai ${selectedEmployeeForDeactivate.name} berhasil dinonaktifkan.`);
    loadEmployees();
    refreshStatsAndSettings();
    setDetailModalOpen(false);
  };

  const handleActivateClick = async (emp: Employee) => {
    try {
      await api.activateEmployee(emp.id, {
        activation_date: new Date().toISOString().split('T')[0],
        note: 'Diaktifkan kembali oleh Admin HRD',
      });
      showToast(`Pegawai ${emp.name} berhasil diaktifkan kembali!`);
      loadEmployees();
      refreshStatsAndSettings();
      setDetailModalOpen(false);
    } catch (err: any) {
      showToast('Gagal mengaktifkan pegawai: ' + err.message, 'error');
    }
  };

  const handleDeleteClick = (emp: Employee) => {
    setSelectedEmployeeForDelete(emp);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployeeForDelete) return;
    await api.deleteEmployeePermanent(selectedEmployeeForDelete.id);
    showToast(`Data pegawai ${selectedEmployeeForDelete.name} telah dihapus permanen.`);
    loadEmployees();
    refreshStatsAndSettings();
    setDetailModalOpen(false);
  };

  const handleBatchDeleteEmployees = async (ids: string[]) => {
    try {
      const res = await api.batchDeleteEmployees(ids);
      if (res.success) {
        showToast(res.message || 'Data pegawai terpilih berhasil dihapus.');
        loadEmployees();
        refreshStatsAndSettings();
      } else {
        showToast(res.message || 'Gagal menghapus data pegawai.', 'error');
      }
    } catch (err: any) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
    }
  };

  const handleResetEmployees = async (mode: 'empty' | 'sample') => {
    try {
      const res = await api.resetEmployees(mode);
      if (res.success) {
        showToast(res.message || 'Data pegawai berhasil direset.');
        loadEmployees();
        refreshStatsAndSettings();
      } else {
        showToast(res.message || 'Gagal mereset data pegawai.', 'error');
      }
    } catch (err: any) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
    }
  };

  const handleUploadDocument = async (employeeId: string, docData: any) => {
    const res = await api.uploadDocument(employeeId, docData);
    showToast('Dokumen berhasil diunggah!');
    if (res.data) setSelectedEmployeeForDetail(res.data);
    loadEmployees();
  };

  const handleDeleteDocument = async (employeeId: string, documentId: string) => {
    const res = await api.deleteDocument(employeeId, documentId);
    showToast('Dokumen berhasil dihapus.');
    if (res.data) setSelectedEmployeeForDetail(res.data);
    loadEmployees();
  };

  const handleImportEmployees = async (rows: any[]) => {
    const res = await api.batchImportEmployees(rows);
    showToast(`Import selesai: ${res.data?.created || 0} pegawai baru dimasukkan.`);
    loadEmployees();
    refreshStatsAndSettings();
    return { count: res.data?.created || 0, duplicates: res.data?.skipped || 0 };
  };

  const handleNavigate = (view: string) => {
    if (view === 'add-employee') {
      handleOpenAddModal();
      setActiveTab('employees');
    } else {
      setActiveTab(view);
    }
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Anda telah berhasil keluar dari sistem.');
  };

  // If user is not logged in, render the customizable LoginScreen
  if (!currentUser) {
    return (
      <LoginScreen
        settings={settings}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Selamat datang kembali, ${user.name}!`);
        }}
      />
    );
  }

  // App Layout Content
  const appContent = (
    <div className="flex h-screen w-full bg-[#f4f7fb] text-slate-900 overflow-hidden font-sans antialiased relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-2xl p-4 shadow-xl text-xs font-bold transition-all transform duration-300 animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-[#001f4d] text-amber-300 border border-amber-400/40'
              : 'bg-rose-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-amber-300 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-white shrink-0" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-300 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Sidebar Navigation - Handles all menus */}
      <Sidebar
        currentView={activeTab}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
        stats={stats}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        settings={settings}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          currentUser={currentUser}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onSwitchUserRole={handleRoleChange as any}
          stats={stats}
          onGlobalSearch={(q) => {
            setSearchQuery(q);
            setActiveTab('employees');
          }}
          isAndroidMode={isAndroidMode}
          onToggleAndroidMode={() => setIsAndroidMode(!isAndroidMode)}
          settings={settings}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="mx-auto max-w-7xl">
            {/* 1. Dashboard View */}
            {activeTab === 'dashboard' && (
              <DashboardView
                currentUser={currentUser}
                onNavigate={handleNavigate}
                onOpenAddModal={handleOpenAddModal}
                onOpenImportModal={() => setImportModalOpen(true)}
              />
            )}

            {/* 2. Employee List View */}
            {(activeTab === 'employees' || activeTab === 'archive') && (
              <EmployeeListView
                employees={employees}
                totalCount={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                limit={limit}
                isLoading={isLoading}
                currentUser={currentUser}
                onPageChange={(p) => setCurrentPage(p)}
                onLimitChange={(l) => {
                  setLimit(l);
                  setCurrentPage(1);
                }}
                onSearchChange={(q) => {
                  setSearchQuery(q);
                  setCurrentPage(1);
                }}
                onFilterChange={(f) => {
                  setActiveFilters(f);
                  setCurrentPage(1);
                }}
                searchQuery={searchQuery}
                activeFilters={activeFilters}
                onOpenAddModal={handleOpenAddModal}
                onOpenImportModal={() => setImportModalOpen(true)}
                onViewEmployee={handleViewEmployee}
                onEditEmployee={handleOpenEditModal}
                onPrintIdCard={handlePrintIdCard}
                onPrintBiodata={handlePrintBiodata}
                onDeactivateEmployee={handleDeactivateClick}
                onActivateEmployee={handleActivateClick}
                onDeleteEmployee={handleDeleteClick}
                onResetEmployees={handleResetEmployees}
                onBatchDelete={handleBatchDeleteEmployees}
              />
            )}

            {/* Menu Keuangan & Payroll */}
            {(activeTab === 'finance' || activeTab === 'keuangan') && (
              <FinanceView settings={settings} currentUser={currentUser} />
            )}

            {/* Menu ID Card */}
            {(activeTab === 'id-card' || activeTab === 'id-cards') && (
              <IdCardView
                employees={employees}
                settings={settings}
                currentUser={currentUser}
              />
            )}

            {/* 3. Dokumen Pegawai */}
            {activeTab === 'documents' && (
              <DocumentsView
                currentUser={currentUser}
                onOpenEmployeeDetail={handleViewEmployee}
              />
            )}

            {/* 4. Laporan Kepegawaian */}
            {activeTab === 'reports' && <ReportsView settings={settings} />}

            {/* 5. Kontrak Berakhir */}
            {activeTab === 'contract-alerts' && (
              <ContractAlertsView
                currentUser={currentUser}
                onOpenEmployeeDetail={handleViewEmployee}
                onDeactivateEmployee={handleDeactivateClick}
              />
            )}

            {/* 6. Manajemen Pengguna */}
            {activeTab === 'users' && <UsersView />}

            {/* 7. Audit Logs & Riwayat */}
            {(activeTab === 'audit' || activeTab === 'audit-logs') && <AuditLogsView />}

            {/* 8. Backup Database */}
            {activeTab === 'backup' && (
              <BackupView
                onRefreshData={() => {
                  loadEmployees();
                  refreshStatsAndSettings();
                }}
              />
            )}

            {/* 9. Pengaturan Sistem */}
            {activeTab === 'settings' && (
              <SettingsView
                onSettingsUpdated={(updated) => setSettings(updated)}
                onToggleAndroidMode={() => setIsAndroidMode(!isAndroidMode)}
                isAndroidMode={isAndroidMode}
                currentUser={currentUser}
                onCurrentUserUpdated={(updatedUser) => {
                  setCurrentUser(updatedUser);
                  setStoredUser(updatedUser);
                  showToast(`Profil admin ${updatedUser.name} berhasil diperbarui!`);
                }}
              />
            )}

            {/* 10. Profil YAS Karawang */}
            {activeTab === 'about' && (
              <AboutView
                settings={settings}
                onOpenAndroidMode={() => setIsAndroidMode(true)}
              />
            )}
          </div>
        </main>

        {/* Android Bottom Navigation Bar (Active on Mobile / Touch screens) */}
        <AndroidBottomNav
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onOpenAddModal={handleOpenAddModal}
          onOpenMobileDrawer={() => setSidebarOpen(true)}
          pendingContractsCount={stats?.expiringContracts30 || 0}
          primaryColor={settings?.primary_color}
        />
      </div>

      {/* MODALS */}
      {/* 1. Add / Edit Modal */}
      <EmployeeFormModal
        isOpen={formModalOpen}
        mode={formModalMode}
        initialData={selectedEmployeeForForm}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSaveEmployee}
      />

      {/* 2. Employee Profile Detail Modal */}
      <EmployeeDetailModal
        isOpen={detailModalOpen}
        employee={selectedEmployeeForDetail}
        currentUser={currentUser}
        onClose={() => setDetailModalOpen(false)}
        onEdit={(emp) => handleOpenEditModal(emp)}
        onPrintIdCard={(emp) => handlePrintIdCard(emp)}
        onPrintBiodata={(emp) => handlePrintBiodata(emp)}
        onUploadDocument={handleUploadDocument}
        onDeleteDocument={handleDeleteDocument}
      />

      {/* 3. ID Card Modal */}
      <IdCardModal
        isOpen={idCardModalOpen}
        employee={selectedEmployeeForIdCard}
        onClose={() => setIdCardModalOpen(false)}
      />

      {/* 4. Biodata Print Modal */}
      <BiodataPrintModal
        isOpen={biodataModalOpen}
        employee={selectedEmployeeForBiodata}
        onClose={() => setBiodataModalOpen(false)}
      />

      {/* 5. Deactivate / Archive Modal */}
      <DeactivateModal
        isOpen={deactivateModalOpen}
        employee={selectedEmployeeForDeactivate}
        onClose={() => setDeactivateModalOpen(false)}
        onConfirm={handleConfirmDeactivate}
      />

      {/* 6. Delete Permanent Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        employee={selectedEmployeeForDelete}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* 7. Excel Import Modal */}
      <ExcelImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportEmployees}
      />
    </div>
  );

  // If Android Frame Simulation mode is toggled on, wrap the entire app in a realistic Android Device Frame!
  if (isAndroidMode) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Simulator Control Bar */}
        <div className="w-full max-w-sm mb-2 flex items-center justify-between px-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-amber-400" />
            <span className="font-bold text-amber-300">Mode Simulasi Android (Karawang)</span>
          </div>
          <button
            onClick={() => setIsAndroidMode(false)}
            className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Kembali ke Desktop ✕
          </button>
        </div>

        {/* Realistic Android Hardware Frame */}
        <div className="relative w-full max-w-[420px] h-[860px] max-h-[95vh] rounded-[48px] bg-slate-900 p-3 shadow-2xl ring-8 ring-slate-800/80 border-4 border-slate-700/60 flex flex-col overflow-hidden">
          {/* Top Notch & Camera */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-black/80 px-4 py-1 text-[10px] text-white">
            <div className="h-2 w-2 rounded-full bg-blue-900 border border-slate-600" />
            <span className="font-mono text-[9px] text-slate-300">YAS HRIS Android</span>
          </div>

          {/* Android Status Bar */}
          <div className="h-7 w-full bg-[#001f4d] flex items-center justify-between px-6 text-[11px] font-bold text-white z-40 shrink-0 select-none">
            <span>
              {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center gap-1.5 opacity-90">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* App Container */}
          <div className="flex-1 w-full overflow-hidden rounded-b-[38px] relative">
            {appContent}
          </div>

          {/* Bottom Android Home Pill Indicator */}
          <div className="h-4 w-full bg-white/95 flex items-center justify-center shrink-0">
            <div className="h-1 w-32 rounded-full bg-slate-400" />
          </div>
        </div>
      </div>
    );
  }

  return appContent;
}
