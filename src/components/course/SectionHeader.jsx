import { Plus } from "lucide-react";

const SectionHeader = ({ title, buttonLabel, onAdd }) => (
  <div className="d-flex justify-content-between align-items-center mb-4">
    <h5 className="fw-bold mb-0">{title}</h5>
    <button 
      className="btn btn-primary btn-sm"
      onClick={onAdd}
      style={{ 
        borderRadius: "8px",
        background: "linear-gradient(135deg, #2563eb, #16a34a)",
        border: "none"
      }}
    >
      <Plus size={16} className="me-1" />
      {buttonLabel}
    </button>
  </div>
);

export default SectionHeader;