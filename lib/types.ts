// Enumeraciones
export type StockStatus = "IN_STOCK" | "LOW" | "OUT_OF_STOCK"
export type DataSource = "SNIP" | "PHARMACY_API" | "MANUAL"
export type UserRole = "patient" | "qf" | "pharmacy_admin" | "lab_analyst" | "platform_admin"
export type Channel = "WEB" | "MOBILE" | "WHATSAPP"
export type Device = "DESKTOP" | "MOBILE" | "TABLET"
export type EventType = "SEARCH" | "CLICK" | "CONVERSION" | "CHATBOT_INTERACTION"

// Entidades principales según especificación

export interface Drug {
    id: string
    dci: string // Denominación Común Internacional
    commercialNames: string[] // Nombres comerciales/marcas
    pharmaceuticalForm: string // Forma farmacéutica
    concentration: string
    isGeneric: boolean
    laboratory: string
    activeIngredient: string
    presentation: string
    requiresPrescription: boolean
    isActive: boolean // Para habilitar/deshabilitar del buscador
    // Información médica
    indications?: string[]
    contraindications?: string[]
    dosage?: string
    sideEffects?: string[]
    interactions?: string[]
    composition?: string
    warnings?: string[]
    storageConditions?: string
    expirationInfo?: string
}

export interface Pharmacy {
    id: string
    name: string
    chainName?: string
    logo?: string
}

export interface PharmacyBranch {
    id: string
    pharmacyId: string
    pharmacyName: string
    address: string
    district: string
    city: string
    region: string
    coordinates: {
        lat: number
        lng: number
    }
    phone: string
    hours: string
    isOpen24Hours: boolean
    rating: number
}

export interface DrugPrice {
    id: string
    drugId: string
    branchId: string
    price: number
    currency: string
    stockStatus: StockStatus
    stockQuantity?: number
    source: DataSource
    lastUpdated: Date
}

// Modelos de vista para el comparador
export interface DrugComparisonResult {
    drug: Drug
    branch: PharmacyBranch
    price: DrugPrice
    distance?: number // En km desde la ubicación del usuario
}

// Analytics y eventos
export interface SearchEvent {
    id: string
    searchTerm: string
    normalizedDrugId?: string
    location?: {
        lat: number
        lng: number
        district?: string
    }
    channel: Channel
    device: Device
    timestamp: Date
    sessionId: string
}

export interface ClickEvent {
    id: string
    searchEventId?: string
    drugId: string
    branchId: string
    eventType: "VIEW_MAP" | "GO_TO_PHARMACY" | "EXTERNAL_LINK"
    timestamp: Date
    sessionId: string
}

export interface ConversionEvent {
    id: string
    clickEventId: string
    conversionType: "PHARMACY_VISIT" | "EXTERNAL_CLICK" | "PHONE_CALL"
    timestamp: Date
    sessionId: string
}

export interface ChatbotInteraction {
    id: string
    userId?: string // Opcional en MVP 1.0 (usuarios anónimos)
    sessionId: string
    query: string
    response: string
    relatedDrugId?: string
    timestamp: Date
    channel: Channel
}

// Filtros y búsqueda
export interface SearchFilters {
    type?: "generico" | "marca" | "todos"
    priceRange?: [number, number]
    maxDistance?: number // En km
    onlyInStock?: boolean
    requiresPrescription?: boolean
}

export interface LocationData {
    lat: number
    lng: number
    district?: string
    city?: string
    address?: string
}

// Métricas (para analytics)
export interface Metrics {
    totalSearches: number
    uniqueUsers: number
    conversionRate: number
    averageChatbotInteractions: number
    cac?: number // Cost of Acquisition (se calcula externamente)
}

export interface SearchHistoryItem {
    id: string
    term: string
    timestamp: string
}
