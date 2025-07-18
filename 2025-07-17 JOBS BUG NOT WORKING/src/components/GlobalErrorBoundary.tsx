import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global error boundary caught:', error, errorInfo);
    
    // If it's a resource exhaustion error, try to stop the cascade
    if (error.message.includes('ERR_INSUFFICIENT_RESOURCES')) {
      console.log('🚨 Resource exhaustion detected, attempting to stop cascade...');
      
      // Try to stop all requests
      if (typeof window !== 'undefined' && (window as any).stopAllRequests) {
        (window as any).stopAllRequests();
      }
    }
  }

  private handleReset = () => {
    // Clear all state and reload
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              The application encountered an error. This might be due to resource exhaustion.
            </p>
            
            {this.state.error?.message.includes('ERR_INSUFFICIENT_RESOURCES') && (
              <p className="text-sm text-red-600 mb-4">
                Resource exhaustion detected. Please clear your browser cache and try again.
              </p>
            )}
            
            <div className="flex gap-2">
              <Button onClick={this.handleReset} variant="default">
                Reset Application
              </Button>
              <Button 
                onClick={() => window.location.href = '/auth'} 
                variant="outline"
              >
                Go to Login
              </Button>
            </div>
            
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-500">
                Error details
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
