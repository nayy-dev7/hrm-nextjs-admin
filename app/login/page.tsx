"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulasi autentikasi / Nantinya dihubungkan ke API Login Laravel
    setTimeout(() => {
      if (email === "admin@company.com" && password === "admin123") {
        // Simpan status login token tiruan ke localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("adminUser", JSON.stringify({ email, role: "HR Admin" }));
        
        // Alihkan halaman ke dashboard utama
        router.push("/");
      } else {
        setError("Email atau password yang Anda masukkan salah.");
        setLoading(false);
      }
    }, 1000); // efek loading 1 detik
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-[22px] shadow-sm border border-gray-100 space-y-6">
        
        {/* LOGO & TITLE */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#0d6efd] rounded-xl flex items-center justify-center mx-auto text-white text-xl font-bold shadow-sm">
            A
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Absensi</h1>
          <p className="text-gray-400 text-sm">Masuk untuk mengelola presensi & payroll</p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold border border-red-100 text-center">
            ⚠️ {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 tracking-wide uppercase">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0d6efd] transition text-gray-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 tracking-wide uppercase">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0d6efd] transition text-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0d6efd] hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition text-sm shadow-sm disabled:opacity-50 mt-2"
          >
            {loading ? "Memverifikasi..." : "LOG IN"}
          </button>
        </form>

      </div>
    </div>
  );
}