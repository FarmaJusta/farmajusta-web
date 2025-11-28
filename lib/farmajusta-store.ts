import { create } from "zustand"
import type { Drug, DrugPrice, PharmacyBranch, LocationData } from "@/lib/types"

// Item en la lista de compras
export interface ShoppingListItem {
    id: string
    drug: Drug
    branch: PharmacyBranch
    price: DrugPrice
    quantity: number
    addedAt: string
}

// Estado de la aplicación FarmaJusta
interface FarmaJustaState {
    // Lista de compras (no carrito - es para llevar a la farmacia)
    shoppingList: ShoppingListItem[]

    // Favoritos (IDs de medicamentos)
    favorites: string[]

    // Ubicación del usuario
    userLocation: LocationData | null

    // Radio de búsqueda
    searchRadius: number

    // Historial de búsquedas
    searchHistory: Array<{
        id: string
        term: string
        timestamp: string
    }>

    // Actions - Lista de compras
    addToShoppingList: (drug: Drug, branch: PharmacyBranch, price: DrugPrice, quantity?: number) => void
    removeFromShoppingList: (itemId: string) => void
    updateShoppingListQuantity: (itemId: string, quantity: number) => void
    clearShoppingList: () => void

    // Actions - Favoritos
    addToFavorites: (drugId: string) => void
    removeFromFavorites: (drugId: string) => void
    toggleFavorite: (drugId: string) => void
    isFavorite: (drugId: string) => boolean

    // Actions - Ubicación
    setUserLocation: (location: LocationData | null) => void
    setSearchRadius: (radius: number) => void

    // Actions - Historial
    addToSearchHistory: (term: string) => void
    clearSearchHistory: () => void
}

export const useFarmaJustaStore = create<FarmaJustaState>()((set, get) => ({
    // Estado inicial
    shoppingList: [],
    favorites: [],
    userLocation: null,
    searchRadius: 5,
    searchHistory: [],

    // Lista de compras
    addToShoppingList: (drug, branch, price, quantity = 1) => {
        set((state) => {
            const existingIndex = state.shoppingList.findIndex(
                (item) => item.drug.id === drug.id && item.branch.id === branch.id,
            )

            if (existingIndex >= 0) {
                const newList = [...state.shoppingList]
                newList[existingIndex].quantity += quantity
                return { shoppingList: newList }
            }

            const newItem: ShoppingListItem = {
                id: `${drug.id}-${branch.id}-${Date.now()}`,
                drug,
                branch,
                price,
                quantity,
                addedAt: new Date().toISOString(),
            }

            return { shoppingList: [...state.shoppingList, newItem] }
        })
    },

    removeFromShoppingList: (itemId) => {
        set((state) => ({
            shoppingList: state.shoppingList.filter((item) => item.id !== itemId),
        }))
    },

    updateShoppingListQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
            get().removeFromShoppingList(itemId)
            return
        }

        set((state) => ({
            shoppingList: state.shoppingList.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
        }))
    },

    clearShoppingList: () => {
        set({ shoppingList: [] })
    },

    // Favoritos
    addToFavorites: (drugId) => {
        set((state) => ({
            favorites: [...state.favorites, drugId],
        }))
    },

    removeFromFavorites: (drugId) => {
        set((state) => ({
            favorites: state.favorites.filter((id) => id !== drugId),
        }))
    },

    toggleFavorite: (drugId) => {
        const { favorites } = get()
        if (favorites.includes(drugId)) {
            get().removeFromFavorites(drugId)
        } else {
            get().addToFavorites(drugId)
        }
    },

    isFavorite: (drugId) => {
        return get().favorites.includes(drugId)
    },

    // Ubicación
    setUserLocation: (location) => {
        set({ userLocation: location })
    },

    setSearchRadius: (radius) => {
        set({ searchRadius: radius })
    },

    // Historial
    addToSearchHistory: (term) => {
        if (!term.trim()) return

        set((state) => {
            const newHistory = [
                { id: Date.now().toString(), term: term.trim(), timestamp: new Date().toISOString() },
                ...state.searchHistory.filter((h) => h.term.toLowerCase() !== term.toLowerCase()),
            ].slice(0, 10)

            return { searchHistory: newHistory }
        })
    },

    clearSearchHistory: () => {
        set({ searchHistory: [] })
    },
}))

// Estas funciones calculan valores derivados sin causar re-renders infinitos
export function getShoppingListCount(shoppingList: ShoppingListItem[]): number {
    return shoppingList.reduce((count, item) => count + item.quantity, 0)
}

export function getShoppingListTotal(shoppingList: ShoppingListItem[]): number {
    return shoppingList.reduce((total, item) => total + item.price.price * item.quantity, 0)
}

export function getShoppingListByPharmacy(shoppingList: ShoppingListItem[]) {
    const grouped = new Map<string, { branch: PharmacyBranch; items: ShoppingListItem[]; total: number }>()

    shoppingList.forEach((item) => {
        const existing = grouped.get(item.branch.id)
        if (existing) {
            existing.items.push(item)
            existing.total += item.price.price * item.quantity
        } else {
            grouped.set(item.branch.id, {
                branch: item.branch,
                items: [item],
                total: item.price.price * item.quantity,
            })
        }
    })

    return Array.from(grouped.values())
}
