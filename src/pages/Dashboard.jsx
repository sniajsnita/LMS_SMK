import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase"; // Pastikan path library supabase benar
import {
  BookOpen, Users, MessageSquare, TrendingUp, Plus, FileText, Clock, Calendar, ChevronRight
} from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    teaching: 0,
    enrolled: 0,
    discussions: 0,
    progress: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("--- START FETCH DASHBOARD DATA ---");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Ambil Profile
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setUserProfile(profile);

      // 2. Ambil Membership & Data Relasi
      const { data: memberships, error: memError } = await supabase
        .from("course_members")
        .select(`
          role, 
          courses_id,
          courses:courses_id (
            id, title, subject, 
            profiles:created_by (full_name),
            assignments (id)
          )
        `)
        .eq("user_id", user.id);

      if (memError) throw memError;

      // 2.1 Ambil Semua Submissions & Members (untuk hitung progress)
      const [submissionsRes, allMembersRes] = await Promise.all([
        supabase.from("submissions").select("id, assignment_id, user_id"),
        supabase.from("course_members").select("courses_id").eq("role", "student")
      ]);

      const submissions = submissionsRes.data || [];
      const studentCountMap = (allMembersRes.data || []).reduce((acc, curr) => {
        acc[curr.courses_id] = (acc[curr.courses_id] || 0) + 1;
        return acc;
      }, {});

      let totalPercentSum = 0;

      // --- LOGIKA PENGOLAHAN DATA KELAS ---
      const formattedAll = memberships.map((m) => {
        const course = m.courses;
        const isTeacher = m.role === "teacher";
        const courseAsgIds = course?.assignments?.map(a => a.id) || [];
        const totalTasks = courseAsgIds.length;
        
        let percent = 0;
        let totalRequirement = 0;
        let completed = 0;

        if (isTeacher) {
          const totalStudentsInClass = studentCountMap[m.courses_id] || 0;
          totalRequirement = totalTasks * totalStudentsInClass;
          completed = submissions.filter(s => courseAsgIds.includes(s.assignment_id)).length;
        } else {
          totalRequirement = totalTasks;
          completed = submissions.filter(s => 
            courseAsgIds.includes(s.assignment_id) && s.user_id === user.id
          ).length;
        }

        percent = totalRequirement > 0 ? Math.round((completed / totalRequirement) * 100) : 0;
        totalPercentSum += percent;

        return {
          id: course?.id,
          title: course?.title || "Tanpa Judul",
          subject: course?.subject || "Umum",
          teacher_name: isTeacher ? "Anda (Pengajar)" : (course?.profiles?.full_name || "Pengajar"),
          progress: percent,
          role: m.role
        };
      });

      setEnrolledCourses(formattedAll);

      // --- LOGIKA DISKUSI, MATERI, & TUGAS (AKTIVITAS) ---
      const allCourseIds = memberships?.map(m => m.courses_id) || [];
      let activeDiscussionsCount = 0; // Deklarasi di luar if agar bisa diakses stats

      if (allCourseIds.length > 0) {
        const [discRes, matRes, asgRes] = await Promise.all([
          supabase.from("discussions").select(`created_at, title, user_id, profiles:user_id(full_name), courses:course_id(title)`).in("course_id", allCourseIds).order("created_at", { ascending: false }),
          supabase.from("materials").select(`created_at, title, courses:course_id(title)`).in("course_id", allCourseIds).order("created_at", { ascending: false }).limit(5),
          supabase.from("assignments").select(`created_at, title, courses:course_id(title)`).in("course_id", allCourseIds).order("created_at", { ascending: false }).limit(5)
        ]);

        activeDiscussionsCount = discRes.data?.length || 0;
        let combinedActivities = []; // DEKLARASI DI SINI

        // 1. Olah Diskusi
        if (discRes.data) {
          discRes.data.slice(0, 5).forEach(item => {
            combinedActivities.push({
              user: item.user_id === user.id ? "Anda" : (item.profiles?.full_name || "Seseorang"),
              action: `mengirim diskusi: "${item.title}"`,
              course: item.courses?.title,
              time: new Date(item.created_at),
              type: 'discussion'
            });
          });
        }

        // 2. Olah Materi
        if (matRes.data) {
          matRes.data.forEach(item => {
            combinedActivities.push({
              user: "Pengajar",
              action: `mengunggah materi: ${item.title}`,
              course: item.courses?.title,
              time: new Date(item.created_at),
              type: 'material'
            });
          });
        }

        // 3. Olah Tugas
        if (asgRes.data) {
          asgRes.data.forEach(item => {
            combinedActivities.push({
              user: "Pengajar",
              action: `menerbitkan tugas: ${item.title}`,
              course: item.courses?.title,
              time: new Date(item.created_at),
              type: 'assignment'
            });
          });
        }

        const sortedActivities = combinedActivities
          .sort((a, b) => b.time - a.time)
          .slice(0, 3)
          .map(act => ({
            ...act,
            time: act.time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }));

        setActivities(sortedActivities);
      }

      // 6. Update Statistik Akhir
      const avgProgress = formattedAll.length > 0 ? Math.round(totalPercentSum / formattedAll.length) : 0;
      setStats({
        teaching: memberships?.filter(m => m.role === "teacher").length || 0,
        enrolled: memberships?.filter(m => m.role === "student").length || 0,
        discussions: activeDiscussionsCount,
        progress: avgProgress
      });

      console.log("--- FETCH SUCCESS ---");

    } catch (error) {
      console.error("❌ Dashboard Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-5 text-center">Memuat data...</div>;

  return (
    <div className="p-3 p-md-5" style={{ background: "linear-gradient(to bottom, #f8f9fa, #ffffff)" }}>
      
      {/* Welcome Section - TETAP SAMA */}
      <div className="rounded-4 p-4 p-md-5 mb-4 text-white position-relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #2563eb 0%, #16a34a 100%)", boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)" }}>
        <div className="position-relative" style={{ zIndex: 2 }}>
          <h1 className="fw-bold mb-2" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}>
            Selamat Datang, {userProfile?.full_name || "Pengguna"}! 👋
          </h1>
          <p className="mb-0" style={{ fontSize: "1.1rem", opacity: 0.9 }}>Mari mulai perjalanan belajar Anda hari ini</p>
        </div>
        <div className="position-absolute rounded-circle" style={{ width: "300px", height: "300px", background: "rgba(255, 255, 255, 0.1)", top: "-100px", right: "-100px", zIndex: 1 }} />
        <div className="position-absolute rounded-circle" style={{ width: "200px", height: "200px", background: "rgba(255, 255, 255, 0.05)", bottom: "-50px", left: "-50px", zIndex: 1 }} />
      </div>

      {/* Stats Grid - TETAP SAMA (Value jadi dinamis) */}
      <div className="row g-3 g-md-4 mb-4">
        {[
          { 
            title: "Kelas Saya Ajar", 
            value: stats.teaching, 
            icon: BookOpen, 
            color: "#2563eb", 
            bgColor: "#eff6ff", 
            trend: "Kelas yang dibuat" 
          },
          { 
            title: "Kelas Diikuti", 
            value: stats.enrolled, 
            icon: Users, 
            color: "#16a34a", 
            bgColor: "#f0fdf4", 
            trend: "Sebagai siswa" 
          },
          { 
            title: "Diskusi", 
            value: stats.discussions, 
            icon: MessageSquare, 
            color: "#9333ea", 
            bgColor: "#faf5ff", 
            trend: "Total pesan" 
          },
          { 
            title: "Progress", 
            value: `${stats.progress}%`, 
            icon: TrendingUp, 
            color: "#ea580c", 
            bgColor: "#fff7ed", 
            trend: "Rata-rata" 
          },
        ].map((stat, index) => (
          <div className="col-6 col-lg-3" key={index}>
            <div 
              className="card border-0 h-100 shadow-sm" 
              style={{ transition: "all 0.3s ease", cursor: "pointer" }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.transform = "translateY(-5px)"; 
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)"; 
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.transform = "translateY(0)"; 
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"; 
              }}
            >
              <div className="card-body p-3 p-md-4">
                <div className="rounded-3 d-inline-flex p-2 mb-3" style={{ background: stat.bgColor }}>
                  <stat.icon size={24} style={{ color: stat.color }} />
                </div>
                <h6 className="text-muted mb-2" style={{ fontSize: "0.875rem" }}>{stat.title}</h6>
                <h3 className="fw-bold mb-1" style={{ color: stat.color }}>{stat.value}</h3>
                <small className="text-muted">{stat.trend}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Left Column */}
        <div className="col-lg-8">
          {/* List Kelas - TETAP SAMA */}
          <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)" }}>
            <div className="card-header border-0 rounded-top-4 py-3" style={{ background: "linear-gradient(135deg, #eff6ff, #f0fdf4)" }}>
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                  <BookOpen size={20} style={{ color: "#2563eb" }} /> Daftar Kelas Saya
                </h5>
                <Link to="/course" className="btn btn-sm btn-link text-decoration-none">Lihat Semua <ChevronRight size={16} /></Link>
              </div>
            </div>
            <div className="card-body p-3 p-md-4">
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-5">
                  <BookOpen size={64} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                  <p className="text-muted">Belum ada kelas yang terdaftar</p>
                </div>
              ) : (
                <div className="d-grid gap-3">
                  {enrolledCourses.map((course) => (
                    <Link
                      to={course.role === 'teacher' ? `/manage-course` : `/course-detail?id=${course.id}`} 
                      key={course.id} 
                      className="text-decoration-none"
                      // TITIPKAN DATA DISINI:
                      state={{ selectedCourse: course }} 
                    >
                      <div 
                        className="border rounded-4 p-3 p-md-4 bg-white" 
                        style={{ transition: "all 0.3s ease" }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.transform = "translateX(5px)"; 
                          e.currentTarget.style.borderColor = "#2563eb"; 
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.transform = "translateX(0)"; 
                          e.currentTarget.style.borderColor = "#dee2e6"; 
                        }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <div 
                            className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                            style={{ width: "64px", height: "64px", background: "linear-gradient(135deg, #2563eb, #16a34a)", fontSize: "1.5rem" }}
                          >
                            {course.title ? course.title.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <h6 className="fw-bold mb-1 text-dark">{course.title}</h6>
                              {/* Badge Role untuk membedakan Guru/Siswa */}
                              <span className={`badge rounded-pill px-2 py-1 small fw-normal ${course.role === 'teacher' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'}`} style={{ fontSize: '0.7rem' }}>
                                {course.role === 'teacher' ? 'Pengajar' : 'Siswa'}
                              </span>
                            </div>
                            <p className="text-muted small mb-2">{course.subject}</p>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <span className="badge rounded-pill px-3 py-1" style={{ background: "#eff6ff", color: "#2563eb" }}>
                                {course.teacher_name}
                              </span>
                              <span className="small text-muted">Progress: {course.progress}%</span>
                            </div>
                            <div className="mt-2 progress rounded-pill" style={{ height: "6px", background: "#e5e7eb" }}>
                              <div 
                                className="progress-bar rounded-pill" 
                                style={{ width: `${course.progress}%`, background: "linear-gradient(90deg, #2563eb, #16a34a)" }} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Aktivitas - TETAP SAMA */}
          <div className="card border-0 shadow-sm rounded-4" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)" }}>
            <div className="card-header border-0 rounded-top-4 py-3" style={{ background: "linear-gradient(135deg, #faf5ff, #fff7ed)" }}>
              <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                <MessageSquare size={20} style={{ color: "#9333ea" }} /> Aktivitas Terbaru
              </h5>
            </div>
            <div className="card-body p-3 p-md-4">
              {activities.length === 0 ? (
                <div className="text-center py-4">
                  <MessageSquare size={32} className="text-muted mb-2" style={{ opacity: 0.2 }} />
                  <p className="text-muted small mb-0">Belum ada aktivitas diskusi</p>
                </div>
              ) : (
                <div className="d-grid gap-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="d-flex gap-3 align-items-start activity-item">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
                        style={{ 
                          width: "42px", 
                          height: "42px", 
                          background: "linear-gradient(135deg, #9333ea, #ea580c)",
                          fontSize: "0.9rem",
                          fontWeight: "bold"
                        }}
                      >
                        {activity.user ? activity.user.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="flex-grow-1 border-bottom pb-3">
                        <p className="mb-1" style={{ fontSize: "0.95rem" }}>
                          <span className="fw-bold text-dark">{activity.user}</span> 
                          <span className="text-secondary"> {activity.action}</span>
                        </p>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-light text-dark fw-normal border" style={{ fontSize: "0.7rem" }}>
                            {activity.course}
                          </span>
                          <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                            • {activity.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)" }}>
            <div className="card-header border-0 rounded-top-4 py-3" style={{ background: "linear-gradient(135deg, #fff7ed, #eff6ff)" }}>
              <h6 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                <Clock size={18} style={{ color: "#ea580c" }} /> Tugas Mendatang
              </h6>
            </div>
            <div className="card-body p-3">
              {upcomingAssignments.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar size={32} className="text-muted mb-2" style={{ opacity: 0.2 }} />
                  <p className="text-muted small mb-0">Tidak ada tugas mendatang</p>
                </div>
              ) : (
                upcomingAssignments.map((assignment) => (
                  <div 
                    key={assignment.id} 
                    className="border-start border-3 ps-3 mb-3 p-2 rounded-end" 
                    style={{ 
                      borderColor: "#ea580c", 
                      background: "rgba(234, 88, 12, 0.03)",
                      transition: "all 0.2s ease" 
                    }}
                  >
                    <h6 className="fw-semibold mb-1" style={{ fontSize: "0.9rem" }}>
                      {assignment.title}
                    </h6>
                    <p className="small text-muted mb-1" style={{ fontSize: "0.8rem" }}>
                      {assignment.course}
                    </p>
                    <div className="d-flex align-items-center gap-2">
                      <Calendar size={14} className="text-muted" />
                      <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                        Tenggat: {assignment.dueDate}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions - TETAP SAMA */}
          <div className="card border-0 shadow-sm rounded-4" style={{ background: "linear-gradient(135deg, #f0fdf4, #eff6ff)" }}>
            <div className="card-header border-0 bg-transparent py-3"><h6 className="mb-0 fw-semibold">Aksi Cepat</h6></div>
            <div className="card-body p-3">
              <div className="d-grid gap-2">
                {[
                  { icon: Plus, label: "Buat Kelas Baru", link: "/manage-course" },
                  { icon: BookOpen, label: "Jelajahi Kelas", link: "/course" },
                  { icon: FileText, label: "Lihat Tugas", link: "/assignments" },
                  { icon: MessageSquare, label: "Forum Diskusi", link: "/discussions" },
                ].map((action, index) => (
                  <Link key={index} to={action.link} className="btn btn-light d-flex align-items-center gap-2 text-start border"
                    style={{ transition: "all 0.2s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(5px)"; e.currentTarget.style.background = "#ffffff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.background = ""; }}>
                    <action.icon size={18} />
                    <span>{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}