const EmptyState = ({ icon: Icon, message }) => (
  <div className="text-center text-muted py-5">
    <Icon size={48} className="mb-3" style={{ opacity: 0.5 }} />
    <p>{message}</p>
  </div>
);

export default EmptyState;