import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import {
  LayoutDashboard,Info,BookOpen,GraduationCap,FileText,MessageSquare,BarChart3,LogOut,User,Mail,Settings,Menu,X,Bell,ChevronDown,
} from "lucide-react";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [user, setUser] = useState({
    full_name: "",
    email: "",
  });

  // Dummy notifications data
  const [notifications] = useState([
    {
      id: 1,
      type: "assignment",
      title: "Tugas Baru: Matematika",
      message: "Tugas baru telah ditambahkan untuk mata pelajaran Matematika",
      time: "5 menit yang lalu",
      isRead: false
    },
    {
      id: 2,
      type: "discussion",
      title: "Balasan Diskusi",
      message: "Ada balasan baru pada diskusi 'Pengenalan React Hooks'",
      time: "1 jam yang lalu",
      isRead: false
    },
    {
      id: 3,
      type: "grade",
      title: "Nilai Tersedia",
      message: "Nilai tugas 'Algoritma Sorting' sudah tersedia",
      time: "2 jam yang lalu",
      isRead: false
    },
    {
      id: 4,
      type: "announcement",
      title: "Pengumuman Kelas",
      message: "Kelas Pemrograman Web akan dimulai 10 menit lebih awal besok",
      time: "3 jam yang lalu",
      isRead: true
    },
    {
      id: 5,
      type: "reminder",
      title: "Pengingat Deadline",
      message: "Deadline tugas Database akan berakhir dalam 2 hari",
      time: "1 hari yang lalu",
      isRead: true
    }
  ]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser({
          full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          email: session.user.email,
        });
      } else {
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isProfileOpen && !e.target.closest('.profile-dropdown-container')) {
        setIsProfileOpen(false);
      }
      if (isNotificationOpen && !e.target.closest('.notification-container')) {
        setIsNotificationOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen, isNotificationOpen]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'assignment': return FileText;
      case 'discussion': return MessageSquare;
      case 'grade': return BarChart3;
      case 'announcement': return Info;
      case 'reminder': return Bell;
      default: return Bell;
    }
  };

  const menu = [
    { title: "Tentang Kami", path: "/about", icon: Info },
    { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { title: "Kelas Saya", path: "/course", icon: BookOpen },
    { title: "Kelola Kelas", path: "/manage-course", icon: GraduationCap },
    { title: "Tugas", path: "/assignments", icon: FileText },
    { title: "Diskusi", path: "/discussions", icon: MessageSquare },
    { title: "Progress", path: "/progres", icon: BarChart3 },
    { title: "Undangan", path: "/invitations", icon: Mail, badge: 3 },
  ];

  return (
    <div className="d-flex min-vh-100" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #f0fdf4 100%)" }}>
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1040 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`bg-white border-end position-fixed position-lg-fixed d-flex flex-column ${
          isSidebarOpen ? "d-flex" : "d-none d-lg-flex"
        }`}
        style={{
          width: "280px",
          height: "100vh",
          zIndex: 1050,
          transition: "all 0.3s ease",
          boxShadow: "2px 0 20px rgba(0, 0, 0, 0.05)",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          left: 0,
          top: 0,
        }}
      >
        {/* Close button for mobile */}
        <button
          className="btn btn-link d-lg-none position-absolute top-0 end-0 p-3"
          onClick={() => setIsSidebarOpen(false)}
          style={{ zIndex: 1051 }}
        >
          <X size={24} />
        </button>

        {/* Logo */}
        <div className="p-3 p-sm-4 border-bottom flex-shrink-0" style={{ background: "linear-gradient(135deg, #eff6ff, #f0fdf4)" }}>
          <div className="d-flex align-items-center gap-2 gap-sm-3">
            <div
              className="rounded-4 d-flex align-items-center justify-content-center shadow-sm p-2"
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #2563eb, #16a34a)",
              }}
            >
              <GraduationCap size={24} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: "1.1rem" }}>EduSpace</h5>
              <small className="text-muted d-block text-truncate" style={{ fontSize: "0.7rem" }}>
                {user?.user_type === "parent" ? "Portal Orang Tua" : "Platform Pembelajaran"}
              </small>
            </div>
          </div>
        </div>

        {/* MENU */}
        <div 
          className="p-2 p-sm-3 flex-grow-1 overflow-y-auto overflow-x-hidden" 
          style={{ 
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 transparent",
            WebkitOverflowScrolling: "touch"
          }}
        >
          <p className="text-muted text-uppercase small fw-semibold px-3 mb-2" style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}>
            Menu Utama
          </p>
          <ul className="nav nav-pills flex-column gap-1 mb-3">
            {menu.map((item, i) => (
              <li key={i} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link d-flex align-items-center gap-2 gap-sm-3 position-relative ${
                    location.pathname === item.path
                      ? "text-white"
                      : "text-dark"
                  }`}
                  style={{
                    borderRadius: "12px",
                    padding: "10px 12px",
                    transition: "all 0.2s ease",
                    background: location.pathname === item.path
                      ? "linear-gradient(135deg, #2563eb, #16a34a)"
                      : "transparent",
                    fontWeight: location.pathname === item.path ? "600" : "500",
                    fontSize: "0.9rem",
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.currentTarget.style.background = "#eff6ff";
                      e.currentTarget.style.color = "#2563eb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#212529";
                    }
                  }}
                >
                  <item.icon size={18} style={{ flexShrink: 0 }} />
                  <span className="flex-grow-1">{item.title}</span>
                  {item.badge && (
                    <span
                      className="badge rounded-pill"
                      style={{
                        background: location.pathname === item.path ? "rgba(255, 255, 255, 0.3)" : "#ef4444",
                        color: "white",
                        fontSize: "0.65rem",
                        padding: "3px 7px",
                        flexShrink: 0,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* User Profile Footer */}
        <div className="border-top p-3 p-sm-4 flex-shrink-0 profile-dropdown-container">
          <div className="position-relative">
            <button
              className="btn btn-light w-100 d-flex align-items-center gap-2 gap-sm-3 p-2 p-sm-3 border-0"
              style={{
                borderRadius: "12px",
                background: "#f8f9fa",
                transition: "all 0.2s ease",
              }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e9ecef";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f8f9fa";
              }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "linear-gradient(135deg, #2563eb, #16a34a)",
                  fontSize: "0.9rem",
                }}
              >
                {user.full_name?.charAt(0) || "U"}
              </div>
              <div className="flex-grow-1 text-start overflow-hidden">
                <p className="mb-0 fw-semibold small text-dark text-truncate" style={{ fontSize: "0.85rem" }}>{user.full_name}</p>
                <p className="mb-0 text-muted text-truncate" style={{ fontSize: "0.7rem" }}>{user.email}</p>
              </div>
              <ChevronDown size={14} className="text-muted flex-shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div
                className="position-absolute bottom-100 start-0 w-100 mb-2 bg-white border rounded-3 shadow-lg"
                style={{ zIndex: 1000 }}
              >
                <Link
                  to="/profile"
                  className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark"
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    transition: "background 0.2s ease",
                    fontSize: "0.85rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  <User size={16} style={{ flexShrink: 0 }} />
                  <span className="small">Profil Saya</span>
                </Link>
                <Link
                  to="/invitations"
                  className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark position-relative"
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    transition: "background 0.2s ease",
                    fontSize: "0.85rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  <Mail size={16} style={{ flexShrink: 0 }} />
                  <span className="small">Undangan</span>
                  <span
                    className="badge rounded-pill bg-danger position-absolute"
                    style={{ fontSize: "0.6rem", top: "50%", right: "12px", transform: "translateY(-50%)" }}
                  >
                    3
                  </span>
                </Link>
                <Link
                  to="/setting"
                  className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark"
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    transition: "background 0.2s ease",
                    fontSize: "0.85rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  <Settings size={16} style={{ flexShrink: 0 }} />
                  <span className="small">Pengaturan</span>
                </Link>
                <button
                  className="d-flex align-items-center gap-2 px-3 py-2 text-danger border-0 bg-transparent w-100 text-start"
                  style={{
                    borderRadius: "0 0 12px 12px",
                    transition: "background 0.2s ease",
                    fontSize: "0.85rem",
                  }}
                  onClick={() => {
                    navigate("/login");
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fef2f2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <LogOut size={16} style={{ flexShrink: 0 }} />
                  <span className="small">Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div
        className="flex-fill d-flex flex-column main-content"
        style={{
          marginLeft: "0",
          transition: "margin-left 0.3s ease",
          width: "100%",
        }}
      >
        <style>{`
          @media (min-width: 992px) {
            .main-content {
              margin-left: 280px !important;
              width: calc(100% - 280px) !important;
            }
          }
        `}</style>

        {/* HEADER */}
        <header
          className="bg-white border-bottom px-3 px-sm-4 py-2 py-sm-3 sticky-top"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            zIndex: 1030,
          }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 gap-sm-3 overflow-hidden">
              <button
                className="btn btn-light d-lg-none p-2 border-0 flex-shrink-0"
                style={{ borderRadius: "10px" }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu size={20} />
              </button>
              <h4 className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: "clamp(1rem, 4vw, 1.5rem)" }}>
                {menu.find(m => m.path === location.pathname)?.title || ""}
              </h4>
            </div>
            <div className="d-flex align-items-center gap-2 gap-sm-3 flex-shrink-0">
              <div className="position-relative notification-container">
                <button
                  className="btn btn-light position-relative p-2 border-0"
                  style={{
                    borderRadius: "10px",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#eff6ff";
                    e.currentTarget.style.color = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f8f9fa";
                    e.currentTarget.style.color = "#212529";
                  }}
                >
                  <Bell size={18} />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "0.6rem", padding: "2px 5px" }}
                    >
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div
                    className="position-absolute bg-white border rounded-3 shadow-lg"
                    style={{
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: "320px",
                      maxWidth: "90vw",
                      maxHeight: "400px",
                      zIndex: 1000,
                      overflow: "hidden",
                    }}
                  >
                    {/* Header */}
                    <div className="px-3 py-2 border-bottom bg-light">
                      <div className="d-flex align-items-center justify-content-between">
                        <h6 className="mb-0 fw-bold">Notifikasi</h6>
                        <span className="badge bg-primary rounded-pill" style={{ fontSize: "0.7rem" }}>
                          {notifications.filter(n => !n.isRead).length} Baru
                        </span>
                      </div>
                    </div>

                    {/* Notification List */}
                    <div 
                      className="overflow-y-auto"
                      style={{
                        maxHeight: "320px",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#cbd5e1 transparent"
                      }}
                    >
                      {notifications.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                          <Bell size={32} className="mb-2 opacity-50" />
                          <p className="mb-0 small">Tidak ada notifikasi</p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const NotifIcon = getNotificationIcon(notif.type);
                          return (
                            <div
                              key={notif.id}
                              className="px-3 py-2 border-bottom"
                              style={{
                                background: notif.isRead ? "white" : "#eff6ff",
                                cursor: "pointer",
                                transition: "background 0.2s ease"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#f8f9fa";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = notif.isRead ? "white" : "#eff6ff";
                              }}
                            >
                              <div className="d-flex gap-2 align-items-start">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    background: notif.isRead
                                      ? "#e5e7eb"
                                      : "linear-gradient(135deg, #2563eb, #16a34a)",
                                  }}
                                >
                                  <NotifIcon size={14} className={notif.isRead ? "text-muted" : "text-white"} />
                                </div>

                                <div className="flex-grow-1 overflow-hidden">
                                  <p className="mb-0 fw-semibold text-dark text-truncate" style={{ fontSize: "0.85rem" }}>
                                    {notif.title}
                                  </p>
                                  <p className="mb-1 text-muted small" style={{ fontSize: "0.75rem", lineHeight: "1.4" }}>
                                    {notif.message}
                                  </p>
                                  <p className="mb-0 text-muted" style={{ fontSize: "0.7rem" }}>
                                    {notif.time}
                                  </p>
                                </div>

                                {/* Area kanan: indikator + tombol hapus */}
                                <div className="d-flex flex-column align-items-center gap-1">
                                  {!notif.isRead && (
                                    <div
                                      className="rounded-circle bg-primary"
                                      style={{ width: "8px", height: "8px" }}
                                    />
                                  )}

                                  {/* Tombol hapus (UI only) */}
                                  <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                      width: "20px",
                                      height: "20px",
                                      cursor: "pointer",
                                      background: "#f1f5f9",
                                    }}
                                    title="Hapus notifikasi"
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                                  >
                                    <X size={12} className="text-muted" />
                                  </div>
                                </div>
                              </div>

                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-3 py-2 border-top bg-light text-center">
                        <Link
                          to="/notifications"
                          className="text-decoration-none small fw-semibold"
                          style={{ color: "#2563eb" }}
                        >
                          Lihat Semua Notifikasi
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link to="/profile" className="text-decoration-none d-none d-sm-block">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "linear-gradient(135deg, #2563eb, #16a34a)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontSize: "0.9rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {user.full_name?.charAt(0) || "U"}
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-fill overflow-auto p-3 p-sm-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}