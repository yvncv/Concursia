import React from 'react';
import { X } from 'lucide-react';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-orange-100">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-red-50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Términos y Condiciones
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-100 rounded-full transition-all duration-200 hover:scale-110"
          >
            <X size={24} className="text-orange-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-lg font-semibold mb-3 text-orange-700">1. Aceptación de los Términos</h3>
              <p>
                Al acceder y utilizar este servicio, usted acepta estar sujeto a estos términos y condiciones de uso. 
                Si no está de acuerdo con alguno de estos términos, no debe utilizar este servicio.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">2. Descripción del Servicio</h3>
              <p>
                Nuestro servicio proporciona una plataforma para [descripción de tu servicio]. 
                Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">3. Registro de Usuario</h3>
              <p>
                Para utilizar ciertas funciones del servicio, debe registrarse y crear una cuenta. 
                Usted es responsable de mantener la confidencialidad de su información de cuenta y 
                de todas las actividades que ocurran bajo su cuenta.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">4. Uso Aceptable</h3>
              <p>
                Usted se compromete a utilizar el servicio únicamente para fines legales y de acuerdo con estos términos. 
                No debe utilizar el servicio para:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Actividades ilegales o fraudulentas</li>
                <li>Violación de derechos de propiedad intelectual</li>
                <li>Distribución de contenido ofensivo o dañino</li>
                <li>Interferir con el funcionamiento del servicio</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">5. Privacidad</h3>
              <p>
                Su privacidad es importante para nosotros. Nuestra Política de Privacidad explica cómo 
                recopilamos, utilizamos y protegemos su información personal cuando utiliza nuestro servicio.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">6. Limitación de Responsabilidad</h3>
              <p>
                En la medida máxima permitida por la ley, no seremos responsables de ningún daño indirecto, 
                incidental, especial, consecuente o punitivo, incluyendo pero no limitado a pérdida de beneficios, 
                datos o uso.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">7. Modificaciones</h3>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">8. Contacto</h3>
              <p>
                Si tiene alguna pregunta sobre estos términos y condiciones, puede contactarnos a través de 
                nuestros canales de soporte oficiales.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-orange-100 bg-gradient-to-r from-orange-50 to-red-50">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-xl hover:shadow-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 font-medium"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;