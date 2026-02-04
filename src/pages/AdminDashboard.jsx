import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function SimpleAdminDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const initialFormState = { 
    name: '', email: '', description: '', subject: '', 
    contact: '', education: '', skills: '', avatar_url: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data);
    } catch (error) {
      alert('Gagal mengambil data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`; // Menggunakan timestamp agar unik
      const filePath = `avatars/${fileName}`;

      console.log("Memulai upload ke bucket lms-files...");

      // Upload ke Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lms-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Detail Error Storage:", uploadError);
        throw new Error(`Storage Error: ${uploadError.message}`);
      }

      // Ambil URL Publik
      const { data: urlData } = supabase.storage
        .from('lms-files')
        .getPublicUrl(filePath);

      console.log("URL didapat:", urlData.publicUrl);

      // Update state formData
      setFormData(prev => ({ 
        ...prev, 
        avatar_url: urlData.publicUrl 
      }));
      
      alert('Foto berhasil diunggah ke storage!');
    } catch (error) {
      console.error("Error Lengkap:", error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'contact' ? value.replace(/\D/g, "") : value
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('teachers')
        .insert([formData])
        .select();

      if (error) throw error;
      setTeachers([data[0], ...teachers]);
      resetForm();
      alert('Data dan URL foto berhasil disimpan!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('teachers')
        .update(formData)
        .eq('id', editId);

      if (error) throw error;
      setTeachers(teachers.map(t => t.id === editId ? { ...formData, id: editId } : t));
      resetForm();
      alert('Data berhasil diperbarui!');
    } catch (error) {
      alert('Update gagal: ' + error.message);
    }
  };

  const handleDelete = async (teacher) => {
    // Kita butuh seluruh objek 'teacher' untuk mengambil avatar_url nya
    if (window.confirm(`Yakin ingin menghapus data ${teacher.name}?`)) {
      try {
        // 1. Hapus file di Storage jika ada avatar_url
        if (teacher.avatar_url) {
          // Ambil nama file dari URL (mengambil teks setelah folder 'avatars/')
          const urlParts = teacher.avatar_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `avatars/${fileName}`;

          const { error: storageError } = await supabase.storage
            .from('lms-files')
            .remove([filePath]);

          if (storageError) {
            console.error("Gagal hapus file di storage:", storageError.message);
            // Kita lanjut hapus data tabel saja meski storage gagal (opsional)
          } else {
            console.log("File di storage berhasil dihapus");
          }
        }

        // 2. Hapus data di Tabel Database
        const { error } = await supabase
          .from('teachers')
          .delete()
          .eq('id', teacher.id);

        if (error) throw error;

        // Update state tampilan
        setTeachers(teachers.filter(t => t.id !== teacher.id));
        alert('Data dan foto berhasil dihapus!');
      } catch (error) {
        alert('Gagal menghapus: ' + error.message);
      }
    }
  };

  const handleEdit = (teacher) => {
    setFormData({ ...teacher });
    setEditId(teacher.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="container py-5">
      <div className="row mb-4 text-center">
        <div className="col">
          <h1 className="display-5 fw-bold text-primary">Admin Dashboard</h1>
          <p className="lead text-muted">Database Management Guru SMK</p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col">
          <button 
            className={`btn ${showForm ? 'btn-danger' : 'btn-success'} shadow-sm fw-bold`}
            onClick={() => { if(showForm) resetForm(); else setShowForm(true); }}
          >
            {showForm ? '❌ Batal' : '➕ Tambah Guru Baru'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="row mb-5 animate__animated animate__fadeIn">
          <div className="col-12">
            <div className="card shadow-lg border-0">
              <div className={`card-header text-white ${editId ? 'bg-warning' : 'bg-primary'}`}>
                <h5 className="mb-0">{editId ? '✏️ Edit Data Guru' : '➕ Tambah ke Supabase'}</h5>
              </div>
              <div className="card-body bg-light p-4">
                <form onSubmit={editId ? handleUpdate : handleAdd} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">Nama Lengkap</label>
                    <input type="text" className="form-control shadow-sm" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">Email</label>
                    <input type="email" className="form-control shadow-sm" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small">Mata Pelajaran</label>
                    <input type="text" className="form-control shadow-sm" name="subject" value={formData.subject} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small">WhatsApp</label>
                    <input type="text" className="form-control shadow-sm" name="contact" value={formData.contact} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small">Pendidikan</label>
                    <input type="text" className="form-control shadow-sm" name="education" value={formData.education} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold small">Keahlian</label>
                    <input type="text" className="form-control shadow-sm" name="skills" value={formData.skills} onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold small">Foto Profil Guru</label>
                    <div className="d-flex align-items-center gap-3">
                      {formData.avatar_url && (
                        <img 
                          src={formData.avatar_url} 
                          alt="Preview" 
                          className="rounded-circle border" 
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                        />
                      )}
                      <input 
                        type="file" 
                        className="form-control" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        disabled={uploading}
                      />
                    </div>
                    {uploading && <small className="text-primary">Sedang mengunggah foto...</small>}
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold small">Deskripsi</label>
                    <textarea className="form-control shadow-sm" name="description" rows="3" value={formData.description} onChange={handleChange}></textarea>
                  </div>
                  <div className="col-12 mt-4 text-end">
                    <button type="submit" className="btn btn-primary px-5 py-2 fw-bold shadow">
                      {editId ? '💾 Update Database' : '➕ Simpan Data'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow border-0 overflow-hidden">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0">📋 Data Realtime Supabase</h5>
          <span className="badge bg-primary">Total: {teachers.length}</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Sinkronisasi data...</p>
              </div>
            ) : (
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Kontak/Email</th>
                    <th>Mapel/Pendidikan</th>
                    <th>Foto Profile</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t, index) => (
                    <tr key={t.id}>
                      <td className="text-muted">{index + 1}</td>
                      <td>
                        <div className="fw-bold">{t.name}</div>
                        <div className="small text-muted text-truncate" style={{maxWidth: '200px'}}>{t.description}</div>
                      </td>
                      <td>
                        <div className="small">{t.email}</div>
                        <div className="small fw-bold text-success">{t.contact}</div>
                      </td>
                      <td>
                        <span className="badge bg-info-subtle text-info border border-info-subtle mb-1">{t.subject}</span>
                        <div className="small text-muted">{t.education}</div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={t.avatar_url || 'https://via.placeholder.com/40'} 
                            className="rounded-circle border me-2" 
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                            alt="Profile"
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-warning" onClick={() => handleEdit(t)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(t)}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}