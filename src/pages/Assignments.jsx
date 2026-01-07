import React from "react";
import { Calendar, BookOpen, Award, CheckCircle, Clock } from "lucide-react";

export default function Assignments() {
  const assignments = [
    {
      id: 1,
      title: "Tugas Algoritma Dasar",
      course: "Pemrograman Dasar",
      description: "Buat flowchart dan pseudocode.",
      dueDate: "20 Desember 2025",
      maxScore: 100,
      status: "pending",
    },
    {
      id: 2,
      title: "Desain UI Login",
      course: "UI/UX Design",
      description: "Buat desain halaman login dan registrasi.",
      dueDate: "15 Desember 2025",
      maxScore: 90,
      status: "submitted",
    },
    {
      id: 3,
      title: "Laporan Basis Data",
      course: "Database",
      description: "Normalisasi tabel hingga 3NF.",
      dueDate: "10 Desember 2025",
      maxScore: 100,
      status: "graded",
    },
  ];

  const renderBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge bg-warning text-dark">Belum Dikerjakan</span>;
      case "submitted":
        return <span className="badge bg-info">Menunggu Penilaian</span>;
      case "graded":
        return <span className="badge bg-success">Sudah Dinilai</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold">📚 Tugas Saya</h2>
        <p className="text-muted">Daftar tugas dari semua mata pelajaran</p>
      </div>

      <div className="row g-3">
        {assignments.map((item) => (
          <div key={item.id} className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="fw-bold mb-1">{item.title}</h5>
                    <span className="badge bg-light text-dark">
                      <BookOpen size={14} className="me-1" />
                      {item.course}
                    </span>
                  </div>
                  {renderBadge(item.status)}
                </div>

                <p className="text-muted small mb-3">{item.description}</p>

                <div className="d-flex flex-wrap gap-4 small text-muted">
                  <div>
                    <Calendar size={14} className="me-1" />
                    Deadline: {item.dueDate}
                  </div>
                  <div>
                    <Award size={14} className="me-1" />
                    Max: {item.maxScore} poin
                  </div>
                </div>

                <div className="mt-3">
                  {item.status === "pending" && (
                    <button className="btn btn-primary btn-sm">
                      <Clock size={14} className="me-1" />
                      Kerjakan Tugas
                    </button>
                  )}

                  {item.status === "submitted" && (
                    <span className="text-info small">
                      <CheckCircle size={14} className="me-1" />
                      Tugas sudah dikumpulkan
                    </span>
                  )}

                  {item.status === "graded" && (
                    <span className="text-success small">
                      <Award size={14} className="me-1" />
                      Tugas sudah dinilai
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
