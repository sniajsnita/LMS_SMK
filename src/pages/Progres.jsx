import React, { useState, useEffect } from "react";
import {
  BookOpen,
  TrendingUp,
  FileText,
  Award,
  EyeOff,
  Lock,
  Clock
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Progress() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalClasses: 0, avgProgress: 0, gradedTasks: 0 });
  const [classes, setClasses] = useState([]);
  const [recentGraded, setRecentGraded] = useState([]);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userEnrollments, error: enrollError } = await supabase
        .from("course_members")
        .select("courses_id, role")
        .eq("user_id", user.id);

      if (enrollError) throw enrollError;
      if (!userEnrollments || userEnrollments.length === 0) return setLoading(false);

      const enrolledCourseIds = userEnrollments.map(en => en.courses_id);

      const { data: coursesData, error: courseError } = await supabase
        .from("courses")
        .select(`
          id, title, subject,
          assignments ( id, title )
        `)
        .in("id", enrolledCourseIds);

      if (courseError) throw courseError;

      const { data: submissions, error: subError } = await supabase
        .from("submissions")
        .select("id, assignment_id, user_id, grade, updated_at")
        .in("assignment_id", coursesData.flatMap(c => c.assignments.map(a => a.id)));

      if (subError) throw subError;

      // Ambil data semua member untuk hitung total siswa per kelas (untuk guru)
      const { data: allMembers } = await supabase
        .from("course_members")
        .select("courses_id, role");

      let totalGraded = 0;
      let totalPercentSum = 0;

      const formattedClasses = coursesData.map((course) => {
        // Tentukan role user di kelas spesifik ini
        const myRole = userEnrollments.find(en => en.courses_id === course.id)?.role;
        const isTeacher = myRole === "teacher";
        
        const courseAsgIds = course.assignments?.map(a => a.id) || [];
        const totalTasks = courseAsgIds.length;
        
        // Hitung tugas yang sudah dinilai (milik user jika siswa, milik semua jika guru)
        const mySubmissions = isTeacher 
          ? submissions.filter(s => courseAsgIds.includes(s.assignment_id))
          : submissions.filter(s => courseAsgIds.includes(s.assignment_id) && s.user_id === user.id);

        const gradedCount = mySubmissions.filter(s => s.grade !== null).length;
        totalGraded += (isTeacher ? 0 : gradedCount); // Hanya hitung tugas pribadi yang dinilai untuk statistik

        let completed = mySubmissions.length;
        let totalRequirement = totalTasks;

        if (isTeacher) {
          const studentCount = allMembers.filter(m => m.courses_id === course.id && m.role === "student").length;
          totalRequirement = totalTasks * studentCount;
        }

        const percent = totalRequirement > 0 ? Math.round((completed / totalRequirement) * 100) : 0;
        totalPercentSum += percent;

        return {
          ...course,
          completed,
          total: totalRequirement,
          percent,
          isTeacher
        };
      });

      setClasses(formattedClasses);
      setRecentGraded(submissions.filter(s => s.user_id === user.id && s.grade !== null).slice(0, 5));
      setStats({
        totalClasses: formattedClasses.length,
        avgProgress: formattedClasses.length > 0 ? Math.round(totalPercentSum / formattedClasses.length) : 0,
        gradedTasks: totalGraded
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const teacherClasses = classes.filter(cls => cls.isTeacher);
  const studentClasses = classes.filter(cls => !cls.isTeacher);

  if (loading) return <div className="container py-5 text-center">Memuat data progress...</div>;

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="rounded-4 p-4 mb-4 text-white"
           style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
        <div className="d-flex align-items-center gap-3 mb-2">
          <Lock size={32} />
          <h2 className="fw-bold mb-0">Progress Belajar</h2>
        </div>
        <p className="mb-0 text-light">
          Pantau perkembangan belajar Anda (nilai detail disembunyikan)
        </p>
      </div>

      {/* INFO */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex gap-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center"
               style={{ width: 48, height: 48, background: "#ede9fe" }}>
            <EyeOff className="text-purple-600" />
          </div>
          <div>
            <h6 className="fw-bold">Tentang Nilai & Progress</h6>
            <p className="text-muted small mb-1">
              Anda hanya dapat melihat progress umum. Nilai detail hanya dapat
              diakses oleh orang tua melalui Portal Orang Tua.
            </p>
            <small className="text-muted">💡 Fokus pada proses belajar</small>
          </div>
        </div>
      </div>

      {/* STAT */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between">
              <div>
                <small className="text-muted">Total Kelas</small>
                <h3 className="fw-bold">{stats.totalClasses}</h3>
              </div>
              <BookOpen size={32} className="text-primary" />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between">
              <div>
                <small className="text-muted">Progress Rata-rata</small>
                <h3 className="fw-bold">{stats.avgProgress}%</h3>
              </div>
              <TrendingUp size={32} className="text-success" />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between">
              <div>
                <small className="text-muted">Tugas Dinilai</small>
                <h3 className="fw-bold">{stats.gradedTasks}</h3>
              </div>
              <FileText size={32} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESS TUGAS DAN KUIS PER CLASS YANG DIIKUTI */}
      <div className="row">
        {/* --- CARD MONITORING (GURU) --- */}
        {teacherClasses.length > 0 && (
          <div className="col-12">
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "15px" }}>
              <div className="card-header bg-white py-3 fw-bold d-flex align-items-center border-0">
                <TrendingUp size={18} className="me-2 text-primary" />
                Monitoring Progres Tugas & Kuis (Sebagai Guru)
              </div>
              <div className="card-body">
                {teacherClasses.map((cls) => (
                  <div key={cls.id} className="mb-4">
                    <div className="d-flex justify-content-between mb-1">
                      <div>
                        <strong className="d-block">{cls.title}</strong>
                        <div className="text-muted small">{cls.subject}</div>
                      </div>
                      <span className="badge bg-primary-subtle text-primary align-self-start">
                        {cls.percent}% Terkumpul
                      </span>
                    </div>
                    <div className="progress mb-1" style={{ height: 8, borderRadius: 10 }}>
                      <div className="progress-bar bg-primary" style={{ width: `${cls.percent}%` }} />
                    </div>
                    <small className="text-muted">Rata-rata penyelesaian tugas oleh seluruh siswa</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- CARD PROGRES KELAS (SISWA) --- */}
        {studentClasses.length > 0 && (
          <div className="col-12">
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "15px" }}>
              <div className="card-header bg-white py-3 fw-bold d-flex align-items-center border-0">
                <TrendingUp size={18} className="me-2 text-success" />
                Progres Belajar Saya (Sebagai Siswa)
              </div>
              <div className="card-body">
                {studentClasses.map((cls) => (
                  <div key={cls.id} className="mb-4">
                    <div className="d-flex justify-content-between mb-1">
                      <div>
                        <strong className="d-block">{cls.title}</strong>
                        <div className="text-muted small">{cls.subject}</div>
                      </div>
                      <span className="badge bg-success-subtle text-success align-self-start">
                        {cls.completed}/{cls.total} Tugas
                      </span>
                    </div>
                    <div className="progress mb-1" style={{ height: 8, borderRadius: 10 }}>
                      <div className="progress-bar bg-success" style={{ width: `${cls.percent}%` }} />
                    </div>
                    <small className="text-muted">{cls.completed} dari {cls.total} tugas telah dikerjakan</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RECENT GRADED */}
      <div className="card shadow-sm">
        <div className="card-header fw-bold">
          <Award size={18} className="me-2 text-success" />
          Riwayat Penilaian Terbaru
        </div>
        <div className="card-body">
          {recentGraded.length === 0 ? <p className="text-muted small">Belum ada tugas yang dinilai.</p> :
           recentGraded.map((item, i) => (
            <div key={i} className="d-flex justify-content-between align-items-start border rounded p-3 mb-2 bg-light">
              <div>
                <strong>{item.assignments?.title}</strong>
                <div className="text-muted small">
                  Dinilai pada {new Date(item.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div className="text-end">
                <span className="badge bg-secondary">
                  <Lock size={12} className="me-1" />
                  Nilai Tersembunyi
                </span>
                <div className="small text-muted">Portal Orang Tua</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}