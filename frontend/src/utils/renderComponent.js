// frontend/src/utils/renderComponent.js

/**
 * Renderiza una instancia de componente.
 * @param {object} componentInstance - La instancia del componente, que debe tener las propiedades `view`, `state` y `actions`.
 * @returns {string} El string de HTML renderizado del componente.
 */
export const renderComponent = (componentInstance) => {
  // Se comprueba si la instancia es válida y tiene un método view.
  if (!componentInstance || typeof componentInstance.view !== 'function') {
    console.error('Se intentó renderizar un componente inválido:', componentInstance);
    return ''; // Devuelve un string vacío para no romper el renderizado.
  }

  // Llama a la vista del componente. La vista usará su clausura (closure)
  // para acceder a su propio estado y acciones.
  return componentInstance.view();
};
