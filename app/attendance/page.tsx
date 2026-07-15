"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx"; // Import library excel
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
  tanggal: string; // Format: YYYY-MM-DD
  check_in: string | null;
  check_out: string | null;
  status: string;
  lembur: string | null;
  employee?: Employee;
}

interface AttendanceSummary {
  employee_id: number;
  nip: string;
  nama: string;
  divisi: string;
  hadir: number;
  terlambat: number;
  izin: number;
  alfa: number;
}

export default function AttendancePage() {
  const router = useRouter();
  const [rawAttendances, setRawAttendances] = useState<RawAttendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>(" ");
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-06");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) router.push("/login");
  }, [router]);

  // Ambil Data dari API
  // Ambil Data dari API dengan Fallback Data Simulasi Juni 2026
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${BASE_URL}/attendances`);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setRawAttendances(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("Koneksi API Laravel offline/kosong. Menggunakan data simulasi Juni 2026 untuk demo.");
        
        // DATA SIMULASI JUNI 2026 AGAR EXCEL MATRIKS LANGSUNG TERISI LENGKAP
        const demoData: RawAttendance[] = [
          // Data Absensi Budi Santoso (employee_id: 2) di bulan Juni
          { id: 1, employee_id: 2, tanggal: "2026-06-01", check_in: "08:00", check_out: "17:00", status: "Hadir", lembur: null, employee: { id: 2, nip: "202601002", nama: "Budi Santoso", divisi: "Software Engineer" } },
          { id: 2, employee_id: 2, tanggal: "2026-06-02", check_in: "08:45", check_out: "17:00", status: "Terlambat", lembur: null, employee: { id: 2, nip: "202601002", nama: "Budi Santoso", divisi: "Software Engineer" } },
          { id: 3, employee_id: 2, tanggal: "2026-06-03", check_in: null, check_out: null, status: "Izin", lembur: null, employee: { id: 2, nip: "202601002", nama: "Budi Santoso", divisi: "Software Engineer" } },
          { id: 4, employee_id: 2, tanggal: "2026-06-04", check_in: "07:55", check_out: "17:00", status: "Hadir", lembur: null, employee: { id: 2, nip: "202601002", nama: "Budi Santoso", divisi: "Software Engineer" } },
          
          // Data Absensi Rina Amelia (employee_id: 1) di bulan Juni
          { id: 5, employee_id: 1, tanggal: "2026-06-01", check_in: "07:50", check_out: "17:00", status: "Hadir", lembur: null, employee: { id: 1, nip: "202601001", nama: "Rina Amelia", divisi: "UI/UX Designer" } },
          { id: 6, employee_id: 1, tanggal: "2026-06-02", check_in: "07:55", check_out: "17:00", status: "Hadir", lembur: null, employee: { id: 1, nip: "202601001", nama: "Rina Amelia", divisi: "UI/UX Designer" } },
          { id: 7, employee_id: 1, tanggal: "2026-06-03", check_in: null, check_out: null, status: "Alfa", lembur: null, employee: { id: 1, nip: "202601001", nama: "Rina Amelia", divisi: "UI/UX Designer" } },
          { id: 8, employee_id: 1, tanggal: "2026-06-04", check_in: "08:10", check_out: "17:00", status: "Terlambat", lembur: null, employee: { id: 1, nip: "202601001", nama: "Rina Amelia", divisi: "UI/UX Designer" } },
        ];
        
        setRawAttendances(demoData);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Kalkulasi rekap secara real-time berdasarkan filter bulan
  const hasilRekap: AttendanceSummary[] = [];
  const filteredRaw = rawAttendances.filter((item) => item.tanggal.startsWith(selectedMonth));

  filteredRaw.forEach((item) => {
    const empId = item.employee_id;
    const statusAbsen = item.status.toLowerCase();

    let target = hasilRekap.find((r) => r.employee_id === empId);

    if (!target) {
      target = {
        employee_id: empId,
        nip: item.employee?.nip || "-",
        nama: item.employee?.nama || "Unknown",
        divisi: item.employee?.divisi || "-",
        hadir: 0,
        terlambat: 0,
        izin: 0,
        alfa: 0,
      };
      hasilRekap.push(target);
    }

    if (statusAbsen === "hadir" || statusAbsen === "masuk") target.hadir += 1;
    else if (statusAbsen === "terlambat") target.terlambat += 1;
    else if (statusAbsen === "izin" || statusAbsen === "cuti") target.izin += 1;
    else if (statusAbsen === "alfa") target.alfa += 1;
  });

  const filteredSummaries = hasilRekap.filter(item =>
    item.nama.toLowerCase().includes(search.toLowerCase()) || item.nip.includes(search)
  );

  // FUNGSI UPDATE EXPORT EXCEL (SUDAH DITAMBAHKAN DETAIL PERIODE TANGGAL/BULAN)
  // FUNGSI UPDATE EXPORT EXCEL: Log Vertikal per Tanggal + Rekapitulasi di Bawah
  const handleExportExcel = () => {
    if (filteredRaw.length === 0) {
      alert("Tidak ada data absensi untuk diekspor pada bulan ini!");
      return;
    }

    // Helper untuk mendapatkan nama hari Indonesia
    const getNamaHari = (dateString: string) => {
      const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const d = new Date(dateString);
      return hari[d.getDay()];
    };

    // Helper untuk mengubah format YYYY-MM-DD menjadi DD/MM/YYYY
    const formatTanggalIndo = (dateString: string) => {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    };

    // --- BAGIAN 1: MENYUSUN DATA LOG HARIAN (VERTIKAL) ---
    // Urutkan data berdasarkan tanggal terkecil ke terbesar
    const sortedRaw = [...filteredRaw].sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    // Kelompokkan data atau langsung map ke baris Excel seperti gambar
    let lastTanggal = "";
    let nomorUrutTanggal = 1;

    const barisLogHarian = sortedRaw.map((item) => {
      const tanggalSama = item.tanggal === lastTanggal;
      
      // Jika tanggalnya baru, reset nomor urut karyawan di tanggal tersebut jadi 1
      if (!tanggalSama) {
        nomorUrutTanggal = 1;
        lastTanggal = item.tanggal;
      } else {
        nomorUrutTanggal++;
      }

      // Format kolom keterangan status agar rapi
      let keteranganStatus = item.status;
      if (item.status.toLowerCase() === "masuk" || item.status.toLowerCase() === "hadir") {
        keteranganStatus = "Masuk";
      } else if (item.status.toLowerCase() === "terlambat") {
        keteranganStatus = "Telat";
      }

      return {
        "Tanggal": `${getNamaHari(item.tanggal)}, ${formatTanggalIndo(item.tanggal)}`, // Contoh: Senin, 01/06/2026
        "No": nomorUrutTanggal,
        "Nama Karyawan": item.employee?.nama || "Unknown",
        "NIP": item.employee?.nip || "-",
        "Divisi": item.employee?.divisi || "-",
        "Keterangan": keteranganStatus
      };
    });

    // --- BAGIAN 2: MENYUSUN DATA SUMMARY / REKAPITULASI ---
    const barisRekapitulasi = filteredSummaries.map((item, index) => ({
      "No": index + 1,
      "Nama Karyawan": item.nama,
      "NIP": item.nip,
      "Divisi": item.divisi,
      "Total Hadir": `${item.hadir} Hari`,
      "Total Telat": `${item.terlambat} Kali`,
      "Total Izin": `${item.izin} Hari`,
      "Total Alfa": `${item.alfa} Hari`
    }));

    // --- BAGIAN 3: MEMBUAT WORKSHEET EXCEL ---
    const worksheet = XLSX.utils.json_to_sheet([]);

    // 1. Tulis Kop Judul Atas
    const formatBulanIndo: { [key: string]: string } = {
      "2026-06": "Juni 2026",
      "2026-05": "Mei 2026",
      "2026-04": "April 2026"
    };
    const namaBulanPilihan = formatBulanIndo[selectedMonth] || selectedMonth;

    XLSX.utils.sheet_add_aoa(worksheet, [
      ["LAPORAN REKAPITULASI ABSENSI BULANAN KARYAWAN"],
      [`Periode Laporan: ${namaBulanPilihan}`],
      [] // Jarak kosong
    ], { origin: "A1" });

    // 2. Masukkan Tabel Utama: Log Harian Vertikal (Mulai baris ke-4)
    XLSX.utils.sheet_add_json(worksheet, barisLogHarian, { origin: "A4", skipHeader: false });

    // 3. Cari baris kosong di bawah tabel pertama untuk menaruh tabel Rekapitulasi
    const barisKosongAwal = 4 + barisLogHarian.length + 3; // Beri jeda 3 baris di bawah tabel pertama

    // 4. Tulis Judul untuk Tabel Rekapitulasi Pembatas
    XLSX.utils.sheet_add_aoa(worksheet, [
      ["TOTAL AKUMULASI REKAPITULASI BULANAN"],
      [] // Jarak kosong
    ], { origin: `A${barisKosongAwal}` });

    // 5. Masukkan Tabel Kedua: Rekapitulasi Total Karyawan
    XLSX.utils.sheet_add_json(worksheet, barisRekapitulasi, { origin: `A${barisKosongAwal + 2}`, skipHeader: false });

    // 6. Bungkus menjadi file Excel workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Absensi");

    // Unduh file secara otomatis
    XLSX.writeFile(workbook, `Laporan_Absensi_Lengkap_${selectedMonth}.xlsx`);
  };

  if (loading) return <div className="min-h-screen bg-[#151624] flex items-center justify-center text-gray-400">Loading Laporan...</div>;

  return (
    <div className="min-h-screen bg-[#151624] flex text-white font-sans">
      {/* SIDEBAR */}
      <aside className="w-16 border-r border-gray-800 flex flex-col items-center py-6 justify-between bg-[#151624]">
        <div className="space-y-8 flex flex-col items-center">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">HR</div>
          <Link href="/" className="text-gray-500 text-lg hover:text-white transition" title="Dashboard">🏠</Link>
          <Link href="/employees" className="text-gray-500 text-lg hover:text-white transition" title="Data Pegawai">📂</Link>
          <Link href="/attendance" className="text-blue-500 text-lg" title="Laporan Bulanan">📅</Link>
          <Link href="/attendance/logs" className="text-gray-500 text-lg hover:text-white transition" title="Riwayat Harian">📝</Link>
          <Link href="/leaves" className="text-gray-500 text-lg hover:text-white transition" title="Approval Cuti">✔️</Link>
          <Link href="/payroll" className="text-gray-500 text-lg hover:text-white transition" title="Laporan Gaji">💵</Link>
        </div>
        <button onClick={() => { localStorage.removeItem("isLoggedIn"); router.push("/login"); }} className="text-gray-500 hover:text-red-500 text-lg">🚪</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Laporan Absensi Bulanan</h1>
            <p className="text-xs text-gray-500 mt-0.5">Data akumulasi berkala untuk rekapitulasi penggajian HR</p>
          </div>

          <div className="flex items-center gap-3">
            {/* FILTER BULAN DROPDOWN */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Periode:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-[#1f2235] border border-gray-800 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="2026-06">Juni 2026</option>
                <option value="2026-05">Mei 2026</option>
                <option value="2026-04">April 2026</option>
              </select>
            </div>

            {/* TOMBOL EXCEL BARU */}
            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              📊 Export Excel
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center gap-4">
          <Link href="/attendance/logs" className="text-xs text-blue-400 hover:underline">➡️ Lihat Log Riwayat Harian Tanpa Grouping</Link>
          <input
            type="text"
            placeholder="Cari nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1f2235] border border-gray-800 text-sm rounded-xl px-4 py-1.5 w-64 text-white focus:outline-none"
          />
        </div>

        {/* TABEL REKAP */}
        <div className="bg-[#1f2235] rounded-[24px] border border-gray-800/60 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase bg-[#1b1c2e]">
                <th className="py-4 px-6">Karyawan</th>
                <th className="py-4 px-6 text-center text-green-400">Hadir</th>
                <th className="py-4 px-6 text-center text-amber-400">Terlambat</th>
                <th className="py-4 px-6 text-center text-blue-400">Izin</th>
                <th className="py-4 px-6 text-center text-red-400">Alfa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredSummaries.length > 0 ? (
                filteredSummaries.map((item) => (
                  <tr key={item.employee_id} className="hover:bg-[#151624]/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-200">{item.nama}</div>
                      <div className="text-[11px] text-gray-500 font-mono mt-0.5">{item.nip} — {item.divisi}</div>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-green-400">{item.hadir} Hari</td>
                    <td className="py-4 px-6 text-center font-bold text-amber-400">{item.terlambat} Kali</td>
                    <td className="py-4 px-6 text-center font-bold text-blue-400">{item.izin} Hari</td>
                    <td className="py-4 px-6 text-center font-bold text-red-400">{item.alfa} Hari</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">Tidak ada rekap data pada periode bulan ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}