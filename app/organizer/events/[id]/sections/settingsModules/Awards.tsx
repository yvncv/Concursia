import React from "react"
import type { CustomEvent } from "@/app/types/eventType"

interface AwardsProps {
    event: CustomEvent
}

const Awards: React.FC<AwardsProps> = ({ event }) => {
    return (
        <div>
            {/* Aquí irían los componentes para manejar categorías */}
            <p>Componentes para definir premios y reconocimientos.</p>
            <h1>{event.id}</h1>
        </div>
    )
}

export default Awards