import React, { useState, useEffect } from "react";
import {
  BookOpen,
  TrendingUp,
  FileText,
  Award,
  EyeOff,
  Lock,
} from "lucide-react";
import { supabase } from "../lib/supabase"; // Pastikan path supabase.js benar

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

      // 1. Ambil data enrollment user yang sedang login untuk mendapatkan Role dan Daftar Kelas
      const { data: userEnrollments, error: enrollError } = await supabase
        .from("course_members")
        .select("courses_id, role")
        .eq("user_id", user.id);

      if (enrollError) throw enrollError;
      if (!userEnrollments || userEnrollments.length === 0) return setLoading(false);

      // Ambil role dari salah satu baris enrollment (asumsi satu user satu role umum)
      const isTeacher = userEnrollments.some(en => en.role === "teacher");
      const enrolledCourseIds = userEnrollments.map(en => en.courses_id);

      // 2. Ambil data kelas dan tugas
      const { data: coursesData, error: courseError } = await supabase
        .from("courses")
        .select(`
          id, title,
          assignments (
            id,
            title
          )
        `)
        .in("id", enrolledCourseIds);

      if (courseError) throw courseError;

      // 3. Ambil data pengumpulan (Submissions)
      let submissionQuery = supabase.from("submissions").select("id, assignment_id, user_id, grade");
      
      // Jika Guru: Ambil semua submission di kelas-kelas tersebut
      // Jika Siswa: Hanya ambil submission miliknya sendiri
      if (isTeacher) {
        const allAssignmentIds = coursesData.flatMap(c => c.assignments.map(a => a.id));
        submissionQuery = submissionQuery.in("assignment_id", allAssignmentIds);
      } else {
        submissionQuery = submissionQuery.eq("user_id", user.id);
      }

      const { data: submissions, error: subError } = await submissionQuery;
      if (subError) throw subError;

      // 4. Hitung jumlah siswa per kelas (Hanya jika Guru)
      let studentCountMap = {};
      if (isTeacher) {
        const { data: allEnrollments, error: allEnrollError } = await supabase
          .from("course_members")
          .select("courses_id, role")
          .in("courses_id", enrolledCourseIds);

        if (allEnrollError) throw allEnrollError;

        // Hitung hanya yang role-nya 'student'
        allEnrollments.forEach(en => {
          // Gunakan .toString() untuk memastikan ID konsisten saat jadi Key Object
          const cId = en.courses_id.toString(); 
          if (en.role === "student") {
            studentCountMap[cId] = (studentCountMap[cId] || 0) + 1;
          }
        });
      }

      let totalGraded = 0;
      let totalPercentSum = 0;

      // 5. Olah Data untuk UI
      const formattedClasses = coursesData.map((course) => {
        const cId = course.id.toString();
        const courseAsgIds = course.assignments?.map(a => a.id) || [];
        const totalTasks = courseAsgIds.length;
        
        // --- TAMBAHKAN BAGIAN INI UNTUK MENGHITUNG TUGAS DINILAI ---
        const gradedInThisCourse = submissions?.filter(s => 
          courseAsgIds.includes(s.assignment_id) && s.grade !== null
        ).length || 0;
        
        totalGraded += gradedInThisCourse; // Akumulasi ke variabel di atas map
        // ---------------------------------------------------------

        let percent = 0;
        let completed = 0;
        let totalRequirement = 0;

        if (isTeacher) {
          const totalStudentsInClass = studentCountMap[cId] || 0;
          totalRequirement = totalTasks * totalStudentsInClass;
          completed = submissions?.filter(s => 
            courseAsgIds.includes(s.assignment_id)
          ).length || 0;
        } else {
          totalRequirement = totalTasks;
          completed = submissions?.filter(s => 
            courseAsgIds.includes(s.assignment_id)
          ).length || 0;
        }

        percent = totalRequirement > 0 ? Math.round((completed / totalRequirement) * 100) : 0;
        totalPercentSum += percent;

        // Letakkan ini tepat sebelum baris "return {" di dalam formattedClasses.map
        // console.log(`--- DEBUG KELAS: ${course.title} ---`);
        // console.log(`1. Total Tugas dari Guru : ${totalTasks} tugas`);
        // console.log(`2. Total Siswa di Kelas  : ${isTeacher ? (studentCountMap[cId] || 0) : "N/A (Siswa Mode)"}`);
        // console.log(`3. Target Pengumpulan    : ${totalRequirement} (Tugas x Siswa)`);
        // console.log(`4. Sudah Dikumpulkan     : ${completed} submission`);
        // console.log(`5. Sudah Dinilai Guru    : ${gradedInThisCourse} submission`);
        // console.log(`6. Persentase Progress   : ${percent}%`);
        // console.log(`-------------------------------------------`);

        return {
          id: course.id,
          title: course.title,
          subject: isTeacher ? "Monitoring Kelas" : "Materi Terkait",
          completed,
          total: totalRequirement,
          percent,
          isTeacher
        };
      });

      // 6. Hitung statistik untuk kartu ringkasan (Stats)
      const averageProgress = formattedClasses.length > 0 
        ? Math.round(totalPercentSum / formattedClasses.length) 
        : 0;

      // 7. Ambil Riwayat Penilaian Terbaru (Untuk ditampilkan di tabel bawah)
      const recentData = submissions
        .filter(sub => sub.grade !== null) // Hanya yang sudah ada nilai
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5)
        .map(sub => {
          // Cari judul tugas berdasarkan assignment_id
          const taskTitle = coursesData
            .flatMap(c => c.assignments)
            .find(asg => asg.id === sub.assignment_id)?.title || "Tugas";
          
          return {
            updated_at: sub.updated_at,
            assignment_title: taskTitle
          };
        });

      // 8. Update State Akhir
      setClasses(formattedClasses);
      setRecentGraded(recentData);
      setStats({
        totalClasses: formattedClasses.length,
        avgProgress: averageProgress,
        gradedTasks: totalGraded
      });

      } catch (error) {
        console.error("Error Detail:", error);
      } finally {
        setLoading(false);
      }
  };

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

      {/* PROGRESS AKTIFITAS SISWA PER CLASS */}
      <div className="card shadow-sm mb-4">
        <div className="card-header fw-bold">
          <TrendingUp size={18} className="me-2 text-primary" />
          {classes[0]?.isTeacher ? "Monitoring Aktivitas Siswa" : "Progress per Kelas"}
        </div>
        <div className="card-body">
          {classes.map((cls) => (
            <div key={cls.id} className="mb-4">
              <div className="d-flex justify-content-between mb-1">
                <div>
                  <strong>{cls.title}</strong>
                  <div className="text-muted small">{cls.subject}</div>
                </div>
                <span className="badge bg-light text-dark">
                  {cls.isTeacher ? `${cls.percent}% Terkumpul` : `${cls.completed}/${cls.total} Tugas`}
                </span>
              </div>

              <div className="progress mb-1" style={{ height: 10 }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${cls.percent}%` }}
                />
              </div>

              <small className="text-muted">
                {cls.isTeacher 
                  ? `Rata-rata penyelesaian tugas oleh seluruh siswa di kelas ini`
                  : `${cls.completed} dari ${cls.total} tugas dikerjakan`
                }
              </small>
            </div>
          ))}
        </div>
      </div>

      {/* PROGRESS TUGAS DAN KUIS PER CLASS YANG DIIKUTI */}
      <div className="card shadow-sm mb-4">
        <div className="card-header fw-bold">
          <TrendingUp size={18} className="me-2 text-primary" />
          {classes[0]?.isTeacher ? "Monitoring Progres Tugas dan Kuis" : "Progress per Kelas"}
        </div>
        <div className="card-body">
          {classes.map((cls) => (
            <div key={cls.id} className="mb-4">
              <div className="d-flex justify-content-between mb-1">
                <div>
                  <strong>{cls.title}</strong>
                  <div className="text-muted small">{cls.subject}</div>
                </div>
                <span className="badge bg-light text-dark">
                  {cls.isTeacher ? `${cls.percent}% Terkumpul` : `${cls.completed}/${cls.total} Tugas`}
                </span>
              </div>

              <div className="progress mb-1" style={{ height: 10 }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${cls.percent}%` }}
                />
              </div>

              <small className="text-muted">
                {cls.isTeacher 
                  ? `Rata-rata penyelesaian tugas oleh seluruh siswa di kelas ini`
                  : `${cls.completed} dari ${cls.total} tugas dikerjakan`
                }
              </small>
            </div>
          ))}
        </div>
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