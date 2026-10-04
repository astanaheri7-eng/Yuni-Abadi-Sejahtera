import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  HardDrive,
  ShieldCheck,
  Server,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';

interface BackupViewProps {
  onRefreshData?: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({ onRefreshData }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<string>(
    localStorage.getItem('yas_last_backup') || 'Belum pernah diunduh'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [restoreJsonData, setRestoreJsonData] = useState<any>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadBackup = async () => {
    try {
      setIsDownloading(true);
      const res = await api.getBackupData();
      const jsonString = JSON.stringify(res, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const nowStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `backup_yas_hris_karawang_${nowStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const timeStr = new Date().toLocaleString('id-ID');
      setLastBackupTime(timeStr);
      localStorage.setItem('yas_last_backup', timeStr);
      showToast('Cadangan database berhasil diunduh dan disimpan.');
    } catch (err: any) {
      alert('Gagal mengunduh backup: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && (parsed.employees || parsed.users)) {
            setRestoreJsonData(parsed);
          } else {
            alert('File JSON tidak memiliki struktur database YAS HRIS yang valid.');
            setSelectedFile(null);
            setRestoreJsonData(null);
          }
        } catch (err) {
          alert('Format file JSON tidak valid atau rusak.');
          setSelectedFile(null);
          setRestoreJsonData(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoreJsonData) return;

    try {
      setIsRestoring(true);
      const res = await api.restoreDatabase(restoreJsonData);
      if (res.success) {
        showToast('Database berhasil dipulihkan secara menyeluruh.');
        setConfirmModalOpen(false);
        setSelectedFile(null);
        setRestoreJsonData(null);
        if (onRefreshData) onRefreshData();
      } else {
        alert(res.message || 'Gagal memulihkan database.');
      }
    } catch (err: any) {
      alert('Error saat pemulihan database: ' + err.message);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-[#001f4d] p-4 text-xs font-bold text-amber-300 shadow-2xl border border-amber-400/40">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Database className="h-6 w-6 text-blue-900" />
          Cadangan & Pemulihan Database (Backup & Restore)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Simpan salinan cadangan bank data pegawai, riwayat audit, dan akun sistem secara aman untuk mitigasi risiko
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
            <Server className="h-4 w-4" />
            <span>Format Penyimpanan</span>
          </div>
          <p className="text-lg font-black text-slate-900">JSON Schema v2.4</p>
          <p className="text-[10px] text-slate-500">Kompensasi penuh data relasional</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
            <ShieldCheck className="h-4 w-4" />
            <span>Keamanan Enkripsi</span>
          </div>
          <p className="text-lg font-black text-slate-900">TLS Protected</p>
          <p className="text-[10px] text-slate-500">Akses khusus peran Super Admin</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
            <Clock className="h-4 w-4" />
            <span>Terakhir Dicadangkan</span>
          </div>
          <p className="text-xs font-bold text-slate-800 truncate">{lastBackupTime}</p>
          <p className="text-[10px] text-slate-500">Disarankan rutin tiap akhir pekan</p>
        </div>
      </div>

      {/* Main Action Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Download Backup */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-900 font-bold">
              <Download className="h-6 w-6" />
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
              Unduh Cadangan Lengkap (Full Backup)
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mengunduh seluruh database sistem yang mencakup data pegawai aktif dan arsip, dokumen,
              riwayat perubahan (audit logs), akun pengguna, dan preferensi organisasi dalam file <span className="font-mono font-bold text-blue-900">.json</span>.
            </p>
            <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Isi paket cadangan:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Seluruh berkas biodata, NIK, dan BPJS</li>
                <li>Riwayat mutasi & kenaikan status</li>
                <li>Konfigurasi dan log autentikasi</li>
              </ul>
            </div>
          </div>

          <button
            id="btn-download-backup"
            onClick={handleDownloadBackup}
            disabled={isDownloading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-900 py-3 text-xs font-bold text-amber-300 shadow-md hover:bg-blue-950 transition-all disabled:opacity-50"
          >
            {isDownloading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isDownloading ? 'Menyiapkan Arsip...' : 'Unduh File Cadangan (.JSON)'}
          </button>
        </div>

        {/* 2. Restore Database */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 font-bold">
              <Upload className="h-6 w-6" />
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
              Pemulihan Database (Restore)
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pulihkan sistem menggunakan berkas cadangan JSON yang valid. Seluruh data saat ini akan
              disinkronisasikan kembali sesuai dengan isi file arsip yang Anda unggah.
            </p>

            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-4 text-center bg-slate-50/60">
              <FileJson className="mx-auto h-8 w-8 text-slate-400 mb-1" />
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
                id="file-backup-upload"
              />
              <label
                htmlFor="file-backup-upload"
                className="cursor-pointer text-xs font-bold text-blue-900 hover:underline block"
              >
                Pilih Berkas Cadangan (.JSON)
              </label>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {selectedFile ? selectedFile.name : 'Belum ada file dipilih'}
              </span>
            </div>

            {restoreJsonData && (
              <div className="rounded-xl bg-emerald-50 p-3 text-xs border border-emerald-200 text-emerald-900">
                <p className="font-bold">File Valid Terdeteksi:</p>
                <p className="text-[11px] mt-0.5">
                  Pegawai: {restoreJsonData.employees?.length || 0} • Pengguna: {restoreJsonData.users?.length || 0} • Log Audit: {restoreJsonData.audit_logs?.length || 0}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setConfirmModalOpen(true)}
            disabled={!restoreJsonData || isRestoring}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-xs font-bold text-slate-900 shadow-md hover:bg-amber-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isRestoring ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <HardDrive className="h-4 w-4" />
            )}
            {isRestoring ? 'Memulihkan Data...' : 'Mulai Pemulihan Data'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && restoreJsonData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-8 w-8 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Pemulihan Database</h3>
                <p className="text-slate-500 text-xs">Tindakan ini akan menimpa data saat ini</p>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              Anda akan memulihkan data dari file <span className="font-bold">{selectedFile?.name}</span>.
              Data pegawai, pengguna, dan pengaturan saat ini akan digantikan oleh isi berkas cadangan ini.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-50"
              >
                {isRestoring ? 'Memproses...' : 'Ya, Pulihkan Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
