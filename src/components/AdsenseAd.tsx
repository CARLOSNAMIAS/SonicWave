import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: { [key: string]: unknown }[];
  }
}

const AdsenseAd: React.FC = () => {
  useEffect(() => {
    // Solo ejecuta este código en el navegador
    if (typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("Error al ejecutar el push de AdSense:", err);
      }
    }
  }, []);

  return (
    <div style={{ display: 'block', margin: '20px 0', textAlign: 'center' }}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6983431049380018"
        data-ad-slot="9584148800"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdsenseAd;