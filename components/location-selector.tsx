"use client"

import { useState } from "react"
import { MapPin, Navigation, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { LocationData } from "@/lib/types"

interface LocationSelectorProps {
    onLocationSelect: (location: LocationData) => void
    currentLocation?: LocationData
}

const limaDistricts = [
    "San Isidro",
    "Miraflores",
    "San Borja",
    "Surco",
    "La Molina",
    "Lima Centro",
    "Breña",
    "Jesús María",
    "Lince",
    "Pueblo Libre",
    "San Miguel",
    "Magdalena",
    "Barranco",
    "Chorrillos",
    "San Juan de Miraflores",
]

// Coordenadas aproximadas por distrito (centro del distrito)
const districtCoordinates: Record<string, { lat: number; lng: number }> = {
    "San Isidro": { lat: -12.0954, lng: -77.0397 },
    Miraflores: { lat: -12.1215, lng: -77.0298 },
    "San Borja": { lat: -12.0985, lng: -76.996 },
    Surco: { lat: -12.1342, lng: -77.0012 },
    "La Molina": { lat: -12.0799, lng: -76.9419 },
    "Lima Centro": { lat: -12.0464, lng: -77.0306 },
    Breña: { lat: -12.0598, lng: -77.0522 },
    "Jesús María": { lat: -12.073, lng: -77.042 },
    Lince: { lat: -12.0823, lng: -77.0375 },
    "Pueblo Libre": { lat: -12.0745, lng: -77.0649 },
    "San Miguel": { lat: -12.0761, lng: -77.0872 },
    Magdalena: { lat: -12.0908, lng: -77.0745 },
    Barranco: { lat: -12.1465, lng: -77.0204 },
    Chorrillos: { lat: -12.1681, lng: -77.0157 },
    "San Juan de Miraflores": { lat: -12.1565, lng: -76.9736 },
}

export function LocationSelector({ onLocationSelect, currentLocation }: LocationSelectorProps) {
    const [isGettingLocation, setIsGettingLocation] = useState(false)
    const [selectedDistrict, setSelectedDistrict] = useState<string>("")
    const [error, setError] = useState<string>("")

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("Tu navegador no soporta geolocalización")
            return
        }

        setIsGettingLocation(true)
        setError("")

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location: LocationData = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    city: "Lima",
                }
                onLocationSelect(location)
                setIsGettingLocation(false)
            },
            (error) => {
                setIsGettingLocation(false)
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setError("Permiso de ubicación denegado. Por favor, activa la ubicación en tu navegador.")
                        break
                    case error.POSITION_UNAVAILABLE:
                        setError("No se pudo obtener tu ubicación. Intenta con un distrito.")
                        break
                    case error.TIMEOUT:
                        setError("Tiempo de espera agotado. Intenta nuevamente.")
                        break
                    default:
                        setError("Error al obtener tu ubicación.")
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            },
        )
    }

    const handleDistrictSelect = (district: string) => {
        setSelectedDistrict(district)
        const coords = districtCoordinates[district]
        if (coords) {
            const location: LocationData = {
                ...coords,
                district,
                city: "Lima",
            }
            onLocationSelect(location)
            setError("")
        }
    }

    return (
        <Card className="p-6">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="size-5 text-brand-teal" />
                        ¿Dónde te encuentras?
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Para mostrarte las farmacias más cercanas (radio de 5 km)
                    </p>
                </div>

                {error && (
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                {currentLocation && (
                    <div className="p-3 bg-brand-teal/10 border border-brand-teal/20 rounded-lg">
                        <p className="text-sm font-medium text-brand-teal">Ubicación establecida</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {currentLocation.district || `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    <Button
                        onClick={handleGetCurrentLocation}
                        disabled={isGettingLocation}
                        className="w-full gap-2 bg-brand-teal hover:bg-brand-teal/90"
                        size="lg"
                    >
                        {isGettingLocation ? (
                            <>
                                <Loader2 className="size-5 animate-spin" />
                                Obteniendo ubicación...
                            </>
                        ) : (
                            <>
                                <Navigation className="size-5" />
                                Usar mi ubicación actual
                            </>
                        )}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">O selecciona un distrito</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="district">Distrito de Lima</Label>
                        <Select value={selectedDistrict} onValueChange={handleDistrictSelect}>
                            <SelectTrigger id="district">
                                <SelectValue placeholder="Selecciona tu distrito" />
                            </SelectTrigger>
                            <SelectContent>
                                {limaDistricts.map((district) => (
                                    <SelectItem key={district} value={district}>
                                        {district}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </Card>
    )
}
