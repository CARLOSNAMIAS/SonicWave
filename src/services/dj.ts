import { SearchFilters } from '@/types';
import {
    CONVERSACION,
    INTENCIONES,
    PAISES,
    SIN_ENTENDER,
    SIN_CONTEXTO,
    Intencion,
} from '@/data/djIntents';

/**
 * El DJ de SonicWave.
 *
 * Traduce lo que escribe una persona en una búsqueda para Radio Browser. No
 * usa ningún servicio externo: todo el vocabulario está en `djIntents.ts`, de
 * modo que responde al instante, no cuesta nada y no puede dejar de funcionar
 * porque un proveedor retire un modelo o caduque una clave.
 */

/** Lo que el DJ recuerda de la petición anterior. */
export interface ContextoDJ {
    intencion: string | null;
    pais: string | null;
    energia: number | null;
    ultimaRespuesta: string | null;
}

export interface ResultadoDJ {
    reasoning: string;
    /** `null` cuando la petición es charla y no hay nada que buscar. */
    searchQuery: SearchFilters | null;
    vibe?: { primaryColor: string; accentColor: string; mood: string };
    contexto: ContextoDJ;
}

const CONTEXTO_VACIO: ContextoDJ = {
    intencion: null,
    pais: null,
    energia: null,
    ultimaRespuesta: null,
};

/** Minúsculas, sin acentos y sin signos: así «Clásica» y «clasica» son lo mismo. */
const normalizar = (texto: string): string =>
    texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[¿?¡!.,;:()"']/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

/** Busca una clave como palabra completa, para que «rap» no salte dentro de «rapido». */
const contiene = (texto: string, clave: string): boolean => {
    const escapada = clave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\s)${escapada}(\\s|$)`).test(texto);
};

const alAzar = <T,>(opciones: T[]): T => opciones[Math.floor(Math.random() * opciones.length)];

/** Elige una frase distinta de la anterior, para que el DJ no se repita. */
const frase = (opciones: string[], anterior: string | null): string => {
    if (opciones.length === 1) return opciones[0];
    const disponibles = opciones.filter(o => o !== anterior);
    return alAzar(disponibles.length > 0 ? disponibles : opciones);
};

/** La intención cuya clave coincidente sea más larga: «heavy metal» gana a «metal». */
const buscarIntencion = (texto: string, lista: Intencion[]): { intencion: Intencion; largo: number } | null => {
    let mejor: { intencion: Intencion; largo: number } | null = null;
    for (const intencion of lista) {
        for (const clave of intencion.claves) {
            if (contiene(texto, clave) && (!mejor || clave.length > mejor.largo)) {
                mejor = { intencion, largo: clave.length };
            }
        }
    }
    return mejor;
};

const buscarPais = (texto: string): string | null => {
    let mejor: { pais: string; largo: number } | null = null;
    for (const { pais, claves } of PAISES) {
        for (const clave of claves) {
            if (contiene(texto, clave) && (!mejor || clave.length > mejor.largo)) {
                mejor = { pais, largo: clave.length };
            }
        }
    }
    return mejor?.pais ?? null;
};

const CONTINUAR = ['otra', 'otro', 'mas', 'siguiente', 'cambia', 'cambiala', 'siguiente emisora', 'next'];
const SUBIR = ['movido', 'movida', 'rapido', 'rapida', 'animado', 'animada', 'fuerte', 'energia', 'marcha'];
const BAJAR = ['tranquilo', 'tranquila', 'suave', 'lento', 'lenta', 'calmado', 'bajito', 'relajado'];

/** Palabras que sobran al buscar el nombre de una emisora. */
const RUIDO = ['radio', 'emisora', 'ponme', 'pon', 'quiero', 'busca', 'buscar', 'escuchar',
    'dame', 'la', 'el', 'una', 'un', 'de', 'del', 'por', 'favor', 'fm', 'am'];

const filtrosDe = (intencion: Intencion, pais: string | null): SearchFilters => {
    const filtros: SearchFilters = intencion.filtros
        ? { ...intencion.filtros }
        : { tag: alAzar(intencion.tags || []) };
    if (pais) filtros.country = pais;
    return filtros;
};

const vibeDe = (intencion: Intencion) =>
    intencion.color
        ? {
            primaryColor: intencion.color,
            accentColor: intencion.color,
            mood: intencion.animo || 'sonoro',
        }
        : undefined;

const responder = (
    intencion: Intencion,
    pais: string | null,
    contexto: ContextoDJ
): ResultadoDJ => {
    const texto = frase(intencion.respuestas, contexto.ultimaRespuesta);
    return {
        reasoning: pais && intencion.tags ? `${texto} (desde ${pais})` : texto,
        searchQuery: filtrosDe(intencion, pais),
        vibe: vibeDe(intencion),
        contexto: {
            intencion: intencion.id,
            pais,
            energia: intencion.energia ?? null,
            ultimaRespuesta: texto,
        },
    };
};

/** Ante «algo más movido», busca la intención con la energía que toca. */
const porEnergia = (objetivo: number): Intencion | null => {
    const candidatas = INTENCIONES.filter(i => i.energia === objetivo && i.tags);
    return candidatas.length > 0 ? alAzar(candidatas) : null;
};

export const pedirAlDJ = (peticion: string, contexto: ContextoDJ = CONTEXTO_VACIO): ResultadoDJ => {
    const texto = normalizar(peticion || '');

    if (!texto) {
        return {
            reasoning: frase(SIN_ENTENDER, contexto.ultimaRespuesta),
            searchQuery: null,
            contexto,
        };
    }

    const pais = buscarPais(texto);
    const genero = buscarIntencion(texto, INTENCIONES);
    const charla = buscarIntencion(texto, CONVERSACION);

    // Una petición de música gana a un saludo: «hola, ponme salsa» pone salsa.
    if (genero && (!charla || genero.largo >= charla.largo)) {
        return responder(genero.intencion, pais, contexto);
    }

    // Solo un país, sin género: emisoras de ese país.
    if (pais && !genero) {
        const texto2 = `Nos vamos a ${pais}. A ver qué se escucha por allí.`;
        return {
            reasoning: texto2,
            searchQuery: { country: pais },
            contexto: { intencion: null, pais, energia: null, ultimaRespuesta: texto2 },
        };
    }

    if (charla) {
        const dice = frase(charla.intencion.respuestas, contexto.ultimaRespuesta);
        return {
            reasoning: dice,
            searchQuery: null,
            contexto: { ...contexto, ultimaRespuesta: dice },
        };
    }

    // «Algo más movido» / «más tranquilo»: se mueve sobre lo último puesto.
    const sube = SUBIR.some(p => contiene(texto, p));
    const baja = BAJAR.some(p => contiene(texto, p));
    if ((sube || baja) && contexto.energia) {
        const objetivo = Math.min(5, Math.max(1, contexto.energia + (sube ? 2 : -2)));
        const nueva = porEnergia(objetivo) || porEnergia(sube ? 5 : 1);
        if (nueva) return responder(nueva, contexto.pais, contexto);
    }

    // «Ponme otra»: repite lo último, que al elegir otra etiqueta ya suena distinto.
    if (CONTINUAR.some(p => contiene(texto, p))) {
        const anterior = INTENCIONES.find(i => i.id === contexto.intencion);
        if (anterior) return responder(anterior, contexto.pais, contexto);
        if (contexto.pais) {
            const dice = `Seguimos por ${contexto.pais}, con otras emisoras.`;
            return {
                reasoning: dice,
                searchQuery: { country: contexto.pais },
                contexto: { ...contexto, ultimaRespuesta: dice },
            };
        }
        const dice = frase(SIN_CONTEXTO, contexto.ultimaRespuesta);
        return { reasoning: dice, searchQuery: null, contexto: { ...contexto, ultimaRespuesta: dice } };
    }

    // Puede que esté pidiendo una emisora por su nombre. Solo se intenta cuando
    // hay algún indicio de ello: una palabra como «radio» o «emisora», o varias
    // palabras. Una sola palabra desconocida es más probable que sea un error de
    // tecleo que el nombre de una cadena.
    const palabras = texto.split(' ').filter(Boolean);
    const pista = palabras.some(p => ['radio', 'emisora', 'fm', 'am', 'estacion'].includes(p));
    const nombre = palabras.filter(p => p.length > 2 && !RUIDO.includes(p)).join(' ');
    if (nombre && (pista || palabras.length > 1)) {
        const dice = `Busco «${nombre}» por el nombre, a ver si aparece.`;
        return {
            reasoning: dice,
            searchQuery: { name: nombre },
            contexto: { ...contexto, intencion: null, ultimaRespuesta: dice },
        };
    }

    const dice = frase(SIN_ENTENDER, contexto.ultimaRespuesta);
    return { reasoning: dice, searchQuery: null, contexto: { ...contexto, ultimaRespuesta: dice } };
};
