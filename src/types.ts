export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'HR_STAFF' | 'VIEWER';
export type Role = UserRole;
export type UserStatus = 'AKTIF' | 'NONAKTIF' | 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

export type EmploymentStatus = 'TETAP' | 'KONTRAK' | 'OUTSOURCING' | 'MAGANG' | 'HARIAN' | 'LAINNYA';
export type EmployeeStatus = 'AKTIF' | 'NONAKTIF';
export type Gender = 'LAKI-LAKI' | 'PEREMPUAN';
export type Religion = 'ISLAM' | 'KRISTEN PROTESTAN' | 'KATOLIK' | 'HINDU' | 'BUDDHA' | 'KONGHUCU' | 'LAINNYA';
export type MaritalStatus = 'BELUM MENIKAH' | 'MENIKAH' | 'CERAI HIDUP' | 'CERAI MATI';

export type DeactivationReason = 'RESIGN' | 'HABIS_KONTRAK' | 'PENSIUN' | 'PHK' | 'MENINGGAL_DUNIA' | 'LAINNYA';

export interface EducationItem {
  id: string;
  employee_id?: string;
  level: string; // SD, SMP, SMA/SMK, D3, S1, S2, S3
  institution: string;
  major: string;
  start_year: string;
  graduation_year: string;
  certificate_number?: string;
}

export interface WorkHistoryItem {
  id: string;
  employee_id?: string;
  company: string;
  position: string;
  department: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface FamilyMemberItem {
  id: string;
  employee_id?: string;
  name: string;
  nik?: string;
  relationship: string; // Suami, Istri, Anak ke-1, Anak ke-2, Ayah, Ibu, dll.
  gender?: Gender;
  birth_date?: string;
  occupation?: string;
  phone?: string;
}

export interface EmergencyContactItem {
  id: string;
  employee_id?: string;
  name: string;
  relationship: string;
  phone: string;
  address?: string;
}

export type DocumentType = 
  | 'KTP'
  | 'KK'
  | 'NPWP'
  | 'BPJS_KESEHATAN'
  | 'BPJS_KETENAGAKERJAAN'
  | 'IJAZAH'
  | 'TRANSKRIP'
  | 'SERTIFIKAT'
  | 'KONTRAK_KERJA'
  | 'SURAT_PENGANGKATAN'
  | 'SURAT_KETERANGAN'
  | 'LAINNYA';

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type: DocumentType;
  document_name: string;
  file_name: string;
  file_size?: number;
  file_data?: string; // Data URL / base64 or mock preview
  file_type?: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface EmploymentHistoryEntry {
  id: string;
  employee_id: string;
  action: 'TAMBAH' | 'EDIT' | 'MUTASI' | 'PROMOSI' | 'NONAKTIF' | 'AKTIF_KEMBALI' | 'HAPUS_PERMANEN';
  old_value?: string;
  new_value?: string;
  reason?: string;
  effective_date: string;
  created_by: string;
  created_at: string;
}

export interface Employee {
  id: string;
  employee_number: string; // e.g. YAS-2024-001
  nik: string; // 16 digits
  kk_number?: string;
  name: string;
  nickname?: string;
  birth_place?: string;
  birth_date?: string;
  gender: Gender;
  religion?: Religion;
  marital_status?: MaritalStatus;
  phone: string;
  email: string;
  
  // Alamat
  address: string;
  rt?: string;
  rw?: string;
  village?: string; // Desa / Kelurahan
  district?: string; // Kecamatan
  regency: string; // Kabupaten / Kota (e.g. Karawang)
  province: string; // e.g. Jawa Barat
  postal_code?: string;
  photo?: string; // URL / Base64

  // Identitas Sensitif
  npwp?: string;
  bpjs_kesehatan?: string;
  bpjs_ketenagakerjaan?: string;
  bank_name?: string;
  bank_account?: string;

  // Kepegawaian
  join_date: string;
  appointment_date?: string;
  position: string; // Jabatan
  department: string; // Departemen
  division?: string;
  work_unit?: string;
  work_location?: string;
  direct_supervisor?: string;
  employment_status: EmploymentStatus;
  employee_status: EmployeeStatus;
  
  // Kontrak
  contract_type?: string;
  contract_number?: string;
  contract_start?: string;
  contract_end?: string;

  // Pendidikan & Jenjang
  last_education?: string;
  major?: string;
  grade_level?: string;

  // Deactivation info
  deactivation_date?: string;
  deactivation_reason?: string;
  deactivation_note?: string;

  // Sub-items
  educations?: EducationItem[];
  work_histories?: WorkHistoryItem[];
  family_members?: FamilyMemberItem[];
  emergency_contacts?: EmergencyContactItem[];
  documents?: EmployeeDocument[];
  history_logs?: EmploymentHistoryEntry[];

  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  module: string;
  target_type?: string;
  details?: string;
  record_id?: string;
  description?: string;
  ip_address?: string;
  created_at: string;
}

export interface OrganizationSettings {
  company_name?: string;
  organization_name?: string;
  app_name?: string;
  tagline?: string;
  location?: string;
  company_address?: string;
  address?: string;
  company_phone?: string;
  company_email?: string;
  district?: string;
  regency?: string;
  province?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone?: string;
  primary_color?: string;
  accent_color?: string;
  theme_palette?: 'yas_navy' | 'sapphire_blue' | 'emerald_green' | 'royal_indigo' | 'dark_slate' | 'crimson_ruby' | 'amethyst_violet' | 'custom';
  auto_id_prefix?: string;
  employee_number_format?: string;
  date_format?: string;
  logo_url?: string;
  tax_number?: string;
  director_name?: string;
  hr_head_name?: string;

  // Fitur Atur Menu Login & Keamanan
  login_title?: string;
  login_subtitle?: string;
  login_welcome_message?: string;
  login_bg_theme?: 'yas_navy' | 'karawang_industrial' | 'modern_clean' | 'warm_gradient';
  allow_nip_login?: boolean;
  allow_quick_pin?: boolean;
  allow_remember_me?: boolean;
  session_duration_hours?: number;
  show_forgot_password?: boolean;
  login_footer_text?: string;
  custom_logo_data?: string;
  app_icon_shape?: 'rounded' | 'circle' | 'squircle';
  logo_shape?: 'rounded' | 'circle' | 'squircle';
  logo_border?: boolean;
  logo_shadow?: boolean;

  // Pengaturan Admin Utama di Pengaturan Sistem
  admin_name?: string;
  admin_username?: string;
  admin_email?: string;
  admin_password?: string;
  admin_role?: UserRole;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  newEmployeesThisMonth: number;
  maleCount: number;
  femaleCount: number;
  expiringContracts30: number;
  expiringContracts60: number;
  expiringContracts90: number;
  departmentDistribution: { [key: string]: number };
  employmentStatusDistribution: { [key: string]: number };
  monthlyGrowth: { month: string; count: number; active: number }[];
  dataQualityIssuesCount: number;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_number: string;
  employee_name: string;
  department: string;
  position: string;
  employment_status: EmploymentStatus;
  period_month: string; // e.g. "Oktober"
  period_year: number; // e.g. 2026
  
  // Pendapatan
  basic_salary: number; // Gaji Pokok (UMK Karawang standard)
  allowance_position: number; // Tunjangan Jabatan
  allowance_transport_meal: number; // Tunjangan Transport & Makan
  allowance_attendance: number; // Tunjangan Kehadiran
  overtime_pay: number; // Uang Lembur
  bonus: number; // Bonus / Insentif
  gross_salary: number; // Total Pendapatan Kotor

  // Potongan
  deduction_bpjs_kesehatan: number; // 1%
  deduction_bpjs_ketenagakerjaan: number; // 2% JHT + 1% JP
  deduction_tax_pph21: number; // Pajak PPh 21
  deduction_loan: number; // Kasbon
  deduction_other: number; // Potongan Lainnya
  total_deductions: number; // Total Potongan

  net_salary: number; // Take Home Pay (Gaji Bersih)
  payment_status: 'DIBAYAR' | 'MENUNGGU' | 'PROSES';
  payment_date?: string;
  bank_name?: string;
  bank_account?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface FinanceSummary {
  totalGrossPayroll: number;
  totalNetPayroll: number;
  totalDeductions: number;
  totalBpjs: number;
  totalOvertime: number;
  paidCount: number;
  pendingCount: number;
  totalEmployees: number;
}

