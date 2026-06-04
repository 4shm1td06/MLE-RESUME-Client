import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 24px',
          textAlign: 'center',
          color: '#991b1b',
          background: '#fef2f2',
          borderRadius: '16px',
          border: '1px solid #fecaca'
        }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Preview Error</h3>
          <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.9rem' }}>
            Something went wrong rendering the preview.
          </p>
          <button
            className="btn btn-ghost"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
