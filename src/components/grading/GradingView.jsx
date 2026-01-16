import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from "../../lib/supabase";
import { 
  ArrowLeft, CheckCircle2, XCircle, Award, Clock, Users, 
  Eye, Download, Calendar, Loader2
} from 'lucide-react';

const GradingView = ({ assignment, onBack, type }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  const isQuiz = type === 'quiz' || !!assignment?.max_attempts;

  // Tentukan tipe secara internal jika props tidak terkirim
  const currentType = type || (assignment?.max_attempts ? 'quiz' : 'assignment');

  useEffect(() => {
    if (assignment?.id) {
      fetchGradingData();
    }
  }, [assignment?.id, currentType]);

  const fetchGradingData = async () => {
    setLoading(true);
    try {
      // 1. Ambil Data Siswa (Tetap)
      const { data: enrollmentData } = await supabase
        .from('course_members')
        .select(`user_id, profiles (full_name)`)
        .eq('courses_id', assignment.course_id)
        .eq('role', 'student');

      const studentNames = {};
      const studentsList = (enrollmentData || []).map(e => {
        studentNames[e.user_id] = e.profiles?.full_name || 'Tanpa Nama';
        return { id: e.user_id, name: e.profiles?.full_name || 'Tanpa Nama' };
      });
      setAllStudents(studentsList);

      // 2. LOGIKA SWITCHER (Pintu Gerbang)
      // Jika props 'type' tidak ada, kita paksa cek apakah ID ini ada di quiz_attempts
      let isQuiz = type === 'quiz';
      
      // Jika masih ragu, lakukan pengecekan manual ke tabel kuis
      if (!type) {
          const { count } = await supabase
            .from('quizzes')
            .select('*', { count: 'exact', head: true })
            .eq('id', assignment.id);
          isQuiz = count > 0;
      }

      const targetTable = isQuiz ? 'quiz_attempts' : 'submissions';
      const foreignKey = isQuiz ? 'quiz_id' : 'assignment_id';

      console.log(`--- SISTEM BERHASIL MENDETEKSI ---`);
      console.log(`Tipe: ${isQuiz ? 'KUIS' : 'TUGAS'}`);
      console.log(`Mencari di tabel: ${targetTable} kolom: ${foreignKey}`);

      // 3. Ambil Data Pengerjaan
      const { data: resultData, error: dbError } = await supabase
        .from(targetTable)
        .select('*')
        .eq(foreignKey, assignment.id);

      if (dbError) throw dbError;

      // 4. Mapping (Sesuaikan nama kolom masing-masing tabel)
      const formatted = (resultData || []).map(item => {
        return {
          id: item.id,
          studentId: item.user_id,
          studentName: studentNames[item.user_id] || 'Siswa Luar Kursus',
          // Kuis biasanya pakai score, Tugas pakai grade
          score: isQuiz ? item.score : item.grade, 
          // Kuis biasanya pakai created_at, Tugas pakai submitted_at
          submittedAt: isQuiz ? (item.created_at || item.start_at) : item.submitted_at,
          feedback: item.teacher_comment || '',
          fileUrl: item.file_url || null,
          isLate: assignment.deadline && (item.created_at || item.submitted_at)
            ? new Date(item.created_at || item.submitted_at) > new Date(assignment.deadline)
            : false,
          originTable: isQuiz ? 'quiz_attempts' : 'submissions',
            isLate: assignment.deadline && (item.created_at || item.submitted_at)
              ? new Date(item.created_at || item.submitted_at) > new Date(assignment.deadline)
              : false
        };
      });

      setSubmissions(formatted);

    } catch (err) {
      console.error("Gagal Fetch:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const submittedIds = submissions.map(s => s.studentId);
    const notSubmitted = allStudents.filter(s => !submittedIds.includes(s.id));
    const graded = submissions.filter(s => s.score !== null && s.score !== undefined).length;
    
    return {
      total: allStudents.length,
      submittedCount: submissions.length,
      notSubmittedList: notSubmitted,
      gradedCount: graded
    };
  }, [submissions, allStudents]);

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return;

    const targetTable = selectedSubmission.originTable;
    const scoreField = targetTable === 'quiz_attempts' ? 'score' : 'grade';

    try {
      setLoading(true);

      // Pastikan nilai dikonversi ke Float (Number)
      const finalScore = parseFloat(score);

      console.log("--- DEBUG UPDATE ---");
      console.log("Target Table:", targetTable);
      console.log("Update Column:", scoreField);
      console.log("Target ID:", selectedSubmission.id);
      console.log("Value to Send:", finalScore);

      const { data, error, status } = await supabase
        .from(targetTable)
        .update({ [scoreField]: finalScore })
        .eq('id', selectedSubmission.id)
        .select(); // Penting untuk melihat feedback dari DB

      if (error) {
        console.error("DB Error:", error);
        alert(`Gagal DB: ${error.message}`);
        return;
      }

      // Jika data kosong, berarti ID tidak ditemukan atau terhalang RLS
      if (!data || data.length === 0) {
        console.warn("Update Berhasil secara HTTP, tapi 0 baris berubah (RLS atau ID Salah)");
        alert("⚠️ Gagal: Data tidak terupdate di database. Periksa izin akses (RLS) pada tabel quiz_attempts.");
      } else {
        console.log("HASIL UPDATE:", data);
        alert('✅ Nilai Berhasil Ditambahkan!');
        setSelectedSubmission(null);
        fetchGradingData(); // Refresh tampilan
      }

    } catch (err) {
      console.error("System Error:", err);
      alert("Error Sistem: " + err.message);
    } finally {
      setLoading(false);
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
          <span className="d-flex align-items-center gap-1"><Calendar size={16} /> Deadline: {assignment.deadline ? new Date(assignment.deadline).toLocaleString('id-ID') : '-'}</span>
          <span className="d-flex align-items-center gap-1"><Award size={16} /> Max Score: {assignment.max_score || 100}</span>
        </div>
      </div>

      {/* Statistik */}
      <div className="row g-3 mb-4">
        <StatCard title="Total Siswa" value={stats.total} type="blue" icon={<Users />} />
        <StatCard 
          title={currentType === 'quiz' ? "Sudah Mengerjakan" : "Sudah Submit"} 
          value={stats.submittedCount} 
          type="green" 
          icon={<CheckCircle2 />} 
        />
        <StatCard 
          title={currentType === 'quiz' ? "Belum Mengerjakan" : "Belum Submit"} 
          value={stats.notSubmittedList.length} 
          type="red" 
          icon={<XCircle />} 
        />
        <StatCard title="Sudah Dinilai" value={stats.gradedCount} type="purple" icon={<Award />} />
      </div>

      {/* Daftar Pengumpulan */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
        <div className="card-header bg-white border-0 p-4 pb-0">
          <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <CheckCircle2 size={22} className="text-success" /> 
            {currentType === 'quiz' ? 'Hasil Pengerjaan Siswa' : 'Siswa yang Sudah Mengumpulkan'}
          </h5>
        </div>
        
        <div className="card-body p-4">
          {submissions.length === 0 ? (
            <p className="text-muted text-center py-4">Belum ada data pengerjaan.</p>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} className="card border shadow-sm mb-4 p-4" style={{ borderRadius: "16px" }}>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                  <div className="flex-grow-1">
                    <h5 className="fw-bold mb-2">{sub.studentName}</h5>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                      <div className="text-muted small d-flex align-items-center gap-1">
                        <Clock size={14} /> 
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('id-ID') : 'Waktu tidak tercatat'}
                      </div>
                      
                      <span className={`badge px-2 py-1 ${sub.isLate ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                        {sub.isLate ? 'Terlambat' : 'Tepat Waktu'}
                      </span>

                      {/* PERBAIKAN DI SINI: Menggunakan pengecekan yang lebih aman terhadap angka 0 dan undefined */}
                      {(sub.score !== null && sub.score !== undefined) && (
                        <span className="badge bg-primary-subtle text-primary px-2 py-1">
                          Nilai: {sub.score} / {assignment.max_score || 100}
                        </span>
                      )}
                    </div>

                    {/* Konten Berdasarkan Tipe */}
                    {currentType === 'assignment' ? (
                      <div className="mb-2">
                        <p className="text-secondary mb-2 small">Bukti File:</p>
                        {sub.fileUrl ? (
                          <div className="d-flex gap-2">
                            <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
                              <Eye size={14} /> Lihat
                            </a>
                            <a href={sub.fileUrl} download className="btn btn-sm btn-outline-success d-flex align-items-center gap-1">
                              <Download size={14} /> Download
                            </a>
                          </div>
                        ) : (
                          <span className="text-danger small italic">Tidak ada file dikirim</span>
                        )}
                      </div>
                    ) : (
                      <div className="bg-light p-2 rounded-3 mb-2 border">
                        <p className="text-muted small mb-0 italic">
                          ℹ️ Siswa mengerjakan via link eksternal. Skor dicatat secara otomatis/manual.
                        </p>
                      </div>
                    )}
                  </div>

                  <button 
                    className="btn btn-primary d-flex align-items-center gap-2 px-3"
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setScore(sub.score || '');
                      setFeedback(sub.feedback || '');
                    }}
                  >
                    <Award size={18} /> {sub.score !== null ? 'Edit Nilai' : 'Beri Nilai'}
                  </button>
                </div>

                {sub.feedback && (
                  <div className="mt-3 p-3 bg-success-subtle border-start border-success border-4 rounded-3">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span role="img" aria-label="feedback">💬</span>
                      <strong className="text-success">Feedback Guru</strong>
                    </div>
                    <p className="mb-0 small text-dark">{sub.feedback}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Daftar Siswa Belum Mengerjakan */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
        <div className="card-header bg-danger-subtle border-0 p-4">
          <h5 className="mb-0 fw-bold text-danger d-flex align-items-center gap-2">
            <XCircle size={22} /> {currentType === 'quiz' ? 'Belum Mengerjakan' : 'Belum Mengumpulkan'}
          </h5>
        </div>
        <div className="card-body p-4">
          <div className="d-flex flex-wrap gap-2">
            {stats.notSubmittedList.length === 0 ? (
              <span className="text-muted">Semua siswa sudah berpartisipasi.</span>
            ) : (
              stats.notSubmittedList.map(s => (
                <span key={s.id} className="badge bg-light text-danger border px-3 py-2">{s.name}</span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Input Nilai */}
      {selectedSubmission && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Nilai: {selectedSubmission.studentName}</h5>
                <button className="btn-close" onClick={() => setSelectedSubmission(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Skor ({selectedSubmission.originTable === 'quiz_attempts' ? 'Kuis' : 'Tugas'})
                  </label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={score} 
                    onChange={(e) => setScore(e.target.value)} 
                  />
                </div>

                {/* Feedback HANYA muncul jika bukan kuis */}
                {selectedSubmission.originTable !== 'quiz_attempts' && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Feedback Guru</label>
                    <textarea 
                      className="form-control" 
                      value={feedback} 
                      onChange={(e) => setFeedback(e.target.value)} 
                      rows="3"
                    ></textarea>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light" onClick={() => setSelectedSubmission(null)}>Batal</button>
                <button className="btn btn-primary px-4" onClick={handleSubmitGrade}>Simpan Nilai</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-komponen StatCard (Sama seperti sebelumnya)
const StatCard = ({ title, value, type, icon }) => {
  const configs = {
    blue: { bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', text: '#2563eb', iconBg: 'rgba(37, 99, 235, 0.2)' },
    green: { bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', text: '#16a34a', iconBg: 'rgba(22, 163, 74, 0.2)' },
    red: { bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', text: '#dc2626', iconBg: 'rgba(239, 68, 68, 0.2)' },
    purple: { bg: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', text: '#9333ea', iconBg: 'rgba(147, 51, 234, 0.2)' }
  };
  const config = configs[type] || configs.blue;
  return (
    <div className="col-6 col-md-3">
      <div className="card border-0 h-100 shadow-sm" style={{ background: config.bg, borderRadius: '16px' }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="small fw-semibold mb-1" style={{ color: config.text }}>{title}</p>
              <h2 className="fw-bold mb-0" style={{ color: config.text }}>{value}</h2>
            </div>
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', background: config.iconBg }}>
              <div style={{ color: config.text }}>{React.cloneElement(icon, { size: 24 })}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingView;