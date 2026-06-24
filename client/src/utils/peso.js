export function formatarPeso(pesoG) {
  if (pesoG === null || pesoG === undefined || pesoG === '') return null;
  const g = parseFloat(pesoG);
  if (g >= 1000) {
    const kg = g / 1000;
    return `${kg % 1 === 0 ? kg.toFixed(0) : kg.toFixed(2).replace(/\.?0+$/, '')} kg`;
  }
  return `${g % 1 === 0 ? Math.round(g) : g} g`;
}
