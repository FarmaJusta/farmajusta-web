import type { Drug, PharmacyBranch, DrugComparisonResult, SearchFilters, LocationData } from "./types"
import { mockDrugs, mockBranches, mockPrices, getDrugById, getBranchById } from "./farmajusta-data"

/**
 * FR-01: Búsqueda de medicamentos por DCI o marca
 * - Case-insensitive
 * - Coincidencia parcial (contains)
 */
export function searchDrugs(query: string): Drug[] {
    if (!query.trim()) return mockDrugs.filter((d) => d.isActive)

    const searchTerm = query.toLowerCase().trim()

    return mockDrugs.filter((drug) => {
        if (!drug.isActive) return false

        // Búsqueda en DCI
        if (drug.dci.toLowerCase().includes(searchTerm)) return true

        // Búsqueda en nombres comerciales
        if (drug.commercialNames.some((name) => name.toLowerCase().includes(searchTerm))) return true

        // Búsqueda en laboratorio
        if (drug.laboratory.toLowerCase().includes(searchTerm)) return true

        // Búsqueda en ingrediente activo
        if (drug.activeIngredient.toLowerCase().includes(searchTerm)) return true

        return false
    })
}

/**
 * FR-02: Listado de alternativas genéricas y de marca
 * Agrupa medicamentos por DCI, forma farmacéutica y concentración
 */
export function findEquivalentDrugs(drugId: string): Drug[] {
    const drug = getDrugById(drugId)
    if (!drug) return []

    return mockDrugs.filter(
        (d) =>
            d.isActive &&
            d.dci === drug.dci &&
            d.pharmaceuticalForm === drug.pharmaceuticalForm &&
            d.concentration === drug.concentration,
    )
}

/**
 * FR-03 y FR-04: Comparación de precios por farmacia con geolocalización
 * Devuelve resultados dentro del radio especificado, ordenados por precio
 */
export function comparePrice(drugId: string, userLocation?: LocationData, maxDistanceKm = 5): DrugComparisonResult[] {
    const results: DrugComparisonResult[] = []

    // Obtener todos los precios para este medicamento
    const prices = mockPrices.filter((p) => p.drugId === drugId)

    for (const price of prices) {
        const branch = getBranchById(price.branchId)
        const drug = getDrugById(price.drugId)

        if (!branch || !drug) continue

        let distance: number | undefined

        // Calcular distancia si se proporciona ubicación del usuario
        if (userLocation) {
            distance = calculateDistance(userLocation.lat, userLocation.lng, branch.coordinates.lat, branch.coordinates.lng)

            // Filtrar por radio de búsqueda
            if (distance > maxDistanceKm) continue
        }

        results.push({
            drug,
            branch,
            price,
            distance,
        })
    }

    // FR-03: Ordenar por precio ascendente (imparcial)
    return results.sort((a, b) => a.price.price - b.price.price)
}

/**
 * Comparar precios de todos los equivalentes farmacéuticos
 */
export function compareEquivalentDrugs(
    drugId: string,
    userLocation?: LocationData,
    maxDistanceKm = 5,
): DrugComparisonResult[] {
    const equivalents = findEquivalentDrugs(drugId)
    const allResults: DrugComparisonResult[] = []

    for (const equivalent of equivalents) {
        const results = comparePrice(equivalent.id, userLocation, maxDistanceKm)
        allResults.push(...results)
    }

    // Ordenar por precio ascendente
    return allResults.sort((a, b) => a.price.price - b.price.price)
}

/**
 * Aplicar filtros adicionales a los resultados
 */
export function applyFilters(results: DrugComparisonResult[], filters: SearchFilters): DrugComparisonResult[] {
    let filtered = [...results]

    // Filtro por tipo (genérico/marca)
    if (filters.type && filters.type !== "todos") {
        filtered = filtered.filter((r) => (filters.type === "generico" ? r.drug.isGeneric : !r.drug.isGeneric))
    }

    // Filtro por rango de precios
    if (filters.priceRange) {
        const [min, max] = filters.priceRange
        filtered = filtered.filter((r) => r.price.price >= min && r.price.price <= max)
    }

    // Filtro por stock
    if (filters.onlyInStock) {
        filtered = filtered.filter((r) => r.price.stockStatus === "IN_STOCK")
    }

    // Filtro por prescripción
    if (filters.requiresPrescription !== undefined) {
        filtered = filtered.filter((r) => r.drug.requiresPrescription === filters.requiresPrescription)
    }

    return filtered
}

/**
 * Cálculo de distancia usando fórmula de Haversine
 * Devuelve distancia en kilómetros
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radio de la Tierra en km
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return Math.round(distance * 10) / 10 // Redondear a 1 decimal
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180)
}

/**
 * Obtener sucursales dentro de un radio
 */
export function getBranchesInRadius(userLocation: LocationData, radiusKm = 5): PharmacyBranch[] {
    return mockBranches.filter((branch) => {
        const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            branch.coordinates.lat,
            branch.coordinates.lng,
        )
        return distance <= radiusKm
    })
}

/**
 * Calcular ahorro potencial entre genérico y marca
 */
export function calculateSavings(drugId: string): {
    genericPrice: number | null
    brandPrice: number | null
    savings: number | null
    savingsPercentage: number | null
} {
    const equivalents = findEquivalentDrugs(drugId)

    const genericPrices = mockPrices
        .filter((p) => equivalents.find((d) => d.id === p.drugId && d.isGeneric))
        .map((p) => p.price)

    const brandPrices = mockPrices
        .filter((p) => equivalents.find((d) => d.id === p.drugId && !d.isGeneric))
        .map((p) => p.price)

    const genericPrice = genericPrices.length > 0 ? Math.min(...genericPrices) : null
    const brandPrice = brandPrices.length > 0 ? Math.min(...brandPrices) : null

    if (genericPrice && brandPrice) {
        const savings = brandPrice - genericPrice
        const savingsPercentage = Math.round((savings / brandPrice) * 100)
        return { genericPrice, brandPrice, savings, savingsPercentage }
    }

    return { genericPrice, brandPrice, savings: null, savingsPercentage: null }
}
