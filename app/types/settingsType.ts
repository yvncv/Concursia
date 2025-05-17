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

export interface EventSettings {
    eventId: string // ID del evento al que pertenece la configuración
    registration: RegistrationSettings
    pullCouple: PullCoupleSettings
}
