/* ErrorMessage — Reusable error display */
export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div style={{
      background: '#FFF3F3', border: '1px solid #FFCDD2', borderRadius: '12px',
      padding: '1.25rem', textAlign: 'center', margin: '1rem 0',
    }}>
      <p style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>⚠️</p>
      <p style={{ margin: '0 0 0.75rem', color: '#C62828', fontSize: '0.9rem' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: '#C62828', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '0.5rem 1.25rem',
            cursor: 'pointer', fontSize: '0.875rem',
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
