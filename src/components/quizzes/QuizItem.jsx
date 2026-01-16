import React, { useState } from 'react';
import { Trash2, Edit, Eye, Clock, FileText, Award } from "lucide-react";
import GradingView from '../grading/GradingView';

const QuizItem = ({ quiz, onEdit, onDelete, onManageGrades }) => {

  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Fungsi untuk membuka link kuis
  const handleViewQuiz = () => {
    if (!quiz.link) {
      alert("Link kuis tidak tersedia");
      return;
    }
    // Memastikan link diawali dengan http/https
    const url = quiz.link.startsWith("http") ? quiz.link : `https://${quiz.link}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div 
      className="list-group-item border-0 mb-3 shadow-sm" 
      style={{ borderRadius: "12px" }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div className="flex-grow-1">
          <h6 className="mb-1 fw-semibold">{quiz.title}</h6>
          {quiz.description && (
            <p className="text-muted small mb-0 mt-2" style={{ fontSize: "0.85rem" }}>
              {quiz.description.length > 80 
                ? `${quiz.description.substring(0, 80)}...` 
                : quiz.description}
            </p>
          )}
          <div className="d-flex gap-3 align-items-center mt-1">
            <small className="text-muted d-flex align-items-center gap-1">
              <Clock size={14} /> {quiz.duration || "Tidak ada durasi"}
            </small>
            <small className="text-muted d-flex align-items-center gap-1">
              <FileText size={14} /> {quiz.questions_count || quiz.questions || 0} Soal
            </small>
          </div>
        </div>

        <div className="d-flex gap-2 ms-3">
          {/* Tombol Kelola Nilai */}
          <button
            className="btn btn-success btn-sm d-flex align-items-center gap-1"
            onClick={() => onManageGrades(quiz)}
            style={{ borderRadius: "8px" }}
            title="Kelola Nilai & Lihat Submission"
          >
            <Award size={16} />
            <span className="d-none d-md-inline">Kelola Nilai</span>
          </button>

          {selectedQuiz && (
            <GradingView 
              assignment={selectedQuiz} 
              type="quiz" // PAKSA DISINI
              onBack={() => setSelectedQuiz(null)} 
            />
          )}

          {/* TOMBOL LIHAT KUIS */}
          <button
            className="btn btn-outline-success btn-sm"
            onClick={handleViewQuiz}
            style={{ borderRadius: "8px" }}
            title="Buka Link Kuis"
          >
            <Eye size={16} />
          </button>

          {/* TOMBOL EDIT */}
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onEdit(quiz)}
            style={{ borderRadius: "8px" }}
            title="Edit Kuis"
          >
            <Edit size={16} />
          </button>

          {/* TOMBOL HAPUS */}
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => onDelete(quiz.id)}
            style={{ borderRadius: "8px" }}
            title="Hapus Kuis"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizItem;