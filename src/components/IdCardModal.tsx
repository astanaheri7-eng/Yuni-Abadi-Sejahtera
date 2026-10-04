import React, { useRef } from 'react';
import { X, Printer, Download, CreditCard, ShieldCheck } from 'lucide-react';
import { Employee } from '../types';
import { LogoYAS } from './LogoYAS';

interface IdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export const IdCardModal: React.FC<IdCardModalProps> = ({ isOpen, onClose, employee }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !employee) return null;

  const handlePrint = () => {
    window.print();
  };

  // QR Code payload URL or data string
  const qrData = `YAS-VERIFIED|${employee.employee_number}|${employee.name}|${employee.nik}|${employee.department}|${employee.position}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#001f4d] px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-400" />
            <h3 className="font-extrabold text-sm">Kartu Tanda Pengenal Pegawai (ID Card)</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-blue-900 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Two-Sided ID Card Preview */}
        <div className="p-6 space-y-6 bg-slate-100">
          <div className="text-center">
            <p className="text-xs text-slate-500">
              Desain Standar ID Card Resmi PT Yuni Abadi Sejahtera • Siap Cetak (CR80 Standard: 85.6mm x 54mm)
            </p>
          </div>

          <div
            ref={cardRef}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            {/* FRONT SIDE */}
            <div className="w-[260px] h-[410px] rounded-2xl bg-white shadow-xl overflow-hidden border border-slate-300 flex flex-col relative text-slate-900">
              {/* Header Gradient */}
              <div className="bg-[#001f4d] p-4 text-center text-white relative">
                <div className="h-1.5 w-full bg-amber-400 absolute top-0 left-0"></div>
                <div className="flex justify-center mb-1">
                  <LogoYAS className="h-9 w-auto" light />
                </div>
                <div className="text-[9px] uppercase tracking-widest text-amber-300 font-extrabold">
                  Kartu Tanda Pengenal
                </div>
              </div>

              {/* Photo Box */}
              <div className="flex flex-col items-center pt-4 px-4 flex-1">
                <div className="h-24 w-24 rounded-xl overflow-hidden border-2 border-blue-900 shadow-md bg-slate-100 mb-2">
                  {employee.photo ? (
                    <img
                      src={employee.photo}
                      alt={employee.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-950 text-2xl font-black text-amber-300">
                      {employee.name.charAt(0)}
                    </div>
                  )}
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 text-center leading-tight">
                  {employee.name}
                </h4>
                <p className="text-[11px] font-bold text-blue-900 mt-0.5 text-center">
                  {employee.position}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 text-center">
                  {employee.department}
                </p>

                <div className="my-2 h-px w-full bg-slate-200" />

                <div className="w-full text-[10px] space-y-1 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ID Pegawai:</span>
                    <strong className="font-mono text-blue-950">{employee.employee_number}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">NIK:</span>
                    <strong className="font-mono">{employee.nik}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <strong className="text-emerald-700">{employee.employment_status}</strong>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-slate-50 border-t border-slate-200 p-2 text-center text-[9px] text-slate-500 font-semibold">
                Kabupaten Karawang, Jawa Barat
              </div>
            </div>

            {/* BACK SIDE */}
            <div className="w-[260px] h-[410px] rounded-2xl bg-white shadow-xl overflow-hidden border border-slate-300 flex flex-col justify-between p-4 text-slate-800 text-[10px]">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                  <ShieldCheck className="h-4 w-4 text-blue-900 shrink-0" />
                  <span className="font-bold text-blue-950 text-[10px]">KETENTUAN PENGGUNAAN</span>
                </div>

                <ol className="list-decimal list-inside space-y-1 text-[9px] text-slate-600 leading-tight">
                  <li>Kartu ini adalah tanda pengenal resmi pegawai Yuni Abadi Sejahtera.</li>
                  <li>Wajib dikenakan selama berada di lingkungan kerja.</li>
                  <li>Tidak dapat dipindahtangankan kepada pihak lain.</li>
                  <li>Jika menemukan kartu ini, mohon kembalikan ke Bagian HRD YAS Karawang.</li>
                </ol>
              </div>

              {/* QR Code Verification Box */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={qrCodeUrl}
                  alt="QR Code Verification"
                  className="h-24 w-24 bg-white p-1 rounded-lg border border-slate-300"
                />
                <span className="text-[8px] font-mono text-slate-500 mt-1">
                  Scan untuk Validasi Keaslian
                </span>
              </div>

              {/* Company Info */}
              <div className="text-center text-[8px] text-slate-500 border-t border-slate-200 pt-2 leading-tight">
                <strong>Yuni Abadi Sejahtera</strong>
                <br />
                Klari, Kabupaten Karawang, Jawa Barat
                <br />
                Email: info@yas.co.id • Telp: (0267) 845-xxxx
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white p-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2 text-xs font-bold text-amber-300 shadow-md hover:bg-blue-950 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak ID Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
