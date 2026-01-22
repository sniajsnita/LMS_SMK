import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import {
  LayoutDashboard, Info, BookOpen, GraduationCap, FileText, MessageSquare, BarChart3, LogOut, User, Mail, Settings, Menu, X, Bell, ChevronDown,
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

  // STATE NOTIFIKASI (MENGGANTIKAN DUMMY)
  const [notifications, setNotifications] = useState([]);

  // 1. Fungsi Ambil Data Notifikasi dari Database
  const fetchNotifications = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(10); // Ambil 10 terbaru untuk di header

    if (!error) setNotifications(data || []);
  };

  // 2. Fungsi Format Waktu (Contoh: "5 menit yang lalu")
  const formatTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHrs = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMins < 1) return "Baru saja";
    if (diffInMins < 60) return `${diffInMins} menit lalu`;
    if (diffInHrs < 24) return `${diffInHrs} jam lalu`;
    return past.toLocaleDateString('id-ID');
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser({
          full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          email: session.user.email,
        });
        // Panggil fetch notif setelah user dipastikan ada
        fetchNotifications();
      } else {
        navigate("/login");
      }
    };

    fetchUser();

    // SETUP REALTIME: Update otomatis saat ada notif baru di DB
    const channel = supabase
      .channel('header-notifs')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' }, 
        () => fetchNotifications()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [navigate]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

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

  // Ikon berdasarkan tipe dari Database
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'assignment': return FileText;
      case 'discussion': return MessageSquare;
      case 'grade': return BarChart3;
      case 'announcement': return Info;
      case 'material': return BookOpen;
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="d-flex min-vh-100" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #f0fdf4 100%)" }}>
      
      {isSidebarOpen && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" style={{ zIndex: 1040 }} onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`bg-white border-end position-fixed d-flex flex-column ${isSidebarOpen ? "d-flex" : "d-none d-lg-flex"}`}
        style={{ width: "280px", height: "100vh", zIndex: 1050, transition: "all 0.3s ease", boxShadow: "2px 0 20px rgba(0, 0, 0, 0.05)", background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", left: 0, top: 0 }}>
        
        <button className="btn btn-link d-lg-none position-absolute top-0 end-0 p-3" onClick={() => setIsSidebarOpen(false)} style={{ zIndex: 1051 }}>
          <X size={24} />
        </button>

        <div className="p-3 p-sm-4 border-bottom flex-shrink-0" style={{ background: "linear-gradient(135deg, #eff6ff, #f0fdf4)" }}>
          <div className="d-flex align-items-center gap-2 gap-sm-3">
            <div className="rounded-4 d-flex align-items-center justify-content-center shadow-sm p-2" style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #2563eb, #16a34a)" }}>
              <GraduationCap size={24} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: "1.1rem" }}>EduSpace</h5>
              <small className="text-muted d-block text-truncate" style={{ fontSize: "0.7rem" }}>Platform Pembelajaran</small>
            </div>
          </div>
        </div>

        <div className="p-2 p-sm-3 flex-grow-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          <p className="text-muted text-uppercase small fw-semibold px-3 mb-2" style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}>Menu Utama</p>
          <ul className="nav nav-pills flex-column gap-1 mb-3">
            {menu.map((item, i) => (
              <li key={i} className="nav-item">
                <Link to={item.path} className={`nav-link d-flex align-items-center gap-2 gap-sm-3 ${location.pathname === item.path ? "text-white" : "text-dark"}`}
                  style={{ borderRadius: "12px", padding: "10px 12px", transition: "all 0.2s ease", background: location.pathname === item.path ? "linear-gradient(135deg, #2563eb, #16a34a)" : "transparent", fontWeight: location.pathname === item.path ? "600" : "500", fontSize: "0.9rem" }}>
                  <item.icon size={18} />
                  <span className="flex-grow-1">{item.title}</span>
                  {item.badge && <span className="badge rounded-pill" style={{ background: location.pathname === item.path ? "rgba(255, 255, 255, 0.3)" : "#ef4444", fontSize: "0.65rem" }}>{item.badge}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* User Profile Footer */}
        <div className="border-top p-3 p-sm-4 flex-shrink-0 profile-dropdown-container">
          <div className="position-relative">
            <button className="btn btn-light w-100 d-flex align-items-center gap-2 p-2 border-0" style={{ borderRadius: "12px" }} onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #2563eb, #16a34a)", fontSize: "0.9rem" }}>
                {user.full_name?.charAt(0) || "U"}
              </div>
              <div className="flex-grow-1 text-start overflow-hidden">
                <p className="mb-0 fw-semibold small text-dark text-truncate">{user.full_name}</p>
                <p className="mb-0 text-muted text-truncate" style={{ fontSize: "0.7rem" }}>{user.email}</p>
              </div>
              <ChevronDown size={14} className="text-muted" />
            </button>
            {isProfileOpen && (
              <div className="position-absolute bottom-100 start-0 w-100 mb-2 bg-white border rounded-3 shadow-lg overflow-hidden">
                <Link to="/profile" className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark small hover-bg-light"><User size={16} /> Profil</Link>
                <button onClick={() => navigate("/login")} className="d-flex align-items-center gap-2 px-3 py-2 text-danger border-0 bg-transparent w-100 text-start small"><LogOut size={16} /> Keluar</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-fill d-flex flex-column main-content" style={{ marginLeft: "0", transition: "margin-left 0.3s ease", width: "100%" }}>
        <style>{`@media (min-width: 992px) { .main-content { margin-left: 280px !important; width: calc(100% - 280px) !important; } }`}</style>

        {/* HEADER */}
        <header className="bg-white border-bottom px-3 px-sm-4 py-2 py-sm-3 sticky-top" style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", zIndex: 1030 }}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <button className="btn btn-light d-lg-none p-2 border-0" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={20} /></button>
              <h4 className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: "clamp(1rem, 4vw, 1.5rem)" }}>
                {menu.find(m => m.path === location.pathname)?.title || "EduSpace"}
              </h4>
            </div>
            
            <div className="d-flex align-items-center gap-2 gap-sm-3">
              {/* NOTIFICATION DROP-DOWN */}
              <div className="position-relative notification-container">
                <button className="btn btn-light position-relative p-2 border-0" style={{ borderRadius: "10px" }} onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.6rem", padding: "2px 5px" }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="position-absolute bg-white border rounded-3 shadow-lg" style={{ top: "calc(100% + 8px)", right: 0, width: "320px", maxWidth: "90vw", maxHeight: "400px", zIndex: 1000, overflow: "hidden" }}>
                    <div className="px-3 py-2 border-bottom bg-light d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 fw-bold small">Notifikasi</h6>
                      <span className="badge bg-primary rounded-pill" style={{ fontSize: "0.6rem" }}>{unreadCount} Baru</span>
                    </div>

                    <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
                      {notifications.length === 0 ? (
                        <div className="text-center py-4 text-muted"><p className="small mb-0">Tidak ada notifikasi</p></div>
                      ) : (
                        notifications.map((notif) => {
                          const NotifIcon = getNotificationIcon(notif.type);
                          return (
                            <div key={notif.id} className="px-3 py-2 border-bottom" 
                              style={{ background: notif.is_read ? "white" : "#eff6ff", cursor: "pointer" }}
                              onClick={() => { navigate('/notifications'); setIsNotificationOpen(false); }}>
                              <div className="d-flex gap-2 align-items-start">
                                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                                  style={{ width: "32px", height: "32px", background: notif.is_read ? "#e5e7eb" : "linear-gradient(135deg, #2563eb, #16a34a)" }}>
                                  <NotifIcon size={14} className={notif.is_read ? "text-muted" : "text-white"} />
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                  <p className="mb-0 fw-semibold text-dark text-truncate small">{notif.title}</p>
                                  <p className="mb-0 text-muted text-truncate small" style={{ fontSize: "0.7rem" }}>{notif.message}</p>
                                  <p className="mb-0 text-muted" style={{ fontSize: "0.6rem" }}>{formatTime(notif.created_at)}</p>
                                </div>
                                {!notif.is_read && <div className="rounded-circle bg-primary mt-2" style={{ width: "6px", height: "6px" }} />}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="px-3 py-2 border-top bg-light text-center">
                      <Link to="/notifications" className="text-decoration-none small fw-semibold" onClick={() => setIsNotificationOpen(false)}>Lihat Semua</Link>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/profile" className="text-decoration-none d-none d-sm-block">
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #2563eb, #16a34a)", fontSize: "0.9rem" }}>
                  {user.full_name?.charAt(0) || "U"}
                </div>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-fill overflow-auto p-3 p-sm-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}