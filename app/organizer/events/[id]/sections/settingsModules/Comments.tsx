import React from "react"
import type { CustomEvent } from "@/app/types/eventType"

interface CommentsProps {
    event: CustomEvent
}

const Comments: React.FC<CommentsProps> = ({ event }) => {
    return (
        <div>
            {/* Aquí irían los componentes para manejar categorías */}
            <p>Componentes para gestionar la configuración de comentarios del público.</p>
        </div>
    )
}

export default Comments