import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Employee } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  employee,
  onConfirm,
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !employee) return null;

  const expectedText = 'HAPUS PERMANEN';
  const isMatch = confirmInput.trim().toUpperCase() === expectedText;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch) return;

    try {
      setIsSubmitting(true);
      await onConfirm();
      setConfirmInput('');
      onClose();
    } catch (err: any) {
      alert('Gagal menghapus pegawai: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden border border-rose-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50 px-6 py-4 text-rose-950">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
            <h3 className="font-extrabold text-sm">Konfirmasi Hapus Data Permanen</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleDelete} className="p-6 space-y-4 text-xs">
          <div className="rounded-xl bg-rose-50 p-4 border border-rose-200 text-rose-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-950">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <span>PERHATIAN: Tindakan ini tidak dapat dibatalkan!</span>
            </div>
            <p className="text-slate-700">
              Anda akan menghapus data pegawai <strong>{employee.name}</strong> (NIK: {employee.nik}, ID: {employee.employee_number}) beserta seluruh dokumen dan riwayat mutasi dari database.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Ketik teks <span className="font-mono text-rose-700 font-extrabold">HAPUS PERMANEN</span> di bawah ini untuk konfirmasi:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="HAPUS PERMANEN"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-rose-600"
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
              disabled={!isMatch || isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Menghapus...' : 'Hapus Permanen'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
