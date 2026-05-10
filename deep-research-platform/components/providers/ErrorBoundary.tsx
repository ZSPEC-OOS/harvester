"use client";
import React from "react";
export class ErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="min-h-screen flex items-center justify-center"><div className="space-y-3 text-center"><p>Something went wrong.</p><button className="px-4 py-2 bg-blue-600 rounded" onClick={() => this.setState({ hasError: false })}>Try Again</button></div></div>;
    return this.props.children;
  }
}
