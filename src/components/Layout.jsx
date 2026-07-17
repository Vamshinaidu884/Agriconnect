/* ============================================================
   Layout Shell Component — Handles V2 responsive viewport wrapping
   ============================================================ */
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import './Layout.css';

export default function Layout({ children, title, showBack = false, rightAction = null }) {
  return (
    <div className="layout-shell">
      {/* Sidebar - Hidden on mobile, compact on tablet, full on desktop */}
      <Sidebar />

      <div className="layout-container">
        {/* Top Header navbar */}
        <Header title={title} showBack={showBack} rightAction={rightAction} />

        {/* Dynamic page main content */}
        <main className="layout-content-area">{children}</main>

        {/* Mobile Bottom Navigation - Hidden on tablet/desktop */}
        <BottomNav />
      </div>
    </div>
  );
}
