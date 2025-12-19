// src/components/AdsenseAd.tsx

import React, { useEffect } from 'react';

// Declara la variable global de AdSense para TypeScript
declare global {
  interface Window {
    adsbygoogle: { [key:string]: unknown }[];
  }
}

const AdsenseAd: React.FC = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("Error al cargar el anuncio de AdSense:", err);
    }
  }, []);

  return (
    <div style={{ display: 'block', margin: '20px 0', textAlign: 'center' }}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6983431049380018"
        data-ad-slot="9584148800" // ¡Tu ID de bloque de anuncios ya está aquí!
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdsenseAd;
