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
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="28" cy="30" rx="10" ry="13" fill="#fff" opacity="0.9"/>
            <ellipse cx="50" cy="24" rx="10" ry="13" fill="#fff" opacity="0.9"/>
            <ellipse cx="72" cy="30" rx="10" ry="13" fill="#fff" opacity="0.9"/>
            <ellipse cx="16" cy="50" rx="9" ry="12" fill="#fff" opacity="0.9"/>
            <ellipse cx="84" cy="50" rx="9" ry="12" fill="#fff" opacity="0.9"/>
            <ellipse cx="50" cy="65" rx="32" ry="28" fill="#fff" opacity="0.9"/>
          </svg>
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
