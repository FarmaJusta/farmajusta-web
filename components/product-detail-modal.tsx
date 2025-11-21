"use client";

import React from 'react';
import { Product } from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Phone, Star, Shield, AlertTriangle, Pill, Calendar, Thermometer, Heart, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useAppStore } from "@/lib/store";
import { useState } from "react";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const { cart, favorites, addToCart, toggleFavorite, allProducts } = useAppStore();
  
  if (!product || !product.pharmacy) {
    return null;
  }

  const isFavorite = favorites.includes(product.id);
  const cartItem = cart.find(item => 
    item.productId === product.id && 
    product.pharmacy && 
    item.pharmacyId === product.pharmacy.id
  );
  
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (!product || !product.pharmacy) return;
    
    addToCart(product.id, product.pharmacy.id, quantity);
    setQuantity(1);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
  };

  // Función para obtener información médica completa o por defecto
  const getMedicalInfo = (field: keyof Product, defaultValue: string[] | string): string | string[] => {
    const value = product[field];
    // Solo retornar el valor si es string o string[], sino usar default
    if (typeof value === 'string' || Array.isArray(value)) {
      return value || defaultValue;
    }
    return defaultValue;
  };

  // Función helper para asegurar que siempre retornemos un string renderizable
  const getMedicalInfoAsString = (field: keyof Product, defaultValue: string): string => {
    const value = product[field];
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.join(', ');
    // Para otros tipos (number, boolean, Pharmacy), convertir a string o usar default
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    return defaultValue;
  };

  // Función helper para renderizar información médica en JSX de forma segura
  const renderMedicalInfo = (field: keyof Product, defaultValue: string | string[]): React.ReactNode => {
    const value = getMedicalInfo(field, defaultValue);
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value)) {
      return (
        <ul className="space-y-1">
          {value.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-[#db1a85] mr-2">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }
    return String(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl min-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {product.name}
            {product.isGeneric && (
              <Badge className="bg-[#0ec1ac]/10 text-[#0ec1ac] border-[#0ec1ac]/20">
                Genérico
              </Badge>
            )}
            {product.prescription && (
              <Badge variant="outline" className="border-[#db1a85]/20 text-[#db1a85]">
                <Shield className="h-3 w-3 mr-1" />
                Receta
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Información Principal */}
          <div className="space-y-4">
            {/* Precio y Farmacia */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información de Precio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-[#db1a85]">
                    S/ {product.price.toFixed(2)}
                  </div>
                  {product.originalPrice && (
                    <div className="space-y-1">
                      <div className="text-lg text-muted-foreground line-through">
                        S/ {product.originalPrice.toFixed(2)}
                      </div>
                      {discountPercentage && (
                        <Badge className="bg-[#db1a85] text-white">
                          -{discountPercentage}% de descuento
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Información de la Farmacia */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Disponible en:</h4>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{product.pharmacy.name}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{product.pharmacy.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{product.pharmacy.address}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{product.pharmacy.hours}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{product.pharmacy.phone}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        product.pharmacy.isOpen 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.pharmacy.isOpen ? 'Abierto' : 'Cerrado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controles de Cantidad y Compra */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Cantidad:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      (Stock: {product.stock})
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 bg-linear-to-r from-[#db1a85] to-[#0ec1ac] hover:from-[#db1a85]/90 hover:to-[#0ec1ac]/90 text-white"
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {cartItem ? `${cartItem.quantity} en carrito` : 'Agregar al carrito'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleToggleFavorite}
                      className="px-3"
                    >
                      <Heart className={`h-4 w-4 ${
                        isFavorite ? 'fill-[#db1a85] text-[#db1a85]' : 'text-muted-foreground'
                      }`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="font-medium">Laboratorio:</span>
                    <p className="text-muted-foreground">{product.laboratory}</p>
                  </div>
                  <div>
                    <span className="font-medium">Presentación:</span>
                    <p className="text-muted-foreground">{product.presentation}</p>
                  </div>
                  <div>
                    <span className="font-medium">Principio Activo:</span>
                    <p className="text-muted-foreground">{getMedicalInfoAsString('activeIngredient', 'No especificado')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span>
                    <p className="text-muted-foreground">
                      {product.isGeneric ? 'Medicamento Genérico' : 'Medicamento de Marca'}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <span className="font-medium">Descripción:</span>
                  <p className="text-muted-foreground mt-1">{product.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información Médica Detallada */}
          <div className="space-y-4">
            <Tabs defaultValue="indications" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="indications">Indicaciones</TabsTrigger>
                <TabsTrigger value="dosage">Dosificación</TabsTrigger>
                <TabsTrigger value="warnings">Advertencias</TabsTrigger>
                <TabsTrigger value="storage">Conservación</TabsTrigger>
              </TabsList>
              
              <TabsContent value="indications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Pill className="h-5 w-5 text-[#0ec1ac]" />
                      Indicaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {renderMedicalInfo('indications', [
                        'Alivio de síntomas según indicación médica',
                        'Consultar prospecto para usos específicos'
                      ])}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Contraindicaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {renderMedicalInfo('contraindications', [
                        'Hipersensibilidad a los componentes',
                        'Consultar con profesional médico antes del uso'
                      ])}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="dosage" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dosificación y Administración</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {renderMedicalInfo('dosage', 'Seguir estrictamente las indicaciones del médico tratante y las instrucciones del prospecto adjunto.')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Composición</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {renderMedicalInfo('composition', `Contiene ${getMedicalInfoAsString('activeIngredient', 'No especificado')} como principio activo, más excipientes farmacéuticos.`)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Efectos Secundarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {renderMedicalInfo('sideEffects', [
                        'Posibles reacciones adversas según prospecto',
                        'Consultar médico si aparecen efectos no deseados'
                      ])}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="warnings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Advertencias y Precauciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {renderMedicalInfo('warnings', [
                        'Mantener fuera del alcance de los niños',
                        'No exceder la dosis recomendada',
                        'Consultar médico si los síntomas persisten'
                      ])}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Interacciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {renderMedicalInfo('interactions', [
                        'Informar al médico sobre otros medicamentos que esté tomando',
                        'Consultar interacciones medicamentosas específicas'
                      ])}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="storage" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-blue-500" />
                      Condiciones de Almacenamiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {renderMedicalInfo('storageConditions', 'Conservar en lugar seco y fresco, protegido de la luz. Temperatura no mayor a 30°C.')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-500" />
                      Información de Vencimiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      <span className="font-medium">Fecha de vencimiento:</span> {renderMedicalInfo('expirationDate', 'Ver fecha en el empaque')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      No usar después de la fecha de vencimiento. Verificar la fecha en el empaque antes del consumo.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
