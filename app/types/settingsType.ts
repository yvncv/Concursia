// Define el tipo de datos para la configuración de inscripción
export interface RegistrationSettings {
    grupalCSV: boolean
    individualWeb: boolean
    sameDay: boolean
}

// Define el tipo de datos para la configuración de "jalar pareja"
export interface PullCoupleSettings {
    enabled: boolean
    criteria: "Category" | "Age"
    difference: number
}

// Define el tipo principal para todas las configuraciones del evento
export interface EventSettings {
    eventId: string // ID del evento al que pertenece la configuración
    registration: RegistrationSettings
    pullCouple: PullCoupleSettings
    // Aquí puedes seguir agregando más configuraciones en el futuro
}
