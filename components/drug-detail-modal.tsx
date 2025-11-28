"use client"

import { useState, useMemo } from "react"
import type { Drug, PharmacyBranch, DrugPrice } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Pill,
    AlertTriangle,
    Thermometer,
    MapPin,
    TrendingDown,
    Building2,
    Info,
    AlertCircle,
    Plus,
    Check,
    Navigation,
    Phone,
} from "lucide-react"
import { mockPrices, mockBranches } from "@/lib/farmajusta-data"
import { useFarmaJustaStore } from "@/lib/farmajusta-store"

interface DrugDetailModalProps {
    drug: Drug | null
    isOpen: boolean
    onClose: () => void
    onComparePrices?: () => void
}

export function DrugDetailModal({ drug, isOpen, onClose, onComparePrices }: DrugDetailModalProps) {
    const [activeTab, setActiveTab] = useState("indications")
    const [addedBranchId, setAddedBranchId] = useState<string | null>(null)
    const { addToShoppingList } = useFarmaJustaStore()

    const priceInfo = useMemo(() => {
        if (!drug) return null

        const prices = mockPrices.filter((p) => p.drugId === drug.id)
        if (prices.length === 0) return null

        const minPrice = Math.min(...prices.map((p) => p.price))
        const maxPrice = Math.max(...prices.map((p) => p.price))

        const branchesWithPrices = prices
            .map((price) => {
                const branch = mockBranches.find((b) => b.id === price.branchId)
                return { price, branch }
            })
            .filter((item) => item.branch !== undefined) as Array<{ price: DrugPrice; branch: PharmacyBranch }>

        return {
            minPrice,
            maxPrice,
            count: prices.length,
            branchesWithPrices: branchesWithPrices.sort((a, b) => a.price.price - b.price.price),
        }
    }, [drug])

    if (!drug) {
        return null
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2,
        }).format(price)
    }

    const handleAddToList = (price: DrugPrice, branch: PharmacyBranch) => {
        addToShoppingList(drug, branch, price, 1)
        setAddedBranchId(branch.id)
        setTimeout(() => setAddedBranchId(null), 2000)
    }

    const openGoogleMaps = (branch: PharmacyBranch) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${branch.coordinates.lat},${branch.coordinates.lng}`
        window.open(url, "_blank")
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto p-0">
                <div className="bg-gradient-to-br from-brand-pink/10 via-background to-brand-teal/10 px-6 pt-6 pb-4 border-b">
                    <DialogHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                                <DialogTitle className="text-2xl font-bold text-balance leading-tight">{drug.dci}</DialogTitle>

                                <div className="flex flex-wrap items-center gap-2">
                                    {drug.isGeneric && (
                                        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-medium">
                                            Genérico
                                        </Badge>
                                    )}
                                    {drug.requiresPrescription && (
                                        <Badge
                                            variant="outline"
                                            className="border-amber-500/30 text-amber-700 dark:text-amber-400 font-medium"
                                        >
                                            <AlertTriangle className="size-3 mr-1.5" />
                                            Requiere receta
                                        </Badge>
                                    )}
                                    <Badge variant="secondary" className="font-normal">
                                        {drug.pharmaceuticalForm}
                                    </Badge>
                                </div>

                                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                    <span>
                                        <strong className="text-foreground">Concentración:</strong> {drug.concentration}
                                    </span>
                                    <span>
                                        <strong className="text-foreground">Presentación:</strong> {drug.presentation}
                                    </span>
                                    <span>
                                        <strong className="text-foreground">Laboratorio:</strong> {drug.laboratory}
                                    </span>
                                </div>
                            </div>

                            {priceInfo && (
                                <Card className="shrink-0 w-56 bg-gradient-to-br from-brand-pink to-brand-teal text-white border-0 shadow-lg">
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                                            <TrendingDown className="size-4" />
                                            <span>Mejor precio</span>
                                        </div>
                                        <div className="text-3xl font-bold">{formatPrice(priceInfo.minPrice)}</div>
                                        {priceInfo.maxPrice > priceInfo.minPrice && (
                                            <div className="text-xs text-white/80">Hasta {formatPrice(priceInfo.maxPrice)}</div>
                                        )}
                                        <div className="text-xs text-white/90 pt-1">
                                            en {priceInfo.count} {priceInfo.count === 1 ? "farmacia" : "farmacias"}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </DialogHeader>
                </div>

                <div className="px-6 py-6 space-y-6">
                    {onComparePrices && priceInfo && (
                        <Button
                            onClick={onComparePrices}
                            size="lg"
                            className="w-full bg-gradient-to-r from-brand-pink to-brand-teal hover:opacity-90 text-white font-semibold shadow-md"
                        >
                            <MapPin className="size-5 mr-2" />
                            Comparar precios en mi zona
                        </Button>
                    )}

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                            <TabsTrigger value="indications" className="text-xs sm:text-sm py-2">
                                <Info className="size-4 mr-1.5 hidden sm:inline" />
                                Indicaciones
                            </TabsTrigger>
                            <TabsTrigger value="usage" className="text-xs sm:text-sm py-2">
                                <Pill className="size-4 mr-1.5 hidden sm:inline" />
                                Uso
                            </TabsTrigger>
                            <TabsTrigger value="warnings" className="text-xs sm:text-sm py-2">
                                <AlertTriangle className="size-4 mr-1.5 hidden sm:inline" />
                                Advertencias
                            </TabsTrigger>
                            <TabsTrigger value="storage" className="text-xs sm:text-sm py-2">
                                <Thermometer className="size-4 mr-1.5 hidden sm:inline" />
                                Conservación
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="indications" className="space-y-4 mt-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold">¿Para qué sirve?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2.5">
                                        {(drug.indications && drug.indications.length > 0
                                            ? drug.indications
                                            : [
                                                "Consultar el prospecto del medicamento para indicaciones específicas",
                                                "Usar según prescripción médica",
                                            ]
                                        ).map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <span className="text-brand-pink mt-1 text-lg leading-none">•</span>
                                                <span className="text-sm leading-relaxed flex-1">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {drug.composition && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base font-semibold">Composición</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed text-muted-foreground">{drug.composition}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {drug.commercialNames && drug.commercialNames.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base font-semibold">Nombres comerciales</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {drug.commercialNames.map((name, index) => (
                                                <Badge key={index} variant="secondary" className="font-normal">
                                                    {name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="usage" className="space-y-4 mt-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold">Dosificación y administración</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-relaxed">
                                        {drug.dosage ||
                                            "Seguir estrictamente las indicaciones del médico tratante y las instrucciones del prospecto adjunto. No modificar la dosis sin consultar."}
                                    </p>
                                </CardContent>
                            </Card>

                            {drug.sideEffects && drug.sideEffects.length > 0 && (
                                <Card className="border-amber-500/20">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <AlertCircle className="size-5 text-amber-500" />
                                            Efectos secundarios
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2.5">
                                            {drug.sideEffects.map((item, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <span className="text-amber-500 mt-1 text-lg leading-none">•</span>
                                                    <span className="text-sm leading-relaxed flex-1">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {drug.interactions && drug.interactions.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base font-semibold">Interacciones medicamentosas</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2.5">
                                            {drug.interactions.map((item, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <span className="text-brand-teal mt-1 text-lg leading-none">•</span>
                                                    <span className="text-sm leading-relaxed flex-1">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {drug.contraindications && drug.contraindications.length > 0 && (
                                <Card className="border-red-500/20">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <AlertTriangle className="size-5 text-red-500" />
                                            Contraindicaciones
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2.5">
                                            {drug.contraindications.map((item, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <span className="text-red-500 mt-1 text-lg leading-none">•</span>
                                                    <span className="text-sm leading-relaxed flex-1">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="warnings" className="space-y-4 mt-6">
                            <Card className="border-red-500/20">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <AlertTriangle className="size-5 text-red-500" />
                                        Advertencias y precauciones
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2.5">
                                        {(drug.warnings && drug.warnings.length > 0
                                            ? drug.warnings
                                            : [
                                                "Mantener fuera del alcance de los niños",
                                                "No exceder la dosis recomendada",
                                                "Si los síntomas persisten, consultar a su médico",
                                                "No usar después de la fecha de vencimiento",
                                            ]
                                        ).map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <span className="text-red-500 mt-1 text-lg leading-none">•</span>
                                                <span className="text-sm leading-relaxed flex-1">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {drug.requiresPrescription && (
                                <Card className="bg-amber-500/5 border-amber-500/30">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="size-6 text-amber-600 dark:text-amber-400 shrink-0" />
                                            <div className="space-y-2">
                                                <p className="font-semibold text-amber-900 dark:text-amber-100">
                                                    Este medicamento requiere receta médica
                                                </p>
                                                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                                                    Para adquirir este medicamento, deberá presentar una receta médica válida en la farmacia. No
                                                    se automedique y consulte siempre con un profesional de la salud.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="storage" className="space-y-4 mt-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <Thermometer className="size-5 text-blue-500" />
                                        Condiciones de almacenamiento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-relaxed">
                                        {drug.storageConditions ||
                                            "Conservar en lugar fresco y seco, protegido de la luz. Temperatura no mayor a 30°C. No refrigerar a menos que se indique."}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold">Información de vencimiento</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm leading-relaxed">
                                        {drug.expirationInfo ||
                                            "Verificar la fecha de vencimiento impresa en el empaque antes de usar. No consumir después de la fecha indicada."}
                                    </p>
                                    <div className="bg-muted/50 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            <strong>Importante:</strong> Deseche correctamente los medicamentos vencidos o que ya no necesite.
                                            No los arroje a la basura común ni al desagüe.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {priceInfo && priceInfo.branchesWithPrices.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <Building2 className="size-5 text-brand-teal" />
                                    Farmacias con mejores precios
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {priceInfo.branchesWithPrices.slice(0, 5).map(({ price, branch }, index) => (
                                        <div
                                            key={price.id}
                                            className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors space-y-3"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`
                          rounded-full size-8 flex items-center justify-center text-sm font-bold shrink-0
                          ${index === 0 ? "bg-gradient-to-br from-brand-pink to-brand-teal text-white" : "bg-muted text-muted-foreground"}
                        `}
                                                >
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium">{branch.pharmacyName}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {branch.address}, {branch.district}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {branch.hours} • {branch.phone}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-xl font-bold text-brand-pink">{formatPrice(price.price)}</div>
                                                    {price.stockQuantity && price.stockQuantity > 0 && (
                                                        <div className="text-xs text-emerald-600 dark:text-emerald-400">
                                                            Stock: {price.stockQuantity}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Botones de acción */}
                                            <div className="flex gap-2 justify-end flex-wrap">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1.5 bg-transparent"
                                                    onClick={() => openGoogleMaps(branch)}
                                                >
                                                    <Navigation className="size-4" />
                                                    Cómo llegar
                                                </Button>
                                                <Button variant="outline" size="sm" className="gap-1.5 bg-transparent" asChild>
                                                    <a href={`tel:${branch.phone}`}>
                                                        <Phone className="size-4" />
                                                        Llamar
                                                    </a>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className={`gap-1.5 ${addedBranchId === branch.id
                                                            ? "bg-green-600 hover:bg-green-600"
                                                            : "bg-brand-teal hover:bg-brand-teal/90"
                                                        }`}
                                                    onClick={() => handleAddToList(price, branch)}
                                                    disabled={price.stockStatus === "OUT_OF_STOCK"}
                                                >
                                                    {addedBranchId === branch.id ? (
                                                        <>
                                                            <Check className="size-4" />
                                                            Agregado
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="size-4" />
                                                            Agregar a mi lista
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="bg-muted/30 border-muted">
                        <CardContent className="pt-4 pb-4">
                            <p className="text-xs text-muted-foreground text-center leading-relaxed">
                                <strong className="text-foreground">Aviso importante:</strong> Esta información es de carácter educativo
                                y no sustituye la consulta con un profesional de la salud. Siempre consulte a su médico o farmacéutico
                                antes de iniciar, modificar o suspender cualquier tratamiento.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}
