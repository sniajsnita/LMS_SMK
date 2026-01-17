import React, { useEffect, useState } from "react";
import { Calendar, BookOpen, Award, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import GradingView from "../components/grading/GradingView";
import AssignmentModal from "../components/course/AssignmentModal";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // STATE UNTUK KONTROL VIEW (Sesuai manageCourse)
  const [showGradingView, setShowGradingView] = useState(false);
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState(null);
  
  // State untuk Modal Pengumpulan Tugas (Siswa)
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionText, setSubmissionText] = useState("");

  useEffect(() => {
    fetchEverything();
  }, []);

  const fetchEverything = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Ambil membership untuk deteksi role otomatis
      const { data: memberships } = await supabase
        .from("course_members")
        .select("courses_id, role")
        .eq("user_id", user.id);

      const courseIds = memberships?.map(m => m.courses_id) || [];
      const roleMap = memberships?.reduce((acc, curr) => {
        acc[curr.courses_id] = curr.role;
        return acc;
      }, {}) || {};

      // 2. Ambil data tugas & submission
      const [asgRes, subRes] = await Promise.all([
        supabase.from("assignments").select(`*, courses:course_id(title)`).in("course_id", courseIds),
        supabase.from("submissions").select("*").eq("user_id", user.id)
      ]);

      const finalData = (asgRes.data || []).map(asg => {
        const myRole = roleMap[asg.course_id];
        const isTeacher = myRole === 'teacher' || myRole === 'instructor';
        const mySub = subRes.data?.find(s => s.assignment_id === asg.id);
        
        let status = "pending";
        if (mySub) {
          status = mySub.grade !== null ? "graded" : "submitted";
        }

        return {
          ...asg,
          course: asg.courses?.title || "Kelas Tidak Diketahui",
          status: status,
          isTeacher: isTeacher,
          dueDate: asg.deadline ? new Date(asg.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"
        };
      });

      setAssignments(finalData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI SESUAI MANAGE COURSE
  const handleManageGrades = (assignment) => {
    setSelectedAssignmentForGrading(assignment);
    setShowGradingView(true);
  };

  const renderBadge = (status) => {
    switch (status) {
      case "pending": return <span className="badge bg-warning text-dark">Belum Dikerjakan</span>;
      case "submitted": return <span className="badge bg-info">Menunggu Penilaian</span>;
      case "graded": return <span className="badge bg-success">Sudah Dinilai</span>;
      default: return null;
    }
  };

  // TAMPILAN GRADING VIEW
  if (showGradingView && selectedAssignmentForGrading) {
    return (
      <GradingView 
        assignment={selectedAssignmentForGrading} // Mengirim objek tugas (id, course_id, dll)
        onBack={() => {
          setShowGradingView(false);
          setSelectedAssignmentForGrading(null);
          fetchEverything(); // Refresh daftar agar nilai terbaru muncul
        }} 
        // type="assignment" // Opsional, karena kode Anda sudah punya auto-detect
      />
    );
  }

  const handleOpenSubmit = (asg) => {
    setSelectedAssignment(asg);
    setShowSubmitModal(true);
  };

  const handleSubmitAssignment = async () => {
    if (!submissionFile) return alert("Pilih file dulu!");

    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Upload ke Storage
      const fileExt = submissionFile.name.split('.').pop();
      const filePath = `submissions/${selectedAssignment.id}/${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('lms-files')
        .upload(filePath, submissionFile);

      if (uploadError) throw uploadError;

      // 2. Ambil URL & Simpan ke Tabel Submissions
      const { data: { publicUrl } } = supabase.storage.from('lms-files').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('submissions').insert([{
        assignment_id: selectedAssignment.id,
        user_id: user.id,
        file_url: publicUrl,
        notes: submissionText
      }]);

      if (dbError) throw dbError;

      alert("Tugas berhasil dikirim!");
      setShowSubmitModal(false);
      setSubmissionFile(null);
      setSubmissionText("");
      fetchEverything(); // Refresh status badge di list
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold">📚 Tugas Saya</h2>
        <p className="text-muted">Daftar tugas dari semua mata pelajaran</p>
      </div>

      <div className="row g-3">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          assignments.map((item) => (
            <div key={item.id} className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="fw-bold mb-1">{item.title}</h5>
                      <span className="badge bg-light text-dark">
                        <BookOpen size={14} className="me-1" />
                        {item.course}
                      </span>
                    </div>
                    {/* Badge status hanya untuk siswa, guru otomatis mode pengajar */}
                    {item.isTeacher ? <span className="badge bg-primary">Mode Pengajar</span> : renderBadge(item.status)}
                  </div>

                  <p className="text-muted small mb-3">{item.description}</p>

                  <div className="d-flex flex-wrap gap-4 small text-muted">
                    <div><Calendar size={14} className="me-1" /> Deadline: {item.dueDate}</div>
                    <div><Award size={14} className="me-1" /> Max: {item.max_score || 100} poin</div>
                  </div>

                  <div className="mt-3">
                    {item.isTeacher ? (
                      /* TOMBOL GURU */
                      <button 
                        className="btn btn-success btn-sm px-3"
                        onClick={() => handleManageGrades(item)}
                      >
                        <Award size={14} className="me-1" /> Kelola Nilai
                      </button>
                    ) : (
                      /* TOMBOL SISWA */
                      <>
                        {item.status === "pending" && (
                        <button 
                          className="btn btn-primary btn-sm px-4 shadow-sm"
                          style={{ borderRadius: '8px' }}
                          onClick={() => handleOpenSubmit(item)} // SEKARANG MANGGIL MODAL, BUKAN NAVIGATE
                        >
                          <Clock size={14} className="me-1" /> Kerjakan Tugas
                        </button>
                      )}
                        {item.status === "submitted" && (
                          <span className="text-info small">
                            <CheckCircle size={14} className="me-1" /> Tugas sudah dikumpulkan
                          </span>
                        )}
                        {item.status === "graded" && (
                          <span className="text-success small">
                            <Award size={14} className="me-1" /> Tugas sudah dinilai
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <AssignmentModal 
        show={showSubmitModal}
        assignment={selectedAssignment}
        onClose={() => setShowSubmitModal(false)}
        submissionFile={submissionFile}
        setSubmissionFile={setSubmissionFile}
        submissionText={submissionText}
        setSubmissionText={setSubmissionText}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitAssignment}
      />
    </div>
  );
}