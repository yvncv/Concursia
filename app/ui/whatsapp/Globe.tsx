import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

const WhatsAppSVGButton: React.FC = () => {
  const phone = "51916886591";

  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-300"
      title="Contáctanos por WhatsApp"
    >
      <FontAwesomeIcon icon={faWhatsapp} className="w-8 h-8" />
    </a>
  );
};

export default WhatsAppSVGButton;
