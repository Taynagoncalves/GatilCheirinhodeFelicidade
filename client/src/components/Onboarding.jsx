import { useState, useEffect } from 'react';
import {
  CheckCircle, ChevronLeft, Plus, Syringe, Cat, Bell,
  Wallet, Heart, PawPrint, Users, BarChart3, Pill, CalendarDays,
} from 'lucide-react';

// ─── ícone de pata ───────────────────────────────────────────────────────────
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

// ─── hook de loop de fases ───────────────────────────────────────────────────
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

// ─── frame de celular premium ─────────────────────────────────────────────────
function Phone({ headerBg = '#1a4d7c', title, icon, children }) {
  return (
    <div style={{ transform: 'scale(1.28)', transformOrigin: 'center center' }}>
      <div style={{
        width: 188, height: 278,
        background: '#f0f4f8',
        borderRadius: 22, overflow: 'hidden',
        border: '2.5px solid rgba(255,255,255,0.55)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.45)',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}>
        {/* barra de status */}
        <div style={{ background: headerBg, height: 19, padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.35rem', fontWeight: 800, letterSpacing: 0.3 }}>9:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {[3,5,7].map((h,i) => <div key={i} style={{ width: 2.5, height: h, background: 'rgba(255,255,255,0.75)', borderRadius: 1 }} />)}
            <div style={{ width: 14, height: 7, border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: 2, marginLeft: 2, display: 'flex', alignItems: 'center', padding: '1px 1px' }}>
              <div style={{ width: '70%', height: '100%', background: 'rgba(255,255,255,0.75)', borderRadius: 1 }} />
            </div>
          </div>
        </div>
        {/* header do app */}
        <div style={{ background: headerBg, padding: '7px 10px 9px', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={13} color="#fff" />
          </div>
          <span style={{ color: '#fff', fontSize: '0.64rem', fontWeight: 800, flex: 1, letterSpacing: 0.2 }}>{title}</span>
          {icon && <div style={{ color: 'rgba(255,255,255,0.8)' }}>{icon}</div>}
        </div>
        {/* conteúdo */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── cursor dedo animado ──────────────────────────────────────────────────────
function Finger({ tapX, tapY, phase }) {
  const onBtn = phase === 1 || phase === 2;
  const pressing = phase === 2;
  const visible = phase === 1 || phase === 2;
  return (
    <div style={{
      position: 'absolute',
      left: onBtn ? tapX : 162,
      top:  onBtn ? tapY - 10 : 250,
      transform: `translate(-50%,-50%) scale(${pressing ? 0.78 : 1}) rotate(${pressing ? -4 : 0}deg)`,
      transition: visible
        ? 'left 0.48s cubic-bezier(.4,0,.2,1), top 0.48s cubic-bezier(.4,0,.2,1), opacity 0.22s, transform 0.14s'
        : 'opacity 0.18s',
      opacity: visible ? 1 : 0,
      fontSize: '20px', zIndex: 30, pointerEvents: 'none',
      filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.45))',
    }}>👆</div>
  );
}

// ─── bottom sheet modal ───────────────────────────────────────────────────────
function Sheet({ show, children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      background: show ? 'rgba(0,0,0,0.48)' : 'rgba(0,0,0,0)',
      transition: 'background 0.32s',
      display: 'flex', alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      <div style={{
        background: '#fff', width: '100%',
        borderRadius: '14px 14px 0 0',
        padding: '0 10px 14px',
        transform: show ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.38s cubic-bezier(.22,.68,0,1.18)',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.18)',
      }}>
        {/* handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 6px' }}>
          <div style={{ width: 32, height: 4, background: '#d1d5db', borderRadius: 2 }} />
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── componentes visuais reutilizáveis ───────────────────────────────────────
function CatAvatar({ color, size = 26 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: `linear-gradient(140deg, ${color}, ${color}bb)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, boxShadow: `0 2px 6px ${color}60`,
    }}>
      <Cat size={size * 0.54} color="rgba(255,255,255,0.92)" strokeWidth={1.7} />
    </div>
  );
}

function TextLine({ w, h = 6, color = '#1e293b', mb = 0 }) {
  return <div style={{ height: h, background: color, borderRadius: 3, width: w, marginBottom: mb }} />;
}

function CardRow({ color, name, sub, badge }) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 1px 5px rgba(0,0,0,0.08)' }}>
      <CatAvatar color={color} size={26} />
      <div style={{ flex: 1 }}>
        <TextLine w={name} h={6} mb={3} />
        <TextLine w={sub} h={4} color="#94a3b8" />
      </div>
      {badge
        ? <span style={{ fontSize: '0.36rem', fontWeight: 700, color: badge.cor, background: badge.bg, border: `1px solid ${badge.cor}44`, borderRadius: 8, padding: '2px 5px', whiteSpace: 'nowrap' }}>{badge.txt}</span>
        : <ChevronLeft size={8} color="#cbd5e0" style={{ transform: 'rotate(180deg)' }} />
      }
    </div>
  );
}

function GradBtn({ label, color, pressed, icon: Icon }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
      borderRadius: 8, padding: '7px 9px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
      color: '#fff', fontSize: '0.53rem', fontWeight: 700,
      boxShadow: pressed ? `0 0 18px ${color}80, 0 2px 6px rgba(0,0,0,0.18)` : '0 2px 8px rgba(0,0,0,0.14)',
      transform: pressed ? 'scale(0.96)' : 'scale(1)',
      transition: 'all 0.15s',
    }}>
      {Icon && <Icon size={11} strokeWidth={2.5} />}
      {label}
    </div>
  );
}

function SheetTitle({ children }) {
  return <p style={{ margin: '0 0 8px', fontSize: '0.6rem', fontWeight: 800, color: '#0f172a' }}>{children}</p>;
}

function SheetInput({ placeholder = '' }) {
  return (
    <div style={{ height: 21, background: '#f1f5f9', borderRadius: 6, marginBottom: 4, padding: '0 6px', display: 'flex', alignItems: 'center' }}>
      <TextLine w="55%" h={4} color="#cbd5e0" />
    </div>
  );
}

function SheetBtn({ label, color }) {
  return (
    <div style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, borderRadius: 7, padding: '6px', textAlign: 'center', color: '#fff', fontSize: '0.52rem', fontWeight: 700, marginTop: 4 }}>
      {label}
    </div>
  );
}

// ─── demo: gatos ─────────────────────────────────────────────────────────────
function DemoGatos() {
  const p = useLoop([1400, 560, 380, 1900, 300]);
  return (
    <Phone title="Gatos" headerBg="#b45309" icon={<Cat size={13} />}>
      <div style={{ padding: '8px 7px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <CardRow color="#e07820" name="65%" sub="42%" />
        <CardRow color="#9ca3af" name="55%" sub="38%" />
        <CardRow color="#c084a8" name="72%" sub="46%" />
        <div style={{ marginTop: 3 }}>
          <GradBtn label="＋  Cadastrar Gato" color="#b45309" pressed={p === 2} icon={Plus} />
        </div>
      </div>
      <Finger tapX={94} tapY={194} phase={p} />
      <Sheet show={p === 3}>
        <SheetTitle>O que deseja fazer?</SheetTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ background: 'linear-gradient(135deg,#b45309,#d97706)', borderRadius: 7, padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: '0.5rem', fontWeight: 700 }}>
            <PawPrint size={12} strokeWidth={2.2} /> Cadastrar Filhote
          </div>
          <div style={{ background: 'linear-gradient(135deg,#475569,#64748b)', borderRadius: 7, padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: '0.5rem', fontWeight: 700 }}>
            <Users size={12} strokeWidth={2.2} /> Ver Pais Reprodutores
          </div>
        </div>
      </Sheet>
    </Phone>
  );
}

// ─── demo: saúde ─────────────────────────────────────────────────────────────
function DemoSaude() {
  const p = useLoop([1400, 560, 380, 1900, 300]);
  const cols = ['D','S','T','Q','Q','S','S'];
  const week1 = [null,null,1,2,3,4,5];
  const week2 = [6,7,8,9,10,11,12];
  return (
    <Phone title="Saúde" headerBg="#2d6b44" icon={<Syringe size={13} />}>
      <div style={{ padding: '7px 7px 0', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <GradBtn label="💉  Registrar Dose" color="#2d6b44" pressed={false} />
        {/* calendário mini */}
        <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
          <div style={{ background: 'linear-gradient(135deg,#1a4d2e,#2d6b44)', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: 16, height: 16, borderRadius: 5, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={10} color="#fff" /></div>
            <span style={{ color: '#fff', fontSize: '0.52rem', fontWeight: 800 }}>Junho 2026</span>
            <div style={{ width: 16, height: 16, borderRadius: 5, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={10} color="#fff" style={{ transform:'rotate(180deg)' }} /></div>
          </div>
          <div style={{ padding: '5px 4px 6px' }}>
            {/* header dias */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 3 }}>
              {cols.map((c,i) => <div key={i} style={{ textAlign:'center', fontSize:'0.38rem', color:'#94a3b8', fontWeight:700 }}>{c}</div>)}
            </div>
            {/* semana 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 2 }}>
              {week1.map((d,i) => (
                <div key={i} style={{ height: 20, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {d && <span style={{ fontSize:'0.4rem', color:'#334155', fontWeight:600 }}>{d}</span>}
                </div>
              ))}
            </div>
            {/* semana 2 com doses */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
              {week2.map((d) => {
                const hasDot = d===8 || d===12;
                const dotColor = d===8 ? '#e6900a' : '#3a9e68';
                const sel = d===8 && p >= 1;
                return (
                  <div key={d} style={{ height: 24, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2 }}>
                    <div style={{
                      width: 17, height: 17, borderRadius: '50%',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'0.42rem', fontWeight: sel?800:600,
                      background: sel ? '#2d6b44' : 'transparent',
                      color: sel ? '#fff' : '#1e293b',
                      boxShadow: sel ? '0 2px 6px #2d6b4460' : 'none',
                      transition:'all 0.2s',
                    }}>{d}</div>
                    {hasDot && <div style={{ width:6, height:6, borderRadius:'50%', background: dotColor, boxShadow:`0 0 4px ${dotColor}80` }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Finger tapX={52} tapY={150} phase={p} />
      {/* card dose deslizante */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, zIndex:20,
        background:'#fff', borderRadius:'12px 12px 0 0', padding:'8px 9px 12px',
        boxShadow:'0 -6px 20px rgba(0,0,0,0.13)',
        transform: p===3 ? 'translateY(0)' : 'translateY(100%)',
        transition:'transform 0.38s cubic-bezier(.22,.68,0,1.18)',
        pointerEvents:'none',
      }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:6 }}>
          <div style={{ width:28, height:3, background:'#d1d5db', borderRadius:2 }} />
        </div>
        <p style={{ margin:'0 0 7px', fontSize:'0.52rem', fontWeight:800, color:'#0f172a' }}>8 de Junho</p>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', borderRadius:8, padding:'6px 7px', borderLeft:'3.5px solid #e6900a' }}>
          <CatAvatar color="#e07820" size={28} />
          <div style={{ flex:1 }}>
            <TextLine w="62%" h={6} mb={3} />
            <div style={{ display:'flex', alignItems:'center', gap:3 }}>
              <Pill size={8} color="#94a3b8" />
              <TextLine w="50%" h={4} color="#94a3b8" />
            </div>
          </div>
          <span style={{ fontSize:'0.38rem', fontWeight:700, color:'#e6900a', background:'#fef3e2', border:'1px solid #e6900a44', borderRadius:8, padding:'2px 5px' }}>Hoje</span>
        </div>
      </div>
    </Phone>
  );
}

// ─── demo: ninhadas ───────────────────────────────────────────────────────────
function DemoNinhadas() {
  const p = useLoop([1400, 560, 380, 1900, 300]);
  return (
    <Phone title="Ninhadas" headerBg="#6d28d9" icon={<Heart size={13} />}>
      <div style={{ padding: '8px 7px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* card de ninhada */}
        <div style={{ background:'#fff', borderRadius:8, padding:'8px', boxShadow:'0 2px 8px rgba(0,0,0,0.09)', borderLeft:'3.5px solid #6d28d9' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <TextLine w="52%" h={6} color="#6d28d9" mb={0} />
            <span style={{ fontSize:'0.36rem', color:'#8b5cf6', fontWeight:700, background:'#f3f0ff', borderRadius:6, padding:'1px 5px' }}>3 filhotes</span>
          </div>
          <div style={{ display:'flex', gap:4 }}>
            {['#e07820','#9ca3af','#c084a8'].map((c,i) => <CatAvatar key={i} color={c} size={20} />)}
          </div>
        </div>
        <CardRow color="#92644a" name="60%" sub="40%" />
        <div style={{ marginTop:3 }}>
          <GradBtn label="＋  Adicionar Ninhada" color="#6d28d9" pressed={p===2} icon={Plus} />
        </div>
      </div>
      <Finger tapX={94} tapY={196} phase={p} />
      <Sheet show={p===3}>
        <SheetTitle>Nova Ninhada</SheetTitle>
        <SheetInput />
        <div style={{ display:'flex', gap:5, marginBottom:4 }}>
          <div style={{ flex:1, height:21, background:'#f1f5f9', borderRadius:6 }} />
          <div style={{ flex:1, height:21, background:'#f1f5f9', borderRadius:6 }} />
        </div>
        <SheetInput />
        <SheetBtn label="Salvar Ninhada" color="#6d28d9" />
      </Sheet>
    </Phone>
  );
}

// ─── demo: home / controle total ─────────────────────────────────────────────
function DemoHome() {
  const p = useLoop([1400, 560, 380, 1900, 300]);
  const stats = [
    { label:'Gatos', val:'5', cor:'#1a4d7c', icon: Cat },
    { label:'Ninhadas', val:'2', cor:'#6d28d9', icon: Heart },
    { label:'Reservados', val:'1', cor:'#b45309', icon: Users },
    { label:'Vendidos', val:'3', cor:'#2d6b44', icon: PawPrint },
  ];
  const doses = [
    { color:'#e07820', badge:{ txt:'Hoje', cor:'#e6900a', bg:'#fef3e2' } },
    { color:'#9ca3af', badge:{ txt:'Em 3 dias', cor:'#3a9e68', bg:'#edf7f1' } },
    { color:'#92644a', badge:{ txt:'Atrasada', cor:'#d9534f', bg:'#fdecea' } },
  ];
  return (
    <Phone title="Cheirinho de Felicidade" headerBg="#0e7490" icon={<Bell size={12} />}>
      <div style={{ padding:'7px 7px', display:'flex', flexDirection:'column', gap:5 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
          {stats.map((s,i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{
                background:'#fff', borderRadius:8, padding:'6px 7px', textAlign:'center',
                boxShadow: i===0 && p>=1 ? `0 0 12px ${s.cor}50` : '0 1px 4px rgba(0,0,0,0.07)',
                border: i===0 && p>=1 ? `1.5px solid ${s.cor}` : '1.5px solid transparent',
                transition:'all 0.25s',
              }}>
                <Icon size={12} color={s.cor} strokeWidth={2} style={{ marginBottom:2 }} />
                <div style={{ fontSize:'0.78rem', fontWeight:800, color:s.cor }}>{s.val}</div>
                <div style={{ fontSize:'0.37rem', color:'#64748b', fontWeight:600 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
        <p style={{ margin:0, fontSize:'0.46rem', fontWeight:800, color:'#1e293b' }}>Próximas doses</p>
        {doses.map((d,i) => <CardRow key={i} color={d.color} name="60%" sub="50%" badge={d.badge} />)}
      </div>
      <Finger tapX={47} tapY={73} phase={p} />
      <div style={{
        position:'absolute', inset:0, zIndex:20,
        background: p===3 ? 'rgba(14,116,144,0.08)' : 'transparent',
        transition:'background 0.3s',
        pointerEvents:'none',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <div style={{
          background:'linear-gradient(135deg,#0e7490,#0891b2)',
          borderRadius:10, padding:'6px 14px',
          color:'#fff', fontSize:'0.5rem', fontWeight:800,
          boxShadow:'0 4px 14px rgba(14,116,144,0.4)',
          transform: p===3 ? 'scale(1)' : 'scale(0.6)',
          opacity: p===3 ? 1 : 0,
          transition:'all 0.32s cubic-bezier(.22,.68,0,1.18)',
        }}>→ Lista de Gatos</div>
      </div>
    </Phone>
  );
}

// ─── demo: financeiro ─────────────────────────────────────────────────────────
function DemoFinanceiro() {
  const p = useLoop([1400, 560, 380, 1900, 300]);
  return (
    <Phone title="Financeiro" headerBg="#6d28d9" icon={<Wallet size={13} />}>
      <div style={{ padding:'7px 7px', display:'flex', flexDirection:'column', gap:5 }}>
        {/* tabs */}
        <div style={{ display:'flex', background:'#fff', borderRadius:8, padding:3, gap:2, boxShadow:'0 1px 4px rgba(0,0,0,0.07)' }}>
          {['Resumo','Lançamentos','Histórico'].map((t,i) => (
            <div key={t} style={{
              flex:1, textAlign:'center', padding:'3px 0', borderRadius:6,
              background: i===0 ? 'linear-gradient(135deg,#6d28d9,#7c3aed)' : 'transparent',
              color: i===0 ? '#fff' : '#94a3b8',
              fontSize:'0.36rem', fontWeight:700,
            }}>{t}</div>
          ))}
        </div>
        {/* saldo */}
        <div style={{ background:'linear-gradient(135deg,#6d28d9,#8b5cf6)', borderRadius:10, padding:'9px 10px', color:'#fff' }}>
          <div style={{ fontSize:'0.37rem', opacity:0.8, marginBottom:2 }}>Saldo do mês</div>
          <div style={{ fontSize:'0.95rem', fontWeight:800, letterSpacing:-0.5 }}>R$ 2.500</div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
            <div>
              <div style={{ fontSize:'0.34rem', opacity:0.7 }}>Entradas</div>
              <div style={{ fontSize:'0.5rem', fontWeight:800 }}>R$ 3.000</div>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,0.2)' }} />
            <div>
              <div style={{ fontSize:'0.34rem', opacity:0.7 }}>Saídas</div>
              <div style={{ fontSize:'0.5rem', fontWeight:800 }}>R$ 500</div>
            </div>
          </div>
        </div>
        {/* botões ação */}
        <div style={{ display:'flex', gap:4 }}>
          <div style={{
            flex:1, background:'linear-gradient(135deg,#15803d,#16a34a)',
            borderRadius:8, padding:'6px 4px', textAlign:'center',
            color:'#fff', fontSize:'0.43rem', fontWeight:700,
            boxShadow: p===2 ? '0 0 16px #15803d80' : '0 2px 6px rgba(0,0,0,0.12)',
            transform: p===2 ? 'scale(0.96)' : 'scale(1)',
            transition:'all 0.15s',
          }}>＋ Registrar Entrada</div>
          <div style={{
            flex:1, background:'linear-gradient(135deg,#dc2626,#ef4444)',
            borderRadius:8, padding:'6px 4px', textAlign:'center',
            color:'#fff', fontSize:'0.43rem', fontWeight:700,
            boxShadow:'0 2px 6px rgba(0,0,0,0.12)',
          }}>－ Registrar Gasto</div>
        </div>
      </div>
      <Finger tapX={50} tapY={214} phase={p} />
      <Sheet show={p===3}>
        <SheetTitle>💚 Nova Entrada</SheetTitle>
        <SheetInput />
        <SheetInput />
        <div style={{ display:'flex', gap:5, marginBottom:4 }}>
          <div style={{ flex:1, height:21, background:'#f1f5f9', borderRadius:6 }} />
          <div style={{ flex:1, height:21, background:'#f1f5f9', borderRadius:6 }} />
        </div>
        <SheetBtn label="Salvar Entrada" color="#15803d" />
      </Sheet>
    </Phone>
  );
}

// ─── slides ───────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    gradient: 'linear-gradient(155deg, #1a4060 0%, #2f6690 65%, #3d85b5 100%)',
    visual: () => <div className="ob-icon-circle"><PataIcon size={82} /></div>,
    subtitulo: 'Cheirinho de Felicidade',
    titulo: 'Olá, Lidia! 🐾',
    texto: 'Bem-vinda ao seu espaço exclusivo para gerir o gatil com amor, organização e praticidade.',
  },
  {
    gradient: 'linear-gradient(155deg, #7c3100 0%, #b45309 65%, #d97706 100%)',
    visual: () => <DemoGatos />,
    titulo: 'Seus Gatinhos',
    texto: 'Cadastre filhotes com foto, raça e cor. Acompanhe a idade e gerencie a disponibilidade de cada um.',
  },
  {
    gradient: 'linear-gradient(155deg, #1a4d2e 0%, #2d6b44 65%, #3f8c5a 100%)',
    visual: () => <DemoSaude />,
    titulo: 'Saúde em Dia',
    texto: 'Registre vacinas e medicamentos para gatos e pais. Veja tudo no calendário e receba alertas automáticos.',
  },
  {
    gradient: 'linear-gradient(155deg, #3b0764 0%, #6d28d9 65%, #8b5cf6 100%)',
    visual: () => <DemoNinhadas />,
    titulo: 'Ninhadas',
    texto: 'Registre seus casais reprodutores e acompanhe cada ninhada — do nascimento até a nova família.',
  },
  {
    gradient: 'linear-gradient(155deg, #0c3d52 0%, #0e7490 65%, #0891b2 100%)',
    visual: () => <DemoHome />,
    titulo: 'Controle Total',
    texto: 'Veja gatos, ninhadas e vendas num só lugar — com as próximas doses e seus status em destaque.',
  },
  {
    gradient: 'linear-gradient(155deg, #3b1f6b 0%, #6d28d9 65%, #7b5ea7 100%)',
    visual: () => <DemoFinanceiro />,
    titulo: 'Financeiro',
    texto: 'Registre vendas, gastos com veterinário, ração e mais. Acompanhe entradas, saídas e o saldo do mês.',
  },
  {
    gradient: 'linear-gradient(155deg, #1a4060 0%, #2f6690 65%, #3d85b5 100%)',
    visual: () => <div className="ob-icon-circle"><CheckCircle size={74} color="#fff" strokeWidth={1.4} /></div>,
    titulo: 'Tudo Pronto! 🐱',
    texto: 'Seu gatil vai ser o mais bem organizado do mundo, Lidia. Pode começar com tudo!',
    final: true,
  },
];

// ─── componente principal ─────────────────────────────────────────────────────
export default function Onboarding({ onDone }) {
  const [atual, setAtual]   = useState(0);
  const [animando, setAnimando] = useState(false);
  const [visivel, setVisivel]  = useState(true);

  const ir = (prox) => {
    if (animando) return;
    setAnimando(true); setVisivel(false);
    setTimeout(() => { setAtual(prox); setVisivel(true); setTimeout(() => setAnimando(false), 330); }, 250);
  };

  const avancar  = () => atual < SLIDES.length - 1 ? ir(atual + 1) : terminar();
  const voltar   = () => atual > 0 && ir(atual - 1);
  const terminar = () => {
    localStorage.setItem('onboarding_visto', 'v2');
    // Impede tours automáticos em todas as telas — o onboarding já ensinou o app
    ['home','saude','ninhadas','gatos','perfil'].forEach(k => {
      if (!localStorage.getItem(`tour_${k}`)) localStorage.setItem(`tour_${k}`, '1');
    });
    onDone();
  };

  const slide  = SLIDES[atual];
  const isFirst = atual === 0;
  const isFinal = !!slide.final;

  return (
    <div className="ob-overlay">
      <div className="ob-top" style={{ background: slide.gradient }}>
        <div className="ob-deco ob-deco-1"><PataIcon size={50} color="rgba(255,255,255,0.11)" /></div>
        <div className="ob-deco ob-deco-2"><PataIcon size={30} color="rgba(255,255,255,0.09)" /></div>
        <div className="ob-deco ob-deco-3"><PataIcon size={60} color="rgba(255,255,255,0.07)" /></div>
        <div className="ob-deco ob-deco-4"><PataIcon size={34} color="rgba(255,255,255,0.10)" /></div>
        {!isFinal && <button className="ob-skip" onClick={terminar}>Pular</button>}
        <div className={`ob-icon-wrap ${visivel ? 'ob-fade-in' : 'ob-fade-out'}`}>
          {slide.visual()}
        </div>
      </div>

      <div className="ob-wave" style={{ background: slide.gradient }}>
        <svg viewBox="0 0 375 52" preserveAspectRatio="none" width="100%" height="52">
          <path d="M0,18 C70,52 180,2 285,36 C330,48 360,30 375,22 L375,52 L0,52 Z" fill="#fff" />
        </svg>
      </div>

      <div className="ob-bottom">
        <div className={`ob-text ${visivel ? 'ob-fade-in' : 'ob-fade-out'}`}>
          {slide.subtitulo && <p className="ob-app-nome">{slide.subtitulo}</p>}
          <h2 className="ob-titulo">{slide.titulo}</h2>
          <p className="ob-texto">{slide.texto}</p>
        </div>

        <div className="ob-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={`ob-dot${i === atual ? ' ob-dot-ativo' : ''}`}
              onClick={() => !animando && i !== atual && ir(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>

        <div className="ob-nav">
          {!isFirst && <button className="ob-btn-voltar" onClick={voltar} disabled={animando}>← Voltar</button>}
          <button
            className={`ob-btn-next${isFinal ? ' ob-btn-final' : ''}`}
            style={isFirst ? { flex: 1 } : {}}
            onClick={avancar} disabled={animando}
          >
            {isFinal ? '🐾 Começar agora!' : 'Próximo →'}
          </button>
        </div>
      </div>
    </div>
  );
}
