// frontend/src/core/dom-diff.js

/**
 * Compara dos nodos y aplica los cambios del nuevo nodo al nodo antiguo.
 * @param {Node} oldNode - El nodo actual en el DOM.
 * @param {Node} newNode - El nuevo nodo virtual a comparar.
 */
function diff(oldNode, newNode) {
  // Si el nuevo nodo no existe, eliminamos el nodo antiguo.
  if (!newNode) {
    oldNode.remove();
    return;
  }

  // Si los nodos son de diferente tipo o tag, reemplazamos el antiguo por el nuevo.
  if (oldNode.nodeType !== newNode.nodeType || oldNode.tagName !== newNode.tagName) {
    oldNode.replaceWith(newNode);
    return;
  }

  // Si es un nodo de texto, actualizamos el contenido si es diferente.
  if (oldNode.nodeType === Node.TEXT_NODE) {
    if (oldNode.textContent !== newNode.textContent) {
      oldNode.textContent = newNode.textContent;
    }
    return; // Terminamos aquí para nodos de texto.
  }

  // Si no es un nodo de elemento, no tiene atributos ni hijos que comparar.
  // Esto maneja de forma segura los Comentarios y otros tipos de nodos.
  if (oldNode.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  // A partir de aquí, estamos seguros de que es un ELEMENT_NODE.
  // Actualizamos los atributos.
  diffAttributes(oldNode, newNode);

  // Si el elemento tiene un atributo 'data-no-diff', no tocamos a sus hijos.
  // Esto es útil para librerías de terceros (como Google Maps) que manejan su propio DOM.
  if (oldNode.hasAttribute('data-no-diff')) {
    return;
  }

  // Y finalmente, comparamos los hijos de forma recursiva.
  diffChildren(oldNode, newNode);
}

/**
 * Compara y actualiza los atributos de un nodo.
 * @param {Element} oldNode 
 * @param {Element} newNode 
 */
function diffAttributes(oldNode, newNode) {
  const oldAttrs = oldNode.attributes;
  const newAttrs = newNode.attributes;

  // Eliminar atributos que ya no existen en el nuevo nodo.
  for (let i = oldAttrs.length - 1; i >= 0; i--) {
    const attr = oldAttrs[i];
    if (!newNode.hasAttribute(attr.name)) {
      oldNode.removeAttribute(attr.name);
    }
  }

  // Añadir o actualizar atributos del nuevo nodo.
  for (const attr of newAttrs) {
    if (oldNode.getAttribute(attr.name) !== attr.value) {
      oldNode.setAttribute(attr.name, attr.value);
    }
  }
}

/**
 * Compara y actualiza los nodos hijos.
 * @param {Element} oldNode 
 * @param {Element} newNode 
 */
function diffChildren(oldNode, newNode) {
  const oldChildren = Array.from(oldNode.childNodes);
  const newChildren = Array.from(newNode.childNodes);
  const maxLength = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    // Si no hay hijo antiguo, añadimos el nuevo.
    if (!oldChild) {
      oldNode.appendChild(newChild);
    } 
    // Si no hay hijo nuevo, eliminamos el antiguo.
    else if (!newChild) {
      oldNode.removeChild(oldChild);
    } 
    // Si ambos existen, los comparamos.
    else {
      diff(oldChild, newChild);
    }
  }
}

/**
 * La función principal que exportamos. Convierte el string de HTML en un DOM virtual
 * y luego llama a la función de diffing.
 * @param {Element} domNode - El nodo real del DOM a actualizar.
 * @param {string} newHtml - El nuevo contenido en formato string HTML.
 */
export const updateDOM = (domNode, newHtml) => {
  const virtualNode = document.createElement(domNode.tagName);
  virtualNode.innerHTML = newHtml;

  diff(domNode, virtualNode);
};
