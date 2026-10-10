# First Stop Laundry & Sastrería — Sitio web

Página de una sola sección (one page) para **Laundry y Dry Cleaning / First Stop Laundry & Sastrería**, en la Carr. PR-3 km 26.5, Río Grande, Puerto Rico.

Es un sitio estático: HTML, CSS y JavaScript sin librerías ni proceso de compilación. Se puede subir tal cual a GitHub Pages, Netlify, Vercel o cualquier hosting.

## Estructura

```
index.html                 Página (contenido, SEO y datos estructurados)
assets/css/styles.css      Estilos y animaciones
assets/js/main.js          Menú, idioma ES / EN, videos, profundidad 3D, animaciones y WhatsApp
assets/images/             Imágenes (fachada, portada del hero, imagen para redes)
assets/images/servicios/   Una foto por servicio
assets/images/proceso/     Portada de cada video de sección
assets/videos/hero.mp4     Video del hero
assets/videos/proceso/     Un video corto por sección (la historia de la ropa)
assets/icons/              Íconos 3D de redes y favicons
assets/logo/               Logo en SVG (color, blanco e ícono) y PNG
robots.txt, sitemap.xml, site.webmanifest
```

## La historia de la ropa (un video por sección, con los textos encima)

Cada sección tiene un video corto de fondo y sus textos van superpuestos. El video se descarga solo al acercarse a su sección, se reproduce una vez al llegar y se queda en su último cuadro (la ropa "se queda ahí"). Al salir de pantalla vuelve al inicio para verse de nuevo. Al hacer scroll, el video se mueve más lento que el texto y se inclina un poco, lo que da profundidad 3D.

| Sección | Video | Qué se ve |
| --- | --- | --- |
| Bienvenida | `assets/videos/proceso/ropa-cae.mp4` | La ropa colgada cae detrás de las letras y queda en el piso |
| Servicios | `assets/videos/proceso/ropa-recogida.mp4` | Unas manos recogen la ropa |
| Así cuidamos tu ropa | `assets/videos/proceso/ropa-lavadora.mp4` | La ropa entra a la lavadora y se lava |
| Reseñas | `assets/videos/proceso/ropa-lista.mp4` | Doblado, sastrería, planchado y ropa lista |

- Los cuatro videos salen de `proceso-completo.mp4`, recortados y comprimidos (unos 2 MB entre todos).
- Las escenas con fondo blanco se funden con el color de la sección; las demás se recortan en un óvalo suave, con un velo claro detrás del texto.
- Con "reducir movimiento" activado, o con ahorro de datos, cada video se queda quieto en su último cuadro.

## Cambiar fotos y videos

Para cambiar una foto o un video, reemplaza el archivo y **conserva el mismo nombre**:

| Qué | Archivo |
| --- | --- |
| Video del hero | `assets/videos/hero.mp4` |
| Imagen que se ve mientras carga el hero | `assets/images/hero-poster.webp` |
| Videos de las secciones | `assets/videos/proceso/*.mp4` (y su portada en `assets/images/proceso/`) |
| Lavado y doblado | `assets/images/servicios/lavado-y-doblado.jpg` |
| Dry cleaning y planchado | `assets/images/servicios/dry-cleaning-planchado.jpg` |
| Sastrería y alteraciones | `assets/images/servicios/sastreria-alteraciones.jpg` |
| Comforters y ropa de cama | `assets/images/servicios/comforters-ropa-de-cama.jpg` |
| Hoteles y Airbnbs | `assets/images/servicios/hoteles-y-airbnb.jpg` |
| Recogido y entrega | `assets/images/servicios/recogido-y-entrega.jpg` |
| Foto de Nosotros | `assets/images/fachada-laundry-dry-cleaning-rio-grande.webp` |

Fotos de servicios: horizontales (4:3) y de menos de 150 KB. Videos: MP4 (H.264), cortos, sin sonido y de menos de 2 MB cada uno.

## Datos del negocio

| Dato | Dónde se cambia |
| --- | --- |
| Teléfono (787-888-1665) | `index.html`, botón flotante de llamar (busca `7878881665` y `787-888-1665`) |
| WhatsApp (939-655-5329) | `assets/js/main.js` (`WHATSAPP`) y `index.html` (busca `19396555329` y `939-655-5329`) |
| Horario | `index.html` (sección Horario y `openingHoursSpecification`) |
| Facebook e Instagram | `index.html`, en "Canales oficiales" (hoy apuntan a facebook.com e instagram.com) |
| Reseñas | `index.html`, sección Reseñas (son reseñas reales de Google Maps) |

## Hero

El hero es solo el video. Cuando termina, la página baja sola a la bienvenida. Si el visitante vuelve arriba, el video empieza de nuevo. Si ya había bajado por su cuenta, la página no se mueve.

## Menú, idioma y botones flotantes

- Arriba a la izquierda va el logo, sin fondo. Arriba a la derecha, el botón "Menú": al tocarlo, las secciones se despliegan hacia abajo como un acordeón transparente. Se guarda al elegir una sección, al tocar fuera, con Escape o al seguir bajando.
- Abajo a la derecha están los botones de llamar y WhatsApp. El de llamar muestra solo el teléfono y, al pasar el mouse, se abre con "Llamar 787-888-1665".
- Los botones usan el azul de la página.

## Idioma (ES / EN)

El selector Español / English, dentro del menú, cambia toda la página entre español e inglés y recuerda la elección de cada visitante. Los textos en inglés están en `index.html`, junto a cada texto en español: `data-en` (texto), `data-en-html` (títulos con resaltado), `data-en-alt`, `data-en-aria-label`, `data-en-title` y `data-wa-en` (mensaje de WhatsApp). Si cambias un texto, cambia también su versión en inglés.

## Publicar

1. **GitHub Pages:** en el repositorio, abre *Settings → Pages* y elige la rama `main` y la carpeta raíz.
2. **Dominio:** el sitio usa `https://snakedevsoft2.github.io/FIRSTOP/` como dirección oficial. Si se usa un dominio propio, reemplaza esa dirección en `index.html`, `sitemap.xml` y `robots.txt`.
3. **Google Search Console:** agrega el sitio y envía `sitemap.xml`.
4. **Perfil de Google Business:** pon la nueva dirección del sitio como "Sitio web" del negocio.

Los archivos originales que no usa la página (videos completos y fotos sin optimizar) están en `.gitignore`: siguen en la computadora pero no se suben.

## SEO incluido

- Título, descripción y encabezados con "lavandería", "dry cleaning", "Río Grande" y "Puerto Rico".
- Datos estructurados `DryCleaningOrLaundry` (dirección, coordenadas, horario, servicios, pueblos atendidos).
- Etiquetas geográficas de Puerto Rico, Open Graph y Twitter Card con imagen para compartir.
- Imágenes optimizadas (WebP/JPG) con `alt` descriptivo, carga diferida y videos que se descargan solo al acercarse.
- Respeta la opción "reducir movimiento" del sistema y funciona sin JavaScript.
