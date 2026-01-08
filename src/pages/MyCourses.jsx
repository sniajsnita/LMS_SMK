import React, { useState, useEffect } from "react"; // Tambahkan useEffect
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase"; 
import { BookOpen, Search, Users, Plus, Filter, Grid, List, Loader2 } from "lucide-react";

export default function MyCourses() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  
  // STATE DINAMIS
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data saat halaman dimuat
  useEffect(() => {
    fetchMyCourses();
  }, []);

  // const fetchMyCourses = async () => {
  //   try {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     console.log("User ID saat ini:", user?.id); // CEK 1

  //     const { data, error } = await supabase
  //       .from('course_members')
  //       .select(`
  //         role,
  //         courses (*) 
  //       `)
  //       .eq('user_id', user.id);

  //     if (error) {
  //       console.error("Error dari Supabase:", error.message); // CEK 2
  //       return;
  //     }

  //     console.log("Data mentah dari Supabase:", data); // CEK 3
      
  //     // ... rest of code
  //   } catch (err) {
  //     console.error("Internal Error:", err);
  //   }
  // };

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Ambil data membership dan detail kelas  
      const { data, error } = await supabase
        .from('course_members')
        .select(`
          role,
          courses (
            *,
            course_members(count)
          )
        `)
        .eq('user_id', user.id)
        .eq('role', 'student')
        .eq('courses.course_members.role', 'student'); // Filter count untuk siswa saja

      if (error) throw error;

      // 2. Ambil semua ID pengajar (created_by) dari kelas yang ditemukan
      // Kita kumpulkan ID unik agar tidak fetch berulang kali
      const teacherIds = [...new Set(data
        .filter(item => item.courses !== null)
        .map(item => item.courses.created_by)
      )].filter(id => id !== null);

      // 3. Fetch data nama pengajar dari tabel profiles secara manual
      const { data: profiles, error: profileError } = await supabase
        .from('profiles') // Ganti dengan 'profiles' atau tabel tempat Anda menyimpan nama user
        .select('id, full_name')
        .in('id', teacherIds);

      if (profileError) console.error("Profile Fetch Error:", profileError.message);

      // 4. Gabungkan data
      const formatted = data
        .filter(item => item.courses !== null)
        .map(item => {
          // Cari profil pengajar yang cocok dengan created_by di tabel courses
          const instructor = profiles?.find(p => p.id === item.courses.created_by);

          return {
            id: item.courses.id,
            title: item.courses.title,
            subject: item.courses.subject,
            description: item.courses.description,
            class_code: item.courses.class_code,
            
            // --- NAMA GURU DINAMIS ---
            teacher: instructor?.full_name || "Guru Pengampu", 
            
            students: item.courses.course_members?.[0]?.count || 0, 
            progress: item.progress || 0,
            coverImage: item.courses.cover_image,
            role: item.role 
          };
        });

      setCourses(formatted);
    } catch (error) {
      console.error("Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      alert("❌ Masukkan kode kelas terlebih dahulu");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Cari Course ID berdasarkan kode
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('class_code', joinCode.trim())
        .single();

      if (courseError || !course) throw new Error("Kode kelas tidak ditemukan!");

      // 2. Insert ke course_members sebagai student
      const { error: joinError } = await supabase
        .from('course_members')
        .insert([{ 
          user_id: user.id, 
          courses_id: course.id, 
          role: 'student',
          // progress: 0 
        }]);

      if (joinError) {
        if (joinError.code === '23505') throw new Error("Anda sudah bergabung di kelas ini.");
        throw joinError;
      }

      alert("✅ Berhasil bergabung dengan kelas!");
      setJoinCode("");
      setShowModal(false);
      fetchMyCourses(); // Refresh data
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading State UI
  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
        <Loader2 className="text-primary animate-spin mb-2" size={40} />
        <p className="text-muted fw-semibold">Memuat kelas Anda...</p>
      </div>
    );
  }

  return (
    <div className="p-3 p-md-4 p-lg-5">
      {/* --- BAGIAN UI DI BAWAH INI TETAP SAMA SEPERTI MILIK ANDA --- */}
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="fw-bold display-6 mb-2">Kelas Saya</h1>
          <p className="text-muted mb-0">Kelola dan ikuti kelas pembelajaran Anda</p>
        </div>

        <button
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #2563eb, #16a34a)",
            border: "none",
            padding: "12px 24px",
            borderRadius: "12px",
            fontWeight: "600",
            transition: "all 0.3s ease"
          }}
          onClick={() => setShowModal(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 10px 25px rgba(37, 99, 235, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          <Plus size={20} /> Gabung Kelas
        </button>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="row g-3 mb-4 align-items-center">
        <div className="col-md-6">
          <div className="position-relative">
            <Search
              size={20}
              className="position-absolute text-muted"
              style={{ top: "50%", left: "16px", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              className="form-control ps-5 border-0 shadow-sm"
              placeholder="Cari kelas, mata pelajaran, atau guru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                borderRadius: "12px",
                padding: "12px 16px 12px 48px",
                background: "#f8f9fa"
              }}
            />
          </div>
        </div>

        <div className="col-md-6 d-flex justify-content-md-end gap-2">
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2 border-0 shadow-sm" style={{ borderRadius: "12px", background: "#f8f9fa" }}>
            <Filter size={18} />
            <span className="d-none d-sm-inline">Filter</span>
          </button>
          <div className="btn-group shadow-sm" role="group">
            <button
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary border-0'}`}
              style={{ borderRadius: "12px 0 0 12px", background: viewMode === 'grid' ? '#2563eb' : '#f8f9fa' }}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
            <button
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary border-0'}`}
              style={{ borderRadius: "0 12px 12px 0", background: viewMode === 'list' ? '#2563eb' : '#f8f9fa' }}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* HEADER LIST */}
      <div className="mb-4">
        <h5 className="fw-bold d-flex align-items-center gap-2 mb-3">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: "32px", height: "32px", background: "#dbeafe" }}>
            <BookOpen size={18} style={{ color: "#2563eb" }} />
          </div>
          Kelas yang Diikuti
          <span className="badge rounded-pill ms-2" style={{ background: "#dbeafe", color: "#2563eb", padding: "6px 12px" }}>
            {filteredCourses.length}
          </span>
        </h5>
      </div>

      {/* LIST KELAS - GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="row g-4">
          {filteredCourses.length === 0 ? (
             <div className="col-12 text-center py-5">
                <BookOpen size={48} className="text-muted mb-2" style={{ opacity: 0.2 }} />
                <p className="text-muted">Kelas tidak ditemukan.</p>
             </div>
          ) : (
            filteredCourses.map((course) => (
              <div className="col-12 col-sm-6 col-lg-4" key={course.id}>
                <Link to={`/course-detail?id=${course.id}`} className="text-decoration-none">
                  <div className="card h-100 border-0 shadow-sm overflow-hidden" 
                    style={{ borderRadius: "16px", transition: "all 0.3s ease" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 15px 40px rgba(37, 99, 235, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "";
                    }}
                  >
                    <div className="position-relative" style={{ height: "180px", background: "linear-gradient(135deg, #2563eb, #16a34a)" }}>
                      {course.coverImage && <img src={course.coverImage} className="w-100 h-100" style={{ objectFit: "cover" }} />}
                      <div className="position-absolute w-100 h-100 top-0 start-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />
                      <span className="badge position-absolute top-0 end-0 m-3" style={{ background: "rgba(255, 255, 255, 0.95)", color: "#2563eb", padding: "8px 16px", borderRadius: "8px", fontWeight: "600" }}>
                        {course.subject}
                      </span>
                      <div className="position-absolute bottom-0 start-0 m-3 d-flex align-items-center gap-2 px-3 py-2" style={{ background: "rgba(255, 255, 255, 0.95)", borderRadius: "8px" }}>
                        <div className="progress" style={{ width: "60px", height: "6px", background: "#e5e7eb", borderRadius: "999px" }}>
                          <div className="progress-bar" style={{ width: `${course.progress}%`, background: "linear-gradient(90deg, #2563eb, #16a34a)", borderRadius: "999px" }} />
                        </div>
                        <span className="small fw-semibold text-dark">{course.progress}%</span>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <h5 className="fw-bold text-dark mb-2">{course.title}</h5>
                      <p className="text-muted small mb-3">{course.description}</p>
                      <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <Users size={16} /> <span>{course.teacher}</span>
                        </div>
                        <div className="d-flex align-items-center gap-1 text-muted small">
                          <Users size={16} /> <span>{course.students} siswa</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* LIST KELAS - LIST VIEW */}
      {viewMode === 'list' && (
        <div className="d-flex flex-column gap-3">
          {filteredCourses.map((course) => (
            <Link to={`/course-detail/${course.id}`} key={course.id} className="text-decoration-none">
              <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "16px", transition: "all 0.3s ease" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(8px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
              >
                <div className="row g-0">
                  <div className="col-md-3">
                    <div className="h-100 d-flex align-items-center justify-content-center" style={{ background: "linear-gradient(135deg, #2563eb, #16a34a)", minHeight: "160px" }}>
                      <BookOpen size={48} className="text-white" style={{ opacity: 0.4 }} />
                    </div>
                  </div>
                  <div className="col-md-9">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h5 className="fw-bold text-dark mb-2">{course.title}</h5>
                          <span className="badge" style={{ background: "#dbeafe", color: "#2563eb", padding: "6px 12px", borderRadius: "6px" }}>{course.subject}</span>
                        </div>
                        <div className="text-end">
                          <div className="small text-muted mb-1">Progress</div>
                          <div className="fw-bold" style={{ color: "#2563eb", fontSize: "1.25rem" }}>{course.progress}%</div>
                        </div>
                      </div>
                      <p className="text-muted small mb-3">{course.description}</p>
                      <div className="d-flex gap-4">
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <Users size={16} /> <span>{course.teacher}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <Users size={16} /> <span>{course.students} siswa</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* MODAL GABUNG KELAS */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Gabung Kelas</h5>
                  <button className="btn-close" onClick={() => setShowModal(false)} />
                </div>
                <div className="modal-body p-4">
                  <label className="form-label fw-semibold mb-2">Kode Kelas</label>
                  <input
                    type="text"
                    className="form-control border-0 shadow-sm mb-3"
                    placeholder="Masukkan kode (contoh: MATH123)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    style={{ padding: "12px 16px", borderRadius: "12px", background: "#f8f9fa" }}
                  />
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button className="btn btn-light" onClick={() => setShowModal(false)} style={{ borderRadius: "12px" }}>Batal</button>
                  <button className="btn btn-primary" onClick={handleJoinByCode} style={{ background: "linear-gradient(135deg, #2563eb, #16a34a)", border: "none", borderRadius: "12px", padding: "10px 24px" }}>Gabung</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} style={{ zIndex: 1040 }} />
        </>
      )}
    </div>
  );
}