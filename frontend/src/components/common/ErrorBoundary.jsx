import { Component } from "react";
import { Button } from "@/components/ui/button";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error("Unhandled UI error", error, info);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="premium-surface w-full max-w-lg rounded-lg p-6 text-center">
          <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            OpportunityX recovered the page before it could crash. Please try again.
          </p>
          {import.meta.env.DEV && this.state.error?.message ? (
            <pre className="mt-4 max-h-32 overflow-auto rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
          ) : null}
          <div className="mt-5 flex justify-center gap-3">
            <Button variant="outline" onClick={this.reset}>Try again</Button>
            <Button onClick={() => window.location.assign("/")}>Go home</Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
