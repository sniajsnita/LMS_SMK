import { Trash2, Edit } from "lucide-react";


const MaterialItem = ({ material, onEdit, onDelete }) => (
  <div 
    className="list-group-item border-0 mb-2 shadow-sm"
    style={{ borderRadius: "12px" }}
  >
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <h6 className="mb-1 fw-semibold">{material.title}</h6>
        <small className="text-muted">
          Tipe: {material.type} • Upload: {material.uploadDate}
        </small>
      </div>
      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => onEdit(material)}
          style={{ borderRadius: "8px" }}
        >
          <Edit size={16} />
        </button>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => onDelete(material.id)}
          style={{ borderRadius: "8px" }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
);

export default MaterialItem;