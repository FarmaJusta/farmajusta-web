"use client"

import { useState, useEffect } from "react"
import { useFarmaNexoStore } from "@/lib/farmanexo-store"
import { mockDrugs } from "@/lib/farmanexo-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Clock, Search, Settings, Shield, Heart, Trash2, Edit3, Save, X, Pill } from "lucide-react"
import type { Drug, SearchHistoryItem } from "@/lib/types"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UserProfile {
  name: string
  email: string
  phone: string
  address: string
  district: string
  preferences: {
    preferGeneric: boolean
    maxDistance: number
    notifications: boolean
  }
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [mounted, setMounted] = useState(false)
  const { favorites, searchHistory, searchRadius, toggleFavorite, clearSearchHistory, setSearchRadius } =
    useFarmaNexoStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    district: "San Isidro",
    preferences: {
      preferGeneric: true,
      maxDistance: searchRadius,
      notifications: true,
    },
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ ...userProfile })

  const favoriteDrugs = mounted ? mockDrugs.filter((drug: Drug) => favorites.includes(drug.id)) : []

  const distritos = [
    "San Isidro",
    "Miraflores",
    "San Borja",
    "Surco",
    "La Molina",
    "Barranco",
    "Jesús María",
    "Lince",
    "Magdalena",
    "Pueblo Libre",
    "San Miguel",
  ]

  const handleSaveProfile = () => {
    setUserProfile(editForm)
    if (editForm.preferences.maxDistance !== searchRadius) {
      setSearchRadius(editForm.preferences.maxDistance)
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditForm({ ...userProfile })
    setIsEditing(false)
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  if (!mounted) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="size-5 text-brand-pink" />
            Mi Perfil
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="favorites" className="text-xs sm:text-sm">
              <Heart className="size-3 sm:size-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Favoritos</span>
              <span className="sm:hidden">Favs</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">
              <Clock className="size-3 sm:size-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Historial</span>
              <span className="sm:hidden">Hist</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm">
              <User className="size-3 sm:size-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Datos</span>
              <span className="sm:hidden">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">
              <Settings className="size-3 sm:size-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Preferencias</span>
              <span className="sm:hidden">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="mt-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Heart className="size-4 sm:size-5 text-brand-pink" />
                  Medicamentos Favoritos ({favoriteDrugs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favoriteDrugs.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="size-10 sm:size-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm sm:text-base">No tienes medicamentos favoritos aún</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Marca medicamentos como favoritos para encontrarlos fácilmente
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {favoriteDrugs.map((drug: Drug) => (
                      <div
                        key={drug.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="rounded-full bg-brand-pink/10 p-2 shrink-0">
                            <Pill className="size-4 text-brand-pink" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{drug.commercialNames?.[0] || drug.dci}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {drug.concentration} - {drug.pharmaceuticalForm}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {drug.isGeneric && (
                            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                              Genérico
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive h-8 w-8"
                            onClick={() => toggleFavorite(drug.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Clock className="size-4 sm:size-5 text-brand-teal" />
                    Historial de Búsquedas
                  </CardTitle>
                  {searchHistory.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearSearchHistory} className="text-xs bg-transparent">
                      <Trash2 className="size-3 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {searchHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="size-10 sm:size-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm sm:text-base">No tienes búsquedas recientes</p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {searchHistory.slice(0, 10).map((search: SearchHistoryItem) => (
                      <div
                        key={search.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <Search className="size-4 text-muted-foreground" />
                          <span className="text-sm">{search.term}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(search.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <User className="size-4 sm:size-5 text-brand-pink" />
                    Datos Personales
                  </CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit3 className="size-3 mr-1" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        <X className="size-3 mr-1" />
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={handleSaveProfile} className="bg-brand-teal hover:bg-brand-teal/90">
                        <Save className="size-3 mr-1" />
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nombre</label>
                    <Input
                      value={isEditing ? editForm.name : userProfile.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input
                      type="email"
                      value={isEditing ? editForm.email : userProfile.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      disabled={!isEditing}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Teléfono</label>
                    <Input
                      value={isEditing ? editForm.phone : userProfile.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="+51 999 999 999"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Distrito</label>
                    <Select
                      value={isEditing ? editForm.district : userProfile.district}
                      onValueChange={(value) => setEditForm({ ...editForm, district: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {distritos.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Dirección</label>
                  <Input
                    value={isEditing ? editForm.address : userProfile.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Tu dirección"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  <Shield className="size-3 inline mr-1" />
                  Tus datos están protegidos y solo se usan para mejorar tu experiencia en FarmaNexo.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Settings className="size-4 sm:size-5 text-brand-teal" />
                  Preferencias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Preferir genéricos</p>
                    <p className="text-xs text-muted-foreground">Mostrar primero medicamentos genéricos</p>
                  </div>
                  <Switch
                    checked={userProfile.preferences.preferGeneric}
                    onCheckedChange={(checked) =>
                      setUserProfile({
                        ...userProfile,
                        preferences: { ...userProfile.preferences, preferGeneric: checked },
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Notificaciones</p>
                    <p className="text-xs text-muted-foreground">Recibir alertas de precios y ofertas</p>
                  </div>
                  <Switch
                    checked={userProfile.preferences.notifications}
                    onCheckedChange={(checked) =>
                      setUserProfile({
                        ...userProfile,
                        preferences: { ...userProfile.preferences, notifications: checked },
                      })
                    }
                  />
                </div>

                <Separator />

                <div>
                  <p className="font-medium text-sm mb-2">Radio de búsqueda</p>
                  <p className="text-xs text-muted-foreground mb-3">Distancia máxima para buscar farmacias cercanas</p>
                  <Select value={String(searchRadius)} onValueChange={(value) => setSearchRadius(Number(value))}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 km</SelectItem>
                      <SelectItem value="2">2 km</SelectItem>
                      <SelectItem value="3">3 km</SelectItem>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileModal
