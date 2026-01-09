import React from 'react';
import { useEffect } from 'react';
import { Upload, Link, FileText, Calendar, Clock, Users, MessageSquare } from 'lucide-react';

const ItemModal = ({ show, type, editingItem, onClose, onSave }) => {
  const fileInputRef = React.useRef(null);
  const isEdit = Boolean(editingItem);
  useEffect(() => {
    // Hanya jalankan logika jika modal dalam keadaan terbuka (show === true)
    if (!show) return;

    if (editingItem) {
      // 1. Logika untuk DATA UMUM
      const baseData = {
        title: editingItem.title || "",
        description: editingItem.description || "",
        file_url: editingItem.file_url || "",
        file_path: editingItem.file_path || "",
        attachmentUrl: editingItem.file_url ? "File terlampir" : "",
      };

      // 2. Logika spesifik berdasarkan TIPE
      if (type === "quizzes") {
        setFormData({
          ...baseData,
          duration: editingItem.duration || "",
          questions: editingItem.questions_count || "",
          startDate: editingItem.start_date ? editingItem.start_date.substring(0, 16) : "",
          endDate: editingItem.end_date ? editingItem.end_date.substring(0, 16) : "",
          passingGrade: editingItem.passing_grade || "",
          attempts: editingItem.attempts_limit || "",
          quizType: editingItem.quiz_type || "",
          randomize: editingItem.randomize || false,
          showResults: editingItem.show_results || false
        });
      } else if (type === "assignments") {
        setFormData({
          ...baseData,
          deadline: editingItem.deadline ? editingItem.deadline.substring(0, 10) : "",
        });
      } else if (type === "materials") {
        setFormData({
          ...baseData,
          // PERBAIKAN: Memastikan 'type' materi sesuai constraint DB ('file', 'video', 'link')
          type: editingItem.type || "file", 
        });
      } else {
        setFormData(baseData);
      }
    } else {
      // 3. Reset form jika mode TAMBAH BARU
      setFormData({ 
        title: "", 
        description: "", 
        deadline: "", 
        file: null,
        duration: "",
        questions: "",
        startDate: "",
        endDate: "",
        passingGrade: "",
        attempts: "",
        quizType: "",
        randomize: false,
        showResults: false,
        attachmentUrl: "",
        // Pastikan saat tambah baru, material type default-nya valid
        type: type === "materials" ? "file" : "" 
      });
    }
  }, [editingItem, show, type]);

  const [formData, setFormData] = React.useState({});

  React.useEffect(() => {
    if (isEdit) {
      setFormData(editingItem);
    } else {
      setFormData({});
    }
  }, [editingItem, show]);

  React.useEffect(() => {
    setFormData(editingItem || {});
  }, [editingItem]);

  if (!show) return null;

  const handleSubmit = async () => {
    const success = await onSave(formData);
    if (success) {
      onClose(); // Tutup modal dulu agar hilang dari layar
    }
  };

  const renderFields = () => {
    switch(type) {
      case "materials":
        return (
          <>
            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">
                <FileText size={16} className="me-2" />
                Judul Materi
              </label>
              <input
                type="text"
                className="form-control border-0 shadow-sm"
                placeholder="Contoh: Pengenalan Aljabar Linear"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))
                }
                style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">Deskripsi Materi</label>
              <textarea
                className="form-control border-0 shadow-sm"
                rows="3"
                placeholder="Jelaskan tentang materi ini..."
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
                style={{ 
                  borderRadius: "12px", 
                  padding: "12px 16px", 
                  background: "#f8f9fa",
                  resize: "none"
                }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">Tipe Materi</label>
              <select
                className="form-select border-0 shadow-sm"
                value={formData.type || ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    type: e.target.value
                  }))
                }
                style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
              >
                <option value="">Pilih Tipe Materi</option>
                <option value="file">📄 PDF Document</option>
                <option value="video">🎥 Video</option>
                <option value="file">📊 PowerPoint</option>
                <option value="file">📝 Dokumen Word</option>
                <option value="link">🔗 Link Eksternal</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">
                <Link size={16} className="me-2" />
                URL / File
              </label>

              <div
                className="input-group shadow-sm"
                style={{ borderRadius: "12px", overflow: "hidden" }}
              >
                {/* INPUT URL / FILE NAME */}
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder={
                    formData.type === "link"
                      ? "https://contoh-link.com"
                      : "Upload file materi"
                  }
                  value={formData.url || ""}
                  readOnly={formData.type !== "link"}   // ✅ KUNCI LOGIC
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      url: e.target.value
                    }))
                  }
                  style={{ background: "#f8f9fa" }}
                />

                {/* INPUT FILE (HIDDEN) */}
                {formData.type !== "link" && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      hidden
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        setFormData(prev => ({
                          ...prev,
                          file,          // FILE ASLI
                          url: file.name // DISPLAY NAMA FILE
                        }));
                      }}
                    />

                    {/* BUTTON UPLOAD */}
                    <button
                      type="button"
                      className="btn btn-outline-secondary border-0"
                      style={{ background: "#e5e7eb" }}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <Upload size={18} />
                    </button>
                  </>
                )}
              </div>

              <small className="text-muted">
                {formData.type === "link"
                  ? "Masukkan link materi (YouTube, Google Drive, dll)"
                  : "Klik upload untuk memilih file materi"}
              </small>
            </div>


            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold mb-2">Kategori</label>
                <select
                  className="form-select border-0 shadow-sm"
                  value={formData.category || ""}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      category: e.target.value
                    }))
                  }
                  style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
                >
                  <option value="">Pilih Kategori</option>
                  <option value="teori">📚 Teori</option>
                  <option value="praktik">🛠️ Praktik</option>
                  <option value="referensi">📖 Referensi</option>
                  <option value="latihan">✍️ Latihan</option>
                </select>
              </div>
              {/* <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold mb-2">Durasi Baca (menit)</label>
                <input
                  type="number"
                  className="form-control border-0 shadow-sm"
                  placeholder="30"
                  value={formData.duration || ""}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      duration: e.target.value
                    }))
                  }
                  style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
                />
              </div> */}
            </div>
          </>
        );
      
      case "assignments":
        return (
          <>
            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">
                <FileText size={16} className="me-2" />
                Judul Tugas
              </label>
              <input
                type="text"
                className="form-control border-0 shadow-sm"
                placeholder="Contoh: Tugas Bab 1 - Persamaan Linear"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))
                }
                style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">Deskripsi Tugas</label>
              <textarea
                className="form-control border-0 shadow-sm"
                rows="4"
                placeholder="Jelaskan instruksi tugas secara detail..."
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
                style={{ 
                  borderRadius: "12px", 
                  padding: "12px 16px", 
                  background: "#f8f9fa",
                  resize: "none"
                }}
              />
            </div>

            <div className="row mb-4">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="form-label fw-semibold mb-2">
                  <Calendar size={16} className="me-2" />
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  className="form-control border-0 shadow-sm"
                  value={formData.startDate || ""}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      startDate: e.target.value
                    }))
                  }
                  style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold mb-2">
                  <Calendar size={16} className="me-2" />
                  Deadline
                </label>
                <input
                  type="date"
                  className="form-control border-0 shadow-sm"
                  value={formData.deadline || ""}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      deadline: e.target.value
                    }))
                  }
                  style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold mb-2">File Lampiran (Opsional)</label>
              <div className="input-group shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Upload file soal atau instruksi"
                  value={formData.attachmentUrl || ""}
                  readOnly
                  style={{ padding: "12px 16px", background: "#f8f9fa" }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    setFormData(prev => ({
                      ...prev,
                      file,
                      attachmentUrl: file.name
                    }));
                  }}
                />
                <button 
                  className="btn btn-outline-secondary border-0"
                  style={{ background: "#e5e7eb" }}
                  onClick={() => fileInputRef.current.click()}
                >
                  <Upload size={18} />
                </button>
              </div>
            </div>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="allowLate"
                checked={formData.allowLate || false}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    allowLate: e.target.checked
                  }))
                }
              />
              <label className="form-check-label" htmlFor="allowLate">
                Izinkan pengumpulan terlambat (dengan pengurangan nilai)
              </label>
            </div>
          </>
        );
      
      case "quizzes":
        return (
          <>
            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">
                <FileText size={16} className="me-2" />
                Judul Kuis
              </label>
              <input
                type="text"
                className="form-control border-0 shadow-sm"
                placeholder="Contoh: Kuis Bab 1 - Dasar Aljabar"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))
                }
                style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">Deskripsi Kuis</label>
              <textarea
                className="form-control border-0 shadow-sm"
                rows="3"
                placeholder="Jelaskan tentang kuis ini..."
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
                style={{ 
                  borderRadius: "12px", 
                  padding: "12px 16px", 
                  background: "#f8f9fa",
                  resize: "none"
                }}
              />
            </div>

            <div className="row mb-4">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="form-label fw-semibold mb-2">
                  <Clock size={16} className="me-2" />
                  Durasi
                </label>
                <input
                  type="text"
                  className="form-control border-0 shadow-sm"
                  placeholder="Contoh: 45 menit"
                  value={formData.duration || ""}
                  onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    duration: e.target.value
                  }))
                }
                  style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold mb-2">Jumlah Soal</label>
                <input
                  type="number"
                  className="form-control border-0 shadow-sm"
                  placeholder="15"
                  value={formData.questions || ""}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      questions: e.target.value
                    }))
                  }
                  style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
                />
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="form-label fw-semibold mb-2">
                  <Calendar size={16} className="me-2" />
                  Tanggal Mulai
                </label>
                <input
                  type="datetime-local"
                  className="form-control border-0 shadow-sm"
                  value={formData.startDate || ""}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      startDate: e.target.value
                    }))
                  }
                  style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold mb-2">Tanggal Selesai</label>
                <input
                  type="datetime-local"
                  className="form-control border-0 shadow-sm"
                  value={formData.endDate || ""}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      endDate: e.target.value
                    }))
                  }
                  style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
                />
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold mb-2">Jumlah Percobaan</label>
                <input
                  type="number"
                  className="form-control border-0 shadow-sm"
                  placeholder="3"
                  min="1"
                  value={formData.attempts || ""}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      attempts: e.target.value
                    }))
                  }
                  style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">
                <Link size={16} className="me-2" />
                Link Kuis
              </label>
              <input
                type="url"
                className="form-control border-0 shadow-sm"
                placeholder="https://contoh.com/kuis"
                value={formData.link || ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    link: e.target.value
                  }))
                }
                style={{ 
                  borderRadius: "12px", 
                  padding: "12px 16px", 
                  background: "#f8f9fa" 
                }}
              />
              <small className="text-muted">
                Isi dengan link kuis platform eksternal (Google Form, dll)
              </small>
            </div>
          </>
        );
      
      case "discussions":
        return (
          <>
            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">
                <MessageSquare size={16} className="me-2" />
                Judul Diskusi
              </label>
              <input
                type="text"
                className="form-control border-0 shadow-sm"
                placeholder="Contoh: Bagaimana cara menyelesaikan soal ini?"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))
                }
                style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">Deskripsi / Pertanyaan</label>
              <textarea
                className="form-control border-0 shadow-sm"
                rows="5"
                placeholder="Tuliskan pertanyaan atau topik diskusi secara detail..."
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
                style={{ 
                  borderRadius: "12px", 
                  padding: "12px 16px", 
                  background: "#f8f9fa",
                  resize: "none"
                }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">Kategori Diskusi</label>
              <select
                className="form-select border-0 shadow-sm"
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    category: e.target.value
                  }))
                }
                style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
              >
                <option value="">Pilih Kategori</option>
                <option value="question">❓ Pertanyaan</option>
                <option value="discussion">💬 Diskusi Umum</option>
                <option value="announcement">📢 Pengumuman</option>
                <option value="help">🆘 Bantuan</option>
                <option value="idea">💡 Ide/Saran</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">Tag (Opsional)</label>
              <input
                type="text"
                className="form-control border-0 shadow-sm"
                placeholder="Contoh: aljabar, matematika, bab1"
                value={formData.tags || ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    tags: e.target.value
                  }))
                }
                style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}
              />
              <small className="text-muted">Pisahkan dengan koma untuk multiple tags</small>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">File Lampiran (Opsional)</label>
              <div className="input-group shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Upload gambar atau file pendukung"
                  value={formData.attachmentUrl || ""}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      attachmentUrl: e.target.value
                    }))
                  }
                  style={{ padding: "12px 16px", background: "#f8f9fa" }}
                />
                <button 
                  className="btn btn-outline-secondary border-0"
                  style={{ background: "#e5e7eb" }}
                >
                  <Upload size={18} />
                </button>
              </div>
            </div>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="allowComments"
                checked={formData.allowComments !== false}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    allowComments: e.target.checked
                  }))
                }
              />
              <label className="form-check-label" htmlFor="allowComments">
                Izinkan komentar dari siswa
              </label>
            </div>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="pinned"
                checked={formData.pinned || false}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    pinned: e.target.checked
                  }))
                }
              />
              <label className="form-check-label" htmlFor="pinned">
                Pin diskusi ini di atas
              </label>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  const getTitle = () => {
    const titles = {
      materials: "Materi",
      assignments: "Tugas",
      quizzes: "Kuis",
      discussions: "Diskusi"
    };
    return editingItem?.id ? `Edit ${titles[type]}` : `Tambah ${titles[type]}`;
  };

  const getIcon = () => {
    const icons = {
      materials: "📚",
      assignments: "📝",
      quizzes: "🎯",
      discussions: "💬"
    };
    return icons[type];
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
            <div 
              className="modal-header border-0 pb-0"
              style={{
                background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px"
              }}
            >
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                <span style={{ fontSize: "1.5rem" }}>{getIcon()}</span>
                {getTitle()}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {renderFields()}
            </div>
            <div className="modal-footer border-0 bg-light">
              <button
                className="btn btn-light shadow-sm"
                onClick={onClose}
                style={{ 
                  borderRadius: "12px", 
                  padding: "10px 24px",
                  fontWeight: "500"
                }}
              >
                Batal
              </button>
              <button
                className="btn btn-primary shadow-sm"
                onClick={handleSubmit}
                disabled={!formData.title}
                style={{
                  background: !formData.title ? "#9ca3af" : "linear-gradient(135deg, #2563eb, #16a34a)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  cursor: !formData.title ? "not-allowed" : "pointer"
                }}
              >
                {editingItem?.id ? "💾 Update" : "✅ Tambah"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} style={{ zIndex: 1040 }} />
    </>
  );
};

export default ItemModal;