import { useEffect } from 'react';

interface SEOProps {
    title: string;
    description?: string;
    /**
     * Ruta canónica de la vista, relativa al dominio (por ejemplo `/?view=ABOUT`).
     * Sin ella, todas las secciones declararían la portada como canónica y los
     * buscadores las descartarían como copias de la misma página.
     */
    path?: string;
}

const SITE_URL = 'https://sonicwave-radio.vercel.app';

/** Crea la etiqueta si no existe todavía y devuelve la que corresponda. */
const ensureTag = <T extends HTMLElement>(selector: string, create: () => T): T => {
    const existing = document.head.querySelector<T>(selector);
    if (existing) return existing;
    const created = create();
    document.head.appendChild(created);
    return created;
};

export const useSEO = ({ title, description, path }: SEOProps) => {
    useEffect(() => {
        document.title = title;

        if (description) {
            const metaDescription = ensureTag<HTMLMetaElement>('meta[name="description"]', () => {
                const tag = document.createElement('meta');
                tag.setAttribute('name', 'description');
                return tag;
            });
            metaDescription.setAttribute('content', description);

            const ogDescription = document.head.querySelector('meta[property="og:description"]');
            ogDescription?.setAttribute('content', description);
        }

        const ogTitle = document.head.querySelector('meta[property="og:title"]');
        ogTitle?.setAttribute('content', title);

        if (path) {
            const canonical = ensureTag<HTMLLinkElement>('link[rel="canonical"]', () => {
                const tag = document.createElement('link');
                tag.setAttribute('rel', 'canonical');
                return tag;
            });
            const url = `${SITE_URL}${path}`;
            canonical.setAttribute('href', url);

            const ogUrl = document.head.querySelector('meta[property="og:url"]');
            ogUrl?.setAttribute('content', url);
        }
    }, [title, description, path]);
};
