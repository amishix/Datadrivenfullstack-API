import { useState, useEffect } from 'react';

/**
 * List of navigation links for the sidebar.
 * @type {Array<{ label: string, href: string }>}
 */
const links = [
  { label: 'Home', href: '/' },
  { label: 'Oscars', href: '/oscarwinners' },
  { label: 'Treasures', href: '/underrated' },
  { label: 'Bond', href: '/bondcollection' },
  { label: 'BAFTA', href: '/baftafilms' }
];

/**
 * Sidebar component renders a collapsible vertical navigation bar.
 * Navigation state is persisted using localStorage.
 *
 * @component
 * @returns {JSX.Element} A fixed sidebar with navigation links.
 */
const Sidebar = () => {
  /** @type {[boolean, Function]} isOpen - Whether the sidebar is expanded or collapsed */
  const [isOpen, setIsOpen] = useState(true);

  /** @type {[string|null, Function]} hovered - Label of the currently hovered link */
  const [hovered, setHovered] = useState(null);

  /**
   * Load sidebar state from localStorage on mount.
   */
  useEffect(() => {
    const saved = localStorage.getItem('sidebarOpen');
    if (saved) setIsOpen(JSON.parse(saved));
  }, []);

  /**
   * Toggle sidebar open/close state and persist to localStorage.
   */
  const toggleSidebar = () => {
    setIsOpen(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <div
      style={{
        width: isOpen ? '180px' : '60px',
        background: '#111',
        height: '100vh',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOpen ? 'flex-start' : 'center',
        paddingTop: '1.5rem',
        color: '#fff',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        boxShadow: '4px 0 10px rgba(0, 0, 0, 0.6)',
        overflowX: 'hidden',
        fontFamily: 'Bebas Neue, sans-serif'
      }}
    >
      {/* ☰ Toggle Button */}
      <button
        onClick={toggleSidebar}
        style={{
          background: '#FFD700',
          border: 'none',
          borderRadius: '50%',
          width: '45px',
          height: '45px',
          fontSize: '1.4rem',
          color: '#111',
          cursor: 'pointer',
          margin: '0 auto 2rem',
          boxShadow: '0 0 10px #FFD700',
          transition: 'all 0.3s ease'
        }}
      >
        ☰
      </button>

      {/* Navigation Links */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          width: '100%',
          paddingLeft: isOpen ? '1.2rem' : '0',
        }}
      >
        {links.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            onMouseEnter={() => setHovered(label)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: hovered === label ? '#fff' : '#aaa',
              textDecoration: 'none',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'color 0.2s, background 0.2s',
              backgroundColor: hovered === label ? '#222' : 'transparent',
              position: 'relative'
            }}
          >
            {isOpen ? (
              <span>{label}</span> // Full label when sidebar is open
            ) : (
              hovered === label && (
                <span
                  style={{
                    position: 'absolute',
                    left: '65px',
                    background: '#fff',
                    color: '#111',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {label}
                </span> // Tooltip when collapsed and hovered
              )
            )}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;