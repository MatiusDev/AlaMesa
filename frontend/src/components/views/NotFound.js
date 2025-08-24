/**
 * @description
 * Componente por defecto para rutas no encontradas.
 */
const NotFoundComponent = () => ({
  state: {},
  actions: {},
  view: () => `
    <section class="py-12">
      <div class="container mx-auto text-center">
        <h1 class="text-4xl font-bold">404 - Not Found</h1>
        <p class="text-xl text-gray-500 mt-2">La página que buscas no existe.</p>
      </div>
    </section>
  `,
});

export default NotFoundComponent;
