import React, { useState } from 'react';
import { Trash2, MessageSquare, Edit, Send, ChevronDown, ChevronUp, Heart } from "lucide-react";

const DiscussionItem = ({ 
  discussion, 
  replyContent, 
  onLike, 
  onReply, 
  onReplyChange, 
  onEdit,        
  onDelete,      
  onEditReply,   
  onDeleteReply  
}) => {
  const [showAllReplies, setShowAllReplies] = useState(false);
  console.log("Status Like Diskusi " + discussion.title + ":", discussion.isLiked);

  const displayedReplies = showAllReplies 
    ? discussion.allReplies 
    : discussion.allReplies?.slice(0, 1);

  return (
    <div 
      className="card border-0 shadow-sm mb-4"
      style={{
        borderRadius: "16px",
        transition: "all 0.3s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 15px 40px rgba(37, 99, 235, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div className="card-body p-4">
        <div className="d-flex align-items-start gap-3">
          {/* Avatar Section */}
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
            style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #2563eb, #16a34a)",
              fontSize: "1.2rem"
            }}
          >
            {discussion.author?.charAt(0).toUpperCase() || "?"}
          </div>

          <div className="flex-grow-1">
            {/* Header Diskusi Utama */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-dark">{discussion.author}</span>
                <span className="text-muted small">• {discussion.date}</span>
              </div>
              
              <div className="d-flex gap-1">
                <button 
                  className="btn btn-link text-primary p-1 shadow-none" 
                  onClick={() => onEdit(discussion)}
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn btn-link text-danger p-1 shadow-none" 
                  onClick={() => onDelete(discussion.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <h6 className="fw-bold mb-2">{discussion.title}</h6>
            <p className="text-secondary mb-3" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
              {discussion.content}
            </p>

            {/* Statistik & Like - DISESUAIKAN STYLENYA */}
            <div className="d-flex align-items-center gap-4 text-muted small pb-3 border-bottom">
              
              {/* Tombol Like */}
              <button
                className="btn btn-link p-0 d-flex align-items-center gap-2 text-decoration-none shadow-none border-0"
                onClick={() => onLike(discussion.id)}
                style={{ 
                  // Kita hilangkan transisi warna pada text agar fokus ke ikon
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <Heart 
                  size={20} 
                  // stroke adalah garis luar, fill adalah warna tengah
                  stroke={discussion.isLiked ? "#dc3545" : "#6c757d"} 
                  fill={discussion.isLiked ? "#dc3545" : "transparent"} 
                  strokeWidth={2.0} 
                  style={{
                    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    transform: discussion.isLiked ? "scale(1.2)" : "scale(1)"
                  }}
                />
                <span 
                  style={{ 
                    color: discussion.isLiked ? "#dc3545" : "#6c757d",
                    fontWeight: discussion.isLiked ? "700" : "500",
                    fontSize: "0.9rem"
                  }}
                >
                  {discussion.likesCount || 0} Suka
                </span>
              </button>

              {/* Statistik Balasan */}
              <div className="d-flex align-items-center gap-1">
                <MessageSquare size={18} className="text-primary" />
                <span className="fw-medium text-muted">{discussion.repliesCount || 0} Balasan</span>
              </div>
            </div>

            {/* Area Balasan (Replies) */}
            {discussion.allReplies && discussion.allReplies.length > 0 && (
              <div className="mt-3 ps-3 border-start border-2 border-light">
                {displayedReplies.map((reply) => (
                  <div key={reply.id} className="p-3 rounded-3 mb-2" style={{ background: "#f8f9fa" }}>
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span className="fw-bold text-primary" style={{ fontSize: "0.85rem" }}>
                        {reply.profiles?.full_name || "User"}
                      </span>
                      
                      <div className="d-flex gap-1">
                        <button 
                          className="btn btn-link p-1 text-muted shadow-none" 
                          onClick={() => {
                            const newContent = window.prompt("Edit komentar:", reply.content);
                            if (newContent && newContent.trim()) onEditReply(reply.id, newContent);
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-link p-1 text-danger shadow-none" 
                          onClick={() => onDeleteReply(reply.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="mb-0 text-dark" style={{ fontSize: "0.9rem" }}>{reply.content}</p>
                    <div className="text-muted" style={{ fontSize: "0.65rem", marginTop: "4px" }}>
                      {new Date(reply.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                ))}

                {discussion.allReplies.length > 1 && (
                  <button 
                    className="btn btn-link btn-sm text-decoration-none p-0 mt-1 d-flex align-items-center gap-1 shadow-none"
                    onClick={() => setShowAllReplies(!showAllReplies)}
                    style={{ fontSize: "0.8rem", fontWeight: "600", color: "#2563eb" }}
                  >
                    {showAllReplies ? (
                      <><ChevronUp size={14} /> Sembunyikan balasan</>
                    ) : (
                      <><ChevronDown size={14} /> Lihat {discussion.allReplies.length - 1} balasan lainnya</>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Input Balasan */}
            <div className="mt-3 d-flex gap-2">
              <input
                type="text"
                className="form-control border-0 shadow-sm"
                placeholder="Tulis balasan..."
                value={replyContent[discussion.id] || ""}
                onChange={(e) => onReplyChange(discussion.id, e.target.value)}
                style={{ borderRadius: "10px", background: "#f8f9fa", padding: "10px 14px", fontSize: "0.9rem" }}
              />
              <button
                className="btn btn-primary d-flex align-items-center justify-content-center"
                onClick={() => onReply(discussion.id)}
                disabled={!replyContent[discussion.id]?.trim()}
                style={{ borderRadius: "10px", width: "45px", height: "45px", background: "#2563eb" }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionItem;