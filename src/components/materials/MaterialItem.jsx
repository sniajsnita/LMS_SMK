import { Trash2, Edit, Eye, Download, PlayCircle, Link2 } from "lucide-react";

const MaterialItem = ({ material, onEdit, onDelete }) => {
  // Fungsi untuk menangani akses file agar tidak error 400
  const handleFileAction = (url) => {
    if (!url) return alert("Link file tidak tersedia");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div 
      className="list-group-item border-0 mb-3 shadow-sm"
      style={{ borderRadius: "14px" }}
    >
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
        
        {/* INFO MATERI */}
        <div className="flex-grow-1">
          <h6 className="mb-1 fw-semibold">{material.title}</h6>
          <p className="text-muted mb-2" style={{ fontSize: "0.85rem", maxWidth: "520px", lineHeight: "1.4" }}>{material.description}</p>
          <small className="text-muted d-block mb-2">
            Tipe: {material.type} • Upload: {new Date(material.created_at || material.uploadDate).toLocaleDateString('id-ID')}
          </small>
        </div>

        {/* ACTION (EDIT/DELETE) */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-success btn-sm"
            onClick={() => handleFileAction(material.file_url || material.url)}
            style={{ borderRadius: "8px" }}
            title="Lihat"
          >
            <Eye size={16} />
          </button>
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
};

export default MaterialItem;