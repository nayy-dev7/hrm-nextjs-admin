"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BASE_URL } from "@/lib/config";

interface EmployeePayroll {
  id: number;
  nip: string;
  nama: string;
  divisi: string;
  gaji_pokok: number;
  join_date: string;
}

export default function PayrollPage() {
  const router = useRouter();
  const [payrollList, setPayrollList] = useState<EmployeePayroll[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) router.push("/login");
  }, [router]);

  useEffect(() => {
    console.log("BASE_URL:", BASE_URL);
console.log("Request URL:", `${BASE_URL}/leaves`);
  const fetchPayrollData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/employees`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      const mapped = (Array.isArray(data) ? data : []).map(
        (emp: {
          id: number;
          nip: string;
          nama: string;
          divisi: string;
          gaji_pokok?: number;
          join_date?: string;
        }) => ({
          id: emp.id,
          nip: emp.nip,
          nama: emp.nama,
          divisi: emp.divisi,
          gaji_pokok: emp.gaji_pokok || 4500000,
          join_date: emp.join_date || "2026-01-01",
        })
      );

      setPayrollList(mapped);
    } catch (err) {
      console.error("Gagal mengambil data payroll:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchPayrollData();
}, []);

  const filteredPayroll = payrollList.filter(emp =>
    emp.nama.toLowerCase().includes(search.toLowerCase()) || emp.nip.includes(search)
  );

  if (loading) {
    return <div className="min-h-screen bg-[#151624] flex items-center justify-center font-semibold text-gray-400">Loading Laporan Gaji...</div>;
  }

  return (
    <div className="min-h-screen bg-[#151624] flex text-white font-sans">
      {/* SIDEBAR */}
      <aside className="w-16 border-r border-gray-800 flex flex-col items-center py-6 justify-between bg-[#151624]">
        <div className="space-y-8 flex flex-col items-center">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">HR</div>
          <Link href="/" className="text-gray-500 text-lg hover:text-white transition" title="Dashboard">🏠</Link>
          <Link href="/employees" className="text-gray-500 text-lg hover:text-white transition" title="Data Pegawai">📂</Link>
          <Link href="/attendance" className="text-gray-500 text-lg hover:text-white transition" title="Manajemen Absensi">📅</Link>
          <Link href="/leaves" className="text-gray-500 text-lg hover:text-white transition" title="Approval Cuti">✔️</Link>
          <Link href="/payroll" className="text-blue-500 text-lg" title="Laporan Gaji">💵</Link>
        </div>
        <button onClick={() => { localStorage.removeItem("isLoggedIn"); router.push("/login"); }} className="text-gray-500 hover:text-red-500 text-lg">🚪</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan Gaji Pegawai</h1>
          <p className="text-xs text-gray-500 mt-0.5">Pilih pegawai untuk melihat histori penggajian secara detail</p>
        </div>

        <div className="flex justify-end">
          <input
            type="text"
            placeholder="Cari nama atau NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1f2235] border border-gray-800 text-sm rounded-xl px-4 py-2 w-full sm:w-64 focus:outline-none focus:border-blue-500 text-white transition"
          />
        </div>

        <div className="bg-[#1f2235] rounded-[24px] border border-gray-800/60 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-[#1b1c2e]">
                <th className="py-4 px-6">NIP</th>
                <th className="py-4 px-6">Nama Pegawai</th>
                <th className="py-4 px-6">Divisi</th>
                <th className="py-4 px-6">Gaji Pokok Saat Ini</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredPayroll.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#151624]/40 transition-colors">
                  <td className="py-4 px-6 font-mono font-semibold text-blue-400">{emp.nip}</td>
                  <td className="py-4 px-6 font-bold text-gray-200">{emp.nama}</td>
                  <td className="py-4 px-6 text-gray-400">{emp.divisi}</td>
                  <td className="py-4 px-6 font-semibold text-green-400">Rp {emp.gaji_pokok.toLocaleString("id-ID")}</td>
                  <td className="py-4 px-6 text-center">
                    <Link
                      href={`/payroll/${emp.id}?name=${encodeURIComponent(emp.nama)}&nip=${emp.nip}&divisi=${encodeURIComponent(emp.divisi)}&join=${emp.join_date}`}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition inline-block"
                    >
                      Lihat Detail Histori
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}