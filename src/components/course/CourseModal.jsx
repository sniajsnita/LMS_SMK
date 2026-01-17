import React from "react"; // Pastikan React diimport
import { Upload } from "lucide-react";
import { supabase } from "../../lib/supabase"; // Import supabase untuk upload

const CourseModal = ({ show, editingCourse, formData, setFormData, onClose, onSubmit }) => {
  if (!show) return null;

  // --- FUNGSI BARU UNTUK UPLOAD ---
  const handleInternalSubmit = async () => {
    try {
      let finalImageUrl = formData.cover_image;

      // Jika ada file gambar baru yang dipilih
      if (formData.imageFile) {
        const file = formData.imageFile;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        // SESUAIKAN DI SINI: Nama folder 'cover/' ditambahkan sebelum nama file
        const filePath = `cover/${fileName}`; 

        // 1. Upload ke Bucket 'lms-files'
        const { error: uploadError } = await supabase.storage
          .from('lms-files') // Nama bucket kamu
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Ambil URL Publik
        const { data } = supabase.storage
          .from('lms-files')
          .getPublicUrl(filePath);

        finalImageUrl = data.publicUrl;
      }

      // Gabungkan data dan kirim ke onSubmit
      const cleanedData = { ...formData };
      delete cleanedData.imageFile; 
      cleanedData.cover_image = finalImageUrl;
      
      onSubmit(cleanedData); 
    } catch (error) {
      console.error("Upload detail:", error);
      alert("Gagal mengunggah gambar: " + error.message);
    }
  };

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
              </div>

              {/* Cover Image */}
              <div className="mb-4">
                <label className="form-label fw-semibold mb-2">
                  Gambar Cover (Opsional)
                </label>

                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control border-0 shadow-sm flex-grow-1"
                    placeholder="URL gambar atau upload"
                    value={formData.cover_image}
                    onChange={(e) =>
                      setFormData({ ...formData, cover_image: e.target.value })
                    }
                    style={{
                      borderRadius: "12px",
                      padding: "12px 16px",
                      background: "#f8f9fa",
                    }}
                  />

                  <label
                    className="btn btn-outline-secondary"
                    style={{
                      borderRadius: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <Upload size={18} />

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        // Gunakan Blob URL HANYA untuk preview visual saja
                        const previewUrl = URL.createObjectURL(file);
                        
                        // ✅ PERBAIKAN: Simpan preview untuk tampilan, dan file asli untuk diupload
                        setFormData({ 
                          ...formData, 
                          cover_image: previewUrl,
                          imageFile: file 
                        });
                      }}
                    />
                  </label>
                </div>

                {/* Preview */}
                {formData.cover_image && (
                  <div className="mt-3">
                    <img
                      src={formData.cover_image}
                      alt="Preview"
                      className="w-100 rounded-3"
                      style={{
                        height: "150px",
                        objectFit: "cover",
                      }}
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
                onClick={handleInternalSubmit} // ✅ Menggunakan fungsi upload baru
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

      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      />
    </>
  );
};

export default CourseModal;