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
  Lock,
  Clock,
  CheckCircle,
  Download,
  Play,
  Plus,
  Upload,
  UploadCloud,
  CloudUpload,
  Send,
  X,
  Trash2,
  ExternalLink,
  Heart,
  Edit3,
} from "lucide-react";

import ItemModal from "../components/course/ItemModal";

export default function CourseDetail() {
  const [activeTab, setActiveTab] = useState("materials");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [expandedDiscussions, setExpandedDiscussions] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Tambahkan di bagian state declarations
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemModalType, setItemModalType] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // 1. Definisikan ID di baris paling atas
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  // 2. Fungsi Fetch Master (Gabungan)
  const fetchAllCourseData = async (courseId) => {
    if (!courseId) return;

    try {
      setLoading(true);
      setLoadingDiscussions(true);

      // 1. Ambil data dasar secara paralel
      const [mats, assigns, qzs, discs, mems, likesData] = await Promise.all([
        supabase.from("materials").select("*").eq("course_id", courseId).order("id", { ascending: true }),
        supabase
          .from("assignments")
          .select(`
            *,
            submissions (
              id,
              user_id,
              submitted_at,
              grade
            )
          `)
          .eq("course_id", courseId)
          // Filter ini sangat penting agar siswa A tidak melihat data submission siswa B
          .eq("submissions.user_id", currentUser?.id) 
          .order("deadline", { ascending: true }),
        supabase
          .from("quizzes")
          .select(`
            *,
            quiz_attempts (
              score,
              user_id
            )
          `)
          .eq("course_id", courseId)
          // Gunakan filter ini supaya hanya ambil skor milik user yang login
          .eq("quiz_attempts.user_id", currentUser?.id),
        supabase.from("discussions").select("*").eq("course_id", courseId).order("created_at", { ascending: false }),
        supabase.from("course_members").select("id, user_id, role").eq("courses_id", courseId),
        supabase.from("discussion_likes").select("discussion_id").eq("user_id", currentUser?.id)
      ]);

      // 2. Ambil data Course & Guru
      const { data: courseData } = await supabase
        .from("courses")
        .select(`*, profiles:created_by (full_name)`)
        .eq("id", courseId)
        .single();

      if (courseData) {
        setCourse({
          ...courseData,
          teacher_name: courseData.profiles?.full_name || "Guru Pengampu",
          student_count: mems.data?.length || 0
        });
      }

      // 3. Ambil Profil User (Pembuat diskusi & member)
      const allUserIds = [...new Set([
        ...(discs.data?.map(d => d.user_id) || []),
        ...(mems.data?.map(m => m.user_id) || [])
      ])].filter(Boolean);

      let profilesData = [];
      if (allUserIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", allUserIds);
        profilesData = profs || [];
      }

      // 4. Ambil Balasan (Replies)
      const discIds = discs.data?.map(d => d.id) || [];
      let allReplies = [];
      let allLikes = []; // Tambahkan variabel ini

      if (discIds.length > 0) {
        // Ambil Balasan
        const { data: reps } = await supabase
          .from("discussion_replies")
          .select("*, profiles:user_id(full_name)")
          .in("discussion_id", discIds)
          .order("created_at", { ascending: true });
        allReplies = reps || [];

        // AMBIL SEMUA LIKES (Tambahkan ini)
        const { data: likes } = await supabase
          .from("discussion_likes")
          .select("discussion_id, user_id")
          .in("discussion_id", discIds);
        allLikes = likes || [];
      }

      // 5. MAPPING DISKUSI (Gabungkan Diskusi + Nama + Replies + Like)
      const formattedDiscussions = (discs.data || []).map(d => {
        const discussionReplies = allReplies
          .filter(r => r.discussion_id === d.id)
          .map(r => ({
            id: r.id,
            title: d.title,
            content: d.description,
            author_name: r.profiles?.full_name || "User",
            user_id: r.user_id,
            created_at: r.created_at
          }));

        const likesForThisDisc = allLikes.filter(l => l.discussion_id === d.id);

        return {
          ...d,
          author: profilesData.find(p => p.id === d.user_id)?.full_name || "Tanpa Nama",
          replies: discussionReplies,
          replies_count: discussionReplies.length,
          is_liked: allLikes?.some(l => l.discussion_id === d.id && l.user_id === currentUser?.id) || false,
  
          likes_count: allLikes?.filter(l => l.discussion_id === d.id).length || 0
        };
      });

      // 6. Update Semua State
      setMaterials(mats.data || []);
      setAssignments(assigns.data || []);
      setQuizzes(qzs.data || []);
      setDiscussions(formattedDiscussions);
      setMembers((mems.data || []).map(m => ({
        ...m,
        name: profilesData.find(p => p.id === m.user_id)?.full_name || "Anggota",
        role: m.role === 'teacher' ? 'Guru' : 'Siswa'
      })));

    } catch (error) {
      console.error("Gagal memuat data kelas:", error.message);
    } finally {
      setLoading(false);
      setLoadingDiscussions(false);
    }
  };

  useEffect(() => {
    // Hanya jalankan fetch jika ID course DAN currentUser sudah tersedia
    if (id && currentUser) {
      fetchAllCourseData(id);
    }
  }, [id, currentUser]);

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

  const handleSubmitAssignment = async () => {
    if (!submissionFile) {
      alert("❌ Mohon upload file tugas terlebih dahulu");
      return;
    }

    try {
      const user = currentUser;
      if (!user) throw new Error("Silakan login terlebih dahulu");

      // Persiapkan nama file
      const fileExt = submissionFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // PERHATIKAN DI SINI: Sertakan nama folder 'submissions/' di depan nama file
      const filePath = `submissions/${selectedAssignment.id}/${fileName}`;

      // 1. Upload File ke bucket 'lms-files'
      const { error: uploadError } = await supabase.storage
        .from('lms-files') // Nama Bucket Utama kamu
        .upload(filePath, submissionFile);

      if (uploadError) throw uploadError;

      // 2. Ambil Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lms-files')
        .getPublicUrl(filePath);

      // 3. Simpan ke Database
      const { error: dbError } = await supabase
        .from('submissions')
        .insert([
          {
            assignment_id: selectedAssignment.id,
            user_id: user.id,
            file_url: publicUrl,
            notes: submissionText,
            submitted_at: new Date().toISOString()
          }
        ]);

      if (dbError) throw dbError;

      alert("✅ Tugas berhasil dikumpulkan!");
      handleCloseSubmitModal();
      fetchAllCourseData(id);

    } catch (error) {
      console.error("Submission error:", error.message);
      alert("❌ Gagal mengirim tugas: " + error.message);
    }
  };

  const handleLikeDiscussion = async (discussionId) => {
    if (!currentUser) return alert("Silakan login terlebih dahulu");

    const targetDisc = discussions.find((d) => d.id === discussionId);
    const isCurrentlyLiked = targetDisc.is_liked;

    // OPTIMISTIC UPDATE (Ubah angka di UI langsung)
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id === discussionId
          ? {
              ...d,
              is_liked: !isCurrentlyLiked,
              likes_count: isCurrentlyLiked
                ? Math.max(0, (d.likes_count || 0) - 1)
                : (d.likes_count || 0) + 1,
            }
          : d
      )
    );

    try {
      if (isCurrentlyLiked) {
        // Hapus data suka
        await supabase
          .from("discussion_likes")
          .delete()
          .match({ discussion_id: discussionId, user_id: currentUser.id });
      } else {
        // Tambah data suka
        const { error } = await supabase
          .from("discussion_likes")
          .insert({ discussion_id: discussionId, user_id: currentUser.id });
        
        if (error && error.code !== '23505') throw error;
      }
      // Tidak perlu update tabel discussions karena kolomnya tidak ada
    } catch (err) {
      console.error("Gagal update like:", err.message);
      fetchAllCourseData(id); // Balikkan ke data asli jika gagal
    }
  };

  const handleReplyDiscussion = async (discId) => {
    const content = replyContent[discId];
    if (!content?.trim() || !currentUser) return;

    try {
      const { error } = await supabase.from("discussion_replies").insert({
        discussion_id: discId,
        user_id: currentUser.id,
        content: content.trim()
      });

      if (error) throw error;
      
      setReplyContent(prev => ({ ...prev, [discId]: "" }));
      fetchAllCourseData(id); // Refresh otomatis
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Hapus balasan ini?")) return;
    const { error } = await supabase.from("discussion_replies").delete().eq("id", replyId);
    if (!error) fetchAllCourseData(id);
  };

  const handleEditReply = async (reply) => {
    // 1. Munculkan prompt untuk mengisi konten baru
    const newContent = window.prompt("Edit balasan Anda:", reply.content);
    
    // 2. Validasi: Jika batal atau isinya kosong/sama, jangan lanjut
    if (!newContent || newContent.trim() === "" || newContent === reply.content) return;

    try {
      // 3. Update ke tabel discussion_replies di Supabase
      const { error } = await supabase
        .from("discussion_replies")
        .update({ content: newContent.trim() })
        .eq("id", reply.id);

      if (error) throw error;

      // 4. Refresh data agar tampilan terupdate
      // Gunakan fungsi fetch data yang sudah kita buat tadi
      fetchAllCourseData(id); 

    } catch (err) {
      console.error("Gagal mengedit balasan:", err.message);
      alert("Gagal mengupdate balasan. Silakan coba lagi.");
    }
  };

    const toggleReplies = (id) => {
      setExpandedDiscussions(prev => ({ ...prev, [id]: !prev[id] }));
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

  const handleStartQuiz = async (quiz) => {
    // 1. Cek apakah sudah melewati deadline
    const isPastDeadline = quiz.deadline && new Date() > new Date(quiz.deadline);
    if (isPastDeadline) {
      alert("Maaf, batas waktu pengerjaan kuis ini sudah berakhir.");
      return;
    }

    // 2. Cek apakah sudah pernah klik (sudah ada attempt)
    if (quiz.quiz_attempts && quiz.quiz_attempts.length > 0) {
      alert("Anda sudah menggunakan kesempatan mencoba kuis ini.");
      return;
    }

    try {
      // 3. Catat percobaan ke database (karena percobaan cuma 1x)
      const { error } = await supabase
        .from('quiz_attempts')
        .insert([
          { 
            quiz_id: quiz.id, 
            user_id: currentUser.id, 
            score: 0 // Nilai default 0 saat mulai, bisa diupdate nanti jika ada sistem nilai otomatis
          }
        ]);

      if (error) throw error;

      // 4. Buka link kuis di tab baru
      window.open(quiz.link, "_blank");

      // 5. Refresh data agar tombol langsung berubah jadi "Selesai"
      await fetchAllCourseData(course);

    } catch (error) {
      console.error("Gagal memulai kuis:", error.message);
      alert("Terjadi kesalahan saat memulai kuis.");
    }
  };

  // Handler untuk membuka modal
  const handleAddDiscussion = () => {
    setItemModalType("discussions");
    setEditingItem(null);
    setShowItemModal(true);
  };

  const handleEditDiscussion = (discussion) => {
    console.log("Edit diskusi:", discussion);
    
    // 1. Set item yang ingin diedit ke state editingItem
    setEditingItem(discussion);
    
    // 2. Set tipe modal ke "discussions"
    setItemModalType("discussions");
    
    // 3. Tampilkan modal
    setShowItemModal(true);
  };

  // Handler untuk menyimpan diskusi
  const handleSaveDiscussion = async (formData) => {
    if (!currentUser) return false;

    try {
      const discussionData = {
        title: formData.title,
        // Gunakan fallback jika modal mengirim 'content' atau 'description'
        description: formData.description || formData.content || "",
        course_id: id,
        user_id: currentUser.id,
      };

      if (!discussionData.description) {
        alert("Isi diskusi tidak boleh kosong");
        return false;
      }

      if (editingItem) {
        const { error } = await supabase
          .from("discussions")
          .update(discussionData)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("discussions")
          .insert([discussionData]);
        if (error) throw error;
      }

      await fetchAllCourseData(id); 
      setEditingItem(null);
      return true; // Berhasil!
    } catch (err) {
      console.error(err.message);
      alert("Gagal: " + err.message);
      return false; // Gagal!
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
                            <p className="text-muted mb-2">
                              {assignment.description}
                            </p>
                            <div className="d-flex align-items-center gap-3 small text-muted">
                              <span className="d-flex align-items-center gap-1">
                                <Calendar size={14} />
                                Deadline: {assignment.deadline ? (
                                  new Date(assignment.deadline).toLocaleString('id-ID', { 
                                    dateStyle: 'long', 
                                    timeStyle: 'short' 
                                  })
                                ) : (
                                  "Tidak ada batas waktu"
                                )}
                              </span>
                            </div>
                            {assignment.file_url ? (
                              <a
                                href={assignment.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="d-inline-flex align-items-center gap-2 text-decoration-none mt-2 fw-medium"
                                style={{ color: "#2563eb", fontSize: "0.875rem" }}
                              >
                                <Download size={16} />
                                Unduh Instruksi Tugas
                              </a>
                            ) : (
                              <div 
                                className="d-inline-flex align-items-center gap-2 mt-2 text-muted" 
                                style={{ fontSize: "0.875rem", fontStyle: "italic" }}
                              >
                                <FileText size={16} />
                                Tidak ada lampiran file dari pengajar
                              </div>
                            )}
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
                          {/* Logic: Jika array submissions ada isinya, berarti sudah dikumpulkan.
                            Kita ambil data submission pertama ([0]) 
                          */}
                          {assignment.submissions && assignment.submissions.length > 0 ? (
                            (() => {
                              const sub = assignment.submissions[0];
                              const isLate = new Date(sub.submitted_at) > new Date(assignment.deadline);
                              
                              return (
                                <span className={`badge bg-${isLate ? 'danger' : 'success'}-subtle text-${isLate ? 'danger' : 'success'} px-3 py-2 rounded-pill d-flex align-items-center`}>
                                  {isLate ? (
                                    <>
                                      <Clock size={14} className="me-1" />
                                      Terlambat Dikumpulkan
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle size={14} className="me-1" />
                                      Sudah Dikumpulkan
                                    </>
                                  )}
                                </span>
                              );
                            })()
                          ) : (
                            /* Jika belum ada data di array submissions */
                            <button 
                              className="btn btn-primary btn-sm px-4 fw-bold"
                              style={{ 
                                borderRadius: "10px", 
                                background: "linear-gradient(135deg, #2563eb, #16a34a)", 
                                border: "none" 
                              }}
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
                  {quizzes.map((quiz) => {
                    const attempt = quiz.quiz_attempts?.[0];
                    const isCompleted = !!attempt;
                    const isPastDeadline = quiz.deadline && new Date() > new Date(quiz.deadline);

                    return (
                      <div 
                        key={quiz.id}
                        className="card border-0 shadow-sm mb-3"
                        style={{
                          borderRadius: "16px",
                          transition: "all 0.3s ease",
                          opacity: (isPastDeadline && !isCompleted) ? 0.7 : 1,
                        }}
                      >
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between">
                            {/* SISI KIRI: INFO KUIS */}
                            <div className="flex-grow-1">
                              <h5 className="fw-bold mb-2" style={{ color: "#1e293b" }}>{quiz.title}</h5>
                              <p className="text-muted mb-3">
                                {quiz.description}
                              </p>
                              
                              <div className="d-flex align-items-center gap-2 small text-muted mb-4">
                                <span>•</span>
                                <span className="d-flex align-items-center gap-1">
                                  <Calendar size={14} /> 
                                  Deadline: {quiz.deadline ? new Date(quiz.deadline).toLocaleDateString('id-ID') : '-'}
                                </span>
                                <span>•</span>
                                <span>Percobaan: {quiz.attempts || 1}x</span>
                              </div>

                              {/* TOMBOL / BADGE DI BAWAH */}
                              <div>
                                {isCompleted ? (
                                  <span className="badge bg-success-subtle text-success px-3 py-2 rounded-2 d-inline-flex align-items-center gap-2 border border-success border-opacity-10">
                                    <CheckCircle size={16} />
                                    Selesai - Nilai: {attempt.score}
                                  </span>
                                ) : isPastDeadline ? (
                                  <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-2 d-inline-flex align-items-center gap-2 border border-danger border-opacity-10">
                                    <Lock size={16} />
                                    Terkunci - Melewati Batas Waktu
                                  </span>
                                ) : (
                                  <button 
                                    className="btn btn-primary px-4 fw-bold"
                                    style={{ borderRadius: "10px", backgroundColor: "#2563eb", border: "none" }}
                                    onClick={() => handleStartQuiz(quiz)}
                                  >
                                    Mulai Kuis
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* SISI KANAN: NILAI BESAR (Hanya jika selesai) */}
                            {isCompleted && (
                              <div className="text-end d-flex flex-column justify-content-start pt-1">
                                <div className="fw-bold" style={{ fontSize: "2.5rem", color: "#16a34a", lineHeight: "1" }}>
                                  {attempt.score}
                                </div>
                                <div className="text-muted small fw-medium text-center">Nilai</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            {/* DISCUSSIONS TAB*/}
            {activeTab === "discussions" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">💬 Forum Diskusi</h5>
                  <button className="btn btn-primary d-flex align-items-center gap-2" style={{ borderRadius: "10px", padding: "8px 20px" }} onClick={handleAddDiscussion}>
                    <Plus size={18} /> Buat Diskusi
                  </button>
                </div>

                {loadingDiscussions ? (
                  <div className="text-center py-5 text-muted">Memuat diskusi...</div>
                ) : discussions.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                    <MessageSquare size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                    <p className="text-muted mb-0">Belum ada diskusi di kelas ini.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-4">
                    {discussions.map((discussion) => {
                      const isOwner = currentUser?.id === discussion.user_id;
                      const isExpanded = expandedDiscussions[discussion.id];
                      const displayedReplies = isExpanded 
                        ? discussion.replies 
                        : (discussion.replies?.slice(0, 1) || []);

                      return (
                        <div key={discussion.id} className="card border-0 shadow-sm" style={{ borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                          <div className="card-body p-4">
                            <div className="d-flex align-items-start gap-3">
                              {/* Avatar */}
                              <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                                style={{ width: "50px", height: "50px", flexShrink: 0, background: "linear-gradient(135deg, #2563eb, #16a34a)", fontSize: "1.2rem" }}>
                                {(discussion.author || "A").charAt(0).toUpperCase()}
                              </div>

                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                  <div>
                                    <span className="fw-bold text-dark">{discussion.author}</span>
                                    {isOwner && <span className="badge bg-light text-primary ms-2 fw-normal">Anda</span>}
                                  </div>
                                  
                                  {/* AREA TANGGAL DAN ACTION BUTTONS */}
                                  <div className="d-flex align-items-center gap-3">
                                    <span className="text-muted small d-flex align-items-center gap-1">
                                      <Clock size={12} />
                                      {new Date(discussion.created_at).toLocaleDateString('id-ID')}
                                    </span>
                                    
                                    {isOwner && (
                                      <div className="d-flex gap-2 border-start ps-2" style={{ borderColor: '#e2e8f0' }}>
                                        <Edit3 
                                          size={16} 
                                          className="text-primary" 
                                          style={{ cursor: "pointer", opacity: 0.8 }} 
                                          onClick={() => handleEditDiscussion(discussion)} 
                                        />
                                        <Trash2 
                                          size={16} 
                                          className="text-danger" 
                                          style={{ cursor: "pointer", opacity: 0.8 }} 
                                          onClick={() => handleDeleteItem("discussions", discussion.id)} 
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <h6 className="fw-bold text-primary mb-2">{discussion.title}</h6>
                                <p className="text-secondary small mb-3">{discussion.content}</p>

                                {/* Tombol Interaksi Utama (Like & Jumlah Balasan) */}
                                <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                  <div className="d-flex gap-3">
                                    <button 
                                      className="btn btn-sm d-flex align-items-center gap-2 border-0 bg-transparent p-0"
                                      onClick={() => handleLikeDiscussion(discussion.id)}
                                    >
                                      <Heart 
                                        size={20} 
                                        className={discussion.is_liked ? "text-danger" : "text-secondary"} 
                                        fill={discussion.is_liked ? "#ef4444" : "none"} 
                                        style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                                      />
                                      <span className={discussion.is_liked ? "text-danger fw-bold" : "text-secondary"}>
                                        {discussion.likes_count || 0} Suka
                                      </span>
                                    </button>
                                    
                                    <div className="text-muted d-flex align-items-center gap-2 small">
                                      <MessageSquare size={16} /> {discussion.replies_count || 0} Balasan
                                    </div>
                                  </div>
                                </div>

                                {/* List Balasan */}
                                {discussion.replies && discussion.replies.length > 0 && (
                                  <div className="mt-3 ms-4 ps-3 border-start border-2" style={{ borderColor: '#f1f5f9' }}>
                                    {displayedReplies.map((reply) => (
                                      <div key={reply.id} className="bg-light p-3 rounded-4 mb-2 position-relative shadow-sm">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                          <span className="fw-bold text-primary small">{reply.author_name}</span>
                                          <div className="d-flex align-items-center gap-2">
                                            <span className="text-muted" style={{ fontSize: '10px' }}>
                                              {new Date(reply.created_at).toLocaleDateString('id-ID')}
                                            </span>
                                            {currentUser?.id === reply.user_id && (
                                              <div className="d-flex gap-2 ms-1 border-start ps-2">
                                                <Edit3 size={14} className="text-muted" style={{ cursor: "pointer" }} onClick={() => handleEditReply(reply)} />
                                                <Trash2 size={14} className="text-danger" style={{ cursor: "pointer" }} onClick={() => handleDeleteReply(reply.id)} />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <p className="small mb-1 text-dark">{reply.content}</p>
                                      </div>
                                    ))}

                                    {discussion.replies.length > 1 && (
                                      <button 
                                        className="btn btn-link btn-sm text-decoration-none p-0 fw-bold mt-1"
                                        onClick={() => toggleReplies(discussion.id)}
                                      >
                                        {isExpanded ? "Sembunyikan" : `Lihat ${discussion.replies.length - 1} balasan lainnya...`}
                                      </button>
                                    )}
                                  </div>
                                )}

                                {/* Input Balasan */}
                                <div className="mt-3 d-flex gap-2">
                                  <input
                                    type="text"
                                    className="form-control form-control-sm border-0 bg-light"
                                    placeholder="Tulis balasan..."
                                    style={{ borderRadius: "8px", padding: "10px" }}
                                    value={replyContent[discussion.id] || ""}
                                    onChange={(e) => setReplyContent({ ...replyContent, [discussion.id]: e.target.value })}
                                  />
                                  <button 
                                    className="btn btn-primary btn-sm px-3 shadow-sm" 
                                    disabled={!replyContent[discussion.id]} 
                                    onClick={() => handleReplyDiscussion(discussion.id)}
                                    style={{ borderRadius: "8px", background: "linear-gradient(135deg, #2563eb, #16a34a)", border: "none" }}
                                  >
                                    Kirim
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
        <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div 
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "20px", overflow: "hidden" }}
            >
              {/* Header */}
              <div className="modal-header border-0 p-4 pb-0">
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="bg-primary bg-opacity-10 p-3 rounded-3"
                    style={{ color: "#2563eb" }}
                  >
                    <UploadCloud size={28} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0" style={{ fontSize: '1.25rem' }}>
                      Kumpulkan Tugas
                    </h5>
                    <p className="text-muted small mb-0">Pastikan file sudah sesuai sebelum dikirim</p>
                  </div>
                </div>
                <button
                  className="btn-close shadow-none"
                  onClick={handleCloseSubmitModal}
                />
              </div>

              <div className="modal-body p-4">
                {/* Informasi Tugas & Deadline */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark mb-2">Detail Tugas</label>
                  <div 
                    className="p-3 border shadow-sm"
                    style={{ background: "#ffffff", borderRadius: "12px" }}
                  >
                    <h6 className="fw-bold mb-1">{selectedAssignment.title}</h6>
                    <div className="d-flex align-items-center gap-3 mt-2">
                      <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill small d-flex align-items-center gap-1">
                        <Clock size={14} /> Deadline: {new Date(selectedAssignment.deadline).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Input Catatan */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark mb-2">
                    Catatan Siswa <span className="text-muted fw-normal small">(opsional)</span>
                  </label>
                  <textarea
                    className="form-control border shadow-sm"
                    rows="3"
                    placeholder="Tambahkan pesan atau catatan untuk guru jika ada..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    style={{
                      borderRadius: "12px",
                      background: "#fdfdfd",
                      resize: "none",
                      padding: "12px"
                    }}
                  />
                </div>

                {/* Area Dropzone/Upload */}
                <div className="mb-2">
                  <label className="form-label fw-bold text-dark mb-2">Lampiran File</label>
                  <div
                    className="border-2 border-dashed rounded-4 p-5 text-center position-relative"
                    style={{
                      borderColor: submissionFile ? "#10b981" : "#e2e8f0",
                      background: submissionFile ? "#f0fdf4" : "#f8fafc",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {submissionFile ? (
                      <div className="animate__animated animate__fadeIn">
                        <div className="d-inline-block bg-success bg-opacity-10 p-3 rounded-circle mb-3">
                          <FileText size={40} className="text-success" />
                        </div>
                        <h6 className="fw-bold text-dark mb-1">{submissionFile.name}</h6>
                        <p className="small text-muted">
                          Ukuran: {(submissionFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          className="btn btn-link text-danger text-decoration-none fw-semibold p-0 mt-2"
                          onClick={() => setSubmissionFile(null)}
                        >
                          Ganti File
                        </button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <div className="d-inline-block bg-primary bg-opacity-10 p-3 rounded-circle mb-3">
                          <CloudUpload size={40} className="text-primary" />
                        </div>
                        <p className="mb-1 fw-bold text-dark">Pilih file tugas Anda</p>
                        <p className="small text-muted mb-3">Format: PDF, DOCX, atau ZIP (Maks. 10MB)</p>
                        <label
                          className="btn btn-outline-primary px-4 fw-semibold shadow-sm"
                          style={{ borderRadius: "10px", cursor: "pointer" }}
                        >
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

                {/* Tips Info (Sekarang berada di dalam Modal Body agar simetris) */}
                <div 
                  className="alert mt-4 mb-0 d-flex gap-3"
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "12px",
                    padding: "16px"
                  }}
                >
                  <span style={{ fontSize: "20px" }}>💡</span>
                  <div className="small text-dark" style={{ lineHeight: "1.5" }}>
                    <strong>Tips:</strong> Pastikan file yang Anda upload sesuai dengan instruksi tugas. 
                    Anda dapat mengupload ulang sebelum deadline.
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 p-4 pt-0">
                <button
                  className="btn btn-light px-4 py-2 fw-semibold me-2"
                  onClick={handleCloseSubmitModal}
                  disabled={isSubmitting}
                  style={{ borderRadius: "10px", color: "#64748b" }}
                >
                  Batal
                </button>
                <button 
                  className="btn btn-primary px-4 py-2 fw-bold d-flex align-items-center gap-2"
                  onClick={handleSubmitAssignment}
                  disabled={!submissionFile || isSubmitting}
                  style={{
                    background: "linear-gradient(135deg, #2563eb, #16a34a)",
                    border: "none",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Kumpulkan Sekarang
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>

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