import React, { useState, useEffect } from 'react';
import { supabase } from "../../lib/supabase";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Clock, 
  Users, 
  Eye,
  FileText,
  Calendar
} from 'lucide-react';

const GradingView = ({ assignment, onBack }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  // State Dinamis
  const [submissions, setSubmissions] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  useEffect(() => {
    fetchGradingData();
  }, [assignment.id]);

  const fetchGradingData = async () => {
    setLoading(true);
    try {
      // 1. Ambil semua siswa yang terdaftar di kursus ini
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select(`
          user_id,
          profiles (full_name)
        `)
        .eq('course_id', assignment.course_id);

      const students = enrollmentData?.map(e => ({
        id: e.user_id,
        name: e.profiles?.full_name || 'Tanpa Nama'
      })) || [];
      setAllStudents(students);

      // 2. Ambil data submission (jawaban)
      const { data: submissionData } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('assignment_id', assignment.id);

      const formattedSubmissions = submissionData?.map(s => ({
        id: s.id,
        studentId: s.user_id,
        studentName: s.profiles?.full_name || 'Tanpa Nama',
        content: s.content,
        submittedAt: new Date(s.created_at).toLocaleString('id-ID'),
        status: s.score !== null ? 'sudah_dinilai' : 'belum_dinilai',
        score: s.score,
        feedback: s.feedback || '',
        fileUrl: s.file_url
      })) || [];
      setSubmissions(formattedSubmissions);

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Logika Kalkulasi (Sesuai tampilan Anda)
  const submittedStudentIds = submissions.map(s => s.studentId);
  const studentsNotSubmitted = allStudents.filter(s => !submittedStudentIds.includes(s.id));
  const gradedCount = submissions.filter(s => s.status === 'sudah_dinilai').length;

  const handleGrade = (submission) => {
    setSelectedSubmission(submission);
    setScore(submission.score?.toString() || '');
    setFeedback(submission.feedback || '');
  };

  const handleSubmitGrade = async () => {
    if (!score || parseFloat(score) < 0) {
      alert('Mohon masukkan nilai yang valid');
      return;
    }

    const numScore = parseFloat(score);
    if (numScore > (assignment.maxScore || 100)) {
      alert(`Nilai tidak boleh lebih dari ${assignment.maxScore || 100}`);
      return;
    }

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          score: numScore,
          feedback: feedback,
          graded_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      alert('✅ Nilai berhasil diberikan!');
      setSelectedSubmission(null);
      fetchGradingData(); // Refresh data agar statistik & bar update
    } catch (err) {
      alert("Gagal update nilai: " + err.message);
    }
  };

  if (loading) return <div className="p-5 text-center">Memuat data penilaian...</div>;

  return (
    <div className="p-3 p-md-4 p-lg-5">
      {/* Back Button */}
      <button
        className="btn btn-outline-secondary mb-4 d-flex align-items-center gap-2"
        onClick={onBack}
        style={{ borderRadius: '10px' }}
      >
        <ArrowLeft size={18} />
        Kembali
      </button>

      {/* Assignment Header */}
      <div 
        className="rounded-3 p-4 p-md-5 text-white mb-4"
        style={{
          background: 'linear-gradient(135deg, #2563eb, #16a34a)',
          boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)'
        }}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <span 
              className="badge mb-3"
              style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                padding: '6px 14px',
                fontSize: '0.85rem'
              }}
            >
              Matematika
            </span>
            <h1 className="fw-bold mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
              {assignment.title}
            </h1>
            <p className="mb-3 opacity-90">{assignment.description || 'Kerjakan soal-soal berikut dengan teliti'}</p>
            <div className="d-flex flex-wrap gap-3 small">
              <span className="d-flex align-items-center gap-1">
                <Calendar size={16} />
                Deadline: {assignment.deadline}
              </span>
              <span>•</span>
              <span className="d-flex align-items-center gap-1">
                <Award size={16} />
                Nilai Maksimal: {assignment.maxScore || 100}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 h-100" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', borderRadius: '16px' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="small text-primary fw-semibold mb-1">Total Siswa</p>
                  <h2 className="fw-bold text-primary mb-0">{allStudents.length}</h2>
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', background: 'rgba(37, 99, 235, 0.2)' }}>
                  <Users className="text-primary" size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 h-100" style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', borderRadius: '16px' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="small text-success fw-semibold mb-1">Sudah Submit</p>
                  <h2 className="fw-bold text-success mb-0">{submissions.length}</h2>
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', background: 'rgba(22, 163, 74, 0.2)' }}>
                  <CheckCircle2 className="text-success" size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 h-100" style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)', borderRadius: '16px' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="small text-danger fw-semibold mb-1">Belum Submit</p>
                  <h2 className="fw-bold text-danger mb-0">{studentsNotSubmitted.length}</h2>
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', background: 'rgba(239, 68, 68, 0.2)' }}>
                  <XCircle className="text-danger" size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 h-100" style={{ background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', borderRadius: '16px' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="small text-purple fw-semibold mb-1" style={{ color: '#9333ea' }}>Sudah Dinilai</p>
                  <h2 className="fw-bold mb-0" style={{ color: '#9333ea' }}>{gradedCount}</h2>
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', background: 'rgba(147, 51, 234, 0.2)' }}>
                  <Award style={{ color: '#9333ea' }} size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List Submissions & Not Submitted - (Tampilan tetap sama seperti kode Anda) */}
      {/* ... bagian render submissions mapping ... */}
      {/* ... bagian render studentsNotSubmitted mapping ... */}

      {/* Modal - (Tampilan tetap sama, handleSubmitGrade sekarang memanggil Supabase) */}
      {/* ... bagian modal code ... */}
    </div>
  );
};

export default GradingView;