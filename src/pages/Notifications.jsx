import React, { useState } from 'react';

const NotificationsUI = () => {
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: 'assignment',
      title: 'Tugas Baru: Matematika Bab 5',
      message: 'Pak Budi telah memberikan tugas baru untuk dikerjakan. Deadline: 25 Januari 2026',
      created_date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      is_read: false,
      link: '#'
    },
    {
      id: 2,
      type: 'announcement',
      title: 'Hubungkan Anak - Undangan Orang Tua',
      message: 'Ahmad Fauzi mengundang Anda untuk terhubung sebagai orang tua. Terima undangan untuk melihat progress belajar anak Anda.',
      created_date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      is_read: false,
      related_id: 'ps_123'
    },
    {
      id: 3,
      type: 'grade',
      title: 'Nilai Tersedia',
      message: 'Nilai untuk Quiz Fisika Bab 3 sudah tersedia. Nilai Anda: 85/100',
      created_date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      is_read: false,
      link: '#'
    },
    {
      id: 4,
      type: 'discussion',
      title: 'Balasan Diskusi Baru',
      message: 'Siti Nurhaliza membalas diskusi Anda tentang "Teori Relativitas Einstein"',
      created_date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      is_read: true,
      link: '#'
    },
    {
      id: 5,
      type: 'quiz',
      title: 'Quiz Tersedia',
      message: 'Quiz Bahasa Indonesia Bab 7 sudah dapat dikerjakan. Durasi: 60 menit',
      created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      is_read: true,
      link: '#'
    },
    {
      id: 6,
      type: 'material',
      title: 'Materi Baru Ditambahkan',
      message: 'Ibu Dewi menambahkan materi "Ekosistem dan Rantai Makanan" di kelas Biologi',
      created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      is_read: true,
      link: '#'
    }
  ];

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "baru saja";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMinutes < 1) return "baru saja";
    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    return `${diffDays} hari yang lalu`;
  };

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

  const filteredNotifications = notifications.filter(n => {
    const typeMatch = filterType === "all" || n.type === filterType;
    const readMatch = filterRead === "all" || 
                     (filterRead === "unread" && !n.is_read) ||
                     (filterRead === "read" && n.is_read);
    return typeMatch && readMatch;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;

  return (
    <>
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
        rel="stylesheet"
      />
      <style>{`
        body {
          background: linear-gradient(to bottom right, #dbeafe, #e0e7ff, #ede9fe);
          min-height: 100vh;
        }
        
        .gradient-text {
          background: linear-gradient(to right, #2563eb, #9333ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .notification-card {
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .notification-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        .notification-unread {
          border-left: 4px solid #3b82f6;
          background: linear-gradient(to right, rgba(239, 246, 255, 0.5), transparent);
        }
        
        .icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          font-size: 1.5rem;
        }
        
        .badge-new {
          background-color: #3b82f6;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
        }
        
        .badge-type {
          border: 1px solid #d1d5db;
          color: #4b5563;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
        }
        
        .btn-gradient-green {
          background: linear-gradient(to right, #16a34a, #15803d);
          color: white;
          border: none;
        }
        
        .btn-gradient-green:hover {
          background: linear-gradient(to right, #15803d, #166534);
          color: white;
        }
        
        .btn-gradient-blue {
          background: linear-gradient(to right, #2563eb, #1d4ed8);
          color: white;
          border: none;
        }
        
        .btn-gradient-blue:hover {
          background: linear-gradient(to right, #1d4ed8, #1e40af);
          color: white;
        }
        
        .unread-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: #ef4444;
          color: white;
          font-size: 0.75rem;
          font-weight: bold;
          border-radius: 50%;
        }
        
        .empty-state {
          background-color: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
      `}</style>

      <div className="container py-4 py-md-5">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
              <div>
                <h1 className="display-5 fw-bold gradient-text mb-2">Notifikasi</h1>
                <p className="text-secondary d-flex align-items-center gap-2 mb-0">
                  <span className="unread-badge">{unreadCount}</span>
                  notifikasi belum dibaca
                </p>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {unreadCount > 0 && (
                  <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                    ✓
                    <span className="small fw-medium">Tandai Semua Dibaca</span>
                  </button>
                )}
                {readCount > 0 && (
                  <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2">
                    🗑️
                    <span className="small fw-medium">Hapus Sudah Dibaca</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6">
                <select 
                  className="form-select shadow-sm" 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Semua Tipe</option>
                  <option value="assignment">Tugas</option>
                  <option value="quiz">Kuis</option>
                  <option value="grade">Nilai</option>
                  <option value="discussion">Diskusi</option>
                  <option value="material">Materi</option>
                  <option value="announcement">Pengumuman</option>
                </select>
              </div>
              <div className="col-12 col-sm-6">
                <select 
                  className="form-select shadow-sm"
                  value={filterRead}
                  onChange={(e) => setFilterRead(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="unread">Belum Dibaca</option>
                  <option value="read">Sudah Dibaca</option>
                </select>
              </div>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div className="empty-state p-5 text-center">
                <div style={{ fontSize: '5rem' }}>🔔</div>
                <h3 className="h4 fw-semibold text-dark mb-2">Tidak Ada Notifikasi</h3>
                <p className="text-secondary mb-0">Anda tidak memiliki notifikasi saat ini</p>
              </div>
            ) : (
              <div>
                {filteredNotifications.map((notification, index) => {
                  const icon = typeIcons[notification.type] || '🔔';
                  const colorGradient = typeColors[notification.type] || 'linear-gradient(to bottom right, #6b7280, #4b5563)';
                  const isParentInvitation = notification.type === 'announcement' && 
                                            notification.title.includes('Hubungkan Anak');

                  return (
                    <div
                      key={notification.id}
                      className={`notification-card bg-white rounded-3 mb-3 ${
                        !notification.is_read ? 'notification-unread' : ''
                      }`}
                    >
                      <div className="p-4">
                        <div className="d-flex gap-3">
                          {/* Icon */}
                          <div 
                            className="icon-circle"
                            style={{ background: colorGradient }}
                          >
                            {icon}
                          </div>

                          {/* Content */}
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <h3 className="h5 fw-bold text-dark mb-0">{notification.title}</h3>
                                {!notification.is_read && (
                                  <span className="badge-new">Baru</span>
                                )}
                                <span className="badge-type">{notification.type}</span>
                              </div>
                            </div>
                            
                            <p className="text-secondary mb-3 lh-base">{notification.message}</p>
                            
                            <p className="small text-muted mb-3 d-flex align-items-center gap-1">
                              🔔
                              {formatRelativeTime(notification.created_date)}
                            </p>

                            {/* Actions */}
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              {isParentInvitation && notification.related_id && (
                                <button className="btn btn-gradient-green btn-sm fw-medium shadow">
                                  Terima Undangan
                                </button>
                              )}

                              
                              {/* {notification.link && !isParentInvitation && (
                                <button className="btn btn-gradient-blue btn-sm fw-medium shadow">
                                  Lihat Detail
                                </button>
                              )} */}
                              {!notification.is_read && (
                                <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                                  ✓
                                  <span className="small fw-medium">Tandai Dibaca</span>
                                </button>
                              )}
                              <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2">
                                🗑️
                                <span className="small fw-medium">Hapus</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsUI;