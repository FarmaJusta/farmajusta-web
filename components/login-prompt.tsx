"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, UserPlus, Lock } from "lucide-react"

interface LoginPromptProps {
    title?: string
    description?: string
    showRegister?: boolean
}

export function LoginPrompt({
    title = "Inicia sesión para continuar",
    description = "Esta funcionalidad requiere que tengas una cuenta.",
    showRegister = true,
}: LoginPromptProps) {
    return (
        <Card className="max-w-md mx-auto border-border/50">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-brand-pink to-brand-teal hover:opacity-90" asChild>
                    <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Iniciar sesión
                    </Link>
                </Button>
                {showRegister && (
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                        <Link href="/registro">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Crear una cuenta
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
