import { ArrowLeft, Copy } from "lucide-react";

const CourseHeader = ({ course, onBack, onCopyCode }) => (
  <>
    <button
      className="btn btn-outline-secondary mb-4 shadow-sm"
      onClick={onBack}
      style={{ borderRadius: "10px" }}
    >
      <ArrowLeft size={16} className="me-2" />
      Kembali ke Daftar Kelas
    </button>

    <div
      className="rounded-4 p-4 p-md-5 text-white mb-4 position-relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #2563eb, #16a34a)" }}
    >
      <div 
        className="position-absolute rounded-circle"
        style={{
          width: "300px",
          height: "300px",
          background: "rgba(255, 255, 255, 0.1)",
          top: "-100px",
          right: "-100px",
        }}
      />
      
      <div className="position-relative" style={{ zIndex: 2 }}>
        <h2 className="fw-bold display-6 mb-2">{course.title}</h2>
        <p className="mb-3" style={{ opacity: 0.9 }}>{course.description}</p>
        
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span 
            className="badge"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "0.875rem"
            }}
          >
            {course.subject}
          </span>
          <span className="d-flex align-items-center gap-2">
            <span>Kode: <strong>{course.class_code}</strong></span>
            <button 
              className="btn btn-sm btn-light"
              onClick={() => onCopyCode(course.class_code)}
              style={{ borderRadius: "6px", padding: "4px 8px" }}
            >
              <Copy size={14} />
            </button>
          </span>
        </div>
      </div>
    </div>
  </>
);

export default CourseHeader;