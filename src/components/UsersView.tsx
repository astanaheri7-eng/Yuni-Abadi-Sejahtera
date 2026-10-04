import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  RotateCcw,
  Key,
  Search,
  AlertTriangle,
  Lock,
  Mail,
  UserCheck,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { User, UserRole, UserStatus } from '../types';
import { api } from '../services/api';

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'ADMIN' as UserRole,
    status: 'AKTIF' as UserStatus,
  });

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'ADMIN' as UserRole,
    status: 'AKTIF' as UserStatus,
    newPassword: '',
  });

  // Delete User Modal State
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Reset Users Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.getUsers();
      setUsers(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      showToast('Gagal memuat pengguna: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.username || !newUserData.name || !newUserData.email) {
      alert('Nama, username, dan email wajib diisi.');
      return;
    }

    try {
      const res = await api.createUser({
        ...newUserData,
        password: newUserData.password || 'admin123',
      });
      if (res.success) {
        showToast(`Akun pengguna ${newUserData.name} berhasil dibuat.`);
        setShowAddModal(false);
        setNewUserData({
          username: '',
          name: '',
          email: '',
          password: '',
          role: 'ADMIN',
          status: 'AKTIF',
        });
        fetchUsers();
      } else {
        alert(res.message || 'Gagal membuat pengguna.');
      }
    } catch (err: any) {
      alert('Gagal membuat user: ' + err.message);
    }
  };

  // Open Edit User Modal
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: (user.status as UserStatus) || 'AKTIF',
      newPassword: '',
    });
  };

  // Save Edit User
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const payload: any = {
        name: editFormData.name,
        username: editFormData.username,
        email: editFormData.email,
        role: editFormData.role,
        status: editFormData.status,
      };
      if (editFormData.newPassword.trim()) {
        payload.password = editFormData.newPassword.trim();
      }

      const res = await api.updateUser(editingUser.id, payload);
      if (res.success) {
        showToast(`Akun ${editFormData.name} berhasil diperbarui.`);
        setEditingUser(null);
        fetchUsers();
      } else {
        alert(res.message || 'Gagal memperbarui pengguna.');
      }
    } catch (err: any) {
      alert('Error saat memperbarui user: ' + err.message);
    }
  };

  // Delete User
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    if (deletingUser.id === 'usr-1') {
      alert('Akun Utama Super Administrator tidak dapat dihapus demi keamanan sistem.');
      setDeletingUser(null);
      return;
    }

    try {
      const res = await api.deleteUser(deletingUser.id);
      if (res.success) {
        showToast(`Akun pengguna ${deletingUser.name} telah dihapus.`);
        setDeletingUser(null);
        fetchUsers();
      } else {
        alert(res.message || 'Gagal menghapus pengguna.');
      }
    } catch (err: any) {
      alert('Error saat menghapus user: ' + err.message);
    }
  };

  // Reset Single User Password
  const handleResetPassword = async (user: User) => {
    const defaultPass = user.id === 'usr-1' || user.role === 'SUPER_ADMIN' ? 'Admin@12345' : 'admin123';
    if (!confirm(`Reset kata sandi pengguna "${user.name}" (${user.username}) ke standar bawaan "${defaultPass}"?`)) {
      return;
    }

    try {
      const res = await api.updateUser(user.id, { password: defaultPass } as any);
      if (res.success) {
        showToast(`Kata sandi akun ${user.username} telah direset ke "${defaultPass}".`);
        fetchUsers();
      } else {
        alert(res.message || 'Gagal mereset kata sandi.');
      }
    } catch (err: any) {
      alert('Error saat mereset kata sandi: ' + err.message);
    }
  };

  // Reset All Users to Factory Seed
  const handleResetAllUsers = async () => {
    try {
      const res = await api.resetUsers();
      if (res.success) {
        showToast('Seluruh daftar pengguna berhasil direset ke akun bawaan standar pabrik.');
        setShowResetModal(false);
        fetchUsers();
      } else {
        alert(res.message || 'Gagal mereset pengguna.');
      }
    } catch (err: any) {
      alert('Error saat mereset semua pengguna: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-[#001f4d] p-4 text-xs font-bold text-amber-300 shadow-2xl border border-amber-400/40">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-blue-900" />
              Manajemen Pengguna &amp; Hak Akses
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-950">
              {filteredUsers.length} Akun
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data akun administrator, ubah hak akses (role), atur kata sandi, dan kosongkan/reset pengguna
          </p>
        </div>

        {/* Action Buttons Top */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Reset All Users */}
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-100 transition-colors cursor-pointer"
            title="Reset seluruh akun ke default pabrik"
          >
            <RotateCcw className="h-4 w-4 text-rose-600" />
            <span>Reset Pengguna</span>
          </button>

          {/* Add User */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-bold text-amber-300 shadow-md hover:bg-blue-950 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Tambah Akun Pengguna</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pengguna berdasarkan nama, username, email, atau role..."
            className="w-full rounded-xl border border-slate-300 py-2 pl-10 pr-4 text-xs focus:border-blue-900 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filter
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-900 border-r-transparent" />
            <p className="mt-2 text-xs font-semibold">Memuat data pengguna...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-700">Tidak ada pengguna yang cocok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Nama &amp; Username</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4">Status Akun</th>
                  <th className="py-3 px-4">Login Terakhir</th>
                  <th className="py-3 px-4 text-right">Aksi Fitur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((u) => {
                  const isMainSuperAdmin = u.id === 'usr-1';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-900 text-amber-300 font-bold text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isMainSuperAdmin && (
                                <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-900">
                                  Akun Utama
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-purple-100 text-purple-900'
                              : u.role === 'ADMIN'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.status === 'AKTIF' || (u.status as any) === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-bold text-[11px]">
                            <XCircle className="h-3.5 w-3.5" />
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                        {u.last_login ? new Date(u.last_login).toLocaleString('id-ID') : 'Belum pernah'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                            title="Edit Data Pengguna & Hak Akses"
                          >
                            <Edit className="h-3.5 w-3.5 text-blue-900" />
                            <span>Edit</span>
                          </button>

                          {/* Tombol Reset Password */}
                          <button
                            type="button"
                            onClick={() => handleResetPassword(u)}
                            className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100"
                            title="Reset Kata Sandi ke Standar"
                          >
                            <Key className="h-3.5 w-3.5 text-amber-700" />
                            <span className="hidden sm:inline">Reset Sandi</span>
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            type="button"
                            disabled={isMainSuperAdmin}
                            onClick={() => setDeletingUser(u)}
                            className={`rounded-lg p-1.5 transition-colors ${
                              isMainSuperAdmin
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                            title={isMainSuperAdmin ? 'Akun Utama tidak boleh dihapus' : 'Hapus Akun Pengguna'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Tambah Pengguna Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-900" />
                <h3 className="font-black text-slate-900 text-base">Tambah Akun Pengguna Baru</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username Login *</label>
                <input
                  type="text"
                  required
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  placeholder="Contoh: budi.hrga"
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Resmi *</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="budi@yas.co.id"
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi Awal</label>
                <input
                  type="text"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Default: admin123"
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-900 focus:outline-none font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Kosongkan untuk kata sandi bawaan (admin123)</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peran (Role) *</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as UserRole })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-900 focus:outline-none font-bold"
                  >
                    <option value="ADMIN">ADMIN (Operasional)</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN (Penuh)</option>
                    <option value="VIEWER">VIEWER (Read-Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Akun *</label>
                  <select
                    value={newUserData.status}
                    onChange={(e) => setNewUserData({ ...newUserData, status: e.target.value as UserStatus })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-900 focus:outline-none font-bold"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-900 px-5 py-2 font-bold text-amber-300 shadow-md hover:bg-blue-950"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Pengguna */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-900" />
                <div>
                  <h3 className="font-black text-slate-900 text-base">Edit Akun Pengguna</h3>
                  <p className="text-[11px] text-slate-500">ID: {editingUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username Login *</label>
                <input
                  type="text"
                  required
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Resmi *</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ubah Kata Sandi Baru (Opsional)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editFormData.newPassword}
                    onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                    placeholder="Kosongkan bila sandi tidak diubah"
                    className="w-full rounded-xl border border-slate-300 p-2.5 pr-10 focus:border-blue-900 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peran (Role) *</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-900 focus:outline-none font-bold"
                  >
                    <option value="ADMIN">ADMIN (Operasional)</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN (Penuh)</option>
                    <option value="VIEWER">VIEWER (Read-Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Akun *</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as UserStatus })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-900 focus:outline-none font-bold"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-900 px-5 py-2 font-bold text-amber-300 shadow-md hover:bg-blue-950"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Konfirmasi Hapus Pengguna */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Akun Pengguna</h3>
                <p className="text-slate-500 text-xs">Konfirmasi tindakan penghapusan</p>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun pengguna{' '}
              <span className="font-bold text-slate-950">{deletingUser.name}</span> (@{deletingUser.username})? Pengguna ini tidak akan dapat masuk kembali ke sistem.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white shadow-md hover:bg-rose-700"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Konfirmasi Reset Semua Pengguna ke Default */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Seluruh Akun Pengguna</h3>
                <p className="text-slate-500 text-xs">Kembalikan daftar akun ke bawaan pabrik</p>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              Tindakan ini akan mengembalikan daftar pengguna ke 3 akun bawaan pabrik (Super Admin: <code>superadmin</code>, Admin: <code>admin_yas</code>, Viewer: <code>viewer_yas</code>) dengan kata sandi <code>admin123</code>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetAllUsers}
                className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white shadow-md hover:bg-amber-700"
              >
                Ya, Reset ke Standar Pabrik
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
