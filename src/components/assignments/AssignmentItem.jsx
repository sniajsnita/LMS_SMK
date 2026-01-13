import React from 'react';
import { 
  Trash2, 
  Edit, 
  Award, 
  Eye, 
  Download, 
  PlayCircle, 
  Link2, 
  FileText 
} from "lucide-react";

const AssignmentItem = ({ assignment, onEdit, onDelete, onManageGrades }) => {
  const { fileType, fileUrl } = assignment;

  return (
    <div 
      className="list-group-item border-0 mb-3 shadow-sm"
      style={{ borderRadius: "14px" }}
    >
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div className="flex-grow-1">
          <h6 className="mb-1 fw-semibold">{assignment.title}</h6>
          <small className="text-muted d-block mb-1">
            Deadline: {assignment.deadline} • Submitted: {assignment.submitted || 0}/{assignment.total || 0}
          </small>

          {assignment.description && (
            <p className="text-muted small mb-2" style={{ fontSize: "0.85rem" }}>
              {assignment.description.length > 100
                ? `${assignment.description.substring(0, 100)}...`
                : assignment.description}
            </p>
          )}

          {/* ================== CONTOH TAMPILAN FILE (STATIS) ================== */}
          <div className="p-3 bg-light rounded mb-2">
            <div className="fw-semibold mb-2 small text-muted">
              📎 File yang Di-upload
            </div>

            {/* FILE PDF */}
            <div className="d-flex align-items-center justify-content-between border rounded p-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                <FileText className="text-danger" size={20} />
                <span className="small">Laporan_Akhir.pdf</span>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary">
                  <Eye size={14} /> Lihat
                </button>
              </div>
            </div>

            {/* FILE VIDEO */}
            {/* <div className="d-flex align-items-center justify-content-between border rounded p-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                <PlayCircle className="text-primary" size={20} />
                <span className="small">Presentasi_Video.mp4</span>
              </div>
              <button className="btn btn-sm btn-outline-primary">
                ▶ Preview Video
              </button>
            </div> */}

            {/* FILE LINK */}
            {/* <div className="d-flex align-items-center justify-content-between border rounded p-2">
              <div className="d-flex align-items-center gap-2">
                <Link2 className="text-success" size={20} />
                <span className="small">Google Drive Link</span>
              </div>
              <button className="btn btn-sm btn-outline-success">
                🔗 Buka Link
              </button>
            </div> */}
          </div>
          {/* ================================================================ */}
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
