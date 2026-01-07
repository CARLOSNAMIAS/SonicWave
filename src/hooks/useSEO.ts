import { useEffect, useRef } from 'react';

interface SEOProps {
    title: string;
    description?: string;
}

export const useSEO = ({ title, description }: SEOProps) => {
    const defaultTitle = useRef(document.title);

    useEffect(() => {
        // Update Title
        document.title = title;

        // Update Description
        if (description) {
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
                metaDescription = document.createElement('meta');
                metaDescription.setAttribute('name', 'description');
                document.head.appendChild(metaDescription);
            }
            metaDescription.setAttribute('content', description);
        }

        // Cleanup (optional, depends if we want to revert on unmount. Usually SPA keeps last state)
        // return () => {
        //   document.title = defaultTitle.current;
        // };
    }, [title, description]);
};
