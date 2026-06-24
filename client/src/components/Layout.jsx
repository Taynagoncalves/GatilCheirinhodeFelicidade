import BottomNav from './BottomNav';
import Header from './Header';

export default function Layout({ title, subtitle, showBack, showNotification, hideNav, children }) {
  return (
    <div className="screen">
      <Header title={title} subtitle={subtitle} showBack={showBack} showNotification={showNotification} />
      <div className="content">{children}</div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
