import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,Users,MessageSquare,TrendingUp,Plus,FileText,Clock,Calendar,Award,ChevronRight,Bell,
} from "lucide-react";

export default function Dashboard() {
  const [user] = useState({ username: "Ahmad", full_name: "Ahmad Kurniawan" });
  const [enrolledCourses] = useState([
    { id: 1, title: "Pemrograman Web", subject: "Teknologi Informasi", teacher_name: "Pak Andi", progress: 75 },
    { id: 2, title: "Basis Data", subject: "Teknologi Informasi", teacher_name: "Bu Sinta", progress: 60 },
    { id: 3, title: "Jaringan Komputer", subject: "Teknologi Informasi", teacher_name: "Pak Budi", progress: 45 },
  ]);
  const [upcomingAssignments] = useState([
    { id: 1, title: "Tugas Project Web", course: "Pemrograman Web", dueDate: "2025-12-20", status: "pending" },
    { id: 2, title: "Quiz Database", course: "Basis Data", dueDate: "2025-12-18", status: "pending" },
  ]);

  return (
    <div className="p-3 p-md-5" style={{ background: "linear-gradient(to bottom, #f8f9fa, #ffffff)" }}>
      
      {/* Welcome Section with Animation */}
      <div
        className="rounded-4 p-4 p-md-5 mb-4 text-white position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2563eb 0%, #16a34a 100%)",
          boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)",
        }}
      >
        <div className="position-relative" style={{ zIndex: 2 }}>
          <h1 className="fw-bold mb-2" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}>
            Selamat Datang, {user?.username || user?.full_name || "Pengguna"}! 👋
          </h1>
          <p className="mb-0" style={{ fontSize: "1.1rem", opacity: 0.9 }}>
            Mari mulai perjalanan belajar Anda hari ini
          </p>
        </div>
        
        {/* Decorative circles */}
        <div 
          className="position-absolute rounded-circle"
          style={{
            width: "300px",
            height: "300px",
            background: "rgba(255, 255, 255, 0.1)",
            top: "-100px",
            right: "-100px",
            zIndex: 1,
          }}
        />
        <div 
          className="position-absolute rounded-circle"
          style={{
            width: "200px",
            height: "200px",
            background: "rgba(255, 255, 255, 0.05)",
            bottom: "-50px",
            left: "-50px",
            zIndex: 1,
          }}
        />
      </div>

      {/* Stats Grid with Enhanced Cards */}
      <div className="row g-3 g-md-4 mb-4">
        {[
          { title: "Kelas Saya Ajar", value: "3", icon: BookOpen, color: "#2563eb", bgColor: "#eff6ff", trend: "Kelas yang saya buat" },
          { title: "Kelas Diikuti", value: "5", icon: Users, color: "#16a34a", bgColor: "#f0fdf4", trend: "Sebagai siswa" },
          { title: "Diskusi", value: "12", icon: MessageSquare, color: "#9333ea", bgColor: "#faf5ff", trend: "Aktif" },
          { title: "Progress", value: "75%", icon: TrendingUp, color: "#ea580c", bgColor: "#fff7ed", trend: "Rata-rata" },
        ].map((stat, index) => (
          <div className="col-6 col-lg-3" key={index}>
            <div 
              className="card border-0 h-100 shadow-sm"
              style={{
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
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
                <div 
                  className="rounded-3 d-inline-flex p-2 mb-3"
                  style={{ background: stat.bgColor }}
                >
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

      {/* Main Content Grid */}
      <div className="row g-4">
        
        {/* Left Column - Enrolled Courses */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)" }}>
            <div 
              className="card-header border-0 rounded-top-4 py-3"
              style={{ background: "linear-gradient(135deg, #eff6ff, #f0fdf4)" }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                  <BookOpen size={20} style={{ color: "#2563eb" }} />
                  Kelas yang Saya Ikuti
                </h5>
                <Link to="/course" className="btn btn-sm btn-link text-decoration-none">
                  Lihat Semua <ChevronRight size={16} />
                </Link>
              </div>
            </div>
            <div className="card-body p-3 p-md-4">
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-5">
                  <BookOpen size={64} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                  <p className="text-muted mb-3">Belum ada kelas yang diikuti</p>
                  <Link to="/courses" className="btn btn-primary">
                    Cari Kelas
                  </Link>
                </div>
              ) : (
                <div className="d-grid gap-3">
                  {enrolledCourses.map((course, index) => (
                    <Link 
                      to={`/course/${course.id}`} 
                      key={course.id}
                      className="text-decoration-none"
                    >
                      <div 
                        className="border rounded-4 p-3 p-md-4 bg-white"
                        style={{
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateX(5px)";
                          e.currentTarget.style.boxShadow = "0 5px 20px rgba(37, 99, 235, 0.15)";
                          e.currentTarget.style.borderColor = "#2563eb";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateX(0)";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.borderColor = "#dee2e6";
                        }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <div 
                            className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                            style={{
                              width: "64px",
                              height: "64px",
                              background: "linear-gradient(135deg, #2563eb, #16a34a)",
                              fontSize: "1.5rem",
                            }}
                          >
                            {course.title.charAt(0)}
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-1 text-dark">{course.title}</h6>
                            <p className="text-muted small mb-2">{course.subject}</p>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <span 
                                className="badge rounded-pill px-3 py-1"
                                style={{ background: "#eff6ff", color: "#2563eb" }}
                              >
                                {course.teacher_name}
                              </span>
                              <span className="small text-muted">•</span>
                              <span className="small text-muted">Progress: {course.progress}%</span>
                            </div>
                            <div className="mt-2">
                              <div 
                                className="progress rounded-pill"
                                style={{ height: "6px", background: "#e5e7eb" }}
                              >
                                <div 
                                  className="progress-bar rounded-pill"
                                  style={{ 
                                    width: `${course.progress}%`,
                                    background: "linear-gradient(90deg, #2563eb, #16a34a)",
                                  }}
                                />
                              </div>
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

          {/* Recent Activity */}
          <div className="card border-0 shadow-sm rounded-4" style={{ background: "rgba(255, 255, 255, 0.9)" }}>
            <div 
              className="card-header border-0 rounded-top-4 py-3"
              style={{ background: "linear-gradient(135deg, #faf5ff, #fff7ed)" }}
            >
              <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                <MessageSquare size={20} style={{ color: "#9333ea" }} />
                Aktivitas Terbaru
              </h5>
            </div>
            <div className="card-body p-3 p-md-4">
              <div className="d-grid gap-3">
                {[
                  { user: "Pak Andi", action: "menambahkan materi baru", course: "Pemrograman Web", time: "2 jam lalu" },
                  { user: "Bu Sinta", action: "memberikan komentar", course: "Basis Data", time: "5 jam lalu" },
                  { user: "Ahmad", action: "menyelesaikan quiz", course: "Jaringan Komputer", time: "1 hari lalu" },
                ].map((activity, index) => (
                  <div key={index} className="d-flex gap-3 align-items-start">
                    <div 
                      className="rounded-circle bg-gradient d-flex align-items-center justify-content-center text-white flex-shrink-0"
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "linear-gradient(135deg, #9333ea, #ea580c)",
                      }}
                    >
                      {activity.user.charAt(0)}
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-1">
                        <span className="fw-semibold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="small text-muted mb-0">{activity.course} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="col-lg-4">
          
          {/* Upcoming Assignments */}
          <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ background: "rgba(255, 255, 255, 0.9)" }}>
            <div 
              className="card-header border-0 rounded-top-4 py-3"
              style={{ background: "linear-gradient(135deg, #fff7ed, #eff6ff)" }}
            >
              <h6 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                <Clock size={18} style={{ color: "#ea580c" }} />
                Tugas Mendatang
              </h6>
            </div>
            <div className="card-body p-3">
              {upcomingAssignments.map((assignment) => (
                <div 
                  key={assignment.id}
                  className="border-start border-3 ps-3 mb-3"
                  style={{ borderColor: "#ea580c" }}
                >
                  <h6 className="fw-semibold mb-1" style={{ fontSize: "0.9rem" }}>
                    {assignment.title}
                  </h6>
                  <p className="small text-muted mb-1">{assignment.course}</p>
                  <div className="d-flex align-items-center gap-2">
                    <Calendar size={14} className="text-muted" />
                    <span className="small text-muted">{assignment.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div 
            className="card border-0 shadow-sm rounded-4"
            style={{ background: "linear-gradient(135deg, #f0fdf4, #eff6ff)" }}
          >
            <div className="card-header border-0 bg-transparent py-3">
              <h6 className="mb-0 fw-semibold">Aksi Cepat</h6>
            </div>
            <div className="card-body p-3">
              <div className="d-grid gap-2">
                {[
                  { icon: Plus, label: "Buat Kelas Baru", link: "/manage-courses" },
                  { icon: BookOpen, label: "Jelajahi Kelas", link: "/course" },
                  { icon: FileText, label: "Lihat Tugas", link: "/assignments" },
                  { icon: MessageSquare, label: "Forum Diskusi", link: "/discussions" },
                ].map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="btn btn-light d-flex align-items-center gap-2 text-start border"
                    style={{
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(5px)";
                      e.currentTarget.style.background = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.background = "";
                    }}
                  >
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