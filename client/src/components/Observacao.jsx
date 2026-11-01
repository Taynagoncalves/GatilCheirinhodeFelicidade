import { useState } from 'react';
import { StickyNote } from 'lucide-react';

export default function Observacao({ texto, compacta = false }) {
  const [aberta, setAberta] = useState(false);
  if (!texto?.trim()) return null;

  return (
    <div
      className={`gl-obs${compacta ? ' gl-obs-compacta' : ''}${aberta ? ' aberta' : ''}`}
      onClick={(e) => { e.stopPropagation(); setAberta(!aberta); }}
      title={aberta ? 'Toque para recolher' : 'Toque para ver tudo'}
    >
      <StickyNote size={compacta ? 12 : 14} className="gl-obs-icone" />
      <p>{texto.trim()}</p>
    </div>
  );
}
