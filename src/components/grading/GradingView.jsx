import React, { useState, useEffect, useMemo } from 'react';
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
  Calendar,
  Lock,
  Loader2
} from 'lucide-react';

const GradingView = ({ assignment, onBack, currentUser }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);

  // State Dinamis
  const [submissions, setSubmissions] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    fetchGradingData();
  }, [assignment.id]);

  const fetchGradingData = async () => {
    setLoading(true);
    try {
      // 1. Ambil data course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', assignment.course_id)
        .single();
      setCourse(courseData);

      // 2. Ambil semua siswa yang terdaftar di kursus ini
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('course_id', assignment.course_id);

      setEnrollments(enrollmentData || []);

      const students = enrollmentData?.map(e => ({
        id: e.user_id,
        name: e.profiles?.full_name || 'Tanpa Nama',
        role: e.role,
        parent_of_student_id: e.parent_of_student_id
      })) || [];
      setAllStudents(students);

      // 3. Ambil data submission (jawaban)
      const { data: submissionData } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('assignment_id', assignment.id)
        .order('created_at', { ascending: false });

      const formattedSubmissions = submissionData?.map(s => ({
        id: s.id,
        studentId: s.user_id,
        studentName: s.profiles?.full_name || 'Tanpa Nama',
        content: s.content,
        submittedAt: s.submitted_at || s.created_at,
        status: s.score !== null ? 'sudah_dinilai' : 'belum_dinilai',
        score: s.score,
        feedback: s.feedback || '',
        fileUrl: s.file_url,
        gradedAt: s.graded_at,
        gradedBy: s.graded_by
      })) || [];
      setSubmissions(formattedSubmissions);

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate access permissions
  const myEnrollment = useMemo(() => {
    return enrollments.find(e => e.user_id === currentUser?.id);
  }, [enrollments, currentUser?.id]);

  const isTeacher = useMemo(() => {
    return course?.teacher_id === currentUser?.id;
  }, [course?.teacher_id, currentUser?.id]);

  const isCoTeacher = useMemo(() => {
    return myEnrollment?.role === 'co_teacher';
  }, [myEnrollment?.role]);

  const isParent = useMemo(() => {
    return myEnrollment?.role === 'parent';
  }, [myEnrollment?.role]);

  const canManage = useMemo(() => {
    return isTeacher || isCoTeacher;
  }, [isTeacher, isCoTeacher]);

  const canViewAsParent = useMemo(() => {
    return isParent;
  }, [isParent]);

  const hasAccess = useMemo(() => {
    return canManage || canViewAsParent;
  }, [canManage, canViewAsParent]);

  const canGrade = useMemo(() => {
    return canManage && !isParent;
  }, [canManage, isParent]);

  // Filter data based on role
  const visibleSubmissions = useMemo(() => {
    if (isParent && myEnrollment?.parent_of_student_id) {
      return submissions.filter(s => s.studentId === myEnrollment.parent_of_student_id);
    }
    return submissions;
  }, [isParent, myEnrollment?.parent_of_student_id, submissions]);

  const visibleEnrollments = useMemo(() => {
    if (isParent && myEnrollment?.parent_of_student_id) {
      return enrollments.filter(e => e.user_id === myEnrollment.parent_of_student_id);
    }
    return enrollments.filter(e => e.role === 'student');
  }, [isParent, myEnrollment?.parent_of_student_id, enrollments]);

  // Get latest submission per student
  const latestSubmissionByStudent = useMemo(() => {
    const map = new Map();
    for (const s of visibleSubmissions) {
      const sid = s.studentId;
      if (!sid) continue;
      const prev = map.get(sid);
      const prevTime = prev ? new Date(prev.submittedAt).getTime() : 0;
      const thisTime = new Date(s.submittedAt).getTime();
      if (!prev || thisTime >= prevTime) map.set(sid, s);
    }
    return map;
  }, [visibleSubmissions]);

  const submittedStudentIdsSet = useMemo(() => {
    const set = new Set();
    for (const [studentId] of latestSubmissionByStudent.entries()) {
      set.add(studentId);
    }
    return set;
  }, [latestSubmissionByStudent]);

  const uniqueSubmittedCount = useMemo(() => {
    return submittedStudentIdsSet.size;
  }, [submittedStudentIdsSet]);

  const gradedStudentIdsSet = useMemo(() => {
    const set = new Set();
    for (const [studentId, sub] of latestSubmissionByStudent.entries()) {
      if (sub.status === 'sudah_dinilai') set.add(studentId);
    }
    return set;
  }, [latestSubmissionByStudent]);

  const uniqueGradedCount = useMemo(() => {
    return gradedStudentIdsSet.size;
  }, [gradedStudentIdsSet]);

  const studentsSubmitted = useMemo(() => {
    return visibleEnrollments.filter(e => submittedStudentIdsSet.has(e.user_id));
  }, [visibleEnrollments, submittedStudentIdsSet]);

  const studentsNotSubmitted = useMemo(() => {
    return visibleEnrollments.filter(e => !submittedStudentIdsSet.has(e.user_id));
  }, [visibleEnrollments, submittedStudentIdsSet]);

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

    setIsGrading(true);

    try {
      console.log("Starting grading process...");
      
      // Step 1: Update submission
      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          score: numScore,
          feedback: feedback || '',
          status: 'sudah_dinilai',
          graded_at: new Date().toISOString(),
          graded_by: currentUser.email
        })
        .eq('id', selectedSubmission.id);

      if (updateError) throw updateError;
      console.log("Submission updated successfully");

      // Step 2: Create notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedSubmission.studentId,
          title: 'Tugas Telah Dinilai',
          message: `Tugas "${assignment.title}" telah dinilai oleh guru`,
          type: 'grade',
          related_id: assignment.id,
          link: '/assignments',
          is_read: false
        });

      if (notifError) console.error("Notification error:", notifError);
      console.log("Notification created successfully");

      // Step 3: Reset form and refresh
      setSelectedSubmission(null);
      setScore('');
      setFeedback('');
      
      alert('✅ Nilai berhasil diberikan!');
      fetchGradingData(); // Refresh data

    } catch (err) {
      console.error("Grading error:", err);
      alert("❌ Gagal memberikan nilai: " + err.message);
    } finally {
      setIsGrading(false);
    }
  };

  if (loading) return <div className="p-5 text-center">Memuat data penilaian...</div>;

  if (!hasAccess) {
    return (
      <div className="p-5">
        <div className="card p-5 text-center">
          <XCircle size={64} className="mx-auto text-danger mb-3" style={{ opacity: 0.3 }} />
          <p className="text-muted">Anda tidak memiliki akses untuk melihat halaman ini</p>
          <button className="btn btn-primary mt-3" onClick={onBack}>
            Kembali
          </button>
        </div>
      </div>
    );
  }

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

      {/* Parent Access Badge */}
      {isParent && (
        <div 
          className="alert d-flex align-items-center gap-3 mb-4"
          style={{
            background: 'linear-gradient(135deg, #faf5ff, #fce7f3)',
            border: '1px solid #e9d5ff',
            borderRadius: '12px'
          }}
        >
          <Eye size={20} style={{ color: '#9333ea' }} />
          <div>
            <p className="mb-0 fw-semibold" style={{ color: '#581c87' }}>
              Mode Orang Tua - Hanya Melihat
            </p>
            <p className="mb-0 small" style={{ color: '#7c3aed' }}>
              Anda dapat melihat data anak Anda, tetapi tidak dapat memberikan nilai
            </p>
          </div>
        </div>
      )}

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
              {course?.subject || 'Matematika'}
            </span>
            <h1 className="fw-bold mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
              {assignment.title}
            </h1>
            <p className="mb-3 opacity-90">{assignment.description || 'Kerjakan soal-soal berikut dengan teliti'}</p>
            <div className="d-flex flex-wrap gap-3 small">
              <span className="d-flex align-items-center gap-1">
                <Calendar size={16} />
                Deadline: {new Date(assignment.deadline).toLocaleDateString('id-ID')}
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
                  <p className="small text-primary fw-semibold mb-1">
                    {isParent ? 'Anak Anda' : 'Total Siswa'}
                  </p>
                  <h2 className="fw-bold text-primary mb-0">{visibleEnrollments.length}</h2>
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
                  <p className="small text-success fw-semibold mb-1">Sudah Mengumpulkan</p>
                  <h2 className="fw-bold text-success mb-0">{uniqueSubmittedCount}</h2>
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
                  <p className="small text-danger fw-semibold mb-1">Belum Mengumpulkan</p>
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
                  <h2 className="fw-bold mb-0" style={{ color: '#9333ea' }}>{uniqueGradedCount}</h2>
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', background: 'rgba(147, 51, 234, 0.2)' }}>
                  <Award style={{ color: '#9333ea' }} size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students Who Submitted */}
      <div className="card mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div 
          className="card-header p-4"
          style={{ 
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            borderBottom: '1px solid rgba(22, 163, 74, 0.2)'
          }}
        >
          <h5 className="mb-0 d-flex align-items-center gap-2 text-success">
            <CheckCircle2 size={20} />
            {isParent ? 'Anak yang Sudah Mengumpulkan' : 'Siswa yang Sudah Mengumpulkan'} ({studentsSubmitted.length})
          </h5>
        </div>
        <div className="card-body p-4">
          {studentsSubmitted.length === 0 ? (
            <div className="text-center py-5">
              <FileText size={64} className="mx-auto text-muted mb-3" style={{ opacity: 0.3 }} />
              <p className="text-muted">Belum ada yang mengumpulkan tugas</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {studentsSubmitted.map((enrollment) => {
                const submission = latestSubmissionByStudent.get(enrollment.user_id);
                const isGraded = submission?.status === 'sudah_dinilai';
                
                return (
                  <div 
                    key={enrollment.id}
                    className="card border"
                    style={{ 
                      borderRadius: '12px',
                      transition: 'all 0.2s',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{
                              width: '48px',
                              height: '48px',
                              background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                              fontSize: '1.25rem'
                            }}
                          >
                            {enrollment.profiles?.full_name?.charAt(0) || 'S'}
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-semibold">{enrollment.profiles?.full_name || 'Tanpa Nama'}</h6>
                            <div className="d-flex flex-wrap align-items-center gap-3 small text-muted">
                              <span className="d-flex align-items-center gap-1">
                                <Clock size={14} />
                                {new Date(submission?.submittedAt).toLocaleString('id-ID')}
                              </span>
                              {isGraded && (
                                <span 
                                  className="badge d-flex align-items-center gap-1"
                                  style={{ 
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    padding: '4px 10px'
                                  }}
                                >
                                  <Eye size={12} />
                                  Nilai: {submission.score}/{assignment.maxScore || 100}
                                </span>
                              )}
                            </div>
                            {submission?.content && (
                              <p className="small text-muted mt-2 mb-0" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {submission.content}
                              </p>
                            )}
                            {isGraded && submission?.feedback && (
                              <div 
                                className="mt-2 p-2 rounded"
                                style={{
                                  background: '#dcfce7',
                                  border: '1px solid #bbf7d0'
                                }}
                              >
                                <p className="small fw-semibold mb-1" style={{ color: '#15803d' }}>
                                  Feedback Guru:
                                </p>
                                <p className="small mb-0" style={{ color: '#166534' }}>
                                  {submission.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          {canGrade ? (
                            <button
                              className="btn"
                              style={{
                                background: isGraded ? '#6b7280' : '#2563eb',
                                color: 'white',
                                borderRadius: '8px',
                                padding: '8px 16px'
                              }}
                              onClick={() => handleGrade(submission)}
                              disabled={isGrading}
                            >
                              <Award size={16} className="me-2" />
                              {isGraded ? 'Edit Nilai' : 'Beri Nilai'}
                            </button>
                          ) : isParent ? (
                            <span 
                              className="badge d-flex align-items-center gap-1"
                              style={{
                                background: 'transparent',
                                border: '1px solid #c084fc',
                                color: '#9333ea',
                                padding: '6px 12px'
                              }}
                            >
                              <Lock size={12} />
                              Hanya Lihat
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Students Who Haven't Submitted */}
      <div className="card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div 
          className="card-header p-4"
          style={{ 
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <h5 className="mb-0 d-flex align-items-center gap-2 text-danger">
            <XCircle size={20} />
            {isParent ? 'Anak yang Belum Mengumpulkan' : 'Siswa yang Belum Mengumpulkan'} ({studentsNotSubmitted.length})
          </h5>
        </div>
        <div className="card-body p-4">
          {studentsNotSubmitted.length === 0 ? (
            <div className="text-center py-5">
              <CheckCircle2 size={64} className="mx-auto text-success mb-3" style={{ opacity: 0.3 }} />
              <p className="text-success fw-medium">
                {isParent ? 'Anak Anda sudah mengumpulkan tugas! 🎉' : 'Semua siswa sudah mengumpulkan tugas! 🎉'}
              </p>
            </div>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {studentsNotSubmitted.map((enrollment) => (
                <span
                  key={enrollment.id}
                  className="badge"
                  style={{
                    background: 'transparent',
                    border: '1px solid #fca5a5',
                    color: '#dc2626',
                    padding: '8px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 'normal'
                  }}
                >
                  {enrollment.profiles?.full_name || 'Tanpa Nama'}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grading Modal */}
      {canGrade && selectedSubmission && (
        <div 
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedSubmission(null)}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Beri Nilai Tugas</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setSelectedSubmission(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div 
                  className="p-3 rounded mb-3"
                  style={{
                    background: '#dbeafe',
                    border: '1px solid #93c5fd'
                  }}
                >
                  <p className="small text-primary mb-1">Siswa</p>
                  <p className="fw-semibold mb-0" style={{ color: '#1e40af' }}>
                    {selectedSubmission.studentName}
                  </p>
                </div>

                {selectedSubmission.content && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Jawaban Siswa</label>
                    <div 
                      className="p-3 rounded border"
                      style={{
                        background: '#f9fafb',
                        maxHeight: '256px',
                        overflowY: 'auto'
                      }}
                    >
                      <p className="small mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedSubmission.content}
                      </p>
                    </div>
                  </div>
                )}

                {selectedSubmission.fileUrl && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">File Tugas</label>
                    <a 
                      href={selectedSubmission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-block text-primary small"
                      style={{ textDecoration: 'none' }}
                    >
                      📎 Lihat file yang diupload
                    </a>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Nilai (Maksimal: {assignment.maxScore || 100})
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder={`0-${assignment.maxScore || 100}`}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    min="0"
                    max={assignment.maxScore || 100}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Feedback (Opsional)</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Berikan feedback untuk siswa..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  ></textarea>
                </div>

                <button
                  className="btn btn-primary w-100"
                  onClick={handleSubmitGrade}
                  disabled={!score || isGrading}
                  style={{ borderRadius: '8px' }}
                >
                  {isGrading ? (
                    <>
                      <Loader2 size={16} className="me-2" style={{ animation: 'spin 1s linear infinite' }} />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Nilai'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradingView;