import type {
    SearchEvent,
    ClickEvent,
    ConversionEvent,
    ChatbotInteraction,
    Channel,
    Device,
    LocationData,
} from "./types"

// Almacenamiento en memoria para el MVP (en producción sería BD)
const searchEvents: SearchEvent[] = []
const clickEvents: ClickEvent[] = []
const conversionEvents: ConversionEvent[] = []
const chatbotInteractions: ChatbotInteraction[] = []

/**
 * FR-13: Tracking de eventos de búsqueda
 */
export function trackSearch(params: {
    searchTerm: string
    normalizedDrugId?: string
    location?: LocationData
    channel?: Channel
    device?: Device
    sessionId: string
}): SearchEvent {
    const event: SearchEvent = {
        id: crypto.randomUUID(),
        searchTerm: params.searchTerm,
        normalizedDrugId: params.normalizedDrugId,
        location: params.location,
        channel: params.channel || "WEB",
        device: params.device || getDeviceType(),
        timestamp: new Date(),
        sessionId: params.sessionId,
    }

    searchEvents.push(event)

    // Log para observabilidad (NFR-11)
    console.log("[v0] SearchEvent:", {
        traceId: event.id,
        searchTerm: event.searchTerm,
        channel: event.channel,
        device: event.device,
        timestamp: event.timestamp.toISOString(),
    })

    return event
}

/**
 * FR-14: Tracking de interacción con resultados
 */
export function trackClick(params: {
    searchEventId?: string
    drugId: string
    branchId: string
    eventType: "VIEW_MAP" | "GO_TO_PHARMACY" | "EXTERNAL_LINK"
    sessionId: string
}): ClickEvent {
    const event: ClickEvent = {
        id: crypto.randomUUID(),
        searchEventId: params.searchEventId,
        drugId: params.drugId,
        branchId: params.branchId,
        eventType: params.eventType,
        timestamp: new Date(),
        sessionId: params.sessionId,
    }

    clickEvents.push(event)

    console.log("[v0] ClickEvent:", {
        traceId: event.id,
        eventType: event.eventType,
        drugId: event.drugId,
        branchId: event.branchId,
        timestamp: event.timestamp.toISOString(),
    })

    return event
}

/**
 * FR-14: Tracking de conversiones
 */
export function trackConversion(params: {
    clickEventId: string
    conversionType: "PHARMACY_VISIT" | "EXTERNAL_CLICK" | "PHONE_CALL"
    sessionId: string
}): ConversionEvent {
    const event: ConversionEvent = {
        id: crypto.randomUUID(),
        clickEventId: params.clickEventId,
        conversionType: params.conversionType,
        timestamp: new Date(),
        sessionId: params.sessionId,
    }

    conversionEvents.push(event)

    console.log("[v0] ConversionEvent:", {
        traceId: event.id,
        conversionType: event.conversionType,
        timestamp: event.timestamp.toISOString(),
    })

    return event
}

/**
 * FR-10: Tracking de interacciones del chatbot
 */
export function trackChatbotInteraction(params: {
    userId?: string
    sessionId: string
    query: string
    response: string
    relatedDrugId?: string
    channel?: Channel
}): ChatbotInteraction {
    const interaction: ChatbotInteraction = {
        id: crypto.randomUUID(),
        userId: params.userId,
        sessionId: params.sessionId,
        query: params.query,
        response: params.response,
        relatedDrugId: params.relatedDrugId,
        timestamp: new Date(),
        channel: params.channel || "WEB",
    }

    chatbotInteractions.push(interaction)

    console.log("[v0] ChatbotInteraction:", {
        traceId: interaction.id,
        sessionId: interaction.sessionId,
        channel: interaction.channel,
        timestamp: interaction.timestamp.toISOString(),
    })

    return interaction
}

/**
 * FR-15: Cálculo de métricas de negocio
 */
export function getMetrics(startDate?: Date, endDate?: Date) {
    const now = new Date()
    const start = startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 días atrás
    const end = endDate || now

    // Filtrar eventos por rango de fechas
    const filteredSearches = searchEvents.filter((e) => e.timestamp >= start && e.timestamp <= end)
    const filteredClicks = clickEvents.filter((e) => e.timestamp >= start && e.timestamp <= end)
    const filteredConversions = conversionEvents.filter((e) => e.timestamp >= start && e.timestamp <= end)
    const filteredChatInteractions = chatbotInteractions.filter((e) => e.timestamp >= start && e.timestamp <= end)

    // Usuarios únicos (por sessionId)
    const uniqueSessions = new Set(filteredSearches.map((e) => e.sessionId)).size

    // Tasa de conversión (TC)
    const conversionRate = uniqueSessions > 0 ? (filteredConversions.length / uniqueSessions) * 100 : 0

    // Interacciones promedio del chatbot por usuario activo
    const avgChatbotInteractions = uniqueSessions > 0 ? filteredChatInteractions.length / uniqueSessions : 0

    // Búsquedas más populares
    const searchTermFrequency: Record<string, number> = {}
    filteredSearches.forEach((search) => {
        const term = search.searchTerm.toLowerCase()
        searchTermFrequency[term] = (searchTermFrequency[term] || 0) + 1
    })
    const topSearches = Object.entries(searchTermFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([term, count]) => ({ term, count }))

    // Distribución por canal
    const channelDistribution: Record<Channel, number> = {
        WEB: 0,
        MOBILE: 0,
        WHATSAPP: 0,
    }
    filteredSearches.forEach((search) => {
        channelDistribution[search.channel]++
    })

    // Distribución por dispositivo
    const deviceDistribution: Record<Device, number> = {
        DESKTOP: 0,
        MOBILE: 0,
        TABLET: 0,
    }
    filteredSearches.forEach((search) => {
        deviceDistribution[search.device]++
    })

    return {
        totalSearches: filteredSearches.length,
        uniqueUsers: uniqueSessions,
        totalClicks: filteredClicks.length,
        totalConversions: filteredConversions.length,
        conversionRate: Math.round(conversionRate * 100) / 100,
        chatbotInteractions: filteredChatInteractions.length,
        averageChatbotInteractions: Math.round(avgChatbotInteractions * 100) / 100,
        topSearches,
        channelDistribution,
        deviceDistribution,
        dateRange: {
            start: start.toISOString(),
            end: end.toISOString(),
        },
    }
}

/**
 * Obtener datos raw para exportar a BI/analytics externo
 */
export function getAnalyticsData() {
    return {
        searchEvents: [...searchEvents],
        clickEvents: [...clickEvents],
        conversionEvents: [...conversionEvents],
        chatbotInteractions: [...chatbotInteractions],
    }
}

/**
 * Utilidades
 */
function getDeviceType(): Device {
    if (typeof window === "undefined") return "DESKTOP"

    const ua = window.navigator.userAgent
    if (/tablet|ipad|playbook|silk/i.test(ua)) return "TABLET"
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "MOBILE"
    return "DESKTOP"
}

/**
 * Generar sessionId único
 */
export function generateSessionId(): string {
    // Verificar si estamos en el navegador
    if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
        // En el servidor, generar un ID temporal
        return crypto.randomUUID()
    }

    let sessionId = sessionStorage.getItem("farmajusta_session_id")
    if (!sessionId) {
        sessionId = crypto.randomUUID()
        sessionStorage.setItem("farmajusta_session_id", sessionId)
    }
    return sessionId
}
