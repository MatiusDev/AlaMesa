// frontend/src/components/layout/Footer.js

const Footer = () => {
  const state = {
    currentYear: new Date().getFullYear(),
    socialLinks: [
      { name: 'Facebook', icon: 'fab fa-facebook-f', url: 'https://facebook.com/alamesa' },
      { name: 'Instagram', icon: 'fab fa-instagram', url: 'https://instagram.com/alamesa' },
      { name: 'Twitter', icon: 'fab fa-twitter', url: 'https://twitter.com/alamesa' },
      { name: 'LinkedIn', icon: 'fab fa-linkedin-in', url: 'https://linkedin.com/company/alamesa' }
    ],
    footerLinks: {
      'Restaurantes': [
        { name: 'Registrar Restaurante', url: '#/register-restaurant' },
        { name: 'Panel de Control', url: '#/dashboard' },
        { name: 'Estadísticas', url: '#/analytics' },
        { name: 'Soporte', url: '#/support' }
      ],
      'Usuarios': [
        { name: 'Buscar Restaurantes', url: '#/restaurants' },
        { name: 'Mis Reservas', url: '#/my-bookings' },
        { name: 'Favoritos', url: '#/favorites' },
        { name: 'Historial', url: '#/history' }
      ],
      'Empresa': [
        { name: 'Sobre Nosotros', url: '#/about' },
        { name: 'Nuestro Equipo', url: '#/team' },
        { name: 'Carreras', url: '#/careers' },
        { name: 'Prensa', url: '#/press' }
      ],
      'Soporte': [
        { name: 'Centro de Ayuda', url: '#/help' },
        { name: 'Contacto', url: '#/contact' },
        { name: 'Reportar Problema', url: '#/report-issue' },
        { name: 'FAQ', url: '#/faq' }
      ]
    },
    contactInfo: {
      phone: '+57 300 123 4567',
      email: 'hola@alamesa.com',
      address: 'Medellín, Antioquia, Colombia'
    }
  };

  const view = () => {
    return `
      <footer class="bg-white border-t border-gray-200">
        <!-- Main Footer Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <!-- Top Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <!-- Brand Section -->
            <div class="lg:col-span-2">
              <div class="flex items-center mb-6">
                <div class="w-16 h-16 bg-white rounded-xl flex items-center justify-center mr-4 shadow-soft">
                  <img src="/assets/AlaMesa.jpeg" alt="AlaMesa Logo" class="w-14 h-14 object-contain">
                </div>
                <div>
                  <h3 class="text-2xl font-bold text-gray-900">AlaMesa</h3>
                  <p class="text-gray-600 text-sm">Reserva tu mesa con estilo</p>
                </div>
              </div>
              <p class="text-gray-600 mb-6 leading-relaxed">
                Descubre los mejores restaurantes de Medellín y reserva tu mesa en segundos. 
                Experiencias gastronómicas únicas a un solo clic.
              </p>
              
              <!-- Contact Info -->
              <div class="space-y-3 mb-6">
                <div class="flex items-center text-gray-600">
                  <i class="fas fa-phone w-4 text-am-500 mr-3"></i>
                  <span class="text-sm">${state.contactInfo.phone}</span>
                </div>
                <div class="flex items-center text-gray-600">
                  <i class="fas fa-envelope w-4 text-am-500 mr-3"></i>
                  <span class="text-sm">${state.contactInfo.email}</span>
                </div>
                <div class="flex items-center text-gray-600">
                  <i class="fas fa-map-marker-alt w-4 text-am-500 mr-3"></i>
                  <span class="text-sm">${state.contactInfo.address}</span>
                </div>
              </div>
              
              <!-- Social Media - Centrado -->
              <div class="flex justify-center lg:justify-start">
                <div class="flex space-x-3">
                  ${state.socialLinks.map(social => `
                    <button 
                      onclick="window.open('${social.url}', '_blank', 'noopener,noreferrer')"
                      class="w-9 h-9 bg-gradient-to-br from-am-500 to-am-700 hover:from-am-600 hover:to-am-800 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-lg hover:shadow-xl group"
                      title="${social.name}"
                    >
                      <i class="${social.icon} text-white text-sm transition-transform duration-300 group-hover:scale-110"></i>
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Links Sections - 4 columnas juntas -->
            <div class="lg:col-span-3">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-10">
                <div>
                  <h4 class="text-base font-semibold text-gray-900 mb-4">
                    Restaurantes
                  </h4>
                  <ul class="space-y-3">
                    <li>
                      <button 
                        onclick="window.location.hash = '#/register-restaurant'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Registrar Restaurante
                      </button>
                    </li>
                    <li>
                      <button 
                        onclick="window.location.hash = '#/dashboard'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Panel de Control
                      </button>
                    </li>
                    <li>
                      <button 
                        onclick="window.location.hash = '#/analytics'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Estadísticas
                      </button>
                    </li>
                    <li>
                      <button 
                        onclick="window.location.hash = '#/support'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Soporte
                      </button>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 class="text-base font-semibold text-gray-900 mb-4">
                    Usuarios
                  </h4>
                  <ul class="space-y-3">
                    <li>
                      <button 
                        onclick="window.location.hash = '#/restaurants'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Buscar Restaurantes
                      </button>
                    </li>
                    <li>
                      <button 
                        onclick="window.location.hash = '#/my-bookings'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Mis Reservas
                      </button>
                    </li>
                    <li>
                      <button 
                        onclick="window.location.hash = '#/favorites'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Favoritos
                      </button>
                    </li>
                    <li>
                      <button 
                        onclick="window.location.hash = '#/history'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Historial
                      </button>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 class="text-base font-semibold text-gray-900 mb-4">
                    Empresa
                  </h4>
                  <ul class="space-y-3">
                    <li>
                      <button 
                        onclick="window.location.hash = '#/about'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Sobre Nosotros
                      </button>
                    </li>
                    <li>
                      <button 
                        onclick="window.location.hash = '#/team'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Nuestro Equipo
                      </button>
                    </li>
                    <li>
                      <button 
                        onclick="window.location.hash = '#/careers'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Carreras
                      </button>
                    </li>
                    <li>
                      <button 
                        onclick="window.location.hash = '#/press'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Prensa
                      </button>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 class="text-base font-semibold text-gray-900 mb-4">
                    Soporte
                  </h4>
                  <ul class="space-y-3">
                    <li>
                      <button 
                        onclick="window.location.hash = '#/help'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Centro de Ayuda
                      </button>
                    </li>
                    <li>
                      <button 
                        onclick="window.location.hash = '#/contact'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Contacto
                      </button>
                    </li>
                    <li>
                      <button 
                        onclick="window.location.hash = '#/report-issue'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        Reportar Problema
                      </button>
                    </li>
                    <li>
                      <button 
                        onclick="window.location.hash = '#/faq'"
                        class="text-gray-600 hover:text-am-600 transition-all duration-300 text-sm hover:underline transform hover:translate-x-1"
                      >
                        FAQ
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Newsletter Section -->
          <div class="bg-am-50 rounded-var(--am-radius) p-8 mb-12 border border-am-200">
            <div class="max-w-2xl mx-auto text-center">
              <h4 class="text-lg font-semibold text-gray-900 mb-2">¡Mantente al día!</h4>
              <p class="text-gray-600 text-sm mb-4">Recibe ofertas exclusivas y novedades de restaurantes</p>
              <div class="flex max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Tu correo electrónico" 
                  class="flex-1 px-4 py-3 rounded-l-var(--am-radius) border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-am-500 focus:border-am-500 text-sm"
                >
                <button class="px-6 py-3 bg-am-500 hover:bg-am-600 text-white font-medium rounded-r-var(--am-radius) transition-all duration-300 transform hover:scale-105 shadow-soft">
                  Suscribirse
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom Section -->
          <div class="border-t border-gray-200 pt-8">
            <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div class="flex items-center space-x-6 text-sm text-gray-500">
                <span>&copy; ${state.currentYear} AlaMesa. Todos los derechos reservados.</span>
                <span class="hidden md:inline">•</span>
                <button onclick="window.location.hash = '#/privacy'" class="hover:text-am-600 transition-colors duration-300">Privacidad</button>
                <span class="hidden md:inline">•</span>
                <button onclick="window.location.hash = '#/terms'" class="hover:text-am-600 transition-colors duration-300">Términos</button>
              </div>
              
              <div class="flex items-center space-x-4">
                <button 
                  onclick="window.scrollTo({top: 0, behavior: 'smooth'})"
                  class="w-9 h-9 bg-gradient-to-br from-am-500 to-am-700 hover:from-am-600 hover:to-am-800 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-lg hover:shadow-xl group"
                  title="Volver arriba"
                >
                  <i class="fas fa-arrow-up text-white text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;
  };

  return {
    view
  };
};

export default Footer;
