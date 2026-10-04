import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  Type,
  Lock,
  Smartphone,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Sliders,
  Shield,
  Palette,
  Sparkles,
  RotateCcw,
  Key,
  User as UserIcon,
  UserCheck,
  UserPlus,
  ChevronRight,
  AlertCircle,
  Check,
} from 'lucide-react';
import { OrganizationSettings, User, UserRole, Role } from '../types';
import { api, setStoredUser, getStoredUser } from '../services/api';
import { LogoYAS } from './LogoYAS';
import { LoginPreviewModal } from './LoginPreviewModal';

interface SettingsViewProps {
  onSettingsUpdated?: (updated: OrganizationSettings) => void;
  onToggleAndroidMode?: () => void;
  isAndroidMode?: boolean;
  currentUser?: User | null;
  onCurrentUserUpdated?: (updated: User) => void;
}

// Preset Warna Aplikasi Siap Pakai
interface ColorPreset {
  id: string;
  name: string;
  subtitle: string;
  primary: string;
  accent: string;
  tag: string;
  previewGradient: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'yas_navy',
    name: 'YAS Navy & Emas Karawang',
    subtitle: 'Warna resmi korporat PT Yuni Abadi Sejahtera Karawang',
    primary: '#001f4d',
    accent: '#f59e0b',
    tag: 'Resmi',
    previewGradient: 'from-[#001433] via-[#001f4d] to-[#002b66]',
  },
  {
    id: 'sapphire_blue',
    name: 'Sapphire Modern Blue',
    subtitle: 'Biru safir modern dan profesional untuk sistem HRIS internasional',
    primary: '#1e3a8a',
    accent: '#38bdf8',
    tag: 'Modern',
    previewGradient: 'from-blue-950 via-blue-900 to-blue-700',
  },
  {
    id: 'emerald_green',
    name: 'Emerald Industrial Green',
    subtitle: 'Hijau zamrud elegan merefleksikan kawasan industri ramah lingkungan',
    primary: '#064e3b',
    accent: '#34d399',
    tag: 'Eco-Friendly',
    previewGradient: 'from-emerald-950 via-emerald-900 to-teal-800',
  },
  {
    id: 'royal_indigo',
    name: 'Royal Indigo Luxury',
    subtitle: 'Nuansa ungu indigo berkelas eksekutif dan berteknologi tinggi',
    primary: '#312e81',
    accent: '#818cf8',
    tag: 'Executive',
    previewGradient: 'from-indigo-950 via-indigo-900 to-purple-800',
  },
  {
    id: 'dark_slate',
    name: 'Dark Slate & Electric Cyan',
    subtitle: 'Gaya enterprise gelap kontras tinggi dengan aksen cyan menyala',
    primary: '#0f172a',
    accent: '#06b6d4',
    tag: 'High-Tech',
    previewGradient: 'from-slate-950 via-slate-900 to-cyan-950',
  },
  {
    id: 'crimson_ruby',
    name: 'Crimson Ruby Dynamic',
    subtitle: 'Merah ruby bertenaga untuk perusahaan dinamis berkecepatan tinggi',
    primary: '#881337',
    accent: '#fb7185',
    tag: 'Bold',
    previewGradient: 'from-rose-950 via-rose-900 to-pink-800',
  },
  {
    id: 'amethyst_violet',
    name: 'Amethyst Deep Violet',
    subtitle: 'Ungu elegan kreatif dengan fokus human-centric yang bersahabat',
    primary: '#4c1d95',
    accent: '#c084fc',
    tag: 'Creative',
    previewGradient: 'from-purple-950 via-purple-900 to-violet-800',
  },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  onSettingsUpdated,
  onToggleAndroidMode,
  isAndroidMode,
  currentUser: initialCurrentUser,
  onCurrentUserUpdated,
}) => {
  // Settings state
  const [settings, setSettings] = useState<OrganizationSettings>({
    company_name: 'PT Yuni Abadi Sejahtera',
    organization_name: 'YUNI ABADI SEJAHTERA',
    app_name: 'YAS HRIS',
    tagline: 'Sistem Bank Data & Manajemen Kepegawaian',
    location: 'Kabupaten Karawang',
    company_address: 'Jl. Raya Klari - Karawang Timur No. 88, Anggadita, Kec. Klari',
    company_phone: '(0267) 845-6789 / 0812-9988-7766',
    company_email: 'hrd@yuniabadisejahtera.co.id',
    regency: 'Kabupaten Karawang',
    province: 'Jawa Barat',
    postal_code: '41371',
    tax_number: '01.234.567.8-408.000',
    director_name: 'H. Yuni Hermanto, S.E.',
    hr_head_name: 'WIDI',
    auto_id_prefix: 'YAS',
    employee_number_format: 'YAS-[YEAR]-[000]',
    date_format: 'DD/MM/YYYY',
    logo_url: '/logo-yas.svg',
    primary_color: '#001f4d',
    accent_color: '#f59e0b',
    theme_palette: 'yas_navy',
    logo_shape: 'rounded',
    logo_border: false,
    // Login
    login_title: 'Portal Bank Data Kepegawaian',
    login_subtitle: 'Autentikasi resmi sistem SDM & HRIS PT Yuni Abadi Sejahtera Karawang',
    login_welcome_message: 'Selamat datang di Aplikasi Kepegawaian YAS Karawang',
    login_bg_theme: 'yas_navy',
    allow_nip_login: true,
    allow_quick_pin: true,
    allow_remember_me: true,
    session_duration_hours: 24,
    show_forgot_password: true,
    login_footer_text: 'PT Yuni Abadi Sejahtera • Kabupaten Karawang, Jawa Barat',
  });

  // Active Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<
    'logo' | 'appname' | 'theme' | 'admin' | 'login' | 'company' | 'android'
  >('logo');

  // Loading & notification states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('Pengaturan berhasil disimpan!');
  const [loginPreviewOpen, setLoginPreviewOpen] = useState(false);

  // Users state for Admin user management
  const [usersList, setUsersList] = useState<User[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('usr-1');
  const [adminForm, setAdminForm] = useState<{
    id: string;
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
    status: 'AKTIF' | 'NONAKTIF';
  }>({
    id: 'usr-1',
    name: 'Heri Astana (Super Admin)',
    username: 'superadmin',
    email: 'superadmin@yas.co.id',
    password: '',
    confirmPassword: '',
    role: 'SUPER_ADMIN',
    status: 'AKTIF',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [adminSaveStatus, setAdminSaveStatus] = useState<string | null>(null);
  const [isCreatingNewAdmin, setIsCreatingNewAdmin] = useState(false);
  const [newAdminModalOpen, setNewAdminModalOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'ADMIN' as UserRole,
  });

  // Load initial settings and user list
  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true);
        const [settingsRes, usersRes] = await Promise.all([
          api.getSettings(),
          api.getUsers(),
        ]);

        if (settingsRes.data) {
          setSettings((prev) => ({
            ...prev,
            ...settingsRes.data,
            primary_color: settingsRes.data.primary_color || '#001f4d',
            accent_color: settingsRes.data.accent_color || '#f59e0b',
          }));
        }

        if (usersRes.data && usersRes.data.length > 0) {
          setUsersList(usersRes.data);
          // Find Super Admin or matching logged in user
          const activeUser =
            initialCurrentUser || getStoredUser();
          const targetUser =
            usersRes.data.find((u) => u.id === activeUser?.id) ||
            usersRes.data.find((u) => u.role === 'SUPER_ADMIN') ||
            usersRes.data[0];

          if (targetUser) {
            setSelectedAdminId(targetUser.id);
            setAdminForm({
              id: targetUser.id,
              name: targetUser.name,
              username: targetUser.username,
              email: targetUser.email,
              password: targetUser.password || '',
              confirmPassword: targetUser.password || '',
              role: targetUser.role,
              status: (targetUser.status as any) === 'NONAKTIF' ? 'NONAKTIF' : 'AKTIF',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load settings/users:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, [initialCurrentUser]);

  // When admin selector changes
  const handleSelectAdmin = (userId: string) => {
    setSelectedAdminId(userId);
    const found = usersList.find((u) => u.id === userId);
    if (found) {
      setAdminForm({
        id: found.id,
        name: found.name,
        username: found.username,
        email: found.email,
        password: found.password || '',
        confirmPassword: found.password || '',
        role: found.role,
        status: (found.status as any) === 'NONAKTIF' ? 'NONAKTIF' : 'AKTIF',
      });
    }
  };

  // Save Settings General
  const handleSaveSettings = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    try {
      await api.updateSettings(settings);
      localStorage.setItem('yas_settings', JSON.stringify(settings));

      // Also apply primary color to CSS variable
      if (settings.primary_color) {
        document.documentElement.style.setProperty('--theme-primary', settings.primary_color);
      }
      if (settings.accent_color) {
        document.documentElement.style.setProperty('--theme-accent', settings.accent_color);
      }

      if (onSettingsUpdated) onSettingsUpdated(settings);
      setSaveSuccessMsg(customMsg || 'Pengaturan sistem berhasil disimpan!');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    } catch (err: any) {
      alert('Gagal menyimpan pengaturan: ' + err.message);
    }
  };

  // Logo file upload
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran berkas logo terlalu besar. Maksimum 2 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Data = uploadEvent.target?.result as string;
        const updated = {
          ...settings,
          custom_logo_data: base64Data,
          logo_url: base64Data,
        };
        setSettings(updated);
        localStorage.setItem('yas_settings', JSON.stringify(updated));
        if (onSettingsUpdated) onSettingsUpdated(updated);
        setSaveSuccessMsg('Logo baru berhasil diunggah!');
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    const updated = {
      ...settings,
      custom_logo_data: undefined,
      logo_url: '/logo-yas.svg',
    };
    setSettings(updated);
    localStorage.setItem('yas_settings', JSON.stringify(updated));
    if (onSettingsUpdated) onSettingsUpdated(updated);
    setSaveSuccessMsg('Logo berhasil dikembalikan ke default YAS Karawang!');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Apply Color Palette Preset
  const handleSelectColorPreset = (preset: ColorPreset) => {
    const updated = {
      ...settings,
      primary_color: preset.primary,
      accent_color: preset.accent,
      theme_palette: preset.id as any,
    };
    setSettings(updated);
    localStorage.setItem('yas_settings', JSON.stringify(updated));
    document.documentElement.style.setProperty('--theme-primary', preset.primary);
    document.documentElement.style.setProperty('--theme-accent', preset.accent);
    if (onSettingsUpdated) onSettingsUpdated(updated);
    setSaveSuccessMsg(`Tema warna "${preset.name}" berhasil diterapkan!`);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Save Admin Account Changes (Name, Username, Email, Password, Role)
  const handleSaveAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminForm.name.trim() || !adminForm.username.trim() || !adminForm.email.trim()) {
      alert('Nama, Username, dan Email wajib diisi!');
      return;
    }

    if (adminForm.password && adminForm.password !== adminForm.confirmPassword) {
      alert('Konfirmasi kata sandi tidak cocok dengan kata sandi baru!');
      return;
    }

    try {
      setAdminSaveStatus('Menyimpan perubahan akun admin...');
      const payload: Partial<User> & { password?: string } = {
        name: adminForm.name.trim(),
        username: adminForm.username.trim(),
        email: adminForm.email.trim(),
        role: adminForm.role,
        status: adminForm.status,
      };

      if (adminForm.password.trim()) {
        payload.password = adminForm.password.trim();
      }

      const res = await api.updateUser(adminForm.id, payload);

      if (res.success) {
        // Update local list
        setUsersList((prev) =>
          prev.map((u) => (u.id === adminForm.id ? { ...u, ...payload, id: u.id } : u))
        );

        // Also update settings sync
        const updatedSettings: OrganizationSettings = {
          ...settings,
          admin_name: adminForm.name,
          admin_username: adminForm.username,
          admin_email: adminForm.email,
          admin_role: adminForm.role,
        };
        setSettings(updatedSettings);
        localStorage.setItem('yas_settings', JSON.stringify(updatedSettings));
        if (onSettingsUpdated) onSettingsUpdated(updatedSettings);

        // If editing the active user, update active user state
        const stored = getStoredUser();
        if (stored.id === adminForm.id || initialCurrentUser?.id === adminForm.id) {
          const updatedActiveUser: User = {
            ...stored,
            name: adminForm.name,
            username: adminForm.username,
            email: adminForm.email,
            role: adminForm.role,
            status: adminForm.status,
          };
          setStoredUser(updatedActiveUser);
          if (onCurrentUserUpdated) onCurrentUserUpdated(updatedActiveUser);
        }

        setAdminSaveStatus(null);
        setSaveSuccessMsg(`Data akun user admin "${adminForm.name}" berhasil diperbarui!`);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3500);
      } else {
        alert(res.message || 'Gagal memperbarui user admin.');
        setAdminSaveStatus(null);
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
      setAdminSaveStatus(null);
    }
  };

  // Create New Admin User
  const handleCreateNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminData.name || !newAdminData.username || !newAdminData.email) {
      alert('Semua kolom wajib diisi!');
      return;
    }

    try {
      const res = await api.createUser({
        name: newAdminData.name,
        username: newAdminData.username,
        email: newAdminData.email,
        password: newAdminData.password || 'admin123',
        role: newAdminData.role,
        status: 'AKTIF',
      });

      if (res.success && res.data) {
        setUsersList((prev) => [...prev, res.data]);
        setSelectedAdminId(res.data.id);
        setAdminForm({
          id: res.data.id,
          name: res.data.name,
          username: res.data.username,
          email: res.data.email,
          password: newAdminData.password || 'admin123',
          confirmPassword: newAdminData.password || 'admin123',
          role: res.data.role,
          status: 'AKTIF',
        });
        setNewAdminModalOpen(false);
        setNewAdminData({ name: '', username: '', email: '', password: '', role: 'ADMIN' });
        setSaveSuccessMsg(`Admin baru "${res.data.name}" berhasil ditambahkan!`);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3500);
      } else {
        alert(res.message || 'Gagal menambah admin.');
      }
    } catch (err: any) {
      alert('Terjadi error: ' + err.message);
    }
  };

  // Subtabs Definition
  const subTabs = [
    { id: 'logo', label: 'Ganti Logo', icon: ImageIcon },
    { id: 'appname', label: 'Nama Aplikasi', icon: Type },
    { id: 'theme', label: 'Warna Aplikasi', icon: Palette },
    { id: 'admin', label: 'User Admin & Sandi', icon: Shield },
    { id: 'login', label: 'Atur Menu Login', icon: Lock },
    { id: 'company', label: 'Profil Perusahaan', icon: Building },
    { id: 'android', label: 'Pengaturan Android', icon: Smartphone },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-md transition-colors"
              style={{
                backgroundColor: settings.primary_color || '#001f4d',
                color: settings.accent_color || '#f59e0b',
              }}
            >
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Pengaturan Sistem &amp; Personalisasi
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Kustomisasi logo instansi, nama aplikasi, palet warna tema, dan kelola user admin (password &amp; role).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-save-settings-top"
            onClick={() => handleSaveSettings()}
            style={{
              backgroundColor: settings.primary_color || '#001f4d',
              color: settings.accent_color || '#f59e0b',
            }}
            className="flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold shadow-md hover:opacity-95 transition-all active:scale-95 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            Simpan Semua Pengaturan
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {isSaved && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-900 border border-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Subtabs Bar */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 scrollbar-none">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              style={
                isActive
                  ? {
                      backgroundColor: settings.primary_color || '#001f4d',
                      color: settings.accent_color || '#f59e0b',
                    }
                  : {}
              }
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'shadow-md ring-2 ring-black/5'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* 1. GANTI LOGO */}
      {/* ==================================================== */}
      {activeSubTab === 'logo' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-blue-900" />
                Ganti Logo Perusahaan / Instansi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Logo ini otomatis ditampilkan secara adaptif pada Navbar, Sidebar, formulir kop surat resmi, kartu tanda pengenal (ID Card), dan portal login.
              </p>
            </div>

            {/* Live Preview Box */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-6 space-y-3">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Pratinjau Logo Aktif Saat Ini:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* On Light Background */}
                <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[140px]">
                  <span className="text-[10px] text-slate-400 font-semibold mb-3">
                    Latar Terang (Kop Surat, ID Card, Cetak Laporan)
                  </span>
                  <LogoYAS
                    size="lg"
                    variant="dark"
                    customLogoUrl={settings.custom_logo_data || settings.logo_url}
                    customAppName={settings.organization_name || settings.company_name}
                    customTagline={settings.tagline}
                    shape={settings.logo_shape}
                    hasBorder={settings.logo_border}
                  />
                </div>

                {/* On Dark / Primary Background */}
                <div
                  className="rounded-2xl p-5 border shadow-sm flex flex-col items-center justify-center min-h-[140px] transition-colors"
                  style={{
                    backgroundColor: settings.primary_color || '#001f4d',
                    borderColor: 'rgba(255,255,255,0.15)',
                  }}
                >
                  <span className="text-[10px] text-white/70 font-semibold mb-3">
                    Latar Utama Aplikasi (Navbar Header &amp; Layar Login)
                  </span>
                  <LogoYAS
                    size="lg"
                    variant="light"
                    customLogoUrl={settings.custom_logo_data || settings.logo_url}
                    customAppName={settings.organization_name || settings.company_name}
                    customTagline={settings.tagline}
                    shape={settings.logo_shape}
                    hasBorder={settings.logo_border}
                  />
                </div>
              </div>
            </div>

            {/* Upload & Logo Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              {/* Upload Custom File */}
              <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-5 space-y-3.5">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                  <Upload className="h-4 w-4 text-blue-800" />
                  <span>Unggah Berkas Logo Baru</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pilih file gambar logo format PNG (disarankan latar transparan), SVG, JPG, atau WebP. Maksimal 2 MB.
                </p>

                <input
                  type="file"
                  id="logo-file-input"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-900 file:text-amber-300 hover:file:bg-blue-950 cursor-pointer"
                />

                {settings.custom_logo_data && (
                  <button
                    onClick={handleResetLogo}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline pt-1 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Kembalikan ke Logo Standar YAS Karawang
                  </button>
                )}
              </div>

              {/* Preset Logos & Shape Styling */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Pilihan Logo Preset &amp; Bentuk Emblem</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSettings({
                        ...settings,
                        custom_logo_data: undefined,
                        logo_url: '/logo-yas.svg',
                      });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      settings.logo_url === '/logo-yas.svg' && !settings.custom_logo_data
                        ? 'border-blue-900 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-900/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-bold">Emblem YAS Emas-Navy</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Lambang Resmi Karawang</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSettings({
                        ...settings,
                        custom_logo_data: undefined,
                        logo_url:
                          'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=80',
                      });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      settings.logo_url?.includes('unsplash')
                        ? 'border-blue-900 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-900/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-bold">Monogram Geometris</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Minimalis Modern</p>
                  </button>
                </div>

                {/* Logo Shape & Border Switchers */}
                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Bentuk Sudut Logo:
                  </label>
                  <div className="flex gap-2 text-xs">
                    {(['rounded', 'circle', 'squircle'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSettings({ ...settings, logo_shape: s })}
                        className={`px-3 py-1.5 rounded-lg border font-semibold capitalize cursor-pointer transition-all ${
                          settings.logo_shape === s
                            ? 'bg-blue-900 text-amber-300 border-blue-900 font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {s === 'rounded' ? 'Kotak Membulat' : s === 'circle' ? 'Lingkaran' : 'Squircle'}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!settings.logo_border}
                      onChange={(e) => setSettings({ ...settings, logo_border: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Beri garis tepi / bingkai emas tipis pada logo
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. ATUR NAMA APLIKASI */}
      {/* ==================================================== */}
      {activeSubTab === 'appname' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Type className="h-5 w-5 text-blue-900" />
                Kustomisasi Nama Aplikasi &amp; Branding Instansi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Perubahan nama aplikasi dan tagline langsung tercermin di header navigasi, tab browser, kop surat, dan kartu pegawai.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Singkat Aplikasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.app_name || ''}
                  onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                  placeholder="Contoh: YAS HRIS"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-blue-950 focus:border-blue-900 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Tampil pada header kecil, tab browser, dan aplikasi Android.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Resmi Organisasi / PT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.organization_name || settings.company_name || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      organization_name: e.target.value,
                      company_name: e.target.value,
                    })
                  }
                  placeholder="Contoh: PT YUNI ABADI SEJAHTERA"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800 uppercase focus:border-blue-900 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Nama instansi yang tercetak di samping logo dan dokumen resmi.
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Tagline / Sub-judul Sistem <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.tagline || ''}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  placeholder="Contoh: Sistem Bank Data & Manajemen Kepegawaian"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Keterangan sub-judul di bawah nama perusahaan pada header &amp; halaman login.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Wilayah / Kabupaten Kantor
                </label>
                <input
                  type="text"
                  value={settings.regency || ''}
                  onChange={(e) => setSettings({ ...settings, regency: e.target.value })}
                  placeholder="Kabupaten Karawang"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-900 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Lokasi operasional kantor (misal: Kabupaten Karawang, Jawa Barat).
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Format Penomoran NIP Pegawai
                </label>
                <input
                  type="text"
                  value={settings.employee_number_format || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, employee_number_format: e.target.value })
                  }
                  placeholder="YAS-[YEAR]-[000]"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono focus:border-blue-900 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Format kode otomatis saat pendaftaran pegawai baru.
                </span>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Simulasi Tampilan Identitas Baru:
              </p>
              <div className="flex items-center gap-3">
                <LogoYAS
                  size="md"
                  variant="dark"
                  customAppName={settings.organization_name || settings.company_name}
                  customTagline={settings.tagline}
                  customLogoUrl={settings.custom_logo_data || settings.logo_url}
                  shape={settings.logo_shape}
                  hasBorder={settings.logo_border}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. WARNA APLIKASI (THEME & COLOR PALETTE) */}
      {/* ==================================================== */}
      {activeSubTab === 'theme' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-900" />
                Pengaturan Warna Aplikasi &amp; Tema Visual
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sesuaikan warna primer (Primary) dan warna aksen (Accent) aplikasi. Perubahan warna akan diterapkan ke Navbar, tombol utama, menu sidebar, badge, dan navigasi mobile.
              </p>
            </div>

            {/* Current Active Color Overview */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-2xl shadow-md border-2 border-white flex items-center justify-center text-xs font-extrabold transition-all"
                  style={{
                    backgroundColor: settings.primary_color || '#001f4d',
                    color: settings.accent_color || '#f59e0b',
                  }}
                >
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      Warna Primer Aktif:
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                      {settings.primary_color || '#001f4d'}
                    </span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="font-extrabold text-sm text-slate-900">
                      Warna Aksen:
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                      {settings.accent_color || '#f59e0b'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pilih salah satu palet tema di bawah atau gunakan alat pemilih warna kustom (Color Picker).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveSettings(undefined, 'Warna tema aplikasi berhasil diperbarui ke seluruh sistem!')}
                style={{
                  backgroundColor: settings.primary_color || '#001f4d',
                  color: settings.accent_color || '#f59e0b',
                }}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-md hover:opacity-90 transition-all shrink-0 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Terapkan Warna Ini
              </button>
            </div>

            {/* Presets Grid */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                1. Pilihan Palet Warna Siap Pakai:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected =
                    (settings.primary_color || '').toLowerCase() === preset.primary.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectColorPreset(preset)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'border-blue-900 ring-2 ring-blue-900/30 bg-blue-50/40 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="font-extrabold text-xs text-slate-900 group-hover:text-blue-950">
                          {preset.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-blue-900 text-amber-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isSelected ? '✓ Terpilih' : preset.tag}
                        </span>
                      </div>

                      {/* Visual Gradient Swatch */}
                      <div
                        className={`h-12 w-full rounded-xl bg-gradient-to-r ${preset.previewGradient} flex items-center justify-between px-3 shadow-xs border border-black/10 mb-2`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-5 w-5 rounded-full border-2 border-white shadow-xs"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span className="text-[11px] font-mono font-bold text-white/90">
                            {preset.primary}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2 py-1 rounded-lg">
                          <span className="text-[10px] font-bold text-white/80">Aksen:</span>
                          <div
                            className="h-3.5 w-3.5 rounded-full border border-white"
                            style={{ backgroundColor: preset.accent }}
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-snug">
                        {preset.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Hex Color Pickers */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-900" />
                2. Kustomisasi Warna Bebas (Hex Picker):
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Primary Color Picker */}
                <div className="rounded-xl bg-white p-3.5 border border-slate-200 space-y-2">
                  <label className="block font-bold text-slate-700">
                    Warna Utama (Primary Color - Navbar &amp; Tombol Utama)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.primary_color || '#001f4d'}
                      onChange={(e) =>
                        setSettings({ ...settings, primary_color: e.target.value })
                      }
                      className="h-10 w-14 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                    />
                    <input
                      type="text"
                      value={settings.primary_color || '#001f4d'}
                      onChange={(e) =>
                        setSettings({ ...settings, primary_color: e.target.value })
                      }
                      placeholder="#001f4d"
                      className="flex-1 rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold uppercase text-slate-800"
                    />
                  </div>
                </div>

                {/* Accent Color Picker */}
                <div className="rounded-xl bg-white p-3.5 border border-slate-200 space-y-2">
                  <label className="block font-bold text-slate-700">
                    Warna Aksen (Accent Color - Teks Highlight &amp; Emblem)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.accent_color || '#f59e0b'}
                      onChange={(e) =>
                        setSettings({ ...settings, accent_color: e.target.value })
                      }
                      className="h-10 w-14 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                    />
                    <input
                      type="text"
                      value={settings.accent_color || '#f59e0b'}
                      onChange={(e) =>
                        setSettings({ ...settings, accent_color: e.target.value })
                      }
                      placeholder="#f59e0b"
                      className="flex-1 rounded-xl border border-slate-300 p-2 font-mono text-xs font-bold uppercase text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Component Preview */}
              <div className="rounded-xl bg-white p-4 border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pratinjau Komponen Aplikasi dengan Warna Pilihan:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Mock Navbar Item */}
                  <div
                    className="p-3 rounded-xl text-white shadow-xs flex items-center justify-between"
                    style={{ backgroundColor: settings.primary_color || '#001f4d' }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold shadow-xs"
                        style={{
                          backgroundColor: settings.accent_color || '#f59e0b',
                          color: '#001f4d',
                        }}
                      >
                        Y
                      </div>
                      <span className="text-xs font-bold">Header Navbar</span>
                    </div>
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: settings.accent_color || '#f59e0b' }}
                    >
                      Aksen
                    </span>
                  </div>

                  {/* Mock Active Sidebar Item */}
                  <div
                    className="p-3 rounded-xl font-bold text-xs shadow-xs flex items-center justify-between"
                    style={{
                      backgroundColor: settings.primary_color || '#001f4d',
                      color: settings.accent_color || '#f59e0b',
                    }}
                  >
                    <span>Menu Aktif Sidebar</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>

                  {/* Mock Action Pill */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      style={{
                        backgroundColor: settings.primary_color || '#001f4d',
                        color: settings.accent_color || '#f59e0b',
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold shadow-xs text-center"
                    >
                      Tombol Aksi Utama
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. NAMA USER ADMIN (PASSWORD DAN ROLENYA) */}
      {/* ==================================================== */}
      {activeSubTab === 'admin' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-900" />
                  Kelola Akun User Admin (Nama, Password, &amp; Role)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur nama lengkap pengguna admin, perbarui kata sandi (password), serta tentukan hak akses peran (role) secara langsung.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNewAdminModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-amber-300 shadow-md hover:bg-blue-950 transition-all shrink-0 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Tambah Admin Baru</span>
              </button>
            </div>

            {/* Quick Admin Selector Bar */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Akun Admin yang Ingin Dikonfigurasi:
              </label>

              <div className="flex flex-wrap gap-2">
                {usersList.map((user) => {
                  const isSelected = user.id === selectedAdminId;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectAdmin(user.id)}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-900 text-amber-300 shadow-md ring-2 ring-blue-900/30'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                          isSelected
                            ? 'bg-blue-950 text-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="leading-tight">{user.name}</p>
                        <p
                          className={`text-[10px] ${
                            isSelected ? 'text-amber-200/80' : 'text-slate-400'
                          }`}
                        >
                          @{user.username} • {user.role.replace('_', ' ')}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin Edit Form */}
            <form onSubmit={handleSaveAdminUser} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Nama Lengkap User Admin */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap User Admin <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={adminForm.name}
                      onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                      placeholder="Contoh: Heri Astana (Super Admin)"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 focus:border-blue-900 focus:outline-none"
                    />
                    <UserIcon className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Nama yang muncul di Navbar header dan catatan riwayat audit log.
                  </span>
                </div>

                {/* Username Admin */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Username Akun Admin <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={adminForm.username}
                      onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                      placeholder="superadmin"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono font-bold text-blue-950 focus:border-blue-900 focus:outline-none"
                    />
                    <Key className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Digunakan untuk masuk (login) ke aplikasi.
                  </span>
                </div>

                {/* Email Admin */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Alamat Email Admin <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      placeholder="superadmin@yas.co.id"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                    />
                    <Mail className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Status Akun */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Akun</label>
                  <select
                    value={adminForm.status}
                    onChange={(e) =>
                      setAdminForm({
                        ...adminForm,
                        status: e.target.value as 'AKTIF' | 'NONAKTIF',
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800 focus:border-blue-900 focus:outline-none"
                  >
                    <option value="AKTIF">AKTIF (Dapat Login &amp; Mengakses)</option>
                    <option value="NONAKTIF">NONAKTIF (Akses Dinonaktifkan)</option>
                  </select>
                </div>

                {/* Kata Sandi Baru */}
                <div className="rounded-2xl bg-amber-50/50 border border-amber-200/80 p-4 sm:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-amber-700" />
                      Ganti Kata Sandi (Password) Admin:
                    </label>
                    <span className="text-[10px] font-semibold text-amber-800">
                      *Kosongkan jika tidak ingin mengubah kata sandi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Kata Sandi Baru
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={adminForm.password}
                          onChange={(e) =>
                            setAdminForm({ ...adminForm, password: e.target.value })
                          }
                          placeholder="Ketik kata sandi baru (cth: admin123)"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 pr-10 text-xs font-mono focus:border-blue-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Konfirmasi Kata Sandi Baru
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminForm.confirmPassword}
                        onChange={(e) =>
                          setAdminForm({ ...adminForm, confirmPassword: e.target.value })
                        }
                        placeholder="Ulangi kata sandi baru"
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono focus:border-blue-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {adminForm.password && (
                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="text-slate-600 font-semibold">Kekuatan Sandi:</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden max-w-xs">
                        <div
                          className={`h-full rounded-full transition-all ${
                            adminForm.password.length < 6
                              ? 'w-1/3 bg-rose-500'
                              : adminForm.password.length < 10
                              ? 'w-2/3 bg-amber-500'
                              : 'w-full bg-emerald-500'
                          }`}
                        />
                      </div>
                      <span
                        className={`font-bold ${
                          adminForm.password.length < 6
                            ? 'text-rose-600'
                            : adminForm.password.length < 10
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {adminForm.password.length < 6
                          ? 'Lemah (< 6 karakter)'
                          : adminForm.password.length < 10
                          ? 'Cukup Baik'
                          : 'Sangat Kuat'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Peran / Hak Akses (Role) */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block font-bold text-slate-800 text-xs">
                    Pilih Peran / Hak Akses (Role) User: <span className="text-rose-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      {
                        role: 'SUPER_ADMIN' as UserRole,
                        title: 'SUPER ADMIN',
                        badge: 'Hak Penuh',
                        badgeColor: 'bg-purple-100 text-purple-900',
                        desc: 'Akses tanpa batas: CRUD Pegawai, Hapus Permanen, Backup/Restore Database, Kelola Akun Pengguna & Pengaturan Sistem.',
                      },
                      {
                        role: 'ADMIN' as UserRole,
                        title: 'HR ADMIN',
                        badge: 'Operasional Penuh',
                        badgeColor: 'bg-blue-100 text-blue-900',
                        desc: 'Dapat menambah, mengedit, memutasi pegawai, mengunggah dokumen, menonaktifkan, dan import data Excel massal.',
                      },
                      {
                        role: 'HR_STAFF' as UserRole,
                        title: 'HR STAFF',
                        badge: 'Entri & Cetak',
                        badgeColor: 'bg-emerald-100 text-emerald-900',
                        desc: 'Entri biodata pegawai, cetak ID Card dan laporan kepegawaian. Tidak dapat menghapus data permanen.',
                      },
                      {
                        role: 'VIEWER' as UserRole,
                        title: 'VIEWER / DIREKSI',
                        badge: 'Hanya Lihat',
                        badgeColor: 'bg-slate-100 text-slate-700',
                        desc: 'Mode pengawas: Hanya melihat data pegawai, statistik, dan laporan tanpa izin menambah, mengedit, atau menghapus.',
                      },
                    ].map((item) => {
                      const isSelected = adminForm.role === item.role;
                      return (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => setAdminForm({ ...adminForm, role: item.role })}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-blue-900 bg-blue-50/60 ring-2 ring-blue-900/20 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-extrabold text-xs text-slate-900">
                                {item.title}
                              </span>
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${item.badgeColor}`}
                              >
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold ${
                                isSelected ? 'text-blue-900' : 'text-slate-400'
                              }`}
                            >
                              {isSelected ? '✓ Role Terpilih' : 'Pilih Role Ini'}
                            </span>
                            <div
                              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-blue-900 bg-blue-900 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit Button for Admin Form */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-xs text-slate-500">
                  {adminSaveStatus || 'Perubahan akun akan langsung disinkronkan ke sesi login aktif.'}
                </span>

                <button
                  type="submit"
                  style={{
                    backgroundColor: settings.primary_color || '#001f4d',
                    color: settings.accent_color || '#f59e0b',
                  }}
                  className="flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold shadow-md hover:opacity-95 transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Simpan Perubahan Akun Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. ATUR MENU LOGIN */}
      {/* ==================================================== */}
      {activeSubTab === 'login' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-900" />
                  Kustomisasi Menu &amp; Layar Login Pegawai
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur tampilan, pesan sambutan, opsi autentikasi yang diizinkan (NIP, PIN Cepat), dan tema background portal login.
                </p>
              </div>

              <button
                type="button"
                id="btn-preview-login"
                onClick={() => setLoginPreviewOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-900 shadow-sm hover:bg-amber-400 transition-all shrink-0 cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                Uji / Pratinjau Layar Login
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Layar Login</label>
                <input
                  type="text"
                  value={settings.login_title || ''}
                  onChange={(e) => setSettings({ ...settings, login_title: e.target.value })}
                  placeholder="Contoh: Portal Bank Data Kepegawaian"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subjudul / Deskripsi Login</label>
                <input
                  type="text"
                  value={settings.login_subtitle || ''}
                  onChange={(e) => setSettings({ ...settings, login_subtitle: e.target.value })}
                  placeholder="Contoh: Autentikasi resmi sistem SDM & HRIS Karawang"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Pesan Sambutan (Welcome Greeting)</label>
                <input
                  type="text"
                  value={settings.login_welcome_message || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, login_welcome_message: e.target.value })
                  }
                  placeholder="Contoh: Selamat datang di Portal Kepegawaian PT Yuni Abadi Sejahtera"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800"
                />
              </div>

              {/* Theme Selection */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-2">Tema Background Halaman Login</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      id: 'yas_navy',
                      label: 'YAS Navy Corporate',
                      previewBg: 'from-[#001433] to-[#002b66]',
                    },
                    {
                      id: 'karawang_industrial',
                      label: 'Industrial Karawang',
                      previewBg: 'from-slate-900 to-blue-950',
                    },
                    {
                      id: 'modern_clean',
                      label: 'Clean Modern White',
                      previewBg: 'from-slate-100 to-blue-100',
                    },
                    {
                      id: 'warm_gradient',
                      label: 'Warm Gold Corporate',
                      previewBg: 'from-[#001f4d] to-[#3d2b1f]',
                    },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, login_bg_theme: theme.id as any })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        settings.login_bg_theme === theme.id
                          ? 'border-blue-900 ring-2 ring-blue-900/30 bg-blue-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`h-12 w-full rounded-xl bg-gradient-to-br ${theme.previewBg} mb-2 shadow-xs`}
                      />
                      <p className="font-bold text-[11px] text-slate-800">{theme.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles for Login Features */}
              <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Metode Autentikasi &amp; Opsi Login yang Diizinkan:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allow_nip_login !== false}
                      onChange={(e) => setSettings({ ...settings, allow_nip_login: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Izinkan Login Menggunakan NIP</span>
                      <p className="text-[10px] text-slate-500">Pegawai dapat login via nomor induk registrasi</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allow_quick_pin !== false}
                      onChange={(e) => setSettings({ ...settings, allow_quick_pin: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800">PIN Cepat 6-Digit (Mode Android)</span>
                      <p className="text-[10px] text-slate-500">Memudahkan akses cepat di layar smartphone</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allow_remember_me !== false}
                      onChange={(e) => setSettings({ ...settings, allow_remember_me: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Tampilkan Opsi &quot;Ingat Saya&quot;</span>
                      <p className="text-[10px] text-slate-500">Menyimpan sesi login di browser lokal</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.show_forgot_password !== false}
                      onChange={(e) =>
                        setSettings({ ...settings, show_forgot_password: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Tampilkan Tautan Lupa Kata Sandi</span>
                      <p className="text-[10px] text-slate-500">Mengarahkan ke kontak bantuan HRD Klari</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Masa Berlaku Sesi Login</label>
                <select
                  value={settings.session_duration_hours || 24}
                  onChange={(e) =>
                    setSettings({ ...settings, session_duration_hours: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800"
                >
                  <option value={8}>8 Jam (1 Shift Kerja)</option>
                  <option value={24}>24 Jam (1 Hari Penuh)</option>
                  <option value={168}>7 Hari (1 Minggu)</option>
                  <option value={720}>30 Hari (1 Bulan)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teks Footer Halaman Login</label>
                <input
                  type="text"
                  value={settings.login_footer_text || ''}
                  onChange={(e) => setSettings({ ...settings, login_footer_text: e.target.value })}
                  placeholder="PT Yuni Abadi Sejahtera • Klari, Karawang"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. PROFIL PERUSAHAAN */}
      {/* ==================================================== */}
      {activeSubTab === 'company' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-900" />
                Profil Resmi Organisasi &amp; Kontak HRD
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Data legalitas PT YAS Karawang yang dicetak pada dokumen formal, ID Card, dan surat keterangan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Resmi Badan Hukum</label>
                <input
                  type="text"
                  value={settings.company_name || ''}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NPWP Badan Usaha</label>
                <input
                  type="text"
                  value={settings.tax_number || ''}
                  onChange={(e) => setSettings({ ...settings, tax_number: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Telepon &amp; WhatsApp</label>
                <input
                  type="text"
                  value={settings.company_phone || settings.phone || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      company_phone: e.target.value,
                      phone: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Resmi HRGA</label>
                <input
                  type="email"
                  value={settings.company_email || settings.email || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      company_email: e.target.value,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Alamat Kantor Lengkap</label>
                <textarea
                  rows={2}
                  value={settings.company_address || settings.address || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      company_address: e.target.value,
                      address: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Direktur Utama</label>
                <input
                  type="text"
                  value={settings.director_name || ''}
                  onChange={(e) => setSettings({ ...settings, director_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kepala Bagian HRGA</label>
                <input
                  type="text"
                  value={settings.hr_head_name || ''}
                  onChange={(e) => setSettings({ ...settings, hr_head_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 7. PENGATURAN ANDROID */}
      {/* ==================================================== */}
      {activeSubTab === 'android' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-900" />
                Penyesuaian &amp; Optimasi Aplikasi Android
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfigurasi aplikasi agar optimal saat diakses melalui smartphone Android, tablet, maupun saat dipasang sebagai PWA APK di Layar Utama.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3 text-xs">
                <h3 className="font-bold text-slate-800">Status Kompatibilitas Android:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Bottom Navigation Bar Material Desain Aktif</span>
                  </li>
                  <li className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Ukuran Target Sentuh Jempol &ge; 44 Pixel</span>
                  </li>
                  <li className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>PWA Manifest &amp; Theme Color Dinamis Siap</span>
                  </li>
                  <li className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Notch &amp; Safe Area Insets Otomatis</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-blue-50/70 p-4 border border-blue-200 space-y-3 text-xs">
                <h3 className="font-bold text-blue-950">Mode Simulasi Android (Desktop):</h3>
                <p className="text-slate-600 leading-relaxed">
                  Anda dapat beralih ke &quot;Mode Simulasi Android&quot; untuk menguji tampilan aplikasi
                  dalam bingkai smartphone Android secara langsung.
                </p>

                {onToggleAndroidMode && (
                  <button
                    onClick={onToggleAndroidMode}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold transition-all text-xs cursor-pointer ${
                      isAndroidMode
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-blue-900 text-amber-300 shadow-md hover:bg-blue-950'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>
                      {isAndroidMode
                        ? 'Nonaktifkan Mode Frame Android'
                        : 'Aktifkan Bingkai Simulasi Android'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Android Installation Guide */}
            <div className="rounded-2xl border border-slate-200 p-4 text-xs space-y-2">
              <h4 className="font-bold text-slate-800">
                Cara Memasang Aplikasi di HP Android (Tanpa Google Play):
              </h4>
              <ol className="list-decimal list-inside text-slate-600 space-y-1">
                <li>Buka alamat web aplikasi ini di browser Chrome Android.</li>
                <li>Tap tombol menu titik tiga (⋮) di pojok kanan atas Chrome.</li>
                <li>
                  Pilih menu <span className="font-bold text-blue-900">&quot;Tambahkan ke Layar Utama&quot;</span> atau{' '}
                  <span className="font-bold text-blue-900">&quot;Instal Aplikasi&quot;</span>.
                </li>
                <li>Ikon {settings.app_name || 'YAS HRIS'} akan muncul di menu aplikasi HP Android layaknya aplikasi APK native.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <span className="text-xs text-slate-400">
          Perubahan logo, nama aplikasi, warna tema, dan user admin akan langsung disimpan ke database.
        </span>

        <button
          id="btn-save-settings-bottom"
          onClick={() => handleSaveSettings()}
          style={{
            backgroundColor: settings.primary_color || '#001f4d',
            color: settings.accent_color || '#f59e0b',
          }}
          className="flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold shadow-md hover:opacity-95 transition-all active:scale-95 cursor-pointer"
        >
          <Save className="h-4 w-4" />
          Simpan Semua Pengaturan
        </button>
      </div>

      {/* Modal Preview Login */}
      <LoginPreviewModal
        isOpen={loginPreviewOpen}
        onClose={() => setLoginPreviewOpen(false)}
        settings={settings}
      />

      {/* Modal Add New Admin User */}
      {newAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-900" />
                Tambah User Admin Baru
              </h3>
              <button
                type="button"
                onClick={() => setNewAdminModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewAdmin} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                  placeholder="Budi Santoso, S.Kom"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newAdminData.username}
                  onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                  placeholder="admin.budi"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono font-bold focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                  placeholder="budi@yas.co.id"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi (Password)</label>
                <input
                  type="text"
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                  placeholder="Default: admin123"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Peran (Role)</label>
                <select
                  value={newAdminData.role}
                  onChange={(e) =>
                    setNewAdminData({ ...newAdminData, role: e.target.value as UserRole })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold focus:border-blue-900 focus:outline-none"
                >
                  <option value="SUPER_ADMIN">SUPER ADMIN (Semua Akses &amp; Hapus Permanen)</option>
                  <option value="ADMIN">HR ADMIN (Tambah, Edit, Nonaktifkan, Dokumen)</option>
                  <option value="HR_STAFF">HR STAFF (Input Data &amp; Cetak)</option>
                  <option value="VIEWER">VIEWER (Hanya Lihat)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewAdminModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-900 px-5 py-2 font-bold text-amber-300 hover:bg-blue-950 shadow-md cursor-pointer"
                >
                  Simpan Admin Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
