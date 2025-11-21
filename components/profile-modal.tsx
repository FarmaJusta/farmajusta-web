"use client";

import React, { useState } from 'react';
import { useAppStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Clock, Search, Package, Settings, Bell, Shield, Heart, Trash2, Edit3, Save, X } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { 
    userProfile, 
    searchHistory, 
    orderHistory, 
    favorites,
    allProducts,
    updateProfile, 
    clearSearchHistory 
  } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
    district: userProfile?.district || 'San Isidro',
    preferences: {
      preferGeneric: userProfile?.preferences?.preferGeneric ?? true,
      maxDistance: userProfile?.preferences?.maxDistance ?? 10,
      notifications: userProfile?.preferences?.notifications ?? true,
    }
  });

  const favoriteProducts = allProducts.filter(product => favorites.includes(product.id));
  
  const distritos = [
    'San Isidro', 'Miraflores', 'San Borja', 'Surco', 'La Molina', 'Barranco',
    'Jesús María', 'Lince', 'Magdalena', 'Pueblo Libre', 'San Miguel'
  ];

  const handleSaveProfile = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: userProfile?.name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
      district: userProfile?.district || 'San Isidro',
      preferences: {
        preferGeneric: userProfile?.preferences?.preferGeneric ?? true,
        maxDistance: userProfile?.preferences?.maxDistance ?? 10,
        notifications: userProfile?.preferences?.notifications ?? true,
      }
    });
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-[#db1a85]" />
            Mi Perfil
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
          </TabsList>

          {/* Perfil Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card 
              className="bg-white/25 backdrop-blur-[10px] border border-white/30 hover:border-white/50 hover:bg-white/30 transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[#0ec1ac]" />
                    Información Personal
                  </CardTitle>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleSaveProfile}
                        className="bg-[#0ec1ac] hover:bg-[#0ec1ac]/90"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nombre completo</label>
                    {isEditing ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        placeholder="Tu nombre completo"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">
                        {userProfile?.name || 'No especificado'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        placeholder="tu@email.com"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">
                        {userProfile?.email || 'No especificado'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Teléfono</label>
                    {isEditing ? (
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        placeholder="+51 999 999 999"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">
                        {userProfile?.phone || 'No especificado'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Distrito</label>
                    {isEditing ? (
                      <Select
                        value={editForm.district}
                        onValueChange={(value) => setEditForm({...editForm, district: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {distritos.map((distrito) => (
                            <SelectItem key={distrito} value={distrito}>
                              {distrito}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">
                        {userProfile?.district || 'San Isidro'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Dirección</label>
                  {isEditing ? (
                    <Input
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      placeholder="Tu dirección completa"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground p-2">
                      {userProfile?.address || 'No especificado'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preferencias */}
            <Card 
              className="bg-white/25 backdrop-blur-[10px] border border-white/30 hover:border-white/50 hover:bg-white/30 transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#db1a85]" />
                  Preferencias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Preferir medicamentos genéricos</p>
                    <p className="text-sm text-muted-foreground">
                      Mostrar primero opciones genéricas para ahorrar
                    </p>
                  </div>
                  <Switch
                    checked={isEditing ? editForm.preferences.preferGeneric : userProfile?.preferences?.preferGeneric ?? true}
                    onCheckedChange={(checked: boolean) => 
                      isEditing && setEditForm({
                        ...editForm, 
                        preferences: {...editForm.preferences, preferGeneric: checked}
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones</p>
                    <p className="text-sm text-muted-foreground">
                      Recibir alertas de precios y ofertas
                    </p>
                  </div>
                  <Switch
                    checked={isEditing ? editForm.preferences.notifications : userProfile?.preferences?.notifications ?? true}
                    onCheckedChange={(checked: boolean) => 
                      isEditing && setEditForm({
                        ...editForm, 
                        preferences: {...editForm.preferences, notifications: checked}
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <label className="font-medium">Distancia máxima (km)</label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Farmacias dentro de este radio
                  </p>
                  {isEditing ? (
                    <Select
                      value={editForm.preferences.maxDistance.toString()}
                      onValueChange={(value) => setEditForm({
                        ...editForm, 
                        preferences: {...editForm.preferences, maxDistance: parseInt(value)}
                      })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 km</SelectItem>
                        <SelectItem value="10">10 km</SelectItem>
                        <SelectItem value="15">15 km</SelectItem>
                        <SelectItem value="20">20 km</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {userProfile?.preferences?.maxDistance || 10} km
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historial de Búsquedas Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card 
              className="bg-white/25 backdrop-blur-[10px] border border-white/30 hover:border-white/50 hover:bg-white/30 transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-[#0ec1ac]" />
                    Historial de Búsquedas
                  </CardTitle>
                  {searchHistory.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSearchHistory}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpiar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {searchHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay búsquedas recientes
                  </p>
                ) : (
                  <div className="space-y-3">
                    {searchHistory.map((search) => (
                      <div key={search.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{search.query}</p>
                          <p className="text-sm text-muted-foreground">
                            {search.resultsCount} resultados • {formatDate(search.timestamp)}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(search.timestamp).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favoritos Tab */}
          <TabsContent value="favorites" className="space-y-4">
            <Card 
              className="bg-white/25 backdrop-blur-[10px] border border-white/30 hover:border-white/50 hover:bg-white/30 transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-[#db1a85]" />
                  Medicamentos Favoritos ({favoriteProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favoriteProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No tienes medicamentos favoritos aún
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoriteProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.pharmacy.name} • S/ {product.price.toFixed(2)}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {product.isGeneric && (
                              <Badge variant="secondary" className="text-xs">
                                Genérico
                              </Badge>
                            )}
                            {product.prescription && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Receta
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {product.pharmacy.distance}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pedidos Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card 
              className="bg-white/25 backdrop-blur-[10px] border border-white/30 hover:border-white/50 hover:bg-white/30 transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#0ec1ac]" />
                  Historial de Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No tienes pedidos aún
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">Pedido #{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.pharmacyName} • {formatDate(order.timestamp)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={
                                order.status === 'completed' ? 'default' :
                                order.status === 'pending' ? 'secondary' : 'destructive'
                              }
                            >
                              {order.status === 'completed' ? 'Completado' :
                               order.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                            </Badge>
                            <p className="text-lg font-bold text-[#db1a85] mt-1">
                              S/ {order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
