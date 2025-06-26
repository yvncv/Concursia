import React, { useState } from 'react';

interface TicketPurchaseModalProps {
  isPurchaseOpen: boolean;
  onPurchaseClose: () => void;
}

const TicketPurchaseModal: React.FC<TicketPurchaseModalProps> = ({ isPurchaseOpen, onPurchaseClose }) => {
  if (!isPurchaseOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fade-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Compra de Entradas
            </h2>
            <button
              onClick={onPurchaseClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800">
                Información Importante
              </h3>
            </div>
            
            <p className="text-gray-600 leading-relaxed">
              Este evento no tiene habilitada la compra de entradas por internet. 
              Para adquirir tu entrada, acércate personalmente a la zona de pagos 
              ubicada en la entrada del evento.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-800 mb-2">Métodos de pago disponibles:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Efectivo</li>
              <li>• Tarjetas de débito y crédito</li>
              <li>• Transferencias bancarias</li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onPurchaseClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook personalizado para manejar el modal
export const useTicketPurchaseModal = () => {
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);

  const openPurchaseModal = () => setIsPurchaseOpen(true);
  const closePurchaseModal = () => setIsPurchaseOpen(false);

  return {
    isPurchaseOpen,
    openPurchaseModal,
    closePurchaseModal,
  };
};

export default TicketPurchaseModal;