/* PasswordInput — Input field with show/hide toggle */
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ id, placeholder = 'Password', value, onChange, className = '', required }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className={`input-field ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{ paddingRight: '3rem' }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        style={{
          position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '0.25rem',
          display: 'flex', alignItems: 'center',
        }}
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
