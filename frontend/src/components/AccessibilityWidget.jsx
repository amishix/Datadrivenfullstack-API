import { useEffect, useState } from 'react';

/**
 * AccessibilityWidget component allows users to toggle accessibility
 * features such as dyslexia-friendly font, increased text spacing,
 * high contrast mode, and light mode. Settings are saved in
 * localStorage and applied globally to the document body.
 *
 * @component
 * @returns {JSX.Element} Accessibility widget UI
 */
const AccessibilityWidget = () => {
  // State to toggle the visibility of the settings panel
  const [showPanel, setShowPanel] = useState(false);

  // Accessibility feature states
  const [dyslexia, setDyslexia] = useState(false);
  const [spacing, setSpacing] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  /**
   * Load saved accessibility settings from localStorage on mount.
   */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('accessibilitySettings')) || {};
    setDyslexia(saved.dyslexia || false);
    setSpacing(saved.spacing || false);
    setContrast(saved.contrast || false);
    setLightMode(saved.lightMode || false);
  }, []);

  /**
   * Apply accessibility classes to the document body and save
   * current settings to localStorage whenever they change.
   */
  useEffect(() => {
    document.body.classList.toggle('dyslexia-font', dyslexia);
    document.body.classList.toggle('extra-spacing', spacing);
    document.body.classList.toggle('high-contrast', contrast);
    document.body.classList.toggle('light-mode', lightMode);

    localStorage.setItem('accessibilitySettings', JSON.stringify({ dyslexia, spacing, contrast, lightMode }));
  }, [dyslexia, spacing, contrast, lightMode]);

  /**
   * Render accessibility widget button and settings panel.
   */
  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
      }}
    >
      {/* Button to toggle visibility of accessibility settings panel */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          background: '#FFD700',
          border: 'none',
          borderRadius: '50%',
          width: '45px',
          height: '45px',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        }}
        title="Accessibility Settings"
        aria-label="Toggle accessibility settings panel"
      >
        ⚙️
      </button>

      {/* Accessibility options panel */}
      {showPanel && (
        <div
          style={{
            marginTop: '0.5rem',
            background: '#111',
            color: '#fff',
            padding: '1rem',
            borderRadius: '10px',
            width: '220px',
            boxShadow: '0 0 12px rgba(255,255,255,0.2)',
          }}
          role="region"
          aria-label="Accessibility options"
        >
          <label>
            <input
              type="checkbox"
              checked={dyslexia}
              onChange={() => setDyslexia(!dyslexia)}
            />{' '}
            Dyslexia Font
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={spacing}
              onChange={() => setSpacing(!spacing)}
            />{' '}
            Text Spacing
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={contrast}
              onChange={() => setContrast(!contrast)}
            />{' '}
            High Contrast
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={lightMode}
              onChange={() => setLightMode(!lightMode)}
            />{' '}
            Light Mode
          </label>
        </div>
      )}
    </div>
  );
};

export default AccessibilityWidget;