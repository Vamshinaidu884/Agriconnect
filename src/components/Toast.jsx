import { useApp } from '../context/AppContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import './Toast.css';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div className={`toast toast-${toast.type}`} id="toast-notification">
      <div className="toast-icon">{icons[toast.type] || icons.info}</div>
      <span className="toast-message">{toast.message}</span>
    </div>
  );
}
