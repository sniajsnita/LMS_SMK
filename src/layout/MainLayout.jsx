import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import {
  LayoutDashboard,Info,BookOpen,GraduationCap,FileText,MessageSquare,BarChart3,LogOut,User,Mail,Settings as SettingsIcon,Menu,X,Bell,ChevronDown,
} from "lucide-react";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // State user diinisialisasi kosong
  const [user, setUser] = useState({
    full_name: "",
    email: "",
    // user_type: ""
  });

  // Ambil data dari Supabase Auth
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser({
          // Prioritas: metadata full_name, jika tidak ada pakai email
          full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          email: session.user.email,
          // user_type: session.user.user_metadata?.user_type || "student"
        });
      } else {
        // Jika tidak login, arahkan ke halaman login
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

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
        }}
      >
        {/* Close button for mobile */}
        <button
          className="btn btn-link d-lg-none position-absolute top-0 end-0 p-3"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={24} />
        </button>

        {/* Logo */}
        <div className="p-4 border-bottom flex-shrink-0" style={{ background: "linear-gradient(135deg, #eff6ff, #f0fdf4)" }}>
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-4 d-flex align-items-center justify-content-center shadow-sm p-2"
              style={{
                width: "48px",
                height: "48px",
                background: "linear-gradient(135deg, #2563eb, #16a34a)",
              }}
            >
              <GraduationCap size={28} className="text-white" />
            </div>
            <div>
              <h5 className="mb-0 fw-bold text-dark">EduSpace</h5>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                {user?.user_type === "parent" ? "Portal Orang Tua" : "Platform Pembelajaran"}
              </small>
            </div>
          </div>
        </div>

        {/* MENU */}
        <div 
          className="p-3 flex-grow-1 overflow-y-auto overflow-x-hidden" 
          style={{ 
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 transparent"
          }}
        >
          <p className="text-muted text-uppercase small fw-semibold px-3 mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>
            Menu Utama
          </p>
          <ul className="nav nav-pills flex-column gap-1 mb-3">
            {menu.map((item, i) => (
              <li key={i} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link d-flex align-items-center gap-3 position-relative ${
                    location.pathname === item.path
                      ? "text-white"
                      : "text-dark"
                  }`}
                  style={{
                    borderRadius: "12px",
                    padding: "12px 16px",
                    transition: "all 0.2s ease",
                    background: location.pathname === item.path
                      ? "linear-gradient(135deg, #2563eb, #16a34a)"
                      : "transparent",
                    fontWeight: location.pathname === item.path ? "600" : "500",
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
                  <item.icon size={20} />
                  <span className="flex-grow-1">{item.title}</span>
                  {item.badge && (
                    <span
                      className="badge rounded-pill"
                      style={{
                        background: location.pathname === item.path ? "rgba(255, 255, 255, 0.3)" : "#ef4444",
                        color: "white",
                        fontSize: "0.7rem",
                        padding: "4px 8px",
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
        <div className="border-top p-4 flex-shrink-0">
          <div className="position-relative">
            <button
              className="btn btn-light w-100 d-flex align-items-center gap-3 p-3 border-0"
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
                  width: "40px",
                  height: "40px",
                  background: "linear-gradient(135deg, #2563eb, #16a34a)",
                  fontSize: "1rem",
                }}
              >
                {user.full_name?.charAt(0) || "U"}
              </div>
              <div className="flex-grow-1 text-start overflow-hidden">
                <p className="mb-0 fw-semibold small text-dark text-truncate">{user.full_name}</p>
                <p className="mb-0 text-muted text-truncate" style={{ fontSize: "0.75rem" }}>{user.email}</p>
              </div>
              <ChevronDown size={16} className="text-muted" />
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
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  <User size={16} />
                  <span className="small">Profil Saya</span>
                </Link>
                <Link
                  to="/invitations"
                  className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark position-relative"
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  <Mail size={16} />
                  <span className="small">Undangan</span>
                  <span
                    className="badge rounded-pill bg-danger position-absolute"
                    style={{ fontSize: "0.65rem", top: "50%", right: "12px", transform: "translateY(-50%)" }}
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
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  <SettingsIcon size={16} />
                  <span className="small">Pengaturan</span>
                </Link>
                <button
                  className="d-flex align-items-center gap-2 px-3 py-2 text-danger border-0 bg-transparent w-100 text-start"
                  style={{
                    borderRadius: "0 0 12px 12px",
                    transition: "background 0.2s ease",
                  }}
                  onClick={() => {
                    // kalau nanti pakai auth, logout di sini
                    // localStorage.removeItem("token");

                    navigate("/login");
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fef2f2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <LogOut size={16} />
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
            marginLeft: "280px",
            transition: "margin-left 0.3s ease",
        }}
        >
        {/* HEADER */}
        <header
          className="bg-white border-bottom px-4 py-3 sticky-top"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            zIndex: 1030,
          }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-light d-lg-none p-2 border-0"
                style={{ borderRadius: "10px" }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu size={20} />
              </button>
              <h4 className="mb-0 fw-bold text-dark">
                {menu.find(m => m.path === location.pathname)?.title || ""}
              </h4>
            </div>
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-light position-relative p-2 border-0"
                style={{
                  borderRadius: "10px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#eff6ff";
                  e.currentTarget.style.color = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f8f9fa";
                  e.currentTarget.style.color = "#212529";
                }}
              >
                <Bell size={20} />
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "0.6rem", padding: "3px 6px" }}
                >
                  5
                </span>
              </button>
              <Link to="/profile" className="text-decoration-none">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "linear-gradient(135deg, #2563eb, #16a34a)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
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
        <main className="flex-fill overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}