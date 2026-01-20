import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Users, BookOpen, FileText, Award, MessageSquare } from "lucide-react";

// Import Components
import CourseHeader from "../components/course/CourseHeader";
import TabNavigation from "../components/course/TabNavigation";
import SectionHeader from "../components/course/SectionHeader";
import EmptyState from "../components/course/EmptyState";
import CourseCard from "../components/course/CourseCard";
import CourseModal from "../components/course/CourseModal";
import SearchFilter from "../components/course/SearchFilter";
import ItemModal from "../components/course/ItemModal";
import MaterialItem from "../components/materials/MaterialItem";
import AssignmentItem from "../components/assignments/AssignmentItem";
import QuizItem from "../components/quizzes/QuizItem";
import DiscussionItem from "../components/discussions/DiscussionItem";
import MemberItem from "../components/members/MemberItem";
import GradingView from "../components/grading/GradingView";

export default function ManageCoursesUI() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("materials");
  const [showDialog, setShowDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    cover_image: ""
  });


  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  // Item Modal States
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemModalType, setItemModalType] = useState("");

  // Grading View States
  const [showGradingView, setShowGradingView] = useState(false);
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState(null);
  
  // Discussion states
  const [likes, setLikes] = useState({});
  const [replyContent, setReplyContent] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);

  // Add Item Modal states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItemData, setNewItemData] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // Quiz
  const [quizMethod, setQuizMethod] = useState("manual");

  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cek apakah ada data kelas yang dikirim dari Dashboard
    if (location.state?.selectedCourse) {
      setSelectedCourse(location.state.selectedCourse);
      
      // Bersihkan state agar saat refresh tidak nyangkut terus (opsional)
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchCourses = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;

      // LANGKAH 1: Ambil keanggotaan pengajar
      const { data: membershipData, error: memError } = await supabase
        .from("course_members")
        .select(`role, courses_id`)
        .eq("user_id", user.id)
        .eq("role", "teacher");

      if (memError) throw memError;
      if (!membershipData || membershipData.length === 0) {
        setCourses([]);
        return;
      }

      const courseIds = membershipData.map(m => m.courses_id).filter(id => id !== undefined);

      // LANGKAH 2: Ambil detail kelas
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, description, subject, class_code, cover_image, created_by")
        .in("id", courseIds);

      if (courseError) throw courseError;

      // LANGKAH 3: Ambil data profil pengajar
      const teacherIds = [...new Set(courseData.map(c => c.created_by))].filter(id => id !== null);
      const { data: profileData, error: profError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", teacherIds);

      if (profError) throw profError;

      // --- LANGKAH BARU (3.5): Ambil Jumlah Siswa ---
      // Kita ambil semua member dari kelas-kelas ini yang rolenya 'student'
      const { data: allMembers, error: memberCountError } = await supabase
        .from("course_members")
        .select("courses_id")
        .in("courses_id", courseIds)
        .eq("role", "student"); // Hanya hitung yang rolenya student

      if (memberCountError) throw memberCountError;

      // LANGKAH 4: Gabungkan data
      const finalData = courseData.map(course => {
        const instructorProfile = profileData?.find(p => p.id === course.created_by);
        
        // Hitung jumlah siswa yang punya courses_id sama dengan course ini
        const studentCount = allMembers?.filter(m => m.courses_id === course.id).length || 0;

        return {
          ...course,
          user_role: "teacher",
          teacher_display_name: instructorProfile?.full_name || "Nama Pengajar",
          students: studentCount // Tambahkan properti students ke objek course
        };
      });

      setCourses(finalData);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenDialog = () => {
    setShowDialog(true);
    setEditingCourse(null);
    setFormData({ title: "", description: "", subject: "", cover_image: "" });
  };

  // Helper untuk buka modal edit kelas
  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      subject: course.subject,
      cover_image: course.cover_image || "",
    });
    setShowDialog(true);
  };


  // 2. Logika Buat & Update Kelas
  const handleSubmit = async (cleanedData) => { // Terima cleanedData dari modal
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Tambahkan loading state jika kamu punya (opsional)
      // setIsSaving(true);

      if (editingCourse) {
        // --- LOGIKA UPDATE ---
        const { error } = await supabase
          .from('courses')
          .update({
            title: cleanedData.title,
            description: cleanedData.description,
            subject: cleanedData.subject,
            cover_image: cleanedData.cover_image // Link https:// dari storage
          })
          .eq('id', editingCourse.id);
        
        if (error) throw error;
        alert("✅ Kelas berhasil diupdate!");
      } else {
        // --- LOGIKA CREATE ---
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const { data: newCourse, error: cErr } = await supabase
          .from('courses')
          .insert([{ 
            title: cleanedData.title,
            description: cleanedData.description,
            subject: cleanedData.subject,
            cover_image: cleanedData.cover_image, // Link https:// dari storage
            class_code: code, 
            created_by: user.id 
          }])
          .select().single();

        if (cErr) throw cErr;

        // Otomatis jadikan pembuat sebagai 'teacher'
        await supabase.from('course_members').insert([{ 
          courses_id: newCourse.id, 
          user_id: user.id, 
          role: 'teacher' 
        }]);
        
        alert(`✅ Kelas dibuat! Kode: ${code}`);
      }

      // Reset State
      setShowDialog(false); // Sesuai nama state di kodemu
      setEditingCourse(null);
      setFormData({ title: "", description: "", subject: "", cover_image: "" });
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      // setIsSaving(false);
    }
  };

  // 4. Logika Hapus Kelas
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus kelas ini?")) return;

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      alert("✅ Kelas berhasil dihapus");
      fetchCourses();
    }
  };

  useEffect(() => {
    if (!selectedCourse) return;

    fetchMaterials();
    fetchAssignments();
    fetchQuizzes();
    fetchMembers();
    if (selectedCourse?.id && activeTab === "discussions") {
    fetchDiscussions();
  }
}, [selectedCourse?.id, activeTab]);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .eq("course_id", selectedCourse.id)
      .order("created_at", { ascending: false });

    if (!error) setMaterials(data);
  };

  const fetchAssignments = async () => {
    try {
      // 1. Ambil data assignment dan hitung jumlah baris di tabel 'submissions'
      const { data, error } = await supabase
        .from("assignments")
        .select(`
          *,
          submissions(count) 
        `)
        .eq("course_id", selectedCourse.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 2. Format data untuk ditampilkan di UI
      const formatted = data.map(asg => ({
        ...asg,
        // Jumlah yang sudah mengumpulkan dari tabel 'submissions'
        submitted: asg.submissions?.[0]?.count || 0,
        
        // Menghitung total siswa dari state 'members' (yang datanya dari 'course_members')
        // Kita cari member yang rolenya 'student' atau 'Siswa' (sesuai hasil format di fetchMembers)
        total: members.filter(m => m.role === 'Siswa' || m.role === 'student').length || 0
      }));

      setAssignments(formatted);
    } catch (err) {
      console.error("Error fetching assignments:", err.message);
    }
  };

  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("course_id", selectedCourse.id)
      .order("created_at", { ascending: false });

    if (!error) setQuizzes(data);
  };

  const fetchMembers = async () => {
    try {
      if (!selectedCourse) return;

      // Pastikan join ke tabel profiles untuk ambil nama
      const { data, error } = await supabase
        .from("course_members")
        .select(`
          id,
          joined_at,
          role,
          profiles:user_id (
            full_name
          )
        `)
        .eq("courses_id", selectedCourse.id);

      if (error) throw error;

      const formattedMembers = data.map(m => {
        const cleanDate = m.joined_at ? m.joined_at.split('.')[0].replace(' ', 'T') : null;

        return {
          id: m.id,
          // Sesuaikan mapping ini dengan MemberItem kamu
          name: m.profiles?.full_name || "Tanpa Nama",
          role: m.role === 'teacher' ? 'Pengajar' : 'Siswa',
          joinDate: new Date(m.joined_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        };
      });

      setMembers(formattedMembers);
    } catch (err) {
      console.error("Error fetching members:", err.message);
    }
  };

  // FUNGSI FETCH DATA
  const fetchDiscussions = async () => {
    try {
      setLoadingDiscussions(true);
      
      // 1. Ambil user login
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      // 2. Query ke database
      const { data, error } = await supabase
        .from("discussions")
        .select(`
          *,
          profiles:user_id(full_name),
          discussion_likes(user_id), 
          allReplies:discussion_replies(
            *,
            profiles:user_id(full_name)
          )
        `)
        .eq("course_id", selectedCourse.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 3. Formatter Data
      const formatted = data.map(d => {
        const userHasLiked = d.discussion_likes?.some(
          (like) => like.user_id === currentUser?.id
        );

        return {
          ...d,
          author: d.profiles?.full_name || "User",
          likesCount: d.discussion_likes?.length || 0,
          isLiked: !!userHasLiked,
          repliesCount: d.allReplies?.length || 0,
          // Pastikan nama properti ini 'allReplies' agar terbaca oleh DiscussionItem.jsx
          allReplies: d.allReplies || []
        };
      });

      setDiscussions(formatted);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoadingDiscussions(false);
    }
  };

  // FUNGSI KIRIM BALASAN
  const handleReplyDiscussion = async (discussionId) => {
    const content = replyContent[discussionId];
    if (!content || !content.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Silakan login dahulu");

    const { error } = await supabase
      .from("discussion_replies")
      .insert([
        { 
          discussion_id: discussionId, 
          content: content, 
          user_id: user.id 
        }
      ]);

    if (!error) {
      setReplyContent(prev => ({ ...prev, [discussionId]: "" }));
      fetchDiscussions(); // Refresh otomatis agar balasan muncul
    } else {
      alert("Gagal membalas: " + error.message);
    }
  };

  const handleDeleteMaterial = async (material) => {
    if (!window.confirm("Yakin hapus materi?")) return;

    if (material.file_path) {
      await supabase.storage
        .from("lms-files")
        .remove([material.file_path]);
    }

    await supabase
      .from("materials")
      .delete()
      .eq("id", material.id);

    fetchMaterials();
  };


  const copyClassCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`✅ Kode kelas ${code} berhasil disalin!`);
  };

  const handleLikeDiscussion = async (discussionId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("Silakan login untuk memberikan like");

      // 1. Cari tahu apakah user sudah like (cek di tabel discussion_likes)
      const { data: existingLike, error: fetchError } = await supabase
        .from("discussion_likes")
        .select("id")
        .eq("discussion_id", discussionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingLike) {
        // --- PROSES UNLIKE ---
        const { error: deleteError } = await supabase
          .from("discussion_likes")
          .delete()
          .eq("id", existingLike.id);

        if (deleteError) throw deleteError;
      } else {
        // --- PROSES LIKE ---
        const { error: insertError } = await supabase
          .from("discussion_likes")
          .insert([{ discussion_id: discussionId, user_id: user.id }]);

        if (insertError) throw insertError;
      }

      // 2. REFRESH DATA (Penting!)
      // Setelah insert/delete berhasil, panggil fetchDiscussions 
      // agar variabel 'isLiked' dan 'likesCount' dihitung ulang oleh database
      await fetchDiscussions();

    } catch (error) {
      console.error("Gagal like:", error.message);
    }
  };

  // --- FUNGSI EDIT BALASAN ---
  const handleEditReply = async (replyId, newContent) => {
    try {
      if (!replyId) return;

      const { error } = await supabase
        .from("discussion_replies")
        .update({ content: newContent })
        .eq("id", replyId);

      if (error) throw error;

      // REFRESH DATA
      // Gunakan fetchDiscussions() karena ini di halaman ManageCourses
      if (selectedCourse?.id) {
        fetchDiscussions(); 
      }

    } catch (err) {
      console.error("Gagal edit:", err.message);
    }
  };

  // --- FUNGSI HAPUS BALASAN ---
  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Hapus balasan ini?")) return;

    try {
      const { error } = await supabase
        .from("discussion_replies")
        .delete()
        .eq("id", replyId);

      if (error) throw error;

      // Refresh data agar UI terupdate
      await fetchDiscussions();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus balasan");
    }
  };

  const handleMemberAction = async (enrollmentId, action) => {
    try {
      let newRole = "";
      if (action === "makeStudent") newRole = "student";
      if (action === "makeTeacher") newRole = "teacher";

      if (action === "remove") {
        const confirm = window.confirm("Keluarkan anggota ini?");
        if (!confirm) return;

        const { error } = await supabase
          .from("course_members")
          .delete()
          .eq("id", enrollmentId);

        if (error) throw error;
      } else {
        // Logic untuk update role
        const newRole = action === "makeStudent" ? "student" : "teacher";
        const { error } = await supabase
          .from("course_members")
          .update({ role: newRole })
          .eq("id", enrollmentId);

        if (error) throw error;
      }

      // Refresh data setelah aksi berhasil
      await fetchMembers();
    } catch (err) {
      alert("Gagal melakukan aksi: " + err.message);
    }
  };

  // Item CRUD Handlers

  const handleAddItem = (type) => {
    setItemModalType(type);
    setEditingItem(null);
    setShowItemModal(true);
  };

  const handleEditItem = (type, item) => {
    setItemModalType(type);
    setEditingItem(item);
    setShowItemModal(true);
  };

  // --- FUNGSI UPLOAD ---
  const uploadFileToSupabase = async ({ file, courseId, type }) => {
    if (!file || !file.name) return null;
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `${type}/${courseId}/${fileName}`;

    const { error } = await supabase.storage.from("lms-files").upload(filePath, file);
    if (error) throw error;

    const { data } = supabase.storage.from("lms-files").getPublicUrl(filePath);
    return { publicUrl: data.publicUrl, path: filePath };
  };

  // --- FUNGSI INSERT/UPDATE ---
  const insertItemByType = async ({ type, payload }) => {
    const tableMap = {
      materials: "materials",
      assignments: "assignments",
      quizzes: "quizzes",
      discussions: "discussions",
    };
    const table = tableMap[type];
    if (!table) throw new Error("Invalid item type");

    const { data, error } = await supabase
      .from(table)
      .upsert(payload)
      .select(type === "discussions" ? "*, profiles:user_id(full_name)" : "*")
      .single();

    if (error) throw error;
    return data;
  };

  // --- HANDLER SAVE ---
  const handleSaveItem = async (dataFromModal) => {
    try {
      if (!dataFromModal?.title?.trim()) return alert("Judul wajib diisi");
      if (!selectedCourse) return alert("Course tidak ditemukan");

      setIsUploading(true);
      const { data: { user } } = await supabase.auth.getUser();

      let uploadedFile = null;
      const needsFile = itemModalType === "materials" || itemModalType === "assignments";
      if (needsFile && dataFromModal.file instanceof File) {
        uploadedFile = await uploadFileToSupabase({
          file: dataFromModal.file,
          courseId: selectedCourse.id,
          type: itemModalType,
        });
      }

      let payload = {
        course_id: selectedCourse.id,
        title: dataFromModal.title,
        description: dataFromModal.description || null,
      };

      if (editingItem?.id) payload.id = editingItem.id;

      if (itemModalType === "discussions") {
        payload.user_id = user.id;
      }
      else if (itemModalType === "materials") {
        let finalType = (dataFromModal.type || "").toLowerCase();
        payload.type = finalType || (dataFromModal.file ? "file" : "link");
        payload.file_url = uploadedFile?.publicUrl || dataFromModal.link_url || dataFromModal.url || dataFromModal.file_url || null;
        payload.file_path = uploadedFile?.path || dataFromModal.file_path || null;
      }
      else if (itemModalType === "assignments") {
        if (!dataFromModal.deadline) throw new Error("Deadline wajib diisi");
        payload.deadline = dataFromModal.deadline;
        payload.file_url = uploadedFile?.publicUrl || dataFromModal.file_url || null;
        payload.file_path = uploadedFile?.path || dataFromModal.file_path || null;
      }
      else if (itemModalType === "quizzes") {
        payload.duration = dataFromModal.duration || null;
        payload.questions_count = parseInt(dataFromModal.questions) || 0;
        payload.start_date = dataFromModal.startDate || null;
        payload.end_date = dataFromModal.endDate || null;
        payload.attempts_limit = parseInt(dataFromModal.attempts) || 1;
        payload.link = dataFromModal.link || null;
        delete payload.file_path;
        delete payload.file_url;
      }

      const savedData = await insertItemByType({ type: itemModalType, payload });

      if (itemModalType === "discussions") {
        await fetchDiscussions(); // Panggil fungsi fetch agar data terbaru muncul
      } else {
        const updateState = (prev) => {
          if (editingItem) return prev.map((item) => (item.id === editingItem.id ? { ...item, ...savedData } : item));
          return [savedData, ...prev];
        };
        if (itemModalType === "materials") setMaterials(updateState);
        if (itemModalType === "assignments") setAssignments(updateState);
        if (itemModalType === "quizzes") setQuizzes(updateState);
      }

      setShowItemModal(false);
      setEditingItem(null);
      alert("✅ Berhasil disimpan");
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal menyimpan");
    } finally {
      setIsUploading(false);
    }
  };

  // --- HANDLER DELETE (PASTIKAN ASYNC DAN TERBUNGKUS BENAR) ---
  const handleDeleteItem = async ({ item, type }) => {
    if (!item || !window.confirm("Yakin ingin menghapus item ini?")) return;
    
    try {
      // Gunakan optional chaining ?. agar tidak error jika property tidak ada
      if (item?.file_path) {
        await supabase.storage.from("lms-files").remove([item.file_path]);
      }

      const tableMap = {
        materials: "materials",
        assignments: "assignments",
        quizzes: "quizzes",
        discussions: "discussions",
      };

      const { error } = await supabase
        .from(tableMap[type])
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      // REFRESH DATA
      if (selectedCourse?.id) {
        // Panggil fungsi fetch yang ada di ManageCourses
        fetchDiscussions(); 
      }

      alert("✅ Berhasil menghapus!");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus: " + err.message);
    }
  };

  const navigate = useNavigate();

  // Grading Handler
  const handleManageGrades = (assignment) => {
    setSelectedAssignmentForGrading(assignment);
    setShowGradingView(true);
  };

  // Filter courses based on search and filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSubject === "" || course.subject === filterSubject;
    return matchesSearch && matchesFilter;
  });

  // Get unique subjects for filter
  const subjects = [...new Set(courses.map(c => c.subject))];

  useEffect(() => {
    // Di ManageCourses, kita menggunakan selectedCourse.id dan fungsi fetchDiscussions
    if (selectedCourse?.id && activeTab === "discussions") {
      fetchDiscussions();
    }
  }, [selectedCourse?.id, activeTab]);

  // GRADING VIEW
  if (showGradingView && selectedAssignmentForGrading) {
    return (
      <GradingView 
        assignment={selectedAssignmentForGrading}
        course={selectedCourse}
        onBack={() => {
          setShowGradingView(false);
          setSelectedAssignmentForGrading(null);
        }} 
      />
    );
  }

  // Main List View
  if (!selectedCourse) {
    return (
      <div className="p-3 p-md-4 p-lg-5">
        {/* HEADER */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h1 className="fw-bold display-6 mb-2">Kelola Kelas</h1>
            <p className="text-muted mb-0">
              Buat dan kelola kelas pembelajaran Anda
            </p>
          </div>

          <button 
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            onClick={handleOpenDialog}
            style={{
              background: "linear-gradient(135deg, #2563eb, #16a34a)",
              border: "none",
              padding: "12px 24px",
              borderRadius: "12px",
              fontWeight: "600",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(37, 99, 235, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <Plus size={20} />
            Buat Kelas Baru
          </button>
        </div>

        {/* SEARCH & FILTER */}
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterSubject={filterSubject}
          onFilterChange={setFilterSubject}
          subjects={subjects}
        />

        {/* COURSE LIST */}
        <div className="row g-4">
          {filteredCourses.length === 0 ? (
            <div className="col-12">
              <div className="text-center text-muted py-5">
                <p className="mb-0">Tidak ada kelas yang ditemukan</p>
              </div>
            </div>
          ) : (
            filteredCourses.map((course, index) => (
              <div className="col-12 col-md-6 col-lg-4" key={`${course.id}-${index}`}>
                <CourseCard
                  course={course}
                  onSelect={setSelectedCourse}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onCopyCode={copyClassCode}
                />
              </div>
            ))
          )}
        </div>

        {/* MODAL CREATE/EDIT */}
        <CourseModal
          show={showDialog}
          editingCourse={editingCourse}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowDialog(false)}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  // Course Detail View
  return (
    <div className="p-3 p-md-4 p-lg-5">
      <CourseHeader 
        course={selectedCourse} 
        onBack={() => setSelectedCourse(null)}
        onCopyCode={copyClassCode}
      />

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
        <div className="card-body p-4">
          {activeTab === "materials" && (
            <>
              <SectionHeader 
                title="Materi Pembelajaran" 
                buttonLabel="Tambah Materi"
                onAdd={() => handleAddItem("materials")}
              />
              {materials.length === 0 ? (
                <EmptyState icon={BookOpen} message="Belum ada materi" />
              ) : (
                <div className="list-group">
                  {materials.map((material) => (
                    <MaterialItem 
                      key={material.id} 
                      material={material}
                      onEdit={() => handleEditItem("materials", material)}
                      onDelete={() => handleDeleteItem({ item: material, type: "materials" })}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "assignments" && (
            <>
              <SectionHeader 
                title="Daftar Tugas" 
                buttonLabel="Tambah Tugas"
                onAdd={() => handleAddItem("assignments")}
              />
              {assignments.length === 0 ? (
                <EmptyState icon={FileText} message="Belum ada tugas" />
              ) : (
                <div className="list-group">
                  {assignments.map((assignment) => (
                    <AssignmentItem 
                      key={assignment.id} 
                      assignment={assignment}
                      onEdit={() => handleEditItem("assignments", assignment)}
                      onDelete={() => handleDeleteItem({ item: assignment, type: "assignments" })}
                      onManageGrades={handleManageGrades}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "quizzes" && (
            <>
              <SectionHeader 
                title="Daftar Kuis" 
                buttonLabel="Tambah Kuis"
                onAdd={() => handleAddItem("quizzes")}
              />
              {quizzes.length === 0 ? (
                <EmptyState icon={Award} message="Belum ada kuis" />
              ) : (
                <div className="list-group">
                  {quizzes.map((quiz) => (
                    <QuizItem 
                      key={quiz.id} 
                      quiz={quiz}
                      onEdit={() => handleEditItem("quizzes", quiz)}
                      onDelete={() => handleDeleteItem({ item: quiz, type: "quizzes" })}
                      onManageGrades={handleManageGrades}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "discussions" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">💬 Forum Diskusi</h5>
                <button 
                  className="btn btn-primary d-flex align-items-center gap-2" 
                  style={{ borderRadius: "10px", padding: "8px 20px" }} 
                  onClick={() => handleAddItem("discussions")} // Pastikan passing type
                >
                  <Plus size={18} /> Buat Diskusi
                </button>
              </div>

              {loadingDiscussions ? (
                <div className="text-center py-5 text-muted">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  Memuat diskusi...
                </div>
              ) : discussions.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                  <MessageSquare size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                  <p className="text-muted mb-0">Belum ada diskusi di kelas ini.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {discussions.map((discussion) => (
                    <DiscussionItem
                      key={discussion.id}
                      discussion={discussion} // Kirim langsung karena sudah diformat di fetch
                      currentUserId={currentUser?.id}
                      replyContent={replyContent}
                      onLike={handleLikeDiscussion}
                      onReply={handleReplyDiscussion}
                      onReplyChange={(id, value) => setReplyContent({ ...replyContent, [id]: value })}
                      onEdit={() => handleEditItem("discussions", discussion)}
                      onDelete={() => handleDeleteItem({ item: discussion, type: "discussions" })}
                      onEditReply={handleEditReply}
                      onDeleteReply={handleDeleteReply}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "members" && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Anggota Kelas</h5>
                <span className="badge bg-primary" style={{ fontSize: "1rem", padding: "8px 16px", borderRadius: "8px" }}>
                  {members.length} Anggota
                </span>
              </div>
              {members.length === 0 ? (
                <EmptyState icon={Users} message="Belum ada anggota" />
              ) : (
                <div className="list-group">
                  {members.map((member) => (
                    <MemberItem 
                      key={member.id}
                      member={member}
                      onMakeStudent={(id) => handleMemberAction(id, "makeStudent")}
                      onMakeTeacher={(id) => handleMemberAction(id, "makeTeacher")} // Tambahkan ini
                      onRemove={(id) => handleMemberAction(id, "remove")}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL CREATE/EDIT ITEM */}
      <ItemModal
        show={showItemModal}
        type={itemModalType}
        editingItem={editingItem}
        onClose={() => setShowItemModal(false)}
        onSave={handleSaveItem}
      />
    </div>
  );
}