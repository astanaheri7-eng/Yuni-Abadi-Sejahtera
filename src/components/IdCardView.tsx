import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Printer,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Layers,
  RotateCw,
  QrCode,
  ShieldCheck,
  Check,
  Sliders,
  Sparkles,
  Users,
  Eye,
  FileText,
  Edit,
  Trash2,
  RotateCcw,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Employee, OrganizationSettings, User } from '../types';
import { LogoYAS } from './LogoYAS';

interface IdCardViewProps {
  employees: Employee[];
  settings?: OrganizationSettings;
  currentUser?: User | null;
}

export const IdCardView: React.FC<IdCardViewProps> = ({
  employees,
  settings,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('SEMUA');
  const [selectedDesign, setSelectedDesign] = useState<'yas_navy' | 'modern_clean' | 'industrial_dark'>('yas_navy');
  const [showBackSide, setShowBackSide] = useState(false);
  const [showQrCode, setShowQrCode] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [showEmergencyContact, setShowEmergencyContact] = useState(true);

  // Selected employee IDs for batch printing
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewSingleEmp, setPreviewSingleEmp] = useState<Employee | null>(null);

  // Configuration Modal States (Edit, Hapus, Kosongkan/Reset)
  const [cardConfig, setCardConfig] = useState({
    companyTitle: 'PT YUNI ABADI SEJAHTERA',
    companySubtitle: 'OUTSOURCING & GENERAL SERVICES KARAWANG',
    validUntil: 'Selama Berstatus Karyawan Aktif',
    emergencyPhone: '0267-8401234 / 0812-3456-7890',
    backNotes: '1. Kartu identitas ini wajib dikenakan selama jam kerja.\n2. Kartu ini milik PT YAS dan tidak dapat dipindahtangankan.\n3. Jika menemukan kartu ini, hubungi HRD: (0267) 8401234.',
  });
  const [isEditConfigModalOpen, setIsEditConfigModalOpen] = useState(false);
  const [isResetConfigModalOpen, setIsResetConfigModalOpen] = useState(false);
  const [editingBadgeEmp, setEditingBadgeEmp] = useState<Employee | null>(null);
  const [badgeForm, setBadgeForm] = useState({ displayName: '', displayPosition: '', displayDept: '', customValid: '' });
  const [customBadges, setCustomBadges] = useState<{ [empId: string]: { name?: string; position?: string; department?: string; validUntil?: string } }>({});

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchDept = departmentFilter === 'SEMUA' || emp.department === departmentFilter;
      const term = searchQuery.toLowerCase().trim();
      const matchSearch =
        !term ||
        emp.name.toLowerCase().includes(term) ||
        emp.employee_number.toLowerCase().includes(term) ||
        emp.position.toLowerCase().includes(term) ||
        (emp.nik && emp.nik.includes(term));
      return matchDept && matchSearch && emp.employee_status === 'AKTIF';
    });
  }, [employees, departmentFilter, searchQuery]);

  // Department options
  const departments = useMemo(() => {
    const list = Array.from(new Set(employees.map((e) => e.department))).filter(Boolean);
    return ['SEMUA', ...list];
  }, [employees]);

  // Select all / Deselect
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmployees.map((e) => e.id));
    }
  };

  const handleToggleSingleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Generate QR Code URL
  const getQrCodeUrl = (emp: Employee) => {
    const payload = `YAS-AUTH|${emp.employee_number}|${emp.name}|${emp.department}|${emp.position}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(payload)}`;
  };

  // Trigger Print
  const handlePrintSelected = () => {
    if (selectedIds.length === 0) {
      // If none selected, select all visible
      setSelectedIds(filteredEmployees.map((e) => e.id));
    }
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Active employees to print
  const employeesToPrint = useMemo(() => {
    if (selectedIds.length === 0) return filteredEmployees;
    return filteredEmployees.filter((e) => selectedIds.includes(e.id));
  }, [filteredEmployees, selectedIds]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
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
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Generator &amp; Cetak ID Card Pegawai
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencetakan kartu identitas fisik resmi PT YAS Karawang (CR80 Standard: 85.6mm x 54mm) satuan maupun lembar massal A4.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Top */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Format & Informasi Kartu */}
          <button
            type="button"
            onClick={() => setIsEditConfigModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
            title="Edit teks perusahaan, masa berlaku, dan kontak darurat di kartu"
          >
            <Edit className="h-4 w-4 text-blue-900" />
            <span>Edit Format Kartu</span>
          </button>

          {/* Kosongkan Pilihan Cetak jika ada yang dipilih */}
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-xs cursor-pointer"
              title="Kosongkan seluruh centang antrean cetak kartu"
            >
              <Trash2 className="h-4 w-4 text-rose-600" />
              <span>Kosongkan Pilihan ({selectedIds.length})</span>
            </button>
          )}

          {/* Reset Pengaturan Kartu ke Standar Pabrik */}
          <button
            type="button"
            onClick={() => setIsResetConfigModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
            title="Reset seluruh format dan tampilan ID Card ke setelan default pabrik"
          >
            <RotateCcw className="h-4 w-4 text-slate-600" />
            <span>Reset ke Default</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBackSide(!showBackSide)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <RotateCw className="h-4 w-4 text-blue-900" />
            <span>{showBackSide ? 'Lihat Sisi Depan' : 'Lihat Sisi Belakang'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrintSelected}
            style={{
              backgroundColor: settings?.primary_color || '#001f4d',
              color: settings?.accent_color || '#f59e0b',
            }}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>
              {selectedIds.length > 0
                ? `Cetak ${selectedIds.length} Kartu Terpilih`
                : `Cetak Semua (${filteredEmployees.length} Kartu)`}
            </span>
          </button>
        </div>
      </div>

      {/* Control Panel Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs items-center">
          {/* Search */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pegawai, NIP, atau jabatan..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-blue-900 focus:outline-none"
            />
          </div>

          {/* Department Filter */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <span className="font-bold text-slate-700 shrink-0">Departemen:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 font-semibold text-slate-800 focus:border-blue-900 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Design Style Selector */}
          <div className="lg:col-span-5 flex flex-wrap items-center justify-end gap-2">
            <span className="font-bold text-slate-700 shrink-0">Gaya Kartu:</span>
            {[
              { id: 'yas_navy', label: 'YAS Emas-Navy' },
              { id: 'modern_clean', label: 'Clean White' },
              { id: 'industrial_dark', label: 'Dark Metal' },
            ].map((design) => (
              <button
                key={design.id}
                type="button"
                onClick={() => setSelectedDesign(design.id as any)}
                className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                  selectedDesign === design.id
                    ? 'bg-blue-950 text-amber-300 border-blue-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {design.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Checkboxes & Bulk Selection */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={showQrCode}
                onChange={(e) => setShowQrCode(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer"
              />
              <span>Tampilkan QR Code Verifikasi</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={showBarcode}
                onChange={(e) => setShowBarcode(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer"
              />
              <span>Tampilkan Barcode NIP</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={showEmergencyContact}
                onChange={(e) => setShowEmergencyContact(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer"
              />
              <span>Kontak Darurat di Sisi Belakang</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
            >
              {selectedIds.length === filteredEmployees.length
                ? 'Batalkan Pilih Semua'
                : `Pilih Semua (${filteredEmployees.length})`}
            </button>
            <span className="rounded-full bg-blue-100 text-blue-950 font-bold px-2.5 py-0.5 text-[11px]">
              {selectedIds.length} Terpilih
            </span>
          </div>
        </div>
      </div>

      {/* Grid of ID Cards (Interactive UI) */}
      {filteredEmployees.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center no-print shadow-xs">
          <CreditCard className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Belum Ada Data Pegawai untuk Dicetak ID Card</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Database pegawai saat ini kosong atau tidak ada pegawai yang cocok dengan filter. Tambahkan data pegawai terlebih dahulu pada menu Data Pegawai.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 no-print">
          {filteredEmployees.map((emp) => {
          const isSelected = selectedIds.includes(emp.id);

          return (
            <div
              key={emp.id}
              className={`rounded-3xl border transition-all relative group bg-white shadow-xs p-4 flex flex-col items-center ${
                isSelected
                  ? 'border-blue-900 ring-2 ring-blue-900/30'
                  : 'border-slate-200 hover:shadow-md'
              }`}
            >
              {/* Checkbox Selector Top Left */}
              <button
                type="button"
                onClick={() => handleToggleSingleSelect(emp.id)}
                className={`absolute top-4 left-4 h-6 w-6 rounded-lg border flex items-center justify-center transition-all z-10 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-900 border-blue-900 text-amber-300'
                    : 'bg-white/90 border-slate-300 text-transparent hover:border-blue-900'
                }`}
              >
                <Check className="h-4 w-4" />
              </button>

              {/* Flip Button Top Right */}
              <button
                type="button"
                onClick={() => setPreviewSingleEmp(emp)}
                title="Lihat Pratinjau Penuh"
                className="absolute top-4 right-4 h-6 w-6 rounded-lg bg-white/90 border border-slate-200 text-slate-600 hover:text-blue-950 flex items-center justify-center transition-all z-10 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>

              {/* ID Card Box Representation (Standard Aspect Ratio 85.6mm x 54mm) */}
              <div
                className={`w-[220px] h-[350px] rounded-2xl overflow-hidden shadow-lg border relative flex flex-col transition-all ${
                  selectedDesign === 'yas_navy'
                    ? 'bg-white border-blue-950/20 text-slate-900'
                    : selectedDesign === 'industrial_dark'
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {!showBackSide ? (
                  /* ===================================== */
                  /* SISI DEPAN (FRONT SIDE)               */
                  /* ===================================== */
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div
                      className="p-3 text-center text-white relative transition-colors"
                      style={{
                        backgroundColor:
                          selectedDesign === 'industrial_dark'
                            ? '#0f172a'
                            : settings?.primary_color || '#001f4d',
                      }}
                    >
                      <div
                        className="h-1 w-full absolute top-0 left-0"
                        style={{ backgroundColor: settings?.accent_color || '#f59e0b' }}
                      />
                      <LogoYAS
                        size="sm"
                        variant="light"
                        customLogoUrl={settings?.custom_logo_data || settings?.logo_url}
                        customAppName={settings?.organization_name || settings?.company_name}
                        customTagline="KARTU TANDA PENGENAL"
                        shape={settings?.logo_shape}
                      />
                    </div>

                    {/* Photo Container */}
                    <div className="flex flex-col items-center pt-3 px-3 flex-1">
                      <div
                        className="h-20 w-20 rounded-xl overflow-hidden border-2 shadow-md bg-slate-100 mb-2 relative group-hover:scale-105 transition-transform"
                        style={{ borderColor: settings?.primary_color || '#001f4d' }}
                      >
                        {emp.photo ? (
                          <img
                            src={emp.photo}
                            alt={emp.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-blue-950 text-xl font-black text-amber-300">
                            {emp.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Name & Position */}
                      <h4 className="font-black text-xs text-center leading-tight line-clamp-1">
                        {emp.name}
                      </h4>
                      <p
                        className="text-[10px] font-extrabold mt-0.5 text-center truncate w-full"
                        style={{
                          color:
                            selectedDesign === 'industrial_dark'
                              ? '#38bdf8'
                              : settings?.primary_color || '#001f4d',
                        }}
                      >
                        {emp.position}
                      </p>
                      <p className="text-[9px] font-semibold text-slate-400 text-center truncate w-full">
                        {emp.department}
                      </p>

                      <div className="my-1.5 h-px w-full bg-slate-200/80" />

                      {/* Metadata rows */}
                      <div className="w-full text-[9px] space-y-0.5 text-slate-600">
                        <div className="flex justify-between">
                          <span className="text-slate-400">NIP:</span>
                          <strong className="font-mono text-slate-800">{emp.employee_number}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Status:</span>
                          <span className="font-bold text-emerald-700">{emp.employment_status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Wilayah:</span>
                          <span>Karawang</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Bar / Barcode */}
                    <div className="p-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
                      {showBarcode ? (
                        <div className="flex flex-col items-center w-full">
                          {/* Simulated SVG Barcode */}
                          <div className="flex items-center gap-0.5 h-6 w-full justify-center">
                            {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 3, 1, 2, 1, 4, 2].map((w, i) => (
                              <div
                                key={i}
                                className="bg-slate-900 h-full"
                                style={{ width: `${w * 1.5}px` }}
                              />
                            ))}
                          </div>
                          <span className="text-[8px] font-mono tracking-widest text-slate-500 mt-0.5">
                            {emp.employee_number}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[8px] text-center w-full font-bold text-slate-400">
                          PT YUNI ABADI SEJAHTERA
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ===================================== */
                  /* SISI BELAKANG (BACK SIDE)             */
                  /* ===================================== */
                  <div className="flex flex-col h-full p-3 justify-between text-[9px]">
                    <div className="space-y-1.5">
                      <div className="text-center border-b pb-1 font-extrabold uppercase tracking-wider text-[8px] text-slate-500">
                        Ketentuan Penggunaan Kartu
                      </div>
                      <ol className="list-decimal list-inside space-y-0.5 text-slate-600 text-[8px] leading-tight">
                        <li>Kartu ini adalah tanda pengenal resmi pegawai PT Yuni Abadi Sejahtera.</li>
                        <li>Wajib dikenakan selama jam kerja di lingkungan kantor dan pabrik.</li>
                        <li>Jika menemukan kartu ini, harap hubungi HRD: (0267) 845-6789.</li>
                      </ol>

                      {showEmergencyContact && (
                        <div className="rounded-lg bg-slate-100 p-1.5 space-y-0.5 text-[8px]">
                          <span className="font-bold text-slate-700 block">Kontak Darurat:</span>
                          <p className="truncate text-slate-600">Telp: 0812-9988-7766 (HRGA Klari)</p>
                        </div>
                      )}
                    </div>

                    {/* QR Code Verification */}
                    {showQrCode && (
                      <div className="flex flex-col items-center border-t pt-1.5">
                        <img
                          src={getQrCodeUrl(emp)}
                          alt="QR Code"
                          className="h-16 w-16 rounded-md border border-slate-200 bg-white p-0.5"
                        />
                        <span className="text-[7px] text-slate-400 font-semibold mt-0.5">
                          Scan untuk Verifikasi Otentikasi
                        </span>
                      </div>
                    )}

                    {/* Sign Box */}
                    <div className="text-center pt-1 border-t text-[8px] text-slate-400">
                      <p>Klari, Karawang</p>
                      <p className="font-bold text-slate-700">PT YUNI ABADI SEJAHTERA</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Single Card Action Buttons */}
              <div className="w-full flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-mono text-slate-400 truncate">
                  {emp.employee_number}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedIds([emp.id]);
                    setTimeout(() => window.print(), 150);
                  }}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold text-blue-900 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Cetak</span>
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* ==================================================== */}
      {/* PRINT-ONLY AREA: LEMBAR CETAK A4 MASSAL             */}
      {/* ==================================================== */}
      <div className="hidden print:block" id="print-sheet-a4">
        <div className="p-4 text-center border-b pb-2 mb-4">
          <h2 className="font-bold text-sm uppercase">
            LEMBAR CETAK ID CARD RESMI PT YUNI ABADI SEJAHTERA KARAWANG
          </h2>
          <p className="text-[10px] text-slate-500">
            Standar Cetak CR80 • Ukuran 85.6mm x 54mm • Siap Potong
          </p>
        </div>

        {/* Multi-card Grid for A4 Paper (8 cards per sheet) */}
        <div className="grid grid-cols-2 gap-6 p-2">
          {employeesToPrint.map((emp) => (
            <div
              key={emp.id}
              className="w-[85.6mm] h-[54mm] border-2 border-dashed border-slate-400 p-2 flex flex-row items-center gap-3 rounded-lg overflow-hidden bg-white text-slate-900 page-break-inside-avoid"
              style={{ pageBreakInside: 'avoid' }}
            >
              {/* Photo */}
              <div className="h-20 w-16 rounded-md overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                {emp.photo ? (
                  <img src={emp.photo} alt={emp.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-950 text-white font-bold">
                    {emp.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-[9px] space-y-0.5">
                <LogoYAS size="sm" showSubtitle={false} />
                <h4 className="font-bold text-xs truncate leading-tight mt-1">{emp.name}</h4>
                <p className="text-blue-900 font-bold truncate">{emp.position}</p>
                <p className="text-slate-500 truncate">{emp.department}</p>
                <div className="h-px bg-slate-200 my-1" />
                <p className="font-mono text-[8px]">NIP: {emp.employee_number}</p>
                <p className="text-[8px] text-slate-400">PT YUNI ABADI SEJAHTERA - KARAWANG</p>
              </div>

              {/* QR */}
              {showQrCode && (
                <div className="shrink-0 flex flex-col items-center">
                  <img src={getQrCodeUrl(emp)} alt="QR" className="h-12 w-12" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODAL PREVIEW SATUAN DUA SISI                        */}
      {/* ==================================================== */}
      {previewSingleEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl space-y-5 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-900" />
                Pratinjau Dua Sisi: {previewSingleEmp.name}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewSingleEmp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Side-by-side Preview */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 bg-slate-100 rounded-2xl">
              {/* Front */}
              <div className="w-[200px] h-[320px] rounded-2xl bg-white shadow-md border overflow-hidden flex flex-col text-center">
                <div
                  className="p-2.5 text-white"
                  style={{ backgroundColor: settings?.primary_color || '#001f4d' }}
                >
                  <LogoYAS size="sm" variant="light" />
                </div>
                <div className="p-3 flex-1 flex flex-col items-center">
                  <div className="h-16 w-16 rounded-xl border border-blue-900 overflow-hidden mb-2">
                    {previewSingleEmp.photo ? (
                      <img
                        src={previewSingleEmp.photo}
                        alt="Foto"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-blue-950 text-white flex items-center justify-center font-bold">
                        {previewSingleEmp.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-xs truncate w-full">{previewSingleEmp.name}</h4>
                  <p className="text-[10px] text-blue-900 font-bold">{previewSingleEmp.position}</p>
                  <p className="text-[9px] text-slate-500">{previewSingleEmp.department}</p>
                  <p className="text-[8px] font-mono text-slate-400 mt-2">
                    {previewSingleEmp.employee_number}
                  </p>
                </div>
                <span className="text-[8px] bg-slate-50 py-1 text-slate-400 font-bold border-t">
                  TAMPAK DEPAN
                </span>
              </div>

              {/* Back */}
              <div className="w-[200px] h-[320px] rounded-2xl bg-white shadow-md border overflow-hidden flex flex-col p-3 text-center justify-between">
                <div>
                  <p className="font-bold text-[9px] uppercase text-blue-950">
                    PT YUNI ABADI SEJAHTERA
                  </p>
                  <p className="text-[8px] text-slate-500">Klari, Karawang - Jawa Barat</p>
                  <div className="h-px bg-slate-200 my-2" />
                  <p className="text-[8px] text-slate-600 leading-tight">
                    Kartu ini sah jika digunakan oleh pemilik bersangkutan.
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <img
                    src={getQrCodeUrl(previewSingleEmp)}
                    alt="QR"
                    className="h-16 w-16 border p-0.5 rounded-lg"
                  />
                  <span className="text-[7px] text-slate-400 mt-1">Verifikasi Digital</span>
                </div>

                <span className="text-[8px] bg-slate-50 py-1 text-slate-400 font-bold border-t">
                  TAMPAK BELAKANG
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewSingleEmp(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-600"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedIds([previewSingleEmp.id]);
                  setTimeout(() => window.print(), 150);
                }}
                className="px-5 py-2 rounded-xl bg-blue-900 text-amber-300 font-bold shadow-md hover:bg-blue-950 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Kartu Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
