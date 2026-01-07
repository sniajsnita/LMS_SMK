import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase"; // Pastikan path ini sesuai dengan file supabase.js kamu

export default function Register() {
  // 1. Inisialisasi State untuk menampung input
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // 2. Fungsi untuk menangani Registrasi
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
      options: {
        // Data ini yang akan ditangkap oleh SQL Trigger untuk mengisi tabel PROFILES
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      alert("Gagal daftar: " + error.message);
    } else {
      alert("Registrasi berhasil! Silakan cek email kamu untuk verifikasi.");
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{ background: "#f5f7fb" }}
    >
      <div
        className="bg-white w-100"
        style={{
          maxWidth: "420px",
          borderRadius: "18px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
        }}
      >
        <div className="p-4 p-md-5">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">Create Account</h2>
            <p className="text-muted">Sign up to get started</p>
          </div>

          <form onSubmit={handleRegister}>
            {/* Name */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                type="text"
                className="form-control py-2 rounded-3"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control py-2 rounded-3"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control py-2 rounded-3"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn w-100 py-2 rounded-3 text-white"
              style={{ background: "#0f172a" }}
            >
              {loading ? "Loading..." : "Sign up"}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-4 small">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="fw-semibold text-decoration-none">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}