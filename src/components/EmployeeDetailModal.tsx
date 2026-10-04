import React, { useState } from 'react';
import {
  X,
  User,
  Building,
  Briefcase,
  GraduationCap,
  Users,
  FileText,
  History,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Download,
  Trash2,
  Upload,
  Printer,
  Edit,
  Shield,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { Employee, User as UserType, DocumentType } from '../types';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  currentUser: UserType;
  onEdit: (emp: Employee) => void;
  onPrintIdCard: (emp: Employee) => void;
  onPrintBiodata: (emp: Employee) => void;
  onUploadDocument: (employeeId: string, docData: any) => Promise<void>;
  onDeleteDocument: (employeeId: string, documentId: string) => Promise<void>;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  isOpen,
  onClose,
  employee,
  currentUser,
  onEdit,
  onPrintIdCard,
  onPrintBiodata,
  onUploadDocument,
  onDeleteDocument,
}) => {
  const [activeTab, setActiveTab] = useState<'biodata' | 'kepegawaian' | 'pendidikan' | 'keluarga' | 'dokumen' | 'riwayat'>('biodata');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('KTP');
  const [docName, setDocName] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !employee) return null;

  const isAktif = employee.employee_status === 'AKTIF';
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  // Handle Document Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      alert('Pilih file dokumen terlebih dahulu.');
      return;
    }

    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        await onUploadDocument(employee.id, {
          document_type: selectedDocType,
          document_name: docName || selectedDocType,
          file_name: docFile.name,
          file_size: docFile.size,
          file_type: docFile.type,
          file_data: reader.result as string,
        });
        setIsUploading(false);
        setShowUploadForm(false);
        setDocName('');
        setDocFile(null);
      };
      reader.readAsDataURL(docFile);
    } catch (err: any) {
      alert('Gagal mengunggah dokumen: ' + err.message);
      setIsUploading(false);
    }
  };

  const handleDownloadDoc = (doc: any) => {
    if (doc.file_data) {
      const link = document.createElement('a');
      link.href = doc.file_data;
      link.download = doc.file_name;
      link.click();
    } else {
      // Mock download dummy text
      const blob = new Blob([`Dokumen Resmi YAS HRIS: ${doc.document_name}\nPegawai: ${employee.name} (${employee.employee_number})\nTipe: ${doc.document_type}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.file_name || `${doc.document_type}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Profile Banner Header */}
        <div className="bg-gradient-yas p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl bg-white/10 p-2 text-slate-200 hover:bg-white/20 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Foto Pegawai */}
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-xl bg-slate-100 shrink-0">
              {employee.photo ? (
                <img
                  src={employee.photo}
                  alt={employee.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-900 text-3xl font-black text-amber-300">
                  {employee.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-mono text-xs font-bold text-amber-300 bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-amber-400/30">
                  {employee.employee_number}
                </span>
                {isAktif ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-extrabold text-emerald-300 border border-emerald-400/40">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    AKTIF
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-300 border border-rose-400/40">
                    NONAKTIF ({employee.deactivation_reason || 'Arsip'})
                  </span>
                )}
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-slate-200">
                  {employee.employment_status}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">{employee.name}</h2>
              <p className="text-xs sm:text-sm font-semibold text-blue-200">
                {employee.position} • <span className="text-amber-300">{employee.department}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-blue-100/80 pt-1">
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-amber-300" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-amber-300" />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-300" />
                  <span>{employee.regency || 'Karawang'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              {isAdmin && (
                <button
                  onClick={() => onEdit(employee)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-blue-950 hover:bg-amber-300 shadow-md transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit Data</span>
                </button>
              )}
              <button
                onClick={() => onPrintIdCard(employee)}
                className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/25 border border-white/20 transition-colors"
              >
                <CreditCard className="h-3.5 w-3.5 text-amber-300" />
                <span>Cetak ID Card</span>
              </button>
              <button
                onClick={() => onPrintBiodata(employee)}
                className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/25 border border-white/20 transition-colors"
              >
                <Printer className="h-3.5 w-3.5 text-slate-200" />
                <span>Cetak Biodata</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold gap-1">
          {[
            { id: 'biodata', label: 'Biodata Pribadi', icon: User },
            { id: 'kepegawaian', label: 'Data Kepegawaian', icon: Briefcase },
            { id: 'pendidikan', label: `Pendidikan (${employee.educations?.length || 0})`, icon: GraduationCap },
            { id: 'keluarga', label: `Keluarga (${employee.family_members?.length || 0})`, icon: Users },
            { id: 'dokumen', label: `Dokumen (${employee.documents?.length || 0})`, icon: FileText },
            { id: 'riwayat', label: `Riwayat Mutasi (${employee.history_logs?.length || 0})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 transition-all ${
                  isActive
                    ? 'bg-blue-900 text-amber-300 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[62vh] overflow-y-auto text-xs">
          {/* TAB 1: BIODATA */}
          {activeTab === 'biodata' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Informasi Data Diri
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nomor NIK KTP</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">{employee.nik}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nomor Kartu Keluarga (KK)</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">{employee.kk_number || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nama Panggilan</span>
                    <span className="font-bold text-slate-900">{employee.nickname || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tempat, Tanggal Lahir</span>
                    <span className="font-bold text-slate-900">
                      {employee.birth_place || 'Karawang'}, {employee.birth_date || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jenis Kelamin</span>
                    <span className="font-bold text-slate-900">{employee.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Agama</span>
                    <span className="font-bold text-slate-900">{employee.religion || 'Islam'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status Pernikahan</span>
                    <span className="font-bold text-slate-900">{employee.marital_status || 'Belum Menikah'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">No. Telepon / WhatsApp</span>
                    <span className="font-bold text-slate-900">{employee.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Alamat Email</span>
                    <span className="font-bold text-slate-900">{employee.email}</span>
                  </div>
                </div>
              </div>

              {/* Alamat */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Alamat & Domisili
                </h4>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
                  <p className="font-bold text-slate-900 text-xs">{employee.address || 'Alamat Belum Terisi'}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                    <div>RT/RW: <strong className="text-slate-800">{employee.rt || '-'}/{employee.rw || '-'}</strong></div>
                    <div>Desa/Kel: <strong className="text-slate-800">{employee.village || '-'}</strong></div>
                    <div>Kecamatan: <strong className="text-slate-800">{employee.district || '-'}</strong></div>
                    <div>Kabupaten: <strong className="text-slate-800">{employee.regency || 'Karawang'}</strong></div>
                    <div>Provinsi: <strong className="text-slate-800">{employee.province || 'Jawa Barat'}</strong></div>
                    <div>Kode Pos: <strong className="text-slate-800">{employee.postal_code || '-'}</strong></div>
                  </div>
                </div>
              </div>

              {/* Identitas Pajak & Bank */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Pajak, Jaminan Sosial & Rekening
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nomor NPWP</span>
                    <span className="font-mono font-bold text-slate-900">{employee.npwp || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">BPJS Kesehatan</span>
                    <span className="font-mono font-bold text-slate-900">{employee.bpjs_kesehatan || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">BPJS Ketenagakerjaan</span>
                    <span className="font-mono font-bold text-slate-900">{employee.bpjs_ketenagakerjaan || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Bank Pembayaran Gaji</span>
                    <span className="font-bold text-slate-900">{employee.bank_name || 'Bank Mandiri'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nomor Rekening</span>
                    <span className="font-mono font-bold text-slate-900">{employee.bank_account || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KEPEGAWAIAN */}
          {activeTab === 'kepegawaian' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Informasi Penugasan & Struktur
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ID / NIP Internal</span>
                    <span className="font-mono font-bold text-blue-950 text-xs">{employee.employee_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jabatan Resmi</span>
                    <span className="font-bold text-slate-900">{employee.position}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Departemen</span>
                    <span className="font-bold text-slate-900">{employee.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Divisi / Sub-Unit</span>
                    <span className="font-bold text-slate-900">{employee.division || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lokasi Penugasan</span>
                    <span className="font-bold text-slate-900">{employee.work_location || 'Karawang'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Atasan Langsung</span>
                    <span className="font-bold text-slate-900">{employee.direct_supervisor || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Level / Golongan</span>
                    <span className="font-bold text-slate-900">{employee.grade_level || 'Grade 2 - Staf'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tanggal Masuk (Join)</span>
                    <span className="font-bold text-slate-900">{employee.join_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tanggal Pengangkatan Tetap</span>
                    <span className="font-bold text-slate-900">{employee.appointment_date || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status Hubungan Kerja</span>
                    <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 font-bold text-blue-900 text-[11px]">
                      {employee.employment_status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status Kepegawaian</span>
                    <span className={`font-bold ${isAktif ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {employee.employee_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kontrak Detail jika ada */}
              {employee.contract_end && (
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                    Masa Kontrak Kerja (PKWT)
                  </h4>
                  <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-amber-950 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[10px] text-amber-700 block">Nomor Kontrak:</span>
                        <span className="font-mono font-bold">{employee.contract_number || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-700 block">Mulai Kontrak:</span>
                        <span className="font-bold">{employee.contract_start || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-700 block">Berakhir Kontrak:</span>
                        <span className="font-bold text-amber-900">{employee.contract_end}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Arsip Nonaktif jika ada */}
              {!isAktif && (
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-500 mb-3">
                    Riwayat Penonaktifan Pegawai
                  </h4>
                  <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-rose-950 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-rose-700 block">Tanggal Nonaktif:</span>
                        <span className="font-bold">{employee.deactivation_date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-700 block">Alasan Penonaktifan:</span>
                        <span className="font-bold">{employee.deactivation_reason}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-rose-700 block">Catatan Keterangan:</span>
                        <p className="font-medium text-xs">{employee.deactivation_note || 'Tidak ada catatan tambahan.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PENDIDIKAN */}
          {activeTab === 'pendidikan' && (
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Riwayat Jenjang Pendidikan
              </h4>
              {(!employee.educations || employee.educations.length === 0) ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
                  Belum ada data pendidikan formal yang diinput.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  {employee.educations.map((edu, idx) => (
                    <div key={edu.id || idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-blue-900 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            {edu.level}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{edu.institution}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Jurusan: <strong className="text-slate-800">{edu.major || '-'}</strong>
                        </p>
                        {edu.certificate_number && (
                          <p className="text-[10px] font-mono text-slate-400">
                            No Ijazah: {edu.certificate_number}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs font-bold text-slate-600">
                        {edu.start_year} - {edu.graduation_year}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: KELUARGA & KONTAK DARURAT */}
          {activeTab === 'keluarga' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Data Pasangan & Anak
                </h4>
                {(!employee.family_members || employee.family_members.length === 0) ? (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
                    Belum ada data anggota keluarga ditambahkan.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {employee.family_members.map((fam, idx) => (
                      <div key={fam.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{fam.name}</span>
                          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-900">
                            {fam.relationship}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">NIK: {fam.nik || '-'}</p>
                        <p className="text-[11px] text-slate-600">Pekerjaan: {fam.occupation || '-'}</p>
                        {fam.phone && <p className="text-[11px] text-slate-600">No HP: {fam.phone}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kontak Darurat */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Kontak Darurat
                </h4>
                {(!employee.emergency_contacts || employee.emergency_contacts.length === 0) ? (
                  <div className="p-4 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
                    Belum ada kontak darurat.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {employee.emergency_contacts.map((em, idx) => (
                      <div key={em.id || idx} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 text-xs">{em.name}</span>
                          <span className="rounded-md bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                            {em.relationship}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-amber-900 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {em.phone}
                        </p>
                        {em.address && <p className="text-[11px] text-amber-800">{em.address}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DOKUMEN PEGAWAI */}
          {activeTab === 'dokumen' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Berkas & Dokumen Pegawai
                  </h4>
                  <p className="text-[11px] text-slate-500">KTP, KK, NPWP, Ijazah, Kontrak Kerja, SK Pengangkatan.</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-3 py-1.5 font-bold text-amber-300 hover:bg-blue-950 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Upload Dokumen</span>
                  </button>
                )}
              </div>

              {/* Upload Form Accordion */}
              {showUploadForm && (
                <form onSubmit={handleUploadSubmit} className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                  <h5 className="font-bold text-blue-950 text-xs">Unggah Dokumen Baru</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jenis Dokumen</label>
                      <select
                        value={selectedDocType}
                        onChange={(e) => setSelectedDocType(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                      >
                        <option value="KTP">KTP Asli</option>
                        <option value="KK">Kartu Keluarga (KK)</option>
                        <option value="NPWP">Kartu NPWP</option>
                        <option value="BPJS_KESEHATAN">BPJS Kesehatan</option>
                        <option value="BPJS_KETENAGAKERJAAN">BPJS Ketenagakerjaan</option>
                        <option value="IJAZAH">Ijazah Terakhir</option>
                        <option value="TRANSKRIP">Transkrip Nilai</option>
                        <option value="SERTIFIKAT">Sertifikat Keahlian</option>
                        <option value="KONTRAK_KERJA">Surat Kontrak PKWT</option>
                        <option value="SURAT_PENGANGKATAN">SK Pengangkatan</option>
                        <option value="SURAT_KETERANGAN">Surat Keterangan</option>
                        <option value="LAINNYA">Dokumen Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Judul / Keterangan Dokumen</label>
                      <input
                        type="text"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        placeholder="Contoh: KTP Asli Andi"
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pilih File (PDF, JPG, PNG)</label>
                      <input
                        type="file"
                        required
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-1 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadForm(false)}
                      className="rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="rounded-xl bg-blue-900 px-4 py-1.5 text-xs font-bold text-amber-300 hover:bg-blue-950 disabled:opacity-50"
                    >
                      {isUploading ? 'Mengunggah...' : 'Simpan Dokumen'}
                    </button>
                  </div>
                </form>
              )}

              {/* Documents List */}
              {(!employee.documents || employee.documents.length === 0) ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
                  <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="font-semibold">Belum ada dokumen yang diunggah untuk pegawai ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {employee.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-900 font-bold text-xs">
                          {doc.document_type.slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{doc.document_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {doc.file_name} • {Math.round((doc.file_size || 102400) / 1024)} KB
                          </p>
                          <span className="text-[9px] text-slate-500">
                            Diunggah oleh {doc.uploaded_by} • {new Date(doc.uploaded_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownloadDoc(doc)}
                          className="p-1.5 text-blue-900 hover:bg-blue-100 rounded-lg"
                          title="Unduh Dokumen"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus dokumen ${doc.document_name}?`)) {
                                onDeleteDocument(employee.id, doc.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg"
                            title="Hapus Dokumen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: RIWAYAT PERUBAHAN & MUTASI */}
          {activeTab === 'riwayat' && (
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Histori Mutasi, Promosi & Status
              </h4>
              {(!employee.history_logs || employee.history_logs.length === 0) ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
                  Belum ada log riwayat mutasi untuk pegawai ini.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {employee.history_logs.map((log) => (
                    <div key={log.id} className="relative space-y-1">
                      <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-blue-900 ring-4 ring-white" />
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{log.action}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-slate-700 text-xs">{log.new_value}</p>
                      {log.old_value && (
                        <p className="text-[11px] text-slate-400">Sebelumnya: {log.old_value}</p>
                      )}
                      {log.reason && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                          Alasan: {log.reason}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">Oleh: {log.created_by}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-slate-100 bg-slate-50 p-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-900 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
