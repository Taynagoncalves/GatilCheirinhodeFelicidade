export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={26} />
      </span>
      <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>{title}</p>
      {description && <p>{description}</p>}
    </div>
  );
}
