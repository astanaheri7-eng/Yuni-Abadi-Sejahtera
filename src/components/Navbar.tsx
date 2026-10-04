import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  UserCheck,
  Shield,
  LogOut,
  ChevronDown,
  Building,
  Key,
  Info,
  Calendar,
  Smartphone,
} from 'lucide-react';
import { User, DashboardStats, OrganizationSettings } from '../types';
import { LogoYAS } from './LogoYAS';

interface NavbarProps {
  currentUser: User;
  onToggleSidebar: () => void;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onSwitchUserRole?: (role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER') => void;
  stats?: DashboardStats | null;
  onGlobalSearch?: (q: string) => void;
  isAndroidMode?: boolean;
  onToggleAndroidMode?: () => void;
  settings?: OrganizationSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onToggleSidebar,
  onNavigate,
  onLogout,
  onSwitchUserRole,
  stats,
  onGlobalSearch,
  isAndroidMode,
  onToggleAndroidMode,
  settings,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'ADMIN':
        return { label: 'Admin HR', bg: 'bg-sky-500/20 text-sky-200 border-sky-500/30' };
      case 'VIEWER':
        return { label: 'Viewer / HR', bg: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' };
      default:
        return { label: role, bg: 'bg-slate-500/20 text-slate-200 border-slate-500/30' };
    }
  };

  const badge = getRoleBadge(currentUser.role);
  const totalAlerts = (stats?.expiringContracts30 || 0) + (stats?.dataQualityIssuesCount || 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onGlobalSearch) {
      onGlobalSearch(searchQuery);
    }
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 px-4 text-white shadow-md sm:px-6 transition-colors duration-300"
      style={{ backgroundColor: settings?.primary_color || '#001f4d' }}
    >
      {/* Left side: Hamburger & Branding */}
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-300 hover:bg-blue-900/60 hover:text-white focus:outline-none transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div
          onClick={() => onNavigate('dashboard')}
          className="cursor-pointer select-none"
        >
          <LogoYAS
            size="md"
            variant="light"
            showSubtitle={false}
            customLogoUrl={settings?.custom_logo_data || settings?.logo_url}
            customAppName={settings?.organization_name || settings?.company_name}
            customTagline={settings?.tagline}
          />
        </div>

        <div className="hidden lg:block border-l border-blue-800/60 pl-3">
          <span className="text-xs font-bold tracking-wider text-amber-300">
            {settings?.regency ? settings.regency.toUpperCase() : 'KABUPATEN KARAWANG'}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            id="input-global-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pegawai (Nama, NIK, Jabatan, Dept)..."
            className="w-full rounded-full border border-blue-800/80 bg-blue-950/70 py-1.5 pl-10 pr-4 text-xs text-slate-100 placeholder-blue-300/50 focus:border-amber-400 focus:bg-blue-950 focus:outline-none transition-all shadow-inner"
          />
          <Search className="absolute left-3.5 top-2 h-4 w-4 text-blue-300/70" />
        </form>
      </div>

      {/* Right side: Role indicator, Android toggle, Notifications, User menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Firebase Cloud Sync Status */}
        <div
          className="hidden md:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 select-none shadow-xs"
          title="Tersimpan di Cloud Firebase • Data otomatis tersinkronisasi di link yang dibagikan"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Cloud Sync (Firebase)</span>
        </div>

        {/* Android Mode Toggle */}
        {onToggleAndroidMode && (
          <button
            onClick={onToggleAndroidMode}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all border ${
              isAndroidMode
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-400/40'
                : 'bg-blue-900/60 text-blue-200 border-blue-800 hover:bg-blue-800 hover:text-white'
            }`}
            title="Beralih Bingkai Simulator Android"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">{isAndroidMode ? 'Mode Android ON' : 'Mode Android'}</span>
          </button>
        )}
        {/* Quick Role Switcher for Demo testing */}
        {onSwitchUserRole && (
          <div className="relative">
            <button
              id="btn-role-switcher"
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${badge.bg} hover:brightness-110 transition-all`}
              title="Ganti Role Cepat (Demo RBAC)"
            >
              <Shield className="h-3 w-3" />
              <span>{badge.label}</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>

            {showRoleSwitcher && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl bg-white p-2 text-slate-800 shadow-2xl ring-1 ring-black/10 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setShowRoleSwitcher(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Beralih Hak Akses (RBAC)
                </div>
                <button
                  onClick={() => onSwitchUserRole('SUPER_ADMIN')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
                    currentUser.role === 'SUPER_ADMIN'
                      ? 'bg-amber-50 text-amber-800'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Super Admin
                  </span>
                  {currentUser.role === 'SUPER_ADMIN' && <span className="text-[10px] text-amber-600">Aktif</span>}
                </button>
                <button
                  onClick={() => onSwitchUserRole('ADMIN')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-sky-50 text-sky-800'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                    Admin HR
                  </span>
                  {currentUser.role === 'ADMIN' && <span className="text-[10px] text-sky-600">Aktif</span>}
                </button>
                <button
                  onClick={() => onSwitchUserRole('VIEWER')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
                    currentUser.role === 'VIEWER'
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Viewer / Staf
                  </span>
                  {currentUser.role === 'VIEWER' && <span className="text-[10px] text-emerald-600">Aktif</span>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-300 hover:bg-blue-900/60 hover:text-white transition-colors"
            title="Pemberitahuan & Peringatan Kontrak"
          >
            <Bell className="h-5 w-5" />
            {totalAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-blue-950 ring-2 ring-[#001f4d]">
                {totalAlerts}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-3 text-slate-800 shadow-2xl ring-1 ring-black/10 z-50 animate-in fade-in slide-in-from-top-2"
              onClick={() => setShowNotifications(false)}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                <span className="text-xs font-bold text-slate-700">Pemberitahuan Sistem</span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                  {totalAlerts} Perhatian
                </span>
              </div>
              <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                {stats?.expiringContracts30 ? (
                  <div
                    onClick={() => onNavigate('contract-alerts')}
                    className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900 hover:bg-amber-100/80 transition-colors"
                  >
                    <Calendar className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-bold">{stats.expiringContracts30} Kontrak Segera Berakhir</p>
                      <p className="text-[11px] text-amber-700">Dalam 30 hari ke depan. Klik untuk meninjau perpanjangan.</p>
                    </div>
                  </div>
                ) : null}

                {stats?.dataQualityIssuesCount ? (
                  <div
                    onClick={() => onNavigate('employees')}
                    className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-sky-50 p-2.5 text-xs text-sky-900 hover:bg-sky-100/80 transition-colors"
                  >
                    <Info className="h-4 w-4 mt-0.5 text-sky-600 shrink-0" />
                    <div>
                      <p className="font-bold">{stats.dataQualityIssuesCount} Rekod Data Perlu Diperbaiki</p>
                      <p className="text-[11px] text-sky-700">Terdapat NIK / data kontak pegawai yang belum lengkap.</p>
                    </div>
                  </div>
                ) : null}

                {totalAlerts === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <UserCheck className="mx-auto h-8 w-8 text-emerald-400 mb-1 opacity-80" />
                    Semua data & kontrak dalam kondisi optimal.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            id="btn-user-avatar"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-full p-1 pl-2 text-left hover:bg-blue-900/60 transition-colors"
          >
            <div className="hidden text-right sm:block">
              <div className="text-xs font-bold leading-tight text-slate-100">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-amber-300 font-medium">{currentUser.username}</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-blue-950 font-bold text-sm shadow-md ring-2 ring-amber-400/40">
              {currentUser.name.charAt(0)}
            </div>
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 text-slate-800 shadow-2xl ring-1 ring-black/10 z-50 animate-in fade-in slide-in-from-top-2"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <span className="mt-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {currentUser.role}
                </span>
              </div>
              <div className="mt-1 space-y-0.5">
                <button
                  onClick={() => onNavigate('settings')}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Building className="h-4 w-4 text-slate-500" />
                  Profil & Pengaturan
                </button>
                <button
                  onClick={() => onNavigate('about')}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Info className="h-4 w-4 text-slate-500" />
                  Tentang YAS Karawang
                </button>
              </div>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar / Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
