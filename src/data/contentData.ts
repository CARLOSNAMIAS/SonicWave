import { countryLabel } from '@/data/countries';

export interface ContentInfo {
    title: string;
    description: string;
    funFact?: string;
}

// Las claves son los nombres que usa la API de emisoras; los textos están
// escritos para el público latinoamericano, sin palabras en inglés.
const COUNTRY_CONTENT: Record<string, ContentInfo> = {
    'Venezuela': {
        title: 'Radio de Venezuela en vivo',
        description: 'Escucha las emisoras de Venezuela en vivo: noticias desde Caracas, salsa, merengue, gaita y la música llanera que define la identidad sonora del país. Gratis y sin registro.',
        funFact: '¿Sabías que la gaita zuliana es uno de los géneros más escuchados en Navidad en toda Venezuela?'
    },
    'Spain': {
        title: 'Radio de España en vivo',
        description: 'Sintoniza la radio de España: desde el flamenco andaluz hasta el pop de Madrid y las noticias de Barcelona. Una selección de las emisoras más escuchadas de la península.',
    },
    'USA': {
        title: 'Radio de Estados Unidos en vivo',
        description: 'Las emisoras de Estados Unidos, incluidas muchas en español, desde Miami y Houston hasta Los Ángeles y Nueva York. Música regional mexicana, salsa, noticias y deportes.',
    },
    'Mexico': {
        title: 'Radio de México en vivo',
        description: 'La radio mexicana en vivo y gratis: mariachi, banda, norteño, música regional y el mejor pop latino, además de noticias y deportes de todo el país.',
        funFact: 'La XEW, fundada en 1930, se anunciaba como «La voz de la América Latina desde México».'
    },
    'Argentina': {
        title: 'Radio de Argentina en vivo',
        description: 'Desde el tango de Buenos Aires hasta el rock nacional que hizo historia. Escucha en vivo las emisoras argentinas más queridas, con noticias, fútbol y música.',
        funFact: 'El 27 de agosto de 1920, «los locos de la azotea» hicieron desde Buenos Aires una de las primeras transmisiones de radio del mundo.'
    },
    'Colombia': {
        title: 'Radio de Colombia en vivo',
        description: 'La tierra de la cumbia y el vallenato te espera. Escucha en vivo las emisoras de Colombia, desde la costa caribe hasta los Andes, con música, noticias y fútbol.',
        funFact: 'La Unesco reconoció en 2015 la música vallenata como patrimonio cultural inmaterial de la humanidad.'
    },
    'default': {
        title: 'Radio del mundo en vivo',
        description: 'Te conectamos con emisoras locales de esta región. Descubre otras culturas a través de su música y sus noticias, gratis y sin registro.',
    }
};

const GENRE_CONTENT: Record<string, ContentInfo> = {
    'latin': {
        title: 'Música latina en vivo',
        description: 'Reguetón, salsa, bachata, cumbia y pop latino. Los ritmos que ponen a bailar al mundo entero, en emisoras que suenan las veinticuatro horas.',
    },
    'salsa': {
        title: 'Radio de salsa en vivo',
        description: 'Salsa dura, salsa romántica y los clásicos de siempre. Emisoras de Cali, Caracas, Puerto Rico, Nueva York y todo el Caribe que no paran de sonar.',
        funFact: 'El nombre «salsa» se popularizó en Nueva York en los años setenta, de la mano del sello Fania.'
    },
    'reggaeton': {
        title: 'Radio de reguetón en vivo',
        description: 'Los éxitos del reguetón y el perreo, desde los clásicos de Puerto Rico hasta lo último de Medellín. Escúchalo gratis y en vivo.',
        funFact: 'El Diccionario de la lengua española escribe este género como «reguetón».'
    },
    'cumbia': {
        title: 'Radio de cumbia en vivo',
        description: 'Cumbia colombiana, sonidera mexicana, villera argentina y chicha peruana. Un mismo ritmo que cada país hizo suyo, en vivo y gratis.',
    },
    'bachata': {
        title: 'Radio de bachata en vivo',
        description: 'Bachata romántica y bachata urbana de la República Dominicana para el mundo. Emisoras dedicadas a este ritmo, sin cortes ni registro.',
        funFact: 'La Unesco inscribió en 2019 la música y el baile de la bachata dominicana como patrimonio cultural inmaterial.'
    },
    'vallenato': {
        title: 'Radio de vallenato en vivo',
        description: 'Acordeón, caja y guacharaca. Escucha en vivo el vallenato clásico y el nuevo, desde Valledupar y toda la costa colombiana.',
    },
    'rock': {
        title: 'Radio de rock en vivo',
        description: 'Guitarras, baterías potentes y pura actitud: del rock clásico al rock en español y el metal. La energía que buscas, en vivo.',
        funFact: 'El rock en español vivió su gran auge en los años ochenta, con bandas como Soda Stereo.'
    },
    'hip-hop': {
        title: 'Radio de rap en vivo',
        description: 'Rap en español y del mundo: letras, ritmo y calle. Emisoras dedicadas al rap y a la cultura urbana, gratis y en vivo.',
    },
    'electronic': {
        title: 'Música electrónica en vivo',
        description: 'Tecno, trance y paisajes sintéticos. Emisoras de música electrónica para escuchar mientras trabajas, entrenas o sales de noche.',
    },
    'jazz': {
        title: 'Radio de jazz en vivo',
        description: 'Improvisación, alma y técnica. Del jazz clásico de Nueva Orleans al jazz latino y contemporáneo, en emisoras que no se detienen.',
    },
    'lofi': {
        title: 'Música para concentrarse',
        description: 'Ritmos suaves y relajados, perfectos para estudiar, trabajar o simplemente desconectarse. Emisoras sin anuncios estridentes que acompañan sin distraer.',
    },
    'dance': {
        title: 'Música para bailar',
        description: 'Los ritmos más bailables de las pistas de todo el mundo, en vivo. Pon una emisora y que no pare la fiesta.',
    },
    'chillout': {
        title: 'Música tranquila',
        description: 'Música suave y relajante para bajar el ritmo del día, leer o descansar. Emisoras en vivo que suenan sin prisa.',
    },
    'podcast': {
        title: 'Pódcast en español',
        description: 'Historias, entrevistas, humor y aprendizaje. Una selección de pódcast en tu idioma para aprender algo nuevo cada día.',
    },
    'bts': {
        title: 'Radio de BTS',
        description: 'Todo sobre Bangtan: los mayores éxitos, las canciones menos conocidas y programas especiales dedicados a RM, Jin, Suga, J-Hope, Jimin, V y Jungkook.',
        funFact: 'El club de admiradores de BTS, conocido como ARMY, es uno de los más grandes y organizados del mundo.'
    }
};

export const getContentForFilter = (filterKey: string, type: 'country' | 'tag' | 'default'): ContentInfo => {
    if (type === 'country') {
        return COUNTRY_CONTENT[filterKey] || {
            ...COUNTRY_CONTENT['default'],
            title: `Radio de ${countryLabel(filterKey)} en vivo`,
        };
    }
    if (type === 'tag') {
        const normalizedKey = filterKey.toLowerCase();
        return GENRE_CONTENT[normalizedKey] || {
            title: `Radio de ${filterKey} en vivo`,
            description: `Descubre las emisoras especializadas en ${filterKey}, en vivo y gratis.`,
        };
    }
    return COUNTRY_CONTENT['default'];
};
