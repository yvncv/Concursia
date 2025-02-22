import React from "react"
import type { CustomEvent } from "@/app/types/eventType"

interface CategoriesProps {
    event: CustomEvent
}

const Categories: React.FC<CategoriesProps> = ({ event }) => {
    return (
        <div>
            {/* Aquí irían los componentes para manejar categorías */}
            <p>Componentes para gestionar categorías del evento.</p>
        </div>
    )
}

export default Categories