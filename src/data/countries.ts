/**
 * Nombre en español de cada país, a partir del nombre en inglés que usa la API
 * de emisoras. La API solo entiende su propio nombre, así que ese sigue siendo
 * el que se envía en las búsquedas; este es el que se le muestra a la persona.
 */
const COUNTRY_NAMES_ES: Record<string, string> = {
    'Argentina': 'Argentina',
    'Bolivia': 'Bolivia',
    'Brazil': 'Brasil',
    'Chile': 'Chile',
    'Colombia': 'Colombia',
    'Costa Rica': 'Costa Rica',
    'Cuba': 'Cuba',
    'Dominican Republic': 'República Dominicana',
    'Ecuador': 'Ecuador',
    'El Salvador': 'El Salvador',
    'Guatemala': 'Guatemala',
    'Honduras': 'Honduras',
    'Mexico': 'México',
    'Nicaragua': 'Nicaragua',
    'Panama': 'Panamá',
    'Paraguay': 'Paraguay',
    'Peru': 'Perú',
    'Puerto Rico': 'Puerto Rico',
    'Uruguay': 'Uruguay',
    'Venezuela': 'Venezuela',
    'USA': 'Estados Unidos',
    'Canada': 'Canadá',
    'Spain': 'España',
    'Germany': 'Alemania',
    'France': 'Francia',
    'Italy': 'Italia',
    'United Kingdom': 'Reino Unido',
    'Netherlands': 'Países Bajos',
    'Portugal': 'Portugal',
    'Japan': 'Japón',
    'China': 'China',
    'Korea': 'Corea del Sur',
    'South Korea': 'Corea del Sur',
    'India': 'India',
    'Indonesia': 'Indonesia',
    'Philippines': 'Filipinas',
    'Thailand': 'Tailandia',
    'Vietnam': 'Vietnam',
    'Nigeria': 'Nigeria',
    'Egypt': 'Egipto',
    'South Africa': 'Sudáfrica',
    'Morocco': 'Marruecos',
    'Australia': 'Australia',
    'New Zealand': 'Nueva Zelanda',
};

/** Nombre en español del país; si no está en la lista, el que dio la API. */
export const countryLabel = (apiName: string): string =>
    COUNTRY_NAMES_ES[apiName] ?? apiName;
