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
  if (min < 0) return '#c0524a';
  if (min === 0) return '#b8863a';
  return '#3f8c5a';
}
function labelDiff(diff) {
  if (diff < 0) return { texto: 'Atrasada', cor: '#c0524a', bg: '#fdecea' };
  if (diff === 0) return { texto: 'Hoje', cor: '#b8863a', bg: '#fef9ec' };
  if (diff === 1) return { texto: 'Amanhã', cor: '#2f6690', bg: '#eaf3fb' };
  return { texto: `${diff} dias`, cor: '#3f8c5a', bg: '#edf7f1' };
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
    .reduce((s, [,v]) => s + v.length, 0);

  const dataSel = diaSel ? toDateStr(ano, mes, diaSel) : null;
  const dosesHoje = dataSel ? (porData[dataSel] || []) : [];

  return (
    <div>
      {/* Cabeçalho do calendário */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-primary), #2f6690)', borderRadius: 'var(--radius-md)', padding: '14px 12px', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <button onClick={() => navMes(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <ChevronLeft size={16} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{MESES[mes]} {ano}</p>
            {totalMes > 0 && <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)' }}>{totalMes} {totalMes === 1 ? 'dose' : 'doses'} este mês</p>}
          </div>
          <button onClick={() => navMes(1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Cabeçalho dos dias da semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginTop: 6 }}>
          {DIAS_SEMANA.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', paddingBottom: 4 }}>{d}</div>
          ))}
          {grade.map((dia, i) => {
            if (!dia) return <div key={`e-${i}`} />;
            const dateStr = toDateStr(ano, mes, dia);
            const dosesNoDia = porData[dateStr] || [];
            const cor = corDia(dosesNoDia);
            const ehHoje = dia === hDia && mes === hMes && ano === hAno;
            const selecionado = dia === diaSel;
            return (
              <div key={dia} onClick={() => setDiaSel(dia === diaSel ? null : dia)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0', cursor: 'pointer' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: selecionado || ehHoje ? 800 : 400,
                  background: selecionado ? '#fff' : ehHoje ? 'rgba(255,255,255,0.25)' : 'transparent',
                  color: selecionado ? 'var(--color-primary)' : '#fff',
                  border: ehHoje && !selecionado ? '2px solid rgba(255,255,255,0.55)' : 'none',
                }}>{dia}</div>
                <div style={{ display: 'flex', gap: 2, marginTop: 1, height: 5 }}>
                  {cor && dosesNoDia.slice(0, 3).map((_, idx) => (
                    <span key={idx} style={{ width: 4, height: 4, borderRadius: '50%', background: cor }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 10 }}>
        {[['#c0524a','Atrasada'],['#b8863a','Hoje'],['#3f8c5a','Agendada']].map(([cor, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: cor }} />{label}
          </div>
        ))}
      </div>

      {/* Detalhe do dia */}
      {dataSel && (
        <div>
          <h2 className="section-title" style={{ marginTop: 0 }}>{diaSel} de {MESES[mes]}</h2>
          {dosesHoje.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', padding: '10px 0' }}>Nenhuma dose neste dia</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dosesHoje.map((d, i) => {
                const diff = diffDias(d.proxima_dose);
                const { texto, cor, bg } = labelDiff(diff);
                return (
                  <div key={i} className="card" style={{ cursor: 'pointer', borderLeft: `4px solid ${cor}` }}
                    onClick={() => d.gato_id ? navigate(`/gatos/${d.gato_id}`) : navigate(`/pais/${d.pai_id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {d.gato_foto
                        ? <img src={d.gato_foto} alt={d.gato_nome} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                        : <span className="card-photo-placeholder" style={{ width: 40, height: 40, flexShrink: 0 }}><Cat size={18} /></span>
                      }
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{d.gato_nome}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {d.tipo === 'vacina' ? <Syringe size={11} /> : <Pill size={11} />} {d.medicamento_nome}
                        </p>
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: cor, background: bg, borderRadius: 20, padding: '2px 8px', whiteSpace: 'nowrap' }}>{texto}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!dataSel && doses.length > 0 && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: 4 }}>
          Toque em um dia para ver as doses
        </p>
      )}
    </div>
  );
}
