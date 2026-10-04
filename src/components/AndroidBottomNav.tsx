import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BarChart3,
  Clock,
  Menu,
  Settings,
  FileText,
} from 'lucide-react';

interface AndroidBottomNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenAddModal: () => void;
  onOpenMobileDrawer: () => void;
  pendingContractsCount?: number;
  primaryColor?: string;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onNavigate,
  onOpenAddModal,
  onOpenMobileDrawer,
  pendingContractsCount = 0,
  primaryColor = '#001f4d',
}) => {
  return (
    <nav
      id="android-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-slate-200/90 bg-white/95 backdrop-blur-md px-2 py-1 shadow-2xl safe-area-pb"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 6px)' }}
    >
      <div className="flex items-center justify-around">
        {/* 1. Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          style={activeTab === 'dashboard' ? { color: primaryColor } : {}}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
            activeTab === 'dashboard'
              ? 'font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div
            className="p-1 rounded-xl transition-all"
            style={activeTab === 'dashboard' ? { backgroundColor: `${primaryColor}18`, color: primaryColor } : {}}
          >
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5">Beranda</span>
        </button>

        {/* 2. Data Pegawai */}
        <button
          onClick={() => onNavigate('employees')}
          style={activeTab === 'employees' ? { color: primaryColor } : {}}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
            activeTab === 'employees'
              ? 'font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div
            className="p-1 rounded-xl transition-all"
            style={activeTab === 'employees' ? { backgroundColor: `${primaryColor}18`, color: primaryColor } : {}}
          >
            <Users className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5">Pegawai</span>
        </button>

        {/* 3. Center Floating Action Button (+) Tambah */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center -mt-5 transition-transform active:scale-90"
          title="Tambah Pegawai Baru"
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-amber-300 shadow-xl ring-4 ring-white border border-amber-400/40"
            style={{ backgroundColor: primaryColor }}
          >
            <UserPlus className="h-6 w-6" />
          </div>
          <span
            className="text-[9px] font-extrabold mt-1"
            style={{ color: primaryColor }}
          >
            Tambah
          </span>
        </button>

        {/* 4. Kontrak / Peringatan */}
        <button
          onClick={() => onNavigate('contract-alerts')}
          style={activeTab === 'contract-alerts' ? { color: primaryColor } : {}}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
            activeTab === 'contract-alerts'
              ? 'font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div
            className="p-1 rounded-xl transition-all relative"
            style={activeTab === 'contract-alerts' ? { backgroundColor: `${primaryColor}18`, color: primaryColor } : {}}
          >
            <Clock className="h-5 w-5" />
            {pendingContractsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white ring-2 ring-white">
                {pendingContractsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Kontrak</span>
        </button>

        {/* 5. Menu Drawer Lainnya */}
        <button
          onClick={onOpenMobileDrawer}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] text-slate-500 hover:text-slate-800 font-medium"
        >
          <div className="p-1 rounded-xl">
            <Menu className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5">Lainnya</span>
        </button>
      </div>
    </nav>
  );
};
