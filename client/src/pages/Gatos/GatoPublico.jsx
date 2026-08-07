import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatarPeso } from '../../utils/peso';
import { calcularIdade } from '../../utils/idade';
import api from '../../api/client';

const SEXO = { macho: 'Macho', femea: 'Fêmea', fêmea: 'Fêmea' };

export default function GatoPublico() {
  const { id } = useParams();
  const [gato, setGato] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    api.get(`/gatos/publico/${id}`)
      .then(r => setGato(r.data))
      .catch(() => setErro(true));
  }, [id]);

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #1a0533 0%, #3b1260 45%, #0f1f3d 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {erro && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          <span style={{ fontSize: '3rem' }}>🐱</span>
          <p style={{ marginTop: 16, fontSize: '1rem' }}>Este gatinho não foi encontrado.</p>
        </div>
      )}

      {!gato && !erro && (
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Carregando...</div>
      )}

      {gato && (
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Card principal */}
          <div style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
          }}>

            {/* Foto */}
            <div style={{ position: 'relative' }}>
              {gato.foto_url ? (
                <img
                  src={gato.foto_url}
                  alt={gato.nome}
                  style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{
                  width: '100%', height: 320,
                  background: 'linear-gradient(135deg, #2d1065, #5b21b6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '5rem',
                }}>
                  🐱
                </div>
              )}
              {/* gradiente sobre a foto */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
                background: 'linear-gradient(to top, rgba(15,5,30,0.95) 0%, transparent 100%)',
              }} />
              <p style={{
                position: 'absolute', bottom: 16, left: 20,
                margin: 0, fontSize: '1.7rem', fontWeight: 900, color: '#fff',
                textShadow: '0 2px 12px rgba(0,0,0,0.5)',
              }}>
                {gato.nome || 'Sem nome'}
              </p>
            </div>

            {/* Infos */}
            <div style={{ padding: '20px 22px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

                <InfoChip
                  emoji="⚤"
                  label="Sexo"
                  valor={SEXO[gato.sexo] || gato.sexo || '—'}
                />
                <InfoChip
                  emoji="🎂"
                  label="Nascimento"
                  valor={gato.data_nascimento
                    ? gato.data_nascimento.split('-').reverse().join('/')
                    : '—'}
                  sub={gato.data_nascimento ? calcularIdade(gato.data_nascimento) : null}
                />
                <InfoChip
                  emoji="⚖️"
                  label="Peso"
                  valor={formatarPeso(gato.peso) || '—'}
                  wide
                />

              </div>
            </div>
          </div>

          {/* Rodapé da marca */}
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <p style={{ margin: 0, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
              apresentado por
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '1.1rem', fontWeight: 800, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              🐾 Cheirinho de Felicidade
            </p>
          </div>

        </div>
      )}
    </div>
  );
}

function InfoChip({ emoji, label, valor, sub, wide }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '14px 16px',
      gridColumn: wide ? 'span 2' : undefined,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{emoji}</span>
      <div>
        <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '1rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
          {valor}
        </p>
        {sub && <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{sub}</p>}
      </div>
    </div>
  );
}
