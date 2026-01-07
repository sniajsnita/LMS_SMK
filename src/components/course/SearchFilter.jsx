import { Search, Filter } from "lucide-react";

const SearchFilter = ({ searchTerm, onSearchChange, filterSubject, onFilterChange, subjects }) => (
  <div className="d-flex flex-column flex-md-row gap-3 mb-4">
    {/* Search */}
    <div className="flex-grow-1 position-relative">
      <Search 
        size={18} 
        className="position-absolute text-muted"
        style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
      />
      <input
        type="text"
        className="form-control border-0 shadow-sm"
        placeholder="Cari kelas..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          borderRadius: "12px",
          padding: "12px 16px 12px 40px",
          background: "#f8f9fa"
        }}
      />
    </div>

    {/* Filter */}
    <div className="position-relative" style={{ minWidth: "200px" }}>
      <Filter 
        size={18} 
        className="position-absolute text-muted"
        style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
      />
      <select
        className="form-select border-0 shadow-sm"
        value={filterSubject}
        onChange={(e) => onFilterChange(e.target.value)}
        style={{
          borderRadius: "12px",
          padding: "12px 16px 12px 40px",
          background: "#f8f9fa"
        }}
      >
        <option value="">Semua Mata Pelajaran</option>
        {subjects.map((subject, idx) => (
          <option key={idx} value={subject}>{subject}</option>
        ))}
      </select>
    </div>
  </div>
);

export default SearchFilter;