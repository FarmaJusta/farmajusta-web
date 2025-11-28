"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useFarmaJustaStore } from "@/lib/farmajusta-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrdersModal } from "@/components/orders-modal"
import ProfileModal from "@/components/profile-modal"
import { LocationModal } from "@/components/location-modal"
import { MapPin, Heart, ShoppingBag, Menu, User, Home, Search, Pill } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [showOrdersModal, setShowOrdersModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const shoppingList = useFarmaJustaStore((state) => state.shoppingList)
  const favorites = useFarmaJustaStore((state) => state.favorites)
  const userLocation = useFarmaJustaStore((state) => state.userLocation)

  useEffect(() => {
    setMounted(true)
  }, [])

  const ordersCount = useMemo(() => {
    if (!mounted) return 0
    return shoppingList.reduce((count, item) => count + item.quantity, 0)
  }, [mounted, shoppingList])

  const favoriteCount = useMemo(() => {
    if (!mounted) return 0
    return favorites.length
  }, [mounted, favorites])

  const locationText = useMemo(() => {
    if (!mounted || !userLocation?.address) return "Lima, Perú"
    return userLocation.address
  }, [mounted, userLocation])

  const handleMobileAction = (action: () => void) => {
    setMobileMenuOpen(false)
    action()
  }

  const navigateToHome = () => {
    router.push("/")
    setMobileMenuOpen(false)
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={navigateToHome}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-brand-pink to-brand-teal text-white">
            <span className="text-sm font-bold">F</span>
          </div>
          <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-brand-pink to-brand-teal bg-clip-text text-transparent">
            FarmaJusta
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant={isActive("/") ? "secondary" : "ghost"} size="sm" onClick={navigateToHome} className="gap-2">
            <Home className="size-4" />
            Inicio
          </Button>
          <Button variant={isActive("/catalogo") ? "secondary" : "ghost"} size="sm" asChild>
            <Link href="/catalogo" className="gap-2">
              <Pill className="size-4" />
              Catálogo
            </Link>
          </Button>
          <Button variant={isActive("/buscar") ? "secondary" : "ghost"} size="sm" asChild>
            <Link href="/buscar" className="gap-2">
              <Search className="size-4" />
              Buscar
            </Link>
          </Button>
        </nav>

        {/* Location and Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Location */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex items-center gap-1 max-w-40"
            onClick={() => setShowLocationModal(true)}
          >
            <MapPin className="h-4 w-4 text-brand-teal shrink-0" />
            <span className="text-sm truncate">{locationText}</span>
          </Button>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1">
            <ModeToggle />
            <Button variant="ghost" size="sm" className="relative" onClick={() => setShowProfileModal(true)}>
              <Heart className="h-4 w-4" />
              <span className="hidden lg:inline ml-1">Favoritos</span>
              {favoriteCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-brand-pink border-brand-pink"
                >
                  {favoriteCount}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" size="sm" className="relative" onClick={() => setShowOrdersModal(true)}>
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden lg:inline ml-1">Mis Órdenes</span>
              {ordersCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-brand-teal hover:bg-brand-teal/90"
                >
                  {ordersCount}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowProfileModal(true)}>
              <User className="h-4 w-4" />
              <span className="hidden lg:inline ml-1">Perfil</span>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden relative px-2">
                <Menu className="h-5 w-5" />
                {(ordersCount > 0 || favoriteCount > 0) && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-gradient-to-r from-brand-pink to-brand-teal"
                  >
                    {ordersCount + favoriteCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="grid gap-6 py-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Tema</span>
                  <ModeToggle />
                </div>

                <div className="grid gap-2">
                  <h2 className="text-lg font-semibold">Navegación</h2>
                  <Button
                    variant={isActive("/") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={navigateToHome}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Inicio
                  </Button>
                  <Button
                    variant={isActive("/catalogo") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/catalogo">
                      <Pill className="mr-2 h-4 w-4" />
                      Catálogo
                    </Link>
                  </Button>
                  <Button
                    variant={isActive("/buscar") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/buscar">
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </Link>
                  </Button>
                </div>

                <div className="grid gap-2">
                  <h2 className="text-lg font-semibold">Mi Cuenta</h2>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleMobileAction(() => setShowProfileModal(true))}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Favoritos {favoriteCount > 0 && `(${favoriteCount})`}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleMobileAction(() => setShowOrdersModal(true))}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Mis Órdenes {ordersCount > 0 && `(${ordersCount})`}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleMobileAction(() => setShowProfileModal(true))}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </Button>
                </div>

                <div className="grid gap-2">
                  <h2 className="text-lg font-semibold">Ubicación</h2>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleMobileAction(() => setShowLocationModal(true))}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    <span className="truncate">{locationText}</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Modales */}
      <OrdersModal isOpen={showOrdersModal} onClose={() => setShowOrdersModal(false)} />
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <LocationModal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)} />
    </header>
  )
}
