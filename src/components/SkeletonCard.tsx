import React from 'react';

/**
 * Marcador de posición con la misma retícula que una fila de emisora.
 * Ocupa exactamente el alto definitivo para que la lista no salte al cargar.
 */
const SkeletonCard: React.FC = () => {
  return (
    <div className="grid grid-cols-[2.5rem_3.5rem_1fr] md:grid-cols-[3.5rem_4rem_1fr] items-center gap-3 md:gap-5 px-2 md:px-3 py-4">
      <span className="t-data text-[11px] text-meta-c">···</span>
      <div className="skeleton-block w-12 h-12 md:w-16 md:h-16 bg-black/10 dark:bg-white/10 animate-pulse"></div>
      <div className="space-y-2">
        <div className="skeleton-block h-4 w-2/5 bg-black/10 dark:bg-white/10 animate-pulse"></div>
        <div className="skeleton-block h-3 w-1/4 bg-black/10 dark:bg-white/10 animate-pulse"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
