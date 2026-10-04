import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  CreditCard,
  Briefcase,
  GraduationCap,
  Users,
  PhoneCall,
  Save,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  Building,
} from 'lucide-react';
import {
  Employee,
  EducationItem,
  WorkHistoryItem,
  FamilyMemberItem,
  EmergencyContactItem,
} from '../types';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Employee>) => Promise<void>;
  initialData?: Employee | null;
  mode: 'add' | 'edit';
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}) => {
  const [activeTab, setActiveTab] = useState<'biodata' | 'identitas' | 'kepegawaian' | 'pendidikan' | 'pekerjaan' | 'keluarga' | 'darurat'>('biodata');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    nickname: '',
    nik: '',
    kk_number: '',
    birth_place: 'Karawang',
    birth_date: '1995-01-01',
    gender: 'LAKI-LAKI',
    religion: 'ISLAM',
    marital_status: 'BELUM MENIKAH',
    phone: '',
    email: '',
    address: '',
    rt: '001',
    rw: '001',
    village: '',
    district: 'Klari',
    regency: 'Kabupaten Karawang',
    province: 'Jawa Barat',
    postal_code: '41371',
    photo: '',

    // Identitas
    npwp: '',
    bpjs_kesehatan: '',
    bpjs_ketenagakerjaan: '',
    bank_name: 'Bank Mandiri',
    bank_account: '',

    // Kepegawaian
    employee_number: '',
    join_date: new Date().toISOString().split('T')[0],
    appointment_date: '',
    position: '',
    department: 'Operasional',
    division: '',
    work_unit: 'Pusat Karawang',
    work_location: 'Kantor Pusat Karawang',
    direct_supervisor: '',
    employment_status: 'TETAP',
    employee_status: 'AKTIF',
    contract_type: 'PKWT',
    contract_number: '',
    contract_start: '',
    contract_end: '',
    last_education: 'S1',
    major: '',
    grade_level: 'Grade 2 - Staf',

    educations: [],
    work_histories: [],
    family_members: [],
    emergency_contacts: [
      { id: 'em-1', name: '', relationship: 'Orang Tua / Pasangan', phone: '', address: '' },
    ],
  });

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        ...initialData,
        educations: initialData.educations || [],
        work_histories: initialData.work_histories || [],
        family_members: initialData.family_members || [],
        emergency_contacts: initialData.emergency_contacts?.length
          ? initialData.emergency_contacts
          : [{ id: 'em-1', name: '', relationship: 'Keluarga', phone: '', address: '' }],
      });
    } else {
      setFormData({
        name: '',
        nickname: '',
        nik: '',
        kk_number: '',
        birth_place: 'Karawang',
        birth_date: '1995-01-01',
        gender: 'LAKI-LAKI',
        religion: 'ISLAM',
        marital_status: 'BELUM MENIKAH',
        phone: '',
        email: '',
        address: '',
        rt: '001',
        rw: '001',
        village: '',
        district: 'Klari',
        regency: 'Kabupaten Karawang',
        province: 'Jawa Barat',
        postal_code: '41371',
        photo: '',
        npwp: '',
        bpjs_kesehatan: '',
        bpjs_ketenagakerjaan: '',
        bank_name: 'Bank Mandiri',
        bank_account: '',
        employee_number: '',
        join_date: new Date().toISOString().split('T')[0],
        appointment_date: '',
        position: '',
        department: 'Operasional',
        division: '',
        work_unit: 'Pusat Karawang',
        work_location: 'Kantor Pusat Karawang',
        direct_supervisor: '',
        employment_status: 'TETAP',
        employee_status: 'AKTIF',
        contract_type: 'PKWT',
        contract_number: '',
        contract_start: '',
        contract_end: '',
        last_education: 'S1',
        major: '',
        grade_level: 'Grade 2 - Staf',
        educations: [],
        work_histories: [],
        family_members: [],
        emergency_contacts: [
          { id: 'em-1', name: '', relationship: 'Orang Tua / Pasangan', phone: '', address: '' },
        ],
      });
    }
    setErrorMsg('');
    setActiveTab('biodata');
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof Employee, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Image Upload helper
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran foto maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        handleInputChange('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Education Helpers
  const addEducationRow = () => {
    const newEdu: EducationItem = {
      id: 'edu-' + Date.now(),
      level: 'S1',
      institution: '',
      major: '',
      start_year: '2015',
      graduation_year: '2019',
      certificate_number: '',
    };
    setFormData((prev) => ({ ...prev, educations: [...(prev.educations || []), newEdu] }));
  };

  const removeEducationRow = (index: number) => {
    setFormData((prev) => {
      const list = [...(prev.educations || [])];
      list.splice(index, 1);
      return { ...prev, educations: list };
    });
  };

  const updateEducationRow = (index: number, field: keyof EducationItem, val: string) => {
    setFormData((prev) => {
      const list = [...(prev.educations || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, educations: list };
    });
  };

  // Work History Helpers
  const addWorkHistoryRow = () => {
    const newWh: WorkHistoryItem = {
      id: 'wh-' + Date.now(),
      company: '',
      position: '',
      department: '',
      start_date: '2020-01-01',
      end_date: '2023-01-01',
      description: '',
    };
    setFormData((prev) => ({ ...prev, work_histories: [...(prev.work_histories || []), newWh] }));
  };

  const removeWorkHistoryRow = (index: number) => {
    setFormData((prev) => {
      const list = [...(prev.work_histories || [])];
      list.splice(index, 1);
      return { ...prev, work_histories: list };
    });
  };

  const updateWorkHistoryRow = (index: number, field: keyof WorkHistoryItem, val: string) => {
    setFormData((prev) => {
      const list = [...(prev.work_histories || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, work_histories: list };
    });
  };

  // Family Member Helpers
  const addFamilyMemberRow = () => {
    const newFam: FamilyMemberItem = {
      id: 'fam-' + Date.now(),
      name: '',
      nik: '',
      relationship: 'Anak ke-1',
      gender: 'LAKI-LAKI',
      birth_date: '2020-01-01',
      occupation: '',
      phone: '',
    };
    setFormData((prev) => ({ ...prev, family_members: [...(prev.family_members || []), newFam] }));
  };

  const removeFamilyMemberRow = (index: number) => {
    setFormData((prev) => {
      const list = [...(prev.family_members || [])];
      list.splice(index, 1);
      return { ...prev, family_members: list };
    });
  };

  const updateFamilyMemberRow = (index: number, field: keyof FamilyMemberItem, val: string) => {
    setFormData((prev) => {
      const list = [...(prev.family_members || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, family_members: list };
    });
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!formData.name?.trim()) {
      setErrorMsg('Nama lengkap pegawai wajib diisi.');
      setActiveTab('biodata');
      return;
    }
    if (!formData.nik?.trim() || formData.nik.trim().length < 16) {
      setErrorMsg('NIK harus 16 digit angka sesuai KTP.');
      setActiveTab('biodata');
      return;
    }
    if (!formData.position?.trim()) {
      setErrorMsg('Jabatan pegawai wajib diisi.');
      setActiveTab('kepegawaian');
      return;
    }
    if (!formData.department) {
      setErrorMsg('Departemen pegawai wajib dipilih.');
      setActiveTab('kepegawaian');
      return;
    }
    if (!formData.join_date) {
      setErrorMsg('Tanggal masuk kerja wajib diisi.');
      setActiveTab('kepegawaian');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan data pegawai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'biodata', label: '1. Biodata Pribadi', icon: User },
    { id: 'identitas', label: '2. Pajak & Rekening', icon: CreditCard },
    { id: 'kepegawaian', label: '3. Data Kepegawaian', icon: Briefcase },
    { id: 'pendidikan', label: '4. Riwayat Pendidikan', icon: GraduationCap },
    { id: 'pekerjaan', label: '5. Pengalaman Kerja', icon: Building },
    { id: 'keluarga', label: '6. Data Keluarga', icon: Users },
    { id: 'darurat', label: '7. Kontak Darurat', icon: PhoneCall },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header with Title & Close */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#001f4d] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-blue-950 font-black">
              {mode === 'add' ? '+' : '✎'}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {mode === 'add' ? 'Tambah Data Pegawai Baru' : `Edit Data Pegawai: ${formData.name}`}
              </h2>
              <p className="text-xs text-amber-300 font-medium">
                Yuni Abadi Sejahtera • Kabupaten Karawang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-blue-900 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-800 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 transition-all ${
                  isActive
                    ? 'bg-blue-900 text-amber-300 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[68vh] overflow-y-auto space-y-5">
          {/* TAB 1: BIODATA PRIBADI */}
          {activeTab === 'biodata' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                {/* Photo Preview & Upload */}
                <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-100 flex items-center justify-center shrink-0">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <label className="text-xs font-bold text-slate-800 block">
                    Foto Resmi Pegawai
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Format JPG, JPEG, atau PNG (Maksimal 2 MB).
                  </p>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-blue-950 transition-colors mt-1">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Pilih Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.photo && (
                    <button
                      type="button"
                      onClick={() => handleInputChange('photo', '')}
                      className="ml-2 text-xs text-rose-600 font-bold hover:underline"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Nama Lengkap */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap & Gelar <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Contoh: Andi Saputra, S.T."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
                  />
                </div>

                {/* Nama Panggilan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Panggilan</label>
                  <input
                    type="text"
                    value={formData.nickname || ''}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    placeholder="Andi"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
                  />
                </div>

                {/* NIK */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Induk Kependudukan (NIK) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={formData.nik || ''}
                    onChange={(e) => handleInputChange('nik', e.target.value.replace(/\D/g, ''))}
                    placeholder="321501xxxxxxxxxx (16 Digit)"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono text-slate-800 focus:border-blue-700 focus:outline-none"
                  />
                </div>

                {/* Nomor Kartu Keluarga */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Kartu Keluarga (KK)</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.kk_number || ''}
                    onChange={(e) => handleInputChange('kk_number', e.target.value.replace(/\D/g, ''))}
                    placeholder="321501xxxxxxxxxx"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono text-slate-800 focus:border-blue-700 focus:outline-none"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender || 'LAKI-LAKI'}
                    onChange={(e) => handleInputChange('gender', e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
                  >
                    <option value="LAKI-LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>

                {/* Tempat Lahir */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.birth_place || ''}
                    onChange={(e) => handleInputChange('birth_place', e.target.value)}
                    placeholder="Karawang"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
                  />
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.birth_date || ''}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
                  />
                </div>

                {/* Agama */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Agama</label>
                  <select
                    value={formData.religion || 'ISLAM'}
                    onChange={(e) => handleInputChange('religion', e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
                  >
                    <option value="ISLAM">Islam</option>
                    <option value="KRISTEN PROTESTAN">Kristen Protestan</option>
                    <option value="KATOLIK">Katolik</option>
                    <option value="HINDU">Hindu</option>
                    <option value="BUDDHA">Buddha</option>
                    <option value="KONGHUCU">Konghucu</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>

                {/* Status Pernikahan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Pernikahan</label>
                  <select
                    value={formData.marital_status || 'BELUM MENIKAH'}
                    onChange={(e) => handleInputChange('marital_status', e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
                  >
                    <option value="BELUM MENIKAH">Belum Menikah</option>
                    <option value="MENIKAH">Menikah</option>
                    <option value="CERAI HIDUP">Cerai Hidup</option>
                    <option value="CERAI MATI">Cerai Mati</option>
                  </select>
                </div>

                {/* Nomor HP */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="081234567890"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Alamat Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="nama@yas.co.id"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
                  />
                </div>

                {/* Alamat Domisili */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap KTP / Domisili</label>
                  <textarea
                    rows={2}
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Nama Jalan, Komplek / Dusun, No Rumah"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
                  />
                </div>

                {/* RT, RW, Desa, Kecamatan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">RT / RW</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="RT 001"
                      value={formData.rt || ''}
                      onChange={(e) => handleInputChange('rt', e.target.value)}
                      className="w-1/2 rounded-xl border border-slate-300 p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="RW 002"
                      value={formData.rw || ''}
                      onChange={(e) => handleInputChange('rw', e.target.value)}
                      className="w-1/2 rounded-xl border border-slate-300 p-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Desa / Kelurahan</label>
                  <input
                    type="text"
                    value={formData.village || ''}
                    onChange={(e) => handleInputChange('village', e.target.value)}
                    placeholder="Sukamakmur / Cibalongsari"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={formData.district || ''}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    placeholder="Klari / Telukjambe Timur"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kabupaten / Kota</label>
                  <input
                    type="text"
                    value={formData.regency || 'Kabupaten Karawang'}
                    onChange={(e) => handleInputChange('regency', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={formData.province || 'Jawa Barat'}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={formData.postal_code || ''}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    placeholder="41371"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATA IDENTITAS SENSITIF, PAJAK & BANK */}
          {activeTab === 'identitas' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Data nomor rekening, NPWP, dan BPJS dilindungi sistem keamanan enkripsi dan masking data.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* NPWP */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Pokok Wajib Pajak (NPWP)</label>
                  <input
                    type="text"
                    value={formData.npwp || ''}
                    onChange={(e) => handleInputChange('npwp', e.target.value)}
                    placeholder="xx.xxx.xxx.x-xxx.xxx"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono"
                  />
                </div>

                {/* BPJS Kesehatan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor BPJS Kesehatan</label>
                  <input
                    type="text"
                    value={formData.bpjs_kesehatan || ''}
                    onChange={(e) => handleInputChange('bpjs_kesehatan', e.target.value)}
                    placeholder="0001234567891"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono"
                  />
                </div>

                {/* BPJS Ketenagakerjaan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor BPJS Ketenagakerjaan (TK)</label>
                  <input
                    type="text"
                    value={formData.bpjs_ketenagakerjaan || ''}
                    onChange={(e) => handleInputChange('bpjs_ketenagakerjaan', e.target.value)}
                    placeholder="19028374650"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono"
                  />
                </div>

                {/* Bank Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Bank Pembayaran Gaji</label>
                  <select
                    value={formData.bank_name || 'Bank Mandiri'}
                    onChange={(e) => handleInputChange('bank_name', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800"
                  >
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Bank BCA">Bank BCA</option>
                    <option value="Bank BRI">Bank BRI</option>
                    <option value="Bank BNI">Bank BNI</option>
                    <option value="Bank BJB">Bank BJB (Jawa Barat)</option>
                    <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                {/* Bank Account Number */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nomor Rekening Bank</label>
                  <input
                    type="text"
                    value={formData.bank_account || ''}
                    onChange={(e) => handleInputChange('bank_account', e.target.value)}
                    placeholder="Contoh: 1730005849302"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATA KEPEGAWAIAN & KONTRAK */}
          {activeTab === 'kepegawaian' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* ID Pegawai (Auto or Manual) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Induk Pegawai (NIP/ID)</label>
                  <input
                    type="text"
                    value={formData.employee_number || ''}
                    onChange={(e) => handleInputChange('employee_number', e.target.value)}
                    placeholder="Otomatis: YAS-2026-xxx"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono font-bold text-blue-950"
                  />
                </div>

                {/* Tanggal Masuk */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Masuk (Join Date) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.join_date || ''}
                    onChange={(e) => handleInputChange('join_date', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>

                {/* Tanggal Pengangkatan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Pengangkatan Tetap</label>
                  <input
                    type="date"
                    value={formData.appointment_date || ''}
                    onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>

                {/* Jabatan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jabatan / Posisi <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position || ''}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="Kepala Divisi / Staf Administrasi / HR"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>

                {/* Departemen */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Departemen <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.department || 'Operasional'}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold"
                  >
                    <option value="Operasional">Operasional</option>
                    <option value="Keuangan & Akuntansi">Keuangan & Akuntansi</option>
                    <option value="SDM & Umum">SDM & Umum (HRGA)</option>
                    <option value="IT & Sistem Informasi">IT & Sistem Informasi</option>
                    <option value="Pemasaran & Kemitraan">Pemasaran & Kemitraan</option>
                    <option value="Logistik & Distribusi">Logistik & Distribusi</option>
                  </select>
                </div>

                {/* Divisi / Unit */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Divisi / Sub Unit</label>
                  <input
                    type="text"
                    value={formData.division || ''}
                    onChange={(e) => handleInputChange('division', e.target.value)}
                    placeholder="Plant Management / Tax"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>

                {/* Lokasi Kerja */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi Penugasan</label>
                  <input
                    type="text"
                    value={formData.work_location || 'Kantor Pusat Karawang'}
                    onChange={(e) => handleInputChange('work_location', e.target.value)}
                    placeholder="Kantor Pusat Karawang / Klari"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>

                {/* Atasan Langsung */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Atasan Langsung</label>
                  <input
                    type="text"
                    value={formData.direct_supervisor || ''}
                    onChange={(e) => handleInputChange('direct_supervisor', e.target.value)}
                    placeholder="Manager Operasional / Direktur"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>

                {/* Golongan / Level */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Golongan / Level Jabatan</label>
                  <select
                    value={formData.grade_level || 'Grade 2 - Staf'}
                    onChange={(e) => handleInputChange('grade_level', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  >
                    <option value="Grade 1 - Junior/Operator">Grade 1 - Junior / Operator</option>
                    <option value="Grade 2 - Staf / Officer">Grade 2 - Staf / Officer</option>
                    <option value="Grade 3 - Supervisor / Specialist">Grade 3 - Supervisor / Specialist</option>
                    <option value="Grade 4 - Managerial">Grade 4 - Managerial / Kepala Divisi</option>
                    <option value="Grade 5 - Direksi">Grade 5 - Direksi</option>
                    <option value="Magang">Magang / Internship</option>
                  </select>
                </div>

                {/* Status Hubungan Kerja */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Hubungan Kerja</label>
                  <select
                    value={formData.employment_status || 'TETAP'}
                    onChange={(e) => handleInputChange('employment_status', e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="TETAP">Karyawan Tetap (PKWTT)</option>
                    <option value="KONTRAK">Karyawan Kontrak (PKWT)</option>
                    <option value="MAGANG">Magang / Internship</option>
                    <option value="OUTSOURCING">Outsourcing</option>
                    <option value="HARIAN">Pekerja Harian Lepas</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>

                {/* Status Kepegawaian (Aktif/Nonaktif) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={formData.employee_status || 'AKTIF'}
                    onChange={(e) => handleInputChange('employee_status', e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold"
                  >
                    <option value="AKTIF">🟢 AKTIF</option>
                    <option value="NONAKTIF">⚪ NONAKTIF (Arsip)</option>
                  </select>
                </div>
              </div>

              {/* Kontrak Detail (Jika PKWT / Magang) */}
              {(formData.employment_status === 'KONTRAK' || formData.employment_status === 'MAGANG') && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <h4 className="font-bold text-amber-950 text-xs">Detail Perjanjian Kontrak Kerja (PKWT)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nomor Surat Kontrak</label>
                      <input
                        type="text"
                        value={formData.contract_number || ''}
                        onChange={(e) => handleInputChange('contract_number', e.target.value)}
                        placeholder="045/PKWT-YAS/V/2026"
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai Kontrak</label>
                      <input
                        type="date"
                        value={formData.contract_start || ''}
                        onChange={(e) => handleInputChange('contract_start', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tanggal Berakhir Kontrak</label>
                      <input
                        type="date"
                        value={formData.contract_end || ''}
                        onChange={(e) => handleInputChange('contract_end', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-bold text-amber-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RIWAYAT PENDIDIKAN */}
          {activeTab === 'pendidikan' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Riwayat Pendidikan Formal</h4>
                  <p className="text-slate-500 text-[11px]">Tambahkan jenjang SD, SMP, SMA/SMK, D3, S1, S2, dll.</p>
                </div>
                <button
                  type="button"
                  onClick={addEducationRow}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-3 py-1.5 font-bold text-amber-300 hover:bg-blue-950 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  + Tambah Pendidikan
                </button>
              </div>

              {(!formData.educations || formData.educations.length === 0) ? (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                  <GraduationCap className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="font-semibold">Belum ada riwayat pendidikan ditambahkan.</p>
                  <button
                    type="button"
                    onClick={addEducationRow}
                    className="mt-2 text-xs text-blue-900 font-bold hover:underline"
                  >
                    + Klik untuk menambahkan
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.educations.map((edu, idx) => (
                    <div key={edu.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 relative">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="font-bold text-blue-950">Jenjang #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeEducationRow(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Tingkat / Jenjang</label>
                          <select
                            value={edu.level}
                            onChange={(e) => updateEducationRow(idx, 'level', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          >
                            <option value="SD">SD / MI</option>
                            <option value="SMP">SMP / MTs</option>
                            <option value="SMA/SMK">SMA / SMK / MA</option>
                            <option value="D3">Diploma 3 (D3)</option>
                            <option value="D4/S1">Sarjana (S1 / D4)</option>
                            <option value="S2">Magister (S2)</option>
                            <option value="S3">Doktor (S3)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Nama Sekolah / Universitas</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducationRow(idx, 'institution', e.target.value)}
                            placeholder="UNSIKA / SMAN 1 Karawang"
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Jurusan / Program Studi</label>
                          <input
                            type="text"
                            value={edu.major}
                            onChange={(e) => updateEducationRow(idx, 'major', e.target.value)}
                            placeholder="Teknik Industri / Akuntansi / IPA"
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Tahun Masuk</label>
                          <input
                            type="text"
                            value={edu.start_year}
                            onChange={(e) => updateEducationRow(idx, 'start_year', e.target.value)}
                            placeholder="2016"
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Tahun Lulus</label>
                          <input
                            type="text"
                            value={edu.graduation_year}
                            onChange={(e) => updateEducationRow(idx, 'graduation_year', e.target.value)}
                            placeholder="2020"
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Nomor Ijazah</label>
                          <input
                            type="text"
                            value={edu.certificate_number || ''}
                            onChange={(e) => updateEducationRow(idx, 'certificate_number', e.target.value)}
                            placeholder="DN-01/D-SMK/..."
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: RIWAYAT PEKERJAAN */}
          {activeTab === 'pekerjaan' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Pengalaman Kerja Sebelumnya</h4>
                  <p className="text-slate-500 text-[11px]">Riwayat karir & perusahaan terdahulu.</p>
                </div>
                <button
                  type="button"
                  onClick={addWorkHistoryRow}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-3 py-1.5 font-bold text-amber-300 hover:bg-blue-950 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  + Tambah Pengalaman
                </button>
              </div>

              {(!formData.work_histories || formData.work_histories.length === 0) ? (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                  <Building className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="font-semibold">Belum ada pengalaman kerja ditambahkan.</p>
                  <button
                    type="button"
                    onClick={addWorkHistoryRow}
                    className="mt-2 text-xs text-blue-900 font-bold hover:underline"
                  >
                    + Tambah Pengalaman Kerja
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.work_histories.map((wh, idx) => (
                    <div key={wh.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="font-bold text-blue-950">Perusahaan #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeWorkHistoryRow(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Nama Perusahaan</label>
                          <input
                            type="text"
                            value={wh.company}
                            onChange={(e) => updateWorkHistoryRow(idx, 'company', e.target.value)}
                            placeholder="PT Jaya Mandiri"
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Posisi / Jabatan</label>
                          <input
                            type="text"
                            value={wh.position}
                            onChange={(e) => updateWorkHistoryRow(idx, 'position', e.target.value)}
                            placeholder="Supervisor Produksi"
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Departemen</label>
                          <input
                            type="text"
                            value={wh.department}
                            onChange={(e) => updateWorkHistoryRow(idx, 'department', e.target.value)}
                            placeholder="Manufacturing"
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Tgl / Tahun Mulai</label>
                          <input
                            type="text"
                            value={wh.start_date}
                            onChange={(e) => updateWorkHistoryRow(idx, 'start_date', e.target.value)}
                            placeholder="2018"
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Tgl / Tahun Selesai</label>
                          <input
                            type="text"
                            value={wh.end_date}
                            onChange={(e) => updateWorkHistoryRow(idx, 'end_date', e.target.value)}
                            placeholder="2022"
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Keterangan / Alasan Keluar</label>
                          <input
                            type="text"
                            value={wh.description || ''}
                            onChange={(e) => updateWorkHistoryRow(idx, 'description', e.target.value)}
                            placeholder="Kontrak selesai / Pindah domisili"
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DATA KELUARGA & ANAK */}
          {activeTab === 'keluarga' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Data Pasangan & Anggota Keluarga</h4>
                  <p className="text-slate-500 text-[11px]">Informasi suami/istri dan tanggungan anak.</p>
                </div>
                <button
                  type="button"
                  onClick={addFamilyMemberRow}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-3 py-1.5 font-bold text-amber-300 hover:bg-blue-950 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  + Tambah Anggota Keluarga
                </button>
              </div>

              {(!formData.family_members || formData.family_members.length === 0) ? (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                  <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="font-semibold">Belum ada data anggota keluarga ditambahkan.</p>
                  <button
                    type="button"
                    onClick={addFamilyMemberRow}
                    className="mt-2 text-xs text-blue-900 font-bold hover:underline"
                  >
                    + Tambah Anggota Keluarga
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.family_members.map((fam, idx) => (
                    <div key={fam.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="font-bold text-blue-950">Anggota #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeFamilyMemberRow(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Nama Anggota</label>
                          <input
                            type="text"
                            value={fam.name}
                            onChange={(e) => updateFamilyMemberRow(idx, 'name', e.target.value)}
                            placeholder="Nama Pasangan / Anak"
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Hubungan</label>
                          <select
                            value={fam.relationship}
                            onChange={(e) => updateFamilyMemberRow(idx, 'relationship', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          >
                            <option value="Suami">Suami</option>
                            <option value="Istri">Istri</option>
                            <option value="Anak ke-1">Anak ke-1</option>
                            <option value="Anak ke-2">Anak ke-2</option>
                            <option value="Anak ke-3">Anak ke-3</option>
                            <option value="Orang Tua">Orang Tua</option>
                            <option value="Mertua">Mertua</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">NIK (KTP/KIA)</label>
                          <input
                            type="text"
                            value={fam.nik || ''}
                            onChange={(e) => updateFamilyMemberRow(idx, 'nik', e.target.value)}
                            placeholder="321501xxxx"
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                          <input
                            type="date"
                            value={fam.birth_date || ''}
                            onChange={(e) => updateFamilyMemberRow(idx, 'birth_date', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Pekerjaan</label>
                          <input
                            type="text"
                            value={fam.occupation || ''}
                            onChange={(e) => updateFamilyMemberRow(idx, 'occupation', e.target.value)}
                            placeholder="Karyawan / Pelajar / IRT"
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">No HP</label>
                          <input
                            type="tel"
                            value={fam.phone || ''}
                            onChange={(e) => updateFamilyMemberRow(idx, 'phone', e.target.value)}
                            placeholder="0813xxxx"
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: KONTAK DARURAT */}
          {activeTab === 'darurat' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs">
                Kontak darurat akan dihubungi saat situasi darurat di tempat kerja atau keperluan mendesak.
              </div>

              <div className="space-y-3">
                {(formData.emergency_contacts || []).map((em, idx) => (
                  <div key={em.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="font-bold text-blue-950">Kontak Darurat Utama</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Nama Kontak</label>
                        <input
                          type="text"
                          value={em.name}
                          onChange={(e) => {
                            const list = [...(formData.emergency_contacts || [])];
                            list[idx] = { ...list[idx], name: e.target.value };
                            setFormData((prev) => ({ ...prev, emergency_contacts: list }));
                          }}
                          placeholder="Nama Lengkap Kontak"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Hubungan</label>
                        <input
                          type="text"
                          value={em.relationship}
                          onChange={(e) => {
                            const list = [...(formData.emergency_contacts || [])];
                            list[idx] = { ...list[idx], relationship: e.target.value };
                            setFormData((prev) => ({ ...prev, emergency_contacts: list }));
                          }}
                          placeholder="Orang Tua / Pasangan / Kakak"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                        <input
                          type="tel"
                          value={em.phone}
                          onChange={(e) => {
                            const list = [...(formData.emergency_contacts || [])];
                            list[idx] = { ...list[idx], phone: e.target.value };
                            setFormData((prev) => ({ ...prev, emergency_contacts: list }));
                          }}
                          placeholder="08129988xxxx"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Alamat Kontak</label>
                        <input
                          type="text"
                          value={em.address || ''}
                          onChange={(e) => {
                            const list = [...(formData.emergency_contacts || [])];
                            list[idx] = { ...list[idx], address: e.target.value };
                            setFormData((prev) => ({ ...prev, emergency_contacts: list }));
                          }}
                          placeholder="Karawang Timur / Klari"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                id="btn-save-employee"
                className="flex items-center gap-2 rounded-xl bg-blue-900 px-6 py-2.5 text-xs font-bold text-amber-300 shadow-md hover:bg-blue-950 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'Menyimpan...' : mode === 'add' ? 'Simpan Pegawai Baru' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
