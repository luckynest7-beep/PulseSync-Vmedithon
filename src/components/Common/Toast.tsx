import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="assertive">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type === 'error' ? 'toast-error' : 'toast-success'}`}
        >
          {t.type === 'error' ? (
            <AlertTriangle size={18} color="#f43f5e" style={{ flexShrink: 0 }} />
          ) : t.type === 'info' ? (
            <Info size={18} color="#06b6d4" style={{ flexShrink: 0 }} />
          ) : (
            <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
          )}

          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', flex: 1 }}>
            {t.message}
          </span>

          <button
            onClick={() => onDismiss(t.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
