const Modal = () => {
  const state = {
    isOpen: false,
    title: '',
    content: '',
    onSave: null,
  };

  const actions = {
    open: ({ title, content, onSave }) => {
      state.isOpen = true;
      state.title = title;
      state.content = content;
      state.onSave = onSave; // Guarda el callback
    },
    close: () => {
      state.isOpen = false;
      state.title = '';
      state.content = '';
      state.onSave = null;
    },
    save: () => {
      if (typeof state.onSave === 'function') {
        state.onSave();
      }
      actions.close(); // Llama a la acción de cerrar
    }
  };

  const view = () => {
    if (!state.isOpen) {
      return '';
    }

    return `
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
          <div class="mt-3 text-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">${state.title}</h3>
            <div class="mt-2 px-7 py-3 text-left">
              ${state.content}
            </div>
            <div class="items-center px-4 py-3">
              <button data-onclick="save" class="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300">Guardar</button>
              <button data-onclick="close" class="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-auto ml-4 shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  return { state, actions, view };
};

export default Modal;
