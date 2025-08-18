import { Fragment } from 'react';
import { createPortal } from 'react-dom';
// portal modal component
export default function Modal({ open, onClose, children }) {
  // don't render if closed
  if (!open) return null;
  // render overlay and content via portal
  return createPortal(
    <Fragment>
      {/* backdrop overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
        }}
        onClick={onClose}
      />
      {/* modal container center */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 1000,
        }}
      >
        {/* modal content box */}
        <div
          className="review-modal"
          style={{
            position: 'relative',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            maxWidth: '500px',
            width: '100%',
            padding: '1.5rem',
          }}
          onClick={e => e.stopPropagation()}
        >{/* close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              color: '#666',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
          {/* injected children */}
          {children}
        </div>
      </div>
    </Fragment>,
    document.body
  );
}