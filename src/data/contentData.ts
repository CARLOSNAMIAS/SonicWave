export interface ContentInfo {
    title: string;
    description: string;
    funFact?: string;
}

export const COUNTRY_CONTENT: Record<string, ContentInfo> = {
    'Venezuela': {
        title: 'Ritmos de Venezuela',
        description: 'Explora la vibrante escena radial venezolana, desde las noticias de Caracas hasta el folclore de los llanos. Disfruta de una mezcla única de salsa, merengue y música tradicional llanera que define la identidad sonora del país.',
        funFact: '¿Sabías que la gaita zuliana es uno de los géneros más populares en Navidad en toda Venezuela?'
    },
    'Spain': {
        title: 'Ondas de España',
        description: 'Sintoniza con la diversidad cultural de España. Desde el flamenco andaluz hasta el pop madrileño y las últimas noticias de Barcelona. Una selección curada de las mejores emisoras de la península ibérica.',
        funFact: 'España tiene una de las tasas de consumo de radio más altas de Europa.'
    },
    'USA': {
        title: 'Radio USA',
        description: 'Sumérgete en el crisol musical de Estados Unidos. Country, Jazz, Hip-Hop, Rock y las noticias más influyentes del mundo. Escucha las voces que marcan tendencia desde Nueva York hasta Los Ángeles.',
    },
    'Mexico': {
        title: 'México al Aire',
        description: 'La radio mexicana es pura pasión. Mariachi, Banda, Norteño y el mejor Pop Latino se unen en una experiencia auditiva llena de color y tradición.',
        funFact: 'La radio jugó un papel crucial en la Época de Oro del cine mexicano.'
    },
    'Argentina': {
        title: 'Sonido Argentino',
        description: 'Desde el Tango de Buenos Aires hasta el Rock Nacional que hizo historia. Descubre la pasión argentina a través de sus emisoras más emblemáticas.',
    },
    'Colombia': {
        title: 'Colombia Musical',
        description: 'La tierra de la Cumbia y el Vallenato te espera. Siente el ritmo de una nación que respira música en cada rincón, desde la costa caribeña hasta los Andes.',
    },
    // Generic fallback for others
    'default': {
        title: 'Explora el Mundo',
        description: 'Nuestra tecnología de IA te conecta con transmisiones locales auténticas de esta región. Descubre nuevas culturas a través de su música y sus noticias.',
    }
};

export const GENRE_CONTENT: Record<string, ContentInfo> = {
    'lofi': {
        title: 'Zona de Enfoque Lo-Fi',
        description: 'Beats relajantes de baja fidelidad perfectos para estudiar, trabajar o simplemente desconectar. Una curaduría de ondas suaves para calmar tu mente.',
        funFact: 'El fenómeno "Lofi Girl" popularizó este género a nivel mundial para el estudio.'
    },
    'jazz': {
        title: 'Jazz Lounge',
        description: 'Improvisación, alma y técnica. Sumérgete en la sofisticación del Jazz, desde los clásicos de Nueva Orleans hasta el Jazz contemporáneo y experimental.',
    },
    'rock': {
        title: 'Estación de Rock',
        description: 'Guitarras distorsionadas, baterías potentes y pura actitud. Desde el Rock Clásico hasta el Indie y el Metal. La energía que necesitas está aquí.',
    },
    'dance': {
        title: 'Pista de Baile',
        description: 'Los mejores beats electrónicos, House y Dance para mantenerte en movimiento. Siente la energía de los clubes más grandes del mundo directamente en tus oídos.',
    },
    'latin': {
        title: 'Fuego Latino',
        description: 'Reggaetón, Salsa, Bachata y Pop Latino. Los ritmos más calientes que están conquistando el mundo, curados especialmente para ti.',
    },
    'podcast': {
        title: 'Podcasts en Español',
        description: 'Historias, entrevistas, comedia y aprendizaje. Descubre una selección de los mejores podcasts en tu idioma para aprender algo nuevo cada día.',
    },
    'electronic': {
        title: 'Mundo Electrónico',
        description: 'Explora los paisajes sonoros sintéticos. Techno, Trance, IDM y más. Música futurista para mentes curiosas.',
    },
    'bts': {
        title: 'BTS Army Station',
        description: 'Todo sobre Bangtan. Los mayores éxitos, lados B y programas especiales dedicados a RM, Jin, Suga, J-Hope, Jimin, V y Jungkook.',
        funFact: 'El fandom ARMY es conocido por ser uno de los más grandes y organizados del mundo.'
    }
};

export const getContentForFilter = (filterKey: string, type: 'country' | 'tag' | 'default'): ContentInfo => {
    if (type === 'country') {
        return COUNTRY_CONTENT[filterKey] || { ...COUNTRY_CONTENT['default'], title: `Emisoras de ${filterKey}` };
    }
    if (type === 'tag') {
        // Simple normalization
        const normalizedKey = filterKey.toLowerCase();
        return GENRE_CONTENT[normalizedKey] || {
            title: `Explorando ${filterKey}`,
            description: `Descubre las mejores emisoras especializadas en ${filterKey}. Una selección curada por nuestra IA para los amantes de este género.`,
        };
    }
    return COUNTRY_CONTENT['default'];
};
