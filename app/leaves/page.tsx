"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BASE_URL } from "@/lib/config";

interface Employee {
  id: number;
  nip: string;
  nama: string;
  email: string;
  divisi: string;
}

interface LeaveRequest {
  id: number;
  employee_id: number;
  jenis: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  employee?: Employee;
}

export default function LeavesApprovalPage() {
  const router = useRouter();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  // Proteksi Login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  // Fetch Semua Data Cuti (dengan Proteksi Timeout 1 Detik)
  useEffect(() => {
  const fetchAllLeaves = async () => {
    try {
      const res = await fetch(`${BASE_URL}/leaves`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAllLeaves();
}, []);

  // Handler Aksi Tokcer Langsung dari Tabel (Approve / Reject)
  const handleAction = async (id: number, action: "approve" | "reject") => {
    const statusText = action === "approve" ? "approved" : "rejected";
    
    // Update State Lokal agar UI berubah instan
    setLeaves(prev => prev.map(item => item.id === id ? { ...item, status: statusText } : item));

    try {
      await fetch(`${BASE_URL}/leaves/${id}/${action}`, {
        method: "PUT",
      });

      const res = await fetch(`${BASE_URL}/leaves`);
      const data = await res.json();
      setLeaves(data);

    } catch (error) {
      console.error(error);
    }
  };

  // Filter Data berdasarkan pilihan Dropdown Status
  const filteredLeaves = leaves.filter(item => {
    if (filterStatus === "All") return true;
    return item.status.toLowerCase() === filterStatus.toLowerCase();
  });

  if (loading) {
    return <div className="min-h-screen bg-[#151624] flex items-center justify-center font-semibold text-gray-400">Loading Approval Cuti...</div>;
  }

  return (
    <div className="min-h-screen bg-[#151624] flex text-white font-sans">
      
      {/* SIDEBAR NAVIGASI */}
      <aside className="w-16 border-r border-gray-800 flex flex-col items-center py-6 justify-between bg-[#151624]">
        <div className="space-y-8 flex flex-col items-center">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">HR</div>
          <Link href="/" className="text-gray-500 text-lg hover:text-white transition" title="Dashboard">🏠</Link>
          <Link href="/employees" className="text-gray-500 text-lg hover:text-white transition" title="Data Pegawai">📂</Link>
          <Link href="/attendance" className="text-gray-500 text-lg hover:text-white transition" title="Manajemen Absensi">📅</Link>
          <Link href="/attendance/logs" className="text-gray-500 text-lg hover:text-white transition" title="Riwayat Harian">📝</Link>
          <Link href="/leaves" className="text-blue-500 text-lg" title="Approval Cuti">✔️</Link>
          <Link href="/payroll" className="text-gray-500 text-lg hover:text-white transition" title="Laporan Gaji">💵</Link>
        </div>
        <button onClick={() => { localStorage.removeItem("isLoggedIn"); router.push("/login"); }} className="text-gray-500 hover:text-red-500 text-lg">🚪</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 space-y-6">
        
        {/* HEADER & FILTER */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Daftar Pengajuan Cuti</h1>
            <p className="text-xs text-gray-500 mt-0.5">Kelola perizinan ketidakhadiran pegawai</p>
          </div>

          {/* DROPDOWN FILTER STATUS */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#1f2235] border border-gray-800 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="All">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* TABEL LIST PENGAJUAN */}
        <div className="bg-[#1f2235] rounded-[24px] border border-gray-800/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-[#1b1c2e]">
                  <th className="py-4 px-6">Pegawai</th>
                  <th className="py-4 px-6">Jenis Pengajuan</th>
                  <th className="py-4 px-6">Durasi Tanggal</th>
                  <th className="py-4 px-6">Alasan</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Aksi / Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredLeaves.length > 0 ? (
                  filteredLeaves.map((item) => (
                    <tr key={item.id} className="hover:bg-[#151624]/40 transition-colors">
                      {/* Pegawai */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-200">{item.employee?.nama || "Unknown"}</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">NIP: {item.employee?.nip || "-"}</div>
                      </td>
                      {/* Jenis Cuti */}
                      <td className="py-4 px-6 font-semibold text-blue-400 text-xs">{item.jenis}</td>
                      {/* Tanggal */}
                      <td className="py-4 px-6 text-xs text-gray-300 font-medium">{item.start_date} <span className="text-gray-600">s/d</span> {item.end_date}</td>
                      {/* Alasan */}
                      <td className="py-4 px-6 text-xs text-gray-400 max-w-xs truncate" title={item.reason}>{item.reason}</td>
                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                          item.status === "approved" ? "bg-green-900/40 text-green-400 border border-green-800/30" :
                          item.status === "rejected" ? "bg-red-900/40 text-red-400 border border-red-800/30" : 
                          "bg-amber-900/40 text-amber-400 border border-amber-800/30"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      {/* Aksi */}
                      <td className="py-4 px-6">
                        {item.status === "pending" ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleAction(item.id, "reject")}
                              className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/60 text-red-400 font-bold text-xs rounded-xl border border-red-800/40 transition"
                            >
                              Tolak
                            </button>
                            <button
                              onClick={() => handleAction(item.id, "approve")}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl transition"
                            >
                              Setujui
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-xs text-gray-600 italic font-medium">Selesai Ditinjau</div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500 font-medium">Tidak ada data pengajuan cuti.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}