import React, { useState } from 'react';
import { X, AlertTriangle, UserX, CheckCircle } from 'lucide-react';
import { Employee, DeactivationReason } from '../types';

interface DeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onConfirm: (reason: DeactivationReason, note: string) => Promise<void>;
}

export const DeactivateModal: React.FC<DeactivateModalProps> = ({
  isOpen,
  onClose,
  employee,
  onConfirm,
}) => {
  const [reason, setReason] = useState<DeactivationReason>('RESIGN');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onConfirm(reason, note);
      onClose();
    } catch (err: any) {
      alert('Gagal menonaktifkan pegawai: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50 px-6 py-4 text-orange-950">
          <div className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-orange-600" />
            <h3 className="font-extrabold text-sm">Nonaktifkan / Arsipkan Pegawai</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="rounded-xl bg-orange-50/60 p-3.5 border border-orange-200/80 text-orange-900 space-y-1">
            <p className="font-bold">
              Anda akan menonaktifkan status kerja pegawai berikut:
            </p>
            <p className="text-slate-800 font-bold text-sm">{employee.name}</p>
            <p className="text-[11px] text-slate-600 font-mono">
              NIK: {employee.nik} • {employee.position} ({employee.department})
            </p>
            <p className="text-[10px] text-orange-800 pt-1">
              Data pegawai tidak akan dihapus permanen, melainkan dipindahkan ke arsip pegawai nonaktif dan dapat diaktifkan kembali sewaktu-waktu.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alasan Penonaktifan</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as DeactivationReason)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
            >
              <option value="RESIGN">Pengunduran Diri (Resign)</option>
              <option value="HABIS_KONTRAK">Habis Masa Kontrak (End of PKWT)</option>
              <option value="PENSIUN">Pensiun / Usia Kerja</option>
              <option value="PHK">Pemutusan Hubungan Kerja (PHK)</option>
              <option value="MENINGGAL_DUNIA">Meninggal Dunia</option>
              <option value="LAINNYA">Alasan Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan / Nomor Surat SK</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: SK Direksi No 012/HR-YAS/2026 tanggal 1 September 2026..."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-700 disabled:opacity-50"
            >
              <UserX className="h-4 w-4" />
              <span>{isSubmitting ? 'Memproses...' : 'Konfirmasi Nonaktif'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
