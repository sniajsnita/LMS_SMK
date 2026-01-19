import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; // Sesuaikan path-nya
import {
  User, Mail, Phone, MapPin, Calendar, Building, Camera, Save, Edit, X,
} from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // State untuk data dari database
  const [profile, setProfile] = useState(null);
  const [userAuth, setUserAuth] = useState(null);
  
  // State untuk form edit
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    phone: "",
    address: "",
    date_of_birth: "",
    institution: ""
  });

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUserAuth(user);

      if (user) {
        let { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        
        if (data) {
          setProfile(data);
          setFormData({
            username: data.username || "",
            bio: data.bio || "",
            phone: data.phone || "",
            address: data.address || "",
            date_of_birth: data.date_of_birth || "",
            institution: data.institution || ""
          });
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userAuth.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Upload file
      const { error: uploadError } = await supabase.storage
        .from('lms-files')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Buat Signed URL (PENTING: Jangan gunakan getPublicUrl untuk bucket privat)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('lms-files')
        .createSignedUrl(filePath, 315360000); // Aktif selama 10 tahun

      if (signedError) throw signedError;

      const finalUrl = signedData.signedUrl;

      // 3. Update database profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: finalUrl })
        .eq('id', userAuth.id);

      if (updateError) throw updateError;
      
      // 4. Update State UI agar foto langsung muncul tanpa refresh
      setProfile(prev => ({ ...prev, avatar_url: finalUrl }));
      
      alert("✅ Foto profil berhasil diperbarui!");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          bio: formData.bio,
          phone: formData.phone,
          address: formData.address,
          date_of_birth: formData.date_of_birth,
          institution: formData.institution,
          updated_at: new Date(),
        })
        .eq("id", userAuth.id);

      if (error) throw error;
      
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      alert("✅ Profil berhasil diupdate!");
    } catch (error) {
      alert("Gagal update profil: " + error.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: profile?.username || "",
      bio: profile?.bio || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      date_of_birth: profile?.date_of_birth || "",
      institution: profile?.institution || ""
    });
    setIsEditing(false);
  };

  if (loading) return <div className="p-5 text-center">Memuat profil...</div>;

  return (
    <div className="p-3 p-md-4 p-lg-5">
      {/* HEADER CARD */}
      <div className="card border-0 shadow-sm mb-4 position-relative overflow-hidden" style={{ borderRadius: "20px" }}>
        <div style={{ background: "linear-gradient(135deg, #2563eb, #16a34a)", height: "200px", position: "relative" }}>
          <div className="position-absolute rounded-circle" style={{ width: "250px", height: "250px", background: "rgba(255, 255, 255, 0.1)", top: "-100px", right: "-100px" }} />
          <div className="position-absolute rounded-circle" style={{ width: "180px", height: "180px", background: "rgba(255, 255, 255, 0.05)", bottom: "-50px", left: "-50px" }} />
        </div>

        <div className="card-body p-4 p-md-5 position-relative" style={{ marginTop: "-80px" }}>
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-4 mb-4">
            <div className="position-relative">
              <div
                className="rounded-circle border border-4 border-white shadow-lg d-flex align-items-center justify-content-center text-white fw-bold bg-white"
                style={{ width: "140px", height: "140px", fontSize: "3rem", background: "linear-gradient(135deg, #2563eb, #16a34a)", overflow: "hidden" }}
              >
                {profile?.avatar_url ? (
                  <img 
                    key={profile.avatar_url} // Menambahkan key memaksa React render ulang saat URL ganti
                    src={profile.avatar_url}
                    alt="Profile" 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                ) : (
                  userAuth?.user_metadata?.full_name?.charAt(0) || "U"
                )}
              </div>
              
              <label className="position-absolute bottom-0 end-0 btn btn-light rounded-circle shadow-lg d-flex align-items-center justify-content-center" style={{ width: "44px", height: "44px", cursor: "pointer", border: "3px solid white" }}>
                {isUploading ? (
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                ) : (
                  <Camera size={20} style={{ color: "#2563eb" }} />
                )}
                <input type="file" accept="image/*" onChange={handleFileUpload} className="d-none" disabled={isUploading} />
              </label>
            </div>

            <div className="flex-grow-1">
              <h1 className="fw-bold display-6 mb-2">{userAuth?.user_metadata?.full_name || "User"}</h1>
              <p className="text-muted mb-2">@{profile?.username || "belum_set"}</p>
              <p className="text-muted mb-3 d-flex align-items-center gap-2">
                <Mail size={16} /> {userAuth?.email}
              </p>
              {/* <span className="badge" style={{ background: "rgba(37, 99, 235, 0.1)", color: "#2563eb", padding: "8px 16px", borderRadius: "8px", fontSize: "0.875rem", fontWeight: "600" }}>
                👨‍🎓 Siswa
              </span> */}
            </div>

            <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={() => isEditing ? handleCancel() : setIsEditing(true)} style={{ borderRadius: "12px", padding: "10px 24px", fontWeight: "600" }}>
              {isEditing ? <><X size={18} /> Batal</> : <><Edit size={18} /> Edit Profil</>}
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <div className="card-header border-0 bg-white pt-4"><h5 className="fw-bold mb-0">Informasi Dasar</h5></div>
            <div className="card-body p-4">
              <div className="d-flex flex-column gap-4">
                <InfoItem icon={<User size={20} color="#2563eb"/>} label="Username" bg="#dbeafe">
                  {isEditing ? <input type="text" className="form-control" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} /> : (profile?.username || '-')}
                </InfoItem>

                <InfoItem icon={<Mail size={20} color="#2563eb"/>} label="Email" bg="#dbeafe">
                  {userAuth?.email}
                </InfoItem>

                <InfoItem icon={<Phone size={20} color="#16a34a"/>} label="Telepon" bg="#dcfce7">
                  {isEditing ? <input type="tel" className="form-control" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /> : (profile?.phone || '-')}
                </InfoItem>

                <InfoItem icon={<Calendar size={20} color="#9333ea"/>} label="Tanggal Lahir" bg="#faf5ff">
                  {isEditing ? <input type="date" className="form-control" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} /> : (profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-')}
                </InfoItem>

                <InfoItem icon={<Building size={20} color="#ea580c"/>} label="Institusi" bg="#fff7ed">
                  {isEditing ? <input type="text" className="form-control" value={formData.institution} onChange={(e) => setFormData({...formData, institution: e.target.value})} /> : (profile?.institution || '-')}
                </InfoItem>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-4">
            <SectionCard title="Tentang Saya" icon={<User size={20} />}>
              {isEditing ? <textarea className="form-control" rows="5" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} /> : (profile?.bio || 'Belum ada bio.')}
            </SectionCard>

            <SectionCard title="Alamat" icon={<MapPin size={20} />}>
              {isEditing ? <textarea className="form-control" rows="3" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} /> : (profile?.address || 'Belum ada alamat')}
            </SectionCard>

            {isEditing && (
              <div className="d-flex gap-3">
                <button className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2" onClick={handleSubmit} style={{ background: "linear-gradient(135deg, #2563eb, #16a34a)", border: "none", borderRadius: "12px", padding: "12px 24px", fontWeight: "600" }}>
                  <Save size={20} /> Simpan Perubahan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Helper Kecil agar kode bersih
function InfoItem({ icon, label, children, bg }) {
  return (
    <div className="d-flex align-items-start gap-3">
      <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "44px", height: "44px", background: bg }}>{icon}</div>
      <div className="flex-grow-1">
        <p className="text-muted small mb-1">{label}</p>
        <div className="fw-semibold mb-0">{children}</div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
      <div className="card-header border-0 bg-white pt-4"><h5 className="fw-bold mb-0 d-flex align-items-center gap-2">{icon} {title}</h5></div>
      <div className="card-body p-4"><div className="p-4 rounded-3" style={{ background: "#f8f9fa" }}>{children}</div></div>
    </div>
  );
}