import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
  }

  private readonly handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private readonly handleCopy = async (): Promise<void> => {
    const errorText = [
      `Error: ${this.state.error?.message || "Unknown error"}`,
      `Stack: ${this.state.error?.stack || "No stack trace"}`,
      `Component Stack: ${this.state.errorInfo?.componentStack || "No component stack"}`,
    ].join("\n\n");

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  private readonly toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center p-6 bg-bg-surface border border-status-danger/40 rounded-sm m-4 font-mono text-2xs">
        <div className="flex items-center gap-2 text-status-danger text-sm font-semibold mb-2">
          <Icon name="alert" size="md" className="text-status-danger" />
          <span>Application View Encountered an Error</span>
        </div>
        <p className="text-text-secondary text-center max-w-lg mb-4">
          {this.state.error?.message || "An unhandled exception occurred in the React rendering tree."}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <Button size="sm" variant="primary" onClick={this.handleReset}>
            Recover View
          </Button>
          <Button size="sm" variant="secondary" onClick={this.handleCopy}>
            {this.state.copied ? "Copied!" : "Copy Error"}
          </Button>
          <Button size="sm" variant="ghost" onClick={this.toggleDetails}>
            {this.state.showDetails ? "Hide Stack" : "View Stack"}
          </Button>
        </div>

        {this.state.showDetails && (
          <pre className="w-full max-h-48 overflow-y-auto p-2 bg-bg-base border border-border-subtle rounded text-text-muted text-3xs whitespace-pre-wrap select-all">
            {this.state.error?.stack}
            {"\n"}
            {this.state.errorInfo?.componentStack}
          </pre>
        )}
      </div>
    );
  }
}
