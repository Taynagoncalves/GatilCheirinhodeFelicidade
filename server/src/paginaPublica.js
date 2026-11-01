// Página pública compartilhada (gato ou reprodutor) — HTML renderizado pelo servidor

const MARCA = 'Cheirinho de Felicidade';

const STATUS = {
  disponivel: { label: 'Disponível', cor: '#2e7048', bg: '#e3f3e8' },
  reservado:  { label: 'Reservado',  cor: '#8a6326', bg: '#fbf1de' },
  vendido:    { label: 'Vendido',    cor: '#6a4390', bg: '#f0e9f6' },
  mantido:    { label: 'Do gatil',   cor: '#1f4e6e', bg: '#eaf2f8' },
};

const ICONES = {
  idade: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/>',
  data: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  peso: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  cor: '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/>',
  macho: '<path d="M16 3h5v5"/><path d="m21 3-6.75 6.75"/><circle cx="10" cy="14" r="6"/>',
  femea: '<path d="M12 15v7"/><path d="M9 19h6"/><circle cx="12" cy="9" r="6"/>',
  ampliar: '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/>',
  compartilhar: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
  fechar: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  pata: '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
  documento: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
};

function icone(nome, tamanho = 18) {
  return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[nome]}</svg>`;
}

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function calcIdade(nasc) {
  if (!nasc) return null;
  const hoje = new Date(); const d = new Date(nasc + 'T00:00:00');
  const meses = (hoje.getFullYear() - d.getFullYear()) * 12 + (hoje.getMonth() - d.getMonth()) - (hoje.getDate() < d.getDate() ? 1 : 0);
  if (meses < 1) {
    const dias = Math.max(0, Math.floor((hoje - d) / 86400000));
    return `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
  }
  if (meses < 12) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  const anos = Math.floor(meses / 12); const m = meses % 12;
  return m > 0 ? `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${m} ${m === 1 ? 'mês' : 'meses'}` : `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
}

function formatPeso(p) {
  if (!p) return null;
  return p >= 1000 ? `${(p / 1000).toFixed(2).replace('.', ',')} kg` : `${p} g`;
}

function formatData(d) { return d ? d.split('-').reverse().join('/') : null; }

/**
 * @param {object} opts
 * @param {object} opts.animal  { nome, foto_url, sexo, data_nascimento, peso, cor?, status? }
 * @param {string} opts.url     URL completa da página (para og:url e compartilhar)
 * @param {string} opts.tipo    'filhote' | 'reprodutor'
 * @param {string} [opts.extra] HTML adicional (já escapado) exibido abaixo das informações
 */
function paginaPublica({ animal, url, tipo, extra = '' }) {
  const nome = animal.nome || 'Sem nome';
  const sexoLabel = animal.sexo === 'macho' ? 'Macho' : animal.sexo === 'femea' ? 'Fêmea' : null;
  const papel = tipo === 'reprodutor'
    ? (animal.sexo === 'femea' ? 'Matriz' : 'Padreador')
    : 'Filhote';
  const idade = calcIdade(animal.data_nascimento);
  const nasc = formatData(animal.data_nascimento);
  const peso = formatPeso(animal.peso);
  const status = STATUS[animal.status];

  const resumo = [sexoLabel, idade, peso].filter(Boolean).join(' · ');
  const descricao = `${papel}${resumo ? ` · ${resumo}` : ''} — Gatil ${MARCA}`;

  const infos = [
    { icone: 'idade', label: 'Idade', valor: idade },
    { icone: 'data', label: 'Nascimento', valor: nasc },
    { icone: 'peso', label: 'Peso', valor: peso },
    { icone: 'cor', label: 'Cor', valor: animal.cor },
  ].filter((i) => i.valor);

  const foto = animal.foto_url
    ? `<button class="foto" id="abrirFoto" aria-label="Ver foto em tela cheia">
         <img src="${esc(animal.foto_url)}" alt="${esc(nome)}">
         <span class="foto-dica">${icone('ampliar', 13)} Toque para ampliar</span>
       </button>`
    : `<div class="foto foto-vazia">${icone('pata', 64)}</div>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(nome)} · ${MARCA}</title>
<meta name="description" content="${esc(descricao)}">
<meta name="theme-color" content="#1f4e6e">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Gatil ${MARCA}">
<meta property="og:title" content="${esc(nome)} 🐾 ${esc(papel)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:url" content="${esc(url)}">
${animal.foto_url ? `<meta property="og:image" content="${esc(animal.foto_url)}">
<meta property="og:image:alt" content="Foto de ${esc(nome)}">
<meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
<link rel="icon" href="/favicon.svg">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--azul:#2f6690;--azul-esc:#1f4e6e;--azul-claro:#eaf2f8;--texto:#21303d;--suave:#5b6b78;--borda:#e1e7ec;--fundo:#f4f7fa}
  body{min-height:100dvh;background:var(--fundo);color:var(--texto);font-family:'Segoe UI',system-ui,-apple-system,Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased}
  .faixa{position:absolute;inset:0 0 auto 0;height:260px;background:linear-gradient(160deg,var(--azul-esc),var(--azul));z-index:0}
  .faixa::after{content:'';position:absolute;width:320px;height:320px;border-radius:50%;background:rgba(255,255,255,.07);right:-120px;top:-160px}
  .pagina{position:relative;z-index:1;max-width:440px;margin:0 auto;padding:max(18px,env(safe-area-inset-top)) 16px 32px}
  .marca{display:flex;align-items:center;gap:10px;color:#fff;margin-bottom:18px}
  .marca-logo{position:relative;width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
  .marca-logo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#fff}
  .marca small{display:block;font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;opacity:.75;font-weight:600}
  .marca strong{font-size:1rem;font-weight:700}
  .card{background:#fff;border-radius:26px;overflow:hidden;box-shadow:0 18px 50px rgba(31,78,110,.18),0 2px 8px rgba(31,78,110,.06);animation:entrar .5s ease both}
  @keyframes entrar{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  .foto{position:relative;display:block;width:100%;aspect-ratio:4/5;max-height:62vh;border:0;padding:0;background:var(--azul-claro);cursor:zoom-in;overflow:hidden}
  .foto img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
  .foto:hover img{transform:scale(1.03)}
  .foto-vazia{display:flex;align-items:center;justify-content:center;color:var(--azul);cursor:default;aspect-ratio:4/3}
  .foto-dica{position:absolute;right:12px;bottom:12px;display:flex;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;background:rgba(17,28,38,.55);backdrop-filter:blur(8px);color:#fff;font-size:.72rem;font-weight:600}
  .selo{position:absolute;left:12px;top:12px;padding:6px 12px;border-radius:999px;font-size:.74rem;font-weight:800;letter-spacing:.02em;display:flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(0,0,0,.15)}
  .selo i{width:7px;height:7px;border-radius:50%;background:currentColor}
  .corpo{padding:20px 20px 22px}
  .papel{display:inline-flex;align-items:center;gap:6px;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--azul)}
  h1{font-size:1.9rem;line-height:1.15;font-weight:800;letter-spacing:-.02em;margin:4px 0 6px;word-break:break-word}
  .sexo{display:inline-flex;align-items:center;gap:6px;font-size:.9rem;font-weight:600;color:var(--suave)}
  .sexo span{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff}
  .sexo .macho{background:#4a86b8}.sexo .femea{background:#c2568a}
  .infos{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}
  .info{display:flex;align-items:center;gap:11px;padding:12px;border-radius:16px;background:var(--fundo);border:1px solid var(--borda);min-width:0}
  .info-icone{width:36px;height:36px;border-radius:11px;background:#fff;color:var(--azul);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 1px 3px rgba(31,78,110,.1)}
  .info small{display:block;font-size:.62rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--suave)}
  .info b{display:block;font-size:.92rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .extra{margin-top:16px;display:flex;flex-direction:column;gap:10px}
  .pkd{display:inline-flex;align-self:flex-start;align-items:center;gap:6px;padding:6px 13px;border-radius:999px;font-size:.8rem;font-weight:800}
  .botao{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px;border-radius:16px;border:0;font:inherit;font-weight:700;font-size:.95rem;cursor:pointer;text-decoration:none}
  .botao-sec{background:var(--azul-claro);color:var(--azul-esc)}
  .botao-pri{background:linear-gradient(135deg,var(--azul-esc),var(--azul));color:#fff;box-shadow:0 8px 20px rgba(47,102,144,.3);margin-top:18px}
  .rodape{text-align:center;margin-top:26px;color:var(--suave)}
  .rodape small{font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;font-weight:600;opacity:.8}
  .rodape p{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:6px;font-weight:700;color:var(--azul-esc)}
  .tela{position:fixed;inset:0;z-index:50;background:rgba(8,12,18,.96);display:none;align-items:center;justify-content:center;padding:16px}
  .tela.aberta{display:flex;animation:fade .2s ease}
  @keyframes fade{from{opacity:0}to{opacity:1}}
  .tela img{max-width:100%;max-height:100%;object-fit:contain;border-radius:12px}
  .tela button{position:absolute;top:max(14px,env(safe-area-inset-top));right:14px;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
  .aviso{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(20px);background:var(--texto);color:#fff;padding:10px 18px;border-radius:999px;font-size:.85rem;font-weight:600;opacity:0;transition:all .25s;pointer-events:none}
  .aviso.ver{opacity:1;transform:translateX(-50%)}
  @media (max-width:360px){.infos{grid-template-columns:1fr}h1{font-size:1.6rem}}
</style>
</head>
<body>
  <div class="faixa"></div>
  <main class="pagina">
    <header class="marca">
      <span class="marca-logo">${icone('pata', 22)}<img src="/logo.png" alt="" onerror="this.remove()"></span>
      <div><small>Gatil</small><strong>${MARCA}</strong></div>
    </header>

    <article class="card">
      <div style="position:relative">
        ${foto}
        ${status ? `<span class="selo" style="background:${status.bg};color:${status.cor}"><i></i>${status.label}</span>` : ''}
      </div>
      <div class="corpo">
        <span class="papel">${icone('pata', 13)} ${esc(papel)}</span>
        <h1>${esc(nome)}</h1>
        ${sexoLabel ? `<span class="sexo"><span class="${esc(animal.sexo)}">${icone(animal.sexo, 14)}</span>${sexoLabel}</span>` : ''}
        ${infos.length ? `<div class="infos">${infos.map((i) => `
          <div class="info">
            <span class="info-icone">${icone(i.icone)}</span>
            <div style="min-width:0"><small>${i.label}</small><b>${esc(i.valor)}</b></div>
          </div>`).join('')}
        </div>` : ''}
        ${extra ? `<div class="extra">${extra}</div>` : ''}
        <button class="botao botao-pri" id="compartilhar">${icone('compartilhar')} Compartilhar</button>
      </div>
    </article>

    <footer class="rodape">
      <small>Apresentado por</small>
      <p>${icone('pata', 16)} Gatil ${MARCA}</p>
    </footer>
  </main>

  ${animal.foto_url ? `<div class="tela" id="tela" role="dialog" aria-label="Foto em tela cheia">
    <button id="fecharFoto" aria-label="Fechar">${icone('fechar', 22)}</button>
    <img src="${esc(animal.foto_url)}" alt="${esc(nome)}">
  </div>` : ''}
  <div class="aviso" id="aviso">Link copiado!</div>

  <script>
    (function () {
      var tela = document.getElementById('tela');
      var abrir = document.getElementById('abrirFoto');
      if (tela && abrir) {
        var fechar = function () { tela.classList.remove('aberta'); document.body.style.overflow = ''; };
        abrir.addEventListener('click', function () { tela.classList.add('aberta'); document.body.style.overflow = 'hidden'; });
        tela.addEventListener('click', function (e) { if (e.target.tagName !== 'IMG') fechar(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });
      }
      document.getElementById('compartilhar').addEventListener('click', function () {
        var dados = { title: document.title, text: ${JSON.stringify(`Conheça ${nome} 🐾 — Gatil ${MARCA}`).replace(/</g, '\\u003c')}, url: location.href };
        if (navigator.share) { navigator.share(dados).catch(function () {}); return; }
        var aviso = document.getElementById('aviso');
        (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject())
          .then(function () { aviso.classList.add('ver'); setTimeout(function () { aviso.classList.remove('ver'); }, 2000); })
          .catch(function () {});
      });
    })();
  </script>
</body>
</html>`;
}

module.exports = { paginaPublica, esc, icone };
