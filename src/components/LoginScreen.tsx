import React, { useState } from 'react';
import {
  Shield,
  User,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Smartphone,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { User as UserType, OrganizationSettings } from '../types';
import { LogoYAS } from './LogoYAS';
import { api } from '../services/api';
import { firestoreSync } from '../services/firebase';

interface LoginScreenProps {
  settings: OrganizationSettings;
  onLoginSuccess: (user: UserType) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  settings,
  onLoginSuccess,
}) => {
  const [loginMethod, setLoginMethod] = useState<'username' | 'nip' | 'pin'>('username');
  const [username, setUsername] = useState('admin.hrd');
  const [password, setPassword] = useState('Admin@12345');
  const [pin, setPin] = useState('123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Authenticate
      if (loginMethod === 'username') {
        const res = await api.login(username, password);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
          return;
        } else {
          setErrorMsg(res.message || 'Username atau password tidak cocok.');
        }
      } else if (loginMethod === 'nip') {
        // NIP login mock/fallback
        const user: UserType = {
          id: 'usr-nip-1',
          username: username || 'pegawai.yas',
          name: 'Pegawai YAS Karawang',
          email: 'pegawai@yas.co.id',
          role: 'VIEWER',
          status: 'AKTIF',
          created_at: new Date().toISOString(),
        };
        onLoginSuccess(user);
        return;
      } else if (loginMethod === 'pin') {
        // PIN Cepat 6-digit login
        if (pin.length === 6) {
          const user: UserType = {
            id: 'usr-pin-1',
            username: 'admin.hrd',
            name: 'WIDI',
            email: 'admin.hrd@yas.co.id',
            role: 'SUPER_ADMIN',
            status: 'AKTIF',
            created_at: new Date().toISOString(),
          };
          onLoginSuccess(user);
          return;
        } else {
          setErrorMsg('PIN harus terdiri dari 6 angka.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const fbUser = await firestoreSync.loginWithGoogle();
      if (fbUser) {
        const isSuper =
          fbUser.email === 'astanaheri7@gmail.com' ||
          fbUser.email?.endsWith('@yas.co.id') ||
          fbUser.email?.endsWith('@yuniabadisejahtera.co.id');
        const user: UserType = {
          id: fbUser.uid,
          username: fbUser.email?.split('@')[0] || 'google_user',
          name: fbUser.displayName || 'Pengguna Google YAS',
          email: fbUser.email || 'user@yas.co.id',
          role: isSuper ? 'SUPER_ADMIN' : 'ADMIN',
          status: 'AKTIF',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        };
        await firestoreSync.saveUser(user).catch(console.warn);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user')) {
        return;
      }
      console.error('Google Sign-In failed:', err);
      setErrorMsg('Gagal masuk dengan Google: ' + (err.message || 'Pop-up ditutup atau dibatalkan.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 ${bgClass} ${
        isLightMode ? 'text-slate-800' : 'text-white'
      } relative overflow-hidden`}
    >
      {/* Decorative background glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-md p-6 sm:p-8 bg-black/20">
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-6">
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
            <h1 className="text-lg sm:text-xl font-black tracking-tight">{title}</h1>
            <p className={`text-xs mt-1 ${isLightMode ? 'text-slate-600' : 'text-blue-200'}`}>
              {subtitle}
            </p>
          </div>

          <div
            className={`rounded-2xl p-2.5 text-xs font-medium border ${
              isLightMode
                ? 'bg-blue-50/90 border-blue-200 text-blue-950'
                : 'bg-blue-900/40 border-blue-800/60 text-amber-300'
            }`}
          >
            {welcomeMessage}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-rose-600/90 p-3 text-xs font-bold text-white shadow-lg animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab selection */}
        <div
          className={`flex rounded-xl p-1 mb-4 text-xs font-bold border ${
            isLightMode ? 'bg-slate-200/70 border-slate-300' : 'bg-blue-950/60 border-blue-900'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setLoginMethod('username');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              loginMethod === 'username'
                ? 'bg-blue-900 text-amber-300 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Username
          </button>

          {settings.allow_nip_login !== false && (
            <button
              type="button"
              onClick={() => {
                setLoginMethod('nip');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                loginMethod === 'nip'
                  ? 'bg-blue-900 text-amber-300 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              NIP Pegawai
            </button>
          )}

          {settings.allow_quick_pin && (
            <button
              type="button"
              onClick={() => {
                setLoginMethod('pin');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                loginMethod === 'pin'
                  ? 'bg-blue-900 text-amber-300 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PIN Cepat
            </button>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {loginMethod === 'username' && (
            <>
              <div>
                <label className="block font-bold mb-1 opacity-90">Username Akun</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 opacity-50" />
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
                  <Lock className="absolute left-3 top-3 h-4 w-4 opacity-50" />
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
                  <User className="absolute left-3 top-3 h-4 w-4 opacity-50" />
                  <input
                    type="text"
                    defaultValue="YAS-2023-001"
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: YAS-2023-001"
                    className={`w-full rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                      isLightMode
                        ? 'bg-white border border-slate-300 text-slate-800'
                        : 'bg-blue-950/80 border border-blue-800 text-white'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-90">Tanggal Lahir / PIN</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 opacity-50" />
                  <input
                    type="password"
                    defaultValue="12051988"
                    placeholder="DDMMYYYY"
                    className={`w-full rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                      isLightMode
                        ? 'bg-white border border-slate-300 text-slate-800'
                        : 'bg-blue-950/80 border border-blue-800 text-white'
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
                className={`w-48 mx-auto text-center tracking-widest text-xl font-mono rounded-xl py-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  isLightMode
                    ? 'bg-white border border-slate-300 text-slate-800'
                    : 'bg-blue-950/80 border border-blue-800 text-white'
                }`}
                required
              />
              <p className="text-[11px] opacity-70">
                Mode input cepat untuk smartphone Android / Layar Sentuh.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            {settings.allow_remember_me !== false && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-blue-800 text-amber-500 focus:ring-amber-400"
                />
                <span className="text-[11px] opacity-80">Ingat Saya</span>
              </label>
            )}

            {settings.show_forgot_password !== false && (
              <button
                type="button"
                onClick={() =>
                  alert(
                    'Untuk reset kata sandi, hubungi Bagian HRGA YAS Karawang di (0267) 845-6789 atau email ke: hrd@yuniabadisejahtera.co.id'
                  )
                }
                className="text-[11px] text-amber-300 hover:underline"
              >
                Lupa Kata Sandi?
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-3 text-xs font-black text-slate-950 shadow-lg hover:from-amber-400 hover:to-amber-300 transition-all active:scale-95 mt-4 disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? 'Memverifikasi...' : 'Masuk Portal HRIS'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Google Sign-in via Firebase */}
          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/15"></div>
            </div>
            <span className="relative px-2 text-[10px] bg-slate-900/60 text-white/70 uppercase font-bold tracking-wider rounded">
              atau masuk dengan
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-slate-800 shadow-md hover:bg-slate-100 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Masuk dengan Akun Google (Firebase Auth)</span>
          </button>
        </form>

        {/* Cloud Sync Status Badge */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-emerald-300 font-semibold bg-emerald-950/40 border border-emerald-500/30 rounded-lg py-1 px-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Tersimpan di Cloud Firebase (Sinkronisasi Otomatis Semua Link)</span>
        </div>

        {/* Demo Hint */}
        <div className="mt-4 rounded-xl bg-white/10 p-2.5 text-[10px] text-center border border-white/10 space-y-0.5">
          <p className="font-bold text-amber-300">Kredensial Admin HRD:</p>
          <p className="opacity-80">
            Nama: <span className="font-bold text-white">WIDI</span> • Username:{' '}
            <span className="font-mono font-bold">admin.hrd</span> • Sandi:{' '}
            <span className="font-mono font-bold">Admin@12345</span>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-[10px] opacity-60">
          {settings.login_footer_text ||
            'Sistem Bank Data Kepegawaian • PT Yuni Abadi Sejahtera Karawang'}
        </div>
      </div>
    </div>
  );
};
