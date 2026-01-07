import React from 'react';
import { Trash2, Edit, Award } from "lucide-react";

const AssignmentItem = ({ assignment, onEdit, onDelete, onManageGrades }) => {
  return (
    <div 
      className="list-group-item border-0 mb-2 shadow-sm"
      style={{ borderRadius: "12px" }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div className="flex-grow-1">
          <h6 className="mb-1 fw-semibold">{assignment.title}</h6>
          <small className="text-muted">
            Deadline: {assignment.deadline} • Submitted: {assignment.submitted || 0}/{assignment.total || 0}
          </small>
          {assignment.description && (
            <p className="text-muted small mb-0 mt-1" style={{ fontSize: "0.85rem" }}>
              {assignment.description.length > 100 
                ? `${assignment.description.substring(0, 100)}...` 
                : assignment.description
              }
            </p>
          )}
        </div>
        <div className="d-flex gap-2 ms-3">
          {/* Tombol Kelola Nilai */}
          <button
            className="btn btn-success btn-sm d-flex align-items-center gap-1"
            onClick={() => onManageGrades(assignment)}
            style={{ borderRadius: "8px" }}
            title="Kelola Nilai & Lihat Submission"
          >
            <Award size={16} />
            <span className="d-none d-md-inline">Kelola Nilai</span>
          </button>

          {/* Tombol Edit */}
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onEdit(assignment)}
            style={{ borderRadius: "8px" }}
            title="Edit Tugas"
          >
            <Edit size={16} />
          </button>

          {/* Tombol Delete */}
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => onDelete(assignment.id)}
            style={{ borderRadius: "8px" }}
            title="Hapus Tugas"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Progress Bar - Visual indicator submission */}
      {assignment.total > 0 && (
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-muted">Progress Pengumpulan</small>
            <small className="fw-semibold">
              {Math.round(((assignment.submitted || 0) / assignment.total) * 100)}%
            </small>
          </div>
          <div 
            className="progress" 
            style={{ height: "8px", borderRadius: "10px" }}
          >
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${((assignment.submitted || 0) / assignment.total) * 100}%`,
                background: assignment.submitted === assignment.total 
                  ? "linear-gradient(135deg, #16a34a, #22c55e)" 
                  : "linear-gradient(135deg, #2563eb, #3b82f6)",
                borderRadius: "10px"
              }}
              aria-valuenow={((assignment.submitted || 0) / assignment.total) * 100}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentItem;