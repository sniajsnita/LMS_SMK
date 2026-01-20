import React from 'react';
import { 
  Trash2, 
  Edit, 
  Award, 
  Eye, 
  Download, 
  PlayCircle, 
  Link2, 
  FileText,
  Clock 
} from "lucide-react";

const AssignmentItem = ({ assignment, onEdit, onDelete, onManageGrades }) => {
  const { fileType, fileUrl } = assignment;

  const handleFileAction = (url) => {
    if (!url) return alert("Link file tidak tersedia");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div 
      className="list-group-item border-0 mb-3 shadow-sm"
      style={{ borderRadius: "14px" }}
    >
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div className="flex-grow-1">
          <h6 className="mb-2 fw-bold text-dark" style={{ letterSpacing: '-0.3px' }}>
            {assignment.title}
          </h6>
          
          <div className="d-flex flex-wrap gap-3 mb-3">
            {/* Tanggal yang sudah dipercantik */}
            <div className="d-flex align-items-center gap-1 text-muted small">
              <Clock size={14} className="text-danger" />
              <span>
                {assignment.deadline 
                  ? new Date(assignment.deadline).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                  : "-"}
              </span>
            </div>

            {/* Indikator Pengumpulan */}
            <div className="d-flex align-items-center gap-1 small">
              <div className={`badge ${assignment.submitted > 0 ? 'bg-success-subtle text-success' : 'bg-light text-muted'} border-0`}>
                {assignment.submitted || 0} / {assignment.total || 0} Terkumpul
              </div>
            </div>
          </div>

          {assignment.description && (
            <p className="text-secondary mb-0" style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>
              {assignment.description.length > 100
                ? `${assignment.description.substring(0, 100)}...`
                : assignment.description}
            </p>
          )}
        </div>

        {/* ACTION BUTTON */}
        <div className="d-flex gap-2 ms-3">
          <button
            className="btn btn-success btn-sm d-flex align-items-center gap-1"
            onClick={() => onManageGrades(assignment)}
            style={{ borderRadius: "8px" }}
          >
            <Award size={16} />
            <span className="d-none d-md-inline">Kelola Nilai</span>
          </button>

          <button
            className="btn btn-outline-success btn-sm"
            onClick={() => handleFileAction(assignment.file_url || assignment.url)}
            style={{ borderRadius: "8px" }}
            title="Lihat"
          >
            <Eye size={16} />
          </button>

          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onEdit(assignment)}
            style={{ borderRadius: "8px" }}
          >
            <Edit size={16} />
          </button>

          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => onDelete(assignment.id)}
            style={{ borderRadius: "8px" }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* PROGRESS BAR */}
      {assignment.total > 0 && (
        <div className="mt-3">
          <div className="d-flex justify-content-between mb-1">
            <small className="text-muted">Progress Pengumpulan</small>
            <small className="fw-semibold">
              {Math.round(((assignment.submitted || 0) / assignment.total) * 100)}%
            </small>
          </div>
          <div className="progress" style={{ height: "8px", borderRadius: "10px" }}>
            <div
              className="progress-bar"
              style={{
                width: `${((assignment.submitted || 0) / assignment.total) * 100}%`,
                background:
                  assignment.submitted === assignment.total
                    ? "linear-gradient(135deg, #16a34a, #22c55e)"
                    : "linear-gradient(135deg, #2563eb, #3b82f6)",
                borderRadius: "10px"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentItem;
