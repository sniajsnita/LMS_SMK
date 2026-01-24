import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link, useSearchParams } from "react-router-dom";
import AssignmentModal from "../components/course/AssignmentModal";

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
import DiscussionItem from "../components/discussions/DiscussionItem";

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
      const [mats, progress, assigns, qzs, discs, mems, likesData] = await Promise.all([
        supabase.from("materials").select("*").eq("course_id", courseId).order("id", { ascending: true }),
        supabase.from("material_progress").select("material_id").eq("user_id", currentUser?.id),
        supabase.from("assignments").select(`
            *,
            submissions (
              id, user_id, submitted_at, grade
            )
          `).eq("course_id", courseId)
          .eq("submissions.user_id", currentUser?.id)
          .order("deadline", { ascending: true }),
        supabase
          .from("quizzes")
          .select(`
            *,
            quiz_attempts (
              score
            )
          `)
          .eq("course_id", courseId)
          .eq("quiz_attempts.user_id", currentUser?.id),
        supabase
          .from("discussions")
          .select(`
            *,
            discussion_likes(user_id) 
          `)
          .eq("course_id", courseId)
          .order("created_at", { ascending: false }),
        supabase.from("course_members").select("id, user_id, role").eq("courses_id", courseId),
      ]);

      // Buat daftar ID materi yang sudah selesai agar mudah dicari
      const completedMaterialIds = (progress.data || []).map(c => c.material_id);

      // MAPPING DATA MATERI (Tambahkan ini sebelum Langkah 6)
      const formattedMaterials = (mats.data || []).map(m => ({
        ...m,
        completed: completedMaterialIds.includes(m.id) // Cek apakah ID materi ada di daftar yang sudah selesai
      }));

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
          student_count: mems.data?.filter(m => m.role === 'student').length || 0 // PERBAIKAN: Hitung hanya siswa
        });
      }

      // 3. Ambil Profil User
      const allUserIds = [...new Set([
        ...(discs.data?.map(d => d.user_id) || []),
        ...(mems.data?.map(m => m.user_id) || [])
      ])].filter(Boolean);

      let profilesData = [];
      if (allUserIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", allUserIds);
        profilesData = profs || [];
      }

      // 4. Ambil Balasan & Likes
      const discIds = discs.data?.map(d => d.id) || [];
      let allReplies = [];
      let allLikes = [];

      if (discIds.length > 0) {
        const [reps, likes] = await Promise.all([
          supabase.from("discussion_replies").select("*, profiles:user_id(full_name)").in("discussion_id", discIds).order("created_at", { ascending: true }),
          supabase.from("discussion_likes").select("discussion_id, user_id").in("discussion_id", discIds)
        ]);
        allReplies = reps.data || [];
        allLikes = likes.data || [];
      }

      // 5. MAPPING DATA (DINAMIS)

      // A. Tugas
      const formattedAssigns = (assigns.data || []).map(assign => {
        const userSubmission = assign.submissions?.[0];
        return {
          ...assign,
          // PERBAIKAN: Logika status yang lebih akurat
          status: userSubmission 
            ? (userSubmission.grade !== null ? "graded" : "submitted") 
            : "pending",
          score: userSubmission?.grade || null,
          submittedAt: userSubmission?.submitted_at || null
        };
      });

      // B. Kuis
      const formattedQuizzes = (qzs.data || []).map(quiz => {
        // Hitung jumlah percobaan user ini untuk kuis ini
        const userAttemptsCount = quiz.quiz_attempts?.length || 0;
        
        // Ambil data percobaan terakhir (untuk skor)
        const lastAttempt = quiz.quiz_attempts?.[userAttemptsCount - 1];

        return {
          ...quiz,
          // Gunakan userAttemptsCount untuk status dan counter
          user_attempts: userAttemptsCount, 
          status: userAttemptsCount > 0 ? "completed" : (quiz.is_locked ? "locked" : "available"),
          score: lastAttempt?.score || null
        };
      });

      // C. Diskusi
      const formattedDiscussions = (discs.data || []).map(d => {
        const likes = d.discussion_likes || [];
        
        // 1. Memproses Reply (Gunakan hasil filter ini)
        const discussionReplies = allReplies
          .filter(r => r.discussion_id === d.id)
          .map(r => ({
            ...r,
            author_name: r.profiles?.full_name || "User",
            content: r.content,
            created_at: r.created_at
          }));

        // 2. Mendapatkan User ID dengan aman
        // Terkadang currentUser belum siap saat fetch, pastikan ambil dari auth jika perlu
        const currentUserId = currentUser?.id;

        return {
          ...d,
          author: profilesData.find(p => p.id === d.user_id)?.full_name || "Tanpa Nama",
          
          // CEK DISINI: Pastikan perbandingan ID benar-benar jalan
          isLiked: likes.some(l => String(l.user_id) === String(currentUserId)),
          
          likesCount: likes.length,
          
          // PERBAIKAN: Gunakan variabel discussionReplies yang di atas, bukan d.discussion_replies
          allReplies: discussionReplies 
        };
      });

      // 6. Update Semua State
      setMaterials(mats.data || []);
      setAssignments(formattedAssigns);
      setQuizzes(formattedQuizzes); 
      setDiscussions(formattedDiscussions);
      setMaterials(formattedMaterials);

      // PERBAIKAN DI SINI:
      const formattedMembers = (mems.data || []).map(m => {
        // Cari profil berdasarkan user_id
        const userProfile = profilesData.find(p => p.id === m.user_id);
        
        return {
          id: m.id,
          user_id: m.user_id, // Simpan user_id untuk keperluan debugging
          name: userProfile ? userProfile.full_name : "Memuat nama...", 
          role: m.role === 'teacher' ? 'Guru' : 'Siswa'
        };
      });

      setMembers(formattedMembers);

    } catch (error) {
      console.error("Gagal memuat data kelas:", error.message);
    } finally {
      setLoading(false);
      setLoadingDiscussions(false);
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    // Pastikan id dari useParams dan currentUser dari auth sudah ada
    if (id && currentUser) {
      fetchAllCourseData(id);
    }
  }, [id, currentUser]); // Dependency array yang benar untuk CourseDetail

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

  const handleCancelSubmission = async (assignmentId) => {
    // Konfirmasi ke user agar tidak tidak sengaja terhapus
    if (!window.confirm("Apakah Anda yakin ingin membatalkan pengumpulan? File yang sudah diunggah akan dihapus.")) return;

    try {
      const { error } = await supabase
        .from("submissions")
        .delete()
        .match({ 
          assignment_id: assignmentId, 
          user_id: currentUser.id 
        });

      if (error) throw error;

      // OPTIMISTIC UPDATE: Langsung update UI tanpa refresh
      setAssignments((prev) =>
        prev.map((asg) =>
          asg.id === assignmentId 
            ? { ...asg, submissions: [] } // Kosongkan array submissions
            : asg
        )
      );

      alert("Pengumpulan berhasil dibatalkan.");
    } catch (error) {
      console.error("Gagal membatalkan pengumpulan:", error.message);
      alert("Terjadi kesalahan: " + error.message);
    }
  };

  const handleLikeDiscussion = async (discussionId) => {
    if (!currentUser) return alert("Silakan login dulu");

    const targetDisc = discussions.find((d) => d.id === discussionId);
    const isCurrentlyLiked = targetDisc?.isLiked;

    // 1. Update UI secara instan (Optimistic)
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id === discussionId
          ? {
              ...d,
              isLiked: !isCurrentlyLiked,
              likesCount: isCurrentlyLiked 
                ? Math.max(0, d.likesCount - 1) 
                : d.likesCount + 1,
            }
          : d
      )
    );

    // 2. Simpan ke Database
    try {
      if (isCurrentlyLiked) {
        // DELETE: Pastikan nama kolom di match sesuai DB
        await supabase
          .from("discussion_likes")
          .delete()
          .match({ 
            discussion_id: discussionId, 
            user_id: currentUser.id 
          });
      } else {
        // INSERT: Gunakan array [] untuk insert
        await supabase
          .from("discussion_likes")
          .insert([
            { 
              discussion_id: discussionId, 
              user_id: currentUser.id 
            }
          ]);
      }
    } catch (err) {
      console.error("Gagal simpan like:", err);
      // Kembalikan ke posisi awal jika gagal total
      fetchAllCourseData(id);
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

  const handleEditReply = async (replyId, newContent) => {
    try {
      if (!replyId) return;

      const { error } = await supabase
        .from("discussion_replies")
        .update({ content: newContent })
        .eq("id", replyId);

      if (error) throw error;

      // REFRESH DATA
      if (id) {
        fetchAllCourseData(id);
      }

    } catch (err) {
      console.error("Gagal edit:", err.message);
    }
  };

    const toggleReplies = (id) => {
      setExpandedDiscussions(prev => ({ ...prev, [id]: !prev[id] }));
    };
  

  const handleAddItem = (type) => {
    alert(`➕ Tambah ${type} (fitur belum dihubungkan ke backend)`);
  };

  const handleDeleteItem = async (type, itemId) => { // Saya ganti namanya jadi itemId agar tidak bingung
    if (window.confirm("Yakin ingin menghapus item ini?")) {
      try {
        const { error } = await supabase
          .from(type) 
          .delete()
          .eq("id", itemId);

        if (error) throw error;

        // PERBAIKAN DI SINI:
        // Gunakan ID kelas (course), bukan ID item yang dihapus
        if (course?.id) {
          await fetchAllCourseData(course.id); 
        }

        alert("✅ Item berhasil dihapus!");
      } catch (err) {
        console.error("Gagal menghapus:", err.message);
        alert("❌ Gagal menghapus item");
      }
    }
  };

  // MATERIAL
  const handleOpenMaterial = async (material) => {
    // 1. Buka materi (window.open atau link)
    window.open(material.file_url || material.link_url, "_blank");

    // 2. Tandai selesai di DB jika belum
    if (!material.completed) {
      const { error } = await supabase
        .from("material_progress")
        .insert({ user_id: currentUser.id, material_id: material.id });

      if (!error) {
        // 3. Update UI secara instan tanpa reload full
        setMaterials(prev => prev.map(m => 
          m.id === material.id ? { ...m, completed: true } : m
        ));
      }
    }
  };

  const handleStartQuiz = async (quiz) => {
    // 1. Cek deadline
    const isPastDeadline = quiz.end_date && new Date() > new Date(quiz.end_date);
    if (isPastDeadline) {
      alert("Maaf, batas waktu pengerjaan kuis ini sudah berakhir.");
      return;
    }

    // 2. Cek limit percobaan menggunakan user_attempts yang sudah dihitung
    const limit = quiz.attempts_limit || 1;
    if (quiz.user_attempts >= limit) {
      alert(`Anda sudah menggunakan semua (${limit}) kesempatan mencoba kuis ini.`);
      return;
    }

    try {
      // 3. Hapus data lama agar tidak terjadi "duplicate key error"
      // Serta memenuhi permintaan: hapus pengerjaan sebelumnya
      await supabase
        .from('quiz_attempts')
        .delete()
        .match({ 
          quiz_id: quiz.id, 
          user_id: currentUser.id 
        });

      // 4. Masukkan data pengerjaan baru (Skor reset ke 0)
      const { error: insertError } = await supabase
        .from('quiz_attempts')
        .insert([
          { 
            quiz_id: quiz.id, 
            user_id: currentUser.id, 
            score: 0 
          }
        ]);

      if (insertError) throw insertError;

      // 5. Buka kuis di tab baru
      window.open(quiz.link, "_blank");

      // 6. Refresh data (Penting agar UI tahu status terbaru)
      await fetchAllCourseData(id); 

    } catch (error) {
      console.error("Gagal memulai kuis:", error.message);
      alert("Terjadi kesalahan teknis. Silakan coba lagi.");
    }
  };

  // Handler untuk membuka modal
  const handleAddDiscussion = () => {
    setItemModalType("discussions");
    setEditingItem(null);
    setShowItemModal(true);
  };

  const handleEditItem = (discussion) => {
    setEditingItem(discussion);
    setItemModalType("discussions");
    setShowItemModal(true);
  };

  // Handler untuk menyimpan diskusi
  const handleSaveDiscussion = async (formData) => {
    if (!currentUser) return false;

    try {
      const discussionData = {
        title: formData.title,
        description: formData.description || formData.content || "",
        course_id: id,
        user_id: currentUser.id,
      };

      // Ganti alert dengan return false saja, atau gunakan state error di modal
      if (!discussionData.description) {
        console.error("Isi diskusi tidak boleh kosong");
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

      // Refresh Data
      await fetchAllCourseData(id); 
      
      // RESET & TUTUP MODAL
      setEditingItem(null);
      if (typeof setShowItemModal === "function") {
        setShowItemModal(false); // Pastikan state ini yang mengontrol tampilan modal Anda
      }

      alert(editingItem ? "✅ Diskusi berhasil diperbarui!" : "✅ Diskusi baru berhasil ditambahkan!");

      return true; 
    } catch (err) {
      console.error("Gagal simpan diskusi:", err.message);
      // Hapus alert di sini agar tidak muncul pop-up localhost
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
                          <div className="flex-grow-1">
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
                          {assignment.score !== null && (
                            <div className="text-end animate__animated animate__fadeIn ms-3">
                              <div className="fw-bold" style={{ fontSize: "2.4rem", color: "#16a34a" }}>
                                {assignment.score}
                              </div>
                              <small className="text-muted d-block" style={{ marginTop: "-5px" }}>Nilai</small>
                            </div>
                          )}
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {assignment.submissions && assignment.submissions.length > 0 ? (
                            (() => {
                              const sub = assignment.submissions[0];
                              const isLate = new Date(sub.submitted_at) > new Date(assignment.deadline);
                              
                              return (
                                <>
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
                                  {assignment.score === null && (
                                    <button 
                                      className="btn btn-outline-danger btn-sm px-3 fw-medium d-flex align-items-center gap-1"
                                      style={{ 
                                        borderRadius: "10px",
                                        transition: "all 0.2s ease"
                                      }}
                                      // HUBUNGKAN KE FUNGSI DI ATAS
                                      onClick={() => handleCancelSubmission(assignment.id)} 
                                      
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#fef2f2";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "transparent";
                                      }}
                                    >
                                      <X size={14} />
                                      Batalkan Pengumpulan
                                    </button>
                                  )}
                                </>
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
                    // PERBAIKAN: Gunakan data yang sudah di-mapping di fetchAllCourseData
                    const isCompleted = quiz.user_attempts > 0;
                    const limitReached = quiz.user_attempts >= (quiz.attempts_limit || 1);
                    const isPastDeadline = quiz.end_date && new Date() > new Date(quiz.end_date);

                    return (
                      <div key={quiz.id} className="card border-0 shadow-sm mb-3" style={{ borderRadius: "16px" }}>
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between">
                            <div className="flex-grow-1">
                              <h5 className="fw-bold mb-2">{quiz.title}</h5>
                              <p className="text-muted mb-3">{quiz.description}</p>
                              
                              <div className="d-flex align-items-center gap-2 small text-muted mb-4">
                                <span className="d-flex align-items-center gap-1"><Clock size={14} /> {quiz.duration}</span>
                                <span className="d-flex align-items-center gap-1"><FileText size={14} /> {quiz.questions} Soal</span>
                                <span className="d-flex align-items-center gap-1"><Calendar size={14} /> Deadline: {quiz.end_date ? new Date(quiz.end_date).toLocaleDateString('id-ID') : '-'}</span>
                                <span className="d-flex align-items-center gap-1">
                                  <Award size={14} /> Percobaan: 
                                  <span className={limitReached ? "text-danger fw-bold" : "text-primary"}>
                                    {quiz.user_attempts}/{quiz.attempts_limit || 1}
                                  </span> x
                                </span>
                              </div>

                              {/* TOMBOL / BADGE - LOGIKA DIPERBAIKI */}
                              <div>
                                {limitReached ? (
                                  /* Kondisi 1: Jatah Habis */
                                  <span className="badge bg-success-subtle text-success px-3 py-2 rounded-2 d-inline-flex align-items-center gap-2 border border-success border-opacity-10">
                                    <CheckCircle size={16} /> Selesai - Nilai: {quiz.score || 0}
                                  </span>
                                ) : isPastDeadline ? (
                                  /* Kondisi 2: Waktu Habis */
                                  isCompleted ? (
                                    <span className="badge bg-success-subtle text-success px-3 py-2 rounded-2 d-inline-flex align-items-center gap-2 border border-success border-opacity-10">
                                      <CheckCircle size={16} /> Selesai - Nilai: {quiz.score || 0}
                                    </span>
                                  ) : (
                                    <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-2 d-inline-flex align-items-center gap-2 border border-danger border-opacity-10">
                                      <Lock size={16} /> Terkunci - Melewati Batas Waktu
                                    </span>
                                  )
                                ) : (
                                  /* Kondisi 3: Masih ada jatah & Belum Deadline */
                                  <button 
                                    className="btn btn-primary px-4 fw-bold"
                                    style={{ borderRadius: "10px", backgroundColor: "#2563eb", border: "none" }}
                                    onClick={() => handleStartQuiz(quiz)}
                                  >
                                    {isCompleted ? "Kerjakan Ulang" : "Mulai Kuis"}
                                  </button>
                                )}
                              </div>
                            </div>

                            {isCompleted && (
                              <div className="text-end d-flex flex-column justify-content-start pt-1">
                                <div className="fw-bold" style={{ fontSize: "2.5rem", color: "#16a34a", lineHeight: "1" }}>
                                  {quiz.score || 0}
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


            {/* DISCUSSIONS TAB */}
            {activeTab === "discussions" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">💬 Forum Diskusi</h5>
                  <button 
                    className="btn btn-primary d-flex align-items-center gap-2" 
                    style={{ borderRadius: "10px", padding: "8px 20px" }} 
                    onClick={handleAddDiscussion}
                  >
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
                  <div className="d-flex flex-column gap-2"> {/* Jarak antar card */}
                    {discussions.map((discussion) => (
                      <DiscussionItem
                        key={discussion.id}
                        discussion={discussion}
                        currentUserId={currentUser?.id}
                        replyContent={replyContent}
                        onLike={handleLikeDiscussion}
                        onReply={handleReplyDiscussion}
                        onReplyChange={(id, value) => setReplyContent({ ...replyContent, [id]: value })}
                        onEdit={handleEditItem}
                        onDelete={() => handleDeleteItem("discussions", discussion.id)}
                        onEditReply={handleEditReply}
                        onDeleteReply={handleDeleteReply}
                      />
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
      {/* Panggil Komponen Modal */}
      <AssignmentModal 
        show={showSubmitModal}
        assignment={selectedAssignment}
        onClose={handleCloseSubmitModal}
        submissionFile={submissionFile}
        setSubmissionFile={setSubmissionFile}
        submissionText={submissionText}
        setSubmissionText={setSubmissionText}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitAssignment}
      />
      
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