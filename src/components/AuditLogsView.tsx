import React, { useState, useEffect } from 'react';
import { Shield, Search, Filter, History, RotateCcw, Download, Calendar } from 'lucide-react';
import { AuditLog } from '../types';
import { api } from '../services/api';
import * as XLSX from 'xlsx';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAuditLogs({ action: selectedAction !== 'ALL' ? selectedAction : undefined });
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedAction]);

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.user_name.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.ip_address && log.ip_address.includes(q))
    );
  });

  const handleExportLogs = () => {
    if (filteredLogs.length === 0) return;
    const exportData = filteredLogs.map((l, idx) => ({
      No: idx + 1,
      Waktu: new Date(l.created_at).toLocaleString('id-ID'),
      User: l.user_name,
      Role: l.user_role,
      Aksi: l.action,
      Target: l.target_type,
      Keterangan: l.details,
      'IP Address': l.ip_address,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Log HRIS');
    XLSX.writeFile(wb, `Audit_Logs_YAS_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Log Audit & Jejak Aktivitas
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-950">
              {filteredLogs.length} Log
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail seluruh aktivitas penambahan, perubahan, ekspor, dan penghapusan data HRIS YAS
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-blue-950 shadow-md transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Log Excel</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari user, aksi, keterangan perubahan..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:border-blue-700 focus:bg-white focus:outline-none"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-700"
        >
          <option value="ALL">Semua Jenis Aksi</option>
          <option value="CREATE_EMPLOYEE">Tambah Pegawai (CREATE)</option>
          <option value="UPDATE_EMPLOYEE">Update Pegawai (UPDATE)</option>
          <option value="DEACTIVATE_EMPLOYEE">Nonaktifkan Pegawai (ARCHIVE)</option>
          <option value="ACTIVATE_EMPLOYEE">Aktifkan Pegawai (RESTORE)</option>
          <option value="DELETE_EMPLOYEE">Hapus Pegawai (DELETE)</option>
          <option value="UPLOAD_DOCUMENT">Upload Dokumen</option>
          <option value="IMPORT_EMPLOYEES">Import Excel</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-900 border-r-transparent" />
            <p className="mt-2 text-xs font-semibold">Memuat log audit...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <History className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-700">Belum ada riwayat log audit.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Detail Perubahan</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.map((log) => {
                  let badgeColor = 'bg-slate-100 text-slate-700';
                  if (log.action.includes('CREATE')) badgeColor = 'bg-emerald-100 text-emerald-800';
                  if (log.action.includes('UPDATE')) badgeColor = 'bg-blue-100 text-blue-800';
                  if (log.action.includes('DEACTIVATE')) badgeColor = 'bg-amber-100 text-amber-800';
                  if (log.action.includes('DELETE')) badgeColor = 'bg-rose-100 text-rose-800';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{log.user_name}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{log.user_role}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{log.target_type}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs">{log.details}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{log.ip_address}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
