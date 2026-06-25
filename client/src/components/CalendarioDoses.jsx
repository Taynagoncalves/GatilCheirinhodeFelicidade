import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Cat, Syringe, Pill } from 'lucide-react';
import api from '../api/client';

const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function hoje() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function diffDias(dataStr) {
  return Math.round((new Date(dataStr + 'T00:00:00') - hoje()) / 86400000);
}
function toDateStr(ano, mes, dia) {
  return `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
}
function corDia(doses) {
  if (!doses?.length) return null;
  const min = Math.min(...doses.map(d => diffDias(d.proxima_dose)));
  if (min < 0) return '#d9534f';
  if (min === 0) return '#e6900a';
  return '#3a9e68';
}
function labelDiff(diff) {
  if (diff < 0) return { texto: 'Atrasada', cor: '#d9534f', bg: '#fdecea' };
  if (diff === 0) return { texto: 'Hoje', cor: '#e6900a', bg: '#fef3e2' };
  if (diff === 1) return { texto: 'Amanhã', cor: '#2f6690', bg: '#eaf3fb' };
  return { texto: `Em ${diff} dias`, cor: '#3a9e68', bg: '#edf7f1' };
}
function gerarGrade(ano, mes) {
  const primeiro = new Date(ano, mes, 1).getDay();
  const total = new Date(ano, mes + 1, 0).getDate();
  const grade = Array(primeiro).fill(null);
  for (let d = 1; d <= total; d++) grade.push(d);
  while (grade.length % 7 !== 0) grade.push(null);
  return grade;
}

export default function CalendarioDoses() {
  const navigate = useNavigate();
  const [doses, setDoses] = useState([]);
  const agora = new Date();
  const [ano, setAno] = useState(agora.getFullYear());
  const [mes, setMes] = useState(agora.getMonth());
  const [diaSel, setDiaSel] = useState(agora.getDate());

  useEffect(() => {
    api.get('/aplicacoes/agenda').then((res) => setDoses(res.data));
  }, []);

  const navMes = (delta) => {
    const d = new Date(ano, mes + delta, 1);
    setAno(d.getFullYear()); setMes(d.getMonth()); setDiaSel(null);
  };

  const porData = doses.reduce((acc, d) => {
    const k = d.proxima_dose;
    if (!acc[k]) acc[k] = [];
    acc[k].push(d);
    return acc;
  }, {});

  const grade = gerarGrade(ano, mes);
  const h = hoje();
  const [hAno, hMes, hDia] = [h.getFullYear(), h.getMonth(), h.getDate()];

  const totalMes = Object.entries(porData)
    .filter(([k]) => { const [y,m] = k.split('-').map(Number); return y === ano && m === mes+1; })
    .reduce((s,[,v]) => s + v.length, 0);

  const dataSel = diaSel ? toDateStr(ano, mes, diaSel) : null;
  const dosesNoDiaSel = dataSel ? (porData[dataSel] || []) : [];

  return (
    <div>
      {/* Card do calendário */}
      <div data-tour="saude-calendario-grid" style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.10)', overflow: 'hidden', marginBottom: 12 }}>

        {/* Cabeçalho gradiente */}
        <div style={{ background: 'linear-gradient(135deg, #1a4d7c, #2f6690)', padding: '18px 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => navMes(-1)} style={{
              background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 12,
              width: 44, height: 44, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>
              <ChevronLeft size={22} />
            </button>

            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#fff', letterSpacing: 0.3 }}>
                {MESES[mes]} {ano}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                {totalMes > 0 ? `${totalMes} ${totalMes === 1 ? 'dose' : 'doses'} este mês` : 'Nenhuma dose este mês'}
              </p>
            </div>

            <button onClick={() => navMes(1)} style={{
              background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 12,
              width: 44, height: 44, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* Grade */}
        <div style={{ padding: '12px 8px 16px', background: '#f8fafc' }}>
          {/* Cabeçalho dias da semana */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
            {DIAS_SEMANA.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#8898aa', paddingBottom: 4, letterSpacing: 0.3 }}>{d}</div>
            ))}
          </div>

          {/* Dias */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px 0' }}>
            {grade.map((dia, i) => {
              if (!dia) return <div key={`e-${i}`} style={{ height: 52 }} />;
              const dateStr = toDateStr(ano, mes, dia);
              const dosesNoDia = porData[dateStr] || [];
              const cor = corDia(dosesNoDia);
              const ehHoje = dia === hDia && mes === hMes && ano === hAno;
              const selecionado = dia === diaSel;

              return (
                <div
                  key={dia}
                  onClick={() => setDiaSel(dia === diaSel ? null : dia)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', height: 52, justifyContent: 'center', gap: 3 }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.95rem',
                    fontWeight: selecionado || ehHoje ? 800 : 500,
                    background: selecionado
                      ? '#1a4d7c'
                      : ehHoje
                      ? '#e8f0f8'
                      : 'transparent',
                    color: selecionado
                      ? '#fff'
                      : ehHoje
                      ? '#1a4d7c'
                      : '#2d3748',
                    border: ehHoje && !selecionado ? '2.5px solid #1a4d7c' : 'none',
                    boxShadow: selecionado ? '0 2px 8px rgba(26,77,124,0.35)' : 'none',
                    transition: 'all 0.15s',
                  }}>{dia}</div>

                  {/* Indicador de dose */}
                  {cor && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: cor,
                      boxShadow: `0 0 4px ${cor}88`,
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legenda dentro do card */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '10px 0 14px', borderTop: '1px solid #edf2f7' }}>
          {[['#d9534f','Atrasada'],['#e6900a','Hoje'],['#3a9e68','Agendada']].map(([cor, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#4a5568', fontWeight: 500 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: cor, display: 'block', boxShadow: `0 0 4px ${cor}88` }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Instrução */}
      {!diaSel && doses.length > 0 && (
        <p style={{ textAlign: 'center', color: '#8898aa', fontSize: '0.85rem', margin: '0 0 8px' }}>
          Toque em um dia para ver as doses
        </p>
      )}

      {/* Detalhe do dia selecionado */}
      {dataSel && (
        <div data-tour="saude-calendario-detalhe">
          <h2 className="section-title" style={{ marginTop: 4 }}>
            {diaSel} de {MESES[mes]}
          </h2>
          {dosesNoDiaSel.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#8898aa', fontSize: '0.9rem', padding: '12px 0' }}>
              Nenhuma dose neste dia
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dosesNoDiaSel.map((d, i) => {
                const diff = diffDias(d.proxima_dose);
                const { texto, cor, bg } = labelDiff(diff);
                return (
                  <div key={i} className="card" style={{ cursor: 'pointer', borderLeft: `5px solid ${cor}`, padding: '14px' }}
                    onClick={() => d.gato_id ? navigate(`/gatos/${d.gato_id}`) : navigate(`/pais/${d.pai_id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {d.gato_foto
                        ? <img src={d.gato_foto} alt={d.gato_nome} style={{ width: 50, height: 50, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                        : <span className="card-photo-placeholder" style={{ width: 50, height: 50, flexShrink: 0 }}><Cat size={22} /></span>
                      }
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#2d3748' }}>{d.gato_nome}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#718096', display: 'flex', alignItems: 'center', gap: 5 }}>
                          {d.tipo === 'vacina' ? <Syringe size={13} /> : <Pill size={13} />} {d.medicamento_nome}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '0.78rem', fontWeight: 700, color: cor,
                        background: bg, borderRadius: 20, padding: '5px 12px',
                        whiteSpace: 'nowrap', border: `1px solid ${cor}44`,
                      }}>{texto}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
