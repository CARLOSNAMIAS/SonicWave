import { SearchFilters } from '@/types';

/**
 * El vocabulario del DJ.
 *
 * Esto es contenido, no lógica: para enseñarle una palabra nueva basta con
 * añadirla a `claves`, y para cambiarle el tono, con reescribir `respuestas`.
 *
 * Las etiquetas de `tags` están comprobadas contra Radio Browser: todas tienen
 * emisoras de verdad. Cuando hay varias, el DJ elige una al azar en cada
 * petición, que es lo que evita que repita siempre la misma búsqueda.
 */
export interface Intencion {
    id: string;
    /** Palabras o expresiones que la disparan, ya normalizadas (minúsculas, sin acentos). */
    claves: string[];
    /** Etiquetas candidatas en Radio Browser. El DJ escoge una. */
    tags?: string[];
    /** Búsqueda fija, para casos que no son una etiqueta (por ejemplo, un grupo). */
    filtros?: SearchFilters;
    /** Frases del DJ. Se elige una al azar, evitando repetir la anterior. */
    respuestas: string[];
    /** Color de la señal mientras suena esta selección. */
    color?: string;
    /** De 1 (muy tranquila) a 5 (muy movida). Permite entender «algo más movido». */
    energia?: number;
    /** Una palabra que describe el ambiente. */
    animo?: string;
}

/** Charla: responde, pero no busca nada. */
export const CONVERSACION: Intencion[] = [
    {
        id: 'saludo',
        claves: ['hola', 'holaa', 'buenas', 'hey', 'ey', 'que tal', 'como estas', 'como va',
            'buenos dias', 'buenas tardes', 'buenas noches', 'saludos', 'epale', 'que hay'],
        respuestas: [
            '¡Hola! Dime qué quieres escuchar: un género, un país o un momento del día.',
            'Aquí estoy. ¿Qué ponemos? Puedes pedirme salsa, algo tranquilo o radio de Japón.',
            '¡Buenas! Tú dime el ambiente y yo busco la emisora.',
            'Hola. ¿Empezamos con algo movido o con algo suave?',
        ],
    },
    {
        id: 'gracias',
        claves: ['gracias', 'grasias', 'genial', 'perfecto', 'buenisimo', 'excelente', 'me gusta'],
        respuestas: [
            'A mandar. Si te cansas, pídeme otra cosa.',
            'Para eso estoy. ¿Seguimos con este ambiente o cambiamos?',
            'Me alegro. Dime cuando quieras cambiar de aires.',
        ],
    },
    {
        id: 'despedida',
        claves: ['adios', 'chao', 'hasta luego', 'nos vemos', 'bye', 'me voy'],
        respuestas: [
            'Hasta la próxima. Dejo la radio encendida.',
            'Chao. Aquí seguiré cuando vuelvas.',
            'Nos oímos. Que suene bien.',
        ],
    },
    {
        id: 'ayuda',
        claves: ['ayuda', 'que sabes hacer', 'que puedes hacer', 'como funciona', 'quien eres',
            'que eres', 'help', 'no se que pedir', 'opciones'],
        respuestas: [
            'Busco emisoras por ti. Pídeme un género (salsa, jazz, rock), un país (radio de México) o un ambiente (algo tranquilo para trabajar). También valen las dos cosas: «salsa venezolana».',
            'Dime un género, un país o cómo te quieres sentir. Por ejemplo: «música para bailar», «radio de Japón» o «rock argentino».',
        ],
    },
];

/** Géneros, ambientes y todo lo que sí acaba en una búsqueda. */
export const INTENCIONES: Intencion[] = [
    // --- Ambientes -------------------------------------------------------
    {
        id: 'concentracion',
        claves: ['tranquilo', 'tranquila', 'relajado', 'relajada', 'relax', 'calma', 'suave',
            'para trabajar', 'para estudiar', 'estudiar', 'concentrarme', 'concentrar', 'concentracion',
            'lofi', 'lo fi', 'de fondo', 'chill', 'leer'],
        tags: ['lofi', 'chillout', 'ambient', 'instrumental'],
        respuestas: [
            'Algo suave para que no estorbe: te dejo esto de fondo.',
            'Volumen bajo y nada de sobresaltos. Perfecto para la tarea.',
            'Esto acompaña sin pedir atención. A trabajar.',
            'Ritmo lento, cabeza despejada. Ahí va.',
        ],
        color: '#3E7C8C',
        energia: 1,
        animo: 'sereno',
    },
    {
        id: 'fiesta',
        claves: ['bailar', 'baile', 'fiesta', 'rumba', 'movido', 'movida', 'energia', 'animado',
            'marcha', 'party', 'dance', 'discoteca', 'antro'],
        tags: ['dance', 'house', 'edm', 'disco', 'techno'],
        respuestas: [
            'Subimos el pulso. Que se mueva el suelo.',
            'Esto ya no es música de fondo: sube el volumen.',
            'Pista libre. Vamos allá.',
            'Aquí tienes ritmo para no parar.',
        ],
        color: '#E0246C',
        energia: 5,
        animo: 'eufórico',
    },
    {
        id: 'dormir',
        claves: ['dormir', 'sueño', 'noche', 'meditar', 'meditacion', 'yoga', 'naturaleza',
            'lluvia', 'descansar', 'siesta', 'zen'],
        tags: ['meditation', 'nature', 'ambient', 'relax'],
        respuestas: [
            'Bajamos las luces. Esto es para respirar despacio.',
            'Sonido para irse apagando poco a poco.',
            'Nada de percusión. Solo calma.',
        ],
        color: '#2F4858',
        energia: 1,
        animo: 'sereno',
    },
    {
        id: 'nostalgia',
        claves: ['nostalgia', 'nostalgico', 'recuerdos', 'viejo', 'antiguo', 'clasicos', 'oldies',
            'los 80', '80s', 'ochenta', 'ochentas', 'los 90', '90s', 'noventa', 'noventas',
            'los 70', '70s', 'setenta', 'los 60', '60s', 'sesenta', 'retro', 'sinfonola'],
        tags: ['oldies', '80s', '90s', '70s', '60s'],
        respuestas: [
            'Damos marcha atrás. Esto sonaba cuando sonaba de verdad.',
            'Puro archivo. A ver cuántas reconoces.',
            'Un salto al pasado, que últimamente se lleva.',
        ],
        color: '#C8622A',
        energia: 3,
        animo: 'nostálgico',
    },

    // --- Géneros latinos -------------------------------------------------
    {
        id: 'salsa',
        claves: ['salsa', 'salsero', 'salsera', 'son cubano', 'timba'],
        tags: ['salsa'],
        respuestas: [
            'Salsa brava. Que no falte el piano.',
            'Esto se baila o no se escucha. Ahí va la salsa.',
            'Metales, clave y candela.',
        ],
        color: '#D93B0F',
        energia: 4,
        animo: 'caliente',
    },
    {
        id: 'tropical',
        claves: ['merengue', 'bachata', 'cumbia', 'vallenato', 'tropical', 'caribe', 'caribeño'],
        tags: ['merengue', 'bachata', 'cumbia', 'vallenato'],
        respuestas: [
            'Trópico puro. Sube el ventilador.',
            'De la costa para acá. Que suene.',
            'Ritmo caribeño, del que no deja quieto a nadie.',
        ],
        color: '#F2A03D',
        energia: 4,
        animo: 'festivo',
    },
    {
        id: 'reggaeton',
        claves: ['reggaeton', 'regueton', 'perreo', 'urbano', 'trap latino', 'dembow'],
        tags: ['reggaeton', 'trap', 'latino'],
        respuestas: [
            'Urbano y sin disculpas. Ahí lo tienes.',
            'Lo que suena en la calle ahora mismo.',
            'Dembow a tope.',
        ],
        color: '#7B2FF7',
        energia: 5,
        animo: 'callejero',
    },
    {
        id: 'mexicano',
        claves: ['ranchera', 'rancheras', 'mariachi', 'banda', 'norteño', 'nortena', 'corridos',
            'regional mexicano', 'grupera'],
        tags: ['ranchera', 'mariachi', 'banda', 'norteño'],
        respuestas: [
            'Con trompeta y sentimiento. Así se canta.',
            'Regional del bueno. Sube el volumen y acompaña.',
            'Esto se canta a gritos, que para eso está.',
        ],
        color: '#00843D',
        energia: 4,
        animo: 'sentido',
    },
    {
        id: 'romantica',
        claves: ['romantica', 'romantico', 'amor', 'baladas', 'balada', 'bolero', 'boleros',
            'para enamorados', 'despecho', 'llorar'],
        tags: ['bolero', 'soul', 'oldies'],
        respuestas: [
            'De las que se cantan con los ojos cerrados.',
            'Aviso: esto es para sentirlo, no para ignorarlo.',
            'Boleros y desamor, la combinación de siempre.',
        ],
        color: '#A3123A',
        energia: 2,
        animo: 'melancólico',
    },
    {
        id: 'latino',
        claves: ['latino', 'latina', 'en español', 'espanol', 'hispano', 'tango', 'flamenco',
            'sertanejo', 'brasilero', 'bossa nova', 'bossa'],
        tags: ['latino', 'latin', 'tango', 'flamenco', 'sertanejo'],
        respuestas: [
            'Lo nuestro, en todas sus formas.',
            'Del sur para el mundo. Ahí va.',
            'Música en español, de la que se entiende.',
        ],
        color: '#E85D04',
        energia: 3,
        animo: 'cálido',
    },

    // --- Géneros internacionales ----------------------------------------
    {
        id: 'rock',
        claves: ['rock', 'rockero', 'rockera', 'guitarras', 'grunge'],
        tags: ['rock'],
        respuestas: [
            'Guitarras al frente. Como debe ser.',
            'Rock del que se escucha con la ventanilla bajada.',
            'Sube el volumen, que esto no se oye bajito.',
        ],
        color: '#B3121B',
        energia: 4,
        animo: 'eléctrico',
    },
    {
        id: 'metal',
        claves: ['metal', 'heavy', 'heavy metal', 'metalero', 'punk', 'hardcore', 'thrash'],
        tags: ['metal', 'heavy metal', 'punk'],
        respuestas: [
            'Sin concesiones. Ahí va.',
            'Aviso a los vecinos y le damos.',
            'Distorsión y velocidad. A ello.',
        ],
        color: '#2B2B2B',
        energia: 5,
        animo: 'furioso',
    },
    {
        id: 'pop',
        claves: ['pop', 'exitos', 'hits', 'actual', 'lo que suena ahora', 'top', 'comercial',
            'lo mas nuevo', 'novedades'],
        tags: ['pop', '2000s'],
        respuestas: [
            'Lo que está sonando en todas partes.',
            'Éxitos de los que se pegan. Tú sabrás si es bueno o malo.',
            'Pop directo, sin rodeos.',
        ],
        color: '#FF4A8D',
        energia: 4,
        animo: 'luminoso',
    },
    {
        id: 'jazz',
        claves: ['jazz', 'swing', 'manouche', 'bebop', 'dixieland'],
        tags: ['jazz'],
        respuestas: [
            'Para esto hace falta un vaso corto y poca luz.',
            'Improvisación y humo. Ahí lo tienes.',
            'Jazz del que se escucha sin hacer nada más.',
        ],
        color: '#8C6239',
        energia: 2,
        animo: 'elegante',
    },
    {
        id: 'clasica',
        claves: ['clasica', 'clasico', 'classical', 'orquesta', 'sinfonica', 'piano',
            'violin', 'barroco', 'mozart', 'beethoven'],
        tags: ['classical'],
        respuestas: [
            'Doscientos años después y sigue funcionando.',
            'Orquesta completa. Sube un poco el volumen.',
            'Esto ordena la cabeza como pocas cosas.',
        ],
        color: '#4A5859',
        energia: 2,
        animo: 'solemne',
    },
    {
        id: 'electronica',
        claves: ['electronica', 'electronico', 'edm', 'synthwave', 'sintetizador',
            'drum and bass', 'dnb'],
        tags: ['electronic'],
        respuestas: [
            'Máquinas al mando. Ahí va.',
            'Esto no lo toca nadie: lo programa alguien. Y funciona.',
            'Sintetizadores y paciencia. Déjalo correr.',
        ],
        color: '#00C2B2',
        energia: 5,
        animo: 'hipnótico',
    },
    {
        id: 'hiphop',
        claves: ['hip hop', 'hiphop', 'rap', 'rapero', 'trap', 'rnb', 'r&b', 'freestyle'],
        tags: ['hip hop', 'rap', 'rnb', 'trap'],
        respuestas: [
            'Palabra y ritmo. Sin más adorno.',
            'Aquí lo que importa es lo que se dice.',
            'Rap del que se escucha con atención.',
        ],
        color: '#F0A500',
        energia: 4,
        animo: 'urbano',
    },
    {
        id: 'reggae',
        claves: ['reggae', 'ska', 'dub', 'jamaica', 'jamaicano', 'rastafari'],
        tags: ['reggae', 'ska'],
        respuestas: [
            'Compás lento y contratiempo. Todo va a ir bien.',
            'Jamaica manda. Relájate.',
            'Esto se escucha con los hombros sueltos.',
        ],
        color: '#2E9B4F',
        energia: 3,
        animo: 'relajado',
    },
    {
        id: 'country',
        claves: ['country', 'folk', 'bluegrass', 'americana', 'vaquero', 'celta', 'celtic'],
        tags: ['country', 'folk'],
        respuestas: [
            'Carretera, guitarra y una historia triste.',
            'Del granero al altavoz. Ahí va.',
            'Folk del que cuenta cosas.',
        ],
        color: '#A0752B',
        energia: 3,
        animo: 'campestre',
    },
    {
        id: 'asia',
        claves: ['kpop', 'k pop', 'k-pop', 'coreano', 'jpop', 'j pop', 'japones', 'anime',
            'bollywood', 'indio', 'asiatico'],
        tags: ['kpop', 'anime', 'bollywood'],
        respuestas: [
            'Directo desde el otro lado del mundo.',
            'Producción milimétrica y coreografía. Ahí lo tienes.',
            'Asia tiene su propia idea de un éxito. Escucha.',
        ],
        color: '#FF5FA2',
        energia: 5,
        animo: 'vibrante',
    },
    {
        id: 'bts',
        claves: ['bts', 'bangtan', 'army'],
        filtros: { name: 'bts' },
        respuestas: [
            'Para el ARMY. Ahí van las emisoras dedicadas a Bangtan.',
            'BTS sin parar. Tú lo pediste.',
        ],
        color: '#7C4DFF',
        energia: 4,
        animo: 'entregado',
    },
    {
        id: 'navidad',
        claves: ['navidad', 'navideña', 'navideno', 'christmas', 'diciembre', 'aguinaldos'],
        tags: ['christmas'],
        respuestas: [
            'Diciembre en cualquier época del año. Vamos.',
            'Villancicos a la carta.',
        ],
        color: '#C1121F',
        energia: 3,
        animo: 'festivo',
    },
    {
        id: 'religiosa',
        claves: ['cristiana', 'cristiano', 'gospel', 'religiosa', 'religioso', 'catolica',
            'alabanza', 'iglesia', 'espiritual'],
        tags: ['christian', 'gospel', 'religion'],
        respuestas: [
            'Música para levantar el ánimo y algo más.',
            'Alabanza y coro. Ahí va.',
        ],
        color: '#6A8CAF',
        energia: 3,
        animo: 'sereno',
    },

    {
        id: 'blues',
        claves: ['blues', 'delta blues', 'rhythm and blues'],
        tags: ['blues'],
        respuestas: [
            'Doce compases y una pena. Ahí va.',
            'Blues del que duele un poco. Perfecto.',
            'Guitarra que llora. Escucha.',
        ],
        color: '#1F4E79',
        energia: 2,
        animo: 'melancólico',
    },
    {
        id: 'soul',
        claves: ['soul', 'funk', 'motown', 'groove', 'disco funk'],
        tags: ['soul', 'funk'],
        respuestas: [
            'Esto tiene groove del de verdad.',
            'Soul y funk: imposible quedarse quieto.',
            'Bajo al frente y voz que levanta.',
        ],
        color: '#9B4DCA',
        energia: 4,
        animo: 'vibrante',
    },
    {
        id: 'techno',
        claves: ['techno', 'house', 'trance', 'deep house', 'tech house', 'minimal'],
        tags: ['techno', 'house', 'trance'],
        respuestas: [
            'Bombo a negras y sin descanso.',
            'Esto es para dejarlo correr y no pensar.',
            'Directo del sótano de Berlín.',
        ],
        color: '#00A8B5',
        energia: 5,
        animo: 'hipnótico',
    },
    {
        id: 'opera',
        claves: ['opera', 'aria', 'lirica', 'zarzuela', 'tenor', 'soprano'],
        tags: ['opera'],
        respuestas: [
            'Voces que no necesitan micrófono.',
            'Ópera. Sube el volumen y no hagas nada más.',
        ],
        color: '#6B2737',
        energia: 3,
        animo: 'dramático',
    },
    {
        id: 'indie',
        claves: ['indie', 'alternativo', 'alternativa', 'alternative', 'independiente'],
        tags: ['indie', 'alternative'],
        respuestas: [
            'De los que aún no suenan en todas partes.',
            'Música independiente, antes de que se ponga de moda.',
        ],
        color: '#5A7D5A',
        energia: 3,
        animo: 'sereno',
    },

    // --- Hablada ---------------------------------------------------------
    {
        id: 'noticias',
        claves: ['noticias', 'noticia', 'informativo', 'actualidad', 'que pasa en el mundo',
            'bbc', 'cnn', 'informacion', 'periodismo'],
        tags: ['news', 'talk'],
        respuestas: [
            'Lo que está pasando allá afuera, en vivo.',
            'Noticias. Avisado quedas.',
            'Del mundo real, para variar.',
        ],
        color: '#37474F',
        energia: 2,
        animo: 'atento',
    },
    {
        id: 'podcast',
        claves: ['podcast', 'podcasts', 'charla', 'entrevistas', 'tertulia', 'hablado',
            'conversacion', 'cultura', 'divulgacion'],
        tags: ['podcast', 'talk', 'culture', 'education'],
        respuestas: [
            'Gente hablando de cosas. A veces es justo lo que uno quiere.',
            'Voces en lugar de música. Ahí tienes.',
        ],
        color: '#5D737E',
        energia: 2,
        animo: 'reflexivo',
    },
    {
        id: 'deportes',
        claves: ['deportes', 'deporte', 'futbol', 'beisbol', 'partido', 'liga', 'sports'],
        tags: ['sports', 'talk'],
        respuestas: [
            'Deportes en vivo. Que no te lo cuenten.',
            'A ver cómo va el partido.',
        ],
        color: '#1B7F3B',
        energia: 4,
        animo: 'tenso',
    },
    {
        id: 'humor',
        claves: ['humor', 'comedia', 'reir', 'gracioso', 'chistes', 'comedy'],
        tags: ['comedy', 'talk'],
        respuestas: [
            'A ver si te saco una risa.',
            'Humor por ondas. Vamos a probar.',
        ],
        color: '#F4B400',
        energia: 3,
        animo: 'animado',
    },
];

/**
 * Países reconocidos, con sus gentilicios y apodos.
 * El valor es el nombre exacto que espera Radio Browser.
 */
export const PAISES: { pais: string; claves: string[] }[] = [
    { pais: 'Venezuela', claves: ['venezuela', 'venezolana', 'venezolano', 'caracas', 'maracaibo'] },
    { pais: 'Colombia', claves: ['colombia', 'colombiana', 'colombiano', 'bogota', 'medellin'] },
    { pais: 'Mexico', claves: ['mexico', 'mexicana', 'mexicano', 'azteca', 'df', 'guadalajara'] },
    { pais: 'Argentina', claves: ['argentina', 'argentino', 'buenos aires', 'porteño'] },
    { pais: 'Spain', claves: ['españa', 'espana', 'español', 'espanola', 'espanol', 'madrid', 'barcelona'] },
    { pais: 'USA', claves: ['estados unidos', 'usa', 'eeuu', 'americana', 'americano', 'nueva york', 'gringa'] },
    { pais: 'Chile', claves: ['chile', 'chilena', 'chileno', 'santiago de chile'] },
    { pais: 'Peru', claves: ['peru', 'peruana', 'peruano', 'lima'] },
    { pais: 'Ecuador', claves: ['ecuador', 'ecuatoriana', 'ecuatoriano', 'quito', 'guayaquil'] },
    { pais: 'Bolivia', claves: ['bolivia', 'boliviana', 'boliviano', 'la paz'] },
    { pais: 'Uruguay', claves: ['uruguay', 'uruguaya', 'uruguayo', 'montevideo'] },
    { pais: 'Paraguay', claves: ['paraguay', 'paraguaya', 'paraguayo', 'asuncion'] },
    { pais: 'Brazil', claves: ['brasil', 'brazil', 'brasilera', 'brasileno', 'brasileira', 'rio de janeiro', 'sao paulo'] },
    { pais: 'Cuba', claves: ['cuba', 'cubana', 'cubano', 'habana'] },
    { pais: 'Dominican Republic', claves: ['republica dominicana', 'dominicana', 'dominicano', 'santo domingo'] },
    { pais: 'Puerto Rico', claves: ['puerto rico', 'puertorriqueña', 'boricua', 'san juan'] },
    { pais: 'Panama', claves: ['panama', 'panameña', 'panameno'] },
    { pais: 'Costa Rica', claves: ['costa rica', 'costarricense', 'tica'] },
    { pais: 'Guatemala', claves: ['guatemala', 'guatemalteca', 'chapin'] },
    { pais: 'Honduras', claves: ['honduras', 'hondureña', 'catracha'] },
    { pais: 'El Salvador', claves: ['el salvador', 'salvadoreña', 'guanaca'] },
    { pais: 'Nicaragua', claves: ['nicaragua', 'nicaraguense', 'nica'] },
    { pais: 'France', claves: ['francia', 'francesa', 'frances', 'paris'] },
    { pais: 'Italy', claves: ['italia', 'italiana', 'italiano', 'roma', 'milan'] },
    { pais: 'Germany', claves: ['alemania', 'alemana', 'aleman', 'berlin'] },
    { pais: 'United Kingdom', claves: ['reino unido', 'inglaterra', 'britanica', 'britanico', 'ingles', 'londres', 'uk'] },
    { pais: 'Portugal', claves: ['portugal', 'portuguesa', 'portugues', 'lisboa'] },
    { pais: 'Netherlands', claves: ['holanda', 'paises bajos', 'holandesa', 'amsterdam'] },
    { pais: 'Japan', claves: ['japon', 'japonesa', 'japones', 'tokio', 'tokyo'] },
    { pais: 'South Korea', claves: ['corea', 'coreana', 'coreano', 'seul'] },
    { pais: 'China', claves: ['china', 'chino', 'pekin', 'shanghai'] },
    { pais: 'India', claves: ['india', 'hindu', 'bombay', 'mumbai'] },
    { pais: 'Canada', claves: ['canada', 'canadiense', 'toronto'] },
    { pais: 'Australia', claves: ['australia', 'australiana', 'sidney', 'sydney'] },
    { pais: 'Jamaica', claves: ['jamaica', 'jamaicana', 'kingston'] },
    { pais: 'Nigeria', claves: ['nigeria', 'nigeriana', 'lagos'] },
    { pais: 'Morocco', claves: ['marruecos', 'marroqui'] },
    { pais: 'Egypt', claves: ['egipto', 'egipcia', 'el cairo'] },
    { pais: 'Sweden', claves: ['suecia', 'sueca', 'escandinava', 'escandinavo', 'estocolmo'] },
    { pais: 'Norway', claves: ['noruega', 'noruego', 'oslo'] },
    { pais: 'Russia', claves: ['rusia', 'rusa', 'ruso', 'moscu'] },
    { pais: 'Turkey', claves: ['turquia', 'turca', 'estambul'] },
];

/** Cuando no se entiende la petición. */
export const SIN_ENTENDER = [
    'No he pillado eso. Prueba con un género («salsa», «jazz»), un país («radio de Japón») o un ambiente («algo tranquilo»).',
    'Ahí me has perdido. Dime por ejemplo «rock argentino», «música para bailar» o «noticias».',
    'No sé qué poner con eso. Pídeme un género, un país o cómo te quieres sentir.',
];

/** Cuando piden «otra» sin que haya nada puesto antes. */
export const SIN_CONTEXTO = [
    '¿Otra de qué? Dime primero un género o un país y seguimos desde ahí.',
    'Todavía no hemos puesto nada. Empieza tú: «salsa», «algo tranquilo», «radio de México».',
];
