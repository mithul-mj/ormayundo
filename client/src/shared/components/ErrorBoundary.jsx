import { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

/**
 * Robust Error Boundary to catch render errors, prevent white screen crashes,
 * and provide clean user recovery options.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({
              error: this.state.error,
              resetError: this.handleReset,
            })
          : this.props.fallback;
      }

      const isModal = Boolean(this.props.isModal);

      return (
        <div
          className={`flex flex-col items-center justify-center p-6 text-center animate-fade-in ${
            isModal
              ? 'fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md'
              : 'min-h-[300px] w-full bg-neutral-900/40 rounded-3xl border border-neutral-800 my-4'
          }`}
        >
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl text-white">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold tracking-tight mb-2">
              {this.props.title || 'Something went wrong'}
            </h3>

            <p className="text-neutral-400 text-xs sm:text-sm mb-6 leading-relaxed">
              {this.props.description ||
                'An unexpected error occurred in this view. We have logged the issue and you can safely reload or return.'}
            </p>

            {this.state.error && import.meta.env?.DEV && (
              <div className="mb-6 text-left p-3 rounded-xl bg-black/50 border border-neutral-800 overflow-x-auto text-[11px] font-mono text-rose-300 max-h-32 custom-scrollbar">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-full bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={() => {
                  if (this.props.onClose) {
                    this.props.onClose();
                  } else {
                    window.location.reload();
                  }
                }}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{this.props.onClose ? 'Close Modal' : 'Reload Page'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

