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
      backgroundColor: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Browser Header */}
      <div style={{
        height: '40px',
        backgroundColor: '#2b2b2b',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        borderBottom: '1px solid #3d3d3d',
        gap: '10px',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
        </div>
        
        <div style={{
          flex: 1,
          height: '24px',
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 15px',
          fontSize: '12px',
          color: '#aaa',
          border: '1px solid #444'
        }}>
          <span style={{ color: '#27c93f', marginRight: '5px' }}>🔒</span>
          https://onoflix.live
        </div>

        <button 
          onClick={handleRetry}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0 5px'
          }}
          title="Refresh"
        >
          ↻
        </button>
      </div>

      <div style={{ position: 'relative', flex: 1 }}>
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
            <p style={{ fontSize: '14px', color: '#aaa' }}>Connecting to Onoflix Live...</p>
            
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
                Retry Connection
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
      </div>
      
      {error && (
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          padding: '10px 20px', 
          backgroundColor: '#ff4444',
          borderRadius: '4px',
          color: '#fff',
          zIndex: 30
        }}>
          Connection Error. Please refresh.
        </div>
      )}
    </div>
  );
}
