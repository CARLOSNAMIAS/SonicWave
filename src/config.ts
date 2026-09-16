/**
 * Interruptores de secciones de la aplicación.
 */

/**
 * La Revista está retirada de la navegación mientras se revisa la solicitud de
 * Google AdSense: sus contenidos (horóscopo y noticias) se generan con IA en
 * cada visita, y las políticas del programa tratan el contenido generado
 * automáticamente como motivo de rechazo.
 *
 * El código de la vista se conserva intacto. Para volver a publicarla basta con
 * poner esto en `true`, añadir de nuevo su URL al sitemap (public/sitemap.xml)
 * y sustituir el contenido automático por material editorial propio.
 */
export const MAGAZINE_ENABLED = false;
