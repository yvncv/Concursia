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
                Al registrarse en este sistema, usted acepta los términos descritos a continuación, en particular
                sobre el uso de su número de Documento Nacional de Identidad (DNI) para fines de verificación
                en el contexto de concursos de Marinera Norteña.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">2. Uso del DNI y Autenticación</h3>
              <p>
                Su DNI será utilizado únicamente con fines de autenticación e identificación dentro del sistema
                para garantizar la transparencia del proceso de inscripción, validación y participación en los
                eventos organizados.
              </p>
              <p>
                El número de DNI solo será visible para usted como usuario registrado y para el personal
                autorizado del evento (organizador o staff).
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">3. Protección de Datos</h3>
              <p>
                Toda información personal, incluyendo su DNI, se almacenará de forma segura y no será compartida
                con terceros bajo ninguna circunstancia, salvo requerimiento legal.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">4. Registro y Responsabilidad</h3>
              <p>
                Al registrarse, usted declara que los datos proporcionados son verídicos. Es su responsabilidad
                mantener actualizada su información personal.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">5. Derechos del Usuario</h3>
              <p>
                Usted puede solicitar en cualquier momento la eliminación de su cuenta y datos personales,
                incluyendo su DNI, a través de nuestros canales oficiales de soporte.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">6. Modificaciones</h3>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">7. Contacto</h3>
              <p>
                Si tiene preguntas sobre el uso de su información o los términos de este servicio, puede contactarnos
                a través del correo o canal oficial del organizador del evento.
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
