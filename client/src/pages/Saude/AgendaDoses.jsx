import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Cat, Syringe, Pill, CalendarClock } from 'lucide-react';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import api from '../../api/client';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function hoje() {
  const d = new Date(); d.setHours(0,0,0,0); return d;
}
function diffDias(dataStr) {
  const h = hoje();
  const alvo = new Date(dataStr + 'T00:00:00');
  return Math.round((alvo - h) / 86400000);
}
function toDateStr(ano, mes, dia) {
  return `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
}
function corDia(doses) {
  if (!doses?.length) return null;
  const diffs = doses.map(d => diffDias(d.proxima_dose));
  const min = Math.min(...diffs);
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

export default function AgendaDoses() {
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
    setAno(d.getFullYear()); setMes(d.getMonth());
    setDiaSel(null);
  };

  // Agrupa doses por data
  const porData = doses.reduce((acc, d) => {
    const k = d.proxima_dose;
    if (!acc[k]) acc[k] = [];
    acc[k].push(d);
    return acc;
  }, {});

  const grade = gerarGrade(ano, mes);
  const hoje_d = hoje();
  const hojeAno = hoje_d.getFullYear(), hojesMes = hoje_d.getMonth(), hojesDia = hoje_d.getDate();

  const dataSel = diaSel ? toDateStr(ano, mes, diaSel) : null;
  const dosesHoje = dataSel ? (porData[dataSel] || []) : [];

  // Conta total de doses no mês visível
  const totalMes = Object.entries(porData).filter(([k]) => {
    const [y, m] = k.split('-').map(Number);
    return y === ano && m === mes + 1;
  }).reduce((sum, [, v]) => sum + v.length, 0);

  return (
    <Layout title="Agenda de Doses" showBack>

      {/* ── Cabeçalho do calendário ── */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-primary), #2f6690)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <button onClick={() => navMes(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{MESES[mes]} {ano}</p>
            {totalMes > 0 && <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>{totalMes} {totalMes === 1 ? 'dose' : 'doses'} neste mês</p>}
          </div>
          <button onClick={() => navMes(1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dias da semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginTop: 10 }}>
          {DIAS_SEMANA.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', paddingBottom: 6 }}>{d}</div>
          ))}

          {/* Células dos dias */}
          {grade.map((dia, i) => {
            if (!dia) return <div key={`e-${i}`} />;
            const dateStr = toDateStr(ano, mes, dia);
            const dosesNoDia = porData[dateStr] || [];
            const cor = corDia(dosesNoDia);
            const ehHoje = dia === hojesDia && mes === hojesMes && ano === hojeAno;
            const selecionado = dia === diaSel;

            return (
              <div
                key={dia}
                onClick={() => setDiaSel(dia === diaSel ? null : dia)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '3px 0', cursor: dosesNoDia.length > 0 || ehHoje ? 'pointer' : 'default',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: selecionado || ehHoje ? 800 : 500,
                  background: selecionado ? '#fff' : ehHoje ? 'rgba(255,255,255,0.25)' : 'transparent',
                  color: selecionado ? 'var(--color-primary)' : '#fff',
                  border: ehHoje && !selecionado ? '2px solid rgba(255,255,255,0.6)' : 'none',
                }}>{dia}</div>
                {cor && (
                  <div style={{ display: 'flex', gap: 2, marginTop: 2, height: 5 }}>
                    {dosesNoDia.slice(0, 3).map((_, idx) => (
                      <span key={idx} style={{ width: 5, height: 5, borderRadius: '50%', background: cor, display: 'block' }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
        {[['#c0524a','Atrasada'],['#b8863a','Hoje'],['#3f8c5a','Agendada']].map(([cor, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: cor, display: 'block' }} />
            {label}
          </div>
        ))}
      </div>

      {/* ── Detalhe do dia selecionado ── */}
      {dataSel && (
        <section>
          <h2 className="section-title" style={{ marginTop: 4 }}>
            {diaSel} de {MESES[mes]}
          </h2>
          {dosesHoje.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem', padding: '16px 0' }}>Nenhuma dose neste dia</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dosesHoje.map((d, i) => {
                const diff = diffDias(d.proxima_dose);
                const { texto, cor, bg } = labelDiff(diff);
                return (
                  <div
                    key={i}
                    className="card"
                    style={{ cursor: 'pointer', borderLeft: `4px solid ${cor}` }}
                    onClick={() => d.gato_id ? navigate(`/gatos/${d.gato_id}`) : navigate(`/pais/${d.pai_id}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {d.gato_foto ? (
                        <img src={d.gato_foto} alt={d.gato_nome} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <span className="card-photo-placeholder" style={{ width: 44, height: 44, flexShrink: 0 }}><Cat size={20} /></span>
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{d.gato_nome}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {d.tipo === 'vacina' ? <Syringe size={12} /> : <Pill size={12} />} {d.medicamento_nome}
                        </p>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: cor, background: bg, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                        {texto}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Estado vazio geral */}
      {!dataSel && doses.length === 0 && (
        <EmptyState icon={CalendarClock} title="Nenhuma dose agendada" description="Quando registrar doses com próxima data, elas aparecem no calendário." />
      )}

      {/* Instrução quando nenhum dia selecionado */}
      {!dataSel && doses.length > 0 && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 8 }}>
          Toque em um dia para ver as doses
        </p>
      )}
    </Layout>
  );
}
