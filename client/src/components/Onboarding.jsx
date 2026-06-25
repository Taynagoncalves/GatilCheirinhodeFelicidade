import { useState, useEffect } from 'react';
import { Cat, Syringe, Heart, BarChart3, CheckCircle, Wallet } from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

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

/** Cicla por fases com durações distintas (ms). Retorna o índice da fase atual. */
function useLoop(delays) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    let id;
    const tick = (p) => {
      id = setTimeout(() => {
        const next = (p + 1) % delays.length;
        setPhase(next);
        tick(next);
      }, delays[p]);
    };
    tick(0);
    return () => clearTimeout(id);
  }, []);
  return phase;
}

// ─── primitivos visuais ──────────────────────────────────────────────────────

function PhoneFrame({ title, bg = '#1a4d7c', children }) {
  return (
    <div style={{
      width: 175, height: 262,
      background: '#f8fafc', borderRadius: 18, overflow: 'hidden',
      boxShadow: '0 14px 44px rgba(0,0,0,0.38)',
      border: '2.5px solid rgba(255,255,255,0.38)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* barra de status */}
      <div style={{ background: bg, padding: '7px 9px 6px', display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 11, height: 11, borderRadius: 3, border: '1.5px solid rgba(255,255,255,0.55)' }} />
        <span style={{ color: '#fff', fontSize: '0.58rem', fontWeight: 800, flex: 1, letterSpacing: 0.2 }}>{title}</span>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
      </div>
      {/* conteúdo */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

/** Anel de toque animado */
function Tap({ x, y, show }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, zIndex: 20,
      width: 24, height: 24, borderRadius: '50%',
      background: 'rgba(255,255,255,0.45)',
      border: '2px solid rgba(255,255,255,0.9)',
      transform: `translate(-50%,-50%) scale(${show ? 1 : 0.2})`,
      opacity: show ? 1 : 0,
      transition: 'all 0.22s cubic-bezier(.22,.68,0,1.2)',
      pointerEvents: 'none',
    }} />
  );
}

/** Linha cinza simulando texto */
function Line({ w = '60%', h = 6, color = '#2d3748', mb = 0 }) {
  return <div style={{ height: h, background: color, borderRadius: 3, width: w, marginBottom: mb }} />;
}

/** Card de item de lista */
function ListRow({ photoColor = '#c8a882', lines = ['65%', '45%'], badge }) {
  return (
    <div style={{ background: '#fff', borderRadius: 7, padding: '5px 7px', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
      <div style={{ width: 22, height: 22, borderRadius: 5, background: photoColor, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <Line w={lines[0]} h={6} mb={2} />
        <Line w={lines[1]} h={4} color="#cbd5e0" />
      </div>
      {badge
        ? <div style={{ background: badge.bg, border: `1px solid ${badge.cor}44`, borderRadius: 8, padding: '2px 5px', fontSize: '0.38rem', color: badge.cor, fontWeight: 700, whiteSpace: 'nowrap' }}>{badge.texto}</div>
        : <div style={{ width: 4, height: 7, background: '#cbd5e0', borderRadius: 2 }} />
      }
    </div>
  );
}

/** Botão primário mini */
function MiniBtn({ label, color = '#1a4d7c', lit = false }) {
  return (
    <div style={{
      background: color, borderRadius: 7, padding: '6px 8px', textAlign: 'center',
      color: '#fff', fontSize: '0.52rem', fontWeight: 700,
      boxShadow: lit ? `0 0 12px ${color}90` : 'none',
      transition: 'box-shadow 0.2s',
    }}>{label}</div>
  );
}

/** Sobreposição modal deslizante de baixo */
function SlideModal({ show, children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.42)',
      opacity: show ? 1 : 0,
      transition: 'opacity 0.3s',
      pointerEvents: 'none',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px 12px 0 0',
        padding: '9px 9px 14px', width: '100%',
        transform: show ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(.22,.68,0,1.2)',
      }}>
        {children}
      </div>
    </div>
  );
}

function ModalTitle({ children }) {
  return <div style={{ fontSize: '0.54rem', fontWeight: 800, color: '#1a202c', marginBottom: 7 }}>{children}</div>;
}

function ModalInput() {
  return <div style={{ height: 19, background: '#f0f4f8', borderRadius: 5, marginBottom: 4 }} />;
}

function ModalSaveBtn({ color = '#1a4d7c', label = 'Salvar' }) {
  return <div style={{ background: color, borderRadius: 6, padding: '5px', textAlign: 'center', color: '#fff', fontSize: '0.5rem', fontWeight: 700 }}>{label}</div>;
}

// ─── demos por tela ──────────────────────────────────────────────────────────

function DemoGatos() {
  // fases: 0=lista, 1=tap no botão, 2=modal, 3=reset
  const p = useLoop([1800, 500, 1900, 300]);
  return (
    <PhoneFrame title="Gatos">
      <div style={{ padding: 7, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <ListRow photoColor="#c8a882" />
        <ListRow photoColor="#8a8a8a" lines={['55%', '40%']} />
        <ListRow photoColor="#d4a0c0" lines={['70%', '35%']} />
        <div style={{ marginTop: 2 }}>
          <MiniBtn label="＋ Cadastrar Gato" lit={p === 1} />
        </div>
      </div>
      <Tap x={87} y={202} show={p === 1} />
      <SlideModal show={p === 2}>
        <ModalTitle>O que deseja fazer?</ModalTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ background: '#1a4d7c', borderRadius: 6, padding: '5px 7px', color: '#fff', fontSize: '0.5rem', fontWeight: 700 }}>🐱 Cadastrar Filhote</div>
          <div style={{ background: '#4a5568', borderRadius: 6, padding: '5px 7px', color: '#fff', fontSize: '0.5rem', fontWeight: 700 }}>👥 Ver Pais</div>
        </div>
      </SlideModal>
    </PhoneFrame>
  );
}

function DemoSaude() {
  const p = useLoop([1800, 500, 1900, 300]);
  const COLS = ['D','S','T','Q','Q','S','S'];
  // semana do dia 8 (terça = índice 2)
  const row1 = [null,null,1,2,3,4,5];
  const row2 = [6,7,8,9,10,11,12];
  return (
    <PhoneFrame title="Saúde">
      <div style={{ padding: '6px 7px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <MiniBtn label="💉 Registrar Dose" />
        {/* calendário mini */}
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ background: '#1a4d7c', padding: '5px 7px', textAlign: 'center' }}>
            <div style={{ color: '#fff', fontSize: '0.5rem', fontWeight: 800 }}>Junho 2026</div>
          </div>
          <div style={{ padding: '4px 3px 5px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 3 }}>
              {COLS.map((c,i) => <div key={i} style={{ textAlign: 'center', fontSize: '0.38rem', color: '#8898aa', fontWeight: 700 }}>{c}</div>)}
            </div>
            {/* semana com nulls */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 2 }}>
              {row1.map((d, i) => (
                <div key={i} style={{ height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {d && <div style={{ fontSize: '0.4rem', color: '#2d3748', fontWeight: 600 }}>{d}</div>}
                </div>
              ))}
            </div>
            {/* semana com doses */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
              {row2.map((d) => {
                const hasDot = d === 8 || d === 12;
                const sel = d === 8 && p >= 1;
                return (
                  <div key={d} style={{ height: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <div style={{
                      width: 15, height: 15, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.4rem', fontWeight: 700,
                      background: sel ? '#1a4d7c' : 'transparent',
                      color: sel ? '#fff' : '#2d3748',
                      transition: 'all 0.2s',
                    }}>{d}</div>
                    {hasDot && <div style={{ width: 5, height: 5, borderRadius: '50%', background: d === 8 ? '#e6900a' : '#3a9e68' }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Tap x={46} y={136} show={p === 1} />
      {/* card de detalhe deslizante */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#fff', borderRadius: '10px 10px 0 0', padding: '8px 8px 10px',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.12)',
        transform: p === 2 ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(.22,.68,0,1.2)',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: '0.48rem', fontWeight: 800, color: '#1a202c', marginBottom: 6 }}>8 de Junho</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', borderRadius: 7, padding: '5px 6px', borderLeft: '3px solid #e6900a' }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: '#c8a882', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Line w="65%" h={5} mb={2} />
            <Line w="50%" h={4} color="#cbd5e0" />
          </div>
          <div style={{ background: '#fef3e2', border: '1px solid #e6900a44', borderRadius: 8, padding: '2px 5px', fontSize: '0.38rem', color: '#e6900a', fontWeight: 700 }}>Hoje</div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function DemoNinhadas() {
  const p = useLoop([1800, 500, 1900, 300]);
  return (
    <PhoneFrame title="Ninhadas" bg="#6d28d9">
      <div style={{ padding: 7, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* card de ninhada existente */}
        <div style={{ background: '#fff', borderRadius: 7, padding: '6px 7px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <Line w="52%" h={6} color="#6d28d9" />
            <Line w="28%" h={4} color="#cbd5e0" />
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {['#c8a882','#8a8a8a','#d4a0c0','#a07850'].map((c,i) => (
              <div key={i} style={{ width: 18, height: 18, borderRadius: 4, background: c }} />
            ))}
          </div>
        </div>
        <ListRow photoColor="#a07850" lines={['60%','38%']} />
        <div style={{ marginTop: 2 }}>
          <MiniBtn label="＋ Adicionar Ninhada" color="#6d28d9" lit={p === 1} />
        </div>
      </div>
      <Tap x={87} y={197} show={p === 1} />
      <SlideModal show={p === 2}>
        <ModalTitle>Nova Ninhada</ModalTitle>
        <ModalInput />
        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          <div style={{ flex: 1, height: 19, background: '#f0f4f8', borderRadius: 5 }} />
          <div style={{ flex: 1, height: 19, background: '#f0f4f8', borderRadius: 5 }} />
        </div>
        <ModalSaveBtn color="#6d28d9" />
      </SlideModal>
    </PhoneFrame>
  );
}

function DemoHome() {
  const p = useLoop([1800, 500, 1900, 300]);
  const stats = [
    { label: 'Gatos', value: '5', cor: '#1a4d7c' },
    { label: 'Ninhadas', value: '2', cor: '#6d28d9' },
    { label: 'Reservados', value: '1', cor: '#b45309' },
    { label: 'Vendidos', value: '3', cor: '#2d6b44' },
  ];
  return (
    <PhoneFrame title="Cheirinho de Felicidade">
      <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 7, padding: '6px', textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
              border: i === 0 && p >= 1 ? `1.5px solid ${s.cor}` : '1.5px solid transparent',
              transition: 'border 0.2s',
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: s.cor }}>{s.value}</div>
              <div style={{ fontSize: '0.38rem', color: '#718096', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.48rem', fontWeight: 800, color: '#2d3748' }}>Próximas doses</div>
        <ListRow photoColor="#c8a882" badge={{ texto: 'Hoje', cor: '#e6900a', bg: '#fef3e2' }} />
        <ListRow photoColor="#8a8a8a" lines={['60%','42%']} badge={{ texto: 'Em 3 dias', cor: '#3a9e68', bg: '#edf7f1' }} />
        <ListRow photoColor="#a07850" lines={['52%','38%']} badge={{ texto: 'Atrasada', cor: '#d9534f', bg: '#fdecea' }} />
      </div>
      <Tap x={44} y={64} show={p === 1} />
      {/* flash de navegação */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(26,77,124,0.07)',
        opacity: p === 2 ? 1 : 0,
        transition: 'opacity 0.3s',
        pointerEvents: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: '#1a4d7c', borderRadius: 8, padding: '5px 12px',
          color: '#fff', fontSize: '0.48rem', fontWeight: 700,
          transform: p === 2 ? 'scale(1)' : 'scale(0.7)',
          transition: 'transform 0.3s',
        }}>→ Lista de Gatos</div>
      </div>
    </PhoneFrame>
  );
}

function DemoFinanceiro() {
  const p = useLoop([1800, 500, 1900, 300]);
  return (
    <PhoneFrame title="Financeiro" bg="#6d28d9">
      <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* tabs */}
        <div style={{ display: 'flex', background: '#fff', borderRadius: 7, padding: 3, gap: 2 }}>
          {['Resumo','Lançamentos','Histórico'].map((t,i) => (
            <div key={t} style={{
              flex: 1, textAlign: 'center', padding: '3px 0', borderRadius: 5,
              background: i === 0 ? '#6d28d9' : 'transparent',
              color: i === 0 ? '#fff' : '#718096',
              fontSize: '0.36rem', fontWeight: 700,
            }}>{t}</div>
          ))}
        </div>
        {/* saldo */}
        <div style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)', borderRadius: 8, padding: '8px 9px', color: '#fff' }}>
          <div style={{ fontSize: '0.38rem', opacity: 0.8, marginBottom: 2 }}>Saldo do mês</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>R$ 2.500</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            <div><div style={{ fontSize: '0.35rem', opacity: 0.75 }}>Entradas</div><div style={{ fontSize: '0.48rem', fontWeight: 700 }}>R$ 3.000</div></div>
            <div><div style={{ fontSize: '0.35rem', opacity: 0.75 }}>Saídas</div><div style={{ fontSize: '0.48rem', fontWeight: 700 }}>R$ 500</div></div>
          </div>
        </div>
        {/* botões */}
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{
            flex: 1, background: '#15803d', borderRadius: 6, padding: '5px 3px', textAlign: 'center',
            color: '#fff', fontSize: '0.42rem', fontWeight: 700,
            boxShadow: p === 1 ? '0 0 10px #15803d80' : 'none',
            transition: 'box-shadow 0.2s',
          }}>＋ Registrar Entrada</div>
          <div style={{ flex: 1, background: '#dc2626', borderRadius: 6, padding: '5px 3px', textAlign: 'center', color: '#fff', fontSize: '0.42rem', fontWeight: 700 }}>－ Registrar Gasto</div>
        </div>
      </div>
      <Tap x={46} y={212} show={p === 1} />
      <SlideModal show={p === 2}>
        <ModalTitle>Nova Entrada</ModalTitle>
        <ModalInput />
        <ModalInput />
        <ModalSaveBtn color="#15803d" label="Salvar Entrada" />
      </SlideModal>
    </PhoneFrame>
  );
}

// ─── slides ──────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    gradient: 'linear-gradient(155deg, #1a4060 0%, #2f6690 65%, #3d85b5 100%)',
    renderVisual: () => (
      <div className="ob-icon-circle"><PataIcon size={82} /></div>
    ),
    subtitulo: 'Cheirinho de Felicidade',
    titulo: 'Olá, Lidia! 🐾',
    texto: 'Bem-vinda ao seu espaço exclusivo para gerir o gatil com amor, organização e praticidade.',
  },
  {
    gradient: 'linear-gradient(155deg, #7c3100 0%, #b45309 65%, #d97706 100%)',
    renderVisual: () => <DemoGatos />,
    titulo: 'Seus Gatinhos',
    texto: 'Cadastre filhotes com foto, raça e cor. Acompanhe a idade e gerencie a disponibilidade de cada um.',
  },
  {
    gradient: 'linear-gradient(155deg, #1a4d2e 0%, #2d6b44 65%, #3f8c5a 100%)',
    renderVisual: () => <DemoSaude />,
    titulo: 'Saúde em Dia',
    texto: 'Registre vacinas e medicamentos para gatos e pais. Veja tudo no calendário e receba alertas automáticos.',
  },
  {
    gradient: 'linear-gradient(155deg, #3b0764 0%, #6d28d9 65%, #8b5cf6 100%)',
    renderVisual: () => <DemoNinhadas />,
    titulo: 'Ninhadas',
    texto: 'Registre seus casais reprodutores e acompanhe cada ninhada — do nascimento até a nova família.',
  },
  {
    gradient: 'linear-gradient(155deg, #0c3d52 0%, #0e7490 65%, #0891b2 100%)',
    renderVisual: () => <DemoHome />,
    titulo: 'Controle Total',
    texto: 'Veja em um só lugar gatos disponíveis, reservados e vendidos — com as próximas doses e seus status.',
  },
  {
    gradient: 'linear-gradient(155deg, #3b1f6b 0%, #6d28d9 65%, #7b5ea7 100%)',
    renderVisual: () => <DemoFinanceiro />,
    titulo: 'Financeiro',
    texto: 'Registre vendas, gastos com veterinário, ração e mais. Acompanhe entradas, saídas e o saldo do mês.',
  },
  {
    gradient: 'linear-gradient(155deg, #1a4060 0%, #2f6690 65%, #3d85b5 100%)',
    renderVisual: () => (
      <div className="ob-icon-circle"><CheckCircle size={74} color="#fff" strokeWidth={1.4} /></div>
    ),
    titulo: 'Tudo Pronto! 🐱',
    texto: 'Seu gatil vai ser o mais bem organizado do mundo, Lidia. Pode começar com tudo!',
    final: true,
  },
];

// ─── componente principal ────────────────────────────────────────────────────

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

  const voltar = () => { if (atual > 0) ir(atual - 1); };

  const terminar = () => {
    localStorage.setItem('onboarding_visto', 'v2');
    onDone();
  };

  const slide = SLIDES[atual];
  const isFirst = atual === 0;
  const isFinal = !!slide.final;

  return (
    <div className="ob-overlay">

      {/* área gradiente com o demo/ícone */}
      <div className="ob-top" style={{ background: slide.gradient }}>
        <div className="ob-deco ob-deco-1"><PataIcon size={50} color="rgba(255,255,255,0.11)" /></div>
        <div className="ob-deco ob-deco-2"><PataIcon size={30} color="rgba(255,255,255,0.09)" /></div>
        <div className="ob-deco ob-deco-3"><PataIcon size={60} color="rgba(255,255,255,0.07)" /></div>
        <div className="ob-deco ob-deco-4"><PataIcon size={34} color="rgba(255,255,255,0.10)" /></div>

        {!isFinal && (
          <button className="ob-skip" onClick={terminar}>Pular</button>
        )}

        <div className={`ob-icon-wrap ${visivel ? 'ob-fade-in' : 'ob-fade-out'}`}>
          {slide.renderVisual()}
        </div>
      </div>

      {/* onda */}
      <div className="ob-wave" style={{ background: slide.gradient }}>
        <svg viewBox="0 0 375 52" preserveAspectRatio="none" width="100%" height="52">
          <path d="M0,18 C70,52 180,2 285,36 C330,48 360,30 375,22 L375,52 L0,52 Z" fill="#fff" />
        </svg>
      </div>

      {/* área branca */}
      <div className="ob-bottom">
        <div className={`ob-text ${visivel ? 'ob-fade-in' : 'ob-fade-out'}`}>
          {slide.subtitulo && <p className="ob-app-nome">{slide.subtitulo}</p>}
          <h2 className="ob-titulo">{slide.titulo}</h2>
          <p className="ob-texto">{slide.texto}</p>
        </div>

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

        <div className="ob-nav">
          {!isFirst && (
            <button className="ob-btn-voltar" onClick={voltar} disabled={animando}>← Voltar</button>
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
