const Auth = () => {
  const state = { mode: 'login' };
  const actions = {
    switchToLogin: () => { state.mode = 'login'; },
    switchToRegister: () => { state.mode = 'register'; },
    submit: (e) => { e.preventDefault(); alert('Acción no implementada'); },
  };

  const view = () => `
    <section class="mx-auto max-w-md px-4 pt-28 pb-10">
      <div class="rounded-[var(--am-radius)] border border-neutral-200 bg-white p-6 shadow-soft">
        <div class="flex gap-2 mb-6">
          <button class="flex-1 rounded-full px-4 py-2 ${state.mode==='login' ? 'bg-am-600 text-white' : 'bg-neutral-100'}" data-onclick="switchToLogin">Iniciar sesión</button>
          <button class="flex-1 rounded-full px-4 py-2 ${state.mode==='register' ? 'bg-am-600 text-white' : 'bg-neutral-100'}" data-onclick="switchToRegister">Registrarse</button>
        </div>
        <form data-onsubmit="submit" class="space-y-3">
          ${state.mode==='register' ? '<input class="w-full rounded border border-neutral-300 px-4 py-2" placeholder="Nombre" />' : ''}
          <input class="w-full rounded border border-neutral-300 px-4 py-2" placeholder="Email" />
          <input class="w-full rounded border border-neutral-300 px-4 py-2" placeholder="Contraseña" type="password" />
          <button class="w-full rounded-full bg-am-600 hover:bg-am-700 text-white py-2">${state.mode==='login' ? 'Entrar' : 'Crear cuenta'}</button>
        </form>
      </div>
    </section>
  `;

  return { state, actions, view };
};

export default Auth; 