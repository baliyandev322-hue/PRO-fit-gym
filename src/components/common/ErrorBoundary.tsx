import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected application exception occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Sanitize and safely log error without leaking sensitive auth state
    console.error('[Application Exception Caught by ErrorBoundary]:', {
      name: error.name,
      message: error.message,
      componentStack: errorInfo.componentStack?.slice(0, 300),
    });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.href = '/';
  };

  handleReload = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gym-black text-gym-primary flex flex-col items-center justify-center p-4 selection:bg-gym-lime selection:text-gym-black">
          <div className="max-w-md w-full bg-gym-surface border border-gym-border p-8 rounded-sm shadow-card text-center space-y-6 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-heading font-black uppercase text-gym-lime tracking-widest block">
                SYSTEM RECOVERY PROTOCOL
              </span>
              <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-white">
                SANCTUARY EXPERIENCE INTERRUPTED
              </h2>
              <p className="text-xs text-gym-secondary leading-relaxed">
                A localized client interface error occurred. The underlying training systems and your account data remain completely secure.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-gym-lime hover:bg-gym-lime-hover text-gym-black font-heading font-black uppercase text-xs tracking-wider rounded shadow-lime-glow transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 bg-gym-black hover:bg-gym-surface border border-gym-border text-gym-secondary hover:text-white font-heading font-bold uppercase text-xs tracking-wider rounded transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
