const MemberItem = ({ member, onMakeStudent, onMakeTeacher, onRemove }) => (
  <div 
    className="list-group-item border-0 mb-2 shadow-sm"
    style={{ borderRadius: "12px" }}
  >
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <h6 className="mb-1 fw-semibold">{member.name}</h6>
        <small className="text-muted">
          {member.role} • Bergabung: {member.joinDate}
        </small>
      </div>
      <div className="d-flex gap-2">
        {member.role !== "Siswa" && (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onMakeStudent(member.id)}
            style={{ borderRadius: "8px" }}
          >
            Jadikan Siswa
          </button>
        )}
        {member.role !== "Pengajar" && (
          <button
            className="btn btn-outline-success btn-sm"
            onClick={() => onMakeTeacher(member.id)}
            style={{ borderRadius: "8px" }}
          >
            Jadikan Pengajar
          </button>
        )}
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => onRemove(member.id)}
          style={{ borderRadius: "8px" }}
        >
          Keluarkan
        </button>
      </div>
    </div>
  </div>
);

export default MemberItem;