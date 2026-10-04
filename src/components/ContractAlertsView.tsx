import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileCheck,
  UserCheck,
  UserMinus,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Employee, User as CurrentUser } from '../types';
import { api } from '../services/api';

interface ContractAlertsViewProps {
  currentUser: CurrentUser;
  onOpenEmployeeDetail?: (emp: Employee) => void;
  onDeactivateEmployee?: (emp: Employee) => void;
}

export const ContractAlertsView: React.FC<ContractAlertsViewProps> = ({
  currentUser,
  onOpenEmployeeDetail,
  onDeactivateEmployee,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRange, setFilterRange] = useState<'ALL' | '30' | '60' | '90' | 'EXPIRED'>('30');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Extend Modal State
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [newContractStart, setNewContractStart] = useState('');
  const [newContractEnd, setNewContractEnd] = useState('');
  const [newContractNumber, setNewContractNumber] = useState('');
  const [makePermanent, setMakePermanent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManage = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await api.getEmployees({ limit: 200, status: 'AKTIF' });
      if (res.success && res.data) {
        // Filter only employees with contract_end or employment_status !== 'TETAP'
        const withContracts = res.data.filter((e) => e.contract_end || e.employment_status === 'KONTRAK' || e.employment_status === 'MAGANG');
        setEmployees(withContracts);
      }
    } catch (err) {
      console.error('Failed to load contract alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateDaysLeft = (contractEnd?: string) => {
    if (!contractEnd) return 999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(contractEnd);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Categorize
  const categorized = employees.map((emp) => {
    const days = calculateDaysLeft(emp.contract_end);
    let category: 'EXPIRED' | '30' | '60' | '90' | 'SAFE' = 'SAFE';
    if (days < 0) category = 'EXPIRED';
    else if (days <= 30) category = '30';
    else if (days <= 60) category = '60';
    else if (days <= 90) category = '90';
    return { emp, days, category };
  });

  const countExpired = categorized.filter((c) => c.category === 'EXPIRED').length;
  const count30 = categorized.filter((c) => c.category === '30').length;
  const count60 = categorized.filter((c) => c.category === '60').length;
  const count90 = categorized.filter((c) => c.category === '90').length;

  const filteredItems = categorized.filter(({ emp, days, category }) => {
    if (filterRange === '30' && category !== '30' && category !== 'EXPIRED') return false;
    if (filterRange === '60' && category !== '60') return false;
    if (filterRange === '90' && category !== '90') return false;
    if (filterRange === 'EXPIRED' && category !== 'EXPIRED') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.employee_number.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.position.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenExtend = (emp: Employee) => {
    setSelectedEmp(emp);
    const today = new Date().toISOString().split('T')[0];
    const currentEnd = emp.contract_end || today;
    const nextYear = new Date(new Date(currentEnd).setFullYear(new Date(currentEnd).getFullYear() + 1))
      .toISOString()
      .split('T')[0];

    setNewContractStart(currentEnd);
    setNewContractEnd(nextYear);
    setNewContractNumber(`PKWT-EXT/YAS/${new Date().getFullYear()}/${emp.employee_number}`);
    setMakePermanent(false);
    setExtendModalOpen(true);
  };

  const handleSaveExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    try {
      setIsSubmitting(true);
      const payload: Partial<Employee> = makePermanent
        ? {
            employment_status: 'TETAP',
            contract_end: undefined,
            contract_number: undefined,
          }
        : {
            contract_start: newContractStart,
            contract_end: newContractEnd,
            contract_number: newContractNumber,
          };

      const res = await api.updateEmployee(selectedEmp.id, payload);
      if (res.success) {
        showToast(
          makePermanent
            ? `Pegawai ${selectedEmp.name} berhasil diangkat menjadi Pegawai Tetap (PKWTT).`
            : `Masa kontrak ${selectedEmp.name} berhasil diperpanjang hingga ${newContractEnd}.`
        );
        setExtendModalOpen(false);
        loadData();
      } else {
        alert(res.message || 'Gagal memperbarui status kontrak.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-[#001f4d] p-4 text-xs font-bold text-amber-300 shadow-2xl border border-amber-400/40">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="h-6 w-6 text-amber-600" />
            Monitoring Masa Kontrak Pegawai (PKWT)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau tanggal jatuh tempo kontrak kerja, evaluasi masa perpanjangan, dan pengangkatan tetap PT YAS Karawang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">
            Perlu Tindakan Cepat:{' '}
            <span className="text-rose-600 font-extrabold">{count30 + countExpired}</span> Pegawai
          </span>
        </div>
      </div>

      {/* Filter Cards (Interactive Metric Tabs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterRange('30')}
          className={`rounded-2xl p-4 text-left transition-all border ${
            filterRange === '30'
              ? 'border-amber-400 bg-amber-50 shadow-md ring-2 ring-amber-400/20'
              : 'border-slate-200/80 bg-white hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase">&lt; 30 Hari (Mendesak)</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-1">{count30}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Segera lakukan evaluasi</span>
        </button>

        <button
          onClick={() => setFilterRange('60')}
          className={`rounded-2xl p-4 text-left transition-all border ${
            filterRange === '60'
              ? 'border-sky-400 bg-sky-50 shadow-md ring-2 ring-sky-400/20'
              : 'border-slate-200/80 bg-white hover:border-sky-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-800 uppercase">31 - 60 Hari</span>
            <Clock className="h-4 w-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-sky-800 mt-1">{count60}</p>
          <span className="text-[10px] text-sky-700 font-semibold">Masa persiapan review</span>
        </button>

        <button
          onClick={() => setFilterRange('90')}
          className={`rounded-2xl p-4 text-left transition-all border ${
            filterRange === '90'
              ? 'border-blue-400 bg-blue-50 shadow-md ring-2 ring-blue-400/20'
              : 'border-slate-200/80 bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 uppercase">61 - 90 Hari</span>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-900 mt-1">{count90}</p>
          <span className="text-[10px] text-blue-700 font-semibold">Monitoring terjadwal</span>
        </button>

        <button
          onClick={() => setFilterRange('EXPIRED')}
          className={`rounded-2xl p-4 text-left transition-all border ${
            filterRange === 'EXPIRED'
              ? 'border-rose-400 bg-rose-50 shadow-md ring-2 ring-rose-400/20'
              : 'border-slate-200/80 bg-white hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase">Lewat Tempo / Habis</span>
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700 mt-1">{countExpired}</p>
          <span className="text-[10px] text-rose-700 font-semibold">Perlu SK / Tindakan</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            id="search-contract-alerts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pegawai, NIP, jabatan, departemen..."
            className="w-full rounded-xl border border-slate-300 py-2 pl-10 pr-4 text-xs focus:border-blue-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterRange('ALL')}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
              filterRange === 'ALL'
                ? 'bg-blue-900 text-amber-300'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tampilkan Semua ({categorized.length})
          </button>
        </div>
      </div>

      {/* Employee List with Contract Status */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
          Memuat jadwal masa kontrak kerja pegawai...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-2" />
          <p className="text-sm font-bold text-slate-800">Tidak ada pegawai dalam kategori ini</p>
          <p className="text-xs text-slate-400 mt-1">
            Semua kontrak pegawai dalam kondisi aman atau sesuai filter yang dipilih.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(({ emp, days, category }) => {
            const isUrgent = days <= 30 && days >= 0;
            const isExpired = days < 0;

            return (
              <div
                key={emp.id}
                className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isExpired
                    ? 'border-rose-300 bg-rose-50/40'
                    : isUrgent
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {/* Employee Profile & Contract Details */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 font-bold text-sm shadow-xs ${
                      isExpired
                        ? 'bg-rose-600 text-white'
                        : isUrgent
                        ? 'bg-amber-500 text-blue-950'
                        : 'bg-blue-900 text-amber-300'
                    }`}
                  >
                    {emp.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900">{emp.name}</h3>
                      <span className="font-mono text-[11px] font-bold text-slate-500">
                        ({emp.employee_number})
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isExpired
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isUrgent
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isExpired
                          ? `Lewat ${Math.abs(days)} Hari Lalu`
                          : days === 0
                          ? 'Hari Terakhir!'
                          : `Sisa ${days} Hari`}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-0.5">
                      <span className="font-semibold text-slate-800">{emp.position}</span> • {emp.department} •{' '}
                      <span className="text-[11px] font-medium text-slate-500">Status: {emp.employment_status}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-2 font-mono">
                      <span>Mulai: {emp.contract_start || emp.join_date || '-'}</span>
                      <span className="font-bold text-slate-800">
                        Jatuh Tempo: {emp.contract_end || 'Belum diisi'}
                      </span>
                      {emp.contract_number && <span>No: {emp.contract_number}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {canManage && (
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60">
                    <button
                      onClick={() => handleOpenExtend(emp)}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-3.5 py-2 text-xs font-bold text-amber-300 shadow-sm hover:bg-blue-950 transition-colors"
                    >
                      <FileCheck className="h-4 w-4" />
                      Perpanjang / Angkat
                    </button>

                    {onDeactivateEmployee && (
                      <button
                        onClick={() => onDeactivateEmployee(emp)}
                        className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                        title="Selesai Masa Kontrak & Arsipkan"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                        Selesai
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Extend / Make Permanent */}
      {extendModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-900" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Perpanjangan Kontrak / Pengangkatan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pegawai: {selectedEmp.name} ({selectedEmp.employee_number})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExtendModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExtend} className="space-y-4 text-xs">
              {/* Option Switch */}
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={makePermanent}
                    onChange={(e) => setMakePermanent(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <span className="font-bold text-slate-800">
                      Angkat Menjadi Karyawan Tetap (PKWTT)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Hilangkan tanggal jatuh tempo kontrak dan ubah status ke Tetap secara resmi.
                    </p>
                  </div>
                </label>
              </div>

              {!makePermanent && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mulai Berlaku</label>
                      <input
                        type="date"
                        value={newContractStart}
                        onChange={(e) => setNewContractStart(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Berakhir Pada</label>
                      <input
                        type="date"
                        value={newContractEnd}
                        onChange={(e) => setNewContractEnd(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-blue-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor Kontrak Baru</label>
                    <input
                      type="text"
                      value={newContractNumber}
                      onChange={(e) => setNewContractNumber(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExtendModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-900 px-5 py-2 text-xs font-bold text-amber-300 shadow-md hover:bg-blue-950 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
