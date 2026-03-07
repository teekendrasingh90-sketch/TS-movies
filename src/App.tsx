import React, { useState, useEffect } from 'react';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const PROXY_URL = "/proxy-onoflix/en";

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowRetry(true);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleRetry = () => {
    setIsLoading(true);
    setShowRetry(false);
    window.location.reload();
  };

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          backgroundColor: '#000'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTop: '3px solid #004a99',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '15px'
          }} />
          <p style={{ fontSize: '14px', color: '#aaa' }}>Loading Onoflix...</p>
          
          {showRetry && (
            <button 
              onClick={handleRetry}
              style={{
                marginTop: '20px',
                padding: '8px 20px',
                backgroundColor: '#004a99',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Retry Loading
            </button>
          )}
          
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      <iframe 
        src={PROXY_URL}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#000'
        }}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
      
      {error && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#ff4444' }}>
          Failed to load. Please try refreshing.
        </div>
      )}
    </div>
  );
}
