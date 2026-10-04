import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Printer,
  Download,
  Filter,
  Users,
  Calendar,
  Building,
  GraduationCap,
  Award,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { Employee, DashboardStats, OrganizationSettings } from '../types';
import { api } from '../services/api';
import { LogoYAS } from './LogoYAS';

interface ReportsViewProps {
  settings?: OrganizationSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ settings }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState('SEMUA');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [empRes, statsRes] = await Promise.all([
          api.getEmployees({ limit: 200, status: 'SEMUA' }),
          api.getDashboardStats(),
        ]);
        if (empRes.success && empRes.data) setEmployees(empRes.data);
        if (statsRes.success && statsRes.stats) setStats(statsRes.stats);
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchDept = selectedDept === 'SEMUA' || emp.department === selectedDept;
    const matchStatus =
      selectedStatus === 'SEMUA' ||
      (selectedStatus === 'AKTIF' && emp.employee_status === 'AKTIF') ||
      (selectedStatus === 'NONAKTIF' && emp.employee_status === 'NONAKTIF') ||
      emp.employment_status === selectedStatus;
    return matchDept && matchStatus;
  });

  // Calculate distributions
  const deptCounts: { [key: string]: number } = {};
  const statusCounts: { [key: string]: number } = { TETAP: 0, KONTRAK: 0, MAGANG: 0, OUTSOURCING: 0 };
  const eduCounts: { [key: string]: number } = { SMA_SMK: 0, D3: 0, S1: 0, S2: 0, LAINNYA: 0 };
  const genderCounts = { L: 0, P: 0 };

  filteredEmployees.forEach((emp) => {
    // Dept
    deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
    // Employment
    if (emp.employment_status && statusCounts[emp.employment_status] !== undefined) {
      statusCounts[emp.employment_status]++;
    }
    // Gender
    if (emp.gender === 'LAKI-LAKI') genderCounts.L++;
    else if (emp.gender === 'PEREMPUAN') genderCounts.P++;
    // Education
    const edu = emp.last_education?.toUpperCase();
    if (edu === 'SMA' || edu === 'SMK') eduCounts.SMA_SMK++;
    else if (edu === 'D3') eduCounts.D3++;
    else if (edu === 'S1') eduCounts.S1++;
    else if (edu === 'S2') eduCounts.S2++;
    else eduCounts.LAINNYA++;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'NIP',
      'Nama Lengkap',
      'NIK KTP',
      'Departemen',
      'Jabatan',
      'Status Hubungan Kerja',
      'Status Pegawai',
      'TMT Masuk',
      'Pendidikan Terakhir',
      'No Telepon',
      'Alamat / Kecamatan',
    ];

    const rows = filteredEmployees.map((emp, idx) => [
      idx + 1,
      `"${emp.employee_number}"`,
      `"${emp.name}"`,
      `"'${emp.nik}"`,
      `"${emp.department}"`,
      `"${emp.position}"`,
      `"${emp.employment_status}"`,
      `"${emp.employee_status}"`,
      `"${emp.join_date}"`,
      `"${emp.last_education || '-'}"`,
      `"${emp.phone || '-'}"`,
      `"${emp.district || emp.address || 'Karawang'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Kepegawaian_YAS_Karawang_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan kepegawaian berhasil diekspor ke format CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  const companyName = settings?.company_name || 'PT YUNI ABADI SEJAHTERA';
  const director = settings?.director_name || 'H. Yuni Hermanto, S.E.';
  const hrHead = settings?.hr_head_name || 'WIDI';

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-[#001f4d] p-4 text-xs font-bold text-amber-300 shadow-2xl border border-amber-400/40">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header (Hidden on Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-blue-900" />
            Laporan Rekapitulasi Kepegawaian
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analisis demografi tenaga kerja, komposisi divisi, dan status kontrak PT YAS Karawang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Ekspor Excel / CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-amber-300 shadow-md hover:bg-blue-950 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Cetak Laporan Resmi A4
          </button>
        </div>
      </div>

      {/* Filter Bar (Hidden on Print) */}
      <div className="print:hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="font-bold text-slate-700">Filter Laporan:</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-500 font-medium">Departemen:</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-blue-900"
          >
            <option value="SEMUA">Semua Departemen</option>
            {Object.keys(deptCounts).map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-500 font-medium">Status Pegawai:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-blue-900"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="AKTIF">Pegawai Aktif Saja</option>
            <option value="NONAKTIF">Pegawai Nonaktif / Arsip</option>
            <option value="TETAP">Status PKWTT (Tetap)</option>
            <option value="KONTRAK">Status PKWT (Kontrak)</option>
            <option value="MAGANG">Status Magang</option>
            <option value="OUTSOURCING">Status Alih Daya (Outsourcing)</option>
          </select>
        </div>

        <div className="ml-auto text-slate-500 font-semibold">
          Total Terpilih: <span className="font-bold text-blue-900">{filteredEmployees.length}</span> Pegawai
        </div>
      </div>

      {/* Official Print Header (Only visible on print or preview) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <LogoYAS size="lg" variant="dark" />
          <div className="text-right text-[11px] text-slate-600">
            <p className="font-bold text-slate-900 text-sm">{companyName}</p>
            <p>Klari, Kabupaten Karawang - Jawa Barat 41371</p>
            <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
          </div>
        </div>
        <div className="text-center mt-4">
          <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
            LAPORAN REKAPITULASI & STATISTIK KEPEGAWAIAN
          </h2>
          <p className="text-xs text-slate-600">
            Periode Data: Tahun {new Date().getFullYear()} • Lokasi Kerja: Karawang Timur & Klari
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Jumlah Pegawai</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{filteredEmployees.length}</p>
          <span className="text-[10px] text-slate-500">Dalam kriteria laporan</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Karyawan Tetap (PKWTT)</span>
          <p className="text-2xl font-black text-blue-900 mt-1">{statusCounts.TETAP || 0}</p>
          <span className="text-[10px] text-blue-700">Karyawan permanen</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Karyawan PKWT (Kontrak)</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{statusCounts.KONTRAK || 0}</p>
          <span className="text-[10px] text-amber-700">Perjanjian kerja berjangka</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Komposisi Gender</span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {genderCounts.L} <span className="text-xs font-normal text-slate-500">L</span> / {genderCounts.P} <span className="text-xs font-normal text-slate-500">P</span>
          </p>
          <span className="text-[10px] text-slate-500">Laki-laki & Perempuan</span>
        </div>
      </div>

      {/* Distributions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Department Breakdown */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-900" />
            Distribusi Per Departemen / Divisi
          </h3>
          <div className="space-y-2 text-xs">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = filteredEmployees.length > 0 ? Math.round((count / filteredEmployees.length) * 100) : 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
                    <span>{dept}</span>
                    <span>{count} orang ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-900 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Education Breakdown */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-900" />
            Distribusi Tingkat Pendidikan Terakhir
          </h3>
          <div className="space-y-2 text-xs">
            {[
              { label: 'Sarjana (S1)', count: eduCounts.S1, color: 'bg-emerald-600' },
              { label: 'Diploma (D3)', count: eduCounts.D3, color: 'bg-blue-600' },
              { label: 'SMA / SMK Sederajat', count: eduCounts.SMA_SMK, color: 'bg-amber-500' },
              { label: 'Magister (S2)', count: eduCounts.S2, color: 'bg-purple-600' },
              { label: 'Lainnya / Tidak Tercatat', count: eduCounts.LAINNYA, color: 'bg-slate-400' },
            ].map((item) => {
              const pct = filteredEmployees.length > 0 ? Math.round((item.count / filteredEmployees.length) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
                    <span>{item.label}</span>
                    <span>{item.count} orang ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
            Tabel Rekap Data Pegawai
          </h3>
          <span className="text-[11px] text-slate-500 font-semibold">
            {filteredEmployees.length} Baris Data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-extrabold text-slate-600">
              <tr>
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">NIP</th>
                <th className="py-2.5 px-3">Nama Pegawai</th>
                <th className="py-2.5 px-3">Departemen</th>
                <th className="py-2.5 px-3">Jabatan</th>
                <th className="py-2.5 px-3">Hub. Kerja</th>
                <th className="py-2.5 px-3">TMT Masuk</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Belum ada data pegawai yang tersedia untuk ditampilkan dalam laporan.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => (
                <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{emp.employee_number}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{emp.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{emp.department}</td>
                  <td className="py-2.5 px-3 text-slate-700">{emp.position}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        emp.employment_status === 'TETAP'
                          ? 'bg-blue-100 text-blue-800'
                          : emp.employment_status === 'KONTRAK'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {emp.employment_status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">{emp.join_date}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        emp.employee_status === 'AKTIF'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {emp.employee_status}
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signatures (Visible on Print) */}
      <div className="hidden print:grid grid-cols-2 gap-12 pt-10 text-center text-xs">
        <div>
          <p className="text-slate-500">Mengetahui,</p>
          <p className="font-bold text-slate-900">Direktur Utama</p>
          <div className="h-20" />
          <p className="font-bold text-slate-900 underline">{director}</p>
          <p className="text-[10px] text-slate-500">PT Yuni Abadi Sejahtera</p>
        </div>
        <div>
          <p className="text-slate-500">Karawang, {new Date().toLocaleDateString('id-ID')}</p>
          <p className="font-bold text-slate-900">Kepala Bagian HRGA</p>
          <div className="h-20" />
          <p className="font-bold text-slate-900 underline">{hrHead}</p>
          <p className="text-[10px] text-slate-500">Departemen Kepegawaian & Umum</p>
        </div>
      </div>
    </div>
  );
};
