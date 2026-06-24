import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/Toast.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import Onboarding from './components/Onboarding.jsx'
import MenuPrincipal from './components/MenuPrincipal.jsx'

function Root() {
  const [splash, setSplash] = useState(true);
  const [onboarding, setOnboarding] = useState(localStorage.getItem('onboarding_visto') !== 'v2');
  const [menuVisto, setMenuVisto] = useState(false);

  if (splash) return <SplashScreen onDone={() => setSplash(false)} />;
  if (onboarding) return <Onboarding onDone={() => setOnboarding(false)} />;

  return (
    <BrowserRouter>
      <ToastProvider>
        {!menuVisto && <MenuPrincipal onEntrar={() => setMenuVisto(true)} />}
        <App />
      </ToastProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
