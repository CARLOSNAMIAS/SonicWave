import React from 'react';
import { Sparkles, Info } from 'lucide-react';
import { ContentInfo } from '@/data/contentData';

interface ContentHeaderProps {
    content: ContentInfo;
    className?: string;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ content, className }) => {
    return (
        <div className={`relative overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 p-6 md:p-8 ${className}`}>
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-white/5 rounded-xl shadow-sm">
                        <Sparkles className="text-cyan-500 w-5 h-5" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                        {content.title}
                    </h2>
                </div>

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl text-sm md:text-base">
                    {content.description}
                </p>

                {content.funFact && (
                    <div className="flex items-start gap-3 mt-4 p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                        <Info className="text-cyan-500 w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
                            <span className="font-bold text-cyan-600 dark:text-cyan-400 block mb-1 uppercase tracking-wider text-[10px]">Dato Curioso</span>
                            {content.funFact}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentHeader;
