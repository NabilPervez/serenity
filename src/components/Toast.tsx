import { useState } from 'react';

interface ToastProps {
  message: string;
  show: boolean;
}

export function Toast({ message, show }: ToastProps) {
  return (
    <div className={`toast${show ? ' show' : ''}`} role="alert" aria-live="polite">
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  return { toast, showToast };
}
