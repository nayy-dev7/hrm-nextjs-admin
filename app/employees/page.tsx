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
  phone: string | null;
  alamat: string | null;
  role: string;
  join_date: string | null;
}

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Proteksi Login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  // Fetch Data Pegawai
  useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${BASE_URL}/employees`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      console.warn("Koneksi Laravel lambat/mati. Langsung beralih ke data simulasi.");

      setEmployees([
        {
          id: 1,
          nip: "202601001",
          nama: "Rina Amelia",
          email: "rina@company.com",
          divisi: "UI/UX Designer",
          phone: "081234567890",
          alamat: "Jl. Pemuda No. 12",
          role: "employee",
          join_date: "2026-01-10",
        },
        {
          id: 2,
          nip: "202601002",
          nama: "Budi Santoso",
          email: "budi@company.com",
          divisi: "Software Engineer",
          phone: "087654321098",
          alamat: "Jl. Merdeka No. 45",
          role: "employee",
          join_date: "2026-02-15",
        },
        {
          id: 3,
          nip: "202601003",
          nama: "Salsa Putri",
          email: "salsa@company.com",
          divisi: "HR Department",
          phone: "089988776655",
          alamat: "Jl. Diponegoro No. 8",
          role: "hr",
          join_date: "2026-03-01",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  fetchEmployees();
}, []);
  // Filter pencarian berdasarkan nama atau NIP
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nip.includes(searchQuery)
  );

  if (loading) {
    return <div className="min-h-screen bg-[#151624] flex items-center justify-center font-semibold text-gray-400">Loading Data Pegawai...</div>;
  }

  return (
    <div className="min-h-screen bg-[#151624] flex text-white font-sans">
      
      {/* SIDEBAR NAVIGASI */}
      <aside className="w-16 border-r border-gray-800 flex flex-col items-center py-6 justify-between bg-[#151624]">
        <div className="space-y-8 flex flex-col items-center">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">HR</div>
          <Link href="/" className="text-gray-500 text-lg hover:text-white transition" title="Dashboard">🏠</Link>
          <Link href="/employees" className="text-blue-500 text-lg" title="Data Pegawai">📂</Link>
          <Link href="/attendance" className="text-gray-500 text-lg hover:text-white transition" title="Manajemen Absensi">📅</Link>
          <Link href="/attendance/logs" className="text-gray-500 text-lg hover:text-white transition" title="Riwayat Harian">📝</Link>
          <Link href="/leaves" className="text-gray-500 text-lg hover:text-white transition" title="Approval Cuti">✔️</Link>
          <Link href="/payroll" className="text-gray-500 text-lg hover:text-white transition" title="Laporan Gaji">💵</Link>
        </div>
        <button onClick={() => { localStorage.removeItem("isLoggedIn"); router.push("/login"); }} className="text-gray-500 hover:text-red-500 text-lg">🚪</button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Data Pegawai</h1>
            <p className="text-xs text-gray-500 mt-0.5">Total Terdaftar: {employees.length} Orang</p>
          </div>
          
          {/* SEARCH BAR */}
          <div className="relative">
            <Link href="/employees/create" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-semibold transition">
              + Tambah Pegawai
            </Link>
            <input
              type="text"
              placeholder="Cari nama atau NIP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1f2235] border border-gray-800 text-sm rounded-xl px-4 py-2 w-full sm:w-64 focus:outline-none focus:border-blue-500 text-white transition"
            />
          </div>
        </div>

        {/* TABLE CONTAINER (Gaya Dark Mode Elegan) */}
        <div className="bg-[#1f2235] rounded-[24px] border border-gray-800/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-[#1b1c2e]">
                  <th className="py-4 px-6">NIP</th>
                  <th className="py-4 px-6">Nama</th>
                  <th className="py-4 px-6">Email / Kontak</th>
                  <th className="py-4 px-6">Divisi</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#151624]/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-semibold text-blue-400">{emp.nip}</td>
                      <td className="py-4 px-6 font-bold text-gray-200">{emp.nama}</td>
                      <td className="py-4 px-6 text-xs space-y-0.5">
                        <p className="text-gray-300 font-medium">{emp.email}</p>
                        <p className="text-gray-500">{emp.phone || "-"}</p>
                      </td>
                      <td className="py-4 px-6 text-gray-300 font-medium">{emp.divisi}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                          emp.role === "admin" ? "bg-red-900/40 text-red-400 border border-red-800/30" :
                          emp.role === "hr" ? "bg-purple-900/40 text-purple-400 border border-purple-800/30" : 
                          "bg-blue-900/40 text-blue-400 border border-blue-800/30"
                        }`}>
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-400 font-medium">{emp.join_date || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500 font-medium">Pegawai tidak ditemukan.</td>
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