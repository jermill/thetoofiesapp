import { Component, type ReactNode } from 'react';

type State = { error: Error | null };

/**
 * Last-resort catch so a render crash shows a friendly recovery screen
 * instead of a blank page. Local data is untouched.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Toofies render crash:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="crash-screen" role="alert">
        <img src="/mascot/toofie-splash.png" alt="" width={120} height={120} />
        <h1>Toofie tripped on a sprinkle</h1>
        <p>Something broke in the app - your dessert log on this device is safe.</p>
        <div className="crash-actions">
          <button type="button" className="primary-btn" onClick={() => location.reload()}>
            Reload the app
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => {
              location.href = '/';
            }}
          >
            Go home
          </button>
        </div>
        <p className="fineprint">{this.state.error.message}</p>
      </div>
    );
  }
}
