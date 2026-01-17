import React from "react";
import { UploadCloud, Clock, FileText, CloudUpload, Send, X } from "lucide-react";

export default function AssignmentModal({ 
  show, 
  assignment, 
  onClose, 
  submissionFile, 
  setSubmissionFile, 
  submissionText, 
  setSubmissionText, 
  isSubmitting, 
  onSubmit 
}) {
  if (!show || !assignment) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      alert("❌ Ukuran file terlalu besar. Maksimal 10MB");
      return;
    }
    setSubmissionFile(file);
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
            
            {/* Header */}
            <div className="modal-header border-0 p-4 pb-0">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded-3" style={{ color: "#2563eb" }}>
                  <UploadCloud size={28} />
                </div>
                <div>
                  <h5 className="modal-title fw-bold mb-0">Kumpulkan Tugas</h5>
                  <p className="text-muted small mb-0">Pastikan file sudah sesuai sebelum dikirim</p>
                </div>
              </div>
              <button className="btn-close shadow-none" onClick={onClose} />
            </div>

            <div className="modal-body p-4">
              {/* Detail Tugas */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark mb-2">Detail Tugas</label>
                <div className="p-3 border shadow-sm" style={{ background: "#ffffff", borderRadius: "12px" }}>
                  <h6 className="fw-bold mb-1">{assignment.title}</h6>
                  <div className="d-flex align-items-center gap-3 mt-2">
                    <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill small d-flex align-items-center gap-1">
                      <Clock size={14} /> Deadline: {assignment.dueDate || new Date(assignment.deadline).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Input Catatan */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark mb-2">Catatan <span className="text-muted fw-normal small">(opsional)</span></label>
                <textarea
                  className="form-control border shadow-sm"
                  rows="3"
                  placeholder="Tambahkan pesan untuk guru..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  style={{ borderRadius: "12px", background: "#fdfdfd", resize: "none" }}
                />
              </div>

              {/* Dropzone Upload */}
              <div className="mb-2">
                <label className="form-label fw-bold text-dark mb-2">Lampiran File</label>
                <div className="border-2 border-dashed rounded-4 p-5 text-center position-relative"
                  style={{ borderColor: submissionFile ? "#10b981" : "#e2e8f0", background: submissionFile ? "#f0fdf4" : "#f8fafc" }}>
                  {submissionFile ? (
                    <div>
                      <FileText size={40} className="text-success mb-2" />
                      <h6 className="fw-bold text-dark mb-1">{submissionFile.name}</h6>
                      <button className="btn btn-link text-danger text-decoration-none small" onClick={() => setSubmissionFile(null)}>Ganti File</button>
                    </div>
                  ) : (
                    <div>
                      <CloudUpload size={40} className="text-primary mb-2" />
                      <p className="mb-1 fw-bold text-dark">Pilih file tugas Anda</p>
                      <label className="btn btn-outline-primary px-4 fw-semibold shadow-sm" style={{ borderRadius: "10px", cursor: "pointer" }}>
                        Pilih File
                        <input type="file" className="d-none" onChange={handleFileChange} />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 p-4 pt-0">
              <button className="btn btn-light px-4 py-2 me-2" onClick={onClose} disabled={isSubmitting} style={{ borderRadius: "10px" }}>Batal</button>
              <button className="btn btn-primary px-4 py-2 fw-bold d-flex align-items-center gap-2" 
                onClick={onSubmit} disabled={!submissionFile || isSubmitting}
                style={{ background: "linear-gradient(135deg, #2563eb, #16a34a)", border: "none", borderRadius: "10px" }}>
                {isSubmitting ? "Mengirim..." : <><Send size={18} /> Kumpulkan Sekarang</>}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={onClose}></div>
    </>
  );
}