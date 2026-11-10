import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  closeOnBackdrop = true,
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  }[maxWidth] || 'max-w-lg';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={() => closeOnBackdrop && onClose && onClose()}
    >
      <div
        className={[
          'relative w-full bg-white rounded-3xl border border-divider shadow-[0_24px_64px_rgba(0,0,0,0.18)] max-h-[90vh] flex flex-col my-auto',
          widthClasses,
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-b border-divider shrink-0">
          <div className="min-w-0">
            {title && (
              <h3 className="font-extrabold text-base sm:text-lg text-ink leading-tight truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-muted mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 shrink-0 rounded-full border border-divider flex items-center justify-center text-muted hover:text-ink hover:border-ink transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

