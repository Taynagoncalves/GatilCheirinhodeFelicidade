import { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSaindo(true), 3800);
    const t2 = setTimeout(() => onDone(), 4400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`splash${saindo ? ' splash-saindo' : ''}`}>
      <div className="splash-content">
        <div className="splash-pata">
          <img src="/logo.png" alt="Cheirinho de Felicidade" style={{
            width: '100%', height: '100%', objectFit: 'contain',
            borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }} />
        </div>
        <h1 className="splash-titulo">Cheirinho de Felicidade</h1>
        <p className="splash-sub">Olá, Lidia!</p>
        <div className="splash-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
