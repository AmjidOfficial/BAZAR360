import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error in BAZAR360:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#050B1A] text-white flex items-center justify-center p-6 selection:bg-[#7C3AED]/30">
          <div className="max-w-md w-full bg-[#071225] border border-white/10 rounded-2xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-[#7C3AED]/20 border border-[#7C3AED]/40 rounded-2xl flex items-center justify-center mx-auto text-[#A855F7] font-bold text-2xl shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              B
            </div>
            
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight mb-2">
                BAZAR360 Session Recovery
              </h1>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                An unexpected interface event was intercepted. Your session and saved data remain completely safe.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-[#050B1A] border border-white/10 rounded-xl p-3 text-left overflow-x-auto max-h-32">
                <p className="text-[10px] font-mono text-rose-400 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] hover:from-[#8B5CF6] hover:to-[#2563EB] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              Reload Experience
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
