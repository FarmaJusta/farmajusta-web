"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Navigation, Search, Clock, CheckCircle, Loader2, AlertCircle, Star } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface District {
  name: string;
  zone: string;
  popularAreas: string[];
}

const limaDistricts: District[] = [
  {
    name: "San Isidro",
    zone: "Lima Centro",
    popularAreas: ["Centro Financiero", "Camino Real", "Corpac", "Country Club"]
  },
  {
    name: "Miraflores", 
    zone: "Lima Centro",
    popularAreas: ["Malecón", "Parque Kennedy", "Larcomar", "Pardo"]
  },
  {
    name: "San Borja",
    zone: "Lima Centro", 
    popularAreas: ["Centro", "Aviación", "San Luis", "Javier Prado"]
  },
  {
    name: "Surco",
    zone: "Lima Sur",
    popularAreas: ["Chacarilla", "Centro", "Higuereta", "Monterrico"]
  },
  {
    name: "La Molina",
    zone: "Lima Este",
    popularAreas: ["Centro", "Rinconada", "Sol de la Molina", "Universidad"]
  },
  {
    name: "Barranco",
    zone: "Lima Sur",
    popularAreas: ["Centro Histórico", "Malecón", "Bajada de Baños", "Ayacucho"]
  },
  {
    name: "Jesús María",
    zone: "Lima Centro",
    popularAreas: ["Centro", "Stadium", "Av. Brasil", "Campo de Marte"]
  },
  {
    name: "Lince",
    zone: "Lima Centro",
    popularAreas: ["Arequipa", "Petit Thouars", "Centro", "Mariscal Sucre"]
  },
  {
    name: "Magdalena",
    zone: "Lima Centro",
    popularAreas: ["Centro", "Playa", "Universitaria", "Brasil"]
  },
  {
    name: "Pueblo Libre",
    zone: "Lima Centro",
    popularAreas: ["Centro", "Universidad", "Bolívar", "Sucre"]
  },
  {
    name: "San Miguel",
    zone: "Lima Norte",
    popularAreas: ["Centro", "Universidad", "Plaza Norte", "Bertello"]
  },
  {
    name: "Los Olivos",
    zone: "Lima Norte",
    popularAreas: ["Centro", "Pro", "Alfredo Mendiola", "Universitaria"]
  }
];

export function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const { userLocation, setUserLocation } = useAppStore();
  const [selectedDistrict, setSelectedDistrict] = useState<string>(userLocation?.address || "San Isidro");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const filteredDistricts = limaDistricts.filter(district => 
    district.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    district.popularAreas.some(area => 
      area.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);
    
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocalización no soportada por este navegador");
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Simular reverse geocoding (en una app real usarías Google Maps API)
      const mockAddress = getDistrictFromCoordinates(latitude, longitude);
      
      setCurrentLocation({
        lat: latitude,
        lng: longitude,
        address: mockAddress
      });
      
      setSelectedDistrict(mockAddress);
      
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      setLocationError(
        error instanceof Error 
          ? error.message 
          : "No se pudo obtener tu ubicación. Por favor, selecciona manualmente."
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Función mock para simular reverse geocoding
  const getDistrictFromCoordinates = (lat: number, lng: number): string => {
    // Coordenadas aproximadas del centro de Lima
    const limaCenterLat = -12.0464;
    const limaCenterLng = -77.0428;
    
    // Calcular distancia simple y asignar distrito más probable
    const distance = Math.sqrt(
      Math.pow(lat - limaCenterLat, 2) + Math.pow(lng - limaCenterLng, 2)
    );
    
    if (distance < 0.02) return "Lima Centro";
    if (lat > limaCenterLat && lng > limaCenterLng) return "San Isidro";
    if (lat > limaCenterLat && lng < limaCenterLng) return "Miraflores";
    if (lat < limaCenterLat && lng > limaCenterLng) return "San Borja";
    if (lat < limaCenterLat && lng < limaCenterLng) return "Surco";
    
    return "San Isidro"; // Default
  };

  const handleSaveLocation = () => {
    const district = limaDistricts.find(d => d.name === selectedDistrict);
    const coordinates = currentLocation || {
      lat: -12.0464, // Centro de Lima por defecto
      lng: -77.0428,
      address: selectedDistrict
    };
    
    setUserLocation({
      lat: coordinates.lat,
      lng: coordinates.lng,
      address: selectedDistrict
    });
    
    onClose();
  };

  const getDistrictZoneColor = (zone: string) => {
    switch (zone) {
      case "Lima Centro": return "bg-blue-100 text-blue-700";
      case "Lima Norte": return "bg-green-100 text-green-700";
      case "Lima Sur": return "bg-orange-100 text-orange-700";
      case "Lima Este": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl min-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-[#0ec1ac]" />
            Seleccionar Ubicación
          </DialogTitle>
          <p className="text-muted-foreground">
            Elige tu distrito para encontrar farmacias cercanas y obtener mejores resultados
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ubicación Automática */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-[#db1a85]" />
                  Detectar Automáticamente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Usa tu ubicación actual para encontrar farmacias cercanas
                </p>
                
                {currentLocation && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Ubicación detectada</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      {currentLocation.address}
                    </p>
                    <p className="text-xs text-green-500">
                      Lat: {currentLocation.lat.toFixed(4)}, Lng: {currentLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}
                
                {locationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Error</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      {locationError}
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="w-full bg-[#0ec1ac] hover:bg-[#0ec1ac]/90"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Detectando...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Usar mi ubicación
                    </>
                  )}
                </Button>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Necesitas permitir el acceso a la ubicación</p>
                  <p>• Los datos de ubicación no se almacenan</p>
                  <p>• Solo se usa para mejorar la búsqueda</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selección Manual */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-[#db1a85]" />
                  Seleccionar Manualmente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    placeholder="Buscar distrito o zona..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {filteredDistricts.map((district) => (
                    <div
                      key={district.name}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedDistrict === district.name
                          ? 'border-[#0ec1ac] bg-[#0ec1ac]/5'
                          : 'border-border hover:border-[#0ec1ac]/50'
                      }`}
                      onClick={() => setSelectedDistrict(district.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{district.name}</h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs mt-1 ${getDistrictZoneColor(district.zone)}`}
                          >
                            {district.zone}
                          </Badge>
                        </div>
                        {selectedDistrict === district.name && (
                          <CheckCircle className="h-5 w-5 text-[#0ec1ac]" />
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          Zonas populares: {district.popularAreas.slice(0, 3).join(", ")}
                          {district.popularAreas.length > 3 && "..."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredDistricts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No se encontraron distritos que coincidan con tu búsqueda
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Ubicación Actual */}
        {userLocation && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <MapPin className="h-5 w-5 text-[#0ec1ac]" />
            <div>
              <p className="font-medium">Ubicación actual</p>
              <p className="text-sm text-muted-foreground">{userLocation.address}</p>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveLocation}
            className="bg-[#0ec1ac] hover:bg-[#0ec1ac]/90"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Guardar Ubicación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
