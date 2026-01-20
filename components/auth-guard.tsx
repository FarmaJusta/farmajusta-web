"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, initializeAuth } from "@/lib/auth-store"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Inicializar auth desde localStorage
        initializeAuth()

        // Dar tiempo para que se cargue el estado
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 100)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isLoading, isAuthenticated, router])

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
            </div>
        )
    }

    if (!isAuthenticated) {
        if (fallback) {
            return <>{fallback}</>
        }
        return null
    }

    return <>{children}</>
}

// Componente para mostrar contenido solo si está autenticado (sin redirección)
export function AuthenticatedOnly({ children, fallback }: AuthGuardProps) {
    const { isAuthenticated } = useAuthStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        initializeAuth()
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    if (!isAuthenticated) {
        return fallback ? <>{fallback}</> : null
    }

    return <>{children}</>
}

// Hook para verificar autenticación
export function useRequireAuth() {
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        initializeAuth()
        setIsLoading(false)
    }, [])

    const requireAuth = (callback: () => void) => {
        if (!isAuthenticated) {
            router.push("/login")
            return
        }
        callback()
    }

    return { isAuthenticated, isLoading, requireAuth }
}
