import React from "react";
import { Link } from "react-router-dom";

export default function Settings() {
  const user = {
    full_name: "Nama Pengguna",
    email: "user@email.com",
    created_date: "2024-01-10",
  };

  const handleLogout = () => {
    if (window.confirm("Yakin ingin keluar?")) {
      console.log("Logout");
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "900px" }}>
      
      {/* Header */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Pengaturan</h1>
        <p className="text-muted">Kelola preferensi dan pengaturan akun Anda</p>
      </div>

      {/* Informasi Akun */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">Informasi Akun</div>
        <div className="card-body">
          <div className="mb-3">
            <small className="text-muted">Nama Lengkap</small>
            <div className="fw-medium">{user.full_name}</div>
          </div>
          <hr />
          <div className="mb-3">
            <small className="text-muted">Email</small>
            <div className="fw-medium">{user.email}</div>
          </div>
          <hr />
          <div>
            <small className="text-muted">Bergabung Sejak</small>
            <div className="fw-medium">
              {new Date(user.created_date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Notifikasi */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">Notifikasi</div>
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
              {i !== 3 && <hr />}
            </div>
          ))}

        </div>
      </div>

      {/* Preferensi */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">Preferensi</div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div className="fw-semibold">Bahasa</div>
              <small className="text-muted">Pilih bahasa tampilan</small>
            </div>
            <span className="badge bg-light text-dark border">Bahasa Indonesia</span>
          </div>
          <hr />
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

      {/* Keamanan */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">Keamanan & Privasi</div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div className="fw-semibold">Ubah Password</div>
              <small className="text-muted">Perbarui password akun Anda</small>
            </div>
            <button className="btn btn-outline-secondary btn-sm">Ubah</button>
          </div>
          <hr />
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-semibold">Autentikasi 2 Faktor</div>
              <small className="text-muted">Tambahkan lapisan keamanan ekstra</small>
            </div>
            <button className="btn btn-outline-secondary btn-sm">Aktifkan</button>
          </div>
        </div>
      </div>

      {/* Logout */}
        <div className="card border-danger mb-4">
            <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                <div className="fw-bold text-danger">Keluar dari Akun</div>
                <small className="text-muted">
                    Keluar dari akun Anda di perangkat ini
                </small>
                </div>

                <Link
                to="/login"
                className="btn btn-danger"
                onClick={(e) => {
                    e.preventDefault();
                    if (window.confirm("Yakin ingin keluar?")) {
                    handleLogout();
                    window.location.href = "/login";
                    }
                }}
                >
                Keluar
                </Link>
            </div>
        </div>

      {/* App Info */}
      <div className="card text-center bg-light">
        <div className="card-body">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: "64px", height: "64px" }}
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
