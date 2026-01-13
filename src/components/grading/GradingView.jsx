import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from "../../lib/supabase";
import { 
  ArrowLeft, CheckCircle2, XCircle, Award, Clock, Users, 
  Eye, FileText, Download, Calendar, Loader2
} from 'lucide-react';

const GradingView = ({ assignment, onBack }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  useEffect(() => {
    // Gunakan optional chaining (?.) agar tidak error jika assignment null
    if (assignment?.id) {
      fetchGradingData();
    }
  }, [assignment?.id]);

  const fetchGradingData = async () => {
    setLoading(true);
    try {
      // 1. Ambil semua siswa yang terdaftar
      const { data: enrollmentData } = await supabase
        .from('course_members')
        .select(`user_id, profiles (full_name)`)
        .eq('courses_id', assignment.course_id)
        .eq('role', 'student'); // Pastikan hanya role siswa

      const students = enrollmentData?.map(e => ({
        id: e.user_id,
        name: e.profiles?.full_name || 'Tanpa Nama'
      })) || [];
      setAllStudents(students);

      // 2. Ambil data submission (Jawaban Siswa)
      const { data: submissionData } = await supabase
        .from('submissions')
        .select('*, profiles!user_id(full_name)')
        .eq('assignment_id', assignment.id);

      const formattedSubmissions = submissionData?.map(s => {
        // Membandingkan waktu submit dengan deadline dari props assignment
        const isLate = new Date(s.submitted_at) > new Date(assignment.deadline);

        return {
          id: s.id,
          studentId: s.user_id,
          studentName: s.profiles?.full_name || 'Tanpa Nama',
          content: s.content,
          submittedAt: s.submitted_at,
          status: s.grade !== null ? 'sudah_dinilai' : 'belum_dinilai',
          score: s.grade,
          feedback: s.teacher_comment || '',
          fileUrl: s.file_url,
          isLate: isLate 
        };
      }) || [];

      setSubmissions(formattedSubmissions);

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. LOGIKA KALKULASI (Memakai useMemo agar efisien)
  const stats = useMemo(() => {
    const submittedIds = submissions.map(s => s.studentId);
    const notSubmitted = allStudents.filter(s => !submittedIds.includes(s.id));
    const graded = submissions.filter(s => s.score !== null).length;
    
    return {
      total: allStudents.length,
      submittedCount: submissions.length,
      notSubmittedList: notSubmitted,
      gradedCount: graded
    };
  }, [submissions, allStudents]);

  const handleSubmitGrade = async () => {
    if (!score || parseFloat(score) < 0) return alert('Masukkan nilai valid');
    
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          grade: parseFloat(score),
          teacher_comment: feedback,
          graded_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      alert('✅ Nilai berhasil disimpan!');
      setSelectedSubmission(null);
      fetchGradingData(); 
    } catch (err) {
      alert("Gagal update nilai: " + err.message);
    }
  };

  if (loading) return <div className="p-5 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="p-3 p-md-4 p-lg-5">
      <button className="btn btn-outline-secondary mb-4 d-flex align-items-center gap-2" onClick={onBack}>
        <ArrowLeft size={18} /> Kembali
      </button>

      {/* Header */}
      <div className="rounded-3 p-4 p-md-5 text-white mb-4" style={{ background: 'linear-gradient(135deg, #2563eb, #16a34a)' }}>
        <h1 className="fw-bold mb-2">{assignment.title}</h1>
        <p className="mb-3 opacity-90">{assignment.description}</p>
        <div className="d-flex flex-wrap gap-3 small">
          <span className="d-flex align-items-center gap-1"><Calendar size={16} /> Deadline: {new Date(assignment.deadline).toLocaleString('id-ID')}</span>
          <span className="d-flex align-items-center gap-1"><Award size={16} /> Max Score: {assignment.max_score || 100}</span>
        </div>
      </div>

      {/* Statistik */}
      <div className="row g-3 mb-4">
        <StatCard 
          title="Total Siswa" 
          value={allStudents.length} 
          type="blue" 
          icon={<Users />} 
        />
        <StatCard 
          title="Sudah Submit" 
          value={submissions.length} 
          type="green" 
          icon={<CheckCircle2 />} 
        />
        <StatCard 
          title="Belum Submit" 
          value={stats.notSubmittedList.length} 
          type="red" 
          icon={<XCircle />} 
        />
        <StatCard 
          title="Sudah Dinilai" 
          value={stats.gradedCount} 
          type="purple" 
          icon={<Award />} 
        />
      </div>

      {/* Daftar Siswa yang Sudah Mengumpulkan */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
        <div className="card-header bg-white border-0 p-4 pb-0">
          <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <CheckCircle2 size={22} className="text-success" /> Siswa yang Sudah Mengumpulkan
          </h5>
        </div>
        
        <div className="card-body p-4">
          {submissions.length === 0 ? (
            <p className="text-muted">Belum ada pengumpulan.</p>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} className="card border shadow-sm mb-4 p-4" style={{ borderRadius: "16px" }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="fw-bold mb-2">{sub.studentName}</h5>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                      <div className="text-muted small d-flex align-items-center gap-1">
                        <Clock size={14} /> 
                        {new Date(sub.submittedAt).toLocaleString('id-ID', { 
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        }).replace('.', ':')}
                      </div>
                      <span 
                        className={`badge px-2 py-1 ${sub.isLate ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`} 
                        style={{ borderRadius: '6px' }}
                      >
                        {sub.isLate ? 'Terlambat' : 'Tepat Waktu'}
                      </span>
                      {sub.score !== null && (
                        <span className="badge bg-primary-subtle text-primary px-2 py-1" style={{ borderRadius: '6px' }}>
                          Nilai: {sub.score}/100
                        </span>
                      )}
                    </div>
                    <p className="text-secondary mb-3">Jawaban tugas dikumpulkan dalam bentuk PDF.</p>
                    
                    <div className="d-flex gap-2">
                      <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-3">
                        <Eye size={14} /> Lihat
                      </a>
                      <a href={sub.fileUrl} download className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 px-3">
                        <Download size={14} /> Download
                      </a>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
                    style={{ borderRadius: '8px' }}
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setScore(sub.score || '');
                      setFeedback(sub.feedback || '');
                    }}
                  >
                    <Award size={18} /> {sub.score !== null ? 'Edit Nilai' : 'Beri Nilai'}
                  </button>
                </div>

                {/* Box Feedback Guru - Persis seperti di gambar */}
                {sub.feedback && (
                  <div 
                    className="mt-3 p-3" 
                    style={{ 
                      backgroundColor: '#d1e7dd', 
                      borderRadius: '12px',
                      borderLeft: '4px solid #0f5132' 
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span role="img" aria-label="feedback">💬</span>
                      <strong style={{ color: '#0f5132' }}>Feedback Guru</strong>
                    </div>
                    <p className="mb-0 small text-dark">{sub.feedback}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Belum Mengumpulkan */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
        <div className="card-header bg-danger-subtle border-0 p-4">
          <h5 className="mb-0 fw-bold text-danger d-flex align-items-center gap-2">
            <XCircle size={22} /> Belum Mengumpulkan
          </h5>
        </div>
        <div className="card-body p-4">
          <div className="d-flex flex-wrap gap-2">
            {stats.notSubmittedList.length === 0 ? <span className="text-muted">Semua sudah mengumpulkan.</span> : 
              stats.notSubmittedList.map(s => (
                <span key={s.id} className="badge bg-light text-danger border px-3 py-2">{s.name}</span>
              ))
            }
          </div>
        </div>
      </div>

      {/* Modal Input Nilai */}
      {selectedSubmission && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nilai: {selectedSubmission.studentName}</h5>
                <button className="btn-close" onClick={() => setSelectedSubmission(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Skor (0-{assignment.max_score || 100})</label>
                  <input type="number" className="form-control" value={score} onChange={(e) => setScore(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Feedback Guru</label>
                  <textarea className="form-control" value={feedback} onChange={(e) => setFeedback(e.target.value)} rows="3"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedSubmission(null)}>Batal</button>
                <button className="btn btn-primary" onClick={handleSubmitGrade}>Simpan Nilai</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-komponen StatCard
const StatCard = ({ title, value, type, icon }) => {
  const configs = {
    blue: {
      bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
      text: '#2563eb', // text-primary
      iconBg: 'rgba(37, 99, 235, 0.2)'
    },
    green: {
      bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
      text: '#16a34a', // text-success
      iconBg: 'rgba(22, 163, 74, 0.2)'
    },
    red: {
      bg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
      text: '#dc2626', // text-danger
      iconBg: 'rgba(239, 68, 68, 0.2)'
    },
    purple: {
      bg: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
      text: '#9333ea', // purple
      iconBg: 'rgba(147, 51, 234, 0.2)'
    }
  };

  const config = configs[type] || configs.blue;

  return (
    <div className="col-6 col-md-3">
      <div 
        className="card border-0 h-100 shadow-sm" 
        style={{ background: config.bg, borderRadius: '16px' }}
      >
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="small fw-semibold mb-1" style={{ color: config.text }}>{title}</p>
              <h2 className="fw-bold mb-0" style={{ color: config.text }}>{value}</h2>
            </div>
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center" 
              style={{ width: '56px', height: '56px', background: config.iconBg }}
            >
              <div style={{ color: config.text }}>
                {React.cloneElement(icon, { size: 28 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingView;