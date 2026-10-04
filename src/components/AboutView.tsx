import React from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  Smartphone,
  CheckCircle2,
  Download,
  Info,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { LogoYAS } from './LogoYAS';
import { OrganizationSettings } from '../types';

interface AboutViewProps {
  settings?: OrganizationSettings;
  onOpenAndroidMode?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ settings, onOpenAndroidMode }) => {
  const companyName = settings?.company_name || 'PT YUNI ABADI SEJAHTERA';
  const appName = settings?.app_name || 'YAS HRIS';
  const tagline = settings?.tagline || 'Sistem Bank Data & Manajemen Kepegawaian';
  const address =
    settings?.company_address ||
    settings?.address ||
    'Jl. Raya Klari - Karawang Timur No. 88, Anggadita, Kec. Klari, Kabupaten Karawang, Jawa Barat 41371';
  const phone = settings?.company_phone || settings?.phone || '(0267) 845-6789 / 0812-9988-7766';
  const email = settings?.company_email || settings?.email || 'hrd@yuniabadisejahtera.co.id';

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-blue-950/20 bg-gradient-to-br from-[#001f4d] via-[#002b66] to-[#001133] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background Subtle Graphic */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6 pointer-events-none">
          <Building2 className="w-64 h-64 text-amber-300" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-extrabold text-amber-300 border border-amber-400/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Kabupaten Karawang, Jawa Barat</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <LogoYAS size="lg" variant="light" />
          </div>

          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
            Sistem Informasi Manajemen Kepegawaian & Bank Data Terpadu yang dirancang khusus untuk
            efisiensi operasional, pengelolaan arsip digital, dan kepatuhan ketenagakerjaan di lingkungan PT Yuni Abadi Sejahtera.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="rounded-xl bg-blue-900/80 px-3 py-1.5 text-[11px] font-bold text-amber-300 border border-blue-800">
              Versi Rilis 2.4.0 (Android & Web)
            </span>
            <span className="rounded-xl bg-blue-900/80 px-3 py-1.5 text-[11px] font-bold text-slate-200 border border-blue-800">
              Database: Encrypted JSON Storage
            </span>
          </div>
        </div>
      </div>

      {/* Android Mobile Optimization Card */}
      <div className="rounded-3xl border border-amber-300/80 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-900 font-bold shadow-sm shrink-0">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Optimasi Aplikasi Android & Layar Sentuh Mobile
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Aplikasi ini telah sepenuhnya disesuaikan untuk smartphone Android dengan Bottom Navigation Bar,
                ukuran tombol ergonomis (touch targets &ge; 44px), Safe Area notch, dan kemampuan PWA Pasang di Layar Utama (Add to Home Screen).
              </p>
            </div>
          </div>

          {onOpenAndroidMode && (
            <button
              onClick={onOpenAndroidMode}
              className="flex items-center gap-2 rounded-2xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-amber-300 shadow-md hover:bg-blue-950 transition-all shrink-0"
            >
              <Smartphone className="h-4 w-4" />
              Simulasi Mode Android
            </button>
          )}
        </div>

        {/* Mobile Features List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-amber-200/60 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Bottom Bar Navigasi Jempol</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Cepat & Hemat Kuota (PWA)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Siap Scan Barcode / QR ID Card</span>
          </div>
        </div>
      </div>

      {/* Visi & Misi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
            <Award className="h-5 w-5" />
            <h3>Visi Perusahaan</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Menjadi mitra penyedia layanan operasional dan ketenagakerjaan terpercaya di Jawa Barat yang unggul dalam tata kelola profesional, integritas, dan kesejahteraan sumber daya manusia.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-600 font-extrabold text-sm">
            <Shield className="h-5 w-5" />
            <h3>Misi Perusahaan</h3>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Menyelenggarakan tata kelola bank data kepegawaian modern dan akuntabel.</li>
            <li>Mengembangkan kompetensi kerja karyawan secara berkesinambungan.</li>
            <li>Memberikan pelayanan prima kepada seluruh mitra industri di Karawang.</li>
          </ul>
        </div>
      </div>

      {/* Kantor & Kontak Informasi */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-900" />
          Kantor Operasional & Kontak HRGA
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <MapPin className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Alamat Kantor Pusat</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Phone className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Hotline Telepon & WhatsApp</span>
              <p className="text-slate-600 mt-0.5 font-mono">{phone}</p>
              <p className="text-[10px] text-slate-400">Senin - Sabtu (08.00 - 17.00 WIB)</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Mail className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Email Resmi HRD</span>
              <p className="text-slate-600 mt-0.5 font-mono">{email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Globe className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Situs Web Resmi</span>
              <p className="text-slate-600 mt-0.5 font-mono">https://yuniabadisejahtera.co.id</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-400 py-4">
        &copy; {new Date().getFullYear()} PT Yuni Abadi Sejahtera. All Rights Reserved. • Klari, Kabupaten Karawang
      </div>
    </div>
  );
};
