import React from 'react';

/**
 * A skeleton loader component that mimics the layout of a StationCard.
 * It's used to provide a visual placeholder while station data is being fetched,
 * improving the user experience by indicating that content is loading.
 */
const SkeletonCard: React.FC = () => {
  return (
    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50">
      <div className="relative aspect-square mb-4 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
      <div className="px-1 pb-2">
        <div className="h-4 w-3/4 mb-2 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></div>
        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
