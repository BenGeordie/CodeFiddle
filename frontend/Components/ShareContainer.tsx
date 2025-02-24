import { useState } from 'react';
import containerIdStore from '../Store/containerIdStore';
import { ClipboardIcon } from '@heroicons/react/24/solid';
import { ShareIcon } from '@heroicons/react/24/solid';

export const ShareContainer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [imageName, setImageName] = useState('');
  const containerId = containerIdStore((state) => state.containerId);

  const handleShare = async () => {
    if (!containerId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ containerId }),
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
    <div className="fixed bottom-4 right-4 z-[9999]">
      {showPopup && (
        <div className="absolute bottom-12 right-0 bg-[#282a36] border border-[#bd93f9] rounded-lg p-4 mb-2 w-80 shadow-lg">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[#f8f8f2] font-mono text-sm truncate flex-1">
              {imageName}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center p-1.5 hover:bg-[#44475a] rounded transition-colors"
              title="Copy to clipboard"
            >
              <ClipboardIcon className="h-5 w-5 text-[#bd93f9]" />
            </button>
          </div>
          <button
            onClick={() => setShowPopup(false)}
            className="absolute top-2 right-2 text-[#6272a4] hover:text-[#f8f8f2] text-lg font-bold transition-colors"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex items-center gap-3 bg-[#282a36] border border-[#bd93f9] rounded-lg px-4 py-2 shadow-lg">
        <div className="flex flex-col">
          <span className="text-[#6272a4] text-xs font-medium">Container ID</span>
          <span className="text-[#f8f8f2] font-mono text-sm truncate max-w-[180px]">
            {containerId || 'Not connected'}
          </span>
        </div>
        <div className="h-8 w-[1px] bg-[#44475a]" /> {/* Vertical divider */}
        <button
          onClick={handleShare}
          disabled={!containerId || isLoading}
          className={`
            px-4 py-1.5 rounded bg-[#44475a] text-[#f8f8f2] font-medium text-sm
            transition-all duration-200 flex items-center gap-2
            ${!containerId 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-[#6272a4] hover:shadow-md active:transform active:scale-95'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-[#bd93f9] border-t-transparent rounded-full" />
              <span>Sharing...</span>
            </div>
          ) : (
            <>
              <ShareIcon className="h-4 w-4" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}; 