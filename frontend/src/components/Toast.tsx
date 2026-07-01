import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface ToastMsg { id: number; message: string; type: 'success' | 'error' | 'info'; }
interface ToastContextValue { showToast: (message: string, type?: ToastMsg['type']) => void; }

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const showToast = useCallback((message: string, type: ToastMsg['type'] = 'info') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((toast) => toast.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-2xl shadow-lg text-sm font-medium text-white animate-in fade-in slide-in-from-bottom-2 ${
              t.type === 'success' ? 'bg-sage-500' : t.type === 'error' ? 'bg-coral-600' : 'bg-slate-700'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}