import { Trash2, MessageSquare, Edit } from "lucide-react";

const DiscussionItem = ({ 
  discussion, 
  likes, 
  replyContent, 
  onLike, 
  onReply, 
  onReplyChange, 
  onEdit,
  onDelete 
}) => (
  <div 
    className="card border-0 shadow-sm"
    style={{
      borderRadius: "16px",
      transition: "all 0.3s ease"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 15px 40px rgba(37, 99, 235, 0.15)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "";
    }}
  >
    <div className="card-body p-4">
      <div className="d-flex align-items-start gap-3">
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
          style={{
            width: "48px",
            height: "48px",
            background: "linear-gradient(135deg, #2563eb, #16a34a)",
            fontSize: "1.25rem"
          }}
        >
          {/* PERBAIKAN DI SINI: Gunakan Optional Chaining dan Fallback "?" */}
          {discussion.author?.charAt(0) || "?"}
        </div>
        <div className="flex-grow-1">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            {/* PERBAIKAN DI SINI: Fallback nama jika author kosong */}
            <span className="fw-semibold">{discussion.author || "User"}</span>
            <span className="text-muted small">{discussion.date}</span>
          </div>
          
          <h6 className="fw-bold mb-2">{discussion.title}</h6>

          <div className="d-flex align-items-center justify-content-between mt-3 pt-3 border-top">
            <div className="d-flex align-items-center gap-4 text-muted small">
              <button
                className="btn btn-light btn-sm d-flex align-items-center gap-2"
                onClick={() => onLike(discussion.id)}
                style={{ borderRadius: "8px" }}
              >
                ❤️ {likes[discussion.id] || 0}
              </button>

              {/* Di dalam DiscussionItem.jsx */}
              <div className="d-flex align-items-center gap-1">
                <MessageSquare size={16} />
                <span>{discussion.repliesCount || 0} Balasan</span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => onEdit(discussion)}
                style={{ borderRadius: "8px" }}
              >
                <Edit size={16} />
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => onDelete(discussion.id)}
                style={{ borderRadius: "8px" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <input
              type="text"
              className="form-control border-0 shadow-sm"
              placeholder="Tulis komentar..."
              value={replyContent[discussion.id] || ""}
              onChange={(e) => onReplyChange(discussion.id, e.target.value)}
              style={{
                borderRadius: "10px",
                background: "#f8f9fa",
                padding: "10px 14px",
              }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onReply(discussion.id)}
              disabled={!replyContent[discussion.id]}
              style={{
                borderRadius: "10px",
                padding: "10px 16px",
              }}
            >
              Kirim
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DiscussionItem;