import { createContext, useCallback, useContext, useState } from 'react';
import Tour from '../components/Tour';

const TourCtx = createContext(null);

export function TourProvider({ children }) {
  const [steps, setStepsRaw] = useState([]);
  const [ativo, setAtivo] = useState(false);
  const [passo, setPasso] = useState(0);

  const setSteps = useCallback((s) => {
    setStepsRaw(s);
    setAtivo(false);
    setPasso(0);
  }, []);

  const iniciar = useCallback(() => { setPasso(0); setAtivo(true); }, []);
  const fechar  = useCallback(() => setAtivo(false), []);

  const proximo = useCallback(() => {
    setPasso((p) => {
      if (p >= steps.length - 1) { setAtivo(false); return 0; }
      return p + 1;
    });
  }, [steps.length]);

  const anterior = useCallback(() => setPasso((p) => Math.max(0, p - 1)), []);

  return (
    <TourCtx.Provider value={{ steps, setSteps, ativo, iniciar, fechar, proximo, anterior, passo }}>
      {children}
      {ativo && steps.length > 0 && (
        <Tour steps={steps} passo={passo} onNext={proximo} onPrev={anterior} onClose={fechar} />
      )}
    </TourCtx.Provider>
  );
}

export function useTour() {
  return useContext(TourCtx);
}
