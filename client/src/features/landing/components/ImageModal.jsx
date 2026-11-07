export default function ImageModal({ activeModalImg, onClose }) {
  if (!activeModalImg) return null;

  return (
    <div
      className={
      [
        'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center',
        'justify-center p-4 cursor-pointer animate-in fade-in duration-200'
      ].join(' ')
    }
      onClick={onClose}
    >
      <div
        className={
      [
        'relative max-w-5xl max-h-[90vh] bg-white rounded-3xl overflow-hidden p-2',
        'shadow-2xl border border-white/20 cursor-default'
      ].join(' ')
    }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-4 py-2 border-b border-divider">
          <span className="text-xs font-bold text-muted">
            Ormayundo High-Resolution Screenshot
          </span>
          <button
            onClick={onClose}
            className={
      [
        'w-7 h-7 rounded-full bg-surface hover:bg-gray-200 flex items-center',
        'justify-center text-ink font-bold text-sm cursor-pointer'
      ].join(' ')
    }
          >
            ✕
          </button>
        </div>
        <div className="overflow-auto max-h-[80vh] p-2">
          <img
            src={activeModalImg}
            alt="Enlarged screenshot"
            className="w-full h-auto rounded-xl object-contain"
          />
        </div>
      </div>
    </div>
  );
}
