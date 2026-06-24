export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <p className="modal-title" style={{ fontSize: '1rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>Cancelar</button>
          <button className="btn btn-primary" style={{ flex: 1, background: 'var(--color-danger)' }} onClick={onConfirm}>Excluir</button>
        </div>
      </div>
    </div>
  );
}
