"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Product } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductDetailModal } from "@/components/product-detail-modal";
import { Heart, MapPin, Star, ShoppingCart, Clock, Shield, TrendingDown, Pill, Plus, Minus, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const getMedicationIcon = (name: string, isGeneric: boolean) => {
  const iconClass = `h-8 w-8 ${isGeneric ? 'text-[#0ec1ac]' : 'text-[#db1a85]'}`;
  
  if (name.toLowerCase().includes('paracetamol') || name.toLowerCase().includes('tylenol')) {
    return <Pill className={iconClass} />;
  }
  if (name.toLowerCase().includes('ibuprofeno') || name.toLowerCase().includes('advil')) {
    return <Pill className={iconClass} style={{ transform: 'rotate(45deg)' }} />;
  }
  if (name.toLowerCase().includes('amoxicilina') || name.toLowerCase().includes('amoxil')) {
    return <Shield className={iconClass} />;
  }
  if (name.toLowerCase().includes('omeprazol') || name.toLowerCase().includes('losec')) {
    return <Pill className={iconClass} style={{ transform: 'rotate(-45deg)' }} />;
  }
  if (name.toLowerCase().includes('loratadina') || name.toLowerCase().includes('claritin')) {
    return <Pill className={iconClass} style={{ transform: 'rotate(90deg)' }} />;
  }
  if (name.toLowerCase().includes('diclofenaco') || name.toLowerCase().includes('voltaren')) {
    return <Pill className={iconClass} style={{ transform: 'rotate(180deg)' }} />;
  }
  
  return <Pill className={iconClass} />;
};

export function ProductCard({ product }: ProductCardProps) {
  const { 
    favorites, 
    cart, 
    toggleFavorite, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity 
  } = useAppStore();

  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const isFavorite = favorites.includes(product.id);
  const cartItem = cart.find(item => 
    item.productId === product.id && item.pharmacyId === product.pharmacy.id
  );
  const cartQuantity = cartItem?.quantity || 0;

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount;

  const handleToggleFavorite = () => {
    setIsLoading(true);
    setTimeout(() => {
      toggleFavorite(product.id);
      setIsLoading(false);
    }, 200);
  };

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    setIsLoading(true);
    setTimeout(() => {
      addToCart(product.id, product.pharmacy.id, 1);
      setIsLoading(false);
    }, 300);
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity < 0 || newQuantity > product.stock) return;
    
    setIsLoading(true);
    setTimeout(() => {
      if (newQuantity === 0) {
        removeFromCart(product.id, product.pharmacy.id);
      } else {
        updateCartQuantity(product.id, product.pharmacy.id, newQuantity);
      }
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="relative h-full">
      <div 
        className="absolute inset-0 rounded-2xl opacity-5 dark:opacity-10 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #db1a85 0%, #0ec1ac 100%)',
          filter: 'blur(12px)',
          transform: 'scale(1.02)',
        }}
      />
      
      <Card 
        className="group relative overflow-visible transition-all duration-300 hover:shadow-xl hover:-translate-y-2 min-h-[540px] h-full flex flex-col bg-card/95 backdrop-blur-xl border-border/50 dark:border-border/30 hover:border-[#db1a85]/30 dark:hover:border-[#0ec1ac]/30"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50"
        />
        
        <div 
          className="absolute top-4 bottom-4 left-0 w-px bg-gradient-to-b from-transparent via-border to-transparent opacity-30"
        />

      <CardHeader className="p-4 pb-2 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-base line-clamp-2 group-hover:text-[#db1a85] dark:group-hover:text-[#0ec1ac] transition-colors text-foreground">
              {product.name}
            </h3>
            
            {product.genericName && (
              <p className="text-sm text-muted-foreground mt-1">
                {product.genericName}
              </p>
            )}

            <p className="text-sm text-muted-foreground">
              {product.brand}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-background/80 hover:bg-background border border-border/50 rounded-xl cursor-pointer transition-all duration-300"
            onClick={handleToggleFavorite}
            disabled={isLoading}
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isFavorite ? 'fill-[#db1a85] text-[#db1a85]' : 'text-muted-foreground'
              }`} 
            />
          </Button>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {product.isGeneric && (
            <Badge variant="secondary" className="text-xs bg-[#0ec1ac]/15 dark:bg-[#0ec1ac]/20 text-[#0ec1ac] dark:text-[#0ec1ac] border-[#0ec1ac]/30 font-medium">
              Genérico
            </Badge>
          )}
          {product.prescription && (
            <Badge variant="outline" className="text-xs border-[#db1a85]/30 text-[#db1a85] dark:text-[#db1a85] font-medium">
              <Shield className="h-3 w-3 mr-1" />
              Receta
            </Badge>
          )}
          {discountPercentage && discountPercentage > 0 && (
            <Badge variant="destructive" className="text-xs bg-[#db1a85] dark:bg-[#db1a85] text-white font-medium">
              <TrendingDown className="h-3 w-3 mr-1" />
              -{discountPercentage}%
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-1 flex flex-col">
        <div className="w-20 h-20 mx-auto mb-4 bg-muted/50 dark:bg-muted/30 backdrop-blur-lg rounded-lg flex items-center justify-center overflow-hidden border border-border/30 group-hover:border-[#db1a85]/30 dark:group-hover:border-[#0ec1ac]/30 transition-all duration-300">
          <div className="flex flex-col items-center space-y-1">
            {getMedicationIcon(product.name, product.isGeneric)}
            <span className="text-xs text-foreground/70 text-center font-medium">
              {product.isGeneric ? 'Genérico' : 'Marca'}
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-[#db1a85] dark:text-[#0ec1ac]">
            S/{product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              S/{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm text-foreground">{product.pharmacy.name}</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400" />
              <span className="text-xs text-foreground/80">
                {product.pharmacy.rating}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{product.pharmacy.distance}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className={product.pharmacy.isOpen ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {product.pharmacy.isOpen ? "Abierto" : "Cerrado"}
              </span>
            </div>
          </div>

          {product.pharmacy.hours && (
            <p className="text-xs text-muted-foreground">
              {product.pharmacy.hours}
            </p>
          )}
        </div>

        <div className="mt-3">
          {product.stock > 10 ? (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ En stock</span>
          ) : product.stock > 0 ? (
            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">⚠ Pocas unidades ({product.stock})</span>
          ) : (
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">✗ Sin stock</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        {cartQuantity > 0 ? (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between bg-muted/50 dark:bg-muted/30 backdrop-blur-sm rounded-lg p-2 border border-border/50">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bg-background/50 border-border/50 hover:bg-background hover:border-[#db1a85]/50 dark:hover:border-[#0ec1ac]/50 transition-all duration-300 cursor-pointer"
                onClick={() => handleUpdateQuantity(cartQuantity - 1)}
                disabled={isLoading}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="font-medium text-foreground">{cartQuantity}</span>
              
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bg-background/50 border-border/50 hover:bg-background hover:border-[#db1a85]/50 dark:hover:border-[#0ec1ac]/50 transition-all duration-300 cursor-pointer"
                onClick={() => handleUpdateQuantity(cartQuantity + 1)}
                disabled={isLoading || cartQuantity >= product.stock}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 bg-background/50 border-border/50 hover:bg-background hover:border-[#db1a85]/50 dark:hover:border-[#0ec1ac]/50 backdrop-blur-sm transition-all duration-300 cursor-pointer"
                disabled={product.stock === 0}
                onClick={() => setShowDetailModal(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver detalles
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              className="flex-1 bg-background/50 border-border/50 hover:bg-background hover:border-[#db1a85]/50 dark:hover:border-[#0ec1ac]/50 backdrop-blur-sm transition-all duration-300 cursor-pointer"
              disabled={product.stock === 0}
              onClick={() => setShowDetailModal(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver detalles
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-[#db1a85] to-[#0ec1ac] hover:from-[#db1a85]/90 hover:to-[#0ec1ac]/90 text-white backdrop-blur-sm border-0 transition-all duration-300 hover:shadow-lg hover:shadow-[#db1a85]/30 dark:hover:shadow-[#0ec1ac]/30 cursor-pointer font-medium"
              disabled={product.stock === 0 || isLoading}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isLoading ? 'Agregando...' : 'Agregar'}
            </Button>
          </div>
        )}
      </CardFooter>

      <ProductDetailModal 
        product={product}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </Card>
    </div>
  );
}
