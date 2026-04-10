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
