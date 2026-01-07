
import { Upload } from "lucide-react";

const CourseModal = ({ show, editingCourse, formData, setFormData, onClose, onSubmit }) => {
  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div 
            className="modal-content border-0 shadow-lg"
            style={{ borderRadius: "16px" }}
          >
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">
                {editingCourse ? "Edit Kelas" : "Buat Kelas Baru"}
              </h5>
              <button
                className="btn-close"
                onClick={onClose}
              />
            </div>

            <div className="modal-body p-4">
              {/* Title */}
              <div className="mb-4">
                <label className="form-label fw-semibold mb-2">Judul Kelas</label>
                <input
                  type="text"
                  className="form-control border-0 shadow-sm"
                  placeholder="Contoh: Matematika Kelas 10"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    borderRadius: "12px",
                    padding: "12px 16px",
                    background: "#f8f9fa"
                  }}
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="form-label fw-semibold mb-2">Deskripsi</label>
                <textarea
                  className="form-control border-0 shadow-sm"
                  rows="4"
                  placeholder="Deskripsi singkat tentang kelas ini..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    borderRadius: "12px",
                    padding: "12px 16px",
                    background: "#f8f9fa",
                    resize: "none"
                  }}
                />
              </div>

              {/* Subject */}
              <div className="mb-4">
                <label className="form-label fw-semibold mb-2">Mata Pelajaran</label>
                <input
                  type="text"
                  className="form-control border-0 shadow-sm"
                  placeholder="Contoh: Matematika, Fisika, Bahasa Indonesia"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{
                    borderRadius: "12px",
                    padding: "12px 16px",
                    background: "#f8f9fa"
                  }}
                />
                <small className="text-muted">
                  Anda dapat mengisi mata pelajaran dengan nama bebas
                </small>
              </div>

              {/* Cover Image */}
              <div className="mb-4">
                <label className="form-label fw-semibold mb-2">Gambar Cover (Opsional)</label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control border-0 shadow-sm flex-grow-1"
                    placeholder="URL gambar atau upload"
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    style={{
                      borderRadius: "12px",
                      padding: "12px 16px",
                      background: "#f8f9fa"
                    }}
                  />
                  <button 
                    className="btn btn-outline-secondary"
                    style={{ borderRadius: "12px" }}
                  >
                    <Upload size={18} />
                  </button>
                </div>
                {formData.cover_image && (
                  <div className="mt-3">
                    <img 
                      src={formData.cover_image} 
                      alt="Preview" 
                      className="w-100 rounded-3"
                      style={{ height: "150px", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button
                className="btn btn-light shadow-sm"
                onClick={onClose}
                style={{
                  borderRadius: "12px",
                  padding: "10px 24px",
                  border: "none"
                }}
              >
                Batal
              </button>
              <button 
                className="btn btn-primary shadow-sm"
                onClick={onSubmit}
                disabled={!formData.title || !formData.subject}
                style={{
                  background: !formData.title || !formData.subject 
                    ? "#9ca3af" 
                    : "linear-gradient(135deg, #2563eb, #16a34a)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "10px 24px",
                  cursor: !formData.title || !formData.subject ? "not-allowed" : "pointer"
                }}
              >
                {editingCourse ? "Update Kelas" : "Buat Kelas"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BACKDROP */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      />
    </>
  );
};

export default CourseModal;