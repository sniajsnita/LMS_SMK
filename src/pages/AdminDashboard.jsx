import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function SimpleAdminDashboard() {
  // 1. State untuk menyimpan daftar guru
  const [teachers, setTeachers] = useState([
    { 
      id: 1, 
      name: 'Ahmad Fauzi', 
      email: 'ahmad@email.com', 
      description: 'Dosen senior bidang IT',
      subject: 'Web Development', 
      contact: '08123456789',
      education: 'S2 Informatika',
      skills: 'React, Node.js, SQL'
    },
  ]);

  // 2. State untuk form (Menyesuaikan kolom baru)
  const initialFormState = { 
    name: '', 
    email: '', 
    description: '', 
    subject: '', 
    contact: '', 
    education: '', 
    skills: '' 
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create - Tambah data baru
  const handleAdd = (e) => {
    e.preventDefault();
    const newTeacher = {
      id: Date.now(), // Menggunakan timestamp agar ID unik
      ...formData
    };
    setTeachers([...teachers, newTeacher]);
    resetForm();
    alert('Data guru berhasil ditambahkan!');
  };

  // Update - Set data ke form untuk diedit
  const handleEdit = (teacher) => {
    setFormData({ ...teacher });
    setEditId(teacher.id);
    setShowForm(true);
    window.scrollTo(0, 0); // Scroll ke atas agar form terlihat
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setTeachers(teachers.map(t => t.id === editId ? { ...formData, id: editId } : t));
    resetForm();
    alert('Data berhasil diperbarui!');
  };

  // Delete - Hapus data
  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      setTeachers(teachers.filter(t => t.id !== id));
    }
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
          <h1 className="display-5 fw-bold">Admin Dashboard LMS</h1>
          <p className="lead text-muted">Manajemen Data Profil Guru</p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col">
          <button 
            className={`btn ${showForm ? 'btn-danger' : 'btn-primary'} shadow-sm`}
            onClick={() => { if(showForm) resetForm(); else setShowForm(true); }}
          >
            {showForm ? '❌ Batal / Tutup Form' : '➕ Tambah Guru Baru'}
          </button>
        </div>
      </div>

      {/* Form Input */}
      {showForm && (
        <div className="row mb-5">
          <div className="col-12">
            <div className="card shadow border-0">
              <div className={`card-header text-white ${editId ? 'bg-warning' : 'bg-success'}`}>
                <h5 className="mb-0">{editId ? '✏️ Edit Data Guru' : '➕ Tambah Guru Baru'}</h5>
              </div>
              <div className="card-body bg-light">
                <form onSubmit={editId ? handleUpdate : handleAdd} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Nama Lengkap</label>
                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required placeholder="Contoh: Budi Utomo" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Email</label>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required placeholder="guru@email.com" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Mata Pelajaran</label>
                    <input type="text" className="form-control" name="subject" value={formData.subject} onChange={handleChange} required placeholder="Contoh: Fisika" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Kontak/WA</label>
                    <input type="text" className="form-control" name="contact" value={formData.contact} onChange={handleChange} required placeholder="0812..." />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Pendidikan Terakhir</label>
                    <input type="text" className="form-control" name="education" value={formData.education} onChange={handleChange} required placeholder="Contoh: S1 Pendidikan" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Keahlian (Pisahkan dengan koma)</label>
                    <input type="text" className="form-control" name="skills" value={formData.skills} onChange={handleChange} placeholder="Contoh: Public Speaking, Kurikulum Merdeka" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Deskripsi Singkat</label>
                    <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleChange} placeholder="Ceritakan singkat profil guru..."></textarea>
                  </div>
                  <div className="col-12 mt-4">
                    <button type="submit" className="btn btn-primary px-4 me-2">
                      {editId ? '💾 Update Data' : '➕ Simpan Guru'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Reset</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabel Data */}
      <div className="card shadow border-0">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">📋 Daftar Guru Terdaftar</h5>
          <span className="badge bg-light text-dark">Total: {teachers.length}</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>No</th>
                  <th>Profil Guru</th>
                  <th>Kontak & Email</th>
                  <th>Pendidikan & Mapel</th>
                  <th>Keahlian</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">Belum ada data guru.</td></tr>
                ) : (
                  teachers.map((t, index) => (
                    <tr key={t.id}>
                      <td>{index + 1}</td>
                      <td style={{ minWidth: '200px' }}>
                        <div className="fw-bold">{t.name}</div>
                        <small className="text-muted d-block text-truncate" style={{ maxWidth: '180px' }}>{t.description}</small>
                      </td>
                      <td>
                        <div className="small">{t.email}</div>
                        <div className="small text-primary">{t.contact}</div>
                      </td>
                      <td>
                        <div className="badge bg-info text-dark mb-1">{t.subject}</div>
                        <div className="small text-muted">{t.education}</div>
                      </td>
                      <td>
                        <small className="text-secondary">{t.skills}</small>
                      </td>
                      <td className="text-center">
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-warning" onClick={() => handleEdit(t)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(t.id)}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}