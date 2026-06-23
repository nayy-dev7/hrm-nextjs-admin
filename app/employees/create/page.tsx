"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BASE_URL } from "@/lib/config";

export default function CreateEmployeePage() {
  const router = useRouter();
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (!isLoggedIn) router.push("/login");
  }, [router]);

  const [form, setForm] = useState({
    nip: "",
    nama: "",
    email: "",
    divisi: "",
    phone: "",
    alamat: "",
    join_date: "",
    role: "employee",
    password: "",
    });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      alert("Pegawai berhasil ditambahkan.");
      router.push("/employees");
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan pegawai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#151624] flex text-white font-sans">

      {/* Sidebar */}
      <aside className="w-16 border-r border-gray-800 flex flex-col items-center py-6 bg-[#151624]">
        <div className="space-y-8 flex flex-col items-center">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
            HR
          </div>

          <Link href="/">🏠</Link>
          <Link href="/employees" className="text-blue-400">
            📂
          </Link>
          <Link href="/attendance">📅</Link>
          <Link href="/attendance/logs">📝</Link>
          <Link href="/leaves">✔️</Link>
          <Link href="/payroll">💵</Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">

        <Link
          href="/employees"
          className="text-blue-400 text-sm hover:underline"
        >
          ← Kembali ke Data Pegawai
        </Link>

        <h1 className="text-2xl font-bold mt-4">
          Tambah Pegawai
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-6 bg-[#1f2235] rounded-[24px] p-8 border border-gray-800 space-y-5 max-w-3xl"
        >

          <div>
            <label className="text-sm text-gray-400">NIP</label>
            <input
              name="nip"
              value={form.nip}
              onChange={handleChange}
              required
              className="w-full mt-2 bg-[#151624] border border-gray-700 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Nama Pegawai</label>
            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              required
              className="w-full mt-2 bg-[#151624] border border-gray-700 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full mt-2 bg-[#151624] border border-gray-700 rounded-xl px-4 py-3"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Password</label>
            <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full mt-2 bg-[#151624] border border-gray-700 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">No. HP</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full mt-2 bg-[#151624] border border-gray-700 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Alamat</label>
            <textarea
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              rows={3}
              className="w-full mt-2 bg-[#151624] border border-gray-700 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Divisi</label>
            <select
              name="divisi"
              value={form.divisi}
              onChange={handleChange}
              required
              className="w-full mt-2 bg-[#151624] border border-gray-700 rounded-xl px-4 py-3"
            >
              <option value="">Pilih Divisi</option>
              <option>Software Engineer</option>
              <option>UI/UX Designer</option>
              <option>HR Department</option>
              <option>Finance</option>
              <option>Sales & Marketing</option>
              <option>IT</option>
              <option>Customer Support</option>
              <option>Multimedia</option>
                
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full mt-2 bg-[#151624] border border-gray-700 rounded-xl px-4 py-3"
            >
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400">
              Tanggal Bergabung
            </label>
            <input
              type="date"
              name="join_date"
              value={form.join_date}
              onChange={handleChange}
              required
              className="w-full mt-2 bg-[#151624] border border-gray-700 rounded-xl px-4 py-3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
            >
              {loading ? "Menyimpan..." : "Simpan Pegawai"}
            </button>

            <Link
              href="/employees"
              className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl font-semibold"
            >
              Batal
            </Link>
          </div>

        </form>
      </main>
    </div>
  );
}