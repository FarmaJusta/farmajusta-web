"use client"

import { useState, useEffect } from "react"
import { MapPin, Navigation, Phone, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { PharmacyBranch, LocationData } from "@/lib/types"
import { calculateDistance } from "@/lib/search-service"

interface PharmacyMapProps {
    branches: PharmacyBranch[]
    userLocation?: LocationData
    selectedBranchId?: string
    onBranchSelect?: (branchId: string) => void
}

export function PharmacyMap({ branches, userLocation, selectedBranchId, onBranchSelect }: PharmacyMapProps) {
    const [selectedBranch, setSelectedBranch] = useState<PharmacyBranch | null>(null)

    useEffect(() => {
        if (selectedBranchId) {
            const branch = branches.find((b) => b.id === selectedBranchId)
            if (branch) {
                setSelectedBranch(branch)
            }
        }
    }, [selectedBranchId, branches])

    const handleBranchClick = (branch: PharmacyBranch) => {
        setSelectedBranch(branch)
        onBranchSelect?.(branch.id)
    }

    const handleOpenInMaps = (branch: PharmacyBranch) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${branch.coordinates.lat},${branch.coordinates.lng}`
        window.open(url, "_blank")
    }

    // Calcular centro del mapa
    const mapCenter = userLocation || (branches.length > 0 ? branches[0].coordinates : { lat: -12.0464, lng: -77.0306 })

    return (
        <div className="space-y-4">
            {/* Mapa simulado con pins */}
            <Card className="relative overflow-hidden bg-muted" style={{ height: "500px" }}>
                {/* Indicador de ubicación del usuario */}
                {userLocation && (
                    <div
                        className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: "50%",
                            top: "50%",
                        }}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-brand-teal rounded-full animate-ping opacity-75" />
                            <div className="relative bg-brand-teal rounded-full p-2">
                                <Navigation className="size-6 text-white" />
                            </div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap">
                            <Badge className="bg-brand-teal">Tu ubicación</Badge>
                        </div>
                    </div>
                )}

                {/* Pins de farmacias */}
                {branches.map((branch, index) => {
                    const distance = userLocation
                        ? calculateDistance(userLocation.lat, userLocation.lng, branch.coordinates.lat, branch.coordinates.lng)
                        : null

                    // Posicionar pins de manera visual alrededor del centro
                    const angle = (index / branches.length) * 2 * Math.PI
                    const radius = 150 + (distance ? Math.min(distance * 20, 100) : 50)
                    const x = 50 + Math.cos(angle) * (radius / 500) * 50
                    const y = 50 + Math.sin(angle) * (radius / 500) * 50

                    return (
                        <button
                            key={branch.id}
                            className="absolute z-20 transform -translate-x-1/2 -translate-y-full cursor-pointer hover:scale-110 transition-transform"
                            style={{
                                left: `${x}%`,
                                top: `${y}%`,
                            }}
                            onClick={() => handleBranchClick(branch)}
                        >
                            <MapPin
                                className={`size-8 ${selectedBranch?.id === branch.id
                                        ? "text-brand-pink fill-brand-pink"
                                        : "text-brand-teal fill-brand-teal"
                                    }`}
                            />
                            {distance && (
                                <Badge className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs">{distance} km</Badge>
                            )}
                        </button>
                    )
                })}

                {/* Overlay con instrucciones */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg text-center max-w-md">
                        <MapPin className="size-12 text-brand-teal mx-auto mb-2" />
                        <h3 className="font-semibold text-lg">Mapa de farmacias</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            Haz clic en los marcadores para ver detalles de cada farmacia
                        </p>
                    </div>
                </div>
            </Card>

            {/* Detalle de farmacia seleccionada */}
            {selectedBranch && (
                <Dialog open={!!selectedBranch} onOpenChange={() => setSelectedBranch(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedBranch.pharmacyName}</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <MapPin className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Dirección</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedBranch.address}, {selectedBranch.district}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Clock className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Horario</p>
                                        <p className="text-sm text-muted-foreground">{selectedBranch.hours}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Phone className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Teléfono</p>
                                        <p className="text-sm text-muted-foreground">{selectedBranch.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 gap-2 bg-brand-teal hover:bg-brand-teal/90"
                                    onClick={() => handleOpenInMaps(selectedBranch)}
                                >
                                    <Navigation className="size-4" />
                                    Abrir en Google Maps
                                </Button>
                                <Button className="flex-1 gap-2 bg-transparent" variant="outline" asChild>
                                    <a href={`tel:${selectedBranch.phone}`}>
                                        <Phone className="size-4" />
                                        Llamar
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
