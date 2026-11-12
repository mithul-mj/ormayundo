import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Normalizes common markdown quirks produced by AI generations or browser clippings:
 * 1. Trims leading spaces before markdown table pipes (e.g. " | Col |" -> "| Col |")
 * 2. Ensures table blocks have a preceding blank line so CommonMark/GFM parses them as tables
 */
export const normalizeMarkdown = (text) => {
  if (!text) return '';
  let str = String(text).trim();
  // Strip leading spaces on lines starting with pipes
  str = str.replace(/^[ \t]+(\|)/gm, '$1');

  // Ensure table blocks have a preceding newline if preceded by non-table text
  const lines = str.split('\n');
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prev = lines[i - 1];
    const isTableLine = line.trim().startsWith('|') && line.trim().endsWith('|');
    const prevIsTableLine = prev && prev.trim().startsWith('|') && prev.trim().endsWith('|');
    const prevIsEmpty = !prev || prev.trim() === '';

    if (isTableLine && !prevIsTableLine && !prevIsEmpty) {
      result.push('');
    }
    result.push(line);
  }
  return result.join('\n');
};

export const defaultMarkdownComponents = {
  table: ({ ...props }) => (
    <div className="w-full overflow-x-auto my-3 rounded-xl border border-gray-200/90 shadow-2xs custom-scrollbar bg-white">
      <table className="markdown-table !my-0 w-full" {...props} />
    </div>
  ),
  thead: ({ ...props }) => (
    <thead className="bg-neutral-100/90 border-b border-gray-200" {...props} />
  ),
  tbody: ({ ...props }) => (
    <tbody className="divide-y divide-gray-100 bg-white" {...props} />
  ),
  tr: ({ ...props }) => (
    <tr className="hover:bg-neutral-50/70 transition-colors" {...props} />
  ),
  th: ({ ...props }) => (
    <th
      className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-left font-bold text-neutral-900 text-xs uppercase tracking-wider border-r last:border-r-0 border-gray-200/80 whitespace-nowrap bg-neutral-100/90"
      {...props}
    />
  ),
  td: ({ ...props }) => (
    <td
      className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-neutral-700 text-xs sm:text-sm border-r last:border-r-0 border-gray-200/70 align-top"
      {...props}
    />
  ),
  pre: ({ ...props }) => (
    <div className="w-full overflow-x-auto my-3 rounded-xl custom-scrollbar">
      <pre className="p-3 bg-neutral-900 text-neutral-100 rounded-xl text-xs font-mono" {...props} />
    </div>
  ),
  code: ({ inline, ...props }) =>
    inline ? (
      <code className="bg-neutral-100 text-brand px-1.5 py-0.5 rounded text-xs font-mono break-all font-semibold" {...props} />
    ) : (
      <code {...props} />
    ),
  a: ({ ...props }) => (
    <a
      className="text-brand-light font-medium hover:underline hover:text-brand transition-colors break-all"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  p: ({ ...props }) => (
    <p className="text-neutral-700 leading-relaxed mb-3 last:mb-0" {...props} />
  ),
  ul: ({ ...props }) => <ul className="list-disc pl-5 my-2 space-y-1 text-neutral-700" {...props} />,
  ol: ({ ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1 text-neutral-700" {...props} />,
  li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
  blockquote: ({ ...props }) => (
    <blockquote className="border-l-4 border-brand-light/60 pl-3.5 italic my-2 text-neutral-600 bg-neutral-50/60 py-1 rounded-r" {...props} />
  ),
};

export default function MarkdownRenderer({ content, className = '', components = {} }) {
  const normalized = normalizeMarkdown(content);
  const mergedComponents = { ...defaultMarkdownComponents, ...components };

  return (
    <div className={`markdown-content w-full ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mergedComponents}>
        {normalized}
      </ReactMarkdown>
    </div>
  );
}

