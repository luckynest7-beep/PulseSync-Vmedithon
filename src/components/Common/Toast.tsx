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
            <AlertTriangle size={22} color="#f43f5e" style={{ flexShrink: 0 }} />
          ) : t.type === 'info' ? (
            <Info size={22} color="#06b6d4" style={{ flexShrink: 0 }} />
          ) : (
            <CheckCircle2 size={22} color="#10b981" style={{ flexShrink: 0 }} />
          )}

          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', flex: 1, lineHeight: 1.4 }}>
            {t.message}
          </span>

          <button
            onClick={() => onDismiss(t.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#b0bdd1',
              cursor: 'pointer',
              padding: '8px',
              minWidth: '36px',
              minHeight: '36px',
            }}
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};
