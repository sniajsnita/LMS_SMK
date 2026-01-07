import React from "react";
import {
  BookOpen,
  TrendingUp,
  FileText,
  Award,
  EyeOff,
  Lock,
} from "lucide-react";

export default function Progress() {
  const classes = [
    {
      id: 1,
      title: "Pemrograman Web",
      subject: "RPL",
      completed: 6,
      total: 10,
      percent: 60,
    },
    {
      id: 2,
      title: "UI / UX Design",
      subject: "Multimedia",
      completed: 4,
      total: 8,
      percent: 50,
    },
  ];

  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="rounded-4 p-4 mb-4 text-white"
           style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
        <div className="d-flex align-items-center gap-3 mb-2">
          <Lock size={32} />
          <h2 className="fw-bold mb-0">Progress Belajar</h2>
        </div>
        <p className="mb-0 text-light">
          Pantau perkembangan belajar Anda (nilai detail disembunyikan)
        </p>
      </div>

      {/* INFO */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 48, height: 48, background: "#ede9fe" }}
          >
            <EyeOff className="text-purple-600" />
          </div>
          <div>
            <h6 className="fw-bold">Tentang Nilai & Progress</h6>
            <p className="text-muted small mb-1">
              Anda hanya dapat melihat progress umum. Nilai detail hanya dapat
              diakses oleh orang tua melalui Portal Orang Tua.
            </p>
            <small className="text-muted">💡 Fokus pada proses belajar</small>
          </div>
        </div>
      </div>

      {/* STAT */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between">
              <div>
                <small className="text-muted">Total Kelas</small>
                <h3 className="fw-bold">2</h3>
              </div>
              <BookOpen size={32} className="text-primary" />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between">
              <div>
                <small className="text-muted">Progress Rata-rata</small>
                <h3 className="fw-bold">55%</h3>
              </div>
              <TrendingUp size={32} className="text-success" />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between">
              <div>
                <small className="text-muted">Tugas Dinilai</small>
                <h3 className="fw-bold">5</h3>
              </div>
              <FileText size={32} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESS PER CLASS */}
      <div className="card shadow-sm mb-4">
        <div className="card-header fw-bold">
          <TrendingUp size={18} className="me-2 text-primary" />
          Progress per Kelas
        </div>
        <div className="card-body">
          {classes.map((cls) => (
            <div key={cls.id} className="mb-4">
              <div className="d-flex justify-content-between mb-1">
                <div>
                  <strong>{cls.title}</strong>
                  <div className="text-muted small">{cls.subject}</div>
                </div>
                <span className="badge bg-light text-dark">
                  {cls.completed}/{cls.total} Tugas
                </span>
              </div>

              <div className="progress mb-1" style={{ height: 10 }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${cls.percent}%` }}
                />
              </div>

              <small className="text-muted">
                {cls.completed} dari {cls.total} tugas dikerjakan
              </small>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT GRADED */}
      <div className="card shadow-sm">
        <div className="card-header fw-bold">
          <Award size={18} className="me-2 text-success" />
          Riwayat Penilaian Terbaru
        </div>
        <div className="card-body">

          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="d-flex justify-content-between align-items-start border rounded p-3 mb-2 bg-light"
            >
              <div>
                <strong>Tugas Pemrograman</strong>
                <div className="text-muted small">
                  Dinilai pada 12 Juni 2025
                </div>
              </div>
              <div className="text-end">
                <span className="badge bg-secondary">
                  <Lock size={12} className="me-1" />
                  Nilai Tersembunyi
                </span>
                <div className="small text-muted">Portal Orang Tua</div>
              </div>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}
