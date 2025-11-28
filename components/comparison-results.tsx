"use client"

import { useState } from "react"
import { MapPin, Phone, Clock, TrendingDown, Navigation, AlertTriangle, Plus, Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { DrugComparisonResult, Drug } from "@/lib/types"
import { calculateSavings } from "@/lib/search-service"
import { DrugDetailModal } from "@/components/drug-detail-modal"
import { useFarmaJustaStore } from "@/lib/farmajusta-store"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ComparisonResultsProps {
    results: DrugComparisonResult[]
    selectedDrug: Drug
    onViewMap: (branchId: string) => void
}

export function ComparisonResults({ results, selectedDrug, onViewMap }: ComparisonResultsProps) {
    const savings = calculateSavings(selectedDrug.id)
    const [sortBy, setSortBy] = useState<"price" | "distance">("price")
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [addedItems, setAddedItems] = useState<Set<string>>(new Set())

    const { addToShoppingList } = useFarmaJustaStore()

    const sortedResults = [...results].sort((a, b) => {
        if (sortBy === "price") {
            return a.price.price - b.price.price
        } else {
            return (a.distance || 999) - (b.distance || 999)
        }
    })

    const getStockBadge = (status: string) => {
        switch (status) {
            case "IN_STOCK":
                return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 text-xs">En stock</Badge>
            case "LOW":
                return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">Stock bajo</Badge>
            case "OUT_OF_STOCK":
                return (
                    <Badge variant="destructive" className="text-xs">
                        Agotado
                    </Badge>
                )
            default:
                return null
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2,
        }).format(price)
    }

    const openGoogleMaps = (result: DrugComparisonResult) => {
        const { lat, lng } = result.branch.coordinates
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        window.open(url, "_blank")
    }

    const handleAddToList = (result: DrugComparisonResult) => {
        const itemKey = `${result.drug.id}-${result.branch.id}`
        addToShoppingList(result.drug, result.branch, result.price, 1)
        setAddedItems((prev) => new Set(prev).add(itemKey))
        toast.success("Agregado a tus órdenes")

        setTimeout(() => {
            setAddedItems((prev) => {
                const newSet = new Set(prev)
                newSet.delete(itemKey)
                return newSet
            })
        }, 2000)
    }

    const isItemAdded = (result: DrugComparisonResult) => {
        return addedItems.has(`${result.drug.id}-${result.branch.id}`)
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-brand-teal/5 to-brand-pink/5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2
                            className="text-xl sm:text-2xl font-bold text-balance cursor-pointer hover:text-brand-teal transition-colors"
                            onClick={() => setIsDetailModalOpen(true)}
                        >
                            {selectedDrug.commercialNames?.[0] || selectedDrug.dci}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {selectedDrug.dci} {selectedDrug.concentration} - {selectedDrug.pharmaceuticalForm}
                        </p>
                        <Button
                            variant="link"
                            className="px-0 h-auto text-xs sm:text-sm text-brand-pink hover:text-brand-pink/80"
                            onClick={() => setIsDetailModalOpen(true)}
                        >
                            Ver información completa →
                        </Button>
                    </div>

                    {savings.savings && savings.savings > 0 && (
                        <Card className="p-3 sm:p-4 bg-green-500/10 border-green-500/20 shrink-0">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <TrendingDown className="size-4 sm:size-5" />
                                <div>
                                    <p className="text-xs sm:text-sm font-medium">Ahorra hasta</p>
                                    <p className="text-lg sm:text-xl font-bold">
                                        {formatPrice(savings.savings)} ({savings.savingsPercentage}%)
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-muted-foreground">
                    {results.length} resultado{results.length !== 1 ? "s" : ""}
                </p>

                <div className="flex gap-2">
                    <Button
                        variant={sortBy === "price" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortBy("price")}
                        className={cn("text-xs sm:text-sm", sortBy === "price" ? "bg-brand-pink hover:bg-brand-pink/90" : "")}
                    >
                        Por precio
                    </Button>
                    <Button
                        variant={sortBy === "distance" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortBy("distance")}
                        className={cn("text-xs sm:text-sm", sortBy === "distance" ? "bg-brand-teal hover:bg-brand-teal/90" : "")}
                        disabled={!results.some((r) => r.distance)}
                    >
                        Por distancia
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 sm:gap-4">
                {sortedResults.map((result, index) => (
                    <Card key={`${result.drug.id}-${result.branch.id}`} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="flex sm:flex-col items-center gap-2 sm:gap-1">
                                <div
                                    className={`
                  rounded-full size-8 sm:size-10 flex items-center justify-center font-bold text-sm sm:text-lg
                  ${index === 0 ? "bg-brand-pink text-white" : "bg-muted text-muted-foreground"}
                `}
                                >
                                    {index + 1}
                                </div>
                                {index === 0 && <Badge className="text-xs bg-brand-pink">Mejor</Badge>}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-base sm:text-xl truncate">{result.branch.pharmacyName}</h3>
                                        <div className="flex items-start gap-1 text-xs sm:text-sm text-muted-foreground mt-1">
                                            <MapPin className="size-3 sm:size-4 shrink-0 mt-0.5" />
                                            <span className="line-clamp-2">
                                                {result.branch.address}, {result.branch.district}
                                            </span>
                                        </div>
                                        {result.distance && (
                                            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mt-1">
                                                <Navigation className="size-3 sm:size-4" />
                                                <span>{result.distance.toFixed(1)} km</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center sm:items-end sm:flex-col gap-2">
                                        <div className="text-2xl sm:text-3xl font-bold text-brand-pink">
                                            {formatPrice(result.price.price)}
                                        </div>
                                        {getStockBadge(result.price.stockStatus)}
                                    </div>
                                </div>

                                <Separator className="my-3 sm:my-4" />

                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
                                        <div className="flex items-center gap-1">
                                            <Clock className="size-3 sm:size-4 text-muted-foreground" />
                                            <span>{result.branch.hours}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Phone className="size-3 sm:size-4 text-muted-foreground" />
                                            <span>{result.branch.phone}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openGoogleMaps(result)}
                                            className="text-xs sm:text-sm flex-1 sm:flex-none"
                                        >
                                            <Navigation className="size-3 sm:size-4 mr-1" />
                                            Cómo llegar
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent" asChild>
                                            <a href={`tel:${result.branch.phone}`}>
                                                <Phone className="size-3 sm:size-4 mr-1" />
                                                Llamar
                                            </a>
                                        </Button>
                                        <Button
                                            size="sm"
                                            className={`text-xs sm:text-sm flex-1 sm:flex-none ${isItemAdded(result) ? "bg-green-600 hover:bg-green-600" : "bg-brand-teal hover:bg-brand-teal/90"
                                                }`}
                                            onClick={() => handleAddToList(result)}
                                            disabled={result.price.stockStatus === "OUT_OF_STOCK"}
                                        >
                                            {isItemAdded(result) ? (
                                                <>
                                                    <Check className="size-3 sm:size-4 mr-1" />
                                                    Agregado
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="size-3 sm:size-4 mr-1" />
                                                    Agregar
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                                    <AlertTriangle className="size-3" />
                                    <span>Actualizado: {new Date(result.price.lastUpdated).toLocaleDateString("es-PE")}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="p-3 sm:p-4 bg-muted/50">
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Los precios son referenciales. Confirma disponibilidad con la farmacia antes de tu visita.
                    {selectedDrug.requiresPrescription && (
                        <span className="font-semibold"> Este medicamento requiere receta médica.</span>
                    )}
                </p>
            </Card>

            <DrugDetailModal drug={selectedDrug} isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} />
        </div>
    )
}
