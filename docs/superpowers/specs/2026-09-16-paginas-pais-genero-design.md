# Páginas por país y género

**Fecha:** 2026-09-16
**Estado:** aprobado para implementar

## Problema

SonicWave es una aplicación de una sola página cuyo contenido lo pinta
JavaScript a partir de una API externa. El HTML que recibe un rastreador tiene
hoy 170 caracteres y ninguna emisora, ningún titular y ningún texto. El sitio
entero es una única dirección indexable.

Eso tiene dos consecuencias. La primera es de posicionamiento: nadie llega desde
una búsqueda como «radio de Venezuela en vivo» porque no existe una página que
responda a esa búsqueda. La segunda es de monetización: la solicitud de Google
AdSense fue rechazada y «contenido de poco valor» es el motivo más frecuente
para un sitio sin texto propio indexable.

Al mismo tiempo, el repositorio ya contiene el material que resolvería ambas
cosas: `src/data/contentData.ts` guarda catorce fichas escritas a mano —seis
países y ocho géneros— con título, descripción y, en varios casos, un dato
curioso. Hoy ese texto aparece un instante al aplicar un filtro y ningún
buscador lo ve.

## Objetivos

1. Publicar una página por cada ficha existente, cuyo HTML llegue completo al
   navegador sin ejecutar JavaScript.
2. Tejer enlaces internos entre esas páginas y desde la aplicación, para que el
   rastreador pueda recorrer el sitio.
3. Que quien llegue desde un buscador pueda empezar a escuchar en un clic.
4. Que añadir una ficha nueva a `contentData.ts` baste para que su página y su
   entrada en el sitemap aparezcan en el siguiente despliegue.

## No objetivos

- Reescribir la aplicación como sitio renderizado en servidor. La aplicación
  actual funciona y no se toca su arquitectura.
- Generar páginas para países o géneros sin ficha propia. Un texto de relleno
  repetido con el nombre cambiado es justo el patrón que AdSense señala como
  contenido de poco valor.
- Listados en vivo dentro de estas páginas. Sus emisoras son una foto tomada
  durante el build.

## Decisiones

### Direcciones

| Tipo | Ruta | Clave en la API |
|---|---|---|
| País | `/radio/venezuela` | `Venezuela` |
| País | `/radio/espana` | `Spain` |
| País | `/radio/usa` | `USA` |
| País | `/radio/mexico` | `Mexico` |
| País | `/radio/argentina` | `Argentina` |
| País | `/radio/colombia` | `Colombia` |
| Género | `/genero/lofi` | `lofi` |
| Género | `/genero/jazz` | `jazz` |
| Género | `/genero/rock` | `rock` |
| Género | `/genero/dance` | `dance` |
| Género | `/genero/latina` | `latin` |
| Género | `/genero/podcast` | `podcast` |
| Género | `/genero/electronica` | `electronic` |
| Género | `/genero/bts` | `bts` (por nombre, no por etiqueta) |

Los slugs van sin acentos ni eñes para que sobrevivan a cualquier copia y pegado.
La correspondencia entre slug, tipo y clave de la API vive en una única tabla
dentro del generador, de modo que no haya que buscarla en varios sitios.

### Generación

El script `scripts/build-pages.mjs` se ejecuta después de `vite build`, sobre la
carpeta `dist/`. El comando pasa a ser:

```json
"build": "vite build && node scripts/build-pages.mjs"
```

El script lee las fichas del propio `src/data/contentData.ts` —transpilado al
vuelo con **esbuild**, que ya viene incluido con Vite— para no duplicar los
textos en ningún otro archivo.

Para cada entrada de la tabla:

1. Pide a `https://all.api.radio-browser.info/json/stations/search` hasta **30
   emisoras**, con los mismos criterios que usa la aplicación (`hidebroken`,
   orden por `clickcount` descendente, `is_https`), identificándose con una
   cabecera `User-Agent` como pide esa API. El parámetro de búsqueda depende del
   tipo de ficha: `country` para los países, `tag` para los géneros y `name`
   para BTS, que es un artista y no una etiqueta.
2. Renderiza el HTML con la función pura `renderPage()`.
3. Escribe `dist/<tipo>/<slug>/index.html`.

Por último regenera `dist/sitemap.xml` con la portada, las secciones de la
aplicación, las páginas legales y las catorce páginas nuevas.

### Contenido de cada página

- Cabecera con el logotipo enlazado a la portada.
- `<h1>` con el título de la ficha.
- La descripción de la ficha, y su dato curioso como nota al margen cuando
  existe.
- Índice de emisoras con la misma disposición que la aplicación: posición,
  nombre, procedencia y calidad de transmisión.
- Un enlace destacado **«Escuchar en SonicWave»** hacia `/?country=Venezuela`,
  `/?tag=jazz` o `/?name=bts`, según el tipo de ficha.
- Enlaces a las otras trece páginas, separados en países y géneros.
- Pie con los enlaces legales.

En el `<head>`: título y descripción propios tomados de la ficha, `canonical`,
Open Graph, el código de AdSense, la etiqueta `google-adsense-account` y un
bloque JSON-LD de tipo `CollectionPage` cuyo `mainEntity` es un `ItemList` de
`RadioStation`. Solo se declara lo que la página realmente contiene.

### Estilos

Las páginas generadas y las tres páginas legales comparten una hoja
`public/pages.css`, que sustituye a `public/legal.css` (mismo contenido más las
reglas del índice de emisoras). Es CSS plano: estas páginas deben verse sin
JavaScript y sin depender de servicios externos.

### Integración con la aplicación

- `App.tsx` aprende a leer `?country=`, `?tag=` y `?name=` al arrancar y lanza
  esa búsqueda, junto al código que ya interpreta `?view=`. Sin esto, el enlace
  «Escuchar en SonicWave» dejaría al visitante en la portada genérica.
- El pie de la aplicación gana una columna **«Radio por países»** con enlaces a
  las páginas nuevas, que es como el rastreador las descubre desde la portada.

## Arquitectura

```
scripts/
  build-pages.mjs        Orquesta: carga fichas, pide emisoras, escribe archivos
  lib/
    pages-data.mjs       Tabla de slugs y carga de contentData.ts vía esbuild
    render-page.mjs      Función pura: (ficha, emisoras, slug) -> HTML
    render-sitemap.mjs   Función pura: (rutas) -> XML
```

La separación importa para las pruebas: `render-page.mjs` y
`render-sitemap.mjs` no tocan red ni disco, así que se prueban con datos de
ejemplo. `build-pages.mjs` es el único que hace entrada y salida.

## Flujo de datos

```
contentData.ts ──esbuild──> fichas ──┐
                                     ├──> renderPage() ──> dist/<tipo>/<slug>/index.html
Radio Browser API ──fetch──> emisoras┘

tabla de slugs ──> renderSitemap() ──> dist/sitemap.xml
```

## Errores

- **La API no responde o tarda más de 10 segundos.** La página se genera sin
  índice de emisoras, con un texto que invita a abrir la aplicación, y el script
  avisa por consola. El build termina con éxito: un servidor ajeno caído no
  puede impedir un despliegue.
- **Una ficha sin dato curioso.** La nota al margen se omite.
- **`dist/` no existe.** El script termina con error explícito, porque significa
  que `vite build` no se ha ejecutado antes.

## Pruebas

En `scripts/lib/__tests__/`:

1. `renderPage()` incluye el título, la descripción y el dato curioso de la
   ficha.
2. `renderPage()` incluye una fila por emisora, con nombre y calidad.
3. `renderPage()` sin emisoras (API caída) genera una página válida, con su
   texto y sin índice vacío ni listas rotas.
4. `renderPage()` enlaza a las otras páginas y nunca a sí misma.
5. El JSON-LD generado es analizable y declara tantos elementos como emisoras.
6. `renderSitemap()` contiene las catorce rutas nuevas y las existentes.
7. El HTML escapa correctamente comillas y símbolos en nombres de emisora, que
   vienen de una fuente externa.

Y la verificación de siempre: `npm test`, `npm run build` y revisión en el
navegador de al menos una página de país y una de género, con y sin red.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El build depende de una API externa | Si falla, la página sale sin listado y el build continúa |
| Los listados envejecen entre despliegues | Son un complemento al índice en vivo de la aplicación; cada despliegue los refresca |
| Nombres de emisora con HTML o comillas | Se escapan; hay una prueba dedicada |
| Duplicación con el contenido de la aplicación | Las páginas llevan texto propio que la aplicación no muestra de esa forma |

## Fuera de alcance

Rutas limpias para las secciones existentes (`/explorar` en lugar de
`?view=EXPLORE`), páginas por emisora individual y traducción a otros idiomas.
