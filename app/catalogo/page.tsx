"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { DrugCatalog } from "@/components/drug-catalog"
import { ChatbotWidget } from "@/components/chatbot-widget"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Toaster } from "sonner"
import type { Drug } from "@/lib/types"

export default function CatalogoPage() {
    const router = useRouter()

    const handleDrugSelect = (drug: Drug) => {
        router.push(`/buscar?medicamento=${encodeURIComponent(drug.id)}`)
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Toaster position="top-right" richColors />

            <section className="py-6 sm:py-8 px-4">
                <div className="container mx-auto">
                    <div className="mb-6">
                        <Button variant="ghost" onClick={() => router.push("/")} className="mb-4 -ml-2">
                            <ArrowLeft className="size-4 mr-2" />
                            Volver al inicio
                        </Button>
                        <h1 className="text-2xl sm:text-3xl font-bold">Catálogo de Medicamentos</h1>
                        <p className="text-muted-foreground mt-2">Explora todos los medicamentos disponibles y compara precios</p>
                    </div>
                    <DrugCatalog onDrugSelect={handleDrugSelect} />
                </div>
            </section>

            <ChatbotWidget />
        </div>
    )
}
