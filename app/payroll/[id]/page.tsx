"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BASE_URL } from "@/lib/config";

interface SalaryHistory {
  bulan: string;
  gaji_pokok: number;
  tunjangan_hadir: number;
  bonus_lembur: number;
  potongan_telat: number;
  total_gaji: number;
}

export default function PayrollDetailPage() {
  const params = useParams();
  const employeeId = params.id;
  const searchParams = useSearchParams();
  const router = useRouter();

  const employeeName = searchParams.get("name") || "Pegawai";
  const employeeNip = searchParams.get("nip") || "-";
  const employeeDivisi = searchParams.get("divisi") || "-";
  const employeeJoin = searchParams.get("join") || "-";

  // PERBAIKAN UTAMA: Langsung masukkan data simulasi sebagai nilai awal di useState
  const [history, setHistory] = useState<SalaryHistory[]>([]);
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) router.push("/login");
  }, [router]);
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const now = new Date();

        const res = await fetch(
          `${BASE_URL}/payrolls/${employeeId}/${now.getMonth() + 1}/${now.getFullYear()}`
        );

        const data = await res.json();
        const payroll = Array.isArray(data) ? data : [data];

        setHistory(
          payroll.map((item) => ({
            bulan: `${item.bulan}/${item.tahun}`,
            gaji_pokok: Number(item.gaji_pokok),
            tunjangan_hadir: Number(item.tunjangan_hadir),
            bonus_lembur: Number(item.bonus_lembur),
            potongan_telat: Number(item.potongan_telat),
            total_gaji: Number(item.total_gaji),
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
  }, [employeeId]);

  // Blok useEffect yang lama silakan DIHAPUS semuanya

 
    // ... sisa kode return di bawahnya tetap sama persis, tidak ada yang diubah
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
        <button onClick={() => router.push("/payroll")} className="text-gray-500 hover:text-white text-lg">⬅️</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 space-y-6">
        <div>
          <Link href="/payroll" className="text-xs text-blue-400 hover:underline">← Kembali ke Laporan Utama</Link>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Histori Gaji Berkala</h1>
        </div>

        {/* PROFILE RESUME CARD */}
        <div className="bg-[#1b1c2e] p-6 rounded-[24px] border border-gray-800/60 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Nama Karyawan</p>
            <p className="text-base font-bold text-gray-200 mt-0.5">{employeeName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">NIP / Divisi</p>
            <p className="text-base font-semibold text-gray-200 mt-0.5">{employeeNip} — <span className="text-xs text-gray-400">{employeeDivisi}</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Mulai Bekerja</p>
            <p className="text-base font-semibold text-blue-400 mt-0.5">{employeeJoin}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Periode Kerja</p>
            <p className="text-base font-bold text-amber-400 mt-0.5">{history.length} Bulan</p>
          </div>
        </div>

        {/* TABEL REKAMAN HISTORI GAJI */}
        <div className="bg-[#1f2235] rounded-[24px] border border-gray-800/60 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-[#1b1c2e]">
                <th className="py-4 px-6">Periode Bulan</th>
                <th className="py-4 px-6">Gaji Pokok</th>
                <th className="py-4 px-6">Tunjangan Kehadiran</th>
                <th className="py-4 px-6">Potongan Telat/Alpha</th>
                <th className="py-4 px-6">Total Gaji Bersih</th>
                {/* <th className="py-4 px-6 text-center">Status Bank</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {history.map((record, index) => (
                <tr key={index} className="hover:bg-[#151624]/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-300">{record.bulan}</td>
                  <td className="py-4 px-6 text-gray-400">Rp {record.gaji_pokok.toLocaleString("id-ID")}</td>
                  <td className="py-4 px-6 text-green-500/80">+ Rp {record.tunjangan_hadir.toLocaleString("id-ID")}</td>
                  <td className="py-4 px-6 text-red-400">- Rp {record.potongan_telat.toLocaleString("id-ID")}</td>
                  <td className="py-4 px-6 font-black text-white bg-white/5">Rp {record.total_gaji.toLocaleString("id-ID")}</td>
                  {/* <td className="py-4 px-6 text-center">
                    <span className="px-2.5 py-0.5 bg-green-950 text-green-400 text-[11px] font-bold rounded-full border border-green-900/50">
                      {record.status_transfer}
                    </span>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}