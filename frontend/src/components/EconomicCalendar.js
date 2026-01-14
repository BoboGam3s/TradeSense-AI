import React, { useEffect, useRef, memo } from 'react';

function EconomicCalendar() {
  const container = useRef();

  useEffect(() => {
    if (!container.current) return;
    
    // Clear previous widget if any
    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "dark",
      "isTransparent": true,
      "width": "100%",
      "height": "400",
      "locale": "fr",
      "importanceFilter": "-1,0,1",
      "currencyFilter": "USD,EUR,GBP,JPY,AUD,CAD,CHF,NZD"
    });
    
    container.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "400px", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
      <div className="tradingview-widget-copyright">
        <a href="https://fr.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Calendrier Économique</span>
        </a> par TradingView
      </div>
    </div>
  );
}

export default memo(EconomicCalendar);
