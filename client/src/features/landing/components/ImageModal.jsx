import { X } from 'lucide-react';

export default function ImageModal({ activeModalImg, onClose }) {
  if (!activeModalImg) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 cursor-pointer animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl overflow-hidden p-1.5 sm:p-2 shadow-2xl border border-neutral-200 cursor-default flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center gap-2 px-3 sm:px-4 py-2 border-b border-neutral-200/80 shrink-0">
          <span className="text-xs font-semibold text-neutral-700 truncate">
            Ormayundo Preview
          </span>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-95 flex items-center justify-center text-neutral-700 cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-auto max-h-[82vh] p-1.5 sm:p-2">
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
