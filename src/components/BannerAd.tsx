import React, { useEffect, useRef } from 'react';

const BannerAd: React.FC = () => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adContainerRef.current && !adContainerRef.current.firstChild) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://www.highperformanceformat.com/d0a36e88c2dcfd6239cd83b7e8ff5ce4/invoke.js';
      
      const optionsScript = document.createElement('script');
      optionsScript.type = 'text/javascript';
      optionsScript.innerHTML = `
        atOptions = {
          'key' : 'd0a36e88c2dcfd6239cd83b7e8ff5ce4',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;

      adContainerRef.current.appendChild(optionsScript);
      adContainerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="flex justify-center my-8 w-full overflow-hidden">
      <div 
        ref={adContainerRef} 
        className="min-h-[90px] min-w-[728px] bg-white/5 rounded flex items-center justify-center relative"
      >
        {/* Placeholder text while loading */}
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-500 uppercase font-bold tracking-widest pointer-events-none">
          Advertisement
        </div>
      </div>
    </div>
  );
};

export default BannerAd;
