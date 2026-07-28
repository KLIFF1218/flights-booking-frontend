"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { SearchError } from "./SearchError";

type Props = {
  children: ReactNode;
  onReset: () => void;
};

type State = {
  error: Error | null;
};

export class SearchResultsErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Search results error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ error: null });
    this.props.onReset();
  };

  render() {
    if (this.state.error) {
      return (
        <SearchError
          errorMessage={this.state.error.message}
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
