import React, { useState } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  FileSpreadsheet,
  Download,
  Printer,
  Eye,
  Edit,
  UserX,
  UserCheck,
  Trash2,
  CreditCard,
  Building,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileDown,
  Calendar,
  AlertCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Employee, User } from '../types';

interface EmployeeListViewProps {
  employees: Employee[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  isLoading: boolean;
  currentUser: User;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearchChange: (q: string) => void;
  onFilterChange: (filters: {
    status?: string;
    department?: string;
    gender?: string;
    employment_status?: string;
  }) => void;
  searchQuery: string;
  activeFilters: {
    status?: string;
    department?: string;
    gender?: string;
    employment_status?: string;
  };
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onViewEmployee: (emp: Employee) => void;
  onEditEmployee: (emp: Employee) => void;
  onPrintIdCard: (emp: Employee) => void;
  onPrintBiodata: (emp: Employee) => void;
  onDeactivateEmployee: (emp: Employee) => void;
  onActivateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (emp: Employee) => void;
  onResetEmployees?: (mode: 'empty' | 'sample') => void;
  onBatchDelete?: (ids: string[]) => void;
}

export const EmployeeListView: React.FC<EmployeeListViewProps> = ({
  employees,
  totalCount,
  currentPage,
  totalPages,
  limit,
  isLoading,
  currentUser,
  onPageChange,
  onLimitChange,
  onSearchChange,
  onFilterChange,
  searchQuery,
  activeFilters,
  onOpenAddModal,
  onOpenImportModal,
  onViewEmployee,
  onEditEmployee,
  onPrintIdCard,
  onPrintBiodata,
  onDeactivateEmployee,
  onActivateEmployee,
  onDeleteEmployee,
  onResetEmployees,
  onBatchDelete,
}) => {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [resetConfirmWord, setResetConfirmWord] = useState('');

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isAdmin = currentUser.role === 'ADMIN' || isSuperAdmin;

  const departments = [
    'Operasional',
    'Keuangan & Akuntansi',
    'SDM & Umum',
    'IT & Sistem Informasi',
    'Pemasaran & Kemitraan',
    'Logistik & Distribusi',
  ];

  const employmentStatuses = ['TETAP', 'KONTRAK', 'MAGANG', 'OUTSOURCING', 'HARIAN'];

  // Export to Excel / CSV
  const handleExport = (format: 'xlsx' | 'csv') => {
    if (!employees || employees.length === 0) {
      alert('Tidak ada data pegawai untuk diexport.');
      return;
    }

    const exportData = employees.map((emp, idx) => ({
      No: idx + 1,
      'ID Pegawai': emp.employee_number,
      NIK: emp.nik,
      'Nama Lengkap': emp.name,
      'Nama Panggilan': emp.nickname || '',
      Gender: emp.gender,
      'No HP': emp.phone,
      Email: emp.email,
      Jabatan: emp.position,
      Departemen: emp.department,
      'Status Kepegawaian': emp.employment_status,
      'Status Kerja': emp.employee_status,
      'Tanggal Masuk': emp.join_date,
      'Pendidikan Terakhir': emp.last_education || '',
      Alamat: `${emp.address || ''}, ${emp.regency || 'Karawang'}`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pegawai YAS');

    const fileName = `Data_Pegawai_YAS_Karawang_${new Date().toISOString().split('T')[0]}.${format}`;
    XLSX.writeFile(workbook, fileName, { bookType: format });
  };

  return (
    <div className="space-y-5">
      {/* Header section with page title & action buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bank Data Pegawai
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-900">
              {totalCount} Terdata
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Yuni Abadi Sejahtera • Kabupaten Karawang
          </p>
        </div>

        {/* Action Button Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              id="btn-tambah-pegawai-main"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-bold text-amber-300 shadow-md hover:bg-blue-950 transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Tambah Pegawai</span>
            </button>
          )}

          {isAdmin && (
            <button
              id="btn-import-excel"
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
              title="Import Data dari file Excel atau CSV"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span className="hidden sm:inline">Import Excel</span>
            </button>
          )}

          {/* Reset / Kosongkan Data Pegawai (Super Admin) */}
          {isSuperAdmin && (
            <button
              id="btn-reset-pegawai"
              type="button"
              onClick={() => {
                setResetConfirmWord('');
                setShowResetModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50/90 px-3.5 py-2.5 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-100 hover:border-rose-400 transition-colors cursor-pointer"
              title="Kosongkan atau Reset Data Pegawai ke Data Awal Pabrik"
            >
              <RotateCcw className="h-4 w-4 text-rose-600" />
              <span>Reset / Kosongkan</span>
            </button>
          )}

          {/* Tombol Hapus Massal jika ada yang dicentang */}
          {isAdmin && selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setShowBatchDeleteModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-all cursor-pointer animate-pulse"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus ({selectedIds.length}) Terpilih</span>
            </button>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleExport('xlsx')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
              title="Export ke Excel (.xlsx)"
            >
              <Download className="h-4 w-4 text-blue-600" />
              <span className="hidden md:inline">Excel</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
              title="Export ke format CSV"
            >
              <FileDown className="h-4 w-4 text-slate-600" />
              <span className="hidden md:inline">CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar & Filter Toggle Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main search field */}
          <div className="relative flex-1">
            <input
              type="text"
              id="input-search-employees"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari nama, NIK, ID pegawai, jabatan, atau nomor HP..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-blue-700 focus:bg-white focus:outline-none transition-all"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
              showFilterPanel || Object.values(activeFilters).some(Boolean)
                ? 'border-blue-900 bg-blue-50 text-blue-950'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-4 w-4 text-blue-900" />
            <span>Filter Data</span>
            {Object.values(activeFilters).filter((v) => v && v !== 'SEMUA').length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900 text-[10px] font-bold text-amber-300">
                {Object.values(activeFilters).filter((v) => v && v !== 'SEMUA').length}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilterPanel && (
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Status Aktif / Nonaktif */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Kepegawaian</label>
              <select
                value={activeFilters.status || 'SEMUA'}
                onChange={(e) => onFilterChange({ ...activeFilters, status: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="AKTIF">🟢 Pegawai Aktif</option>
                <option value="NONAKTIF">⚪ Pegawai Nonaktif (Arsip)</option>
              </select>
            </div>

            {/* Departemen */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Departemen</label>
              <select
                value={activeFilters.department || 'SEMUA'}
                onChange={(e) => onFilterChange({ ...activeFilters, department: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
              >
                <option value="SEMUA">Semua Departemen</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Pekerjaan (Tetap / Kontrak) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Hubungan Kerja</label>
              <select
                value={activeFilters.employment_status || 'SEMUA'}
                onChange={(e) => onFilterChange({ ...activeFilters, employment_status: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
              >
                <option value="SEMUA">Semua Jenis</option>
                {employmentStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                value={activeFilters.gender || 'SEMUA'}
                onChange={(e) => onFilterChange({ ...activeFilters, gender: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
              >
                <option value="SEMUA">Semua Gender</option>
                <option value="LAKI-LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>

            {/* Reset Filters */}
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                onClick={() =>
                  onFilterChange({
                    status: 'SEMUA',
                    department: 'SEMUA',
                    gender: 'SEMUA',
                    employment_status: 'SEMUA',
                  })
                }
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Semua Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-900 border-r-transparent align-[-0.125em]" />
            <p className="mt-2 text-xs font-semibold">Memuat data pegawai YAS...</p>
          </div>
        ) : employees.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-900 mb-4">
              <AlertCircle className="h-8 w-8 text-blue-900/70" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Belum Ada Data Pegawai</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tidak ada data yang cocok dengan kriteria pencarian atau belum ada data tersimpan.
            </p>
            {isAdmin && (
              <button
                onClick={onOpenAddModal}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-blue-950 shadow-md transition-all"
              >
                <UserPlus className="h-4 w-4" />
                + Tambah Pegawai Pertama
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                    {isAdmin && (
                      <th className="py-3.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-800 cursor-pointer"
                          checked={employees.length > 0 && selectedIds.length === employees.length}
                          onChange={() => {
                            if (selectedIds.length === employees.length) {
                              setSelectedIds([]);
                            } else {
                              setSelectedIds(employees.map((e) => e.id));
                            }
                          }}
                          title="Pilih Semua Pegawai di Halaman Ini"
                        />
                      </th>
                    )}
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">Foto & NIK</th>
                    <th className="py-3.5 px-4">Nama Lengkap</th>
                    <th className="py-3.5 px-4">Jabatan</th>
                    <th className="py-3.5 px-4">Departemen</th>
                    <th className="py-3.5 px-4">Status Kerja</th>
                    <th className="py-3.5 px-4">Tanggal Masuk</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {employees.map((emp, index) => {
                    const rowNumber = (currentPage - 1) * limit + index + 1;
                    const isAktif = emp.employee_status === 'AKTIF';

                    return (
                      <tr
                        key={emp.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !isAktif ? 'bg-slate-50/40 text-slate-500' : ''
                        } ${selectedIds.includes(emp.id) ? 'bg-blue-50/60' : ''}`}
                      >
                        {/* Checkbox */}
                        {isAdmin && (
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-800 cursor-pointer"
                              checked={selectedIds.includes(emp.id)}
                              onChange={() => {
                                if (selectedIds.includes(emp.id)) {
                                  setSelectedIds(selectedIds.filter((id) => id !== emp.id));
                                } else {
                                  setSelectedIds([...selectedIds, emp.id]);
                                }
                              }}
                            />
                          </td>
                        )}

                        {/* No */}
                        <td className="py-3 px-4 text-center text-slate-400 font-semibold">
                          {rowNumber}
                        </td>

                        {/* Foto & NIK */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                              {emp.photo ? (
                                <img
                                  src={emp.photo}
                                  alt={emp.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-blue-900 font-bold text-amber-300 text-xs">
                                  {emp.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="block font-mono text-[11px] font-bold text-blue-950">
                                {emp.employee_number}
                              </span>
                              <span className="block text-[10px] text-slate-400 font-mono">
                                NIK: {emp.nik}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Nama */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-xs">
                            {emp.name}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span>{emp.gender === 'PEREMPUAN' ? '♀ Perempuan' : '♂ Laki-laki'}</span>
                            <span>•</span>
                            <span>{emp.phone}</span>
                          </div>
                        </td>

                        {/* Jabatan */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{emp.position}</div>
                          <div className="text-[10px] text-slate-400">{emp.grade_level || 'Staf'}</div>
                        </td>

                        {/* Departemen */}
                        <td className="py-3 px-4">
                          <div className="inline-flex items-center gap-1 font-semibold text-slate-700">
                            <Building className="h-3 w-3 text-slate-400" />
                            {emp.department}
                          </div>
                          <div className="text-[10px] text-slate-400">{emp.work_location || 'Karawang'}</div>
                        </td>

                        {/* Status Hubungan Kerja */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              emp.employment_status === 'TETAP'
                                ? 'bg-emerald-100 text-emerald-800'
                                : emp.employment_status === 'KONTRAK'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {emp.employment_status}
                          </span>
                          {emp.contract_end && (
                            <div className="text-[9px] text-amber-700 mt-0.5">
                              s/d {emp.contract_end}
                            </div>
                          )}
                        </td>

                        {/* Tanggal Masuk */}
                        <td className="py-3 px-4 text-slate-600">
                          {emp.join_date}
                        </td>

                        {/* Status Aktif / Nonaktif */}
                        <td className="py-3 px-4 text-center">
                          {isAktif ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              AKTIF
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                              NONAKTIF
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Lihat Detail */}
                            <button
                              onClick={() => onViewEmployee(emp)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                              title="Lihat Biodata Lengkap"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Edit (Admin/Super Admin) */}
                            {isAdmin && (
                              <button
                                onClick={() => onEditEmployee(emp)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                                title="Edit Data Pegawai"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}

                            {/* Cetak Kartu ID Card */}
                            <button
                              onClick={() => onPrintIdCard(emp)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                              title="Cetak ID Card Pegawai (QR Code)"
                            >
                              <CreditCard className="h-4 w-4 text-blue-800" />
                            </button>

                            {/* Cetak Biodata Lengkap */}
                            <button
                              onClick={() => onPrintBiodata(emp)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                              title="Cetak Lembar Biodata Resmi"
                            >
                              <Printer className="h-4 w-4" />
                            </button>

                            {/* Nonaktifkan / Aktifkan Kembali */}
                            {isAdmin && isAktif && (
                              <button
                                onClick={() => onDeactivateEmployee(emp)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                                title="Nonaktifkan Pegawai (Arsip)"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            )}

                            {isAdmin && !isAktif && (
                              <button
                                onClick={() => onActivateEmployee(emp)}
                                className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Aktifkan Kembali Pegawai"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}

                            {/* Hapus Permanen (Super Admin Only) */}
                            {isSuperAdmin && (
                              <button
                                onClick={() => onDeleteEmployee(emp)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                title="Hapus Permanen dari Database"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>Tampilkan:</span>
                <select
                  value={limit}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>data per halaman</span>
              </div>

              <div className="flex items-center gap-3">
                <span>
                  Halaman <strong className="text-slate-900">{currentPage}</strong> dari{' '}
                  <strong className="text-slate-900">{totalPages || 1}</strong> ({totalCount} total pegawai)
                </span>

                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL RESET / KOSONGKAN DATA PEGAWAI */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Reset / Kosongkan Data Pegawai
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kelola basis data pegawai PT YAS Karawang
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Opsi 1: Reset ke Data Standar Pabrik */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 transition-all hover:bg-blue-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                      <RotateCcw className="h-4 w-4 text-blue-700" />
                      Reset ke Data Standar Pabrik (Default YAS)
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Memulihkan bank data pegawai menjadi 15 data pegawai resmi default (Divisi Operasional, SDM, Keuangan, dsb.) lengkap dengan riwayat &amp; dokumen standar.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Konfirmasi: Kembalikan seluruh data pegawai ke data standar bawaan pabrik YAS Karawang?')) {
                        if (onResetEmployees) onResetEmployees('sample');
                        setShowResetModal(false);
                      }
                    }}
                    className="shrink-0 rounded-xl bg-blue-900 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-blue-950 shadow-xs cursor-pointer"
                  >
                    Reset ke Standar
                  </button>
                </div>
              </div>

              {/* Opsi 2: Kosongkan Seluruh Data (0 Data) */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 transition-all hover:bg-rose-50">
                <div>
                  <h4 className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                    <Trash2 className="h-4 w-4 text-rose-600" />
                    Kosongkan Seluruh Data Pegawai (Wipe Out)
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Menghapus <strong>seluruh data pegawai hingga 0 data</strong>. Tindakan ini memerlukan konfirmasi ketik di bawah.
                  </p>

                  <div className="mt-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Ketik <span className="font-mono text-rose-700 bg-rose-100 px-1 rounded">KOSONGKAN</span> untuk konfirmasi:
                    </label>
                    <input
                      type="text"
                      value={resetConfirmWord}
                      onChange={(e) => setResetConfirmWord(e.target.value)}
                      placeholder="KOSONGKAN"
                      className="w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-rose-600 focus:outline-none"
                    />
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      disabled={resetConfirmWord.trim() !== 'KOSONGKAN'}
                      onClick={() => {
                        if (onResetEmployees) onResetEmployees('empty');
                        setShowResetModal(false);
                      }}
                      className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Kosongkan Semua Data Sekarang
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS MASSAL TERPILIH */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Hapus {selectedIds.length} Pegawai Terpilih?
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini akan menghapus data terpilih secara permanen.
                </p>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-600 leading-relaxed">
              Anda telah memilih <strong>{selectedIds.length}</strong> pegawai untuk dihapus dari sistem YAS HRIS. Apakah Anda yakin ingin melanjutkan penghapusan massal?
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onBatchDelete) onBatchDelete(selectedIds);
                  setSelectedIds([]);
                  setShowBatchDeleteModal(false);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-md cursor-pointer"
              >
                Ya, Hapus {selectedIds.length} Data Terpilih
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
