import React, { useState, useEffect } from "react";
import { Plus, Search, MessageSquare } from "lucide-react";
import { supabase } from "../lib/supabase";
import DiscussionItem from "../components/discussions/DiscussionItem"; // Pastikan path file benar

export default function Discussions() {
  // --- STATE DASAR ---
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [replyContent, setReplyContent] = useState({});

  // --- STATE FORM & EDIT ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [courseId, setCourseId] = useState("");
  const [editingId, setEditingId] = useState(null);

  // --- STATE DATA ---
  const [courses, setCourses] = useState([]);
  const [discussions, setDiscussions] = useState([]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: coursesData } = await supabase.from("courses").select("id, title");
      setCourses(coursesData || []);

      await fetchDiscussions(user?.id);
      setLoading(false);
    };
    init();
  }, []);

  const fetchDiscussions = async (currentUserId) => {
    const { data, error } = await supabase
      .from("discussions")
      .select(`
        *,
        author:profiles!user_id(full_name),
        course:courses!course_id(title),
        replies:discussion_replies(
          id,
          content,
          created_at,
          user_id,
          profiles:profiles!user_id(full_name)
        ),
        likes:discussion_likes(user_id)
      `)
      .order("created_at", { ascending: false });

    if (!error) {
      const formatted = data.map(d => ({
        id: d.id,
        user_id: d.user_id,
        author: d.author?.full_name || "User",
        course: d.course?.title || "Umum",
        course_id: d.course_id,
        date: new Date(d.created_at).toLocaleDateString('id-ID'), // Sesuai prop 'date' di DiscussionItem
        title: d.title,
        content: d.content,
        likesCount: d.likes?.length || 0, // Sesuai prop di DiscussionItem
        isLiked: d.likes?.some(l => l.user_id === currentUserId), // Sesuai prop di DiscussionItem
        repliesCount: d.replies?.length || 0,
        allReplies: d.replies || [] // Sesuai prop 'allReplies' di DiscussionItem
      }));
      setDiscussions(formatted);
    }
  };

  // --- LOGIKA AKSI ---
  const handleLike = async (discussionId) => {
    if (!currentUser) return alert("Silakan login");
    const target = discussions.find(d => d.id === discussionId);
    
    if (target.isLiked) {
      await supabase.from("discussion_likes").delete().eq("discussion_id", discussionId).eq("user_id", currentUser.id);
    } else {
      await supabase.from("discussion_likes").insert({ discussion_id: discussionId, user_id: currentUser.id });
    }
    fetchDiscussions(currentUser.id);
  };

  const handleDelete = async (discussionId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus diskusi ini?")) {
      const { error } = await supabase.from("discussions").delete().eq("id", discussionId);
      if (!error) fetchDiscussions(currentUser.id);
    }
  };

  const handleEdit = (d) => {
    setEditingId(d.id);
    setTitle(d.title);
    setContent(d.content);
    setCourseId(d.course_id);
    setShowNewDialog(true);
  };

  const handleCreateOrUpdate = async () => {
    if (title && content && courseId && currentUser) {
      const payload = { title, content, course_id: courseId, user_id: currentUser.id };
      let error;
      
      if (editingId) {
        const { error: err } = await supabase.from("discussions").update(payload).eq("id", editingId);
        error = err;
      } else {
        const { error: err } = await supabase.from("discussions").insert(payload);
        error = err;
      }

      if (!error) {
        setShowNewDialog(false);
        setEditingId(null);
        setTitle(""); setContent(""); setCourseId("");
        fetchDiscussions(currentUser.id);
      }
    }
  };

  const handleReply = async (discussionId) => {
    const contentText = replyContent[discussionId];
    if (contentText?.trim() && currentUser) {
      const { error } = await supabase.from("discussion_replies").insert({
        discussion_id: discussionId,
        user_id: currentUser.id,
        content: contentText.trim()
      });
      if (!error) {
        setReplyContent({ ...replyContent, [discussionId]: "" });
        fetchDiscussions(currentUser.id);
      }
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (window.confirm("Hapus balasan ini?")) {
      const { error } = await supabase.from("discussion_replies").delete().eq("id", replyId);
      if (!error) fetchDiscussions(currentUser?.id);
    }
  };

  const handleEditReply = async (replyId, newContent) => {
    const { error } = await supabase
      .from("discussion_replies")
      .update({ content: newContent })
      .eq("id", replyId);
    if (!error) fetchDiscussions(currentUser?.id);
  };

  const filteredDiscussions = discussions.filter(d => {
    const matchesCourse = selectedCourse === "all" || String(d.course_id) === String(selectedCourse);
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  return (
    <div className="p-3 p-md-4 p-lg-5">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="fw-bold display-6 mb-2">💬 Forum Diskusi</h1>
          <p className="text-muted mb-0">Berkolaborasi dan berdiskusi dengan siswa lainnya</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" 
          onClick={() => { setEditingId(null); setShowNewDialog(true); }} 
          style={{ background: "linear-gradient(135deg, #2563eb, #16a34a)", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: "600" }}>
          <Plus size={20} /> Buat Diskusi
        </button>
      </div>

      {/* SEARCH & FILTER */}
      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="position-relative">
            <Search size={20} className="position-absolute text-muted" style={{ top: "50%", left: "16px", transform: "translateY(-50%)" }} />
            <input type="text" className="form-control ps-5 border-0 shadow-sm" placeholder="Cari diskusi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ borderRadius: "12px", padding: "12px 48px", background: "#f8f9fa" }} />
          </div>
        </div>
        <div className="col-md-4">
          <select className="form-select border-0 shadow-sm" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} style={{ borderRadius: "12px", padding: "12px 16px", background: "#f8f9fa" }}>
            <option value="all">Semua Kelas</option>
            {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </div>
      </div>

      {/* LIST DISKUSI MENGGUNAKAN DISCUSSION ITEM */}
      {loading ? (
        <div className="text-center py-5">Memuat diskusi...</div>
      ) : filteredDiscussions.length === 0 ? (
        <div className="card border-0 shadow-sm text-center p-5" style={{ borderRadius: "16px" }}>
          <MessageSquare size={64} className="text-muted mx-auto mb-3" style={{ opacity: 0.3 }} />
          <h5 className="fw-bold mb-2">Tidak Ada Diskusi</h5>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {filteredDiscussions.map((d) => (
            <DiscussionItem
              key={d.id}
              discussion={d}
              currentUserId={currentUser?.id}
              replyContent={replyContent}
              onLike={handleLike}
              onReply={handleReply}
              onReplyChange={(id, value) => setReplyContent({ ...replyContent, [id]: value })}
              // Tombol Edit/Delete hanya diproses jika milik user yang login
              onEdit={currentUser?.id === d.user_id ? handleEdit : null}
              onDelete={currentUser?.id === d.user_id ? handleDelete : null}
              onEditReply={handleEditReply}
              onDeleteReply={handleDeleteReply}
            />
          ))}
        </div>
      )}

      {/* MODAL BUAT/EDIT DISKUSI */}
      {showNewDialog && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">💬 {editingId ? "Edit Diskusi" : "Buat Diskusi Baru"}</h5>
                  <button className="btn-close" onClick={() => { setShowNewDialog(false); setEditingId(null); }} />
                </div>
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-2">Kelas</label>
                    <select className="form-select border-0 shadow-sm" value={courseId} onChange={(e) => setCourseId(e.target.value)} style={{ borderRadius: "12px", background: "#f8f9fa" }}>
                      <option value="">Pilih kelas</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-2">Judul Diskusi</label>
                    <input type="text" className="form-control border-0 shadow-sm" value={title} onChange={(e) => setTitle(e.target.value)} style={{ borderRadius: "12px", background: "#f8f9fa" }} />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-2">Isi Diskusi</label>
                    <textarea className="form-control border-0 shadow-sm" rows="6" value={content} onChange={(e) => setContent(e.target.value)} style={{ borderRadius: "12px", background: "#f8f9fa", resize: "none" }} />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button className="btn btn-light shadow-sm" onClick={() => { setShowNewDialog(false); setEditingId(null); }}>Batal</button>
                  <button className="btn btn-primary shadow-sm" onClick={handleCreateOrUpdate} disabled={!title || !content || !courseId} style={{ background: "linear-gradient(135deg, #2563eb, #16a34a)", border: "none", borderRadius: "12px" }}>
                    {editingId ? "Simpan Perubahan" : "Posting Diskusi"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => { setShowNewDialog(false); setEditingId(null); }} style={{ zIndex: 1040 }} />
        </>
      )}
    </div>
  );
}