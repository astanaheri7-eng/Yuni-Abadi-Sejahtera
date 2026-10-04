import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Employee } from '../types';
import { LogoYAS } from './LogoYAS';

interface BiodataPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export const BiodataPrintModal: React.FC<BiodataPrintModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  if (!isOpen || !employee) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 my-8 print:border-none print:shadow-none print:m-0 print:rounded-none">
        {/* Modal Toolbar (Hidden during print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#001f4d] px-6 py-4 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-amber-400" />
            <h3 className="font-extrabold text-sm">Cetak Lembar Biodata Resmi Karyawan</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-1.5 text-xs font-bold text-blue-950 hover:bg-amber-300 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Dokumen</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-blue-900 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white space-y-6 text-xs leading-relaxed print:p-6 print:text-[11px]">
          {/* Formal Kop Surat Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-4">
              <LogoYAS className="h-14 w-auto" />
              <div>
                <h1 className="text-base font-black tracking-tight text-blue-950 uppercase">
                  Yuni Abadi Sejahtera
                </h1>
                <p className="text-[10px] text-slate-600 font-semibold">
                  Jasa Tenaga Kerja, Manajemen Sumber Daya Manusia & Operasional Industri
                </p>
                <p className="text-[9px] text-slate-500">
                  Jl. Raya Klari, Kabupaten Karawang, Jawa Barat 41371 • Telp: (0267) 845-xxxx • Email: hrd@yas.co.id
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="border border-slate-300 rounded px-2 py-1 bg-slate-50 text-[9px] font-mono">
                FORM-HRD-YAS-001
              </div>
              <div className="text-[9px] text-slate-400 mt-1">
                Tgl Cetak: {new Date().toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center space-y-0.5">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 underline">
              Lembar Biodata & Riwayat Pegawai
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">
              NOMOR REGISTRASI: {employee.employee_number}
            </p>
          </div>

          {/* Top Section: Photo & Primary Info */}
          <div className="flex gap-6 items-start">
            <div className="flex-1 space-y-4">
              {/* Section 1: Data Pribadi */}
              <div>
                <h3 className="font-extrabold text-[11px] uppercase bg-slate-100 px-2.5 py-1 border-l-4 border-blue-900 text-blue-950 mb-2">
                  I. Biodata Pribadi
                </h3>
                <table className="w-full text-left">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 w-40 text-slate-500">Nama Lengkap</td>
                      <td className="py-1 w-3">:</td>
                      <td className="py-1 font-bold text-slate-900">{employee.name}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500">Nomor Induk Kependudukan (NIK)</td>
                      <td className="py-1">:</td>
                      <td className="py-1 font-mono font-bold text-slate-900">{employee.nik}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500">Nomor Kartu Keluarga (KK)</td>
                      <td className="py-1">:</td>
                      <td className="py-1 font-mono">{employee.kk_number || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500">Tempat, Tanggal Lahir</td>
                      <td className="py-1">:</td>
                      <td className="py-1">
                        {employee.birth_place || 'Karawang'}, {employee.birth_date || '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500">Jenis Kelamin / Agama</td>
                      <td className="py-1">:</td>
                      <td className="py-1">
                        {employee.gender} / {employee.religion || 'Islam'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500">Status Pernikahan</td>
                      <td className="py-1">:</td>
                      <td className="py-1">{employee.marital_status || 'Belum Menikah'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500">Nomor WhatsApp / HP</td>
                      <td className="py-1">:</td>
                      <td className="py-1 font-bold">{employee.phone}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500">Email</td>
                      <td className="py-1">:</td>
                      <td className="py-1">{employee.email}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500">Alamat Lengkap KTP</td>
                      <td className="py-1">:</td>
                      <td className="py-1">
                        {employee.address || '-'}, RT {employee.rt || '001'} / RW {employee.rw || '001'},{' '}
                        {employee.village || ''}, {employee.district || 'Klari'},{' '}
                        {employee.regency || 'Karawang'}, {employee.province || 'Jawa Barat'}{' '}
                        {employee.postal_code || ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Photo Box */}
            <div className="w-28 h-36 rounded border-2 border-slate-300 p-1 flex flex-col items-center justify-center bg-slate-50 shrink-0 text-center">
              {employee.photo ? (
                <img
                  src={employee.photo}
                  alt={employee.name}
                  className="h-full w-full object-cover rounded"
                />
              ) : (
                <div className="text-[10px] text-slate-400 font-semibold">
                  Pas Foto
                  <br />
                  3 x 4 cm
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Data Kepegawaian */}
          <div>
            <h3 className="font-extrabold text-[11px] uppercase bg-slate-100 px-2.5 py-1 border-l-4 border-blue-900 text-blue-950 mb-2">
              II. Data Kepegawaian & Jabatan
            </h3>
            <table className="w-full text-left">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-1 w-40 text-slate-500">Nomor Induk Pegawai (NIP)</td>
                  <td className="py-1 w-3">:</td>
                  <td className="py-1 font-mono font-bold text-blue-950">{employee.employee_number}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 text-slate-500">Jabatan & Golongan</td>
                  <td className="py-1">:</td>
                  <td className="py-1 font-bold">
                    {employee.position} ({employee.grade_level || 'Staf'})
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 text-slate-500">Departemen / Penugasan</td>
                  <td className="py-1">:</td>
                  <td className="py-1">
                    {employee.department} • {employee.work_location || 'Kantor Karawang'}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 text-slate-500">Status Kepegawaian</td>
                  <td className="py-1">:</td>
                  <td className="py-1 font-bold text-slate-800">
                    {employee.employment_status} ({employee.employee_status})
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 text-slate-500">Tanggal Masuk (Join Date)</td>
                  <td className="py-1">:</td>
                  <td className="py-1">{employee.join_date}</td>
                </tr>
                {employee.contract_end && (
                  <tr className="border-b border-slate-100">
                    <td className="py-1 text-slate-500">Masa Kontrak (PKWT)</td>
                    <td className="py-1">:</td>
                    <td className="py-1">
                      {employee.contract_start || '-'} s/d {employee.contract_end} (No: {employee.contract_number || '-'})
                    </td>
                  </tr>
                )}
                <tr className="border-b border-slate-100">
                  <td className="py-1 text-slate-500">NPWP / Rekening Gaji</td>
                  <td className="py-1">:</td>
                  <td className="py-1">
                    NPWP: {employee.npwp || '-'} • {employee.bank_name || 'Mandiri'}: {employee.bank_account || '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Riwayat Pendidikan */}
          {employee.educations && employee.educations.length > 0 && (
            <div>
              <h3 className="font-extrabold text-[11px] uppercase bg-slate-100 px-2.5 py-1 border-l-4 border-blue-900 text-blue-950 mb-2">
                III. Riwayat Pendidikan Formal
              </h3>
              <table className="w-full text-left border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold border-b border-slate-200">
                    <th className="p-1.5">Jenjang</th>
                    <th className="p-1.5">Nama Institusi</th>
                    <th className="p-1.5">Jurusan</th>
                    <th className="p-1.5 text-center">Tahun</th>
                    <th className="p-1.5">No Ijazah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employee.educations.map((edu, idx) => (
                    <tr key={idx}>
                      <td className="p-1.5 font-bold">{edu.level}</td>
                      <td className="p-1.5">{edu.institution}</td>
                      <td className="p-1.5">{edu.major || '-'}</td>
                      <td className="p-1.5 text-center">
                        {edu.start_year} - {edu.graduation_year}
                      </td>
                      <td className="p-1.5 font-mono text-[9px]">{edu.certificate_number || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Triple Signature Blocks */}
          <div className="pt-6 grid grid-cols-3 gap-4 text-center">
            <div className="space-y-12">
              <p className="text-[10px] text-slate-500">Pegawai Yang Bersangkutan,</p>
              <div>
                <p className="font-bold text-slate-900 underline uppercase">{employee.name}</p>
                <p className="text-[9px] text-slate-400">NIK: {employee.nik}</p>
              </div>
            </div>

            <div className="space-y-12">
              <p className="text-[10px] text-slate-500">Mengetahui, Manager HRGA,</p>
              <div>
                <p className="font-bold text-slate-900 underline uppercase">WIDI</p>
                <p className="text-[9px] text-slate-400">Head of Human Resources</p>
              </div>
            </div>

            <div className="space-y-12">
              <p className="text-[10px] text-slate-500">Menyetujui, Direktur Operasional,</p>
              <div>
                <p className="font-bold text-slate-900 underline uppercase">H. Yuni Hermanto, S.E.</p>
                <p className="text-[9px] text-slate-400">Direktur Yuni Abadi Sejahtera</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
