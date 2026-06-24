import { useEffect, useState } from 'react';
import { X, ChevronLeft } from 'lucide-react';

export default function Tour({ steps, passo, onNext, onPrev, onClose }) {
  const [rect, setRect] = useState(null);
  const step = steps[passo];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!step?.selector) { setRect(null); return; }

    const el = document.querySelector(step.selector);
    if (!el) { setRect(null); return; }

    const snap = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    snap();
    const t = setTimeout(snap, 380);
    return () => clearTimeout(t);
  }, [passo, step?.selector]);

  if (!step) return null;

  const wh = window.innerHeight;
  const elCenter = rect ? rect.top + rect.height / 2 : wh * 0.4;
  const abaixo   = !rect || elCenter < wh * 0.44;

  let pos = {};
  if (!rect)       pos = { top: '50%', transform: 'translateX(-50%) translateY(-50%)' };
  else if (abaixo) pos = { top: rect.top + rect.height + 14, transform: 'translateX(-50%)' };
  else             pos = { bottom: wh - rect.top + 14,       transform: 'translateX(-50%)' };

  return (
    <>
      {/* backdrop clicável */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9994 }} onClick={onClose} />

      {/* overlay escuro para passos sem seletor */}
      {!rect && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,24,38,0.80)', zIndex: 9995, pointerEvents: 'none' }} />
      )}

      {/* spotlight — box-shadow cria o escurecimento ao redor */}
      {rect && (
        <div style={{
          position: 'fixed',
          top: rect.top - 6, left: rect.left - 6,
          width: rect.width + 12, height: rect.height + 12,
          borderRadius: 10,
          boxShadow: '0 0 0 9999px rgba(12,24,38,0.80)',
          border: '2px solid rgba(255,255,255,0.38)',
          zIndex: 9996,
          pointerEvents: 'none',
          transition: 'top .25s ease, left .25s ease, width .25s ease, height .25s ease',
        }} />
      )}

      {/* tooltip */}
      <div style={{ position: 'fixed', left: '50%', width: 'min(92%, 360px)', zIndex: 9997, ...pos }}
           onClick={(e) => e.stopPropagation()}>
        <div className="tour-card" key={passo}>
          <button className="tour-close" onClick={onClose} aria-label="Fechar tutorial">
            <X size={15} />
          </button>

          <p className="tour-counter">{passo + 1} / {steps.length}</p>
          <h3 className="tour-title">{step.titulo}</h3>
          <p className="tour-desc">{step.texto}</p>

          <div className="tour-dots">
            {steps.map((_, i) => (
              <div key={i} className={`tour-dot${i === passo ? ' tour-dot-on' : ''}`} />
            ))}
          </div>

          <div className="tour-nav">
            {passo > 0 ? (
              <button className="tour-prev" onClick={onPrev}>
                <ChevronLeft size={16} /> Anterior
              </button>
            ) : <span />}
            <button className="tour-next" onClick={onNext}>
              {passo === steps.length - 1 ? 'Concluir ✓' : 'Próximo →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
