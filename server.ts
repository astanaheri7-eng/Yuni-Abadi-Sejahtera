import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  Employee,
  User,
  AuditLog,
  OrganizationSettings,
  EducationItem,
  WorkHistoryItem,
  FamilyMemberItem,
  EmergencyContactItem,
  EmployeeDocument,
  EmploymentHistoryEntry,
  PayrollRecord,
  FinanceSummary
} from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data folder exists
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'yas_database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  users: User[];
  employees: Employee[];
  audit_logs: AuditLog[];
  settings: OrganizationSettings;
  payroll?: PayrollRecord[];
}

// Initial Organization Settings
const defaultSettings: OrganizationSettings = {
  organization_name: 'YUNI ABADI SEJAHTERA',
  app_name: 'YAS HRIS',
  tagline: 'Sistem Bank Data & Manajemen Kepegawaian',
  location: 'Kabupaten Karawang',
  address: 'Jl. Raya Klari - Karawang Timur No. 88, Anggadita, Kec. Klari',
  district: 'Kec. Klari',
  regency: 'Kabupaten Karawang',
  province: 'Jawa Barat',
  postal_code: '41371',
  phone: '(0267) 845-6789 / 0812-9988-7766',
  email: 'hrd@yuniabadisejahtera.co.id',
  website: 'https://yuniabadisejahtera.co.id',
  timezone: 'Asia/Jakarta (WIB)',
  primary_color: '#002b66',
  hr_head_name: 'WIDI',
  employee_number_format: 'YAS-[YEAR]-[000]',
  date_format: 'DD/MM/YYYY',
  logo_url: '/logo-yas.svg',
};

// Seed Users
const defaultUsers: User[] = [
  {
    id: 'usr-1',
    name: 'WIDI',
    username: 'admin.hrd',
    email: 'admin.hrd@yas.co.id',
    password: 'Admin@12345',
    role: 'SUPER_ADMIN',
    status: 'AKTIF',
    last_login: new Date().toISOString(),
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    id: 'usr-2',
    name: 'Dewi Lestari (HR Admin)',
    username: 'admindewi',
    email: 'admin@yas.co.id',
    password: 'admin123',
    role: 'ADMIN',
    status: 'AKTIF',
    last_login: '2026-08-30T09:15:00Z',
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    id: 'usr-3',
    name: 'Rahmat Hidayat (HR Viewer)',
    username: 'viewer',
    email: 'viewer@yas.co.id',
    password: 'viewer123',
    role: 'VIEWER',
    status: 'AKTIF',
    last_login: '2026-08-28T14:30:00Z',
    created_at: '2024-02-01T08:00:00Z',
  },
];

// Seed Employees
const defaultEmployees: Employee[] = [
  {
    id: 'emp-1',
    employee_number: 'YAS-2023-001',
    nik: '3215011205880001',
    kk_number: '3215012501090005',
    name: 'Andi Saputra, S.T.',
    nickname: 'Andi',
    birth_place: 'Karawang',
    birth_date: '1988-05-12',
    gender: 'LAKI-LAKI',
    religion: 'ISLAM',
    marital_status: 'MENIKAH',
    phone: '081234567890',
    email: 'andi.saputra@yas.co.id',
    address: 'Perumahan Grand Taruma Blok A5 No. 12',
    rt: '003',
    rw: '012',
    village: 'Sukamakmur',
    district: 'Telukjambe Timur',
    regency: 'Kabupaten Karawang',
    province: 'Jawa Barat',
    postal_code: '41361',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    npwp: '31.456.789.0-408.000',
    bpjs_kesehatan: '0001234567891',
    bpjs_ketenagakerjaan: '19028374650',
    bank_name: 'Bank Mandiri',
    bank_account: '1730005849302',
    join_date: '2023-01-10',
    appointment_date: '2023-07-10',
    position: 'Kepala Divisi Operasional',
    department: 'Operasional',
    division: 'Manajemen Lapangan & Mutu',
    work_unit: 'Pusat Karawang',
    work_location: 'Kantor Pusat Karawang',
    direct_supervisor: 'Direktur Utama',
    employment_status: 'TETAP',
    employee_status: 'AKTIF',
    last_education: 'S1',
    major: 'Teknik Industri',
    grade_level: 'Grade 4 - Managerial',
    educations: [
      {
        id: 'edu-1-1',
        level: 'S1',
        institution: 'Universitas Singaperbangsa Karawang (UNSIKA)',
        major: 'Teknik Industri',
        start_year: '2006',
        graduation_year: '2010',
        certificate_number: 'UNSIKA/TI/2010/890',
      },
      {
        id: 'edu-1-2',
        level: 'SMA/SMK',
        institution: 'SMAN 1 Karawang',
        major: 'IPA',
        start_year: '2003',
        graduation_year: '2006',
      },
    ],
    work_histories: [
      {
        id: 'wh-1-1',
        company: 'PT Karawang Jaya Presisi',
        position: 'Supervisor Produksi',
        department: 'Plant Operations',
        start_date: '2015-02-01',
        end_date: '2022-11-30',
        description: 'Memimpin 40 operator pabrik dan standarisasi proses mutu 5S.',
      },
    ],
    family_members: [
      {
        id: 'fam-1-1',
        name: 'Siti Nurhaliza',
        nik: '3215015509900002',
        relationship: 'Istri',
        gender: 'PEREMPUAN',
        birth_date: '1990-09-15',
        occupation: 'Guru PNS',
        phone: '081398765432',
      },
      {
        id: 'fam-1-2',
        name: 'Arkan Saputra',
        relationship: 'Anak ke-1',
        gender: 'LAKI-LAKI',
        birth_date: '2018-04-10',
      },
    ],
    emergency_contacts: [
      {
        id: 'em-1-1',
        name: 'Siti Nurhaliza',
        relationship: 'Istri',
        phone: '081398765432',
        address: 'Grand Taruma Blok A5 No. 12 Karawang',
      },
    ],
    documents: [
      {
        id: 'doc-1-1',
        employee_id: 'emp-1',
        document_type: 'KTP',
        document_name: 'KTP Asli Andi Saputra',
        file_name: 'KTP_Andi_Saputra.pdf',
        file_size: 245000,
        uploaded_by: 'Super Admin',
        uploaded_at: '2023-01-10T10:00:00Z',
      },
      {
        id: 'doc-1-2',
        employee_id: 'emp-1',
        document_type: 'SURAT_PENGANGKATAN',
        document_name: 'SK Pengangkatan Karyawan Tetap',
        file_name: 'SK_Tetap_Andi_Saputra.pdf',
        file_size: 512000,
        uploaded_by: 'Super Admin',
        uploaded_at: '2023-07-10T11:30:00Z',
      },
    ],
    history_logs: [
      {
        id: 'hist-1-1',
        employee_id: 'emp-1',
        action: 'TAMBAH',
        new_value: 'Pendaftaran Pegawai Baru YAS-2023-001',
        reason: 'Perekrutan Baru',
        effective_date: '2023-01-10',
        created_by: 'Super Admin',
        created_at: '2023-01-10T10:00:00Z',
      },
      {
        id: 'hist-1-2',
        employee_id: 'emp-1',
        action: 'PROMOSI',
        old_value: 'Staf Senior Operasional',
        new_value: 'Kepala Divisi Operasional',
        reason: 'Kenaikan Jabatan & Evaluasi Kinerja Positif',
        effective_date: '2024-01-01',
        created_by: 'Super Admin',
        created_at: '2024-01-01T08:00:00Z',
      },
    ],
    created_at: '2023-01-10T10:00:00Z',
    updated_at: '2024-01-01T08:00:00Z',
  },
  {
    id: 'emp-2',
    employee_number: 'YAS-2023-002',
    nik: '3215021808920002',
    name: 'Budi Santoso, S.E.',
    nickname: 'Budi',
    birth_place: 'Bandung',
    birth_date: '1992-08-18',
    gender: 'LAKI-LAKI',
    religion: 'ISLAM',
    marital_status: 'MENIKAH',
    phone: '085712349988',
    email: 'budi.santoso@yas.co.id',
    address: 'Jl. Galuh Mas Raya No. 45, Sukaharja',
    rt: '002',
    rw: '008',
    village: 'Sukaharja',
    district: 'Telukjambe Timur',
    regency: 'Kabupaten Karawang',
    province: 'Jawa Barat',
    postal_code: '41361',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    npwp: '42.890.123.4-408.000',
    bpjs_kesehatan: '0008899776655',
    bpjs_ketenagakerjaan: '19055443322',
    bank_name: 'Bank BCA',
    bank_account: '8405098231',
    join_date: '2023-03-01',
    position: 'Supervisor Keuangan & Pajak',
    department: 'Keuangan & Akuntansi',
    division: 'Finance & Tax',
    work_location: 'Kantor Pusat Karawang',
    employment_status: 'TETAP',
    employee_status: 'AKTIF',
    last_education: 'S1',
    major: 'Akuntansi',
    grade_level: 'Grade 3 - Supervisor',
    educations: [
      {
        id: 'edu-2-1',
        level: 'S1',
        institution: 'Universitas Padjadjaran',
        major: 'Akuntansi',
        start_year: '2010',
        graduation_year: '2014',
      },
    ],
    family_members: [],
    emergency_contacts: [
      {
        id: 'em-2-1',
        name: 'Ratna Sulistiawati',
        relationship: 'Istri',
        phone: '085799881122',
      },
    ],
    documents: [],
    history_logs: [
      {
        id: 'hist-2-1',
        employee_id: 'emp-2',
        action: 'TAMBAH',
        new_value: 'Pendaftaran Pegawai Baru',
        effective_date: '2023-03-01',
        created_by: 'Super Admin',
        created_at: '2023-03-01T08:00:00Z',
      },
    ],
    created_at: '2023-03-01T08:00:00Z',
  },
  {
    id: 'emp-3',
    employee_number: 'YAS-2023-003',
    nik: '3215036004950003',
    name: 'Siti Rahma, S.Psi.',
    nickname: 'Siti',
    birth_place: 'Karawang',
    birth_date: '1995-04-20',
    gender: 'PEREMPUAN',
    religion: 'ISLAM',
    marital_status: 'BELUM MENIKAH',
    phone: '081908765544',
    email: 'siti.rahma@yas.co.id',
    address: 'Dusun Krajan RT 02/01, Desa Cibalongsari',
    village: 'Cibalongsari',
    district: 'Klari',
    regency: 'Kabupaten Karawang',
    province: 'Jawa Barat',
    postal_code: '41371',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    npwp: '55.123.456.7-408.000',
    bpjs_kesehatan: '0009988112233',
    bank_name: 'Bank BNI',
    bank_account: '0987654321',
    join_date: '2023-05-15',
    position: 'Staff HRD & Recruitment',
    department: 'SDM & Umum',
    division: 'Human Resources',
    work_location: 'Kantor Pusat Karawang',
    employment_status: 'KONTRAK',
    employee_status: 'AKTIF',
    contract_type: 'PKWT Tahunan',
    contract_number: '045/PKWT-YAS/V/2026',
    contract_start: '2026-05-15',
    contract_end: '2026-09-25', // Expiring within 30 days of Sep 2026!
    last_education: 'S1',
    major: 'Psikologi',
    grade_level: 'Grade 2 - Officer',
    educations: [
      {
        id: 'edu-3-1',
        level: 'S1',
        institution: 'Universitas Indonesia',
        major: 'Psikologi Industri',
        start_year: '2013',
        graduation_year: '2017',
      },
    ],
    family_members: [],
    emergency_contacts: [
      {
        id: 'em-3-1',
        name: 'H. Suryana',
        relationship: 'Ayah',
        phone: '081299881234',
        address: 'Klari Karawang',
      },
    ],
    documents: [],
    history_logs: [
      {
        id: 'hist-3-1',
        employee_id: 'emp-3',
        action: 'TAMBAH',
        new_value: 'Pendaftaran Pegawai Kontrak',
        effective_date: '2023-05-15',
        created_by: 'Super Admin',
        created_at: '2023-05-15T09:00:00Z',
      },
    ],
    created_at: '2023-05-15T09:00:00Z',
  },
  {
    id: 'emp-4',
    employee_number: 'YAS-2024-004',
    nik: '3215041511900004',
    name: 'Dedi Kurniawan',
    nickname: 'Dedi',
    birth_place: 'Cirebon',
    birth_date: '1990-11-15',
    gender: 'LAKI-LAKI',
    religion: 'ISLAM',
    marital_status: 'MENIKAH',
    phone: '082133445566',
    email: 'dedi.kurniawan@yas.co.id',
    address: 'Kp. Karanganyar RT 04/02, Klari',
    village: 'Duren',
    district: 'Klari',
    regency: 'Kabupaten Karawang',
    province: 'Jawa Barat',
    postal_code: '41371',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    npwp: '77.890.123.4-408.000',
    bpjs_kesehatan: '0003344556677',
    bank_name: 'Bank BRI',
    bank_account: '43210987654321',
    join_date: '2024-02-01',
    position: 'Koordinator Logistik & Gudang',
    department: 'Logistik & Distribusi',
    division: 'Warehouse Management',
    work_location: 'Gudang Pusat Karawang',
    employment_status: 'TETAP',
    employee_status: 'AKTIF',
    last_education: 'D3',
    major: 'Manajemen Logistik',
    grade_level: 'Grade 3 - Coordinator',
    educations: [
      {
        id: 'edu-4-1',
        level: 'D3',
        institution: 'Politeknik Negeri Bandung',
        major: 'Logistik',
        start_year: '2008',
        graduation_year: '2011',
      },
    ],
    family_members: [],
    emergency_contacts: [],
    documents: [],
    history_logs: [],
    created_at: '2024-02-01T08:00:00Z',
  },
  {
    id: 'emp-5',
    employee_number: 'YAS-2024-005',
    nik: '3215055008960005',
    name: 'Rina Amelia, S.Kom.',
    nickname: 'Rina',
    birth_place: 'Karawang',
    birth_date: '1996-08-10',
    gender: 'PEREMPUAN',
    religion: 'ISLAM',
    marital_status: 'BELUM MENIKAH',
    phone: '089611223344',
    email: 'rina.amelia@yas.co.id',
    address: 'Perumahan Citra Swarna Grande Blok D2 No. 8',
    village: 'Pancawati',
    district: 'Klari',
    regency: 'Kabupaten Karawang',
    province: 'Jawa Barat',
    postal_code: '41371',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    npwp: '88.990.112.3-408.000',
    bpjs_kesehatan: '0005566778899',
    bank_name: 'Bank Mandiri',
    bank_account: '1730009988771',
    join_date: '2024-04-15',
    position: 'Spesialis IT & Database Administrator',
    department: 'IT & Sistem Informasi',
    division: 'Information Technology',
    work_location: 'Kantor Pusat Karawang',
    employment_status: 'KONTRAK',
    employee_status: 'AKTIF',
    contract_type: 'PKWT Tahunan',
    contract_number: '089/PKWT-IT/IV/2026',
    contract_start: '2026-04-15',
    contract_end: '2026-10-15', // Expiring in 45 days
    last_education: 'S1',
    major: 'Teknik Informatika',
    grade_level: 'Grade 2 - Specialist',
    educations: [
      {
        id: 'edu-5-1',
        level: 'S1',
        institution: 'Telkom University',
        major: 'Informatika',
        start_year: '2014',
        graduation_year: '2018',
      },
    ],
    family_members: [],
    emergency_contacts: [],
    documents: [],
    history_logs: [],
    created_at: '2024-04-15T08:00:00Z',
  },
  {
    id: 'emp-6',
    employee_number: 'YAS-2023-006',
    nik: '3215061201850006',
    name: 'Hendra Gunawan',
    nickname: 'Hendra',
    birth_place: 'Purwakarta',
    birth_date: '1985-01-12',
    gender: 'LAKI-LAKI',
    religion: 'ISLAM',
    marital_status: 'MENIKAH',
    phone: '081344556677',
    email: 'hendra.gunawan@yas.co.id',
    address: 'Jl. Ahmad Yani No. 19, Karawang Barat',
    village: 'Nagadwipa',
    district: 'Karawang Barat',
    regency: 'Kabupaten Karawang',
    province: 'Jawa Barat',
    postal_code: '41311',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    join_date: '2023-02-01',
    position: 'Account Executive',
    department: 'Pemasaran & Kemitraan',
    employment_status: 'TETAP',
    employee_status: 'NONAKTIF',
    deactivation_date: '2026-06-30',
    deactivation_reason: 'Resign',
    deactivation_note: 'Mengundurkan diri karena pindah domisili keluarga ke Jawa Tengah.',
    last_education: 'S1',
    major: 'Manajemen Pemasaran',
    grade_level: 'Grade 2 - Officer',
    educations: [],
    family_members: [],
    emergency_contacts: [],
    documents: [],
    history_logs: [
      {
        id: 'hist-6-1',
        employee_id: 'emp-6',
        action: 'NONAKTIF',
        old_value: 'Status: AKTIF',
        new_value: 'Status: NONAKTIF (Resign)',
        reason: 'Pindah domisili ke Jawa Tengah',
        effective_date: '2026-06-30',
        created_by: 'Super Admin',
        created_at: '2026-06-30T10:00:00Z',
      },
    ],
    created_at: '2023-02-01T08:00:00Z',
  },
  {
    id: 'emp-7',
    employee_number: 'YAS-2024-007',
    nik: '3215077009980007',
    name: 'Fajar Nugraha',
    nickname: 'Fajar',
    birth_place: 'Karawang',
    birth_date: '1998-09-30',
    gender: 'LAKI-LAKI',
    religion: 'ISLAM',
    marital_status: 'BELUM MENIKAH',
    phone: '087811229988',
    email: 'fajar.nugraha@yas.co.id',
    address: 'Dusun Babakan RT 01/03',
    village: 'Purwasari',
    district: 'Purwasari',
    regency: 'Kabupaten Karawang',
    province: 'Jawa Barat',
    postal_code: '41373',
    join_date: '2024-08-01',
    position: 'Magang Staf Administrasi',
    department: 'SDM & Umum',
    employment_status: 'MAGANG',
    employee_status: 'AKTIF',
    contract_type: 'Program Magang',
    contract_start: '2026-08-01',
    contract_end: '2026-11-01', // Expiring in 60 days
    last_education: 'D3',
    major: 'Administrasi Bisnis',
    grade_level: 'Magang',
    created_at: '2024-08-01T08:00:00Z',
  },
  {
    id: 'emp-8',
    employee_number: 'YAS-2024-008',
    nik: '3215082506930008',
    name: 'Nurul Hidayati, S.M.',
    nickname: 'Nurul',
    birth_place: 'Bekasi',
    birth_date: '1993-06-25',
    gender: 'PEREMPUAN',
    religion: 'ISLAM',
    marital_status: 'MENIKAH',
    phone: '081299334455',
    email: 'nurul.hidayati@yas.co.id',
    address: 'Perum Gading Elok 2 Blok B3 No. 7, Karawang Timur',
    village: 'Klari',
    district: 'Klari',
    regency: 'Kabupaten Karawang',
    province: 'Jawa Barat',
    postal_code: '41371',
    join_date: '2024-05-02',
    position: 'Supervisor Customer Service',
    department: 'Pemasaran & Kemitraan',
    employment_status: 'TETAP',
    employee_status: 'AKTIF',
    last_education: 'S1',
    major: 'Manajemen Komunikasi',
    grade_level: 'Grade 3 - Supervisor',
    created_at: '2024-05-02T08:00:00Z',
  },
];

// Initial Audit Logs
const defaultAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    user_id: 'usr-1',
    user_name: 'Heri Astana (Super Admin)',
    user_role: 'SUPER_ADMIN',
    action: 'INISIALISASI_SISTEM',
    module: 'SISTEM',
    description: 'Inisialisasi Bank Data & Database Kepegawaian Yuni Abadi Sejahtera Karawang.',
    ip_address: '127.0.0.1',
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'log-2',
    user_id: 'usr-1',
    user_name: 'Heri Astana (Super Admin)',
    user_role: 'SUPER_ADMIN',
    action: 'TAMBAH_PEGAWAI',
    module: 'PEGAWAI',
    record_id: 'emp-1',
    description: 'Menambahkan data pegawai baru: Andi Saputra, S.T. (YAS-2023-001).',
    ip_address: '127.0.0.1',
    created_at: '2026-08-01T08:30:00Z',
  },
  {
    id: 'log-3',
    user_id: 'usr-2',
    user_name: 'Dewi Lestari (HR Admin)',
    user_role: 'ADMIN',
    action: 'UPLOAD_DOKUMEN',
    module: 'DOKUMEN',
    record_id: 'emp-1',
    description: 'Mengunggah dokumen SK Pengangkatan Tetap untuk Andi Saputra.',
    ip_address: '192.168.1.45',
    created_at: '2026-08-15T10:20:00Z',
  },
  {
    id: 'log-4',
    user_id: 'usr-1',
    user_name: 'Heri Astana (Super Admin)',
    user_role: 'SUPER_ADMIN',
    action: 'NONAKTIF_PEGAWAI',
    module: 'PEGAWAI',
    record_id: 'emp-6',
    description: 'Menonaktifkan pegawai Hendra Gunawan (Resign: Pindah domisili).',
    ip_address: '127.0.0.1',
    created_at: '2026-08-20T14:15:00Z',
  },
];

// Helper to Load / Save Database
function getDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading database file, using fallback:', err);
  }
  // Initialize with seed data
  const initial: DatabaseSchema = {
    users: defaultUsers,
    employees: defaultEmployees,
    audit_logs: defaultAuditLogs,
    settings: defaultSettings,
  };
  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// Helper to log audit trail
function addAuditLog(
  user: { id: string; name: string; role: any },
  action: string,
  module: string,
  description: string,
  record_id?: string,
  req?: Request
) {
  const db = getDatabase();
  const newLog: AuditLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    user_id: user?.id || 'usr-system',
    user_name: user?.name || 'System / Guest',
    user_role: user?.role || 'SUPER_ADMIN',
    action,
    module,
    record_id,
    description,
    ip_address: (req?.headers['x-forwarded-for'] as string) || req?.ip || '127.0.0.1',
    created_at: new Date().toISOString(),
  };
  db.audit_logs.unshift(newLog);
  // Keep up to 1000 logs
  if (db.audit_logs.length > 1000) {
    db.audit_logs = db.audit_logs.slice(0, 1000);
  }
  saveDatabase(db);
  return newLog;
}

// Masking helper for sensitive fields when role is VIEWER
function sanitizeEmployeeForRole(emp: Employee, role: string): Employee {
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return emp;
  }
  // Mask sensitive identity for Viewer
  return {
    ...emp,
    nik: emp.nik ? emp.nik.slice(0, 6) + '******' + emp.nik.slice(-4) : '',
    kk_number: emp.kk_number ? emp.kk_number.slice(0, 6) + '******' + emp.kk_number.slice(-4) : undefined,
    npwp: emp.npwp ? '**.***.***.*-' + emp.npwp.slice(-7) : undefined,
    bank_account: emp.bank_account ? '*********' + emp.bank_account.slice(-4) : undefined,
    bpjs_kesehatan: emp.bpjs_kesehatan ? '*********' + emp.bpjs_kesehatan.slice(-4) : undefined,
    bpjs_ketenagakerjaan: emp.bpjs_ketenagakerjaan ? '*********' + emp.bpjs_ketenagakerjaan.slice(-4) : undefined,
  };
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. Auth routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const db = getDatabase();

  const qUser = username?.trim().toLowerCase();
  const user = db.users.find(
    (u) =>
      u.username.toLowerCase() === qUser ||
      u.email.toLowerCase() === qUser ||
      (u.id === 'usr-1' && (qUser === 'admin.hrd' || qUser === 'admin hrd' || qUser === 'adminhrd' || qUser === 'superadmin' || qUser === 'admin' || qUser === 'widi' || qUser === 'rina' || qUser === 'rina anggraini'))
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Username atau Email tidak ditemukan.' });
  }

  if (user.status === 'NONAKTIF') {
    return res.status(403).json({ success: false, message: 'Akun Anda berstatus NONAKTIF. Hubungi Super Administrator.' });
  }

  // Password verification
  if (user.password && password && user.password !== password) {
    return res.status(401).json({ success: false, message: 'Kata sandi (password) yang Anda masukkan salah.' });
  }

  // Update last login
  user.last_login = new Date().toISOString();
  saveDatabase(db);

  addAuditLog(
    user,
    'LOGIN',
    'AUTH',
    `User ${user.name} (${user.role}) berhasil masuk ke dalam sistem.`,
    user.id,
    req
  );

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      last_login: user.last_login,
    },
  });
});

// Current user profile check
app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const db = getDatabase();
  const user = db.users.find((u) => u.id === userId) || db.users[0]; // fallback to super admin for seamless prototype
  res.json({ success: true, user });
});

// 2. Dashboard Statistics & Contract Alerts
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const db = getDatabase();
  const employees = db.employees;

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.employee_status === 'AKTIF').length;
  const inactiveEmployees = employees.filter((e) => e.employee_status === 'NONAKTIF').length;

  const maleCount = employees.filter((e) => e.gender === 'LAKI-LAKI').length;
  const femaleCount = employees.filter((e) => e.gender === 'PEREMPUAN').length;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // New employees added in the last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const newEmployeesThisMonth = employees.filter(
    (e) => new Date(e.created_at || e.join_date) >= thirtyDaysAgo
  ).length;

  // Contract expiry breakdown
  let expiringContracts30 = 0;
  let expiringContracts60 = 0;
  let expiringContracts90 = 0;

  employees.forEach((e) => {
    if (e.employee_status === 'AKTIF' && e.contract_end) {
      const end = new Date(e.contract_end);
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 30) expiringContracts30++;
      if (diffDays >= 0 && diffDays <= 60) expiringContracts60++;
      if (diffDays >= 0 && diffDays <= 90) expiringContracts90++;
    }
  });

  // Department distribution
  const departmentDistribution: { [key: string]: number } = {};
  employees.forEach((e) => {
    const dept = e.department || 'Lainnya';
    departmentDistribution[dept] = (departmentDistribution[dept] || 0) + 1;
  });

  // Employment status distribution
  const employmentStatusDistribution: { [key: string]: number } = {};
  employees.forEach((e) => {
    const status = e.employment_status || 'TETAP';
    employmentStatusDistribution[status] = (employmentStatusDistribution[status] || 0) + 1;
  });

  // Monthly Growth (Past 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthlyGrowth: { month: string; count: number; active: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const mName = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    const countAtPoint = employees.filter((e) => new Date(e.join_date) <= new Date(currentYear, currentMonth - i + 1, 0)).length;
    const activeAtPoint = employees.filter(
      (e) => new Date(e.join_date) <= new Date(currentYear, currentMonth - i + 1, 0) && (!e.deactivation_date || new Date(e.deactivation_date) > new Date(currentYear, currentMonth - i + 1, 0))
    ).length;

    monthlyGrowth.push({
      month: mName,
      count: countAtPoint,
      active: activeAtPoint,
    });
  }

  // Data quality issues
  let dataQualityIssuesCount = 0;
  employees.forEach((e) => {
    if (!e.nik || e.nik.length < 16) dataQualityIssuesCount++;
    if (!e.phone || !e.email) dataQualityIssuesCount++;
    if (!e.join_date) dataQualityIssuesCount++;
    if (e.employment_status === 'KONTRAK' && !e.contract_end) dataQualityIssuesCount++;
  });

  res.json({
    success: true,
    stats: {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      newEmployeesThisMonth,
      maleCount,
      femaleCount,
      expiringContracts30,
      expiringContracts60,
      expiringContracts90,
      departmentDistribution,
      employmentStatusDistribution,
      monthlyGrowth,
      dataQualityIssuesCount,
    },
  });
});

// 3. Employee CRUD API
// List with search, filter, pagination
app.get('/api/employees', (req: Request, res: Response) => {
  const db = getDatabase();
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';

  const {
    q,
    status,
    department,
    position,
    gender,
    employment_status,
    contract_alert,
    sort_by = 'created_at',
    sort_dir = 'desc',
    page = '1',
    limit = '10',
  } = req.query;

  let list = [...db.employees];

  // Search filter (name, NIK, employee_number, position, department, phone)
  if (q && typeof q === 'string' && q.trim()) {
    const query = q.toLowerCase().trim();
    list = list.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        (e.nickname && e.nickname.toLowerCase().includes(query)) ||
        e.employee_number.toLowerCase().includes(query) ||
        e.nik.toLowerCase().includes(query) ||
        (e.position && e.position.toLowerCase().includes(query)) ||
        (e.department && e.department.toLowerCase().includes(query)) ||
        (e.phone && e.phone.toLowerCase().includes(query))
    );
  }

  // Status filter
  if (status && status !== 'SEMUA') {
    list = list.filter((e) => e.employee_status === status);
  }

  // Department filter
  if (department && department !== 'SEMUA') {
    list = list.filter((e) => e.department === department);
  }

  // Position filter
  if (position && position !== 'SEMUA') {
    list = list.filter((e) => e.position === position);
  }

  // Gender filter
  if (gender && gender !== 'SEMUA') {
    list = list.filter((e) => e.gender === gender);
  }

  // Employment status filter (TETAP, KONTRAK, etc.)
  if (employment_status && employment_status !== 'SEMUA') {
    list = list.filter((e) => e.employment_status === employment_status);
  }

  // Contract alert filter (30, 60, 90 days)
  if (contract_alert) {
    const days = parseInt(contract_alert as string, 10) || 30;
    const now = new Date();
    list = list.filter((e) => {
      if (e.employee_status !== 'AKTIF' || !e.contract_end) return false;
      const end = new Date(e.contract_end);
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= days;
    });
  }

  // Sorting
  list.sort((a: any, b: any) => {
    let valA = a[sort_by as string] || '';
    let valB = b[sort_by as string] || '';
    if (sort_dir === 'asc') {
      return valA > valB ? 1 : -1;
    }
    return valA < valB ? 1 : -1;
  });

  const total = list.length;
  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.max(1, parseInt(limit as string, 10));
  const totalPages = Math.ceil(total / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = list.slice(startIndex, startIndex + limitNum);

  // Sanitize for role
  const sanitizedList = paginated.map((emp) => sanitizeEmployeeForRole(emp, role));

  res.json({
    success: true,
    data: sanitizedList,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    },
  });
});

// Get Single Employee by ID
app.get('/api/employees/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  const emp = db.employees.find((e) => e.id === req.params.id || e.employee_number === req.params.id);

  if (!emp) {
    return res.status(404).json({ success: false, message: 'Data pegawai tidak ditemukan.' });
  }

  res.json({
    success: true,
    data: sanitizeEmployeeForRole(emp, role),
  });
});

// Create Employee
app.post('/api/employees', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role === 'VIEWER') {
    return res.status(403).json({ success: false, message: 'Hak akses Viewer tidak diizinkan menambah pegawai.' });
  }

  const db = getDatabase();
  const body = req.body;

  // Validation
  if (!body.name || !body.nik || !body.join_date || !body.position || !body.department) {
    return res.status(400).json({ success: false, message: 'Kolom Nama, NIK, Tanggal Masuk, Jabatan, dan Departemen wajib diisi.' });
  }

  // Check duplicate NIK
  const existingNik = db.employees.find((e) => e.nik === body.nik);
  if (existingNik) {
    return res.status(400).json({ success: false, message: `NIK ${body.nik} sudah terdaftar atas nama ${existingNik.name}.` });
  }

  // Generate employee number if not provided
  const year = new Date(body.join_date || new Date()).getFullYear();
  const countSameYear = db.employees.filter((e) => e.employee_number?.includes(`-${year}-`)).length + 1;
  const seq = String(countSameYear).padStart(3, '0');
  const generatedNumber = body.employee_number || `YAS-${year}-${seq}`;

  const newEmployee: Employee = {
    ...body,
    id: 'emp-' + Date.now(),
    employee_number: generatedNumber,
    employee_status: body.employee_status || 'AKTIF',
    employment_status: body.employment_status || 'TETAP',
    gender: body.gender || 'LAKI-LAKI',
    regency: body.regency || 'Kabupaten Karawang',
    province: body.province || 'Jawa Barat',
    educations: body.educations || [],
    work_histories: body.work_histories || [],
    family_members: body.family_members || [],
    emergency_contacts: body.emergency_contacts || [],
    documents: body.documents || [],
    history_logs: [
      {
        id: 'hist-' + Date.now(),
        employee_id: 'emp-' + Date.now(),
        action: 'TAMBAH',
        new_value: `Pendaftaran Pegawai Baru: ${body.name} (${generatedNumber})`,
        reason: 'Perekrutan Baru',
        effective_date: body.join_date,
        created_by: (req.headers['x-user-name'] as string) || 'Admin',
        created_at: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.employees.unshift(newEmployee);
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'TAMBAH_PEGAWAI',
    'PEGAWAI',
    `Menambahkan pegawai baru: ${newEmployee.name} (${newEmployee.employee_number}) - Dept: ${newEmployee.department}`,
    newEmployee.id,
    req
  );

  res.status(201).json({ success: true, message: 'Pegawai baru berhasil didaftarkan.', data: newEmployee });
});

// Update Employee
app.put('/api/employees/:id', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role === 'VIEWER') {
    return res.status(403).json({ success: false, message: 'Hak akses Viewer tidak diizinkan mengubah data pegawai.' });
  }

  const db = getDatabase();
  const index = db.employees.findIndex((e) => e.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Data pegawai tidak ditemukan.' });
  }

  const oldData = db.employees[index];
  const updatedData: Employee = {
    ...oldData,
    ...req.body,
    id: oldData.id, // Preserve ID
    updated_at: new Date().toISOString(),
  };

  // Detect critical changes for history
  const historyLogs = [...(oldData.history_logs || [])];
  if (oldData.position !== updatedData.position || oldData.department !== updatedData.department) {
    historyLogs.unshift({
      id: 'hist-' + Date.now(),
      employee_id: oldData.id,
      action: 'MUTASI',
      old_value: `${oldData.position} (${oldData.department})`,
      new_value: `${updatedData.position} (${updatedData.department})`,
      reason: req.body.mutation_reason || 'Pembaruan Struktur & Penugasan',
      effective_date: new Date().toISOString().split('T')[0],
      created_by: (req.headers['x-user-name'] as string) || 'Admin',
      created_at: new Date().toISOString(),
    });
  }

  updatedData.history_logs = historyLogs;
  db.employees[index] = updatedData;
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'EDIT_PEGAWAI',
    'PEGAWAI',
    `Memperbarui biodata & data kepegawaian: ${updatedData.name} (${updatedData.employee_number})`,
    updatedData.id,
    req
  );

  res.json({ success: true, message: 'Data pegawai berhasil diperbarui.', data: updatedData });
});

// Deactivate Employee (AKTIF -> NONAKTIF)
app.post('/api/employees/:id/deactivate', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role === 'VIEWER') {
    return res.status(403).json({ success: false, message: 'Hak akses Viewer tidak dapat menonaktifkan pegawai.' });
  }

  const { deactivation_date, deactivation_reason, deactivation_note } = req.body;
  if (!deactivation_reason) {
    return res.status(400).json({ success: false, message: 'Alasan penonaktifan wajib diisi.' });
  }

  const db = getDatabase();
  const emp = db.employees.find((e) => e.id === req.params.id);

  if (!emp) {
    return res.status(404).json({ success: false, message: 'Data pegawai tidak ditemukan.' });
  }

  emp.employee_status = 'NONAKTIF';
  emp.deactivation_date = deactivation_date || new Date().toISOString().split('T')[0];
  emp.deactivation_reason = deactivation_reason;
  emp.deactivation_note = deactivation_note || '';
  emp.updated_at = new Date().toISOString();

  if (!emp.history_logs) emp.history_logs = [];
  emp.history_logs.unshift({
    id: 'hist-' + Date.now(),
    employee_id: emp.id,
    action: 'NONAKTIF',
    old_value: 'Status: AKTIF',
    new_value: `Status: NONAKTIF (${deactivation_reason})`,
    reason: deactivation_note || deactivation_reason,
    effective_date: emp.deactivation_date,
    created_by: (req.headers['x-user-name'] as string) || 'Admin',
    created_at: new Date().toISOString(),
  });

  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'NONAKTIFKAN_PEGAWAI',
    'PEGAWAI',
    `Menonaktifkan pegawai ${emp.name} (${emp.employee_number}) - Alasan: ${deactivation_reason}. Arsip data tetap aman.`,
    emp.id,
    req
  );

  res.json({ success: true, message: `Pegawai ${emp.name} berhasil diubah menjadi NONAKTIF dan diarsipkan.`, data: emp });
});

// Re-activate Employee (NONAKTIF -> AKTIF)
app.post('/api/employees/:id/activate', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role === 'VIEWER') {
    return res.status(403).json({ success: false, message: 'Hak akses Viewer tidak dapat mengaktifkan kembali pegawai.' });
  }

  const { activation_date, position, department, note } = req.body;
  const db = getDatabase();
  const emp = db.employees.find((e) => e.id === req.params.id);

  if (!emp) {
    return res.status(404).json({ success: false, message: 'Data pegawai tidak ditemukan.' });
  }

  emp.employee_status = 'AKTIF';
  if (position) emp.position = position;
  if (department) emp.department = department;
  emp.deactivation_date = undefined;
  emp.deactivation_reason = undefined;
  emp.deactivation_note = undefined;
  emp.updated_at = new Date().toISOString();

  if (!emp.history_logs) emp.history_logs = [];
  emp.history_logs.unshift({
    id: 'hist-' + Date.now(),
    employee_id: emp.id,
    action: 'AKTIF_KEMBALI',
    old_value: 'Status: NONAKTIF',
    new_value: `Status: AKTIF Kembali sebagai ${emp.position} (${emp.department})`,
    reason: note || 'Pengaktifan kembali pegawai',
    effective_date: activation_date || new Date().toISOString().split('T')[0],
    created_by: (req.headers['x-user-name'] as string) || 'Admin',
    created_at: new Date().toISOString(),
  });

  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'AKTIFKAN_KEMBALI_PEGAWAI',
    'PEGAWAI',
    `Mengaktifkan kembali pegawai ${emp.name} (${emp.employee_number}) sebagai ${emp.position}.`,
    emp.id,
    req
  );

  res.json({ success: true, message: `Pegawai ${emp.name} berhasil diaktifkan kembali.`, data: emp });
});

// Permanent Delete Employee (Super Admin only, as requested "fitur edit, Hapus")
app.delete('/api/employees/:id', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Administrator yang berhak menghapus data pegawai permanen.' });
  }

  const db = getDatabase();
  const index = db.employees.findIndex((e) => e.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Data pegawai tidak ditemukan.' });
  }

  const deleted = db.employees[index];
  db.employees.splice(index, 1);
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'HAPUS_PEGAWAI_PERMANEN',
    'PEGAWAI',
    `Menghapus permanen data pegawai: ${deleted.name} (${deleted.employee_number}) - NIK: ${deleted.nik}`,
    deleted.id,
    req
  );

  res.json({ success: true, message: `Data pegawai ${deleted.name} telah dihapus permanen dari sistem.` });
});

// Upload Document to Employee
app.post('/api/employees/:id/documents', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role === 'VIEWER') {
    return res.status(403).json({ success: false, message: 'Hak akses Viewer tidak dapat mengunggah dokumen.' });
  }

  const { document_type, document_name, file_name, file_size, file_data, file_type } = req.body;
  if (!document_type || !file_name) {
    return res.status(400).json({ success: false, message: 'Tipe dokumen dan file wajib disertakan.' });
  }

  const db = getDatabase();
  const emp = db.employees.find((e) => e.id === req.params.id);

  if (!emp) {
    return res.status(404).json({ success: false, message: 'Data pegawai tidak ditemukan.' });
  }

  const newDoc: EmployeeDocument = {
    id: 'doc-' + Date.now(),
    employee_id: emp.id,
    document_type,
    document_name: document_name || document_type,
    file_name,
    file_size: file_size || 102400,
    file_data: file_data || '',
    file_type: file_type || 'application/pdf',
    uploaded_by: (req.headers['x-user-name'] as string) || 'Admin',
    uploaded_at: new Date().toISOString(),
  };

  if (!emp.documents) emp.documents = [];
  emp.documents.push(newDoc);
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'UPLOAD_DOKUMEN',
    'DOKUMEN',
    `Mengunggah dokumen ${document_type} (${file_name}) untuk ${emp.name}`,
    emp.id,
    req
  );

  res.status(201).json({ success: true, message: 'Dokumen berhasil diunggah.', data: newDoc });
});

// Delete Document
app.delete('/api/employees/:employeeId/documents/:documentId', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role === 'VIEWER') {
    return res.status(403).json({ success: false, message: 'Hak akses Viewer tidak dapat menghapus dokumen.' });
  }

  const db = getDatabase();
  const emp = db.employees.find((e) => e.id === req.params.employeeId);

  if (!emp || !emp.documents) {
    return res.status(404).json({ success: false, message: 'Dokumen atau Pegawai tidak ditemukan.' });
  }

  const docIndex = emp.documents.findIndex((d) => d.id === req.params.documentId);
  if (docIndex === -1) {
    return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan.' });
  }

  const deletedDoc = emp.documents[docIndex];
  emp.documents.splice(docIndex, 1);
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'HAPUS_DOKUMEN',
    'DOKUMEN',
    `Menghapus dokumen ${deletedDoc.document_type} (${deletedDoc.file_name}) dari ${emp.name}`,
    emp.id,
    req
  );

  res.json({ success: true, message: 'Dokumen berhasil dihapus.' });
});

// Batch Import Employees (Excel / CSV)
app.post('/api/employees/batch-import', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role === 'VIEWER') {
    return res.status(403).json({ success: false, message: 'Hak akses Viewer tidak dapat melakukan import data.' });
  }

  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Data import tidak boleh kosong.' });
  }

  const db = getDatabase();
  const createdList: Employee[] = [];
  const errors: { row: number; name: string; reason: string }[] = [];

  items.forEach((item, idx) => {
    if (!item.name || !item.nik || !item.position || !item.department) {
      errors.push({
        row: idx + 1,
        name: item.name || 'Tanpa Nama',
        reason: 'Kolom Nama, NIK, Jabatan, dan Departemen wajib diisi.',
      });
      return;
    }

    // Check duplicate in DB or in current batch
    const exists = db.employees.some((e) => e.nik === String(item.nik).trim()) || createdList.some((e) => e.nik === String(item.nik).trim());
    if (exists) {
      errors.push({
        row: idx + 1,
        name: item.name,
        reason: `NIK ${item.nik} sudah terdaftar dalam sistem.`,
      });
      return;
    }

    const year = new Date().getFullYear();
    const count = db.employees.length + createdList.length + 1;
    const generatedNumber = item.employee_number || `YAS-${year}-${String(count).padStart(3, '0')}`;

    const newEmp: Employee = {
      id: 'emp-' + Date.now() + '-' + idx,
      employee_number: generatedNumber,
      nik: String(item.nik).trim(),
      name: item.name,
      nickname: item.nickname || item.name.split(' ')[0],
      gender: item.gender === 'PEREMPUAN' ? 'PEREMPUAN' : 'LAKI-LAKI',
      phone: String(item.phone || '081200000000'),
      email: item.email || `${item.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@yas.co.id`,
      address: item.address || 'Kabupaten Karawang',
      regency: item.regency || 'Kabupaten Karawang',
      province: item.province || 'Jawa Barat',
      join_date: item.join_date || new Date().toISOString().split('T')[0],
      position: item.position,
      department: item.department,
      employment_status: (item.employment_status as any) || 'TETAP',
      employee_status: (item.employee_status as any) || 'AKTIF',
      last_education: item.last_education || 'S1',
      major: item.major || 'Umum',
      educations: [],
      work_histories: [],
      family_members: [],
      emergency_contacts: [],
      documents: [],
      history_logs: [
        {
          id: 'hist-' + Date.now() + '-' + idx,
          employee_id: 'emp-' + Date.now() + '-' + idx,
          action: 'TAMBAH',
          new_value: `Import Data Excel/CSV: ${item.name}`,
          reason: 'Import Massal',
          effective_date: new Date().toISOString().split('T')[0],
          created_by: (req.headers['x-user-name'] as string) || 'Admin',
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    createdList.push(newEmp);
  });

  if (createdList.length > 0) {
    db.employees.unshift(...createdList);
    saveDatabase(db);

    addAuditLog(
      {
        id: (req.headers['x-user-id'] as string) || 'usr-1',
        name: (req.headers['x-user-name'] as string) || 'Admin',
        role: role as any,
      },
      'IMPORT_PEGAWAI',
      'PEGAWAI',
      `Import massal ${createdList.length} data pegawai berhasil. Gagal/Dilewati: ${errors.length}.`,
      undefined,
      req
    );
  }

  res.json({
    success: true,
    message: `Berhasil mengimport ${createdList.length} pegawai.`,
    importedCount: createdList.length,
    errors,
  });
});

// 4. Audit Logs API
app.get('/api/audit-logs', (req: Request, res: Response) => {
  const db = getDatabase();
  const { module, action, q } = req.query;

  let logs = [...db.audit_logs];

  if (module && module !== 'SEMUA') {
    logs = logs.filter((l) => l.module === module);
  }

  if (action && action !== 'SEMUA') {
    logs = logs.filter((l) => l.action === action);
  }

  if (q && typeof q === 'string' && q.trim()) {
    const query = q.toLowerCase().trim();
    logs = logs.filter(
      (l) =>
        l.description.toLowerCase().includes(query) ||
        l.user_name.toLowerCase().includes(query) ||
        l.action.toLowerCase().includes(query)
    );
  }

  res.json({ success: true, data: logs });
});

// 5. User Management API (Super Admin)
app.get('/api/users', (req: Request, res: Response) => {
  const db = getDatabase();
  res.json({ success: true, data: db.users });
});

app.post('/api/users', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat menambah pengguna baru.' });
  }

  const { name, username, email, role: newRole, password } = req.body;
  if (!name || !username || !email) {
    return res.status(400).json({ success: false, message: 'Nama, Username, dan Email wajib diisi.' });
  }

  const db = getDatabase();
  if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Username sudah digunakan.' });
  }

  const newUser: User = {
    id: 'usr-' + Date.now(),
    name,
    username: username.trim(),
    email: email.trim(),
    role: newRole || 'VIEWER',
    status: 'AKTIF',
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'TAMBAH_USER',
    'USER_MANAGEMENT',
    `Menambahkan pengguna baru: ${newUser.name} (${newUser.username}) dengan role ${newUser.role}.`,
    newUser.id,
    req
  );

  res.status(201).json({ success: true, message: 'Pengguna baru berhasil ditambahkan.', data: newUser });
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat mengubah pengguna.' });
  }

  const db = getDatabase();
  const user = db.users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
  }

  if (req.body.name) user.name = req.body.name;
  if (req.body.username) user.username = req.body.username;
  if (req.body.role) user.role = req.body.role;
  if (req.body.status) user.status = req.body.status;
  if (req.body.email) user.email = req.body.email;
  if (req.body.password) (user as any).password = req.body.password;
  user.updated_at = new Date().toISOString();

  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'EDIT_USER',
    'USER_MANAGEMENT',
    `Memperbarui akun pengguna: ${user.name} (${user.username}) - Role: ${user.role}, Status: ${user.status}`,
    user.id,
    req
  );

  res.json({ success: true, message: 'Akun pengguna berhasil diperbarui.', data: user });
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat menghapus pengguna.' });
  }

  const db = getDatabase();
  if (req.params.id === 'usr-1') {
    return res.status(400).json({ success: false, message: 'Akun Utama Super Administrator tidak dapat dihapus.' });
  }

  const index = db.users.findIndex((u) => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
  }

  const deleted = db.users[index];
  db.users.splice(index, 1);
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'HAPUS_USER',
    'USER_MANAGEMENT',
    `Menghapus akun pengguna: ${deleted.name} (${deleted.username}).`,
    deleted.id,
    req
  );

  res.json({ success: true, message: `Pengguna ${deleted.name} telah dihapus.` });
});

// 6. Organization Settings API
app.get('/api/settings', (req: Request, res: Response) => {
  const db = getDatabase();
  res.json({ success: true, data: db.settings || defaultSettings });
});

app.put('/api/settings', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat mengubah pengaturan sistem.' });
  }

  const db = getDatabase();
  db.settings = { ...db.settings, ...req.body };

  // If admin account details were updated in Settings, sync to db.users usr-1
  if (req.body.admin_name || req.body.admin_username || req.body.admin_password || req.body.admin_role || req.body.admin_email) {
    const adminUser = db.users.find((u) => u.id === 'usr-1') || db.users[0];
    if (adminUser) {
      if (req.body.admin_name) adminUser.name = req.body.admin_name;
      if (req.body.admin_username) adminUser.username = req.body.admin_username;
      if (req.body.admin_email) adminUser.email = req.body.admin_email;
      if (req.body.admin_password) (adminUser as any).password = req.body.admin_password;
      if (req.body.admin_role) adminUser.role = req.body.admin_role;
      adminUser.updated_at = new Date().toISOString();
    }
  }

  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'UPDATE_PENGATURAN',
    'PENGATURAN',
    'Memperbarui konfigurasi profil organisasi dan sistem kepegawaian YAS.',
    undefined,
    req
  );

  res.json({ success: true, message: 'Pengaturan sistem berhasil disimpan.', data: db.settings });
});

// 7. Backup & Restore Database API
app.get('/api/backup', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat mengunduh backup database.' });
  }

  const db = getDatabase();
  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'BACKUP_DATABASE',
    'DATABASE',
    'Mengunduh cadangan lengkap (backup) database YAS HRIS.',
    undefined,
    req
  );

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=backup_yas_hris_${new Date().toISOString().split('T')[0]}.json`);
  res.json(db);
});

app.post('/api/restore', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat melakukan restore database.' });
  }

  const { backupData } = req.body;
  if (!backupData || !backupData.employees || !backupData.users) {
    return res.status(400).json({ success: false, message: 'Format data backup tidak valid.' });
  }

  saveDatabase(backupData);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'RESTORE_DATABASE',
    'DATABASE',
    `Melakukan pemulihan database: ${backupData.employees.length} pegawai dan ${backupData.users.length} pengguna dipulihkan.`,
    undefined,
    req
  );

  res.json({ success: true, message: 'Database berhasil dipulihkan secara utuh.' });
});

// CLOUD SYNC Endpoint (Synchronizes Firebase Firestore data with local storage)
app.post('/api/database/sync-cloud', (req: Request, res: Response) => {
  const { employees, settings, users, payroll } = req.body;
  const db = getDatabase();
  let updated = false;

  if (Array.isArray(employees)) {
    db.employees = employees;
    updated = true;
  }
  if (settings && typeof settings === 'object' && Object.keys(settings).length > 0) {
    db.settings = { ...db.settings, ...settings };
    updated = true;
  }
  if (Array.isArray(users) && users.length > 0) {
    db.users = users;
    updated = true;
  }
  if (Array.isArray(payroll)) {
    db.payroll = payroll;
    updated = true;
  }

  if (updated) {
    saveDatabase(db);
  }

  res.json({ success: true, message: 'Database berhasil disinkronkan dari Cloud Firestore.' });
});

// 8. Public Employee ID Card Verification Endpoint (Safe public info for QR code)
app.get('/api/public/verify-employee/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const emp = db.employees.find((e) => e.id === req.params.id || e.employee_number === req.params.id);

  if (!emp) {
    return res.status(404).json({ success: false, message: 'Data verifikasi kartu pegawai tidak ditemukan atau tidak valid.' });
  }

  // Only return public verification info (no salary, bank account, or full NIK)
  res.json({
    success: true,
    verified: true,
    company: 'YUNI ABADI SEJAHTERA (YAS) - KABUPATEN KARAWANG',
    employee_number: emp.employee_number,
    name: emp.name,
    position: emp.position,
    department: emp.department,
    employee_status: emp.employee_status,
    employment_status: emp.employment_status,
    join_date: emp.join_date,
    photo: emp.photo,
    verified_at: new Date().toISOString(),
  });
});

// 9. Finance & Payroll API
function generateInitialPayroll(employees: Employee[], month: string = 'Oktober', year: number = 2026): PayrollRecord[] {
  return employees
    .filter((e) => e.employee_status === 'AKTIF')
    .map((emp) => {
      let basic = 5257834; // UMK Karawang standard
      let posAllowance = 500000;

      const pLower = (emp.position || '').toLowerCase();
      if (pLower.includes('direktur') || pLower.includes('general manager')) {
        basic = 18500000;
        posAllowance = 4500000;
      } else if (pLower.includes('kepala') || pLower.includes('manajer') || pLower.includes('manager')) {
        basic = 12000000;
        posAllowance = 2500000;
      } else if (pLower.includes('supervisor') || pLower.includes('lead') || pLower.includes('koordinator')) {
        basic = 7800000;
        posAllowance = 1200000;
      } else if (pLower.includes('senior') || pLower.includes('spesialis')) {
        basic = 6500000;
        posAllowance = 800000;
      }

      const transportMeal = 850000;
      const attendance = 450000;
      const overtime = emp.employment_status === 'TETAP' ? 450000 : 750000;
      const bonus = 250000;
      const gross = basic + posAllowance + transportMeal + attendance + overtime + bonus;

      const bpjsKes = Math.round(basic * 0.01);
      const bpjsTk = Math.round(basic * 0.03);
      const pph21 = Math.round(gross > 6500000 ? (gross - 5400000) * 0.05 : 0);
      const loan = 0;
      const deductions = bpjsKes + bpjsTk + pph21 + loan;
      const net = gross - deductions;

      return {
        id: `pay-${emp.id}-${month.toLowerCase()}-${year}`,
        employee_id: emp.id,
        employee_number: emp.employee_number,
        employee_name: emp.name,
        department: emp.department || 'Operasional',
        position: emp.position || 'Staff',
        employment_status: emp.employment_status || 'TETAP',
        period_month: month,
        period_year: year,
        basic_salary: basic,
        allowance_position: posAllowance,
        allowance_transport_meal: transportMeal,
        allowance_attendance: attendance,
        overtime_pay: overtime,
        bonus,
        gross_salary: gross,
        deduction_bpjs_kesehatan: bpjsKes,
        deduction_bpjs_ketenagakerjaan: bpjsTk,
        deduction_tax_pph21: pph21,
        deduction_loan: loan,
        deduction_other: 0,
        total_deductions: deductions,
        net_salary: net,
        payment_status: 'DIBAYAR',
        payment_date: `${year}-10-25`,
        bank_name: emp.bank_name || 'Bank Mandiri',
        bank_account: emp.bank_account || '1730005849302',
        notes: 'Gaji pokok UMK Karawang & tunjangan resmi YAS',
        created_at: new Date().toISOString(),
      };
    });
}

// GET Payroll List
app.get('/api/finance/payroll', (req: Request, res: Response) => {
  const db = getDatabase();
  const month = (req.query.month as string) || 'Oktober';
  const year = req.query.year ? Number(req.query.year) : 2026;
  const department = req.query.department as string;
  const q = req.query.q as string;

  if (!db.payroll || db.payroll.length === 0) {
    db.payroll = generateInitialPayroll(db.employees, month, year);
    saveDatabase(db);
  }

  let list = db.payroll.filter((p) => p.period_month.toLowerCase() === month.toLowerCase() && p.period_year === year);

  // If no records for this specific month, auto-populate from active employees
  if (list.length === 0) {
    const newRecords = generateInitialPayroll(db.employees, month, year);
    db.payroll.push(...newRecords);
    saveDatabase(db);
    list = newRecords;
  }

  if (department && department !== 'SEMUA') {
    list = list.filter((p) => p.department === department);
  }

  if (q && q.trim()) {
    const term = q.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.employee_name.toLowerCase().includes(term) ||
        p.employee_number.toLowerCase().includes(term) ||
        p.position.toLowerCase().includes(term) ||
        p.department.toLowerCase().includes(term)
    );
  }

  const summary: FinanceSummary = {
    totalGrossPayroll: list.reduce((acc, p) => acc + (p.gross_salary || 0), 0),
    totalNetPayroll: list.reduce((acc, p) => acc + (p.net_salary || 0), 0),
    totalDeductions: list.reduce((acc, p) => acc + (p.total_deductions || 0), 0),
    totalBpjs: list.reduce((acc, p) => acc + (p.deduction_bpjs_kesehatan || 0) + (p.deduction_bpjs_ketenagakerjaan || 0), 0),
    totalOvertime: list.reduce((acc, p) => acc + (p.overtime_pay || 0), 0),
    paidCount: list.filter((p) => p.payment_status === 'DIBAYAR').length,
    pendingCount: list.filter((p) => p.payment_status !== 'DIBAYAR').length,
    totalEmployees: list.length,
  };

  res.json({ success: true, data: list, summary });
});

// UPDATE Payroll Record
app.put('/api/finance/payroll/:id', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role === 'VIEWER') {
    return res.status(403).json({ success: false, message: 'Hak akses Viewer tidak dapat mengubah data keuangan.' });
  }

  const db = getDatabase();
  if (!db.payroll) db.payroll = [];

  const index = db.payroll.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Data slip gaji tidak ditemukan.' });
  }

  const current = db.payroll[index];
  const updatedBody = req.body;

  // Recalculate totals
  const basic = Number(updatedBody.basic_salary ?? current.basic_salary);
  const posAllowance = Number(updatedBody.allowance_position ?? current.allowance_position);
  const transportMeal = Number(updatedBody.allowance_transport_meal ?? current.allowance_transport_meal);
  const attendance = Number(updatedBody.allowance_attendance ?? current.allowance_attendance);
  const overtime = Number(updatedBody.overtime_pay ?? current.overtime_pay);
  const bonus = Number(updatedBody.bonus ?? current.bonus);
  const gross = basic + posAllowance + transportMeal + attendance + overtime + bonus;

  const bpjsKes = Number(updatedBody.deduction_bpjs_kesehatan ?? current.deduction_bpjs_kesehatan);
  const bpjsTk = Number(updatedBody.deduction_bpjs_ketenagakerjaan ?? current.deduction_bpjs_ketenagakerjaan);
  const pph21 = Number(updatedBody.deduction_tax_pph21 ?? current.deduction_tax_pph21);
  const loan = Number(updatedBody.deduction_loan ?? current.deduction_loan);
  const otherDeduction = Number(updatedBody.deduction_other ?? current.deduction_other ?? 0);
  const totalDeductions = bpjsKes + bpjsTk + pph21 + loan + otherDeduction;
  const net = gross - totalDeductions;

  const updatedRecord: PayrollRecord = {
    ...current,
    ...updatedBody,
    basic_salary: basic,
    allowance_position: posAllowance,
    allowance_transport_meal: transportMeal,
    allowance_attendance: attendance,
    overtime_pay: overtime,
    bonus,
    gross_salary: gross,
    deduction_bpjs_kesehatan: bpjsKes,
    deduction_bpjs_ketenagakerjaan: bpjsTk,
    deduction_tax_pph21: pph21,
    deduction_loan: loan,
    deduction_other: otherDeduction,
    total_deductions: totalDeductions,
    net_salary: net,
    updated_at: new Date().toISOString(),
  };

  db.payroll[index] = updatedRecord;
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'UPDATE_PAYROLL',
    'KEUANGAN',
    `Memperbarui slip gaji ${updatedRecord.employee_name} periode ${updatedRecord.period_month} ${updatedRecord.period_year} (THP: Rp ${net.toLocaleString('id-ID')}).`,
    updatedRecord.id,
    req
  );

  res.json({ success: true, message: 'Data penggajian berhasil diperbarui.', data: updatedRecord });
});

// BULK GENERATE Payroll for Month/Year
app.post('/api/finance/payroll/bulk-generate', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role === 'VIEWER') {
    return res.status(403).json({ success: false, message: 'Hak akses Viewer tidak dapat generate gaji.' });
  }

  const { month = 'Oktober', year = 2026 } = req.body;
  const db = getDatabase();
  if (!db.payroll) db.payroll = [];

  // Remove existing records for this period and re-generate
  db.payroll = db.payroll.filter((p) => !(p.period_month.toLowerCase() === month.toLowerCase() && p.period_year === year));
  const newRecords = generateInitialPayroll(db.employees, month, year);
  db.payroll.push(...newRecords);
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'GENERATE_PAYROLL',
    'KEUANGAN',
    `Generate massal data gaji periode ${month} ${year} untuk ${newRecords.length} pegawai aktif.`,
    undefined,
    req
  );

  res.json({
    success: true,
    message: `Berhasil generate penggajian periode ${month} ${year} untuk ${newRecords.length} pegawai.`,
    count: newRecords.length,
    data: newRecords,
  });
});

// SUMMARY Finance
app.get('/api/finance/summary', (req: Request, res: Response) => {
  const db = getDatabase();
  const month = (req.query.month as string) || 'Oktober';
  const year = req.query.year ? Number(req.query.year) : 2026;

  if (!db.payroll || db.payroll.length === 0) {
    db.payroll = generateInitialPayroll(db.employees, month, year);
    saveDatabase(db);
  }

  const list = db.payroll.filter((p) => p.period_month.toLowerCase() === month.toLowerCase() && p.period_year === year);

  const summary: FinanceSummary = {
    totalGrossPayroll: list.reduce((acc, p) => acc + (p.gross_salary || 0), 0),
    totalNetPayroll: list.reduce((acc, p) => acc + (p.net_salary || 0), 0),
    totalDeductions: list.reduce((acc, p) => acc + (p.total_deductions || 0), 0),
    totalBpjs: list.reduce((acc, p) => acc + (p.deduction_bpjs_kesehatan || 0) + (p.deduction_bpjs_ketenagakerjaan || 0), 0),
    totalOvertime: list.reduce((acc, p) => acc + (p.overtime_pay || 0), 0),
    paidCount: list.filter((p) => p.payment_status === 'DIBAYAR').length,
    pendingCount: list.filter((p) => p.payment_status !== 'DIBAYAR').length,
    totalEmployees: list.length,
  };

  res.json({ success: true, summary });
});

// DELETE Payroll record
app.delete('/api/finance/payroll/:id', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role === 'VIEWER') {
    return res.status(403).json({ success: false, message: 'Hak akses Viewer tidak dapat menghapus data gaji.' });
  }

  const db = getDatabase();
  if (!db.payroll) db.payroll = [];

  const index = db.payroll.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Data slip gaji tidak ditemukan.' });
  }

  const deleted = db.payroll[index];
  db.payroll.splice(index, 1);
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'HAPUS_PAYROLL',
    'KEUANGAN',
    `Menghapus data slip gaji ${deleted.employee_name} periode ${deleted.period_month} ${deleted.period_year}.`,
    deleted.id,
    req
  );

  res.json({ success: true, message: `Data slip gaji ${deleted.employee_name} berhasil dihapus.` });
});

// CLEAR / RESET Payroll for period
app.post('/api/finance/payroll/clear', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Admin yang dapat mengosongkan data penggajian.' });
  }

  const { month, year } = req.body;
  const db = getDatabase();
  if (!db.payroll) db.payroll = [];

  const initialCount = db.payroll.length;
  if (month && year) {
    db.payroll = db.payroll.filter((p) => !(p.period_month.toLowerCase() === String(month).toLowerCase() && p.period_year === Number(year)));
  } else {
    db.payroll = [];
  }
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'KOSONGKAN_PAYROLL',
    'KEUANGAN',
    `Mengosongkan data slip gaji periode ${month || 'Semua'} ${year || ''}.`,
    undefined,
    req
  );

  res.json({
    success: true,
    message: `Data gaji periode ${month || 'Semua'} ${year || ''} berhasil dikosongkan.`,
    removedCount: initialCount - db.payroll.length,
  });
});

// EDIT Employee Document
app.put('/api/employees/:employeeId/documents/:documentId', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role === 'VIEWER') {
    return res.status(403).json({ success: false, message: 'Hak akses Viewer tidak dapat mengubah dokumen.' });
  }

  const db = getDatabase();
  const emp = db.employees.find((e) => e.id === req.params.employeeId);
  if (!emp || !emp.documents) {
    return res.status(404).json({ success: false, message: 'Pegawai atau dokumen tidak ditemukan.' });
  }

  const doc = emp.documents.find((d) => d.id === req.params.documentId);
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan.' });
  }

  if (req.body.document_name) doc.document_name = req.body.document_name;
  if (req.body.document_type) doc.document_type = req.body.document_type;
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'EDIT_DOKUMEN',
    'DOKUMEN',
    `Memperbarui keterangan dokumen ${doc.document_type} milik ${emp.name}.`,
    emp.id,
    req
  );

  res.json({ success: true, message: 'Keterangan dokumen berhasil diperbarui.', data: doc });
});

// CLEAR ALL Documents
app.post('/api/documents/clear-all', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat mengosongkan seluruh dokumen.' });
  }

  const db = getDatabase();
  let count = 0;
  db.employees.forEach((e) => {
    if (e.documents && e.documents.length > 0) {
      count += e.documents.length;
      e.documents = [];
    }
  });
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'KOSONGKAN_DOKUMEN',
    'DOKUMEN',
    `Mengosongkan seluruh arsip dokumen (${count} berkas) dari sistem.`,
    undefined,
    req
  );

  res.json({ success: true, message: `Berhasil mengosongkan ${count} berkas dokumen pegawai.`, count });
});

// BULK DELETE Documents
app.post('/api/documents/bulk-delete', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Hak akses tidak mencukupi untuk menghapus dokumen.' });
  }

  const { items } = req.body; // Array of { employee_id: string, document_id: string }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Pilih minimal satu dokumen untuk dihapus.' });
  }

  const db = getDatabase();
  let deletedCount = 0;

  items.forEach((item) => {
    const emp = db.employees.find((e) => e.id === item.employee_id);
    if (emp && emp.documents) {
      const idx = emp.documents.findIndex((d) => d.id === item.document_id);
      if (idx !== -1) {
        emp.documents.splice(idx, 1);
        deletedCount++;
      }
    }
  });

  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'HAPUS_DOKUMEN_MASSAL',
    'DOKUMEN',
    `Menghapus ${deletedCount} dokumen pegawai secara massal.`,
    undefined,
    req
  );

  res.json({ success: true, message: `Berhasil menghapus ${deletedCount} dokumen terpilih.`, count: deletedCount });
});

// EDIT Employee Contract
app.post('/api/employees/:id/contract', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role === 'VIEWER') {
    return res.status(403).json({ success: false, message: 'Hak akses Viewer tidak dapat memperbarui kontrak.' });
  }

  const db = getDatabase();
  const emp = db.employees.find((e) => e.id === req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Data pegawai tidak ditemukan.' });
  }

  const { contract_type, contract_number, contract_start, contract_end } = req.body;
  emp.contract_type = contract_type || emp.contract_type;
  emp.contract_number = contract_number || emp.contract_number;
  emp.contract_start = contract_start || emp.contract_start;
  emp.contract_end = contract_end || emp.contract_end;
  emp.updated_at = new Date().toISOString();
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'UPDATE_KONTRAK',
    'KONTRAK',
    `Memperbarui masa kontrak pegawai ${emp.name}: s/d ${emp.contract_end || '-'}.`,
    emp.id,
    req
  );

  res.json({ success: true, message: `Data kontrak pegawai ${emp.name} berhasil diperbarui.`, data: emp });
});

// DELETE / RESET Employee Contract
app.delete('/api/employees/:id/contract', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role === 'VIEWER') {
    return res.status(403).json({ success: false, message: 'Hak akses Viewer tidak dapat menghapus kontrak.' });
  }

  const db = getDatabase();
  const emp = db.employees.find((e) => e.id === req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Data pegawai tidak ditemukan.' });
  }

  emp.contract_end = undefined;
  emp.contract_start = undefined;
  emp.contract_number = undefined;
  emp.contract_type = undefined;
  emp.updated_at = new Date().toISOString();
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'HAPUS_KONTRAK',
    'KONTRAK',
    `Menghapus catatan tanggal kontrak pegawai ${emp.name}.`,
    emp.id,
    req
  );

  res.json({ success: true, message: `Data kontrak pegawai ${emp.name} berhasil dihapus/dikosongkan.`, data: emp });
});

// EDIT single audit log
app.put('/api/audit-logs/:id', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat mengubah log audit.' });
  }

  const db = getDatabase();
  const log = db.audit_logs.find((l) => l.id === req.params.id);
  if (!log) {
    return res.status(404).json({ success: false, message: 'Log audit tidak ditemukan.' });
  }

  if (req.body.description) log.description = req.body.description;
  if (req.body.action) log.action = req.body.action;
  saveDatabase(db);

  res.json({ success: true, message: 'Catatan log audit berhasil diperbarui.', data: log });
});

// DELETE single audit log
app.delete('/api/audit-logs/:id', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat menghapus log audit.' });
  }

  const db = getDatabase();
  const index = db.audit_logs.findIndex((l) => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Log audit tidak ditemukan.' });
  }

  const deleted = db.audit_logs[index];
  db.audit_logs.splice(index, 1);
  saveDatabase(db);

  res.json({ success: true, message: 'Baris log audit berhasil dihapus.', data: deleted });
});

// CLEAR / EMPTY all audit logs
app.post('/api/audit-logs/clear', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat mengosongkan log audit.' });
  }

  const db = getDatabase();
  const count = db.audit_logs.length;
  db.audit_logs = [
    {
      id: 'log-' + Date.now(),
      user_id: (req.headers['x-user-id'] as string) || 'usr-1',
      user_name: (req.headers['x-user-name'] as string) || 'Super Admin',
      user_role: 'SUPER_ADMIN',
      action: 'KOSONGKAN_AUDIT_LOG',
      module: 'AUDIT',
      description: `Seluruh riwayat log audit (${count} baris) telah dibersihkan / dikosongkan.`,
      created_at: new Date().toISOString(),
    },
  ];
  saveDatabase(db);

  res.json({ success: true, message: `Berhasil membersihkan ${count} catatan log audit.`, count });
});

// RESET Users to Seed
app.post('/api/users/reset', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat mereset pengguna.' });
  }

  const db = getDatabase();
  db.users = [...defaultUsers];
  saveDatabase(db);

  addAuditLog(
    {
      id: 'usr-1',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'RESET_PENGGUNA',
    'USER_MANAGEMENT',
    'Mereset seluruh akun pengguna ke setelan default pabrik.',
    undefined,
    req
  );

  res.json({ success: true, message: 'Daftar pengguna berhasil direset ke akun bawaan pabrik.', data: db.users });
});

// RESET / EMPTY Employees
app.post('/api/employees/reset-all', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang berhak mereset seluruh data pegawai.' });
  }

  const rawAction = req.body.action || req.body.mode;
  const isClear = rawAction === 'empty' || rawAction === 'clear';
  const db = getDatabase();

  if (isClear) {
    db.employees = [];
  } else {
    db.employees = [...defaultEmployees];
  }
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'RESET_PEGAWAI',
    'PEGAWAI',
    isClear ? 'Mengosongkan seluruh database pegawai (0 data).' : 'Mereset data pegawai ke data standar pabrik YAS.',
    undefined,
    req
  );

  res.json({
    success: true,
    message: isClear ? 'Seluruh data pegawai telah dikosongkan.' : 'Data pegawai berhasil direset ke data pabrik.',
    count: db.employees.length,
    data: db.employees,
  });
});

// BATCH DELETE Employees
app.post('/api/employees/batch-delete', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Tidak memiliki hak akses untuk menghapus pegawai.' });
  }

  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Pilih minimal satu pegawai untuk dihapus.' });
  }

  const db = getDatabase();
  const initial = db.employees.length;
  db.employees = db.employees.filter((e) => !ids.includes(e.id));
  const deletedCount = initial - db.employees.length;
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'HAPUS_PEGAWAI_MASSAL',
    'PEGAWAI',
    `Menghapus ${deletedCount} pegawai terpilih dari sistem secara massal.`,
    undefined,
    req
  );

  res.json({ success: true, message: `Berhasil menghapus ${deletedCount} data pegawai terpilih.`, count: deletedCount });
});

// RESET Settings to Defaults
app.post('/api/settings/reset', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat mereset pengaturan sistem.' });
  }

  const db = getDatabase();
  db.settings = { ...defaultSettings };
  saveDatabase(db);

  addAuditLog(
    {
      id: 'usr-1',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'RESET_PENGATURAN',
    'PENGATURAN',
    'Mereset seluruh pengaturan sistem ke setelan bawaan standar.',
    undefined,
    req
  );

  res.json({ success: true, message: 'Pengaturan sistem berhasil dikembalikan ke setelan default pabrik.', data: db.settings });
});

// FACTORY RESET entire database
app.post('/api/database/factory-reset', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang berhak melakukan factory reset database.' });
  }

  const freshDb: DatabaseSchema = {
    users: [...defaultUsers],
    employees: [...defaultEmployees],
    audit_logs: [
      {
        id: 'log-factory-' + Date.now(),
        user_id: 'usr-1',
        user_name: 'Super Admin',
        user_role: 'SUPER_ADMIN',
        action: 'FACTORY_RESET',
        module: 'DATABASE',
        description: 'Sistem telah direset total ke setelan pabrik default YAS Karawang.',
        created_at: new Date().toISOString(),
      },
    ],
    settings: { ...defaultSettings },
    payroll: [],
  };

  saveDatabase(freshDb);

  res.json({
    success: true,
    message: 'Factory Reset berhasil. Seluruh database telah dipulihkan ke setelan pabrik.',
    data: freshDb,
  });
});

// DELETE single payroll
app.delete('/api/finance/payroll/:id', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role === 'VIEWER') {
    return res.status(403).json({ success: false, message: 'Hak akses Viewer tidak dapat menghapus data keuangan.' });
  }

  const db = getDatabase();
  if (!db.payroll) db.payroll = [];

  const index = db.payroll.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Data slip gaji tidak ditemukan.' });
  }

  const deleted = db.payroll[index];
  db.payroll.splice(index, 1);
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Admin',
      role: role as any,
    },
    'HAPUS_PAYROLL',
    'KEUANGAN',
    `Menghapus slip gaji ${deleted.employee_name} (${deleted.employee_number}) periode ${deleted.period_month} ${deleted.period_year}.`,
    deleted.id,
    req
  );

  res.json({ success: true, message: `Slip gaji ${deleted.employee_name} berhasil dihapus.` });
});

// CLEAR / RESET payroll for month/year or all
app.post('/api/finance/payroll/clear', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Administrator yang dapat mengosongkan data keuangan.' });
  }

  const { month, year, resetToDefault } = req.body;
  const db = getDatabase();

  if (resetToDefault) {
    db.payroll = generateInitialPayroll(db.employees, month || 'Oktober', year || 2026);
  } else if (month && year) {
    db.payroll = (db.payroll || []).filter(
      (p) => !(p.period_month.toLowerCase() === String(month).toLowerCase() && p.period_year === Number(year))
    );
  } else {
    db.payroll = [];
  }

  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'RESET_PAYROLL',
    'KEUANGAN',
    resetToDefault
      ? `Mereset data penggajian periode ${month || 'Oktober'} ${year || 2026} ke nilai default UMK Karawang.`
      : `Mengosongkan data penggajian periode ${month || 'Semua'} ${year || ''}.`,
    undefined,
    req
  );

  res.json({
    success: true,
    message: resetToDefault
      ? 'Data penggajian berhasil direset ke standar UMK Karawang.'
      : 'Data penggajian berhasil dikosongkan.',
    data: db.payroll,
  });
});

// DELETE single audit log
app.delete('/api/audit-logs/:id', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat menghapus log audit.' });
  }

  const db = getDatabase();
  const index = db.audit_logs.findIndex((l) => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Log audit tidak ditemukan.' });
  }

  db.audit_logs.splice(index, 1);
  saveDatabase(db);

  res.json({ success: true, message: 'Log audit berhasil dihapus.' });
});

// CLEAR / EMPTY all audit logs
app.post('/api/audit-logs/clear', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat mengosongkan riwayat audit log.' });
  }

  const db = getDatabase();
  const count = db.audit_logs.length;
  db.audit_logs = [
    {
      id: 'log-' + Date.now(),
      user_id: (req.headers['x-user-id'] as string) || 'usr-1',
      user_name: (req.headers['x-user-name'] as string) || 'Super Admin',
      user_role: 'SUPER_ADMIN',
      action: 'KOSONGKAN_AUDIT_LOG',
      module: 'AUDIT',
      details: `Mengosongkan seluruh riwayat log aktivitas (${count} rekaman dihapus).`,
      created_at: new Date().toISOString(),
    },
  ];
  saveDatabase(db);

  res.json({ success: true, message: `Seluruh riwayat audit log (${count} entri) berhasil dibersihkan.` });
});

// RESET users to defaults
app.post('/api/users/reset', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat mereset daftar pengguna.' });
  }

  const db = getDatabase();
  db.users = [...defaultUsers];
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'RESET_USER',
    'USER_MANAGEMENT',
    'Mereset seluruh akun pengguna ke akun default PT YAS Karawang.',
    undefined,
    req
  );

  res.json({ success: true, message: 'Daftar akun pengguna berhasil direset ke setelan awal.', data: db.users });
});

// RESET settings to defaults
app.post('/api/settings/reset', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat mereset pengaturan.' });
  }

  const db = getDatabase();
  db.settings = { ...defaultSettings };
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'RESET_PENGATURAN',
    'PENGATURAN',
    'Mereset seluruh pengaturan sistem ke setelan awal pabrik YAS Karawang.',
    undefined,
    req
  );

  res.json({ success: true, message: 'Pengaturan sistem berhasil dikembalikan ke standar awal YAS.', data: db.settings });
});

// RESET / RE-SEED Employees
app.post('/api/employees/reset-all', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang berhak mereset data pegawai.' });
  }

  const { mode = 'sample' } = req.body; // 'empty' or 'sample'
  const db = getDatabase();

  if (mode === 'empty') {
    db.employees = [];
  } else {
    db.employees = JSON.parse(JSON.stringify(defaultEmployees));
  }
  saveDatabase(db);

  addAuditLog(
    {
      id: (req.headers['x-user-id'] as string) || 'usr-1',
      name: (req.headers['x-user-name'] as string) || 'Super Admin',
      role: 'SUPER_ADMIN',
    },
    'RESET_PEGAWAI',
    'PEGAWAI',
    mode === 'empty'
      ? 'Mengosongkan seluruh data pegawai dari database.'
      : 'Mereset data pegawai ke data master bawaan PT Yuni Abadi Sejahtera.',
    undefined,
    req
  );

  res.json({
    success: true,
    message: mode === 'empty' ? 'Seluruh data pegawai telah dikosongkan.' : 'Data pegawai berhasil direset ke data sampel resmi YAS.',
    data: db.employees,
  });
});

// FACTORY RESET entire database
app.post('/api/database/factory-reset', (req: Request, res: Response) => {
  const role = (req.headers['x-user-role'] as string) || 'SUPER_ADMIN';
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang berhak melakukan factory reset.' });
  }

  const db: DatabaseSchema = {
    users: [...defaultUsers],
    employees: JSON.parse(JSON.stringify(defaultEmployees)),
    audit_logs: [
      {
        id: 'log-' + Date.now(),
        user_id: 'usr-1',
        user_name: 'Super Admin',
        user_role: 'SUPER_ADMIN',
        action: 'FACTORY_RESET',
        module: 'DATABASE',
        details: 'Melakukan reset pabrik seluruh database sistem YAS HRIS.',
        created_at: new Date().toISOString(),
      },
    ],
    settings: { ...defaultSettings },
    payroll: generateInitialPayroll(defaultEmployees, 'Oktober', 2026),
  };

  saveDatabase(db);

  res.json({
    success: true,
    message: 'Reset pabrik berhasil! Seluruh database dikembalikan ke data awal sistem YAS HRIS.',
    data: db,
  });
});

// ----------------------------------------------------
// Production / Dev Vite Middleware Setup
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[YAS HRIS] Server running on http://localhost:${PORT}`);
  });
}

startServer();
