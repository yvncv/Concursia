import React from "react"
import type { CustomEvent } from "@/app/types/eventType"

interface ParticipantsProps {
    event: CustomEvent
}

const Participants: React.FC<ParticipantsProps> = ({ event }) => {
    return (
        <div>
            {/* Aquí irían los componentes para manejar categorías */}
            <p>Componentes para definir premios y reconocimientos.</p>
        </div>
    )
}

export default Participants