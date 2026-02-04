import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { GraduationCap, Target, Users, Award, BookOpen, Lightbulb, Mail, Phone, CheckCircle } from "lucide-react";

export default function About() {
  const [teachers, setTeachers] = useState([]);
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTeachers(data);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">

      {/* HEADER */}
      <div className="text-center mb-5">
        <div 
          className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle mb-4 shadow-lg p-2"
          style={{ width: "140px", height: "140px" }}
        >
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeFIcOp1yIjNCFfhIDgz9EElX9oMNOs5drlQ&s"
            className="rounded-circle"
            width="120"
            height="120"
            alt="Logo SMK"
            style={{ objectFit: "contain" }}
          />
        </div>
        <h1 className="fw-bold display-5 mb-3 text-dark">Learning Management System</h1>
        <p className="text-muted fs-5 mx-auto" style={{ maxWidth: "700px" }}>
          Solusi Inovatif Tingkatkan Pembelajaran di SMK Teknik Muhammadiyah Plus Cianjur
        </p>
      </div>

      {/* VISI MISI */}
      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <div 
            className="card h-100 border-0 shadow-sm"
            style={{ 
              background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(37, 99, 235, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="card-body p-5">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{ width: "60px", height: "60px", background: "#2563eb" }}
              >
                <Target size={32} className="text-white" />
              </div>
              <h3 className="fw-bold mb-3">Visi Kami</h3>
              <p className="text-muted mb-0 lh-lg">
                Menjadi platform pembelajaran digital terdepan yang mendukung transformasi pendidikan 
                di SMK Teknik Muhammadiyah Plus Cianjur menuju pembelajaran yang lebih efektif, 
                efisien, dan menyenangkan.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div 
            className="card h-100 border-0 shadow-sm"
            style={{ 
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(22, 163, 74, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="card-body p-5">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{ width: "60px", height: "60px", background: "#16a34a" }}
              >
                <Lightbulb size={32} className="text-white" />
              </div>
              <h3 className="fw-bold mb-3">Misi Kami</h3>
              <ul className="list-unstyled mb-0">
                <li className="d-flex align-items-start mb-2">
                  <CheckCircle size={20} className="text-success me-2 flex-shrink-0 mt-1" />
                  <span className="text-muted">Menyediakan platform pembelajaran yang mudah diakses dan user-friendly</span>
                </li>
                <li className="d-flex align-items-start mb-2">
                  <CheckCircle size={20} className="text-success me-2 flex-shrink-0 mt-1" />
                  <span className="text-muted">Memfasilitasi kolaborasi antara guru, siswa, dan orang tua</span>
                </li>
                <li className="d-flex align-items-start">
                  <CheckCircle size={20} className="text-success me-2 flex-shrink-0 mt-1" />
                  <span className="text-muted">Meningkatkan kualitas pembelajaran melalui teknologi digital</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FITUR */}
      <h2 className="text-center fw-bold mb-4 display-6">Fitur Utama</h2>
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div 
            className="card h-100 border-0 shadow-sm text-center"
            style={{ transition: "all 0.3s ease" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-10px)";
              e.currentTarget.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="card-body p-5">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{ width: "80px", height: "80px", background: "#dbeafe" }}
              >
                <BookOpen size={40} style={{ color: "#2563eb" }} />
              </div>
              <h4 className="fw-bold mb-3">Manajemen Kelas</h4>
              <p className="text-muted mb-0">
                Kelola kelas, materi, tugas, dan kuis dengan mudah dalam satu platform terintegrasi
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div 
            className="card h-100 border-0 shadow-sm text-center"
            style={{ transition: "all 0.3s ease" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-10px)";
              e.currentTarget.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="card-body p-5">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{ width: "80px", height: "80px", background: "#dcfce7" }}
              >
                <Users size={40} style={{ color: "#16a34a" }} />
              </div>
              <h4 className="fw-bold mb-3">Forum Diskusi</h4>
              <p className="text-muted mb-0">
                Diskusi interaktif, tugas kolaboratif, dan komunikasi real-time antara guru dan siswa
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div 
            className="card h-100 border-0 shadow-sm text-center"
            style={{ transition: "all 0.3s ease" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-10px)";
              e.currentTarget.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="card-body p-5">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{ width: "80px", height: "80px", background: "#faf5ff" }}
              >
                <Award size={40} style={{ color: "#9333ea" }} />
              </div>
              <h4 className="fw-bold mb-3">Monitoring Progress</h4>
              <p className="text-muted mb-0">
                Pantau perkembangan belajar siswa dengan dashboard khusus untuk guru dan orang tua
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GALERI */}
      <h2 className="text-center fw-bold mb-4 display-6">Galeri Sekolah</h2>
      <div className="row g-4 mb-5">
        {[
          { img: "https://cdn-sekolah.annibuku.com/20252208/2.jpg", label: "Gedung Utama" },
          { img: "https://assets-a1.kompasiana.com/items/album/2026/01/05/copy-of-29-695b2c5fed64151c5f57bb62.jpg", label: "Ruang Kelas" },
          { img: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400", label: "Laboratorium" }
        ].map((item, i) => (
          <div className="col-md-4" key={i}>
            <div 
              className="card border-0 shadow-sm overflow-hidden"
              style={{ transition: "transform 0.3s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <img 
                src={item.img} 
                className="card-img-top"
                style={{ height: "220px", objectFit: "cover" }}
                alt={item.label}
              />
              <div className="card-body text-center py-3">
                <p className="mb-0 fw-semibold">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DAFTAR GURU */}
      <h2 className="text-center fw-bold mb-4 display-6">Tenaga Pengajar</h2>
      <div className="row g-4 mb-5">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : teachers.map((guru) => (
          <div className="col-6 col-md-3" key={guru.id}>
            <div
              className="card text-center border-0 shadow-sm h-100 p-4"
              style={{ cursor: "pointer", transition: "0.3s" }}
              data-bs-toggle="modal"
              data-bs-target="#guruModal"
              onClick={() => setSelectedGuru(guru)}
            >
              <img 
                src={guru.avatar_url || `https://ui-avatars.com/api/?name=${guru.name}&background=random`} 
                className="rounded-circle mx-auto mb-3 border border-3 border-primary" 
                width="90" height="90" 
                style={{ objectFit: "cover" }} 
              />
              <h6 className="fw-bold mb-1">{guru.name}</h6>
              <p className="small text-muted mb-0">{guru.subject}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PROFIL GURU (DISATUKAN DI SINI) */}
      <div className="modal fade" id="guruModal" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            {selectedGuru && (
              <>
                <div className="modal-header border-0 pb-0">
                  <h4 className="modal-title fw-bold">Profil Pengajar</h4>
                  <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-4">
                    <div className="col-md-4 text-center">
                      <img 
                        src={selectedGuru.avatar_url || `https://ui-avatars.com/api/?name=${selectedGuru.name}&background=random`} 
                        className="rounded-circle mb-3 border border-4 border-primary shadow" 
                        width="150" height="150" 
                        style={{ objectFit: "cover" }} 
                      />
                      <h5 className="fw-bold mb-2">{selectedGuru.name}</h5>
                      <span className="badge rounded-pill px-3 py-2" style={{ background: "#dbeafe", color: "#2563eb" }}>
                        {selectedGuru.subject}
                      </span>
                    </div>
                    <div className="col-md-8">
                      <p className="text-muted lh-lg mb-4">{selectedGuru.description || "Belum ada informasi biografi."}</p>
                      
                      <div className="mb-4">
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><Mail size={18} className="text-primary" /> Kontak</h6>
                        <div className="ms-4 small text-muted">
                          <p className="mb-1 fw-bold">{selectedGuru.email}</p>
                          <p className="mb-0 text-success fw-bold">{selectedGuru.contact || "-"}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><GraduationCap size={18} className="text-success" /> Pendidikan</h6>
                        <p className="ms-4 small text-muted">{selectedGuru.education || "Belum diisi"}</p>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><Award size={18} className="text-secondary" /> Keahlian</h6>
                        <p className="ms-4 small text-muted">{selectedGuru.skills || "Belum diisi"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TENTANG SMK */}
      <div 
        className="card border-0 shadow-sm mb-5"
        style={{ background: "linear-gradient(135deg, #f9fafb, #f3f4f6)" }}
      >
        <div className="card-body p-5">
          <h2 className="text-center fw-bold mb-4 display-6">
            Tentang SMK Teknik Muhammadiyah Plus Cianjur
          </h2>
          <div className="mx-auto" style={{ maxWidth: "900px" }}>
            <p className="text-muted lh-lg mb-4">
              <strong>SMK Teknik Muhammadiyah Plus Cianjur</strong> adalah lembaga pendidikan menengah kejuruan 
              yang berkomitmen menghasilkan lulusan berkualitas dengan kompetensi teknik yang mumpuni 
              dan karakter Islami yang kuat.
            </p>
            <p className="text-muted lh-lg mb-4">
              Dengan menggabungkan kurikulum nasional dan nilai-nilai Muhammadiyah, kami mempersiapkan 
              siswa untuk menjadi tenaga profesional yang siap kerja, berakhlak mulia, dan mampu 
              bersaing di era digital.
            </p>
            <div className="row g-4 mt-4">
              {[
                { color: "#2563eb", title: "Pendidikan Berkualitas", desc: "Tenaga pengajar profesional dan fasilitas pembelajaran modern" },
                { color: "#16a34a", title: "Karakter Islami", desc: "Pembinaan akhlak dan spiritual berbasis nilai-nilai Islam" },
                { color: "#9333ea", title: "Kompetensi Teknik", desc: "Program keahlian yang sesuai dengan kebutuhan industri" },
                { color: "#ea580c", title: "Kesiapan Kerja", desc: "Kerja sama dengan industri dan program magang berkualitas" }
              ].map((item, i) => (
                <div className="col-md-6" key={i}>
                  <div className="d-flex align-items-start gap-3">
                    <div 
                      className="rounded-circle flex-shrink-0 mt-1"
                      style={{ width: "10px", height: "10px", background: item.color }}
                    ></div>
                    <div>
                      <h5 className="fw-bold mb-1">{item.title}</h5>
                      <p className="text-muted small mb-0">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center pt-4 border-top">
        <p className="text-muted mb-0">
          © 2025 EduSpace - SMK Teknik Muhammadiyah Plus Cianjur
        </p>
      </div>
    </div>
  );
}