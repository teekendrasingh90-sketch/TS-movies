import React, { useEffect, useRef } from 'react';

const BannerAd: React.FC = () => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adContainerRef.current && !adContainerRef.current.querySelector('iframe')) {
      // Clear container first
      adContainerRef.current.innerHTML = '';
      
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

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://www.highperformanceformat.com/d0a36e88c2dcfd6239cd83b7e8ff5ce4/invoke.js';
      
      adContainerRef.current.appendChild(optionsScript);
      adContainerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="flex justify-center my-8 w-full overflow-hidden">
      <div 
        ref={adContainerRef} 
        className="min-h-[90px] min-w-[300px] md:min-w-[728px] bg-white/10 rounded flex items-center justify-center relative border-2 border-[#ff4e00]/30 shadow-[0_0_20px_rgba(255,78,0,0.1)]"
      >
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-500 uppercase font-bold tracking-widest pointer-events-none">
          Advertisement
        </div>
      </div>
    </div>
  );
};

export default BannerAd;
