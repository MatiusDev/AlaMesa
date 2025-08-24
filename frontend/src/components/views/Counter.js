const Counter = () => {
  // 1. Estado inicial del componente.
  const state = {
    count: 0,
  };

  // 2. Acciones que pueden modificar el estado.
  const actions = {
    increment: () => {
      console.log('here ++');
      state.count++;
    },
    decrement: () => {
      console.log('here --');
      state.count--;
    },
  };

  // 3. La vista, que es una función pura que devuelve HTML.
  // No necesita parámetros porque accede a `state` y `actions` de su scope padre (clausura).
  const view = () => {
    return `
      <section class="text-center py-12">
        <div class="container mx-auto">
          <h1 class="text-4xl font-bold">Contador: ${state.count}</h1>
          <p class="text-xl text-gray-500 mt-2">Ejemplo de componente con estado.</p>
          <div class="flex justify-center space-x-4 mt-6">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" data-onclick="increment">+</button>
            <button class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded" data-onclick="decrement">-</button>
          </div>
          <a href="#/" class="mt-4 inline-block text-blue-500 hover:underline">Volver al inicio</a>
        </div>
      </section>
    `;
  };

  return { state, actions, view };
};

export default Counter;
