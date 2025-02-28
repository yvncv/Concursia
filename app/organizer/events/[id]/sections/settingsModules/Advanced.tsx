import React from "react"
import type { CustomEvent } from "@/app/types/eventType"

interface AdvancedProps {
    event: CustomEvent
}

const Advanced: React.FC<AdvancedProps> = ({ event }) => {
    return (
        <div>
            {/* Aquí irían los componentes para manejar categorías */}
            <p>Componentes para ajustar configuraciones avanzadas del evento.</p>
            <h1>{event.id}</h1>
        </div>
    )
}

export default Advanced