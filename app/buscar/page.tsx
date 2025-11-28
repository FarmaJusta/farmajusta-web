"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { DrugSearch } from "@/components/drug-search"
import { ComparisonResults } from "@/components/comparison-results"
import { LocationSelector } from "@/components/location-selector"
import { PharmacyMap } from "@/components/pharmacy-map"
import { RadiusSelector } from "@/components/radius-selector"
import { ChatbotWidget } from "@/components/chatbot-widget"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, ArrowLeft, Loader2 } from "lucide-react"
import type { Drug, LocationData, DrugComparisonResult } from "@/lib/types"
import { compareEquivalentDrugs } from "@/lib/search-service"
import { mockDrugs } from "@/lib/farmajusta-data"
import { trackSearch, generateSessionId } from "@/lib/analytics-service"
import { Toaster } from "sonner"

function BuscarContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const medicamentoId = searchParams.get("medicamento")

    const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)
    const [userLocation, setUserLocation] = useState<LocationData | null>(null)
    const [searchRadius, setSearchRadius] = useState(5)
    const [comparisonResults, setComparisonResults] = useState<DrugComparisonResult[]>([])
    const [sessionId, setSessionId] = useState<string>("")
    const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setSessionId(generateSessionId())
    }, [])

    useEffect(() => {
        if (medicamentoId) {
            const drug = mockDrugs.find((d: Drug) => d.id === medicamentoId)
            if (drug) {
                setSelectedDrug(drug)
            }
        }
        setIsLoading(false)
    }, [medicamentoId])

    const handleDrugSelect = (drug: Drug) => {
        setSelectedDrug(drug)
        router.push(`/buscar?medicamento=${encodeURIComponent(drug.id)}`, { scroll: false })

        if (sessionId) {
            trackSearch({
                searchTerm: drug.dci,
                normalizedDrugId: drug.id,
                location: userLocation || undefined,
                sessionId,
            })
        }

        if (userLocation) {
            const results = compareEquivalentDrugs(drug.id, userLocation, searchRadius)
            setComparisonResults(results)
        }
    }

    const handleLocationSelect = (location: LocationData) => {
        setUserLocation(location)

        if (selectedDrug) {
            const results = compareEquivalentDrugs(selectedDrug.id, location, searchRadius)
            setComparisonResults(results)
        }
    }

    const handleRadiusChange = (radius: number) => {
        setSearchRadius(radius)

        if (selectedDrug && userLocation) {
            const results = compareEquivalentDrugs(selectedDrug.id, userLocation, radius)
            setComparisonResults(results)
        }
    }

    const handleViewMap = (branchId: string) => {
        setSelectedBranchId(branchId)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-brand-pink" />
            </div>
        )
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

                        <div className="max-w-2xl">
                            <DrugSearch onDrugSelect={handleDrugSelect} initialDrug={selectedDrug || undefined} />
                        </div>
                    </div>

                    {selectedDrug ? (
                        <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-2 lg:order-1">
                                <LocationSelector onLocationSelect={handleLocationSelect} currentLocation={userLocation || undefined} />

                                {userLocation && (
                                    <Card className="p-4 sm:p-6">
                                        <RadiusSelector value={searchRadius} onChange={handleRadiusChange} />
                                    </Card>
                                )}

                                <Card className="p-4 sm:p-6">
                                    <Button
                                        variant="outline"
                                        className="w-full bg-transparent"
                                        onClick={() => {
                                            setSelectedDrug(null)
                                            setComparisonResults([])
                                            router.push("/buscar")
                                        }}
                                    >
                                        Nueva búsqueda
                                    </Button>
                                </Card>
                            </div>

                            <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
                                {comparisonResults.length > 0 ? (
                                    <Tabs defaultValue="list" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="list">Lista de precios</TabsTrigger>
                                            <TabsTrigger value="map">Ver en mapa</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="list" className="mt-4 sm:mt-6">
                                            <ComparisonResults
                                                results={comparisonResults}
                                                selectedDrug={selectedDrug}
                                                onViewMap={handleViewMap}
                                            />
                                        </TabsContent>

                                        <TabsContent value="map" className="mt-4 sm:mt-6">
                                            <PharmacyMap
                                                branches={comparisonResults.map((r) => r.branch)}
                                                userLocation={userLocation || undefined}
                                                selectedBranchId={selectedBranchId}
                                                onBranchSelect={setSelectedBranchId}
                                            />
                                        </TabsContent>
                                    </Tabs>
                                ) : (
                                    <Card className="p-8 sm:p-12">
                                        <div className="text-center">
                                            <MapPin className="size-10 sm:size-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">Establece tu ubicación</h3>
                                            <p className="text-muted-foreground text-sm sm:text-base">
                                                Para ver farmacias cercanas y comparar precios, por favor comparte tu ubicación o selecciona un
                                                distrito.
                                            </p>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Card className="p-8 sm:p-12">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold mb-2">Busca un medicamento</h3>
                                <p className="text-muted-foreground text-sm sm:text-base">
                                    Usa el buscador de arriba para encontrar medicamentos y comparar precios en farmacias cercanas.
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </section>

            <ChatbotWidget />
        </div>
    )
}

export default function BuscarPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-brand-pink" />
                </div>
            }
        >
            <BuscarContent />
        </Suspense>
    )
}
