"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import StatBox from "./components/StatBox";
import PayrollCard from "./components/PayrollCard";
import Link from "next/link";
import { BASE_URL } from "@/lib/config";

// Sesuaikan interface dengan struktur data dari Laravel teman Anda
interface Employee {
  id: number;
  nip: string;
  nama: string;
  email: string;
  divisi: string;
  role: string;
}

interface LeaveRequest {
  id: number;
  employee_id: number;
  jenis: string; // sesuaikan jika di database teman Anda namanya beda, misal 'type'
  start_date: string; // misal 'start_date'
  end_date: string; // misal 'end_date'
  reason: string; // misal 'reason'
  status: string; // Pending, approved, rejected
  employee?: Employee; // Data karyawan yang menempel di data cuti
  
  // Data fallback untuk statistik & payroll (jika belum dihitung di Laravel)
  hadir?: number;
  telat?: number;
  lembur?: number;
  gaji_pokok?: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [approvalData, setApprovalData] = useState<LeaveRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Proteksi Login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  // =============== PERBAIKAN DI SINI: FETCH DATA DENGAN TIMEOUT CONTROLLER ===============
  useEffect(() => {
  const fetchLeaves = async () => {
    try {
      console.log("BASE_URL:", BASE_URL);
      console.log("Request URL:", `${BASE_URL}/leaves`);

      const res = await fetch(`${BASE_URL}/leaves`);

      console.log("Response Status:", res.status);
      console.log("Response OK:", res.ok);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      console.log("Response Data:", data);
      console.log("Array?", Array.isArray(data));
      console.log("Jumlah Data:", Array.isArray(data) ? data.length : 0);

      // Tidak menganggap array kosong sebagai error
      setApprovalData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchLeaves();
}, []);
  // =======================================================================================

  // Handler Update Status Approve / Reject ke API Teman Anda
  const handleUpdateStatus = async (id: number, newStatus: "approve" | "reject") => {
    // Sinkronisasi Lokal UI
    const statusText = newStatus === "approve" ? "approved" : "rejected";
    const updated = approvalData.map((item) =>
      item.id === id ? { ...item, status: statusText } : item
    );
    setApprovalData(updated);
    if (currentRequest >= pendingRequests.length - 1) {
      setCurrentRequest(0);
    }
    // Tembak endpoint PUT /api/leaves/{id}/approve atau /api/leaves/{id}/reject
    try {
      await fetch(`${BASE_URL}/leaves/${id}/${newStatus}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const res = await fetch(`${BASE_URL}/leaves`);
      const data = await res.json();

      setApprovalData(data);
    } catch (error) {
      console.error(`Gagal mengirim status ${newStatus} ke Laravel:`, error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#151624] flex items-center justify-center font-semibold text-gray-400">Loading UI Dashboard...</div>;
  }

  const pendingRequests = approvalData.filter(
    (item) => item.status.toLowerCase() === "pending"
  );

const activeRequest = pendingRequests.length > 0 ? pendingRequests[currentRequest] : null;  

  // Logika kalkulasi payroll aman (memakai data fallback jika null)
  const hadir = activeRequest?.hadir || 13;
  const telat = activeRequest?.telat || 0;
  const lembur = activeRequest?.lembur || 4;
  const gajiPokok = activeRequest?.gaji_pokok || 4500000;

  const tunjanganHadir = hadir * 20000;
  const bonusLembur = lembur * 50000;
  const potonganTelat = telat * 25000;
  const totalGajiClean = gajiPokok + tunjanganHadir + bonusLembur - potonganTelat;

  const cardColors = [
    "bg-[#ffebdc] text-[#bf7135]", 
    "bg-[#e3ecff] text-[#4d73b3]", 
    "bg-[#e1f9eb] text-[#3d8c5c]", 
  ];
  const currentCardStyle = cardColors[currentRequest % cardColors.length];

  return (
    <div className="min-h-screen bg-[#151624] flex text-white font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-16 border-r border-gray-800 flex flex-col items-center py-6 justify-between bg-[#151624]">
        <div className="space-y-8 flex flex-col items-center">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">HR</div>
          
          {/* Menggunakan Link biar transisi smooth */}
          <Link href="/" className="text-blue-500 text-lg" title="Dashboard">🏠</Link>
          <Link href="/employees" className="text-gray-500 text-lg hover:text-white transition" title="Data Pegawai">📂</Link>
          <Link href="/attendance" className="text-gray-500 text-lg hover:text-white transition" title="Manajemen Absensi">📅</Link>
          <Link href="/attendance/logs" className="text-gray-500 text-lg hover:text-white transition" title="Riwayat Harian">📝</Link>
          <Link href="/leaves" className="text-gray-500 text-lg hover:text-white transition" title="Approval Cuti">✔️</Link>
          <Link href="/payroll" className="text-gray-500 text-lg hover:text-white transition" title="Laporan Gaji">💵</Link>
        </div>
        <button onClick={() => { localStorage.removeItem("isLoggedIn"); router.push("/login"); }} className="text-gray-500 hover:text-red-500 text-lg"> 🚪 </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
              <p className="text-xs text-gray-500 mt-0.5">Juni 2026</p>
            </div>
          </div>

          {/* STATS COUNT */}
          <div className="flex gap-10 bg-[#1b1c2e] p-5 rounded-2xl border border-gray-800/40">
            <StatBox title="Total Hadir" value={hadir} />
            <StatBox title="Total Telat" value={telat} />
            <StatBox title="Total Lembur" value={lembur} />
          </div>

          {/* GRID CARD REQUEST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* CARD DATA PROFILE */}
            <div
              className={`p-6 rounded-[24px] ${currentCardStyle} flex flex-col justify-between min-h-[220px] shadow-sm`}
            >
              <div>
                <p className="text-[10px] font-bold tracking-widest opacity-60 uppercase">
                  {activeRequest?.employee?.divisi || "-"}
                </p>

                <h2 className="text-xl font-bold mt-1 tracking-tight">
                  {activeRequest?.employee?.nama || "Belum Ada Pengajuan"}
                </h2>

                <p className="text-xs opacity-75 mt-1">
                  NIP: {activeRequest?.employee?.nip || "-"}
                </p>

                <p className="text-xs font-semibold mt-4">
                  Pengajuan: {activeRequest?.jenis || "-"}
                </p>

                <p className="text-xs mt-0.5 opacity-90">
                  {activeRequest?.reason || "Tidak ada pengajuan yang menunggu approval"}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-black/10 mt-4 text-xs font-bold">
                <span>
                  {activeRequest
                    ? `${activeRequest.start_date} s/d ${activeRequest.end_date}`
                    : "-"}
                </span>

                <span className="uppercase tracking-wider px-2.5 py-1 bg-black/10 rounded-lg text-[10px]">
                  {activeRequest?.status || "-"}
                </span>
              </div>
            </div>


            {/* ACTION & SLIDER NAV */}
            <div className="bg-[#1f2235] p-6 rounded-[24px] flex flex-col justify-between border border-gray-800/60">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Review Pengajuan
                </h3>

                <p className="text-xs text-blue-400 font-semibold mt-1">
                  Data {pendingRequests.length > 0
                    ? `${currentRequest + 1} dari ${pendingRequests.length}`
                    : "0 dari 0"}
                </p>

                {/* Tombol Approval */}
                <div className="flex gap-2.5 mt-6">
                  <button
                    disabled={!activeRequest}
                    onClick={() =>
                      activeRequest && handleUpdateStatus(activeRequest.id, "reject")
                    }
                    className="flex-1 py-2 rounded-xl bg-red-900/40 hover:bg-red-900/60 text-red-400 font-bold text-xs border border-red-800/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    REJECT
                  </button>

                  <button
                    disabled={!activeRequest}
                    onClick={() =>
                      activeRequest && handleUpdateStatus(activeRequest.id, "approve")
                    }
                    className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition disabled:bg-green-600/40 disabled:text-gray-300 disabled:cursor-not-allowed"
                  >
                    APPROVE
                  </button>
                </div>
              </div>

              {/* Tombol Navigasi */}
              <div className="flex gap-2.5 pt-4 border-t border-gray-800/60 mt-4">
                <button
                  disabled={!activeRequest || currentRequest === 0}
                  onClick={() => setCurrentRequest((prev) => prev - 1)}
                  className="flex-1 py-2 bg-[#151624] text-gray-300 rounded-xl text-xs font-medium disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  ◀ Prev
                </button>

                <button
                  disabled={
                    !activeRequest ||
                    currentRequest === pendingRequests.length - 1
                  }
                  onClick={() => setCurrentRequest((prev) => prev + 1)}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Next ▶
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR PAYROLL */}
        <div className="bg-[#1f2235] p-6 rounded-[24px] border border-gray-800/60 flex flex-col justify-between h-full min-h-[450px]">
          <div className="space-y-4">
            <div className="border-b border-gray-800 pb-3">
              <h2 className="text-base font-bold tracking-tight text-gray-200">Payroll Summary</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Estimasi Berdasarkan Kehadiran</p>
            </div>
            
            <div className="space-y-2.5">
              <PayrollCard title="Gaji Pokok" nominal={`Rp ${gajiPokok.toLocaleString("id-ID")}`} />
              <PayrollCard title="Tunjangan Hadir" nominal={`Rp ${tunjanganHadir.toLocaleString("id-ID")}`} />
              <PayrollCard title="Bonus Lembur" nominal={`Rp ${bonusLembur.toLocaleString("id-ID")}`} />
              <PayrollCard title="Potongan Telat" nominal={`- Rp ${potonganTelat.toLocaleString("id-ID")}`} textColor="text-red-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl flex justify-between items-center mt-6 shadow-md">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider">Total Bersih</span>
              <span className="text-base font-black">Rp {totalGajiClean.toLocaleString("id-ID")}</span>
            </div>
            <span className="text-xl">💰</span>
          </div>
        </div>

      </main>
    </div>
  );
}