import { useNavigate } from 'react-router-dom';
import { Cat, Wallet, PawPrint } from 'lucide-react';

const PataIcon = ({ size = 40, color = 'rgba(255,255,255,0.18)' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <ellipse cx="28" cy="30" rx="10" ry="13" fill={color} />
    <ellipse cx="50" cy="24" rx="10" ry="13" fill={color} />
    <ellipse cx="72" cy="30" rx="10" ry="13" fill={color} />
    <ellipse cx="16" cy="50" rx="9"  ry="12" fill={color} />
    <ellipse cx="84" cy="50" rx="9"  ry="12" fill={color} />
    <ellipse cx="50" cy="65" rx="32" ry="28" fill={color} />
  </svg>
);

export default function MenuPrincipal({ onEntrar }) {
  const navigate = useNavigate();

  const ir = (rota) => {
    navigate(rota);
    onEntrar();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'linear-gradient(165deg, #0d1f35 0%, #1a3a5c 50%, #1e2a4a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '0 20px',
      overflow: 'hidden',
    }}>
      {/* Patas decorativas de fundo */}
      <div style={{ position: 'absolute', top: 30,  right: -10, opacity: 0.4 }}><PataIcon size={90} /></div>
      <div style={{ position: 'absolute', top: 120, left: -20, opacity: 0.25 }}><PataIcon size={60} /></div>
      <div style={{ position: 'absolute', bottom: 180, right: 10, opacity: 0.2 }}><PataIcon size={70} /></div>
      <div style={{ position: 'absolute', bottom: 80,  left: -10, opacity: 0.3 }}><PataIcon size={50} /></div>

      {/* Cabeçalho */}
      <div style={{ marginTop: 72, textAlign: 'center', zIndex: 1 }}>
        <div style={{
          width: 120, height: 120,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </div>
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>
          Cheirinho de Felicidade
        </p>
        <h1 style={{ margin: '8px 0 4px', fontSize: '1.7rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
          Olá, Lidia! 🐾
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)' }}>
          Por onde vai começar hoje?
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', marginTop: 44, zIndex: 1 }}>

        {/* Card Gestão */}
        <button
          onClick={() => ir('/')}
          style={{
            all: 'unset', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1a5276 0%, #2e86c1 60%, #5dade2 100%)',
            borderRadius: 22,
            padding: '28px 24px',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(29,131,201,0.35)',
            display: 'flex', alignItems: 'center', gap: 20,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.18 }}><PataIcon size={100} color="#fff" /></div>
          <div style={{
            width: 60, height: 60, borderRadius: 16, flexShrink: 0,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Cat size={32} color="#fff" strokeWidth={1.5} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>Gestão do Gatil</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
              Gatos, ninhadas, saúde,{'\n'}agenda de doses e muito mais
            </p>
          </div>
        </button>

        {/* Card Financeiro */}
        <button
          onClick={() => ir('/financeiro')}
          style={{
            all: 'unset', cursor: 'pointer',
            background: 'linear-gradient(135deg, #4a235a 0%, #7d3c98 60%, #a569bd 100%)',
            borderRadius: 22,
            padding: '28px 24px',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(125,60,152,0.35)',
            display: 'flex', alignItems: 'center', gap: 20,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.18 }}><PataIcon size={100} color="#fff" /></div>
          <div style={{
            width: 60, height: 60, borderRadius: 16, flexShrink: 0,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Wallet size={30} color="#fff" strokeWidth={1.5} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>Clientes e Financeiro</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
              Vendas, gastos e saldo do mês
            </p>
          </div>
        </button>
      </div>

      {/* Rodapé */}
      <p style={{ marginTop: 'auto', marginBottom: 32, fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
        🐾 Cheirinho de Felicidade
      </p>
    </div>
  );
}
