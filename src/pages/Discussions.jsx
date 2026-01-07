import React, { useState } from "react";
import {
  MessageSquare,
  Plus,
  ThumbsUp,
  Send,
  Search,
  Edit,
  Trash2,
  Filter,
} from "lucide-react";

export default function Discussions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [replyContent, setReplyContent] = useState({});
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [courseId, setCourseId] = useState("");

  const courses = [
    { id: "1", title: "Pemrograman Web" },
    { id: "2", title: "UI/UX Design" },
    { id: "3", title: "Basis Data" },
  ];

  const discussions = [
    {
      id: 1,
      author: "Andi Saputra",
      author_id: "user1",
      course: "Pemrograman Web",
      course_id: "1",
      time: "2 jam yang lalu",
      title: "Cara memahami React Router?",
      content: "Saya masih bingung dengan konsep routing di React. Apakah ada yang bisa menjelaskan dengan bahasa yang mudah dipahami?",
      likes: 5,
      liked_by: [],
      replies: [
        { 
          author: "Budi Santoso", 
          content: "Gunakan BrowserRouter dan Route. Saya bisa bantu jelaskan lebih detail kalau mau.",
          time: "1 jam yang lalu"
        },
      ],
    },
    {
      id: 2,
      author: "Siti Aminah",
      author_id: "user2",
      course: "UI/UX Design",
      course_id: "2",
      time: "1 hari yang lalu",
      title: "Inspirasi desain dashboard",
      content: "Ada rekomendasi website buat inspirasi UI dashboard yang modern dan clean?",
      likes: 3,
      liked_by: [],
      replies: [
        { 
          author: "Ahmad Fauzi", 
          content: "Coba lihat Dribbble dan Behance, banyak inspirasi bagus di sana!",
          time: "20 jam yang lalu"
        },
        { 
          author: "Dewi Lestari", 
          content: "Pinterest juga bagus untuk koleksi inspirasi UI/UX",
          time: "18 jam yang lalu"
        },
      ],
    },
    {
      id: 3,
      author: "Rizki Pratama",
      author_id: "user3",
      course: "Basis Data",
      course_id: "3",
      time: "3 hari yang lalu",
      title: "Perbedaan SQL dan NoSQL?",
      content: "Kapan sebaiknya menggunakan SQL dan kapan menggunakan NoSQL? Mohon pencerahannya.",
      likes: 8,
      liked_by: [],
      replies: [],
    },
  ];

  const filteredDiscussions = discussions.filter(d => {
    const matchesCourse = selectedCourse === "all" || d.course_id === selectedCourse;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const handleLike = (discussionId) => {
    alert(`✅ Diskusi disukai!`);
  };

  const handleReply = (discussionId) => {
    const reply = replyContent[discussionId];
    if (reply && reply.trim()) {
      alert(`✅ Balasan berhasil ditambahkan!`);
      setReplyContent({ ...replyContent, [discussionId]: "" });
    }
  };

  const handleCreateDiscussion = () => {
    if (title && content && courseId) {
      alert("✅ Diskusi berhasil dibuat!");
      setShowNewDialog(false);
      setTitle("");
      setContent("");
      setCourseId("");
    }
  };

  return (
    <div className="p-3 p-md-4 p-lg-5">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="fw-bold display-6 mb-2">💬 Forum Diskusi</h1>
          <p className="text-muted mb-0">
            Berkolaborasi dan berdiskusi dengan siswa lainnya
          </p>
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowNewDialog(true)}
          style={{
            background: "linear-gradient(135deg, #9333ea, #ec4899)",
            border: "none",
            padding: "12px 24px",
            borderRadius: "12px",
            fontWeight: "600",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 10px 25px rgba(147, 51, 234, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          <Plus size={20} />
          Buat Diskusi
        </button>
      </div>

      {/* SEARCH & FILTER */}
      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="position-relative">
            <Search
              size={20}
              className="position-absolute text-muted"
              style={{ top: "50%", left: "16px", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              className="form-control ps-5 border-0 shadow-sm"
              placeholder="Cari diskusi berdasarkan judul atau isi..."
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
        <div className="col-md-4">
          <select
            className="form-select border-0 shadow-sm"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{
              borderRadius: "12px",
              padding: "12px 16px",
              background: "#f8f9fa"
            }}
          >
            <option value="all">Semua Kelas</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DISCUSSION LIST */}
      {filteredDiscussions.length === 0 ? (
        <div className="card border-0 shadow-sm text-center p-5" style={{ borderRadius: "16px" }}>
          <MessageSquare size={64} className="text-muted mx-auto mb-3" style={{ opacity: 0.3 }} />
          <h5 className="fw-bold mb-2">Tidak Ada Diskusi</h5>
          <p className="text-muted mb-0">
            {searchQuery ? "Tidak ada diskusi yang sesuai dengan pencarian" : "Belum ada diskusi. Jadilah yang pertama!"}
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {filteredDiscussions.map((d) => (
            <div 
              key={d.id} 
              className="card border-0 shadow-sm"
              style={{
                borderRadius: "16px",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className="card-body p-4">
                {/* AUTHOR INFO */}
                <div className="d-flex align-items-start gap-3 mb-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "linear-gradient(135deg, #9333ea, #ec4899)",
                      fontSize: "1.25rem"
                    }}
                  >
                    {d.author.charAt(0)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <span className="fw-semibold">{d.author}</span>
                      <span className="text-muted small">{d.time}</span>
                      <span 
                        className="badge"
                        style={{
                          background: "#f3f4f6",
                          color: "#6b7280",
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontWeight: "500"
                        }}
                      >
                        {d.course}
                      </span>
                    </div>
                    
                    {/* CONTENT */}
                    <h5 className="fw-bold mb-2">{d.title}</h5>
                    <p className="text-muted mb-3">{d.content}</p>

                    {/* ACTIONS */}
                    <div className="d-flex align-items-center gap-4 text-muted small mb-3 pb-3 border-bottom">
                      <button
                        className="btn btn-sm btn-light border-0 d-flex align-items-center gap-2"
                        onClick={() => handleLike(d.id)}
                        style={{
                          borderRadius: "8px",
                          padding: "6px 12px",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#faf5ff";
                          e.currentTarget.style.color = "#9333ea";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#f8f9fa";
                          e.currentTarget.style.color = "";
                        }}
                      >
                        <ThumbsUp size={16} />
                        <span>{d.likes}</span>
                      </button>
                      <span className="d-flex align-items-center gap-2">
                        <MessageSquare size={16} />
                        {d.replies.length} balasan
                      </span>
                    </div>

                    {/* REPLIES */}
                    {d.replies.length > 0 && (
                      <div className="mb-3">
                        {d.replies.map((r, i) => (
                          <div 
                            key={i} 
                            className="d-flex align-items-start gap-3 ps-4 mb-3 border-start"
                            style={{ borderLeftWidth: "3px", borderLeftColor: "#e9d5ff" }}
                          >
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                              style={{
                                width: "32px",
                                height: "32px",
                                background: "#d1d5db",
                                fontSize: "0.875rem"
                              }}
                            >
                              {r.author.charAt(0)}
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="fw-semibold small">{r.author}</span>
                                <span className="text-muted" style={{ fontSize: "0.75rem" }}>{r.time}</span>
                              </div>
                              <p className="mb-0 small text-muted">{r.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* REPLY INPUT */}
                    <div className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control border-0 shadow-sm"
                        placeholder="Tulis balasan..."
                        value={replyContent[d.id] || ""}
                        onChange={(e) => setReplyContent({ ...replyContent, [d.id]: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleReply(d.id);
                          }
                        }}
                        style={{
                          borderRadius: "10px",
                          padding: "10px 16px",
                          background: "#f8f9fa"
                        }}
                      />
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleReply(d.id)}
                        disabled={!replyContent[d.id] || !replyContent[d.id].trim()}
                        style={{
                          background: "linear-gradient(135deg, #9333ea, #ec4899)",
                          border: "none",
                          borderRadius: "10px",
                          padding: "10px 20px"
                        }}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREATE DISCUSSION */}
      {showNewDialog && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div 
                className="modal-content border-0 shadow-lg"
                style={{ borderRadius: "16px" }}
              >
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">
                    💬 Buat Diskusi Baru
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowNewDialog(false)}
                  />
                </div>

                <div className="modal-body p-4">
                  {/* Select Course */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-2">Kelas</label>
                    <select
                      className="form-select border-0 shadow-sm"
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      style={{
                        borderRadius: "12px",
                        padding: "12px 16px",
                        background: "#f8f9fa"
                      }}
                    >
                      <option value="">Pilih kelas</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-2">Judul Diskusi</label>
                    <input
                      type="text"
                      className="form-control border-0 shadow-sm"
                      placeholder="Contoh: Cara menggunakan React Hooks"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      style={{
                        borderRadius: "12px",
                        padding: "12px 16px",
                        background: "#f8f9fa"
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-2">Isi Diskusi</label>
                    <textarea
                      className="form-control border-0 shadow-sm"
                      rows="6"
                      placeholder="Apa yang ingin Anda diskusikan?"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      style={{
                        borderRadius: "12px",
                        padding: "12px 16px",
                        background: "#f8f9fa",
                        resize: "none"
                      }}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    className="btn btn-light shadow-sm"
                    onClick={() => setShowNewDialog(false)}
                    style={{
                      borderRadius: "12px",
                      padding: "10px 24px",
                      border: "none"
                    }}
                  >
                    Batal
                  </button>
                  <button 
                    className="btn btn-primary shadow-sm"
                    onClick={handleCreateDiscussion}
                    disabled={!title || !content || !courseId}
                    style={{
                      background: !title || !content || !courseId
                        ? "#9ca3af" 
                        : "linear-gradient(135deg, #9333ea, #ec4899)",
                      border: "none",
                      borderRadius: "12px",
                      padding: "10px 24px",
                      cursor: !title || !content || !courseId ? "not-allowed" : "pointer"
                    }}
                  >
                    <MessageSquare size={16} className="me-2" />
                    Posting Diskusi
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BACKDROP */}
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowNewDialog(false)}
            style={{ zIndex: 1040 }}
          />
        </>
      )}
    </div>
  );
}