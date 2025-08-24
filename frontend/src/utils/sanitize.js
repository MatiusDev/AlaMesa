// frontend/src/utils/sanitize.js

/**
 * Sanitiza un string para prevenir ataques XSS al insertarlo con innerHTML.
 * Convierte los caracteres especiales de HTML en sus entidades correspondientes.
 * @param {string} dirtyString - El string que podría contener HTML malicioso.
 * @returns {string} El string sanitizado y seguro para ser renderizado.
 */
export const sanitize = (dirtyString) => {
  if (typeof dirtyString !== 'string') {
    return dirtyString; // Devuelve el valor original si no es un string
  }

  // Un truco común y efectivo: usar el DOM para sanitizar.
  // 1. Se crea un elemento temporal en memoria.
  const tempDiv = document.createElement('div');
  // 2. Se asigna el string como contenido de TEXTO. El navegador automáticamente
  // escapa cualquier caracter de HTML que contenga.
  tempDiv.textContent = dirtyString;
  // 3. Se lee el innerHTML del elemento. Este contendrá el string con los
  // caracteres ya escapados (ej: '<' se convierte en '&lt;').
  return tempDiv.innerHTML;
};
