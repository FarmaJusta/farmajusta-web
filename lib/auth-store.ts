import { create } from "zustand"

// Tipos de usuario
export interface User {
    id: string
    email: string
    name: string
    phone?: string
    avatar?: string
    createdAt: string
}

// Estado de autenticación
interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null

    // Actions
    login: (email: string, password: string) => Promise<boolean>
    register: (data: RegisterData) => Promise<boolean>
    logout: () => void
    resetPassword: (email: string) => Promise<boolean>
    updateProfile: (data: Partial<User>) => void
    clearError: () => void
}

export interface RegisterData {
    name: string
    email: string
    password: string
    phone?: string
}

// Usuarios mock para pruebas
const MOCK_USERS: Array<User & { password: string }> = [
    {
        id: "user-1",
        email: "demo@farmanexo.pe",
        password: "Demo123!",
        name: "Usuario Demo",
        phone: "999888777",
        createdAt: new Date().toISOString(),
    },
]

export const useAuthStore = create<AuthState>()((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        // Simular delay de red
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

        if (user) {
            const { password: _, ...userData } = user
            set({ user: userData, isAuthenticated: true, isLoading: false })
            // Guardar en localStorage para persistencia
            if (typeof window !== "undefined") {
                localStorage.setItem("farmanexo_user", JSON.stringify(userData))
            }
            return true
        }

        set({ error: "Email o contraseña incorrectos", isLoading: false })
        return false
    },

    register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })

        // Simular delay de red
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Verificar si el email ya existe
        const existingUser = MOCK_USERS.find((u) => u.email.toLowerCase() === data.email.toLowerCase())

        if (existingUser) {
            set({ error: "Este email ya está registrado", isLoading: false })
            return false
        }

        // Crear nuevo usuario
        const newUser: User = {
            id: `user-${Date.now()}`,
            email: data.email,
            name: data.name,
            phone: data.phone,
            createdAt: new Date().toISOString(),
        }

        // Agregar al mock (en una app real, esto iría al backend)
        MOCK_USERS.push({ ...newUser, password: data.password })

        set({ user: newUser, isAuthenticated: true, isLoading: false })

        // Guardar en localStorage para persistencia
        if (typeof window !== "undefined") {
            localStorage.setItem("farmanexo_user", JSON.stringify(newUser))
        }

        return true
    },

    logout: () => {
        set({ user: null, isAuthenticated: false, error: null })
        if (typeof window !== "undefined") {
            localStorage.removeItem("farmanexo_user")
        }
    },

    resetPassword: async (email: string) => {
        set({ isLoading: true, error: null })

        // Simular delay de red
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())

        if (!user) {
            set({ error: "No encontramos una cuenta con este email", isLoading: false })
            return false
        }

        // En una app real, enviaríamos un email de recuperación
        set({ isLoading: false })
        return true
    },

    updateProfile: (data: Partial<User>) => {
        const currentUser = get().user
        if (!currentUser) return

        const updatedUser = { ...currentUser, ...data }
        set({ user: updatedUser })

        if (typeof window !== "undefined") {
            localStorage.setItem("farmanexo_user", JSON.stringify(updatedUser))
        }
    },

    clearError: () => {
        set({ error: null })
    },
}))

// Hook para inicializar auth desde localStorage
export function initializeAuth() {
    if (typeof window === "undefined") return

    const storedUser = localStorage.getItem("farmanexo_user")
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser)
            useAuthStore.setState({ user, isAuthenticated: true })
        } catch {
            localStorage.removeItem("farmanexo_user")
        }
    }
}
