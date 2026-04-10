import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

// Settings removed from nav — it's now a cog on each page's top bar
const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: 'fact_check', label: 'Home' },
  { to: '/journal', icon: 'edit_note', label: 'Journal' },
  { to: '/timeline', icon: 'auto_stories', label: 'Timeline' },
  { to: '/breathe', icon: 'air', label: 'Breathe' },
  { to: '/bedtime', icon: 'bedtime', label: 'Bedtime' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <nav className="nav-drawer">
        <div className="nav-brand">
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>spa</span>
          Serenity
        </div>
        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile Bottom Navigation — no FAB, no Settings */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
