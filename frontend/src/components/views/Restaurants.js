const Restaurants = () => {
  const state = {};
  const actions = {};

  const view = () => {
    return `
      <section class="py-12">
        <div class="container mx-auto">
          <h1 class="text-4xl font-bold text-center">Restaurantes</h1>
          <p class="text-xl text-gray-500 mt-2 text-center">Aquí se mostrará la gestión de restaurantes.</p>
        </div>
      </section>
    `;
  };

  return { state, actions, view };
};

export default Restaurants;
