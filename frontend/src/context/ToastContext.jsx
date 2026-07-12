import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error:   <XCircle    className="w-5 h-5 text-red-500" />,
  warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  info:    <Info        className="w-5 h-5 text-blue-500" />,
};

const bgColors = {
  success: 'border-l-green-500',
  error:   'border-l-red-500',
  warning: 'border-l-yellow-500',
  info:    'border-l-blue-500',
};

function Toast({ id, type = 'info', title, message, onDismiss }) {
  return (
    <div
      className={`flex items-start gap-3 w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 border-l-4 ${bgColors[type]} p-4 animate-slide-up`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm text-gray-900 dark:text-white">{title}</p>}
        {message && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{message}</p>}
      </div>
      <button onClick={() => onDismiss(id)} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // Convenience methods
  toast.success = (msg, title = 'Success') => toast({ type: 'success', title, message: msg });
  toast.error   = (msg, title = 'Error')   => toast({ type: 'error',   title, message: msg });
  toast.warning = (msg, title = 'Warning') => toast({ type: 'warning', title, message: msg });
  toast.info    = (msg, title = 'Info')    => toast({ type: 'info',    title, message: msg });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
