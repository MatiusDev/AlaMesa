// frontend/src/index.js
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@/index.css';
import { createRoot } from '@core/renderer.js';
import App from '@components/App.js';

// No se necesita DOMContentLoaded.
// 1. El script se carga al final del <body> en index.html, por lo que el DOM ya está listo.
// 2. Los scripts con `type="module"` se difieren por defecto, ejecutándose después del parseo del HTML.

// createRoot maneja internamente el caso de que el elemento no se encuentre.
createRoot(document.getElementById('app')).render(App);
