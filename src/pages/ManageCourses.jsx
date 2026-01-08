import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
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

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return; // Pastikan user.id ada sebelum lanjut

      // LANGKAH 1: Gunakan nama kolom yang konsisten (courses_id sesuai select Anda)
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

      // Ambil ID kelas (Pastikan menggunakan courses_id sesuai hasil select diatas)
      const courseIds = membershipData.map(m => m.courses_id).filter(id => id !== undefined);

      // LANGKAH 2: Ambil detail kelas (Gunakan created_by sebagai ID pengajar)
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, description, subject, class_code, cover_image, created_by")
        .in("id", courseIds);

      if (courseError) throw courseError;

      // LANGKAH 3: Ambil data profil berdasarkan created_by
      const teacherIds = [...new Set(courseData.map(c => c.created_by))].filter(id => id !== null);
      
      const { data: profileData, error: profError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", teacherIds);

      if (profError) throw profError;

      // LANGKAH 4: Gabungkan data
      const finalData = courseData.map(course => {
        const instructorProfile = profileData?.find(p => p.id === course.created_by);
        return {
          ...course,
          user_role: "teacher",
          teacher_display_name: instructorProfile?.full_name || "Nama Pengajar"
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
  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingCourse) {
        // UPDATE
        const { error } = await supabase
          .from('courses')
          .update({
            title: formData.title,
            description: formData.description,
            subject: formData.subject
          })
          .eq('id', editingCourse.id);
        if (error) throw error;
        alert("Kelas berhasil diupdate!");
      } else {
        // CREATE
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { data: newCourse, error: cErr } = await supabase
          .from('courses')
          .insert([{ 
            ...formData, 
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
        
        alert(`Kelas dibuat! Kode: ${code}`);
      }
      setShowDialog(false);
      setFormData({ title: "", description: "", subject: "" });
      fetchCourses();
    } catch (err) {
      alert(err.message);
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
    fetchDiscussions();
  }, [selectedCourse]);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .eq("course_id", selectedCourse.id)
      .order("created_at", { ascending: false });

    if (!error) setMaterials(data);
  };

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("course_id", selectedCourse.id)
      .order("created_at", { ascending: false });

    if (!error) setAssignments(data);
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
    const { data, error } = await supabase
      .from("course_members")
      .select(`
        role,
        profiles (
          id,
          full_name
        )
      `)
      .eq("course_id", selectedCourse.id);

    if (!error) {
      setMembers(
        data.map((m) => ({
          id: m.profiles.id,
          name: m.profiles.full_name,
          role: m.role,
        }))
      );
    }
  };

  const fetchDiscussions = async () => {
    const { data, error } = await supabase
      .from("discussions")
      .select(`
        id,
        title,
        content,
        created_at,
        profiles (
          full_name
        )
      `)
      .eq("course_id", selectedCourse.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setDiscussions(
        data.map((d) => ({
          id: d.id,
          title: d.title,
          author: d.profiles?.full_name || "User",
          date: d.created_at,
          content: d.content,
        }))
      );
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

  const handleLikeDiscussion = (id) => {
    setLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleReplyDiscussion = (id) => {
    const reply = replyContent[id];
    if (!reply || !reply.trim()) return;
    alert(`Komentar dikirim: ${reply}`);
    setReplyContent({ ...replyContent, [id]: "" });
  };

  const handleReplyChange = (id, value) => {
    setReplyContent({ ...replyContent, [id]: value });
  };

  const handleMemberAction = (memberId, action) => {
    const member = members.find(m => m.id === memberId);
    if (action === "remove") {
      if (window.confirm(`Yakin ingin mengeluarkan ${member.name} dari kelas?`)) {
        setMembers(members.filter(m => m.id !== memberId));
        alert(`✅ ${member.name} berhasil dikeluarkan dari kelas!`);
      }
    } else if (action === "makeStudent") {
      setMembers(members.map(m => m.id === memberId ? { ...m, role: "Siswa" } : m));
      alert(`✅ ${member.name} berhasil dijadikan siswa!`);
    } else if (action === "makeTeacher") {
      setMembers(members.map(m => m.id === memberId ? { ...m, role: "Pengajar" } : m));
      alert(`✅ ${member.name} berhasil dijadikan pengajar!`);
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

  //handle upload file
  const uploadFileToSupabase = async ({ file, courseId, type }) => {
    if (!file || !file.name) return null;

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `${type}/${courseId}/${fileName}`;

    const { error } = await supabase.storage
      .from("lms-files")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("lms-files")
      .getPublicUrl(filePath);

    return {
      publicUrl: data.publicUrl,
      path: filePath,
    };
  };

  const insertItemByType = async ({ type, payload }) => {
    const tableMap = {
      materials: "materials",
      assignments: "assignments",
      quizzes: "quizzes",
      discussions: "discussions",
    };

    const table = tableMap[type];
    if (!table) throw new Error("Invalid item type");

    // Gunakan .upsert agar jika payload memiliki 'id', Supabase melakukan UPDATE
    const { data, error } = await supabase
      .from(table)
      .upsert(payload) 
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const handleSaveItem = async (dataFromModal) => {
    try {
      // 1. Validasi Input
      if (!dataFromModal?.title?.trim()) {
        alert("Judul wajib diisi");
        return;
      }

      if (!selectedCourse) {
        alert("Course tidak ditemukan");
        return;
      }

      setIsUploading(true);

      // 2. Upload File jika ada perubahan/file baru
      let uploadedFile = null;
      if (dataFromModal.file instanceof File) {
        uploadedFile = await uploadFileToSupabase({
          file: dataFromModal.file,
          courseId: selectedCourse.id,
          type: itemModalType,
        });
      }

      // 3. Susun Payload (Satu-satunya sumber kebenaran data)
      let payload = {
        course_id: selectedCourse.id,
        title: dataFromModal.title,
        description: dataFromModal.description || null,
        // Gunakan URL baru jika ada upload, jika tidak gunakan URL lama yang sudah ada
        file_url: uploadedFile?.publicUrl || dataFromModal.file_url || null,
        file_path: uploadedFile?.path || dataFromModal.file_path || null,
      };

      // LOGIKA EDIT: Sertakan ID jika sedang mengedit agar tidak membuat data baru
      if (editingItem?.id) {
        payload.id = editingItem.id;
      } else {
        payload.created_at = new Date();
      }

      // Field tambahan berdasarkan tipe
      if (itemModalType === "materials") {
        payload.type = dataFromModal.type || "file";
      }
      if (itemModalType === "assignments") {
        if (!dataFromModal.deadline) {
          alert("Deadline wajib diisi");
          setIsUploading(false); // Reset loading jika gagal validasi
          return;
        }
        payload.deadline = dataFromModal.deadline;
      }

      if (itemModalType === "quizzes") {
        payload = {
          ...payload,
          duration: dataFromModal.duration || null,
          questions_count: parseInt(dataFromModal.questions) || 0,
          start_date: dataFromModal.startDate || null,
          end_date: dataFromModal.endDate || null,
          passing_grade: parseInt(dataFromModal.passingGrade) || 0,
          attempts_limit: parseInt(dataFromModal.attempts) || 1,
          quiz_type: dataFromModal.quizType || null,
          randomize: dataFromModal.randomize || false,
          show_results: dataFromModal.showResults || false
        };
      }

      if (itemModalType === "quizzes" && dataFromModal.startDate && dataFromModal.endDate) {
        if (new Date(dataFromModal.startDate) >= new Date(dataFromModal.endDate)) {
          alert("Tanggal selesai harus setelah tanggal mulai!");
          return;
        }
      }

      // 4. Proses Simpan (Cukup panggil fungsi helper ini saja)
      // Fungsi helper ini sudah diperbaiki di bawah (poin B)
      const savedData = await insertItemByType({
        type: itemModalType,
        payload,
      });

      // 5. Update UI (Cegah Duplikasi tampilan)
      const updateState = (prev) => {
        if (editingItem) {
          // Ganti data lama dengan data baru yang sudah di-update
          return prev.map((item) => (item.id === editingItem.id ? savedData : item));
        }
        // Tambah data baru ke atas daftar
        return [savedData, ...prev];
      };

      if (itemModalType === "materials") setMaterials(updateState);
      if (itemModalType === "assignments") setAssignments(updateState);
      if (itemModalType === "quizzes") setQuizzes(updateState);
      if (itemModalType === "discussions") setDiscussions(updateState);

      // 6. Reset UI
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

  const handleDeleteItem = async ({ item, type }) => {
    if (!window.confirm("Yakin ingin menghapus item ini?")) return;

    try {
      // DELETE STORAGE (JIKA ADA FILE)
      if (item.file_path) {
        const { error: storageError } = await supabase.storage
          .from("lms-files")
          .remove([item.file_path]);

        if (storageError) {
          console.error(storageError);
          alert("Gagal menghapus file");
          return;
        }
      }
      
      if (item?.file_path) { 
        await supabase.storage.from("lms-files").remove([item.file_path]);
      }

      // DELETE DATABASE
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

      // UPDATE UI
      if (type === "materials") setMaterials(p => p.filter(i => i.id !== item.id));
      if (type === "assignments") setAssignments(p => p.filter(i => i.id !== item.id));
      if (type === "quizzes") setQuizzes(p => p.filter(i => i.id !== item.id));
      if (type === "discussions") setDiscussions(p => p.filter(i => i.id !== item.id));

      alert("✅ Item berhasil dihapus");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus item");
    }
  };

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
    // Auto select first course is removed for list view
  }, []);

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
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "discussions" && (
            <>
              <SectionHeader 
                title="Forum Diskusi" 
                buttonLabel="Buat Diskusi"
                onAdd={() => handleAddItem("discussions")}
              />
              {discussions.length === 0 ? (
                <EmptyState icon={MessageSquare} message="Belum ada diskusi" />
              ) : (
                <div className="d-flex flex-column gap-4">
                  {discussions.map((discussion) => (
                    <DiscussionItem 
                      key={discussion.id}
                      discussion={discussion}
                      likes={likes}
                      replyContent={replyContent}
                      onLike={handleLikeDiscussion}
                      onReply={handleReplyDiscussion}
                      onReplyChange={handleReplyChange}
                      onEdit={() => handleEditItem("discussions", discussion)}
                      onDelete={() => handleDeleteItem({ item: discussion, type: "discussions" })}
                    />
                  ))}
                </div>
              )}
            </>
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
                      onMakeStudent={() => handleMemberAction(member.id, "makeStudent")}
                      onRemove={() => handleMemberAction(member.id, "remove")}
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