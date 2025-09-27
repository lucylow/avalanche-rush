import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center border border-red-400/30">
              <div className="mb-6">
                <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-red-200 mb-6">
                  The game encountered an unexpected error. Don't worry, your progress is safe!
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-900/50 rounded-lg text-left">
                  <h3 className="text-red-300 font-semibold mb-2">Error Details:</h3>
                  <pre className="text-red-200 text-xs overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-red-200 text-xs overflow-auto mt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={this.handleRetry}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full border-red-400 text-red-300 hover:bg-red-600 hover:text-white"
                  size="lg"
                >
                  Reload Page
                </Button>
              </div>

              <div className="mt-6 text-sm text-red-300">
                <p>If the problem persists, please:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Check your internet connection</li>
                  <li>Clear your browser cache</li>
                  <li>Try refreshing the page</li>
                  <li>Contact support if the issue continues</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
