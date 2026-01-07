import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FileText,
  MessageSquare,
  Award,
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Download,
  Play,
  Plus,
  Upload,
  X,
  Trash2,
} from "lucide-react";

export default function CourseDetail() {
  const [activeTab, setActiveTab] = useState("materials");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);

  // DATA DUMMY
  const course = {
    title: "Pemrograman Web",
    subject: "RPL",
    description:
      "Mempelajari dasar HTML, CSS, dan JavaScript untuk pengembangan web modern dan responsif.",
    teacher: "Bu Aisyah Rahman",
    students: 28,
    coverImage: null,
  };

  const materials = [
    { id: 1, title: "Pengenalan HTML", type: "video", duration: "45 menit", completed: true },
    { id: 2, title: "Styling dengan CSS", type: "video", duration: "60 menit", completed: true },
    { id: 3, title: "JavaScript Dasar", type: "pdf", size: "2.5 MB", completed: false },
    { id: 4, title: "DOM Manipulation", type: "video", duration: "50 menit", completed: false },
  ];

  const assignments = [
    { id: 1, title: "Membuat Portfolio Website", dueDate: "2025-12-25", status: "submitted", score: 85 },
    { id: 2, title: "CSS Grid Layout", dueDate: "2025-12-28", status: "pending", score: null },
    { id: 3, title: "JavaScript Calculator", dueDate: "2025-12-30", status: "pending", score: null },
  ];

  const quizzes = [
    { id: 1, title: "Quiz HTML Fundamentals", questions: 20, duration: "30 menit", status: "completed", score: 90 },
    { id: 2, title: "Quiz CSS Basics", questions: 15, duration: "20 menit", status: "available", score: null },
    { id: 3, title: "Quiz JavaScript", questions: 25, duration: "40 menit", status: "locked", score: null },
  ];

  const discussions = [
    { id: 1, author: "Budi Santoso", topic: "Bagaimana cara menggunakan Flexbox?", replies: 5, time: "2 jam lalu" },
    { id: 2, author: "Siti Nurhaliza", topic: "Error saat menjalankan JavaScript", replies: 3, time: "5 jam lalu" },
    { id: 3, author: "Ahmad Fauzi", topic: "Tips membuat website responsif", replies: 8, time: "1 hari lalu" },
  ];

  const members = [
    { id: 1, name: "Bu Aisyah Rahman", role: "Guru", avatar: null },
    { id: 2, name: "Budi Santoso", role: "Siswa", avatar: null },
    { id: 3, name: "Siti Nurhaliza", role: "Siswa", avatar: null },
    { id: 4, name: "Ahmad Fauzi", role: "Siswa", avatar: null },
  ];

  const handleOpenSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
    setSubmissionText("");
    setSubmissionFile(null);
  };

  const handleCloseSubmitModal = () => {
    setShowSubmitModal(false);
    setSelectedAssignment(null);
    setSubmissionText("");
    setSubmissionFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("❌ Ukuran file terlalu besar. Maksimal 10MB");
        return;
      }
      setSubmissionFile(file);
    }
  };

  const handleSubmitAssignment = () => {
    if (!submissionText && !submissionFile) {
      alert("❌ Mohon isi catatan atau upload file terlebih dahulu");
      return;
    }
    
    alert("✅ Tugas berhasil dikumpulkan!");
    handleCloseSubmitModal();
  };

  // Discussions
  const [replyContent, setReplyContent] = useState({});
  const [likes, setLikes] = useState({});

  const handleLikeDiscussion = (id) => {
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleReplyDiscussion = (id) => {
    const reply = replyContent[id];
    if (!reply || !reply.trim()) return;

    alert(`Komentar dikirim: ${reply}`);
    setReplyContent({ ...replyContent, [id]: "" });
  };

  const handleAddItem = (type) => {
    alert(`➕ Tambah ${type} (fitur belum dihubungkan ke backend)`);
  };

  const handleDeleteItem = (type, id) => {
    if (window.confirm("Yakin ingin menghapus item ini?")) {
      alert(`🗑️ ${type} dengan ID ${id} dihapus (dummy action)`);
    }
  };


  

  return (
    <div className="pb-5">

      {/* HEADER */}
      <div
        className="position-relative text-white overflow-hidden"
        style={{
          height: "300px",
          background: "linear-gradient(135deg, #2563eb, #16a34a)",
        }}
      >
        {/* Decorative circles */}
        <div 
          className="position-absolute rounded-circle"
          style={{
            width: "400px",
            height: "400px",
            background: "rgba(255, 255, 255, 0.1)",
            top: "-150px",
            right: "-150px",
          }}
        />
        <div 
          className="position-absolute rounded-circle"
          style={{
            width: "300px",
            height: "300px",
            background: "rgba(255, 255, 255, 0.05)",
            bottom: "-100px",
            left: "-100px",
          }}
        />

        <div className="container h-100 d-flex flex-column justify-content-end pb-4 position-relative" style={{ zIndex: 2 }}>

          <Link 
            to="/course" 
            className="btn btn-sm btn-light mb-3 shadow-sm"
            style={{
              width: "fit-content",
              borderRadius: "8px",
              padding: "8px 16px",
              fontWeight: "500"
            }}
          >
            <ArrowLeft size={16} className="me-2" />
            Kembali
          </Link>

          <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
            <span 
              className="badge"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "0.875rem"
              }}
            >
              {course.subject}
            </span>
            <span className="d-flex align-items-center gap-2 small">
              <Users size={16} />
              {course.teacher}
            </span>
            <span className="d-flex align-items-center gap-2 small">
              <Users size={16} />
              {course.students} siswa
            </span>
          </div>

          <h1 className="fw-bold display-5 mb-2">{course.title}</h1>
          <p className="mb-0 fs-5" style={{ opacity: 0.9 }}>
            {course.description}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mt-4">

        {/* TABS */}
        <div 
          className="bg-white rounded-4 shadow-sm p-2 mb-4"
          style={{ display: "inline-flex", gap: "4px" }}
        >
          {[
            { key: "materials", icon: BookOpen, label: "Materi" },
            { key: "assignments", icon: FileText, label: "Tugas" },
            { key: "quizzes", icon: Award, label: "Kuis" },
            { key: "discussions", icon: MessageSquare, label: "Diskusi" },
            { key: "members", icon: Users, label: "Anggota" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`btn d-flex align-items-center gap-2 ${
                activeTab === tab.key ? "btn-primary" : "btn-light border-0"
              }`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                borderRadius: "12px",
                padding: "10px 20px",
                fontWeight: "500",
                background: activeTab === tab.key 
                  ? "linear-gradient(135deg, #2563eb, #16a34a)" 
                  : "transparent",
                color: activeTab === tab.key ? "white" : "#6b7280",
                transition: "all 0.2s ease"
              }}
            >
              <tab.icon size={18} />
              <span className="d-none d-sm-inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="card shadow-sm border-0" style={{ borderRadius: "16px" }}>
          <div className="card-body p-4">

            {/* MATERIALS TAB */}
            {activeTab === "materials" && (
              <div>
                <h5 className="fw-bold mb-4">📘 Materi Pembelajaran</h5>
                <div className="d-flex flex-column gap-3">
                  {materials.map((material) => (
                    <div 
                      key={material.id}
                      className="card border shadow-sm"
                      style={{
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                        borderColor: material.completed ? "#16a34a" : "#e5e7eb"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateX(8px)";
                        e.currentTarget.style.boxShadow = "0 10px 30px rgba(37, 99, 235, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.boxShadow = "";
                      }}
                    >
                      <div className="card-body p-3 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div 
                            className="d-flex align-items-center justify-content-center rounded-circle"
                            style={{
                              width: "48px",
                              height: "48px",
                              background: material.completed ? "#dcfce7" : "#dbeafe"
                            }}
                          >
                            {material.type === "video" ? (
                              <Play size={24} style={{ color: material.completed ? "#16a34a" : "#2563eb" }} />
                            ) : (
                              <FileText size={24} style={{ color: material.completed ? "#16a34a" : "#2563eb" }} />
                            )}
                          </div>
                          <div>
                            <h6 className="mb-1 fw-semibold">{material.title}</h6>
                            <div className="d-flex align-items-center gap-3 small text-muted">
                              <span className="d-flex align-items-center gap-1">
                                {material.type === "video" ? (
                                  <>
                                    <Clock size={14} />
                                    {material.duration}
                                  </>
                                ) : (
                                  <>
                                    <Download size={14} />
                                    {material.size}
                                  </>
                                )}
                              </span>
                              {material.completed && (
                                <span className="badge bg-success-subtle text-success">
                                  <CheckCircle size={12} className="me-1" />
                                  Selesai
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button 
                          className="btn btn-sm btn-primary"
                          style={{ borderRadius: "8px" }}
                        >
                          {material.type === "video" ? "Tonton" : "Unduh"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ASSIGNMENTS TAB */}
            {activeTab === "assignments" && (
              <div>
                <h5 className="fw-bold mb-4">📝 Daftar Tugas</h5>
                <div className="d-flex flex-column gap-3">
                  {assignments.map((assignment) => (
                    <div 
                      key={assignment.id}
                      className="card border shadow-sm"
                      style={{
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                        borderColor: assignment.status === "submitted" ? "#16a34a" : "#e5e7eb"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateX(8px)";
                        e.currentTarget.style.boxShadow = "0 10px 30px rgba(37, 99, 235, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.boxShadow = "";
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h6 className="fw-bold mb-2">{assignment.title}</h6>
                            <div className="d-flex align-items-center gap-3 small text-muted">
                              <span className="d-flex align-items-center gap-1">
                                <Calendar size={14} />
                                Deadline: {assignment.dueDate}
                              </span>
                            </div>
                          </div>
                          {assignment.status === "submitted" && assignment.score && (
                            <div className="text-end">
                              <div className="fw-bold" style={{ fontSize: "1.5rem", color: "#16a34a" }}>
                                {assignment.score}
                              </div>
                              <small className="text-muted">Nilai</small>
                            </div>
                          )}
                        </div>
                        <div className="d-flex gap-2">
                          {assignment.status === "submitted" ? (
                            <span className="badge bg-success-subtle text-success px-3 py-2">
                              <CheckCircle size={14} className="me-1" />
                              Sudah Dikumpulkan
                            </span>
                          ) : (
                            <button 
                              className="btn btn-primary btn-sm"
                              style={{ borderRadius: "8px" }}
                              onClick={() => handleOpenSubmitModal(assignment)}
                            >
                              Kerjakan Tugas
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUIZZES TAB */}
            {activeTab === "quizzes" && (
              <div>
                <h5 className="fw-bold mb-4">🏆 Daftar Kuis</h5>
                <div className="d-flex flex-column gap-3">
                  {quizzes.map((quiz) => (
                    <div 
                      key={quiz.id}
                      className="card border shadow-sm"
                      style={{
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                        opacity: quiz.status === "locked" ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (quiz.status !== "locked") {
                          e.currentTarget.style.transform = "translateX(8px)";
                          e.currentTarget.style.boxShadow = "0 10px 30px rgba(37, 99, 235, 0.15)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.boxShadow = "";
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-2">{quiz.title}</h6>
                            <div className="d-flex align-items-center gap-3 small text-muted mb-3">
                              <span>{quiz.questions} soal</span>
                              <span>•</span>
                              <span className="d-flex align-items-center gap-1">
                                <Clock size={14} />
                                {quiz.duration}
                              </span>
                            </div>
                            {quiz.status === "completed" ? (
                              <span className="badge bg-success-subtle text-success px-3 py-2">
                                <CheckCircle size={14} className="me-1" />
                                Selesai - Nilai: {quiz.score}
                              </span>
                            ) : quiz.status === "available" ? (
                              <button 
                                className="btn btn-primary btn-sm"
                                style={{ borderRadius: "8px" }}
                              >
                                Mulai Kuis
                              </button>
                            ) : (
                              <span className="badge bg-secondary px-3 py-2">
                                🔒 Terkunci
                              </span>
                            )}
                          </div>
                          {quiz.status === "completed" && quiz.score && (
                            <div className="text-end ms-3">
                              <div className="fw-bold" style={{ fontSize: "1.5rem", color: "#16a34a" }}>
                                {quiz.score}
                              </div>
                              <small className="text-muted">Nilai</small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DISCUSSIONS TAB */}
            {activeTab === "discussions" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">💬 Forum Diskusi</h5>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: "8px" }}
                  >
                    <Plus size={16} className="me-1" />
                    Buat Diskusi
                  </button>
                </div>

                {discussions.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <MessageSquare size={48} className="mb-3" style={{ opacity: 0.5 }} />
                    <p>Belum ada diskusi</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-4">
                    {discussions.map((discussion) => (
                      <div
                        key={discussion.id}
                        className="card border-0 shadow-sm"
                        style={{
                          borderRadius: "16px",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start gap-3">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                              style={{
                                width: "48px",
                                height: "48px",
                                background: "linear-gradient(135deg, #2563eb, #16a34a)",
                              }}
                            >
                              {discussion.author.charAt(0)}
                            </div>

                            <div className="flex-grow-1">
                              <div className="d-flex gap-2 mb-2">
                                <span className="fw-semibold">{discussion.author}</span>
                                <span className="text-muted small">{discussion.date}</span>
                              </div>

                              <h6 className="fw-bold mb-2">{discussion.title}</h6>

                              {/* ACTIONS */}
                              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                <div className="d-flex gap-3 align-items-center text-muted small">
                                  <button
                                    className="btn btn-light btn-sm"
                                    onClick={() => handleLikeDiscussion(discussion.id)}
                                    style={{ borderRadius: "8px" }}
                                  >
                                    ❤️ {likes[discussion.id] || 0}
                                  </button>

                                  <span className="d-flex align-items-center gap-2">
                                    <MessageSquare size={16} />
                                    {discussion.replies} balasan
                                  </span>
                                </div>

                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() =>
                                    handleDeleteItem("discussions", discussion.id)
                                  }
                                  style={{ borderRadius: "8px" }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>

                              {/* COMMENT INPUT */}
                              <div className="mt-3 d-flex gap-2">
                                <input
                                  type="text"
                                  className="form-control border-0 shadow-sm"
                                  placeholder="Tulis komentar..."
                                  value={replyContent[discussion.id] || ""}
                                  onChange={(e) =>
                                    setReplyContent({
                                      ...replyContent,
                                      [discussion.id]: e.target.value,
                                    })
                                  }
                                  style={{
                                    borderRadius: "10px",
                                    background: "#f8f9fa",
                                  }}
                                />
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleReplyDiscussion(discussion.id)}
                                  disabled={!replyContent[discussion.id]}
                                  style={{ borderRadius: "10px" }}
                                >
                                  Kirim
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* MEMBERS TAB */}
            {activeTab === "members" && (
              <div>
                <h5 className="fw-bold mb-4">👥 Anggota Kelas ({members.length})</h5>
                <div className="row g-3">
                  {members.map((member) => (
                    <div key={member.id} className="col-md-6 col-lg-4">
                      <div 
                        className="card border shadow-sm h-100"
                        style={{
                          borderRadius: "12px",
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-5px)";
                          e.currentTarget.style.boxShadow = "0 10px 30px rgba(37, 99, 235, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      >
                        <div className="card-body p-4 text-center">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mx-auto mb-3"
                            style={{
                              width: "64px",
                              height: "64px",
                              background: member.role === "Guru" 
                                ? "linear-gradient(135deg, #2563eb, #16a34a)" 
                                : "linear-gradient(135deg, #9333ea, #ea580c)"
                            }}
                          >
                            {member.name.charAt(0)}
                          </div>
                          <h6 className="fw-bold mb-1">{member.name}</h6>
                          <span 
                            className="badge"
                            style={{
                              background: member.role === "Guru" ? "#dbeafe" : "#faf5ff",
                              color: member.role === "Guru" ? "#2563eb" : "#9333ea",
                              padding: "6px 12px",
                              borderRadius: "6px"
                            }}
                          >
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* MODAL SUBMIT ASSIGNMENT */}
      {showSubmitModal && selectedAssignment && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div 
                className="modal-content border-0 shadow-lg"
                style={{ borderRadius: "16px" }}
              >
                <div className="modal-header border-0 pb-0">
                  <div>
                    <h5 className="modal-title fw-bold mb-1">
                      📤 Kumpulkan Tugas
                    </h5>
                    <p className="text-muted small mb-0">{selectedAssignment.title}</p>
                  </div>
                  <button
                    className="btn-close"
                    onClick={handleCloseSubmitModal}
                  />
                </div>

                <div className="modal-body p-4">
                  {/* Assignment Info */}
                  <div 
                    className="alert d-flex align-items-center gap-3 mb-4"
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "12px"
                    }}
                  >
                    <Calendar size={24} style={{ color: "#2563eb" }} />
                    <div>
                      <div className="fw-semibold text-dark">Deadline Pengumpulan</div>
                      <div className="small text-muted">{selectedAssignment.dueDate}</div>
                    </div>
                  </div>

                  {/* Submission Text */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-2">
                      Catatan / Keterangan <span className="text-muted fw-normal">(opsional)</span>
                    </label>
                    <textarea
                      className="form-control border-0 shadow-sm"
                      rows="4"
                      placeholder="Tulis catatan atau keterangan tentang pengerjaan tugas Anda..."
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      style={{
                        borderRadius: "12px",
                        background: "#f8f9fa",
                        resize: "none"
                      }}
                    />
                  </div>

                  {/* File Upload */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-2">
                      Upload File Tugas
                    </label>
                    <div
                      className="border-2 border-dashed rounded-3 p-4 text-center"
                      style={{
                        borderColor: submissionFile ? "#16a34a" : "#cbd5e1",
                        background: submissionFile ? "#f0fdf4" : "#f8f9fa",
                        transition: "all 0.3s ease"
                      }}
                    >
                      {submissionFile ? (
                        <div>
                          <FileText size={48} className="text-success mb-3" />
                          <p className="mb-2 fw-semibold text-dark">{submissionFile.name}</p>
                          <p className="small text-muted mb-3">
                            {(submissionFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setSubmissionFile(null)}
                            style={{ borderRadius: "8px" }}
                          >
                            <X size={16} className="me-1" />
                            Hapus File
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload size={48} className="text-muted mb-3" />
                          <p className="mb-2 fw-semibold text-dark">
                            Klik atau drag file ke sini
                          </p>
                          <p className="small text-muted mb-3">
                            Mendukung: PDF, DOC, DOCX, ZIP, RAR (Max 10MB)
                          </p>
                          <label
                            className="btn btn-primary btn-sm"
                            style={{ borderRadius: "8px", cursor: "pointer" }}
                          >
                            <Upload size={16} className="me-1" />
                            Pilih File
                            <input
                              type="file"
                              className="d-none"
                              accept=".pdf,.doc,.docx,.zip,.rar"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div 
                    className="alert mb-0"
                    style={{
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: "12px"
                    }}
                  >
                    <div className="d-flex gap-2">
                      <span style={{ color: "#f59e0b" }}>💡</span>
                      <div className="small text-dark">
                        <strong>Tips:</strong> Pastikan file yang Anda upload sesuai dengan instruksi tugas. 
                        Anda dapat mengupload ulang sebelum deadline.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    className="btn btn-light shadow-sm"
                    onClick={handleCloseSubmitModal}
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
                    onClick={handleSubmitAssignment}
                    disabled={!submissionText && !submissionFile}
                    style={{
                      background: !submissionText && !submissionFile 
                        ? "#9ca3af" 
                        : "linear-gradient(135deg, #2563eb, #16a34a)",
                      border: "none",
                      borderRadius: "12px",
                      padding: "10px 24px",
                      cursor: !submissionText && !submissionFile ? "not-allowed" : "pointer"
                    }}
                  >
                    <CheckCircle size={16} className="me-2" />
                    Kumpulkan Tugas
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BACKDROP */}
          <div
            className="modal-backdrop fade show"
            onClick={handleCloseSubmitModal}
            style={{ zIndex: 1040 }}
          />
        </>
      )}
    </div>
  );
}