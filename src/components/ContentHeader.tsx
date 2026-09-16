import React from 'react';
import { ContentInfo } from '@/data/contentData';

interface ContentHeaderProps {
    content: ContentInfo;
    className?: string;
}

/**
 * Entradilla editorial de la selección actual: titular, texto de apoyo y,
 * cuando existe, una nota al margen con el dato del género o país.
 */
const ContentHeader: React.FC<ContentHeaderProps> = ({ content, className }) => {
    return (
        <div className={`grid md:grid-cols-[1fr_auto] gap-8 md:gap-16 py-8 ${className || ''}`}>
            <div className="max-w-[62ch]">
                <h2 className="t-display text-[clamp(1.9rem,6vw,3.25rem)]">
                    {content.title}
                </h2>
                <p className="mt-5 text-[15px] md:text-base leading-relaxed text-meta-c">
                    {content.description}
                </p>
            </div>

            {content.funFact && (
                <aside className="md:w-64 md:pl-8 pt-5 md:pt-0">
                    <p className="t-data text-[10px] text-meta-c mb-2">Al margen</p>
                    <p className="text-sm leading-relaxed">{content.funFact}</p>
                </aside>
            )}
        </div>
    );
};

export default ContentHeader;
