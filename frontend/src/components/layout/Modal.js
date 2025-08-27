const Modal = () => {
  const state = { open: false, title: '', content: '' };

  const actions = {
    open: ({ title = '', content = '' } = {}) => { state.open = true; state.title = title; state.content = content; },
    close: () => { state.open = false; },
  };

  const view = () => `
    ${state.open ? `
    <div class="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
      <div class="w-full max-w-lg rounded-[var(--am-radius)] bg-white dark:bg-neutral-900 p-6 shadow-soft">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">${state.title}</h3>
          <button class="h-9 w-9 grid place-items-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="Cerrar" data-onclick="close">✕</button>
        </div>
        <div class="mt-4">${state.content}</div>
      </div>
    </div>` : ''}
  `;

  return { state, actions, view };
};

export default Modal;
