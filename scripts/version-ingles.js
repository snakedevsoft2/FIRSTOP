/* Genera la versión en inglés del sitio (en/index.html) a partir de index.html.

   Uso:  node scripts/version-ingles.js

   En index.html cada texto en español lleva al lado su traducción:
     data-en="..."             texto del elemento
     data-en-html='...'        contenido con etiquetas (títulos con resaltado)
     data-en-aria-label, data-en-alt, data-en-title, data-en-content, data-en-href   atributos
   Este script pone el inglés en su lugar y guarda el español en data-es* (para el botón "Español").
   Así Google encuentra la página en inglés en su propia dirección (/en/).
   Después de cambiar index.html, vuelve a correrlo para actualizar /en/. */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ATTRS = ['aria-label', 'alt', 'title', 'content', 'href'];

// Textos de los datos estructurados (lo que lee Google) que no se ven en la página
const LD_EN = {
  'Lavandería, dry cleaning, planchado y sastrería en Río Grande, Puerto Rico, con recogido y entrega a domicilio en el área este.':
    'Laundry, dry cleaning, pressing and tailoring in Río Grande, Puerto Rico, with home pickup and delivery in eastern Puerto Rico.',
  'Servicios de lavandería y sastrería': 'Laundry and tailoring services',
  'Lavado y doblado': 'Wash and fold',
  'Ropa del diario lavada, secada y doblada.': 'Everyday clothes washed, dried and folded.',
  'Dry cleaning y planchado': 'Dry cleaning and pressing',
  'Limpieza en seco y planchado a vapor de trajes, vestidos, camisas y guayaberas.':
    'Dry cleaning and steam pressing of suits, dresses, shirts and guayaberas.',
  'Sastrería y alteraciones': 'Tailoring and alterations',
  'Ruedos, cambios de zipper, entalles y ajustes a la medida.': 'Hems, zipper replacements, taking in and custom fittings.',
  'Lavado de comforters y ropa de cama': 'Comforter and bedding cleaning',
  'Comforters, sábanas y cortinas lavados y empacados.': 'Comforters, sheets and curtains washed and packed.',
  'Lavandería para hoteles y Airbnbs': 'Laundry service for hotels and Airbnbs',
  'Sábanas y toallas para alojamientos con recogido y entrega.': 'Sheets and towels for rentals, with pickup and delivery.',
  'Recogido y entrega a domicilio': 'Home pickup and delivery',
  'Recogido y entrega de lunes a sábado en el área este de Puerto Rico.': 'Pickup and delivery Monday to Saturday in eastern Puerto Rico.',
  'Entrada accesible para silla de ruedas': 'Wheelchair-accessible entrance',
  'Estacionamiento accesible': 'Wheelchair-accessible parking',
};

const fail = (msg) => { console.error(`ERROR: ${msg}`); process.exit(1); };
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

// Etiqueta de apertura con sus atributos (los valores pueden llevar ">" dentro de comillas)
const TAG = /<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
const ATTR = /([^\s"'>/=]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

const parseAttrs = (raw) => {
  const list = [];
  let m;
  ATTR.lastIndex = 0;
  while ((m = ATTR.exec(raw))) {
    const value = m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : m[5];
    list.push({ name: m[1].toLowerCase(), value: value === undefined ? null : value, quote: m[4] !== undefined ? "'" : '"' });
  }
  return list;
};
const quoteAttr = (name, value, quote) => {
  if (value === null) return name;
  const q = quote === "'" && !value.includes("'") ? "'" : value.includes('"') ? "'" : '"';
  return `${name}=${q}${q === '"' ? value.replace(/"/g, '&quot;') : value.replace(/'/g, '&#39;')}${q}`;
};
const buildTag = (name, attrs, selfClose) => `<${name}${attrs.map((a) => ` ${quoteAttr(a.name, a.value, a.quote)}`).join('')}${selfClose ? ' /' : ''}>`;

// Posición de la etiqueta de cierre que corresponde (considerando etiquetas iguales anidadas)
const findClose = (html, name, from) => {
  const re = new RegExp(`<(/?)${name}\\b[^>]*>`, 'gi');
  re.lastIndex = from;
  let depth = 1;
  let m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return m.index;
  }
  return -1;
};

const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
let out = '';
let cursor = 0;
const count = { texto: 0, html: 0, atributos: 0 };
let m;
TAG.lastIndex = 0;
while ((m = TAG.exec(src))) {
  const [whole, name, rawAttrs, selfClose] = m;
  if (!/\sdata-en(-|=|\s|>)/.test(` ${rawAttrs}>`)) continue;
  const attrs = parseAttrs(rawAttrs);
  const get = (n) => attrs.find((a) => a.name === n);
  const tagEnd = m.index + whole.length;

  // Atributos: el inglés pasa al atributo y el español queda en data-es-*
  ATTRS.forEach((attr) => {
    const en = get(`data-en-${attr}`);
    if (!en) return;
    const cur = get(attr);
    if (!cur) fail(`<${name}> tiene data-en-${attr} pero no ${attr}`);
    if (!get(`data-es-${attr}`)) attrs.push({ name: `data-es-${attr}`, value: cur.value, quote: cur.quote });
    cur.value = en.value;
    cur.quote = en.quote;
    count.atributos += 1;
  });

  const enText = get('data-en');
  const enHtml = get('data-en-html');
  if (enText || enHtml) {
    const close = findClose(src, name, tagEnd);
    if (close < 0) fail(`no se encontró el cierre de <${name}> en la posición ${m.index}`);
    const inner = src.slice(tagEnd, close);
    if (enText) {
      if (inner.includes('<')) fail(`<${name} data-en="${enText.value}"> debe tener solo texto (tiene etiquetas dentro)`);
      attrs.push({ name: 'data-es', value: inner, quote: '"' });
      out += src.slice(cursor, m.index) + buildTag(name, attrs, selfClose) + enText.value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      count.texto += 1;
    } else {
      attrs.push({ name: 'data-es-html', value: inner.replace(/&/g, '&amp;'), quote: "'" });
      out += src.slice(cursor, m.index) + buildTag(name, attrs, selfClose) + enHtml.value;
      count.html += 1;
    }
    cursor = close;
    TAG.lastIndex = close;
  } else {
    out += src.slice(cursor, m.index) + buildTag(name, attrs, selfClose);
    cursor = tagEnd;
  }
}
out += src.slice(cursor);

// Idioma de la página y botón "English" marcado
const swap = (from, to) => {
  if (!out.includes(from)) fail(`no se encontró: ${from}`);
  out = out.replace(from, to);
};
swap('<html lang="es-PR">', '<html lang="en">');
swap('data-lang="es" aria-pressed="true"', 'data-lang="es" aria-pressed="false"');
swap('data-lang="en" aria-pressed="false"', 'data-lang="en" aria-pressed="true"');
out = out.replace(/<!-- Versión en inglés \(\/en\/\):[\s\S]*?-->/,
  '<!-- ARCHIVO GENERADO desde index.html con "node scripts/version-ingles.js". No lo edites a mano:\n       cambia index.html (y su texto data-en) y vuelve a correr el script. -->');

// La página vive en /en/: los archivos están una carpeta más arriba
out = out.replace(/(=\s*["'])(assets\/|site\.webmanifest)/g, '$1../$2');

// Datos estructurados en inglés
const titleEn = decode(/<title\b[^>]*>([^<]*)<\/title>/.exec(out)[1]);
const descEn = decode(/<meta name="description" content="([^"]*)"/.exec(out)[1]);
const titleEs = decode(/<title\b[^>]*\sdata-es="([^"]*)"/.exec(out)[1]);
const descEs = decode(/<meta name="description"[^>]*\sdata-es-content="([^"]*)"/.exec(out)[1]);
const LD = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/;
const ldMatch = LD.exec(out);
if (!ldMatch) fail('no se encontraron los datos estructurados (application/ld+json)');
let ld;
try { ld = JSON.parse(ldMatch[2]); } catch (e) { fail(`los datos estructurados de index.html no son JSON válido: ${e.message}`); }
const missing = new Set();
const translate = (node) => {
  if (Array.isArray(node)) return node.map(translate);
  if (!node || typeof node !== 'object') return node;
  const res = {};
  Object.entries(node).forEach(([k, v]) => {
    if (typeof v === 'string' && (k === 'name' || k === 'description')) {
      if (v === titleEs) res[k] = titleEn;
      else if (v === descEs) res[k] = descEn;
      else if (LD_EN[v]) res[k] = LD_EN[v];
      else { res[k] = v; if (k === 'description') missing.add(v); }
    } else {
      res[k] = translate(v);
    }
  });
  return res;
};
ld = translate(ld);
const page = ld['@graph'].find((n) => n['@type'] === 'WebPage');
if (!page) fail('falta el nodo WebPage en los datos estructurados');
page['@id'] = page['@id'].replace(/\/#/, '/en/#');
page.url = new URL('en/', page.url).href;
page.inLanguage = 'en';
const ldText = JSON.stringify(ld, null, 2).split('\n').map((l) => `  ${l}`).join('\n');
out = out.replace(LD, (_, open, __, close) => `${open}\n${ldText}\n  ${close}`);

fs.mkdirSync(path.join(ROOT, 'en'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'en', 'index.html'), out);
console.log(`Listo: en/index.html (${count.texto} textos, ${count.html} títulos y ${count.atributos} atributos en inglés)`);
if (missing.size) {
  console.warn('Aviso: estos textos de los datos estructurados no tienen traducción (agrégalos en LD_EN):');
  missing.forEach((t) => console.warn(`  - ${t}`));
}
