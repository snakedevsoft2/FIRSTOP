# First Stop Laundry & Sastrería — Sitio web

Página de una sola sección (one page) para **Laundry y Dry Cleaning / First Stop Laundry & Sastrería**, en la Carr. PR-3 km 26.5, Río Grande, Puerto Rico.

Publicada en **https://firstop-sigma.vercel.app/**. Es un sitio estático: HTML, CSS y JavaScript sin librerías ni proceso de compilación.

## Estructura

```
index.html                 Página en español (contenido, SEO y datos estructurados)
en/index.html              Página en inglés: se genera desde index.html (no se edita a mano)
scripts/version-ingles.js  Genera en/index.html
assets/css/styles.css      Estilos y animaciones
assets/js/main.js          Menú, idioma ES / EN, videos, profundidad 3D, carro animado y WhatsApp
assets/fonts/              Fuente Nunito (alojada en el sitio) y su licencia
assets/images/             Imágenes (fachada, portada del hero, imagen para redes)
assets/images/servicios/   Una foto por servicio
assets/images/proceso/     Portada de cada video de sección
assets/images/carro/       Capas del carro de lavandería del footer
assets/videos/hero.mp4     Video del hero
assets/videos/proceso/     Un video corto por sección (la historia de la ropa)
assets/icons/              Íconos 3D de redes y favicons
assets/logo/               Logo "1 Stop Laundry" en SVG y PNG
vercel.json                Caché de fuentes, fotos y videos en Vercel
robots.txt, sitemap.xml, site.webmanifest
```

## Logo

El logo es el octágono rojo de **1 Stop Laundry**, dibujado en vector (`assets/logo/logo.svg`), así se ve nítido en cualquier tamaño. Está en el header, en el footer, en los íconos (pestaña del navegador, iPhone y Android: `assets/icons/`), en `assets/logo/logo.png` (el que lee Google) y en la imagen para redes (`assets/images/og-image.jpg`). Dentro de `index.html` va entre `<!-- logo:start -->` y `<!-- logo:end -->`.

## La historia de la ropa (un video por sección)

| Sección | Video | Qué se ve |
| --- | --- | --- |
| Bienvenida | `assets/videos/proceso/ropa-cae.mp4` | La ropa colgada cae y queda en el piso |
| Servicios | `assets/videos/proceso/ropa-recogida.mp4` | Unas manos recogen la ropa |
| Así cuidamos tu ropa | `assets/videos/proceso/ropa-lavadora.mp4` | La ropa entra a la lavadora y se lava |

- **Nunca se paran:** cada video se repite sin cortes (su final se funde con el inicio). Se descarga al acercarse a su sección, se reproduce mientras se ve y se pausa fuera de pantalla para ahorrar batería. Si el iPhone bloquea la reproducción automática (modo de ahorro de batería), el mismo video se muestra como imagen animada, que Safari sí reproduce; si eso tampoco es posible, queda la portada sin el botón de "play".
- **Calidad:** están a su resolución real (1280 × 720) y nunca se muestran más grandes que eso, así no se ven pixeleados. Salen de `proceso-completo.mp4` (que no se sube).
- **Computadora:** los textos van encima del video. Al hacer scroll, el video se mueve más lento que el texto y se inclina un poco, lo que da profundidad 3D.
- **Celular:** diseño propio. El video va completo, a todo el ancho, y los textos quedan arriba o abajo (nunca encima), sin efecto 3D para que se vea nítido.
- Con "reducir movimiento" activado, o con ahorro de datos, se queda la imagen de portada.

## Carro de lavandería (footer)

Un carro con ropa estacionado sobre el mapa, que asoma por encima del footer. Cuando el footer aparece en pantalla, el carro entra rodando. Después gira despacio en 3D, le caen prendas cada pocos segundos y la ropa rebota al recibirlas. Con mouse, el carro sigue al cursor. Está hecho con capas (`assets/images/carro/`): fondo del carro, montón de ropa, prendas que caen y frente del carro, cada una a distinta profundidad para que se note el volumen al girar.

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

Fotos de servicios: horizontales (4:3) y de menos de 150 KB. Videos: MP4 (H.264), 1280 × 720, sin sonido y de menos de 3 MB cada uno.

Los navegadores guardan fotos, íconos y videos por un día (ver `vercel.json`). Si reemplazas uno con el mismo nombre, quien ya visitó la página puede seguir viendo el anterior hasta un día; para que se vea al instante, usa un nombre nuevo y cámbialo también en `index.html`.

## Datos del negocio

| Dato | Dónde se cambia |
| --- | --- |
| Teléfono (787-888-1665) | `index.html`, botón flotante de llamar (busca `7878881665` y `787-888-1665`) |
| WhatsApp (939-655-5329) | `assets/js/main.js` (`WHATSAPP`) y `index.html` (busca `19396555329` y `939-655-5329`) |
| Horario | `index.html` (sección Horario y `openingHoursSpecification`) |
| Facebook e Instagram | `index.html`, en "Canales oficiales" (hoy apuntan a facebook.com e instagram.com) |

## Hero

El hero es solo el video, que se repite sin parar. Cuando termina, la página baja sola a la bienvenida si el visitante lo está mirando; si ya había bajado por su cuenta, la página no se mueve.

## Versión para celular

En celular la página funciona como una app:

- **Una sección por pantalla:** cada sección (hero, bienvenida, nosotros, servicios, proceso y contacto) ocupa exactamente la pantalla, debajo del header, sin que se vea la de arriba.
- **Scroll automático:** al deslizar, la página salta sola a la siguiente sección. El hero, al terminar su video, baja solo a la bienvenida.
- **Header fijo y desplegado:** logo, idioma y las 5 secciones siempre visibles arriba; la sección donde estás queda marcada.
- **Hero vertical:** ocupa toda la pantalla, con el video completo y nítido, un reflejo debajo y una flecha para bajar.
- **Contenido compacto:** los videos se ven completos (más pequeños en pantallas bajas), servicios como 6 fichas que abren WhatsApp, y los pasos del proceso en una fila.
- Se probó en tamaños de iPhone SE, iPhone 14 y iPhone Pro Max.

## Menú, idioma y botones flotantes

- Arriba a la izquierda va el logo, sin fondo. Arriba a la derecha, el botón "Menú": al tocarlo, las secciones se despliegan hacia abajo como un acordeón transparente. Se guarda al elegir una sección, al tocar fuera, con Escape o al seguir bajando.
- Abajo a la derecha están los botones de llamar y WhatsApp. El de llamar muestra solo el teléfono y, al pasar el mouse, se abre con "Llamar 787-888-1665". Al llegar al footer (donde ya están WhatsApp y el teléfono) se esconden, y vuelven al salir.
- Los botones usan el azul de la página.

## Idioma (ES / EN)

El selector Español / English, dentro del menú, cambia toda la página entre español e inglés al instante y recuerda la elección de cada visitante. Los textos en inglés están en `index.html`, junto a cada texto en español: `data-en` (texto), `data-en-html` (títulos con resaltado), `data-en-alt`, `data-en-aria-label`, `data-en-title`, `data-en-content` (título y descripción para Google y redes) y `data-wa-en` (mensaje de WhatsApp). Si cambias un texto, cambia también su versión en inglés.

El inglés también tiene su propia dirección, **/en/**, para que Google la muestre a quien busca en inglés (turistas, dueños de Airbnb). Esa página se genera desde `index.html`. **Después de cualquier cambio en `index.html`, corre:**

```
node scripts/version-ingles.js
```

y sube también `en/index.html`. Los textos de los datos estructurados que no se ven en la página (descripción del negocio y de cada servicio) se traducen en `LD_EN`, dentro del mismo script; si cambias uno en español, el script avisa que falta su traducción.

## Publicar

1. **Vercel:** el proyecto está conectado al repositorio de GitHub; cada `push` a `main` publica los cambios solo.
2. **Dominio:** la dirección oficial es `https://firstop-sigma.vercel.app/`. Si conectas un dominio propio, reemplaza esa dirección en `index.html`, `sitemap.xml` y `robots.txt`, y vuelve a generar la página en inglés.
3. **Google Search Console:** agrega el sitio y envía `sitemap.xml` (incluye las dos versiones, español e inglés).
4. **Perfil de Google Business:** pon la dirección del sitio como "Sitio web" del negocio. El horario, el teléfono y la dirección deben ser los mismos en el perfil y en la página.

Los archivos originales que no usa la página (videos completos y fotos sin optimizar) están en `.gitignore`: siguen en la computadora pero no se suben.

## SEO incluido

- Título, descripción y encabezados con "lavandería", "dry cleaning", "Río Grande" y "Puerto Rico" (y en inglés en /en/).
- Página en español (/) y en inglés (/en/), enlazadas entre sí con `hreflang` y en el `sitemap.xml`, para que Google muestre a cada persona la de su idioma.
- Datos estructurados `DryCleaningOrLaundry` (dirección, coordenadas, horario, servicios, pueblos atendidos, idiomas y los nombres "1 Stop Laundry" y "Laundry y Dry Cleaning"), más `WebSite` y `WebPage`, en cada idioma.
- Etiquetas geográficas de Puerto Rico, Open Graph y Twitter Card con imagen para compartir.
- Imágenes optimizadas (WebP/JPG) con `alt` descriptivo, carga diferida y videos que se descargan solo al acercarse.
- Textos con buen contraste (accesibilidad 100 en Lighthouse). Respeta la opción "reducir movimiento" del sistema y funciona sin JavaScript.

## Velocidad

- La fuente Nunito está alojada en el sitio y se pide primero (antes venía de Google Fonts y retrasaba la primera imagen).
- La portada del hero se pide con prioridad alta; el video del hero pesa 2.3 MB (sin pista de audio, misma nitidez).
- Las portadas y los videos de las secciones se descargan solo al acercarse a cada sección.
- Fuente, fotos, íconos y videos quedan guardados en el navegador (`vercel.json`), así las visitas siguientes cargan más rápido.
- Resultado en Lighthouse: 100 en velocidad, accesibilidad, buenas prácticas y SEO.
