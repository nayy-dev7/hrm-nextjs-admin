"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BASE_URL } from "@/lib/config";

interface Employee {
  id: number;
  nip: string;
  nama: string;
  divisi: string;
}

interface RawAttendance {
  id: number;
  employee_id: number;
  tanggal: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  lembur: string | null;
  employee?: Employee;
}

export default function AttendanceLogsPage() {
  const router = useRouter();
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) router.push("/login");
  }, [router]);
  const [logs, setLogs] = useState<RawAttendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
  const fetchAttendances = async () => {
    try {
      const res = await fetch(`${BASE_URL}/attendances`);

if (!res.ok) throw new Error();

const data = await res.json();

setLogs(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Gagal mengambil data attendances:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAttendances();
}, []);
 

  const filteredLogs = logs.filter(log => 
    log.employee?.nama.toLowerCase().includes(search.toLowerCase()) || log.employee?.nip.includes(search)
  );

  if (loading) return <div className="min-h-screen bg-[#151624] flex items-center justify-center text-gray-400">Loading Log Harian...</div>;

  return (
    <div className="min-h-screen bg-[#151624] flex text-white font-sans">
      {/* SIDEBAR */}
      <aside className="w-16 border-r border-gray-800 flex flex-col items-center py-6 justify-between bg-[#151624]">
        <div className="space-y-8 flex flex-col items-center">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">HR</div>
          <Link href="/" className="text-gray-500 text-lg hover:text-white transition" title="Dashboard">🏠</Link>
          <Link href="/employees" className="text-gray-500 text-lg hover:text-white transition" title="Data Pegawai">📂</Link>
          <Link href="/attendance" className="text-gray-500 text-lg hover:text-white transition" title="Laporan Bulanan">📅</Link>
          <Link href="/attendance/logs" className="text-blue-500 text-lg" title="Riwayat Harian">📝</Link>
          <Link href="/leaves" className="text-gray-500 text-lg hover:text-white transition" title="Approval Cuti">✔️</Link>
          <Link href="/payroll" className="text-gray-500 text-lg hover:text-white transition" title="Laporan Gaji">💵</Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 space-y-6">
        <div>
          <Link href="/attendance" className="text-xs text-blue-400 hover:underline">← Kembali ke Laporan Bulanan</Link>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Riwayat Log Absensi Harian</h1>
          <p className="text-xs text-gray-500 mt-0.5">Log data real-time aktivitas harian tanpa akumulasi pengelompokan</p>
        </div>

        <div className="flex justify-end">
          <input
            type="text"
            placeholder="Cari nama atau NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1f2235] border border-gray-800 text-sm rounded-xl px-4 py-2 w-64 text-white focus:outline-none"
          />
        </div>

        {/* TABEL DATA MENTAH */}
        <div className="bg-[#1f2235] rounded-[24px] border border-gray-800/60 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase bg-[#1b1c2e]">
                <th className="py-4 px-6">Nama</th>
                <th className="py-4 px-6">NIP</th>
                <th className="py-4 px-6">Divisi</th>
                <th className="py-4 px-6">Tanggal</th>
                <th className="py-4 px-6">Check In</th>
                <th className="py-4 px-6">Check Out</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Lembur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#151624]/40 transition-colors text-gray-300">
                  <td className="py-4 px-6 font-bold text-white">{log.employee?.nama || "Unknown"}</td>
                  <td className="py-4 px-6 font-mono text-xs text-blue-400">{log.employee?.nip || "-"}</td>
                  <td className="py-4 px-6 text-xs">{log.employee?.divisi || "-"}</td>
                  <td className="py-4 px-6 text-xs">{log.tanggal}</td>
                  <td className="py-4 px-6 text-xs font-mono">{log.check_in || "--:--"}</td>
                  <td className="py-4 px-6 text-xs font-mono">{log.check_out || "--:--"}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === "Hadir" ? "bg-green-950 text-green-400" :
                      log.status === "Terlambat" ? "bg-amber-950 text-amber-400" :
                      "bg-blue-950 text-blue-400"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs font-semibold text-purple-400">{log.lembur || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}