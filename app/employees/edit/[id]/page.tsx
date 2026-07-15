"use client";
import { useState, useEffect, use } from "react";
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

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [formData, setFormData] = useState({
    nip: "",
    nama: "",
    email: "",
    divisi: "",
    phone: "",
    alamat: "",
    role: "employee",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Proteksi Login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  // Fetch data awal pegawai berdasarkan ID
  useEffect(() => {
    const fetchEmployeeDetail = async () => {
      try {
        const res = await fetch(`${BASE_URL}/employees/${id}`);
        if (!res.ok) throw new Error("Gagal mengambil data");
        const data = await res.json();
        
        setFormData({
          nip: data.nip || "",
          nama: data.nama || "",
          email: data.email || "",
          divisi: data.divisi || "",
          phone: data.phone || "",
          alamat: data.alamat || "",
          role: data.role || "employee",
        });
      } catch (err) {
        console.warn("Mengambil data dari localStorage untuk edit form.");
        
        // Membaca database simulasi lokal agar tersinkronisasi
        const localData = localStorage.getItem("mock_employees");
        if (localData) {
          const mockEmployees: Employee[] = JSON.parse(localData);
          const found = mockEmployees.find((emp) => emp.id === Number(id));
          if (found) {
            setFormData({
              nip: found.nip,
              nama: found.nama,
              email: found.email,
              divisi: found.divisi,
              phone: found.phone || "",
              alamat: found.alamat || "",
              role: found.role,
            });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployeeDetail();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // LANGKAH SYNC: Update data di localStorage secara realtime
    const localData = localStorage.getItem("mock_employees");
    if (localData) {
      const mockEmployees: Employee[] = JSON.parse(localData);
      const updatedMock = mockEmployees.map((emp) => {
        if (emp.id === Number(id)) {
          return {
            ...emp,
            nama: formData.nama,
            email: formData.email,
            divisi: formData.divisi,
            phone: formData.phone,
            alamat: formData.alamat,
            role: formData.role,
          };
        }
        return emp;
      });
      localStorage.setItem("mock_employees", JSON.stringify(updatedMock));
    }

    try {
      const res = await fetch(`${BASE_URL}/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal mengupdate data");
      alert("Data pegawai berhasil diperbarui!");
      router.push("/employees");
    } catch (err) {
      alert("Simulasi Perubahan Berhasil di simpan!");
      router.push("/employees");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#151624] flex items-center justify-center font-semibold text-gray-400">Memuat Data Form...</div>;
  }

  return (
    <div className="min-h-screen bg-[#151624] flex text-white font-sans">
      <aside className="w-16 border-r border-gray-800 flex flex-col items-center py-6 bg-[#151624]">
        <div className="space-y-8 flex flex-col items-center">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">HR</div>
          <Link href="/" className="text-gray-500 text-lg hover:text-white transition">🏠</Link>
          <Link href="/employees" className="text-blue-500 text-lg">📂</Link>
          <Link href="/leaves" className="text-gray-500 text-lg hover:text-white transition">✔️</Link>
        </div>
      </aside>

      <main className="flex-1 p-8 max-w-2xl mx-auto space-y-6">
        <div>
          <Link href="/employees" className="text-blue-400 text-sm hover:underline">
            ← Kembali ke Data Pegawai
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mt-4">Edit Data Pegawai</h1>
          <p className="text-xs text-gray-500 mt-0.5">Ubah informasi data dengan NIP: {formData.nip}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1f2235] p-6 rounded-[24px] border border-gray-800/60 space-y-4 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nama Lengkap</label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full bg-[#151624] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#151624] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nomor Telepon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#151624] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Divisi Kerja</label>
              <input
                type="text"
                required
                value={formData.divisi}
                onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                className="w-full bg-[#151624] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Hak Akses (Role)</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-[#151624] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
              >
                <option value="employee">Employee</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Alamat Rumah</label>
            <textarea
              rows={3}
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full bg-[#151624] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/employees" className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-700 hover:bg-gray-600 transition">
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}