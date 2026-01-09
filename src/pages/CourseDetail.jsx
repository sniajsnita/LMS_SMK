import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link, useSearchParams } from "react-router-dom";
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
  ExternalLink,
} from "lucide-react";

import ItemModal from "../components/course/ItemModal";

export default function CourseDetail() {
  const [activeTab, setActiveTab] = useState("materials");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);

  const [course, setCourse] = useState(null); 
  const [loadingCourse, setLoadingCourse] = useState(true);

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  const [discussions, setDiscussions] = useState([]);
  const [replyContent, setReplyContent] = useState({});
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);
  const [likes, setLikes] = useState({});

  // Tambahkan di bagian state declarations
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemModalType, setItemModalType] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // 1. Definisikan ID di baris paling atas
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  // 2. Fungsi Fetch Master (Gabungan)
  const fetchAllCourseData = async (courseId) => {
    if (!courseId) return;

    try {
      // Set semua loading jadi true di awal
      setLoading(true);
      setLoadingMembers(true);

      // 1. Ambil Detail Course & Count
      const { data: courseData, error: courseErr } = await supabase
        .from("courses")
        .select(`*, course_members(count)`)
        .eq("id", courseId)
        .eq("course_members.role", "student")
        .single();

      if (courseErr) throw courseErr;

      // 2. Ambil Nama Guru
      let teacherName = "Guru Pengampu";
      if (courseData.created_by) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", courseData.created_by)
          .single();
        if (profileData) teacherName = profileData.full_name;
      }

      setCourse({
        ...courseData,
        teacher_name: teacherName,
        student_count: courseData.course_members?.[0]?.count || 0 
      });

      // 3. Ambil SEMUA data secara paralel (termasuk members)
      const [mats, assigns, qzs, discs, mems] = await Promise.all([
        supabase.from("materials").select("*").eq("course_id", courseId).order("id", { ascending: true }),
        supabase.from("assignments").select("*").eq("course_id", courseId).order("deadline", { ascending: true }),
        supabase.from("quizzes").select("*").eq("course_id", courseId).order("id", { ascending: true }),
        supabase.from("discussions").select("*").eq("course_id", courseId).order("created_at", { ascending: false }),
        supabase.from("course_members").select("courses_id, user_id, role").eq("courses_id", courseId) // Fetch members di sini
      ]);

      const { data: matsData, error: matsErr } = await supabase
        .from("materials")
        .select("*")
        .eq("course_id", courseId)
        .order("id", { ascending: true });

      // Mapping data agar sesuai dengan UI di gambar
      const formattedMaterials = (matsData || []).map(m => ({
        id: m.id,
        title: m.title || "Judul Materi",
        // Ambil deskripsi langsung dari kolom DB
        description: m.description || "Deskripsi materi akan ditampilkan di sini untuk menjelaskan isi pembelajaran secara singkat.",
        // Tipe: Ambil dari database, fallback ke 'link' jika kosong
        type: m.type || 'link', 
        // Status selesai: Nanti diisi dari tabel material_progress atau state lokal
        completed: m.completed || false,
        // Info Tambahan: Menampilkan durasi jika video, atau ukuran file jika dokumen
        // Agar di UI muncul: "45 menit" atau "2.5 MB"
        info: m.type === 'video' ? (m.duration || "45 menit") : 
              m.type === 'file' ? (m.size || "2.5 MB") : 
              "Tautan Eksternal",
        // URL Utama: Kita seragamkan mengambil dari kolom file_url di DB
        url: m.file_url || "#",
        // Data tambahan untuk kebutuhan download/preview
        file: m.file_url ? { url: m.file_url, name: m.title } : null
      }));

      setMaterials(formattedMaterials);

      // setMaterials(mats.data || []);
      setAssignments(assigns.data || []);
      setQuizzes(qzs.data || []);
      setDiscussions(discs.data || []);

      // 4. Proses Profiles untuk Members
      if (mems.data && mems.data.length > 0) {
        const userIds = mems.data.map(m => m.user_id);
        const { data: profiles, error: profErr } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        if (profErr) throw profErr;

        const combined = mems.data.map(m => ({
          id: m.id,
          role: m.role === 'teacher' ? 'Guru' : 'Siswa', 
          name: profiles?.find(p => p.id === m.user_id)?.full_name || "Anggota Kelas"
        }));
        
        console.log("Data members berhasil digabung:", combined); // Cek console
        setMembers(combined);
      } else {
        setMembers([]);
      }

    } catch (error) {
      console.error("Gagal memuat data kelas:", error.message);
    } finally {
      setLoading(false);
      setLoadingAssignments(false);
      setLoadingQuizzes(false);
      setLoadingDiscussions(false);
      setLoadingMembers(false);
    }
  };

  // 3. SATU useEffect untuk semua (Hapus semua useEffect lama kamu)
  useEffect(() => {
    if (id) {
      fetchAllCourseData(id);
    }
  }, [id]);

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

  // MATERIAL
  const handleOpenMaterial = async (material) => {
    // 1. Ambil User ID yang sedang login
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    // 2. Buka Link
    window.open(material.url, "_blank");

    // 3. Simpan ke tabel material_progress menggunakan UPSERT
    // (Upsert akan mengupdate jika sudah ada, atau menambah jika belum ada)
    if (!material.completed) {
      try {
        const { error } = await supabase
          .from('material_progress')
          .upsert({ 
            user_id: user.id, 
            material_id: material.id,
            is_completed: true 
          }, { onConflict: 'user_id,material_id' }); // Sesuai constraint UNIQUE tadi

        if (error) throw error;

        // Update UI lokal agar badge langsung jadi hijau
        setMaterials(prev => prev.map(m => 
          m.id === material.id ? { ...m, completed: true } : m
        ));
      } catch (err) {
        console.error("Gagal menyimpan progress:", err.message);
      }
    }
  };

  // Handler untuk membuka modal
const handleAddDiscussion = () => {
  setItemModalType("discussions");
  setEditingItem(null);
  setShowItemModal(true);
};

  // Handler untuk menyimpan diskusi
  const handleSaveDiscussion = async (dataFromModal) => {
    try {
      if (!dataFromModal?.title?.trim() || !dataFromModal?.description?.trim()) {
        alert("❌ Judul dan deskripsi wajib diisi");
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("❌ Silakan login terlebih dahulu");
        return false;
      }

      // Upload file jika ada
      let fileUrl = null;
      if (dataFromModal.attachmentFile) {
        const fileName = `${Date.now()}_${dataFromModal.attachmentFile.name}`;
        const filePath = `discussions/${id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('lms-files')
          .upload(filePath, dataFromModal.attachmentFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('lms-files')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
      }

      // Simpan ke database
      const { data: savedData, error } = await supabase
        .from('discussions')
        .insert([{
          course_id: id,
          title: dataFromModal.title,
          content: dataFromModal.description,
          author: user.id,
          file_url: fileUrl,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      alert("✅ Diskusi berhasil dibuat!");
      
      // Refresh data
      fetchAllCourseData(id);
      
      return true;

    } catch (error) {
      console.error("Error:", error);
      alert("❌ Gagal menyimpan: " + error.message);
      return false;
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

        {/* Jika course belum ada, tampilkan skeleton atau loading singkat */}
        {!course ? (
          <div className="container pb-4 text-white">Memuat data kelas...</div>
        ) : (
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
                {/* GUNAKAN DATA DARI DB */}
                {course.subject || "Umum"}
              </span>
              <span className="d-flex align-items-center gap-2 small">
                <Users size={16} />
                {course.teacher_name}
              </span>
              <span className="d-flex align-items-center gap-2 small">
                <Users size={16} />
                {course.student_count} siswa
              </span>
            </div>

            <h1 className="fw-bold display-5 mb-2 text-white">{course.title}</h1>
            <p className="mb-0 fs-5 text-white" style={{ opacity: 0.9 }}>
              {course.description}
            </p>
          </div>
        )}
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
              
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted">Memuat materi...</p>
                </div>
              ) : materials.length === 0 ? (
                <div className="text-center py-5 text-muted">Belum ada materi tersedia.</div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {materials.map((material) => (
                    <div key={material.id} className="card border shadow-sm border-0" style={{ borderRadius: "12px" }}>
                      <div className="card-body p-3 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          {/* ICON DINAMIS: Warna berubah jika selesai */}
                          <div 
                            className="d-flex align-items-center justify-content-center rounded-circle"
                            style={{
                              width: "48px",
                              height: "48px",
                              background: material.completed ? "#dcfce7" : "#f0f7ff",
                              transition: "all 0.3s ease"
                            }}
                          >
                            {material.type === "video" && <Play size={22} className={material.completed ? "text-success" : "text-primary"} />}
                            {material.type === "file" && <FileText size={22} className={material.completed ? "text-success" : "text-primary"} />}
                            {material.type === "link" && <ExternalLink size={22} className={material.completed ? "text-success" : "text-primary"} />}
                          </div>

                          <div>
                            <h6 className="mb-1 fw-semibold">{material.title}</h6>
                            <p className="text-muted mb-2" style={{ fontSize: "0.85rem", maxWidth: "520px", lineHeight: "1.4" }}>
                              {material.description}
                            </p>

                            <div className="d-flex align-items-center gap-3 small">
                              {/* INFO DURASI/SIZE */}
                              <span className="d-flex align-items-center gap-1 text-muted">
                                {material.type === "video" ? (
                                  <><Clock size={14} /> {material.duration || "45 menit"}</>
                                ) : material.type === "file" ? (
                                  <><Download size={14} /> {material.size || "2.5 MB"}</>
                                ) : (
                                  <><ExternalLink size={14} /> Tautan Luar</>
                                )}
                              </span>
                              
                              {/* BADGE STATUS */}
                              {material.completed ? (
                                <span className="badge bg-success-subtle text-success border border-success-subtle">
                                  <CheckCircle size={12} className="me-1" />
                                  Selesai
                                </span>
                              ) : (
                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                  {material.type === "video" && "Belum ditonton"}
                                  {material.type === "file" && "Belum diunduh"}
                                  {material.type === "link" && "Belum dilihat"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* TOMBOL AKSI */}
                        <button
                          className={`btn btn-sm ${material.completed ? 'btn-outline-success' : 'btn-primary'}`}
                          style={{ borderRadius: "8px", minWidth: "90px", fontWeight: "500" }}
                          onClick={() => handleOpenMaterial(material)}
                        >
                          {material.type === "file" ? "Unduh" : 
                          material.type === "video" ? "Tonton" : "Lihat"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

            {/* ASSIGNMENTS TAB */}
            {activeTab === "assignments" && (
              <div>
                <h5 className="fw-bold mb-4">📝 Daftar Tugas</h5>
                <div className="d-flex flex-column gap-3">
                  {loadingAssignments ? (
                    <div className="text-center py-4">Memuat tugas...</div>
                  ) : assignments.length === 0 ? (
                    <div className="text-center py-4 text-muted">Belum ada tugas saat ini.</div>
                  ) : (
                    assignments.map((assignment) => (
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
                                  Deadline: {new Date(assignment.deadline).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                            </div>
                            {/* Tampilkan Nilai Jika Sudah Ada */}
                            {assignment.status === "submitted" && assignment.score !== null && (
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
                    ))
                  )}
                </div>
              </div>
            )}

            {/* QUIZZES TAB */}
            {activeTab === "quizzes" && (
              <div>
                <h5 className="fw-bold mb-4">🏆 Daftar Kuis</h5>
                <div className="d-flex flex-column gap-3">
                  {loadingQuizzes ? (
                    <div className="text-center py-4 text-muted">Memuat daftar kuis...</div>
                  ) : quizzes.length === 0 ? (
                    <div className="text-center py-4 text-muted">Belum ada kuis yang tersedia.</div>
                  ) : (
                    quizzes.map((quiz) => (
                      <div 
                        key={quiz.id}
                        className="card border shadow-sm"
                        style={{
                          borderRadius: "12px",
                          transition: "all 0.3s ease",
                          opacity: quiz.status === "locked" ? 0.6 : 1,
                          cursor: quiz.status === "locked" ? "not-allowed" : "pointer"
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
                                <span>{quiz.questions_count || 0} soal</span>
                                <span>•</span>
                                <span className="d-flex align-items-center gap-1">
                                  <Clock size={14} />
                                  {quiz.duration} menit
                                </span>
                              </div>
                              
                              {/* Logic Status Kuis */}
                              {quiz.status === "completed" ? (
                                <span className="badge bg-success-subtle text-success px-3 py-2">
                                  <CheckCircle size={14} className="me-1" />
                                  Selesai - Nilai: {quiz.score}
                                </span>
                              ) : quiz.status === "available" ? (
                                <button 
                                  className="btn btn-primary btn-sm"
                                  style={{ borderRadius: "8px" }}
                                  onClick={() => console.log("Mulai kuis:", quiz.id)}
                                >
                                  Mulai Kuis
                                </button>
                              ) : (
                                <span className="badge bg-secondary px-3 py-2">
                                  🔒 Terkunci
                                </span>
                              )}
                            </div>

                            {/* Tampilan Nilai di Samping */}
                            {quiz.status === "completed" && quiz.score !== null && (
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
                    ))
                  )}
                </div>
              </div>
            )}

            {/* DISCUSSIONS TAB*/}
            {activeTab === "discussions" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">💬 Forum Diskusi</h5>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: "8px" }}
                    onClick={handleAddDiscussion} // ← Ubah ini
                  >
                    <Plus size={16} className="me-1" />
                    Buat Diskusi
                  </button>
                </div>

                {loadingDiscussions ? (
                  <div className="text-center py-5">Memuat diskusi...</div>
                ) : discussions.length === 0 ? (
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
                              {discussion.author?.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-grow-1">
                              <div className="d-flex gap-2 mb-2 align-items-center">
                                <span className="fw-semibold">{discussion.author}</span>
                                <span className="text-muted small">
                                  {new Date(discussion.created_at).toLocaleDateString('id-ID')}
                                </span>
                              </div>

                              <h6 className="fw-bold mb-2">{discussion.title}</h6>
                              <p className="text-muted small mb-0">{discussion.content}</p>

                              {/* ACTIONS */}
                              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                <div className="d-flex gap-3 align-items-center text-muted small">
                                  <button
                                    className="btn btn-light btn-sm"
                                    onClick={() => handleLikeDiscussion(discussion.id)}
                                    style={{ borderRadius: "8px" }}
                                  >
                                    ❤️ {discussion.likes || 0}
                                  </button>

                                  <span className="d-flex align-items-center gap-2">
                                    <MessageSquare size={16} />
                                    {discussion.replies_count || 0} balasan
                                  </span>
                                </div>

                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteItem("discussions", discussion.id)}
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
                
                {loadingMembers ? (
                  <div className="text-center py-5 text-muted">Memuat daftar anggota...</div>
                ) : (
                  <div className="row g-3">
                    {members.length === 0 ? (
                      <div className="text-center py-5">Belum ada anggota di kelas ini.</div>
                    ) : (
                      members.map((member) => (
                        <div key={member.id} className="col-md-6 col-lg-4">
                          <div 
                            className="card border shadow-sm h-100"
                            style={{ borderRadius: "12px", transition: "all 0.3s ease" }}
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
                                  // Pastikan pengecekan 'Guru' sesuai dengan data yang dikirim fetch
                                  background: member.role === "Guru" 
                                    ? "linear-gradient(135deg, #2563eb, #16a34a)" 
                                    : "linear-gradient(135deg, #9333ea, #ea580c)"
                                }}
                              >
                                {/* Inisial nama dinamis */}
                                {member.name ? member.name.charAt(0).toUpperCase() : "?"}
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
                      ))
                    )}
                  </div>
                )}
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
                      <div className="small text-muted">{selectedAssignment.deadline}</div>
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
      {/* ITEM MODAL */}
      <ItemModal
        show={showItemModal}
        type={itemModalType}
        editingItem={editingItem}
        onClose={() => setShowItemModal(false)}
        onSave={handleSaveDiscussion}
      />
    </div>
  );
}