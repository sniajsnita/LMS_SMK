import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    full_name: "Memuat...",
    email: "",
    created_at: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      setProfile({
        full_name: profileData?.full_name || "Nama Tidak Diatur",
        email: user.email,
        created_at: user.created_at,
      });
    } catch (error) {
      console.error("Error fetching user data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI RESET PASSWORD VIA EMAIL ---
  const handleResetPassword = async () => {
    if (!profile.email) return;

    const confirmReset = window.confirm(
      `Kami akan mengirimkan instruksi perubahan kata sandi ke email: ${profile.email}. Lanjutkan?`
    );

    if (confirmReset) {
      try {
        setResetLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
          // Ganti link ini sesuai dengan route halaman update password di app kamu
          redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) throw error;
        alert("✅ Email pemulihan telah dikirim! Silakan periksa kotak masuk atau folder spam Anda.");
      } catch (error) {
        alert("❌ Gagal mengirim email: " + error.message);
      } finally {
        setResetLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Yakin ingin keluar?")) {
      try {
        await supabase.auth.signOut();
        localStorage.clear();
        window.location.href = "/login";
      } catch (error) {
        alert("Gagal logout: " + error.message);
      }
    }
  };

  if (loading) {
    return <div className="p-5 text-center">Memuat pengaturan...</div>;
  }

  return (
    <div className="container py-4" style={{ maxWidth: "900px" }}>
      
      {/* Header */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Pengaturan</h1>
        <p className="text-muted">Kelola preferensi dan pengaturan akun Anda</p>
      </div>

      {/* Informasi Akun */}
      <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <div className="card-header bg-white fw-semibold py-3 border-bottom">Informasi Akun</div>
        <div className="card-body">
          <div className="mb-3">
            <small className="text-muted">Nama Lengkap</small>
            <div className="fw-medium">{profile.full_name}</div>
          </div>
          <hr className="text-muted opacity-25" />
          <div className="mb-3">
            <small className="text-muted">Email</small>
            <div className="fw-medium">{profile.email}</div>
          </div>
          <hr className="text-muted opacity-25" />
          <div>
            <small className="text-muted">Bergabung Sejak</small>
            <div className="fw-medium">
              {new Date(profile.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Keamanan & Privasi */}
      <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <div className="card-header bg-white fw-semibold py-3 border-bottom">Keamanan & Privasi</div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div className="fw-semibold">Ubah Password</div>
              <small className="text-muted">Kirim link reset ke email Anda</small>
            </div>
            <button 
              className="btn btn-outline-primary btn-sm px-3" 
              onClick={handleResetPassword}
              disabled={resetLoading}
            >
              {resetLoading ? "Mengirim..." : "Ubah"}
            </button>
          </div>
          <hr className="text-muted opacity-25" />
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-semibold">Autentikasi 2 Faktor</div>
              <small className="text-muted">Tambahkan lapisan keamanan ekstra</small>
            </div>
            <button className="btn btn-outline-secondary btn-sm" disabled>Segera Hadir</button>
          </div>
        </div>
      </div>

      {/* Notifikasi */}
      <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <div className="card-header bg-white fw-semibold py-3">Notifikasi</div>
        <div className="card-body">
          {[
            ["Notifikasi Email", "Terima notifikasi melalui email"],
            ["Notifikasi Tugas Baru", "Beritahu saat ada tugas baru"],
            ["Notifikasi Nilai", "Beritahu saat tugas dinilai"],
            ["Notifikasi Diskusi", "Beritahu saat ada balasan diskusi"],
          ].map((item, i) => (
            <div key={i}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div className="fw-semibold">{item[0]}</div>
                  <small className="text-muted">{item[1]}</small>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" defaultChecked />
                </div>
              </div>
              {i !== 3 && <hr className="text-muted opacity-25" />}
            </div>
          ))}
        </div>
      </div>

      {/* Preferensi */}
      <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <div className="card-header bg-white fw-semibold py-3">Preferensi</div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div className="fw-semibold">Bahasa</div>
              <small className="text-muted">Pilih bahasa tampilan</small>
            </div>
            <span className="badge bg-light text-dark border">Bahasa Indonesia</span>
          </div>
          <hr className="text-muted opacity-25" />
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-semibold">Mode Gelap</div>
              <small className="text-muted">Gunakan tema gelap</small>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" />
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="card border-danger mb-4 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold text-danger">Keluar dari Akun</div>
            <small className="text-muted">Keluar dari akun Anda di perangkat ini</small>
          </div>
          <button className="btn btn-danger px-4" style={{ borderRadius: "8px" }} onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="card text-center bg-light border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="card-body">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: "64px", height: "64px", fontSize: "1.5rem" }}
          >
            ⚙️
          </div>
          <h5 className="fw-bold">EduSpace</h5>
          <p className="text-muted mb-2">Platform Pembelajaran Interaktif</p>
          <span className="badge bg-white text-dark border">Versi 1.0.0</span>
        </div>
      </div>

    </div>
  );
}