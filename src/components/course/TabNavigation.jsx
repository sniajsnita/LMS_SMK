import { BookOpen, FileText, Award, MessageSquare, Users } from "lucide-react";

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: "materials", icon: BookOpen, label: "Materi" },
    { key: "assignments", icon: FileText, label: "Tugas" },
    { key: "quizzes", icon: Award, label: "Kuis" },
    { key: "discussions", icon: MessageSquare, label: "Diskusi" },
    { key: "members", icon: Users, label: "Anggota" },
  ];

  return (
    <div className="bg-white rounded-4 shadow-sm p-2 mb-4 d-inline-flex gap-2 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`btn d-flex align-items-center gap-2 ${
            activeTab === tab.key ? "btn-primary" : "btn-light border-0"
          }`}
          onClick={() => onTabChange(tab.key)}
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
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;