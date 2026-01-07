import { Users, Settings, Copy, Edit, Trash2 } from "lucide-react";

const CourseCard = ({ course, onSelect, onEdit, onDelete, onCopyCode }) => (
  <div 
    className="card border-0 shadow-sm h-100"
    style={{
      borderRadius: "16px",
      transition: "all 0.3s ease",
      overflow: "hidden"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-8px)";
      e.currentTarget.style.boxShadow = "0 15px 40px rgba(37, 99, 235, 0.2)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "";
    }}
  >
    {/* Card Header */}
    <div
      className="position-relative"
      style={{
        height: "180px",
        background: "linear-gradient(135deg, #2563eb, #16a34a)",
        cursor: "pointer"
      }}
      onClick={() => onSelect(course)}
    >
      {course.cover_image ? (
        <img 
          src={course.cover_image} 
          alt={course.title}
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div className="h-100 d-flex align-items-center justify-content-center">
          <Settings size={64} className="text-white" style={{ opacity: 0.4 }} />
        </div>
      )}

      {/* Overlay */}
      <div 
        className="position-absolute w-100 h-100 top-0 start-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)"
        }}
      />

      {/* Badge Subject */}
      <span 
        className="badge position-absolute top-0 end-0 m-3"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          color: "#2563eb",
          padding: "8px 16px",
          borderRadius: "8px",
          fontWeight: "600"
        }}
      >
        {course.subject}
      </span>
    </div>

    {/* Card Body */}
    <div className="card-body p-4">
      <h5 
        className="fw-bold mb-2"
        style={{ 
          cursor: "pointer",
          transition: "color 0.2s"
        }}
        onClick={() => onSelect(course)}
        onMouseEnter={(e) => e.currentTarget.style.color = "#2563eb"}
        onMouseLeave={(e) => e.currentTarget.style.color = ""}
      >
        {course.title}
      </h5>
      <p className="text-muted small mb-3" style={{ lineHeight: "1.6" }}>
        {course.description}
      </p>

      {/* Stats */}
      <div className="d-flex justify-content-between align-items-center mb-3 pt-3 border-top">
        <div className="d-flex align-items-center gap-2 text-muted small">
          <Users size={16} />
          <span>{course.students} siswa</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span 
            className="badge"
            style={{
              background: "#eff6ff",
              color: "#2563eb",
              padding: "6px 12px",
              borderRadius: "6px",
              fontWeight: "600"
            }}
          >
            {course.class_code}
          </span>
          <button
            className="btn btn-sm btn-light border-0"
            onClick={(e) => {
              e.stopPropagation();
              onCopyCode(course.class_code);
            }}
            style={{ borderRadius: "6px", padding: "6px 10px" }}
          >
            <Copy size={14} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-2">
        <button 
          className="btn btn-outline-primary btn-sm flex-grow-1"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(course);
          }}
          style={{ borderRadius: "8px" }}
        >
          <Edit size={16} className="me-1" />
          Edit
        </button>
        <button 
          className="btn btn-outline-danger btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(course.id);
          }}
          style={{ borderRadius: "8px" }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
);

export default CourseCard;