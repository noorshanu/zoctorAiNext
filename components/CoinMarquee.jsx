import React, { useEffect, useRef } from 'react';

const CoinMarquee = () => {
    const widgetRef = useRef(null);

    useEffect(() => {
      const scriptId = 'gecko-coin-price-marquee-widget-script';
  
      // Check if the script is already loaded to avoid duplication
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://widgets.coingecko.com/gecko-coin-price-marquee-widget.js';
        script.async = true;
        document.body.appendChild(script);
  
        script.onload = () => {
          console.log('CoinGecko widget script loaded successfully.');
          // Initialize the widget manually if needed
        };
  
        script.onerror = () => {
          console.error('Failed to load CoinGecko widget script.');
        };
      }
    }, []);
  
    return (
      <div>
        {/* Use the widget reference to ensure it's only initialized once */}
        <gecko-coin-price-marquee-widget
          ref={widgetRef}
          locale="en"
          dark-mode="true"
          outlined="true"
          coin-ids=""
          initial-currency="usd"
        ></gecko-coin-price-marquee-widget>
      </div>
    );
  };
  

export default CoinMarquee;
