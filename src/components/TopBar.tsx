import { Link } from 'react-router-dom';

interface TopBarProps {
  title: string;
  icon: string;
  right?: React.ReactNode;
}

import React from 'react';

/**
 * Shared top bar used on every main page.
 * Always renders a settings cog on the right.
 */
export default function TopBar({ title, icon, right }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar-title">
        <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.3rem' }}>
          {icon}
        </span>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {right}
        <Link
          to="/settings"
          aria-label="Settings"
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            color: 'var(--color-on-surface-variant)',
            textDecoration: 'none',
            transition: 'background 0.2s var(--ease-standard)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-container-high)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.3rem' }}>settings</span>
        </Link>
      </div>
    </header>
  );
}
