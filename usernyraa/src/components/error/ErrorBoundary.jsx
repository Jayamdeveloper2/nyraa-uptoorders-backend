import React from "react";

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.message || "An unexpected error occurred."}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
          <style jsx>{`
            .error-container {
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background-color: #f9fafb;
              text-align: center;
              padding: 20px;
            }
            .btn-primary {
              background-color: #BE6992;
              border-color: #BE6992;
              padding: 10px 20px;
              border-radius: 5px;
            }
            .btn-primary:hover {
              background-color: #D47A9D;
              border-color: #D47A9D;
            }
          `}</style>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;