'use client';

import { useToast } from '@/lib/toast-context';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function ToastDisplay() {
  const { toasts, removeToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            animate-slide-in-up
            pointer-events-auto
            flex items-center justify-between
            gap-4 px-4 py-3 rounded-sm
            border border-border
            text-sm font-medium
            ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-900'
                : toast.type === 'error'
                  ? 'bg-red-50 text-red-900'
                  : 'bg-blue-50 text-blue-900'
            }
          `}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="hover:opacity-60 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
