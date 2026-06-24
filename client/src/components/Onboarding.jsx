import { useState } from 'react';
import { Cat, Syringe, Heart, BarChart3, CheckCircle, Wallet } from 'lucide-react';

const PataIcon = ({ size = 64, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <ellipse cx="28" cy="30" rx="10" ry="13" fill={color} />
    <ellipse cx="50" cy="24" rx="10" ry="13" fill={color} />
    <ellipse cx="72" cy="30" rx="10" ry="13" fill={color} />
    <ellipse cx="16" cy="50" rx="9"  ry="12" fill={color} />
    <ellipse cx="84" cy="50" rx="9"  ry="12" fill={color} />
    <ellipse cx="50" cy="65" rx="32" ry="28" fill={color} />
  </svg>
);

const SLIDES = [
  {
    gradient: 'linear-gradient(155deg, #1a4060 0%, #2f6690 65%, #3d85b5 100%)',
    renderIcon: () => <PataIcon size={82} />,
    subtitulo: 'Cheirinho de Felicidade',
    titulo: 'Olá, Lidia! 🐾',
    texto: 'Bem-vinda ao seu espaço exclusivo para gerir o gatil com amor, organização e praticidade.',
  },
  {
    gradient: 'linear-gradient(155deg, #7c3100 0%, #b45309 65%, #d97706 100%)',
    renderIcon: () => <Cat size={74} color="#fff" strokeWidth={1.4} />,
    titulo: 'Seus Gatinhos',
    texto: 'Cadastre filhotes com foto, raça e cor. Acompanhe a idade de cada um crescendo dia a dia e gerencie a disponibilidade deles.',
  },
  {
    gradient: 'linear-gradient(155deg, #1a4d2e 0%, #2d6b44 65%, #3f8c5a 100%)',
    renderIcon: () => <Syringe size={74} color="#fff" strokeWidth={1.4} />,
    titulo: 'Saúde em Dia',
    texto: 'Registre vacinas e medicamentos. Receba alertas automáticos quando uma dose estiver próxima, no dia ou atrasada.',
  },
  {
    gradient: 'linear-gradient(155deg, #3b0764 0%, #6d28d9 65%, #8b5cf6 100%)',
    renderIcon: () => <Heart size={74} color="#fff" strokeWidth={1.4} />,
    titulo: 'Ninhadas',
    texto: 'Registre seus casais reprodutores e acompanhe cada ninhada — do nascimento dos filhotes até a nova família.',
  },
  {
    gradient: 'linear-gradient(155deg, #0c3d52 0%, #0e7490 65%, #0891b2 100%)',
    renderIcon: () => <BarChart3 size={74} color="#fff" strokeWidth={1.4} />,
    titulo: 'Controle Total',
    texto: 'Veja em um só lugar quantos gatos estão disponíveis, reservados ou já vendidos. Tudo organizado e sempre atualizado.',
  },
  {
    gradient: 'linear-gradient(155deg, #3b1f6b 0%, #6d28d9 65%, #7b5ea7 100%)',
    renderIcon: () => <Wallet size={74} color="#fff" strokeWidth={1.4} />,
    titulo: 'Financeiro',
    texto: 'Registre vendas, gastos com veterinário, ração e muito mais. Acompanhe entradas, saídas e o saldo do mês direto na tela inicial.',
  },
  {
    gradient: 'linear-gradient(155deg, #1a4060 0%, #2f6690 65%, #3d85b5 100%)',
    renderIcon: () => <CheckCircle size={74} color="#fff" strokeWidth={1.4} />,
    titulo: 'Tudo Pronto! 🐱',
    texto: 'Seu gatil vai ser o mais bem organizado do mundo, Lidia. Pode começar com tudo!',
    final: true,
  },
];

export default function Onboarding({ onDone }) {
  const [atual, setAtual] = useState(0);
  const [animando, setAnimando] = useState(false);
  const [visivel, setVisivel] = useState(true);

  const ir = (proximo) => {
    if (animando) return;
    setAnimando(true);
    setVisivel(false);
    setTimeout(() => {
      setAtual(proximo);
      setVisivel(true);
      setTimeout(() => setAnimando(false), 330);
    }, 250);
  };

  const avancar = () => {
    if (atual < SLIDES.length - 1) ir(atual + 1);
    else terminar();
  };

  const voltar = () => {
    if (atual > 0) ir(atual - 1);
  };

  const terminar = () => {
    localStorage.setItem('onboarding_visto', 'v2');
    onDone();
  };

  const slide = SLIDES[atual];
  const isFirst = atual === 0;
  const isFinal = !!slide.final;

  return (
    <div className="ob-overlay">

      {/* ── Topo colorido ── */}
      <div className="ob-top" style={{ background: slide.gradient }}>

        {/* Patas decorativas de fundo */}
        <div className="ob-deco ob-deco-1"><PataIcon size={50} color="rgba(255,255,255,0.11)" /></div>
        <div className="ob-deco ob-deco-2"><PataIcon size={30} color="rgba(255,255,255,0.09)" /></div>
        <div className="ob-deco ob-deco-3"><PataIcon size={60} color="rgba(255,255,255,0.07)" /></div>
        <div className="ob-deco ob-deco-4"><PataIcon size={34} color="rgba(255,255,255,0.10)" /></div>

        {/* Botão pular */}
        {!isFinal && (
          <button className="ob-skip" onClick={terminar}>Pular</button>
        )}

        {/* Ícone principal */}
        <div className={`ob-icon-wrap ${visivel ? 'ob-fade-in' : 'ob-fade-out'}`}>
          <div className="ob-icon-circle">
            {slide.renderIcon()}
          </div>
        </div>
      </div>

      {/* ── Onda separadora ── */}
      <div className="ob-wave" style={{ background: slide.gradient }}>
        <svg viewBox="0 0 375 52" preserveAspectRatio="none" width="100%" height="52">
          <path d="M0,18 C70,52 180,2 285,36 C330,48 360,30 375,22 L375,52 L0,52 Z" fill="#fff" />
        </svg>
      </div>

      {/* ── Área branca inferior ── */}
      <div className="ob-bottom">

        {/* Texto do slide */}
        <div className={`ob-text ${visivel ? 'ob-fade-in' : 'ob-fade-out'}`}>
          {slide.subtitulo && <p className="ob-app-nome">{slide.subtitulo}</p>}
          <h2 className="ob-titulo">{slide.titulo}</h2>
          <p className="ob-texto">{slide.texto}</p>
        </div>

        {/* Pontos de progresso */}
        <div className="ob-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`ob-dot${i === atual ? ' ob-dot-ativo' : ''}`}
              onClick={() => !animando && i !== atual && ir(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Botões de navegação */}
        <div className="ob-nav">
          {!isFirst && (
            <button className="ob-btn-voltar" onClick={voltar} disabled={animando}>
              ← Voltar
            </button>
          )}
          <button
            className={`ob-btn-next${isFinal ? ' ob-btn-final' : ''}`}
            style={isFirst ? { flex: 1 } : {}}
            onClick={avancar}
            disabled={animando}
          >
            {isFinal ? '🐾 Começar agora!' : 'Próximo →'}
          </button>
        </div>
      </div>
    </div>
  );
}
