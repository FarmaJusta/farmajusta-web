"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ChatbotWidget } from "@/components/chatbot-widget"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ArrowLeft,
    Pill,
    Info,
    AlertTriangle,
    Thermometer,
    FileText,
    Clock,
    Search,
    Loader2,
    Heart,
} from "lucide-react"
import { mockDrugs, mockPrices, mockBranches, mockPharmacies } from "@/lib/farmanexo-data"
import { useFarmaNexoStore } from "@/lib/farmanexo-store"
import { Toaster, toast } from "sonner"
import type { Drug, DrugPrice, PharmacyBranch, Pharmacy } from "@/lib/types"

export default function MedicamentoPage({ params }: { params: { id: string } }) {
    const { id } = params
    const router = useRouter()
    const [drug, setDrug] = useState<Drug | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    const { favorites, toggleFavorite } = useFarmaNexoStore()

    useEffect(() => {
        setMounted(true)
        const foundDrug = mockDrugs.find((d: Drug) => d.id === id)
        setDrug(foundDrug)
        setIsLoading(false)
    }, [id])

    const isFavorite = mounted && drug ? favorites.includes(drug.id) : false

    const handleToggleFavorite = () => {
        if (drug) {
            toggleFavorite(drug.id)
            toast.success(isFavorite ? "Eliminado de favoritos" : "Agregado a favoritos")
        }
    }

    const prices = drug ? mockPrices.filter((p: DrugPrice) => p.drugId === drug.id) : []
    const minPrice = prices.length > 0 ? Math.min(...prices.map((p: DrugPrice) => p.price)) : 0
    const maxPrice = prices.length > 0 ? Math.max(...prices.map((p: DrugPrice) => p.price)) : 0

    const availablePharmacies = mockPrices
        .filter((p: DrugPrice) => p.drugId === drug?.id)
        .map((p: DrugPrice) => {
            const branch = mockBranches.find((b: PharmacyBranch) => b.id === p.branchId)
            const pharmacy = branch ? mockPharmacies.find((ph: Pharmacy) => ph.id === branch.pharmacyId) : undefined
            return { price: p, branch, pharmacy }
        })
        .filter(
            (item): item is { price: DrugPrice; branch: PharmacyBranch; pharmacy: Pharmacy } =>
                item.branch !== undefined && item.pharmacy !== undefined,
        )
        .sort((a, b) => a.price.price - b.price.price)
        .slice(0, 5)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-brand-pink" />
            </div>
        )
    }

    if (!drug) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto py-12 px-4 text-center">
                    <h1 className="text-2xl font-bold mb-4">Medicamento no encontrado</h1>
                    <p className="text-muted-foreground mb-6">El medicamento que buscas no existe o fue eliminado.</p>
                    <Button onClick={() => router.push("/catalogo")}>Ver catálogo</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Toaster position="top-right" richColors />

            <section className="py-6 sm:py-8 px-4">
                <div className="container mx-auto max-w-4xl">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2">
                        <ArrowLeft className="size-4 mr-2" />
                        Volver
                    </Button>

                    <div className="bg-gradient-to-r from-brand-pink/10 to-brand-teal/10 rounded-xl p-4 sm:p-6 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="rounded-full bg-gradient-to-r from-brand-pink to-brand-teal p-3 sm:p-4 shrink-0">
                                    <Pill className="size-6 sm:size-8 text-white" />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h1 className="text-xl sm:text-2xl font-bold">{drug.commercialNames?.[0] || drug.dci}</h1>
                                        <Badge variant={drug.isGeneric ? "secondary" : "default"} className="text-xs">
                                            {drug.isGeneric ? "Genérico" : "Marca"}
                                        </Badge>
                                        {drug.requiresPrescription && (
                                            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                                                <FileText className="size-3 mr-1" />
                                                Receta
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground text-sm sm:text-base">
                                        {drug.dci} - {drug.concentration}
                                    </p>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                        {drug.pharmaceuticalForm} • {drug.laboratory}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleToggleFavorite}
                                    className={isFavorite ? "text-brand-pink border-brand-pink" : ""}
                                >
                                    <Heart className={`size-4 mr-1 ${isFavorite ? "fill-current" : ""}`} />
                                    {isFavorite ? "Favorito" : "Agregar"}
                                </Button>

                                {prices.length > 0 && (
                                    <Card className="p-3 text-center bg-white dark:bg-card">
                                        <p className="text-xs text-muted-foreground mb-1">Desde</p>
                                        <p className="text-xl sm:text-2xl font-bold text-brand-teal">S/ {minPrice.toFixed(2)}</p>
                                        {minPrice !== maxPrice && (
                                            <p className="text-xs text-muted-foreground">hasta S/ {maxPrice.toFixed(2)}</p>
                                        )}
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                            <TabsTrigger value="general" className="text-xs sm:text-sm py-2">
                                <Info className="size-3 sm:size-4 mr-1 sm:mr-2" />
                                General
                            </TabsTrigger>
                            <TabsTrigger value="uso" className="text-xs sm:text-sm py-2">
                                <Clock className="size-3 sm:size-4 mr-1 sm:mr-2" />
                                Uso
                            </TabsTrigger>
                            <TabsTrigger value="advertencias" className="text-xs sm:text-sm py-2">
                                <AlertTriangle className="size-3 sm:size-4 mr-1 sm:mr-2" />
                                Advertencias
                            </TabsTrigger>
                            <TabsTrigger value="conservacion" className="text-xs sm:text-sm py-2">
                                <Thermometer className="size-3 sm:size-4 mr-1 sm:mr-2" />
                                Conservación
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="mt-4 sm:mt-6 space-y-4">
                            <Card className="p-4 sm:p-6">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Info className="size-4 text-brand-teal" />
                                    Información General
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Principio Activo (DCI)</p>
                                        <p className="font-medium">{drug.dci}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Concentración</p>
                                        <p className="font-medium">{drug.concentration}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Forma Farmacéutica</p>
                                        <p className="font-medium">{drug.pharmaceuticalForm}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Laboratorio</p>
                                        <p className="font-medium">{drug.laboratory}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Presentación</p>
                                        <p className="font-medium">{drug.presentation}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Principio Activo</p>
                                        <p className="font-medium">{drug.activeIngredient}</p>
                                    </div>
                                </div>
                            </Card>

                            {drug.indications && drug.indications.length > 0 && (
                                <Card className="p-4 sm:p-6">
                                    <h3 className="font-semibold mb-2">Indicaciones</h3>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        {drug.indications.map((indication: string, index: number) => (
                                            <li key={index}>{indication}</li>
                                        ))}
                                    </ul>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="uso" className="mt-4 sm:mt-6 space-y-4">
                            <Card className="p-4 sm:p-6">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Clock className="size-4 text-brand-teal" />
                                    Información de Uso
                                </h3>
                                {drug.dosage ? (
                                    <div className="space-y-3 text-sm">
                                        <p className="text-muted-foreground">{drug.dosage}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Consulte a su médico o farmacéutico para información sobre la dosificación adecuada.
                                    </p>
                                )}
                            </Card>

                            <Card className="p-4 sm:p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                                <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                                    <strong>Importante:</strong> Siempre siga las indicaciones de su médico. No se automedique.
                                </p>
                            </Card>
                        </TabsContent>

                        <TabsContent value="advertencias" className="mt-4 sm:mt-6 space-y-4">
                            <Card className="p-4 sm:p-6">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <AlertTriangle className="size-4 text-amber-500" />
                                    Advertencias y Precauciones
                                </h3>
                                {drug.warnings && drug.warnings.length > 0 ? (
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        {drug.warnings.map((warning: string, index: number) => (
                                            <li key={index}>{warning}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Consulte el prospecto del medicamento para información sobre contraindicaciones y efectos
                                        secundarios.
                                    </p>
                                )}
                            </Card>

                            {drug.contraindications && drug.contraindications.length > 0 && (
                                <Card className="p-4 sm:p-6 border-red-200 dark:border-red-900">
                                    <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Contraindicaciones</h3>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        {drug.contraindications.map((contra: string, index: number) => (
                                            <li key={index}>{contra}</li>
                                        ))}
                                    </ul>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="conservacion" className="mt-4 sm:mt-6">
                            <Card className="p-4 sm:p-6">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Thermometer className="size-4 text-brand-teal" />
                                    Condiciones de Conservación
                                </h3>
                                {drug.storageConditions ? (
                                    <p className="text-sm text-muted-foreground">{drug.storageConditions}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Conservar en lugar fresco y seco, protegido de la luz. Mantener fuera del alcance de los niños.
                                    </p>
                                )}
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {availablePharmacies.length > 0 && (
                        <Card className="mt-6 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <h3 className="font-semibold">Farmacias con mejores precios</h3>
                                <Button
                                    size="sm"
                                    onClick={() => router.push(`/buscar?medicamento=${drug.id}`)}
                                    className="bg-brand-teal hover:bg-brand-teal/90 w-full sm:w-auto"
                                >
                                    <Search className="size-4 mr-2" />
                                    Comparar en mi zona
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {availablePharmacies.map((item, index) => (
                                    <div
                                        key={item.price.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/50 gap-2"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${index === 0
                                                    ? "bg-brand-teal text-white"
                                                    : index === 1
                                                        ? "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                                                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                                    }`}
                                            >
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-medium text-sm">{item.pharmacy.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.branch.address}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-brand-teal text-lg sm:text-xl ml-9 sm:ml-0">
                                            S/ {item.price.price.toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    <Card className="mt-6 p-4 bg-muted/50 border-muted">
                        <p className="text-xs text-muted-foreground text-center">
                            La información mostrada es de carácter orientativo. Consulte siempre con un profesional de la salud antes
                            de tomar cualquier medicamento. Los precios son referenciales y pueden variar.
                        </p>
                    </Card>
                </div>
            </section>

            <ChatbotWidget />
        </div>
    )
}
