import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedRows: any[]) => Promise<{ count: number; duplicates: number }>;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        NIK: '3215011234560001',
        'Nama Lengkap': 'Ahmad Fauzi, S.T.',
        'Nama Panggilan': 'Fauzi',
        'Jenis Kelamin': 'LAKI-LAKI',
        'Tempat Lahir': 'Karawang',
        'Tanggal Lahir (YYYY-MM-DD)': '1992-05-14',
        Agama: 'ISLAM',
        'Status Nikah': 'MENIKAH',
        'No WhatsApp': '081234567890',
        Email: 'fauzi@yas.co.id',
        Alamat: 'Dusun Krajan RT 01 RW 02, Desa Klari',
        Kecamatan: 'Klari',
        Kabupaten: 'Kabupaten Karawang',
        Jabatan: 'Staf Operasional',
        Departemen: 'Operasional',
        'Status Pegawai': 'TETAP',
        'Tanggal Masuk (YYYY-MM-DD)': '2023-01-10',
        'Pendidikan Terakhir': 'S1',
        Jurusan: 'Teknik Industri',
        'No Rekening': '1730005849302',
        'Nama Bank': 'Bank Mandiri',
      },
      {
        NIK: '3215025408980003',
        'Nama Lengkap': 'Dewi Lestari, S.E.',
        'Nama Panggilan': 'Dewi',
        'Jenis Kelamin': 'PEREMPUAN',
        'Tempat Lahir': 'Bandung',
        'Tanggal Lahir (YYYY-MM-DD)': '1996-08-20',
        Agama: 'ISLAM',
        'Status Nikah': 'BELUM MENIKAH',
        'No WhatsApp': '085712345678',
        Email: 'dewi.lestari@yas.co.id',
        Alamat: 'Perum Puri Telukjambe Blok C3 No 12',
        Kecamatan: 'Telukjambe Timur',
        Kabupaten: 'Kabupaten Karawang',
        Jabatan: 'Staf Akuntansi & Pajak',
        Departemen: 'Keuangan & Akuntansi',
        'Status Pegawai': 'KONTRAK',
        'Tanggal Masuk (YYYY-MM-DD)': '2024-03-01',
        'Pendidikan Terakhir': 'S1',
        Jurusan: 'Akuntansi',
        'No Rekening': '5210984732',
        'Nama Bank': 'Bank BCA',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Pegawai YAS');
    XLSX.writeFile(wb, 'Template_Import_Pegawai_YAS_Karawang.xlsx');
  };

  // Handle File Upload & Parse
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setErrorMsg('');
    setResultMessage('');
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setParsedData(data);
      } catch (err: any) {
        setErrorMsg('Gagal membaca format file Excel: ' + err.message);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  // Execute Import
  const handleProcessImport = async () => {
    if (parsedData.length === 0) {
      setErrorMsg('Tidak ada baris data untuk diimpor.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg('');
      const res = await onImport(parsedData);
      setResultMessage(`Berhasil mengimpor ${res.count} data pegawai. (${res.duplicates} data NIK duplikat dilewati).`);
      setParsedData([]);
      setFile(null);
    } catch (err: any) {
      setErrorMsg('Gagal mengimpor: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#001f4d] px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-amber-400" />
            <h3 className="font-extrabold text-sm">Import Data Pegawai dari Excel / CSV</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-300 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Download Template Banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <div>
              <p className="font-bold text-blue-950">Unduh Format Template Excel Resmi</p>
              <p className="text-[11px] text-blue-800">
                Gunakan template standar dengan kolom NIK, Nama, Departemen, dll.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-blue-950 transition-colors shadow-xs shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </button>
          </div>

          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100/70 transition-colors">
            <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="font-bold text-slate-800 text-xs">
              Pilih file Excel (.xlsx, .xls) atau .csv
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Maksimal ukuran file 10 MB</p>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 transition-colors">
              <span>Pilih File dari Komputer</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {file && (
              <p className="mt-2 text-xs font-mono font-bold text-blue-900">
                File terpilih: {file.name} ({parsedData.length} baris terdeteksi)
              </p>
            )}
          </div>

          {/* Error / Success Notifications */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {resultMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{resultMessage}</span>
            </div>
          )}

          {/* Preview Parsed Data */}
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">
                  Preview 3 Baris Pertama (Total {parsedData.length} Baris):
                </span>
              </div>
              <div className="max-h-36 overflow-x-auto overflow-y-auto border border-slate-200 rounded-xl bg-white text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-2">NIK</th>
                      <th className="p-2">Nama</th>
                      <th className="p-2">Jabatan</th>
                      <th className="p-2">Departemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.slice(0, 3).map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-mono">{row.NIK || row.nik || '-'}</td>
                        <td className="p-2 font-bold">{row['Nama Lengkap'] || row.nama || row.name || '-'}</td>
                        <td className="p-2">{row.Jabatan || row.jabatan || row.position || '-'}</td>
                        <td className="p-2">{row.Departemen || row.departemen || row.department || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            Tutup
          </button>
          <button
            onClick={handleProcessImport}
            disabled={parsedData.length === 0 || isProcessing}
            className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-5 py-2 text-xs font-bold text-amber-300 shadow-md hover:bg-blue-950 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>{isProcessing ? 'Mengimpor...' : `Impor ${parsedData.length} Pegawai`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
