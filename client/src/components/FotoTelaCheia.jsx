import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

export default function FotoTelaCheia({ src, alt, legenda, onClose }) {
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const overflowAntes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflowAntes;
    };
  }, [onClose]);

  return createPortal(
    <div className="ftc-overlay" onClick={onClose}>
      <div className="ftc-topo" onClick={(e) => e.stopPropagation()}>
        {legenda && <span className="ftc-legenda">{legenda}</span>}
        <div className="ftc-botoes">
          <button onClick={() => setZoom(!zoom)} aria-label={zoom ? 'Diminuir' : 'Ampliar'}>
            {zoom ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          </button>
          <button onClick={onClose} aria-label="Fechar"><X size={22} /></button>
        </div>
      </div>
      <div className={`ftc-area${zoom ? ' zoom' : ''}`}>
        <img
          src={src}
          alt={alt}
          className="ftc-img"
          onClick={(e) => { e.stopPropagation(); setZoom(!zoom); }}
        />
      </div>
    </div>,
    document.body,
  );
}
