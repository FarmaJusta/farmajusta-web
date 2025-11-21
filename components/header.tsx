"use client";

import { useState } from "react";
import { useAppStore, useCartItemCount } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CartModal } from "@/components/cart-modal";
import { ProfileModal } from "@/components/profile-modal";
import { LocationModal } from "@/components/location-modal";
import { MapPin, Heart, ShoppingCart, Menu, User } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
  const [location, setLocation] = useState("Lima, Perú");
  const [showCartModal, setShowCartModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { favorites } = useAppStore();
  const cartItemCount = useCartItemCount();
  const favoriteCount = favorites.length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-brand-pink to-brand-teal text-white">
              <span className="text-sm font-bold">F</span>
            </div>
            <span className="hidden font-bold sm:inline-block bg-linear-to-r from-brand-pink to-brand-teal bg-clip-text text-transparent">
              FarmaJusta
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" size="sm">
            Medicamentos
          </Button>
          <Button variant="ghost" size="sm">
            Farmacias
          </Button>
          <Button variant="ghost" size="sm">
            Ofertas
          </Button>
        </nav>

        {/* Location and Actions */}
        <div className="flex items-center space-x-4">
          {/* Location */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden sm:flex items-center space-x-1"
            onClick={() => setShowLocationModal(true)}
          >
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{location}</span>
          </Button>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <ModeToggle />
            <Button variant="ghost" size="sm" className="relative">
              <Heart className="h-4 w-4" />
              <span className="ml-1">Favoritos</span>
              {favoriteCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-brand-pink border-brand-pink">
                  {favoriteCount}
                </Badge>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => setShowCartModal(true)}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="ml-1">Carrito</span>
              {cartItemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-brand-teal hover:bg-brand-teal/90">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowProfileModal(true)}
            >
              <User className="h-4 w-4" />
              <span className="ml-1">Perfil</span>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden relative">
                <Menu className="h-5 w-5" />
                {(cartItemCount > 0 || favoriteCount > 0) && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-linear-to-r from-brand-pink to-brand-teal">
                    {cartItemCount + favoriteCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="grid gap-6 py-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Tema</span>
                  <ModeToggle />
                </div>
                
                <div className="grid gap-3">
                  <h2 className="text-lg font-semibold">Navegación</h2>
                  <Button variant="ghost" className="justify-start">
                    Medicamentos
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    Farmacias
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    Ofertas
                  </Button>
                </div>
                
                <div className="grid gap-3">
                  <h2 className="text-lg font-semibold">Mi Cuenta</h2>
                  <Button variant="ghost" className="justify-start">
                    <Heart className="mr-2 h-4 w-4" />
                    Favoritos {favoriteCount > 0 && `(${favoriteCount})`}
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Carrito {cartItemCount > 0 && `(${cartItemCount})`}
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Button>
                </div>

                <div className="grid gap-3">
                  <h2 className="text-lg font-semibold">Ubicación</h2>
                  <Button variant="ghost" className="justify-start">
                    <MapPin className="mr-2 h-4 w-4" />
                    {location}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Modales */}
      <CartModal 
        isOpen={showCartModal} 
        onClose={() => setShowCartModal(false)} 
      />
      
      {/* Modal de Ubicación */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-brand-pink" />
              <h2 className="text-lg font-semibold">Cambiar Ubicación</h2>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 border rounded-lg bg-muted">
                <p className="font-medium">Ubicación Actual</p>
                <p className="text-sm text-muted-foreground">{location}</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="location-input" className="text-sm font-medium">
                  Nueva Ubicación
                </label>
                <Input
                  id="location-input"
                  placeholder="Ingresa tu dirección..."
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    // Aquí iría la lógica para actualizar la ubicación
                    setShowLocationModal(false);
                  }}
                  className="flex-1 bg-brand-pink hover:bg-brand-pink/90 text-white"
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Location Modal */}
      <LocationModal 
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </header>
  );
}
