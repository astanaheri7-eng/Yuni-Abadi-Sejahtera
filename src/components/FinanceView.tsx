import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  DollarSign,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Edit,
  Eye,
  RefreshCw,
  TrendingUp,
  Shield,
  Building,
  Calendar,
  X,
  ChevronDown,
  Layers,
  Check,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { PayrollRecord, FinanceSummary, OrganizationSettings, User } from '../types';
import { api } from '../services/api';
import { LogoYAS } from './LogoYAS';

interface FinanceViewProps {
  settings?: OrganizationSettings;
  currentUser?: User | null;
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const FinanceView: React.FC<FinanceViewProps> = ({ settings, currentUser }) => {
  const [selectedMonth, setSelectedMonth] = useState('Oktober');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [departmentFilter, setDepartmentFilter] = useState('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [deleteModalRecord, setDeleteModalRecord] = useState<PayrollRecord | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch Payroll Data
  const fetchPayrolls = async () => {
    try {
      setIsLoading(true);
      const res = await api.getPayrolls({
        month: selectedMonth,
        year: selectedYear,
        department: departmentFilter !== 'SEMUA' ? departmentFilter : undefined,
        q: searchQuery || undefined,
      });

      if (res.success) {
        setPayrolls(res.data || []);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err: any) {
      console.error('Failed to fetch payroll:', err);
      showToast('Gagal memuat data keuangan: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [selectedMonth, selectedYear, departmentFilter, searchQuery]);

  // Bulk generate
  const handleBulkGenerate = async () => {
    if (!confirm(`Generate / Segarkan ulang seluruh slip gaji untuk periode ${selectedMonth} ${selectedYear}?`)) {
      return;
    }
    try {
      setIsGenerating(true);
      const res = await api.bulkGeneratePayroll(selectedMonth, selectedYear);
      if (res.success) {
        showToast(res.message || 'Data penggajian berhasil diperbarui!');
        fetchPayrolls();
      }
    } catch (err: any) {
      alert('Gagal generate gaji: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Update Payroll
  const handleSavePayrollEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayroll) return;

    try {
      const res = await api.updatePayroll(editingPayroll.id, editingPayroll);
      if (res.success) {
        showToast(`Slip gaji ${editingPayroll.employee_name} berhasil diperbarui!`);
        setIsEditModalOpen(false);
        fetchPayrolls();
      } else {
        alert(res.message || 'Gagal menyimpan perubahan.');
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    }
  };

  // Delete Single Payroll Record
  const handleDeletePayroll = async () => {
    if (!deleteModalRecord) return;
    try {
      const res = await api.deletePayroll(deleteModalRecord.id);
      if (res.success) {
        showToast(`Slip gaji ${deleteModalRecord.employee_name} berhasil dihapus.`);
        setDeleteModalRecord(null);
        fetchPayrolls();
      } else {
        alert(res.message || 'Gagal menghapus data.');
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    }
  };

  // Reset or Clear Payroll for Period
  const handleResetPayroll = async (resetToDefault: boolean) => {
    try {
      const res = await api.clearPayroll({
        month: selectedMonth,
        year: selectedYear,
        resetToDefault,
      });
      if (res.success) {
        showToast(
          resetToDefault
            ? `Penggajian periode ${selectedMonth} ${selectedYear} berhasil direset ke standar UMK Karawang!`
            : `Seluruh data penggajian periode ${selectedMonth} ${selectedYear} telah dikosongkan.`
        );
        setResetModalOpen(false);
        fetchPayrolls();
      } else {
        alert(res.message || 'Gagal mereset data.');
      }
    } catch (err: any) {
      alert('Terjadi error: ' + err.message);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (payrolls.length === 0) {
      alert('Tidak ada data gaji untuk diekspor.');
      return;
    }

    const headers = [
      'No',
      'NIP',
      'Nama Pegawai',
      'Departemen',
      'Jabatan',
      'Status Kepegawaian',
      'Periode',
      'Gaji Pokok',
      'Tunjangan Jabatan',
      'Tunjangan Makan Transport',
      'Uang Lembur',
      'Bonus',
      'Gaji Kotor',
      'BPJS Kesehatan (1%)',
      'BPJS Ketenagakerjaan (3%)',
      'PPh 21',
      'Kasbon',
      'Total Potongan',
      'Gaji Bersih (THP)',
      'Status Bayar',
      'Bank',
      'No Rekening',
    ];

    const rows = payrolls.map((p, idx) => [
      idx + 1,
      `"${p.employee_number}"`,
      `"${p.employee_name}"`,
      `"${p.department}"`,
      `"${p.position}"`,
      `"${p.employment_status}"`,
      `"${p.period_month} ${p.period_year}"`,
      p.basic_salary,
      p.allowance_position,
      p.allowance_transport_meal,
      p.overtime_pay,
      p.bonus,
      p.gross_salary,
      p.deduction_bpjs_kesehatan,
      p.deduction_bpjs_ketenagakerjaan,
      p.deduction_tax_pph21,
      p.deduction_loan,
      p.total_deductions,
      p.net_salary,
      `"${p.payment_status}"`,
      `"${p.bank_name || 'Bank Mandiri'}"`,
      `"${p.bank_account || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Gaji_YAS_${selectedMonth}_${selectedYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Berkas rekap gaji berhasil diekspor!');
  };

  // Departments list
  const departments = useMemo(() => {
    const list = Array.from(new Set(payrolls.map((p) => p.department))).filter(Boolean);
    return ['SEMUA', ...list];
  }, [payrolls]);

  const formatRupiah = (val: number) => {
    return 'Rp ' + (val || 0).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-900 text-amber-300 p-4 shadow-2xl border border-amber-400/40 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-md transition-colors"
              style={{
                backgroundColor: settings?.primary_color || '#001f4d',
                color: settings?.accent_color || '#f59e0b',
              }}
            >
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Manajemen Keuangan &amp; Penggajian (Payroll)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengelolaan gaji pokok standar UMK Karawang, tunjangan resmi, potongan BPJS, lembur, dan pencetakan slip gaji PT YAS.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Top */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Ekspor Excel/CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4 text-blue-900" />
            <span>Cetak Rekapitulasi</span>
          </button>

          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-xs cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 text-rose-600" />
            <span>Kosongkan / Reset Gaji</span>
          </button>

          <button
            type="button"
            onClick={handleBulkGenerate}
            disabled={isGenerating}
            style={{
              backgroundColor: settings?.primary_color || '#001f4d',
              color: settings?.accent_color || '#f59e0b',
            }}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Menghitung...' : 'Generate / Hitung Gaji'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Gaji Bersih (THP) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Total Gaji Bersih (THP)
            </span>
            <p className="text-xl font-black text-slate-900">
              {formatRupiah(summary?.totalNetPayroll || 0)}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {summary?.paidCount || 0} dari {summary?.totalEmployees || 0} Pegawai Terbayar
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* 2. Total Anggaran Kotor */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Total Anggaran Kotor (Gross)
            </span>
            <p className="text-xl font-black text-blue-950">
              {formatRupiah(summary?.totalGrossPayroll || 0)}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold">
              Termasuk tunjangan &amp; lembur
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* 3. Total Potongan BPJS */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Total Iuran BPJS
            </span>
            <p className="text-xl font-black text-purple-900">
              {formatRupiah(summary?.totalBpjs || 0)}
            </p>
            <p className="text-[10px] text-purple-700 font-semibold">
              BPJS Kesehatan (1%) &amp; TK (3%)
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center">
            <Shield className="h-6 w-6" />
          </div>
        </div>

        {/* 4. Total Uang Lembur */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Biaya Lembur (Overtime)
            </span>
            <p className="text-xl font-black text-amber-900">
              {formatRupiah(summary?.totalOvertime || 0)}
            </p>
            <p className="text-[10px] text-amber-700 font-semibold">
              Kompensasi shift &amp; lembur pabrik
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Period Selection Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          {/* Period Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-900" />
              Periode Penggajian:
            </span>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-slate-300 p-2 font-bold text-slate-800 focus:border-blue-900 focus:outline-none"
            >
              {MONTH_NAMES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-xl border border-slate-300 p-2 font-bold text-slate-800 focus:border-blue-900 focus:outline-none"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <span className="text-slate-300">|</span>

            {/* Department Filter */}
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              Departemen:
            </span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border border-slate-300 p-2 font-semibold text-slate-800 focus:border-blue-900 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NIP, atau jabatan..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-blue-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Payroll Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-900 border-r-transparent" />
            <p className="text-xs font-semibold">Memuat rekapitulasi data gaji...</p>
          </div>
        ) : payrolls.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Wallet className="h-10 w-10 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-600">
              Belum ada data slip gaji untuk periode {selectedMonth} {selectedYear}.
            </p>
            <button
              onClick={handleBulkGenerate}
              className="px-4 py-2 rounded-xl bg-blue-900 text-amber-300 text-xs font-bold shadow-md hover:bg-blue-950 cursor-pointer"
            >
              Generate Gaji Otomatis Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Pegawai</th>
                  <th className="py-3 px-3">Gaji Pokok</th>
                  <th className="py-3 px-3">Tunjangan</th>
                  <th className="py-3 px-3">Lembur/Bonus</th>
                  <th className="py-3 px-3">Total Potongan</th>
                  <th className="py-3 px-3">Gaji Bersih (THP)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payrolls.map((p) => {
                  const totalAllowance =
                    (p.allowance_position || 0) +
                    (p.allowance_transport_meal || 0) +
                    (p.allowance_attendance || 0);

                  const totalAdditions = (p.overtime_pay || 0) + (p.bonus || 0);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Pegawai Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">{p.employee_name}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                          <span className="font-bold text-blue-900">{p.employee_number}</span>
                          <span>•</span>
                          <span>{p.position}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-600">{p.department}</span>
                        </div>
                      </td>

                      {/* Gaji Pokok */}
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {formatRupiah(p.basic_salary)}
                      </td>

                      {/* Tunjangan */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-emerald-800">
                          {formatRupiah(totalAllowance)}
                        </span>
                        <p className="text-[10px] text-slate-400">Jab, Makan, Hadir</p>
                      </td>

                      {/* Lembur & Bonus */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-amber-800">
                          {formatRupiah(totalAdditions)}
                        </span>
                        <p className="text-[10px] text-slate-400">Lembur + Bonus</p>
                      </td>

                      {/* Potongan */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-rose-700">
                          -{formatRupiah(p.total_deductions)}
                        </span>
                        <p className="text-[10px] text-slate-400">BPJS &amp; Pajak</p>
                      </td>

                      {/* Gaji Bersih */}
                      <td className="py-3.5 px-3">
                        <span className="font-black text-sm text-blue-950">
                          {formatRupiah(p.net_salary)}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {p.bank_name || 'Mandiri'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            p.payment_status === 'DIBAYAR'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.payment_status === 'DIBAYAR' ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Clock className="h-3 w-3 text-amber-600" />
                          )}
                          {p.payment_status}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedSlip(p)}
                            title="Lihat & Cetak Slip Gaji"
                            className="p-1.5 rounded-lg border border-slate-200 text-blue-900 hover:bg-blue-50 font-bold transition-all cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingPayroll({ ...p });
                              setIsEditModalOpen(true);
                            }}
                            title="Edit Komponen Gaji"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition-all cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: CETAK & LIHAT SLIP GAJI FORMAL PT YAS       */}
      {/* ==================================================== */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 my-6 animate-in zoom-in-95 text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#001f4d] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-amber-400" />
                <h3 className="font-extrabold text-sm">
                  Slip Gaji Resmi Pegawai - {selectedSlip.period_month} {selectedSlip.period_year}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-amber-300 transition-all cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Cetak Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSlip(null)}
                  className="rounded-lg p-1 text-slate-300 hover:bg-blue-900 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Formal Payslip Body (Printable Area) */}
            <div className="p-8 space-y-6 bg-white" id="printable-payslip">
              {/* Kop Perusahaan */}
              <div className="flex items-center justify-between border-b-2 border-blue-950 pb-4">
                <LogoYAS
                  size="md"
                  variant="dark"
                  customLogoUrl={settings?.custom_logo_data || settings?.logo_url}
                  customAppName={settings?.organization_name || settings?.company_name}
                  customTagline={settings?.tagline}
                  shape={settings?.logo_shape}
                />
                <div className="text-right text-[10px] text-slate-500">
                  <p className="font-bold text-slate-900 uppercase">PT YUNI ABADI SEJAHTERA</p>
                  <p>Klari, Kabupaten Karawang - Jawa Barat</p>
                  <p>Telp: (0267) 845-6789 | Email: hrd@yuniabadisejahtera.co.id</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-0.5">
                <h2 className="text-base font-black tracking-wider uppercase text-blue-950">
                  SURAT BUKTI PEMBAYARAN GAJI (PAYSLIP)
                </h2>
                <p className="text-xs font-bold text-slate-600">
                  Periode: {selectedSlip.period_month} {selectedSlip.period_year}
                </p>
              </div>

              {/* Employee Metadata */}
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-28 text-slate-500 font-semibold">Nama Pegawai:</span>
                    <strong className="text-slate-900">{selectedSlip.employee_name}</strong>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500 font-semibold">Nomor Induk (NIP):</span>
                    <strong className="font-mono text-blue-950">{selectedSlip.employee_number}</strong>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500 font-semibold">Departemen:</span>
                    <span>{selectedSlip.department}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-28 text-slate-500 font-semibold">Jabatan:</span>
                    <strong className="text-slate-900">{selectedSlip.position}</strong>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500 font-semibold">Bank / Rekening:</span>
                    <span className="font-mono text-slate-800">
                      {selectedSlip.bank_name || 'Mandiri'} - {selectedSlip.bank_account || '1730005849302'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500 font-semibold">Status Transfer:</span>
                    <span className="font-bold text-emerald-700">DIBAYAR LUNAS</span>
                  </div>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 1. Komponen Pendapatan */}
                <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
                  <h4 className="font-extrabold text-blue-950 uppercase tracking-wider text-[11px] border-b pb-1">
                    A. Penerimaan (Earnings)
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span>Gaji Pokok (UMK Karawang)</span>
                      <span className="font-semibold">{formatRupiah(selectedSlip.basic_salary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tunjangan Jabatan</span>
                      <span className="font-semibold">{formatRupiah(selectedSlip.allowance_position)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tunjangan Makan &amp; Transport</span>
                      <span className="font-semibold">{formatRupiah(selectedSlip.allowance_transport_meal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tunjangan Kehadiran</span>
                      <span className="font-semibold">{formatRupiah(selectedSlip.allowance_attendance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uang Lembur (Overtime)</span>
                      <span className="font-semibold">{formatRupiah(selectedSlip.overtime_pay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus / Insentif Kinerja</span>
                      <span className="font-semibold">{formatRupiah(selectedSlip.bonus)}</span>
                    </div>
                    <div className="border-t pt-1.5 flex justify-between font-black text-slate-900">
                      <span>Total Penghasilan Kotor</span>
                      <span className="text-blue-950">{formatRupiah(selectedSlip.gross_salary)}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Komponen Potongan */}
                <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
                  <h4 className="font-extrabold text-rose-900 uppercase tracking-wider text-[11px] border-b pb-1">
                    B. Potongan (Deductions)
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span>BPJS Kesehatan (1%)</span>
                      <span className="font-semibold text-rose-700">
                        {formatRupiah(selectedSlip.deduction_bpjs_kesehatan)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>BPJS TK JHT &amp; JP (3%)</span>
                      <span className="font-semibold text-rose-700">
                        {formatRupiah(selectedSlip.deduction_bpjs_ketenagakerjaan)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pajak Penghasilan PPh 21</span>
                      <span className="font-semibold text-rose-700">
                        {formatRupiah(selectedSlip.deduction_tax_pph21)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Potongan Kasbon / Pinjaman</span>
                      <span className="font-semibold text-rose-700">
                        {formatRupiah(selectedSlip.deduction_loan)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Potongan Lainnya</span>
                      <span className="font-semibold text-rose-700">
                        {formatRupiah(selectedSlip.deduction_other || 0)}
                      </span>
                    </div>
                    <div className="border-t pt-1.5 flex justify-between font-black text-slate-900">
                      <span>Total Potongan</span>
                      <span className="text-rose-700">-{formatRupiah(selectedSlip.total_deductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Take Home Pay Highlighting Box */}
              <div className="rounded-2xl bg-blue-950 text-white p-4 flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                    Total Penerimaan Bersih (Take Home Pay):
                  </span>
                  <p className="text-2xl font-black text-white">
                    {formatRupiah(selectedSlip.net_salary)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30">
                    ✓ VALID &amp; TERVERIFIKASI
                  </span>
                </div>
              </div>

              {/* Signatures & Footer */}
              <div className="pt-4 grid grid-cols-2 text-center text-xs">
                <div>
                  <p className="text-slate-500 mb-12">Penerima (Pegawai),</p>
                  <p className="font-bold underline text-slate-900">{selectedSlip.employee_name}</p>
                </div>

                <div>
                  <p className="text-slate-500 mb-1">Karawang, {selectedSlip.payment_date || '25 Oktober 2026'}</p>
                  <p className="text-slate-500 mb-10">Manager HRGA / Keuangan,</p>
                  <p className="font-bold underline text-slate-900">
                    {settings?.hr_head_name || 'WIDI'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: EDIT KOMPONEN GAJI INDIVIDUAL               */}
      {/* ==================================================== */}
      {isEditModalOpen && editingPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  Sesuaikan Komponen Gaji: {editingPayroll.employee_name}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  {editingPayroll.employee_number} • {editingPayroll.position}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePayrollEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gaji Pokok (Rp)</label>
                  <input
                    type="number"
                    value={editingPayroll.basic_salary}
                    onChange={(e) =>
                      setEditingPayroll({
                        ...editingPayroll,
                        basic_salary: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tunjangan Jabatan (Rp)</label>
                  <input
                    type="number"
                    value={editingPayroll.allowance_position}
                    onChange={(e) =>
                      setEditingPayroll({
                        ...editingPayroll,
                        allowance_position: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Uang Lembur (Rp)</label>
                  <input
                    type="number"
                    value={editingPayroll.overtime_pay}
                    onChange={(e) =>
                      setEditingPayroll({
                        ...editingPayroll,
                        overtime_pay: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bonus / Insentif (Rp)</label>
                  <input
                    type="number"
                    value={editingPayroll.bonus}
                    onChange={(e) =>
                      setEditingPayroll({
                        ...editingPayroll,
                        bonus: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Potongan Kasbon (Rp)</label>
                  <input
                    type="number"
                    value={editingPayroll.deduction_loan}
                    onChange={(e) =>
                      setEditingPayroll({
                        ...editingPayroll,
                        deduction_loan: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 font-semibold text-rose-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Pembayaran</label>
                  <select
                    value={editingPayroll.payment_status}
                    onChange={(e) =>
                      setEditingPayroll({
                        ...editingPayroll,
                        payment_status: e.target.value as any,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 font-bold"
                  >
                    <option value="DIBAYAR">DIBAYAR</option>
                    <option value="MENUNGGU">MENUNGGU</option>
                    <option value="PROSES">PROSES</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Penggajian</label>
                <input
                  type="text"
                  value={editingPayroll.notes || ''}
                  onChange={(e) =>
                    setEditingPayroll({
                      ...editingPayroll,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Misal: Penyesuaian lembur akhir bulan"
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-900 px-5 py-2 font-bold text-amber-300 hover:bg-blue-950 shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
