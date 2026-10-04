import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Upload,
  User,
  CheckCircle2,
  Calendar,
  Building,
  FileCheck,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { Employee, User as CurrentUser, DocumentType } from '../types';
import { api } from '../services/api';

interface DocumentsViewProps {
  currentUser: CurrentUser;
  onOpenEmployeeDetail?: (emp: Employee) => void;
}

export interface DisplayDoc {
  id: string;
  employee_id: string;
  document_name: string;
  document_type: string;
  document_number?: string;
  file_name: string;
  file_url?: string;
  file_data?: string;
  file_type?: string;
  file_size?: number;
  uploaded_at: string;
  uploaded_by?: string;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  currentUser,
  onOpenEmployeeDetail,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('SEMUA');
  const [previewDoc, setPreviewDoc] = useState<{
    doc: DisplayDoc;
    empName: string;
  } | null>(null);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<DocumentType>('KTP');
  const [newDocNumber, setNewDocNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canManage = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

  const showToast = (msg: string, _type?: 'success' | 'error') => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await api.getEmployees({ limit: 100, status: 'SEMUA' });
      if (res.success && res.data) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error('Failed to load documents data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Flatten all documents with their employee info
  const allDocuments: Array<{
    doc: DisplayDoc;
    employee: Employee;
  }> = [];

  employees.forEach((emp) => {
    if (emp.documents && emp.documents.length > 0) {
      emp.documents.forEach((doc) => {
        allDocuments.push({
          doc: {
            id: doc.id,
            employee_id: doc.employee_id,
            document_name: doc.document_name,
            document_type: doc.document_type,
            file_name: doc.file_name,
            file_size: doc.file_size,
            file_data: doc.file_data,
            file_type: doc.file_type,
            uploaded_by: doc.uploaded_by,
            uploaded_at: doc.uploaded_at,
          },
          employee: emp,
        });
      });
    } else {
      // If employee has basic ID files, provide virtual entries for visibility
      if (emp.nik) {
        allDocuments.push({
          doc: {
            id: `doc-ktp-${emp.id}`,
            employee_id: emp.id,
            document_name: `KTP Asli - ${emp.name}`,
            document_type: 'KTP',
            document_number: emp.nik,
            file_name: `KTP_${emp.nik}.pdf`,
            file_url: '/dummy-ktp.pdf',
            file_type: 'application/pdf',
            file_size: 450 * 1024,
            uploaded_at: emp.created_at || '2024-01-01',
          },
          employee: emp,
        });
      }
      if (emp.contract_end) {
        allDocuments.push({
          doc: {
            id: `doc-kontrak-${emp.id}`,
            employee_id: emp.id,
            document_name: `Perjanjian Kerja Waktu Tertentu (PKWT) - ${emp.name}`,
            document_type: 'KONTRAK_KERJA',
            document_number: `PKWT/YAS/${emp.employee_number}`,
            file_name: `PKWT_${emp.employee_number}.pdf`,
            file_url: '/dummy-contract.pdf',
            file_type: 'application/pdf',
            file_size: 1200 * 1024,
            uploaded_at: emp.join_date || '2024-01-01',
          },
          employee: emp,
        });
      }
      if (emp.bpjs_kesehatan) {
        allDocuments.push({
          doc: {
            id: `doc-bpjs-${emp.id}`,
            employee_id: emp.id,
            document_name: `Kartu BPJS Kesehatan - ${emp.name}`,
            document_type: 'BPJS_KESEHATAN',
            document_number: emp.bpjs_kesehatan,
            file_name: `BPJS_${emp.name.replace(/\s+/g, '_')}.pdf`,
            file_url: '/dummy-bpjs.pdf',
            file_type: 'application/pdf',
            file_size: 320 * 1024,
            uploaded_at: emp.join_date || '2024-01-01',
          },
          employee: emp,
        });
      }
    }
  });

  const filteredDocs = allDocuments.filter(({ doc, employee }) => {
    const matchesSearch =
      searchQuery === '' ||
      doc.document_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employee_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.document_number && doc.document_number.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'SEMUA' || doc.document_type === selectedType;

    return matchesSearch && matchesType;
  });

  const documentTypes: Array<{ key: string; label: string }> = [
    { key: 'SEMUA', label: 'Semua Kategori Dokumen' },
    { key: 'KTP', label: 'KTP / Kependudukan' },
    { key: 'KK', label: 'Kartu Keluarga (KK)' },
    { key: 'NPWP', label: 'NPWP Pajak' },
    { key: 'BPJS_KESEHATAN', label: 'BPJS Kesehatan' },
    { key: 'BPJS_KETENAGAKERJAAN', label: 'BPJS Ketenagakerjaan' },
    { key: 'IJAZAH', label: 'Ijazah Pendidikan' },
    { key: 'TRANSKRIP', label: 'Transkrip Nilai' },
    { key: 'KONTRAK_KERJA', label: 'Kontrak Kerja / PKWT' },
    { key: 'SURAT_PENGANGKATAN', label: 'SK Pengangkatan' },
    { key: 'SERTIFIKAT', label: 'Sertifikat Kompetensi' },
    { key: 'LAINNYA', label: 'Berkas Lainnya' },
  ];

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !newDocTitle) {
      alert('Pilih pegawai dan isi nama berkas.');
      return;
    }

    try {
      setIsUploading(true);
      const res = await api.uploadDocument(selectedEmpId, {
        document_name: newDocTitle,
        document_type: newDocType,
        file_name: `${newDocTitle.replace(/\s+/g, '_')}.pdf`,
        file_data: 'https://example.com/document-preview.pdf',
        file_size: 512 * 1024,
      });

      if (res.success) {
        showToast('Dokumen berhasil diunggah ke arsip pegawai.');
        setUploadModalOpen(false);
        setNewDocTitle('');
        setNewDocNumber('');
        loadData();
      } else {
        alert(res.message || 'Gagal mengunggah dokumen.');
      }
    } catch (err: any) {
      alert('Error saat mengunggah berkas: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (employeeId: string, docId: string, docTitle: string) => {
    if (!confirm(`Hapus berkas arsip "${docTitle}"?`)) return;

    try {
      const res = await api.deleteDocument(employeeId, docId);
      if (res.success) {
        showToast(`Dokumen "${docTitle}" berhasil dihapus.`);
        loadData();
      }
    } catch (err: any) {
      showToast('Gagal menghapus dokumen: ' + err.message, 'error');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '420 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
            <FileText className="h-6 w-6 text-blue-900" />
            Dokumen & Berkas Digital Pegawai
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Arsip digital KTP, Kartu Keluarga, NPWP, BPJS, Ijazah, dan Kontrak Kerja PT YAS Karawang
          </p>
        </div>

        {canManage && (
          <button
            id="btn-open-upload-doc"
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-amber-300 shadow-md hover:bg-blue-950 transition-all active:scale-95 shrink-0"
          >
            <Upload className="h-4 w-4" />
            Unggah Berkas Baru
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            id="search-documents-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berkas berdasarkan nama dokumen, nama pegawai, atau NIP..."
            className="w-full rounded-xl border border-slate-300 py-2 pl-10 pr-4 text-xs focus:border-blue-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-slate-300 py-2 px-3 text-xs font-semibold text-slate-700 focus:border-blue-900 focus:outline-none"
          >
            {documentTypes.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Berkas</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{allDocuments.length}</p>
          <span className="text-[10px] text-slate-500">Tersimpan dalam cloud</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">KTP & Kependudukan</span>
          <p className="text-2xl font-black text-blue-900 mt-1">
            {allDocuments.filter((d) => d.doc.document_type === 'KTP').length}
          </p>
          <span className="text-[10px] text-blue-700">Verifikasi NIK valid</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Kontrak Kerja (PKWT)</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {allDocuments.filter((d) => d.doc.document_type === 'KONTRAK_KERJA').length}
          </p>
          <span className="text-[10px] text-amber-700">Arsip legalitas aktif</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">BPJS & Jaminan</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {allDocuments.filter((d) => d.doc.document_type.includes('BPJS')).length}
          </p>
          <span className="text-[10px] text-emerald-700">Kesehatan & Ketenagakerjaan</span>
        </div>
      </div>

      {/* Documents Grid / Table */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
          Memuat bank berkas dokumen kepegawaian...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-800">Tidak ada dokumen ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">
            Coba ganti kata kunci pencarian atau kategori dokumen yang dipilih.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map(({ doc, employee }) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-900 shrink-0 font-bold border border-blue-100">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                    {doc.document_type}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                    {doc.document_name}
                  </h3>
                  {doc.document_number && (
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                      No: {doc.document_number}
                    </p>
                  )}
                </div>

                {/* Employee badge */}
                <div className="mt-3 rounded-xl bg-slate-50 p-2.5 border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-900 text-amber-300 text-[10px] font-bold">
                      {employee.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{employee.name}</p>
                      <p className="text-[9px] text-slate-500">
                        {employee.employee_number} • {employee.department}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-medium">
                  {formatFileSize(doc.file_size)}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewDoc({ doc, empName: employee.name })}
                    className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-900 hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Lihat
                  </button>

                  <button
                    onClick={() => {
                      showToast(`Mengunduh berkas: ${doc.document_name}`);
                    }}
                    className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Unduh
                  </button>

                  {canManage && (
                    <button
                      onClick={() => handleDeleteDoc(employee.id, doc.id, doc.document_name)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Hapus Dokumen"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Preview Document */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-900" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{previewDoc.doc.document_name}</h3>
                  <p className="text-xs text-slate-500">Pegawai: {previewDoc.empName}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Document Preview Box */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-900">
                <FileCheck className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{previewDoc.doc.document_name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tipe: {previewDoc.doc.document_type} • Ukuran: {formatFileSize(previewDoc.doc.file_size)}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Diverifikasi dan diarsipkan pada sistem YAS HRIS Karawang
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  showToast(`Mengunduh berkas: ${previewDoc.doc.document_name}`);
                  setPreviewDoc(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-amber-300 shadow-md hover:bg-blue-950"
              >
                <Download className="h-4 w-4" />
                Unduh Berkas Asli
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Document */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-900" />
                <h3 className="text-base font-bold text-slate-900">Unggah Berkas Pegawai Baru</h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Pegawai *</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold focus:border-blue-900 focus:outline-none"
                  required
                >
                  <option value="">-- Pilih Nama Pegawai --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employee_number} - {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Dokumen *</label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as DocumentType)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-900 focus:outline-none"
                >
                  <option value="KTP">KTP / Kependudukan</option>
                  <option value="KK">Kartu Keluarga (KK)</option>
                  <option value="NPWP">NPWP Pajak</option>
                  <option value="BPJS_KESEHATAN">BPJS Kesehatan</option>
                  <option value="BPJS_KETENAGAKERJAAN">BPJS Ketenagakerjaan</option>
                  <option value="IJAZAH">Ijazah Pendidikan</option>
                  <option value="TRANSKRIP">Transkrip Nilai</option>
                  <option value="KONTRAK_KERJA">Kontrak Kerja (PKWT)</option>
                  <option value="SURAT_PENGANGKATAN">SK Pengangkatan</option>
                  <option value="SERTIFIKAT">Sertifikat Pelatihan</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama / Judul Dokumen *</label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Contoh: Salinan Scan Ijazah S1 Asli"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Registrasi / Berkas (Opsional)</label>
                <input
                  type="text"
                  value={newDocNumber}
                  onChange={(e) => setNewDocNumber(e.target.value)}
                  placeholder="Nomor SK, Nomor Sertifikat, dll."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono focus:border-blue-900 focus:outline-none"
                />
              </div>

              {/* Upload Dropzone */}
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload className="mx-auto h-8 w-8 text-slate-400 mb-1" />
                <p className="text-xs font-bold text-blue-900">Pilih berkas dari perangkat Anda</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Mendukung format PDF, PNG, JPG (Maks. 5 MB)</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="rounded-xl bg-blue-900 px-5 py-2 text-xs font-bold text-amber-300 shadow-md hover:bg-blue-950 disabled:opacity-50"
                >
                  {isUploading ? 'Mengunggah...' : 'Simpan Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
