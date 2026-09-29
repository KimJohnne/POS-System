import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    // If the error is related to MetaMask or browser wallet extensions, do not crash the app
    const msg = error?.message || error?.toString() || '';
    if (
      msg.includes('MetaMask') ||
      msg.includes('metamask') ||
      msg.includes('ethereum') ||
      msg.includes('chrome-extension')
    ) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const msg = error?.message || error?.toString() || '';
    if (
      msg.includes('MetaMask') ||
      msg.includes('metamask') ||
      msg.includes('ethereum') ||
      msg.includes('chrome-extension')
    ) {
      // Suppress extension errors from breaking application state
      this.setState({ hasError: false, error: null });
      return;
    }
    console.error('Cellar POS caught an unhandled application error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Temporary Application Warning</h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              Cellar POS encountered an unexpected event. All local data and stock records are securely preserved.
            </p>
            {this.state.error?.message && (
              <pre className="p-3 bg-stone-950 rounded-xl text-[11px] font-mono text-stone-400 border border-stone-800 text-left overflow-x-auto">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Reload Till Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
