import React, { useState } from "react";
import {
  Mail,
  Check,
  X,
  Clock,
  AlertCircle,
  Key,
  Gift,
} from "lucide-react";

export default function InvitationsView() {
  const [activeTab, setActiveTab] = useState("pending");
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");

  // DATA DUMMY
  const pendingInvitations = [
    {
      id: 1,
      course_title: "Pemrograman Web",
      teacher_name: "Budi Santoso",
      student_email: "siswa@email.com",
      invitation_code: "ABCD1234",
      message: "Selamat bergabung di kelas saya! Mari belajar web development bersama.",
      time: "2 hari yang lalu",
    },
    {
      id: 2,
      course_title: "Matematika Lanjutan",
      teacher_name: "Siti Aminah",
      student_email: "siswa@email.com",
      invitation_code: "MATH5678",
      message: "",
      time: "5 hari yang lalu",
    },
  ];

  const acceptedInvitations = [
    {
      id: 3,
      course_title: "Basis Data",
      teacher_name: "Ahmad Fauzi",
    },
    {
      id: 4,
      course_title: "Algoritma dan Pemrograman",
      teacher_name: "Dewi Lestari",
    },
  ];

  const expiredInvitations = [
    {
      id: 5,
      course_title: "UI/UX Design",
      teacher_name: "Andi Wijaya",
    },
  ];

  const handleAcceptByCode = () => {
    if (!invitationCode.trim()) {
      alert("❌ Mohon masukkan kode undangan");
      return;
    }
    alert("✅ Undangan berhasil diterima!");
    setShowCodeDialog(false);
    setInvitationCode("");
  };

  const handleAccept = (invitation) => {
    alert(`✅ Anda telah menerima undangan kelas "${invitation.course_title}"`);
  };

  const handleReject = (invitation) => {
    if (window.confirm(`Yakin ingin menolak undangan kelas "${invitation.course_title}"?`)) {
      alert("✅ Undangan berhasil ditolak");
    }
  };

  return (
    <div className="p-3 p-md-4 p-lg-5">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="fw-bold display-6 mb-2">Undangan Kelas</h1>
          <p className="text-muted mb-0">
            Anda memiliki <strong>{pendingInvitations.length}</strong> undangan menunggu
          </p>
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowCodeDialog(true)}
          style={{
            background: "linear-gradient(135deg, #2563eb, #16a34a)",
            border: "none",
            padding: "12px 24px",
            borderRadius: "12px",
            fontWeight: "600",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 10px 25px rgba(37, 99, 235, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          <Key size={20} />
          Gunakan Kode Undangan
        </button>
      </div>

      {/* TABS */}
      <div 
        className="bg-white rounded-4 shadow-sm p-2 mb-4 d-inline-flex gap-2"
      >
        {[
          { key: "pending", icon: Clock, label: "Menunggu", count: pendingInvitations.length },
          { key: "accepted", icon: Check, label: "Diterima", count: acceptedInvitations.length },
          { key: "expired", icon: AlertCircle, label: "Kadaluarsa", count: expiredInvitations.length },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`btn d-flex align-items-center gap-2 ${
              activeTab === tab.key ? "btn-primary" : "btn-light border-0"
            }`}
            onClick={() => setActiveTab(tab.key)}
            style={{
              borderRadius: "12px",
              padding: "10px 20px",
              fontWeight: "500",
              background: activeTab === tab.key 
                ? "linear-gradient(135deg, #2563eb, #16a34a)" 
                : "transparent",
              color: activeTab === tab.key ? "white" : "#6b7280",
              transition: "all 0.2s ease"
            }}
          >
            <tab.icon size={18} />
            <span className="d-none d-sm-inline">{tab.label}</span>
            <span 
              className="badge rounded-pill"
              style={{
                background: activeTab === tab.key ? "rgba(255,255,255,0.3)" : "#e5e7eb",
                color: activeTab === tab.key ? "white" : "#6b7280",
                padding: "4px 8px",
                fontSize: "0.75rem"
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div>
        {/* ================= MENUNGGU ================= */}
        {activeTab === "pending" && (
          <div>
            {pendingInvitations.length === 0 ? (
              <div className="card border-0 shadow-sm text-center p-5" style={{ borderRadius: "16px" }}>
                <Gift size={64} className="text-muted mx-auto mb-3" style={{ opacity: 0.3 }} />
                <h5 className="fw-bold mb-2">Tidak Ada Undangan</h5>
                <p className="text-muted mb-0">Anda tidak memiliki undangan yang menunggu</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {pendingInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="card border-0 shadow-sm border-start border-4"
                    style={{
                      borderRadius: "16px",
                      borderLeftColor: "#2563eb",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 15px 40px rgba(37, 99, 235, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "";
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex flex-column flex-lg-row justify-content-between gap-4">
                        <div className="flex-grow-1">
                          {/* Course Header */}
                          <div className="d-flex align-items-start gap-3 mb-3">
                            <div 
                              className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                              style={{
                                width: "56px",
                                height: "56px",
                                background: "linear-gradient(135deg, #2563eb, #16a34a)",
                                fontSize: "1.5rem"
                              }}
                            >
                              {inv.course_title.charAt(0)}
                            </div>
                            <div className="flex-grow-1">
                              <h5 className="fw-bold mb-1">{inv.course_title}</h5>
                              <p className="text-muted small mb-0">
                                Dari: <strong>{inv.teacher_name}</strong>
                              </p>
                            </div>
                          </div>

                          {/* Message */}
                          {inv.message && (
                            <div 
                              className="alert mb-3"
                              style={{
                                background: "#eff6ff",
                                border: "1px solid #bfdbfe",
                                borderRadius: "12px"
                              }}
                            >
                              <div className="d-flex gap-2">
                                <span>💬</span>
                                <p className="mb-0 small">"{inv.message}"</p>
                              </div>
                            </div>
                          )}

                          {/* Badges */}
                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <span 
                              className="badge"
                              style={{
                                background: "#f3f4f6",
                                color: "#6b7280",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                fontWeight: "500"
                              }}
                            >
                              <Mail size={12} className="me-1" />
                              {inv.student_email}
                            </span>
                            <span 
                              className="badge"
                              style={{
                                background: "#dbeafe",
                                color: "#2563eb",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                fontWeight: "600"
                              }}
                            >
                              <Key size={12} className="me-1" />
                              {inv.invitation_code}
                            </span>
                            <span className="small text-muted">
                              <Clock size={12} className="me-1" />
                              {inv.time}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex flex-column gap-2" style={{ minWidth: "140px" }}>
                          <button 
                            className="btn btn-success d-flex align-items-center justify-content-center gap-2"
                            onClick={() => handleAccept(inv)}
                            style={{
                              borderRadius: "10px",
                              padding: "10px 20px",
                              fontWeight: "600"
                            }}
                          >
                            <Check size={18} />
                            Terima
                          </button>
                          <button 
                            className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2"
                            onClick={() => handleReject(inv)}
                            style={{
                              borderRadius: "10px",
                              padding: "10px 20px",
                              fontWeight: "600"
                            }}
                          >
                            <X size={18} />
                            Tolak
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= DITERIMA ================= */}
        {activeTab === "accepted" && (
          <div>
            {acceptedInvitations.length === 0 ? (
              <div className="card border-0 shadow-sm text-center p-5" style={{ borderRadius: "16px" }}>
                <Check size={64} className="text-muted mx-auto mb-3" style={{ opacity: 0.3 }} />
                <p className="text-muted mb-0">Belum ada undangan yang diterima</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {acceptedInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="card border-0 shadow-sm border-start border-4"
                    style={{
                      borderRadius: "12px",
                      borderLeftColor: "#16a34a",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(8px)";
                      e.currentTarget.style.boxShadow = "0 10px 30px rgba(22, 163, 74, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.boxShadow = "";
                    }}
                  >
                    <div className="card-body p-4 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: "48px",
                            height: "48px",
                            background: "#dcfce7"
                          }}
                        >
                          <Check size={24} style={{ color: "#16a34a" }} />
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1">{inv.course_title}</h6>
                          <p className="text-muted small mb-0">Dari: {inv.teacher_name}</p>
                        </div>
                      </div>
                      <span 
                        className="badge"
                        style={{
                          background: "#dcfce7",
                          color: "#16a34a",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontWeight: "600"
                        }}
                      >
                        Diterima
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= KADALUARSA ================= */}
        {activeTab === "expired" && (
          <div>
            {expiredInvitations.length === 0 ? (
              <div className="card border-0 shadow-sm text-center p-5" style={{ borderRadius: "16px" }}>
                <AlertCircle size={64} className="text-muted mx-auto mb-3" style={{ opacity: 0.3 }} />
                <p className="text-muted mb-0">Tidak ada undangan yang kadaluarsa</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {expiredInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="card border-0 shadow-sm border-start border-4"
                    style={{
                      borderRadius: "12px",
                      borderLeftColor: "#9ca3af",
                      opacity: 0.7
                    }}
                  >
                    <div className="card-body p-4 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: "48px",
                            height: "48px",
                            background: "#f3f4f6"
                          }}
                        >
                          <AlertCircle size={24} style={{ color: "#9ca3af" }} />
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1 text-muted">{inv.course_title}</h6>
                          <p className="text-muted small mb-0">Dari: {inv.teacher_name}</p>
                        </div>
                      </div>
                      <span 
                        className="badge"
                        style={{
                          background: "#f3f4f6",
                          color: "#6b7280",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontWeight: "600"
                        }}
                      >
                        Kadaluarsa
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL CODE INPUT */}
      {showCodeDialog && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div 
                className="modal-content border-0 shadow-lg"
                style={{ borderRadius: "16px" }}
              >
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">
                    🎁 Masukkan Kode Undangan
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowCodeDialog(false)}
                  />
                </div>

                <div className="modal-body p-4">
                  <label className="form-label fw-semibold mb-2">Kode Undangan</label>
                  <input
                    type="text"
                    className="form-control border-0 shadow-sm text-center fw-bold"
                    placeholder="ABCD1234"
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    style={{
                      borderRadius: "12px",
                      padding: "16px",
                      background: "#f8f9fa",
                      fontSize: "1.5rem",
                      letterSpacing: "0.3em",
                      fontFamily: "monospace"
                    }}
                  />
                  <small className="text-muted d-block mt-2">
                    Kode undangan 8 karakter dikirim melalui email dari pengajar
                  </small>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    className="btn btn-light shadow-sm"
                    onClick={() => setShowCodeDialog(false)}
                    style={{
                      borderRadius: "12px",
                      padding: "10px 24px",
                      border: "none"
                    }}
                  >
                    Batal
                  </button>
                  <button 
                    className="btn btn-primary shadow-sm"
                    onClick={handleAcceptByCode}
                    disabled={invitationCode.length !== 8}
                    style={{
                      background: invitationCode.length !== 8 
                        ? "#9ca3af" 
                        : "linear-gradient(135deg, #2563eb, #16a34a)",
                      border: "none",
                      borderRadius: "12px",
                      padding: "10px 24px",
                      cursor: invitationCode.length !== 8 ? "not-allowed" : "pointer"
                    }}
                  >
                    <Check size={16} className="me-2" />
                    Terima Undangan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BACKDROP */}
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowCodeDialog(false)}
            style={{ zIndex: 1040 }}
          />
        </>
      )}
    </div>
  );
}