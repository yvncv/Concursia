import React from "react"
import type { CustomEvent } from "@/app/types/eventType"

interface EvaluationProps {
    event: CustomEvent
}

const Evaluations: React.FC<EvaluationProps> = ({ event }) => {
    return (
        <div>
            {/* Aquí irían los componentes para manejar categorías */}
            <p>Componentes para gestionar la configuración de comentarios del público.</p>
            <h1>{event.id}</h1>
        </div>
    )
}

export default Evaluations