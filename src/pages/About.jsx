import React, { useState } from "react";
import { GraduationCap, Target, Users, Award, BookOpen, Lightbulb, Mail, Phone, CheckCircle } from "lucide-react";

export default function About() {
  const [selectedGuru, setSelectedGuru] = useState(null);

  const guruList = [
    {
      name: "Dr. H. Ahmad Fauzi, M.Pd",
      role: "Kepala Sekolah",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      email: "ahmad.fauzi@smktmplus.sch.id",
      phone: "0812-3456-7890",
      bio: "Memiliki pengalaman lebih dari 20 tahun di bidang pendidikan. Meraih gelar Doktor dari Universitas Pendidikan Indonesia dengan spesialisasi Manajemen Pendidikan.",
      pendidikan: ["S3 Manajemen Pendidikan - UPI", "S2 Administrasi Pendidikan - UPI", "S1 Pendidikan - IKIP Bandung"],
      keahlian: ["Manajemen Sekolah", "Kepemimpinan Pendidikan", "Pengembangan Kurikulum"]
    },
    {
      name: "Ir. Budi Santoso, M.T",
      role: "Wakil Kepala Sekolah",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      email: "budi.santoso@smktmplus.sch.id",
      phone: "0813-4567-8901",
      bio: "Berpengalaman dalam bidang teknik dan pendidikan kejuruan. Aktif dalam pengembangan kurikulum SMK berbasis industri.",
      pendidikan: ["S2 Teknik Mesin - ITB", "S1 Teknik Mesin - ITB"],
      keahlian: ["Teknik Mesin", "Manajemen Bengkel", "Kurikulum Vokasi"]
    },
    {
      name: "Siti Nurhaliza, S.Pd",
      role: "Guru Matematika",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      email: "siti.nurhaliza@smktmplus.sch.id",
      phone: "0814-5678-9012",
      bio: "Guru matematika berdedikasi dengan metode pengajaran inovatif. Peraih penghargaan Guru Teladan Kabupaten Cianjur 2023.",
      pendidikan: ["S1 Pendidikan Matematika - UPI"],
      keahlian: ["Matematika Terapan", "Statistika", "Metode Pembelajaran Aktif"]
    },
    {
      name: "Drs. Hendra Wijaya",
      role: "Guru Teknik Mesin",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      email: "hendra.wijaya@smktmplus.sch.id",
      phone: "0815-6789-0123",
      bio: "Praktisi industri selama 15 tahun sebelum menjadi guru. Memiliki sertifikasi asesor kompetensi nasional.",
      pendidikan: ["S1 Teknik Mesin - Universitas Trisakti"],
      keahlian: ["CNC", "CAD/CAM", "Pemesinan Konvensional"]
    },
    {
      name: "Dewi Lestari, S.Kom",
      role: "Guru TKJ",
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      email: "dewi.lestari@smktmplus.sch.id",
      phone: "0816-7890-1234",
      bio: "Spesialis jaringan komputer dengan sertifikasi Cisco. Aktif mengikuti perkembangan teknologi terkini.",
      pendidikan: ["S1 Teknik Informatika - STMIK Bandung"],
      keahlian: ["Jaringan Komputer", "Cisco Networking", "Linux Administration"]
    },
    {
      name: "Muhammad Rizki, S.T",
      role: "Guru Teknik Elektro",
      img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
      email: "muhammad.rizki@smktmplus.sch.id",
      phone: "0817-8901-2345",
      bio: "Ahli di bidang instalasi listrik dan elektronika. Berpengalaman dalam proyek-proyek instalasi industri.",
      pendidikan: ["S1 Teknik Elektro - Polban"],
      keahlian: ["Instalasi Listrik", "PLC", "Elektronika Industri"]
    },
    {
      name: "Rina Wulandari, M.Pd",
      role: "Guru Bahasa Indonesia",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      email: "rina.wulandari@smktmplus.sch.id",
      phone: "0818-9012-3456",
      bio: "Guru bahasa dengan passion di bidang literasi. Pembina ekstrakulikuler jurnalistik dan penulisan kreatif.",
      pendidikan: ["S2 Pendidikan Bahasa Indonesia - UPI", "S1 Sastra Indonesia - Unpad"],
      keahlian: ["Sastra Indonesia", "Jurnalistik", "Public Speaking"]
    },
    {
      name: "Agus Prasetyo, S.Pd.I",
      role: "Guru PAI",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      email: "agus.prasetyo@smktmplus.sch.id",
      phone: "0819-0123-4567",
      bio: "Hafiz Quran dan pembina kegiatan keagamaan sekolah. Aktif dalam organisasi Muhammadiyah.",
      pendidikan: ["S1 Pendidikan Agama Islam - UIN Bandung"],
      keahlian: ["Fiqih", "Tahfidz", "Dakwah"]
    },
  ];

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
          { img: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400", label: "Gedung Utama" },
          { img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400", label: "Ruang Kelas" },
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
        {guruList.map((guru, i) => (
          <div className="col-6 col-md-3" key={i}>
            <div
              className="card text-center border-0 shadow-sm h-100"
              style={{ 
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              data-bs-toggle="modal"
              data-bs-target="#guruModal"
              onClick={() => setSelectedGuru(guru)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(37, 99, 235, 0.15)";
                e.currentTarget.style.borderColor = "#2563eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <div className="card-body p-4">
                <img 
                  src={guru.img} 
                  className="rounded-circle mx-auto mb-3 border border-3 border-primary" 
                  width="90" 
                  height="90"
                  style={{ objectFit: "cover" }}
                  alt={guru.name}
                />
                <h6 className="fw-bold mb-1">{guru.name}</h6>
                <p className="text-muted small mb-0">{guru.role}</p>
              </div>
            </div>
          </div>
        ))}
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

      {/* MODAL PROFIL GURU */}
      <div className="modal fade" id="guruModal" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            {selectedGuru && (
              <>
                <div className="modal-header border-0 pb-0">
                  <h4 className="modal-title fw-bold">Profil Pengajar</h4>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                  ></button>
                </div>

                <div className="modal-body p-4">
                  <div className="row g-4">
                    <div className="col-md-4 text-center">
                      <img
                        src={selectedGuru.img}
                        className="rounded-circle mb-3 border border-4 border-primary shadow"
                        width="150"
                        height="150"
                        style={{ objectFit: "cover" }}
                        alt={selectedGuru.name}
                      />
                      <h5 className="fw-bold mb-2">{selectedGuru.name}</h5>
                      <span 
                        className="badge rounded-pill px-3 py-2"
                        style={{ background: "#dbeafe", color: "#2563eb" }}
                      >
                        {selectedGuru.role}
                      </span>
                    </div>

                    <div className="col-md-8">
                      <p className="text-muted lh-lg mb-4">{selectedGuru.bio}</p>

                      <div className="mb-4">
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                          <Mail size={18} style={{ color: "#2563eb" }} />
                          Kontak
                        </h6>
                        <div className="ms-4">
                          <p className="small mb-2 d-flex align-items-center gap-2">
                            <Mail size={14} className="text-muted" />
                            {selectedGuru.email}
                          </p>
                          <p className="small mb-0 d-flex align-items-center gap-2">
                            <Phone size={14} className="text-muted" />
                            {selectedGuru.phone}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                          <GraduationCap size={18} style={{ color: "#16a34a" }} />
                          Pendidikan
                        </h6>
                        <ul className="ms-4 mb-0">
                          {selectedGuru.pendidikan.map((p, idx) => (
                            <li key={idx} className="small text-muted mb-1">{p}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                          <Award size={18} style={{ color: "#9333ea" }} />
                          Bidang Keahlian
                        </h6>
                        <div className="d-flex flex-wrap gap-2 ms-4">
                          {selectedGuru.keahlian.map((skill, i) => (
                            <span 
                              key={i}
                              className="badge rounded-pill px-3 py-2"
                              style={{ background: "#faf5ff", color: "#9333ea", border: "1px solid #e9d5ff" }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
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