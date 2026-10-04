import React, { useState } from 'react';
import {
  Shield,
  Key,
  User,
  Fingerprint,
  Lock,
  ArrowRight,
  CheckCircle2,
  X,
  Smartphone,
  Eye,
  EyeOff,
} from 'lucide-react';
import { OrganizationSettings } from '../types';
import { LogoYAS } from './LogoYAS';

interface LoginPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: OrganizationSettings;
}

export const LoginPreviewModal: React.FC<LoginPreviewModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const [loginMethod, setLoginMethod] = useState<'username' | 'nip' | 'pin'>('username');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [simulatedSuccess, setSimulatedSuccess] = useState(false);

  if (!isOpen) return null;

  const bgThemes = {
    yas_navy: 'bg-gradient-to-br from-[#001433] via-[#001f4d] to-[#002b66]',
    karawang_industrial: 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800',
    modern_clean: 'bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200',
    warm_gradient: 'bg-gradient-to-br from-[#001f4d] via-[#1a2e40] to-[#3d2b1f]',
  };

  const themeKey = settings.login_bg_theme || 'yas_navy';
  const bgClass = bgThemes[themeKey] || bgThemes.yas_navy;
  const isLightMode = themeKey === 'modern_clean';

  const title = settings.login_title || 'Masuk Sistem Kepegawaian';
  const subtitle =
    settings.login_subtitle ||
    'Silakan autentikasi akun Anda untuk mengakses Bank Data PT YAS Karawang';
  const welcomeMessage =
    settings.login_welcome_message ||
    'Selamat datang di Portal Resmi SDM & Kepegawaian Yuni Abadi Sejahtera';

  const handleSimulateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulatedSuccess(true);
    setTimeout(() => {
      setSimulatedSuccess(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
          title="Tutup Pratinjau"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Live Preview Watermark Indicator */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black text-slate-900 shadow-md">
          <Eye className="h-3 w-3" />
          <span>PRATINJAU LAYAR LOGIN</span>
        </div>

        {/* Login Card Screen */}
        <div className={`p-6 sm:p-8 ${bgClass} ${isLightMode ? 'text-slate-800' : 'text-white'} pt-14`}>
          {/* Logo & Branding */}
          <div className="text-center space-y-2 mb-6">
            <div className="flex justify-center">
              <LogoYAS
                size="lg"
                variant={isLightMode ? 'dark' : 'light'}
                customLogoUrl={settings.custom_logo_data || settings.logo_url}
                customAppName={settings.organization_name || settings.company_name}
                customTagline={settings.tagline}
              />
            </div>

            <div className="pt-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">{title}</h2>
              <p className={`text-xs mt-0.5 ${isLightMode ? 'text-slate-600' : 'text-blue-200'}`}>
                {subtitle}
              </p>
            </div>

            {/* Welcome banner */}
            <div
              className={`rounded-2xl p-2.5 text-[11px] font-medium border ${
                isLightMode
                  ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                  : 'bg-blue-900/40 border-blue-800/60 text-amber-300'
              }`}
            >
              {welcomeMessage}
            </div>
          </div>

          {/* Success simulation banner */}
          {simulatedSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-500 p-3 text-xs font-bold text-white shadow-lg animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Simulasi Login Berhasil! Kredensial sesuai & token aktif.</span>
            </div>
          )}

          {/* Login Tabs (Username / NIP / PIN) */}
          <div
            className={`flex rounded-xl p-1 mb-4 text-xs font-bold border ${
              isLightMode ? 'bg-slate-200/70 border-slate-300' : 'bg-blue-950/60 border-blue-900'
            }`}
          >
            <button
              type="button"
              onClick={() => setLoginMethod('username')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                loginMethod === 'username'
                  ? 'bg-blue-900 text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Username
            </button>

            {settings.allow_nip_login !== false && (
              <button
                type="button"
                onClick={() => setLoginMethod('nip')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  loginMethod === 'nip'
                    ? 'bg-blue-900 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                NIP Pegawai
              </button>
            )}

            {settings.allow_quick_pin && (
              <button
                type="button"
                onClick={() => setLoginMethod('pin')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  loginMethod === 'pin'
                    ? 'bg-blue-900 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PIN Cepat
              </button>
            )}
          </div>

          {/* Form Form */}
          <form onSubmit={handleSimulateLogin} className="space-y-3.5 text-xs">
            {loginMethod === 'username' && (
              <>
                <div>
                  <label className="block font-bold mb-1 opacity-90">Username Akun</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 opacity-50" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin.hrd atau superadmin"
                      className={`w-full rounded-xl py-2.5 pl-9 pr-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        isLightMode
                          ? 'bg-white border border-slate-300 text-slate-800'
                          : 'bg-blue-950/80 border border-blue-800 text-white placeholder-blue-300/40'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1 opacity-90">Kata Sandi (Password)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 opacity-50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full rounded-xl py-2.5 pl-9 pr-10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        isLightMode
                          ? 'bg-white border border-slate-300 text-slate-800'
                          : 'bg-blue-950/80 border border-blue-800 text-white placeholder-blue-300/40'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {loginMethod === 'nip' && (
              <>
                <div>
                  <label className="block font-bold mb-1 opacity-90">Nomor Induk Pegawai (NIP)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 opacity-50" />
                    <input
                      type="text"
                      placeholder="Contoh: YAS-2023-001"
                      className={`w-full rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        isLightMode
                          ? 'bg-white border border-slate-300 text-slate-800'
                          : 'bg-blue-950/80 border border-blue-800 text-white placeholder-blue-300/40'
                      }`}
                      required
                    />
                  </div>
                  <span className="text-[10px] opacity-70 mt-1 block">
                    Masuk langsung menggunakan nomor registrasi karyawan Anda.
                  </span>
                </div>

                <div>
                  <label className="block font-bold mb-1 opacity-90">Tanggal Lahir (DDMMYYYY) / Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 opacity-50" />
                    <input
                      type="password"
                      placeholder="Contoh: 12051988"
                      className={`w-full rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        isLightMode
                          ? 'bg-white border border-slate-300 text-slate-800'
                          : 'bg-blue-950/80 border border-blue-800 text-white placeholder-blue-300/40'
                      }`}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {loginMethod === 'pin' && (
              <div className="text-center py-2 space-y-3">
                <label className="block font-bold opacity-90">Masukkan 6-Digit PIN Cepat Pegawai</label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="• • • • • •"
                  className={`w-44 mx-auto text-center tracking-widest text-lg font-mono rounded-xl py-2 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    isLightMode
                      ? 'bg-white border border-slate-300 text-slate-800'
                      : 'bg-blue-950/80 border border-blue-800 text-white'
                  }`}
                  required
                />
                <p className="text-[10px] opacity-70">
                  Optimal untuk pengguna perangkat Android & Layar Sentuh.
                </p>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              {settings.allow_remember_me !== false && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-blue-800 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-[11px] opacity-80">Ingat Akun Saya</span>
                </label>
              )}

              {settings.show_forgot_password !== false && (
                <button
                  type="button"
                  onClick={() => alert('Fitur reset password melalui tim HRGA Karawang: (0267) 845-6789')}
                  className="text-[11px] text-amber-300 hover:underline"
                >
                  Lupa Kata Sandi?
                </button>
              )}
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-3 text-xs font-black text-slate-950 shadow-lg hover:from-amber-400 hover:to-amber-300 transition-all active:scale-95 mt-4"
            >
              <span>Masuk Portal HRIS</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center text-[10px] opacity-60">
            {settings.login_footer_text ||
              'Sistem Bank Data Kepegawaian • PT Yuni Abadi Sejahtera Karawang'}
          </div>
        </div>
      </div>
    </div>
  );
};
