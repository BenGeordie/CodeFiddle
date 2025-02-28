import { useState } from 'react';
import containerIdStore from '../Store/containerIdStore';
import { ClipboardIcon } from '@heroicons/react/24/solid';
import { ShareIcon } from '@heroicons/react/24/solid';
import projectPathStore from '../Store/projectPathStore';

export const ShareContainer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [imageName, setImageName] = useState('');
  const containerId = containerIdStore((state) => state.containerId);
  const projectPath = projectPathStore((state) => state.projectPath);

  const handleShare = async () => {
    if (!containerId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectPath, containerId }),
      });
      
      const data = await response.json();
      if (data.success) {
        setImageName(data.imageName);
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Error sharing container:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(imageName);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      zIndex: 9999,
    }}>
      {showPopup && (
        <div style={{
          position: 'absolute',
          bottom: '48px',
          right: 0,
          backgroundColor: '#282a36',
          border: '1px solid #bd93f9',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '8px',
          width: '320px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{
              color: '#f8f8f2',
              fontFamily: 'monospace',
              fontSize: '14px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}>
              {imageName}
            </span>
            <button
              onClick={handleCopy}
              title="Copy to clipboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                border: 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#44475a'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ClipboardIcon style={{ height: '20px', width: '20px', color: '#bd93f9' }} />
            </button>
          </div>
          <button
            onClick={() => setShowPopup(false)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              color: '#6272a4',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#f8f8f2'}
            onMouseLeave={e => e.currentTarget.style.color = '#6272a4'}
          >
            ×
          </button>
        </div>
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#282a36',
        border: '1px solid #bd93f9',
        borderRadius: '8px',
        padding: '8px 16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
        }}>
          <span style={{
            color: '#6272a4',
            fontFamily: 'monospace',
            fontSize: '12px',
            fontWeight: 500,
          }}>
            Container ID
          </span>
          <span style={{
            color: '#f8f8f2',
            fontFamily: 'monospace',
            fontSize: '14px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '180px',
          }}>
            {containerId || 'Not connected'}
          </span>
        </div>
        <div style={{
          height: '32px',
          width: '1px',
          backgroundColor: '#44475a',
        }} />
        <button
          onClick={handleShare}
          disabled={!containerId || isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '4px',
            backgroundColor: '#44475a',
            color: '#f8f8f2',
            fontWeight: 500,
            fontSize: '14px',
            border: 'none',
            cursor: containerId ? 'pointer' : 'not-allowed',
            opacity: containerId ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            if (containerId && !isLoading) {
              e.currentTarget.style.backgroundColor = '#6272a4';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseLeave={e => {
            if (containerId && !isLoading) {
              e.currentTarget.style.backgroundColor = '#44475a';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                animation: 'spin 1s linear infinite',
                height: '16px',
                width: '16px',
                border: '2px solid #bd93f9',
                borderTopColor: 'transparent',
                borderRadius: '50%',
              }} />
              <span>Sharing...</span>
            </div>
          ) : (
            <>
              <ShareIcon style={{ height: '16px', width: '16px' }} />
              <span>Share</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}; 