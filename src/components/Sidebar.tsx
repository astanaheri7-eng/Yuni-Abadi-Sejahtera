import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  BarChart3,
  Clock,
  ShieldCheck,
  History,
  Database,
  Settings,
  Info,
  LogOut,
  ChevronRight,
  Shield,
  FileSpreadsheet,
  Wallet,
  CreditCard,
} from 'lucide-react';
import { User, DashboardStats, OrganizationSettings } from '../types';
import { LogoYAS } from './LogoYAS';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User;
  onLogout: () => void;
  stats?: DashboardStats | null;
  isOpen: boolean;
  onCloseMobile?: () => void;
  settings?: OrganizationSettings;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onLogout,
  stats,
  isOpen,
  onCloseMobile,
  settings,
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isAdmin = currentUser.role === 'ADMIN' || isSuperAdmin;
  const isViewer = currentUser.role === 'VIEWER';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'ADMIN', 'VIEWER'],
    },
    {
      id: 'employees',
      label: 'Data Pegawai',
      icon: Users,
      badge: stats?.activeEmployees ? `${stats.activeEmployees}` : undefined,
      badgeColor: 'bg-blue-600 text-white',
      roles: ['SUPER_ADMIN', 'ADMIN', 'VIEWER'],
    },
    {
      id: 'finance',
      label: 'Keuangan & Payroll',
      icon: Wallet,
      badge: 'UMK 2026',
      badgeColor: 'bg-emerald-600 text-white font-bold',
      roles: ['SUPER_ADMIN', 'ADMIN', 'VIEWER'],
    },
    {
      id: 'id-card',
      label: 'Menu ID Card',
      icon: CreditCard,
      roles: ['SUPER_ADMIN', 'ADMIN', 'VIEWER'],
    },
    {
      id: 'add-employee',
      label: 'Tambah Pegawai',
      icon: UserPlus,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      id: 'documents',
      label: 'Dokumen Pegawai',
      icon: FileText,
      roles: ['SUPER_ADMIN', 'ADMIN', 'VIEWER'],
    },
    {
      id: 'reports',
      label: 'Laporan Kepegawaian',
      icon: BarChart3,
      roles: ['SUPER_ADMIN', 'ADMIN', 'VIEWER'],
    },
    {
      id: 'contract-alerts',
      label: 'Kontrak Berakhir',
      icon: Clock,
      badge: stats?.expiringContracts30 ? `${stats.expiringContracts30}` : undefined,
      badgeColor: 'bg-amber-500 text-slate-900 font-bold',
      roles: ['SUPER_ADMIN', 'ADMIN', 'VIEWER'],
    },
    {
      id: 'users',
      label: 'Manajemen Pengguna',
      icon: ShieldCheck,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'audit-logs',
      label: 'Audit Log & Riwayat',
      icon: History,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'backup',
      label: 'Backup Database',
      icon: Database,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'settings',
      label: 'Pengaturan Sistem',
      icon: Settings,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'about',
      label: 'Profil YAS Karawang',
      icon: Info,
      roles: ['SUPER_ADMIN', 'ADMIN', 'VIEWER'],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  const handleItemClick = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header with Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 bg-gradient-to-r from-slate-50 to-white">
          <LogoYAS
            size="sm"
            variant="dark"
            customLogoUrl={settings?.custom_logo_data || settings?.logo_url}
            customAppName={settings?.organization_name || settings?.company_name}
            customTagline={settings?.tagline}
          />
        </div>

        {/* User Status Bar inside Sidebar */}
        <div className="mx-3 mt-3 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold shadow-sm transition-colors duration-300"
              style={{
                backgroundColor: settings?.primary_color || '#001f4d',
                color: settings?.accent_color || '#fcd34d',
              }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-bold text-slate-800">{currentUser.name}</p>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Menu Utama
          </div>

          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => handleItemClick(item.id)}
                style={
                  isActive
                    ? {
                        backgroundColor: settings?.primary_color || '#001f4d',
                        color: settings?.accent_color || '#fcd34d',
                      }
                    : {}
                }
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'shadow-md shadow-blue-950/20 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? '' : 'text-slate-400 group-hover:text-blue-900'
                    }`}
                    style={isActive ? { color: settings?.accent_color || '#fcd34d' } : {}}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.badgeColor || 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight
                      className="h-3.5 w-3.5"
                      style={{ color: settings?.accent_color || '#fcd34d' }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="border-t border-slate-100 p-3 bg-slate-50/50">
          <div className="mb-2 px-2 text-[10px] text-slate-400 leading-tight text-center">
            <span className="font-semibold text-slate-600">YAS HRIS v2.4</span>
            <br />
            Kabupaten Karawang, Jawa Barat
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar Sistem
          </button>
        </div>
      </aside>
    </>
  );
};
