export function calcularIdade(dataNascStr) {
  if (!dataNascStr) return null;

  const nasc = new Date(dataNascStr + 'T00:00:00');
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const diffMs = hoje - nasc;
  if (diffMs < 0) return null;

  const totalDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (totalDias === 0) return 'Nasceu hoje';
  if (totalDias < 30) return `${totalDias} ${totalDias === 1 ? 'dia' : 'dias'}`;

  let anos = hoje.getFullYear() - nasc.getFullYear();
  let meses = hoje.getMonth() - nasc.getMonth();
  let dias = hoje.getDate() - nasc.getDate();

  if (dias < 0) {
    meses--;
    const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
    dias += ultimoDiaMesAnterior;
  }
  if (meses < 0) {
    anos--;
    meses += 12;
  }

  const partes = [];
  if (anos > 0) partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`);
  if (dias > 0 && anos === 0) partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`);

  return partes.join(' e ');
}
