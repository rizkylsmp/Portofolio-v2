import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6">
          <div className="bg-surface-secondary rounded-xl p-8 max-w-md w-full text-center shadow-xl border border-border">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-accent mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-text-secondary mb-6">
              There was an error loading this section. Please try refreshing the
              page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-accent text-surface px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors duration-300"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
