import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Clock,
  Briefcase,
  Building2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { DashboardStats, AuditLog, User } from '../types';
import { api } from '../services/api';

interface DashboardViewProps {
  currentUser: User;
  onNavigate: (view: any) => void;
  onOpenAddModal: () => void;
  onOpenImportModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigate,
  onOpenAddModal,
  onOpenImportModal,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const [statsRes, logsRes] = await Promise.all([
          api.getDashboardStats(),
          api.getAuditLogs({ limit: 5 } as any),
        ]);
        if (statsRes.success) setStats(statsRes.stats);
        if (logsRes.success) setRecentLogs(logsRes.data?.slice(0, 5) || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const total = Number(stats?.totalEmployees || 0);
  const active = Number(stats?.activeEmployees || 0);
  const inactive = Number(stats?.inactiveEmployees || 0);
  const male = Number(stats?.maleCount || 0);
  const female = Number(stats?.femaleCount || 0);
  const newThisMonth = Number(stats?.newEmployeesThisMonth || 0);
  const exp30 = Number(stats?.expiringContracts30 || 0);
  const exp60 = Number(stats?.expiringContracts60 || 0);

  const malePercent = total > 0 ? Math.round((male / total) * 100) : 0;
  const femalePercent = total > 0 ? Math.round((female / total) * 100) : 0;

  const deptList: [string, number][] = stats?.departmentDistribution
    ? Object.entries(stats.departmentDistribution).map(([k, v]) => [k, Number(v)])
    : [];

  const statusList: [string, number][] = stats?.employmentStatusDistribution
    ? Object.entries(stats.employmentStatusDistribution).map(([k, v]) => [k, Number(v)])
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner with Corporate YAS Styling */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-yas p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md border border-amber-400/30">
              <Building2 className="h-3.5 w-3.5" />
              YUNI ABADI SEJAHTERA • KABUPATEN KARAWANG
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang di <span className="text-gold-gradient">Sistem YAS HRIS</span>
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Sistem Informasi Manajemen Data Pegawai, Mutasi, Riwayat Kerja, dan Kearsipan Karyawan Resmi PT Yuni Abadi Sejahtera Karawang.
            </p>
          </div>

          {/* Quick Action Button in Banner */}
          <div className="flex flex-wrap items-center gap-3">
            {currentUser.role !== 'VIEWER' && (
              <button
                id="btn-banner-tambah"
                onClick={onOpenAddModal}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-xs font-bold text-blue-950 shadow-lg hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                Tambah Pegawai
              </button>
            )}

            <button
              onClick={() => onNavigate('employees')}
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all cursor-pointer"
            >
              <Users className="h-4 w-4" />
              Data Pegawai
            </button>

            <button
              onClick={() => onNavigate('finance')}
              className="flex items-center gap-2 rounded-xl border border-amber-400/40 bg-blue-900/60 px-4 py-2.5 text-xs font-bold text-amber-300 backdrop-blur-md hover:bg-blue-900 transition-all cursor-pointer"
            >
              <Wallet className="h-4 w-4" />
              Keuangan &amp; Payroll
            </button>

            <button
              onClick={() => onNavigate('id-card')}
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all cursor-pointer"
            >
              <CreditCard className="h-4 w-4" />
              Menu ID Card
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* Total Pegawai */}
        <div
          onClick={() => onNavigate('employees')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm hover:border-blue-500 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pegawai</span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-900 group-hover:bg-blue-900 group-hover:text-amber-300 transition-colors">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{total}</span>
            <span className="text-[11px] text-slate-400 font-semibold">orang</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Terdaftar di database</p>
        </div>

        {/* Pegawai Aktif */}
        <div
          onClick={() => onNavigate('employees')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Pegawai Aktif</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{active}</span>
            <span className="text-[11px] text-emerald-700 font-semibold">aktif</span>
          </div>
          <p className="mt-1 text-[10px] text-emerald-600/80 font-medium">
            {total > 0 ? Math.round((active / total) * 100) : 0}% dari total
          </p>
        </div>

        {/* Pegawai Nonaktif / Arsip */}
        <div
          onClick={() => onNavigate('archive')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm hover:border-slate-400 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nonaktif (Arsip)</span>
            <div className="rounded-xl bg-slate-100 p-2 text-slate-600 group-hover:bg-slate-700 group-hover:text-white transition-colors">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-700">{inactive}</span>
            <span className="text-[11px] text-slate-400 font-semibold">arsip</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Resign / Selesai</p>
        </div>

        {/* Pegawai Baru Bulan Ini */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Masuk Bulan Ini</span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-800">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-900">+{newThisMonth}</span>
            <span className="text-[11px] text-slate-400 font-semibold">orang</span>
          </div>
          <p className="mt-1 text-[10px] text-blue-700 font-medium">Bulan berjalan</p>
        </div>

        {/* Rasio Gender */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gender (L / P)</span>
            <span className="text-xs font-bold text-slate-700 font-mono">
              {male} / {female}
            </span>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>L: {malePercent}%</span>
              <span>P: {femalePercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 flex">
              <div style={{ width: `${malePercent}%` }} className="bg-blue-900 h-full" />
              <div style={{ width: `${femalePercent}%` }} className="bg-pink-500 h-full" />
            </div>
          </div>
        </div>

        {/* Kontrak Berakhir <30 Hari */}
        <div
          onClick={() => onNavigate('employees')}
          className={`group cursor-pointer rounded-2xl border p-4.5 shadow-sm transition-all ${
            exp30 > 0
              ? 'border-amber-400 bg-amber-50/60 hover:bg-amber-50'
              : 'border-slate-200/80 bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase">Kontrak &lt;30 Hari</span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-800">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">{exp30}</span>
            <span className="text-[11px] text-amber-800 font-semibold">pegawai</span>
          </div>
          <p className="mt-1 text-[10px] text-amber-700 font-medium">Perlu peninjauan</p>
        </div>
      </div>

      {/* Alert Box jika ada kontrak berakhir */}
      {exp30 > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-500 p-2 text-blue-950 shadow-sm shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                Peringatan Kontrak Pegawai YAS (Karawang)
              </h4>
              <p className="text-xs text-amber-900 mt-0.5">
                Terdapat <strong>{exp30} orang pegawai</strong> yang masa kontrak kerjanya akan berakhir dalam 30 hari ke depan.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('employees')}
            className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-blue-950 transition-colors shadow-xs shrink-0"
          >
            <span>Tinjau Data Pegawai</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Department Breakdown (7 cols) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Distribusi Pegawai Per Departemen</h3>
              <p className="text-xs text-slate-500">Jumlah staf & karyawan pada setiap divisi unit kerja</p>
            </div>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-950">
              {deptList.length} Departemen
            </span>
          </div>

          <div className="space-y-3.5">
            {deptList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada data departemen.</p>
            ) : (
              deptList.map(([dept, count], idx) => {
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                const colors = ['bg-blue-900', 'bg-sky-600', 'bg-amber-500', 'bg-indigo-600', 'bg-emerald-600', 'bg-slate-600'];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="font-bold text-slate-800">{dept}</span>
                      <span className="text-slate-500">
                        <strong className="text-slate-900">{count}</strong> ({percent}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Employment Status Breakdown (5 cols) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Jenis Hubungan Kerja</h3>
              <p className="text-xs text-slate-500">Karyawan Tetap, PKWT Kontrak, Magang, Outsourcing</p>
            </div>
            <Briefcase className="h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {statusList.map(([st, count]) => {
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={st} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{st}</p>
                    <p className="text-[10px] text-slate-500">{percent}% dari total karyawan</p>
                  </div>
                  <span className="text-sm font-extrabold text-blue-950 font-mono">
                    {count} <span className="text-[10px] text-slate-400 font-normal">org</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Log Cards */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Aktivitas & Log Audit Terbaru</h3>
            <p className="text-xs text-slate-500">Pencatatan real-time perubahan data sistem HRIS</p>
          </div>
          <button
            onClick={() => onNavigate('audit')}
            className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua Log</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Belum ada aktivitas tercatat.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{log.user_name}</span>
                  <span className="text-slate-500"> • {log.details || log.action}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap ml-2">
                  {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
