const labels = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
  mantido: 'Mantido no gatil',
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  return <span className={`status-badge status-${status}`}>{labels[status] || status}</span>;
}
