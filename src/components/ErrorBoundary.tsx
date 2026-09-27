import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

/** Last-resort safety net: a crash anywhere in the tree shows this instead of a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('Naqiwha crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="fixed inset-0 z-[999] grid place-items-center bg-paper p-8 text-center">
        <div className="flex max-w-xs flex-col items-center gap-4">
          <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted">Give it another try.</p>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.assign('/');
            }}
            className="h-12 rounded-pill bg-brand px-6 font-semibold text-white"
          >
            Back to the map
          </button>
        </div>
      </div>
    );
  }
}
