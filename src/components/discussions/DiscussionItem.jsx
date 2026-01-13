import React, { useState } from 'react';
import { Trash2, MessageSquare, Edit, Send, ChevronDown, ChevronUp, Heart, Clock } from "lucide-react";

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

  const displayedReplies = showAllReplies 
    ? discussion.allReplies 
    : discussion.allReplies?.slice(0, 1);

  return (
    <div 
      className="card border-0 shadow-sm mb-4"
      style={{
        borderRadius: "16px",
        transition: "all 0.3s ease",
        border: "1px solid #f1f5f9"
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
            {/* Header Diskusi: Nama & Tanggal + Tombol Aksi */}
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span className="fw-bold text-dark">{discussion.author}</span>
                {/* Jika Anda punya logic isOwner, bisa ditambah badge di sini */}
              </div>
              
              {/* AREA TANGGAL DAN TOMBOL EDIT/HAPUS (PINDAH KE SINI) */}
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small d-flex align-items-center gap-1">
                  <Clock size={12} />
                  {discussion.date}
                </span>

                <div className="d-flex gap-1 border-start ps-2 ms-1" style={{ borderColor: '#dee2e6' }}>
                  <button 
                    className="btn btn-link text-primary p-1 shadow-none border-0" 
                    onClick={() => onEdit(discussion)}
                    style={{ cursor: "pointer" }}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="btn btn-link text-danger p-1 shadow-none border-0" 
                    onClick={() => onDelete(discussion.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <h6 className="fw-bold text-primary mb-2">{discussion.title}</h6>
            <p className="text-secondary mb-3" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
              {discussion.content}
            </p>

            {/* Statistik & Like */}
            <div className="d-flex align-items-center gap-4 text-muted small pb-3 border-bottom">
              <button
                className="btn btn-link p-0 d-flex align-items-center gap-2 text-decoration-none shadow-none border-0"
                onClick={() => onLike(discussion.id)}
                style={{ cursor: "pointer" }}
              >
                <Heart 
                  size={20} 
                  stroke={discussion.isLiked ? "#dc3545" : "#6c757d"} 
                  fill={discussion.isLiked ? "#dc3545" : "transparent"} 
                  style={{
                    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    transform: discussion.isLiked ? "scale(1.2)" : "scale(1)"
                  }}
                />
                <span style={{ 
                  color: discussion.isLiked ? "#dc3545" : "#6c757d",
                  fontWeight: discussion.isLiked ? "700" : "500"
                }}>
                  {discussion.likesCount || 0} Suka
                </span>
              </button>

              <div className="d-flex align-items-center gap-1">
                <MessageSquare size={18} className="text-primary" />
                <span className="fw-medium text-muted">{discussion.repliesCount || 0} Balasan</span>
              </div>
            </div>

            {/* Area Balasan (Replies) */}
            {discussion.allReplies && discussion.allReplies.length > 0 && (
              <div className="mt-3 ps-3 border-start border-2 border-light">
                {displayedReplies.map((reply) => (
                  <div key={reply.id} className="p-3 rounded-4 mb-2 shadow-sm" style={{ background: "#f8f9fa" }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-primary" style={{ fontSize: "0.85rem" }}>
                        {reply.profiles?.full_name || "User"}
                      </span>
                      
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted" style={{ fontSize: "10px" }}>
                          {new Date(reply.created_at).toLocaleDateString('id-ID')}
                        </span>
                        <div className="d-flex gap-1 border-start ps-2" style={{ borderColor: '#dee2e6' }}>
                          <Edit 
                            size={14} 
                            className="text-muted" 
                            style={{ cursor: "pointer" }} 
                            onClick={() => {
                              const newContent = window.prompt("Edit komentar:", reply.content);
                              if (newContent && newContent.trim()) onEditReply(reply.id, newContent);
                            }} 
                          />
                          <Trash2 
                            size={14} 
                            className="text-danger" 
                            style={{ cursor: "pointer" }} 
                            onClick={() => onDeleteReply(reply.id)} 
                          />
                        </div>
                      </div>
                    </div>
                    <p className="mb-0 text-dark" style={{ fontSize: "0.9rem" }}>{reply.content}</p>
                  </div>
                ))}

                {discussion.allReplies.length > 1 && (
                  <button 
                    className="btn btn-link btn-sm text-decoration-none p-0 mt-1 d-flex align-items-center gap-1 shadow-none fw-bold"
                    onClick={() => setShowAllReplies(!showAllReplies)}
                    style={{ fontSize: "0.8rem", color: "#2563eb", cursor: "pointer" }}
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
                className="form-control border-0 bg-light"
                placeholder="Tulis balasan..."
                value={replyContent[discussion.id] || ""}
                onChange={(e) => onReplyChange(discussion.id, e.target.value)}
                style={{ borderRadius: "10px", padding: "10px 14px", fontSize: "0.9rem" }}
              />
              <button
                className="btn btn-primary d-flex align-items-center justify-content-center shadow-sm"
                onClick={() => onReply(discussion.id)}
                disabled={!replyContent[discussion.id]?.trim()}
                style={{ 
                  borderRadius: "10px", 
                  width: "45px", 
                  height: "45px", 
                  background: "linear-gradient(135deg, #2563eb, #16a34a)",
                  border: "none",
                  cursor: replyContent[discussion.id]?.trim() ? "pointer" : "not-allowed"
                }}
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