/* Spinner — Reusable loading spinner */
export default function Spinner({ size = 'md', text = 'Loading...' }) {
  const sizes = { sm: 20, md: 36, lg: 56 };
  const px = sizes[size] || 36;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem' }}>
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #2E7D32)" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
        </path>
      </svg>
      {text && <p style={{ color: 'var(--color-text-secondary, #666)', fontSize: '0.875rem', margin: 0 }}>{text}</p>}
    </div>
  );
}
