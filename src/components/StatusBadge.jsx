import './StatusBadge.css';
import { getRequestStatusInfo } from '../utils/fcfs';

export default function StatusBadge({ status }) {
  const info = getRequestStatusInfo(status);
  return (
    <span className={`status-badge status-badge-${info.color}`}>
      {info.icon} {info.label}
    </span>
  );
}
