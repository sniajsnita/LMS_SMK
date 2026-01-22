import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');

  // Mapping Ikon (Tanpa merubah tampilan, hanya menambahkan logika tampilan)
  const typeIcons = {
    assignment: '📄',
    quiz: '❓',
    grade: '🏆',
    discussion: '💬',
    material: '📚',
    announcement: '📢',
  };

  const typeColors = {
    assignment: 'linear-gradient(to bottom right, #3b82f6, #2563eb)',
    quiz: 'linear-gradient(to bottom right, #a855f7, #9333ea)',
    grade: 'linear-gradient(to bottom right, #22c55e, #16a34a)',
    discussion: 'linear-gradient(to bottom right, #f97316, #ea580c)',
    material: 'linear-gradient(to bottom right, #14b8a6, #0d9488)',
    announcement: 'linear-gradient(to bottom right, #ec4899, #db2777)',
  };

  useEffect(() => {
    fetchNotifications();

    // REALTIME: Menggunakan payload untuk update state secara cerdas (Optimistic)
    const channel = supabase
      .channel('notif-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new, ...prev]);
          } else {
            fetchNotifications(); // Untuk Update/Delete, fetch ulang agar sinkron
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    // State lokal diupdate otomatis via Realtime atau panggil manual:
    setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    fetchNotifications();
  };

  const deleteNotification = async (id) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const deleteReadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('notifications').delete().eq('user_id', user.id).eq('is_read', true);
    fetchNotifications();
  };

  const filteredNotifications = notifications.filter(n => {
    const typeMatch = filterType === "all" || n.type === filterType;
    const readMatch = filterRead === "all" || 
                     (filterRead === "unread" && !n.is_read) ||
                     (filterRead === "read" && n.is_read);
    return typeMatch && readMatch;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <div className="text-center p-5">Memuat notifikasi...</div>;

  return (
    <div className="container py-4">
      <style>{`
        .icon-circle-sm {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .gradient-text {
          background: linear-gradient(to right, #2563eb, #9333ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold gradient-text">Notifikasi</h1>
          <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.8rem' }}>
            {unreadCount} Belum Dibaca
          </span>
        </div>
        <div className="d-flex gap-2">
          <button onClick={markAllAsRead} className="btn btn-sm btn-outline-primary border-0 fw-medium">✓ Semua Dibaca</button>
          <button onClick={deleteReadNotifications} className="btn btn-sm btn-outline-danger border-0 fw-medium">🗑 Bersihkan</button>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="row g-2 mb-4">
          <div className="col-md-6">
              <select className="form-select border-0 shadow-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">Semua Tipe</option>
                  <option value="assignment">Tugas</option>
                  <option value="quiz">Kuis</option>
                  <option value="grade">Nilai</option>
                  <option value="discussion">Diskusi</option>
                  <option value="material">Materi</option>
                  <option value="announcement">Pengumuman</option>
              </select>
          </div>
          <div className="col-md-6">
              <select className="form-select border-0 shadow-sm" value={filterRead} onChange={(e) => setFilterRead(e.target.value)}>
                  <option value="all">Semua Status</option>
                  <option value="unread">Belum Dibaca</option>
                  <option value="read">Sudah Dibaca</option>
              </select>
          </div>
      </div>

      {/* LIST SECTION */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-5 opacity-50">
           <div style={{ fontSize: '3rem' }}>🔔</div>
           <p>Tidak ada notifikasi ditemukan</p>
        </div>
      ) : (
        filteredNotifications.map(n => (
          <div key={n.id} className={`card mb-3 border-0 shadow-sm ${!n.is_read ? 'border-start border-primary border-4' : ''}`} style={{ borderRadius: '12px' }}>
            <div className="card-body d-flex align-items-start gap-3">
              {/* Icon Bulat Kecil agar Tampilan Rapi */}
              <div className="icon-circle-sm" style={{ background: typeColors[n.type] || '#6c757d' }}>
                {typeIcons[n.type] || '🔔'}
              </div>
              
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start">
                  <h6 className="fw-bold mb-1" style={{ color: '#334155' }}>{n.title}</h6>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {new Date(n.created_at).toLocaleDateString('id-ID')}
                  </small>
                </div>
                <p className="small text-secondary mb-2" style={{ lineHeight: '1.4' }}>{n.message}</p>
                
                <div className="d-flex gap-2">
                  {!n.is_read && (
                      <button onClick={() => markAsRead(n.id)} className="btn btn-sm p-0 text-primary fw-bold small" style={{ fontSize: '0.75rem' }}>✓ Tandai Dibaca</button>
                  )}
                  <button onClick={() => deleteNotification(n.id)} className="btn btn-sm p-0 text-danger fw-bold small" style={{ fontSize: '0.75rem' }}>🗑 Hapus</button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;