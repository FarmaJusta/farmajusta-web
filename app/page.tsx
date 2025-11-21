"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { mockProducts } from "@/lib/mock-data";
import { Header } from "@/components/header";
import { SearchBar } from "@/components/search-bar";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, TrendingUp, Shield } from 'lucide-react';

export default function Home() {
  const { 
    filteredProducts, 
    searchQuery, 
    sortBy, 
    isLoading,
    setSortBy,
    allProducts 
  } = useAppStore();

  // Initialize products on mount
  useEffect(() => {
    console.log('Inicializando productos:', mockProducts.length, 'productos');
    
    useAppStore.setState({ 
      allProducts: mockProducts,
      filteredProducts: mockProducts 
    });
    
  }, []);

  const handleSortChange = (value: string) => {
    setSortBy(value as any);
  };

  // Show filtered products if there's a search/filter, otherwise show featured products
  const productsToShow = (searchQuery || filteredProducts.length !== allProducts.length) 
    ? filteredProducts 
    : mockProducts.slice(0, 12);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section with Search */}
      <section className="bg-linear-to-b from-brand-pink/5 via-brand-teal/5 to-background py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Encuentra medicamentos
              <br />
              <span className="bg-linear-to-r from-brand-pink to-brand-teal bg-clip-text text-transparent">al mejor precio</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Compara precios de medicamentos en farmacias cercanas y ahorra hasta 50% 
              en genéricos de calidad
            </p>
          </div>
          
          <SearchBar />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-pink">1000+</div>
              <div className="text-sm text-muted-foreground">Medicamentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-teal">50+</div>
              <div className="text-sm text-muted-foreground">Farmacias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-pink">50%</div>
              <div className="text-sm text-muted-foreground">Ahorro promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-teal">24h</div>
              <div className="text-sm text-muted-foreground">Disponibilidad</div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          {/* Results Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {searchQuery 
                  ? `Resultados para "${searchQuery}"` 
                  : (filteredProducts.length !== allProducts.length 
                      ? 'Productos Filtrados' 
                      : 'Medicamentos Destacados'
                    )
                }
              </h2>
              <p className="text-muted-foreground">
                {productsToShow.length} productos encontrados
                {isLoading && " - Cargando..."}
              </p>
            </div>
            
            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ordenar por:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distancia</SelectItem>
                  <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                  <SelectItem value="rating">Calificación</SelectItem>
                  <SelectItem value="name">Nombre A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {searchQuery && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              <Badge variant="secondary">
                Búsqueda: {searchQuery}
              </Badge>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-96"></div>
                </div>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {productsToShow.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && productsToShow.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No encontramos resultados</h3>
              <p className="text-muted-foreground mb-4">
                Intenta con otros términos de búsqueda o ajusta los filtros
              </p>
              <Button 
                variant="outline" 
                onClick={() => useAppStore.getState().clearSearch()}
              >
                Limpiar búsqueda
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      {!searchQuery && (
        <section className="bg-muted/50 py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">¿Por qué elegir FarmaJusta?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Revolucionamos la forma de comprar medicamentos con tecnología y transparencia
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Precios Transparentes</h3>
                <p className="text-muted-foreground">
                  Compara precios en tiempo real y encuentra la mejor oferta cerca de ti
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Farmacias Cercanas</h3>
                <p className="text-muted-foreground">
                  Encuentra medicamentos en farmacias cerca de tu ubicación actual
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Genéricos Certificados</h3>
                <p className="text-muted-foreground">
                  Medicamentos genéricos de calidad garantizada con hasta 50% de descuento
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Statistics Section */}
      {!searchQuery && (
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Números que hablan por nosotros</h2>
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
              Miles de usuarios ya confían en FarmaJusta para encontrar los mejores precios
            </p>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="bg-linear-to-br from-brand-pink/10 to-brand-teal/10 p-6 rounded-2xl border border-border">
                <div className="text-3xl font-bold text-brand-pink mb-2">500+</div>
                <p className="text-muted-foreground">Farmacias Afiliadas</p>
              </div>
              
              <div className="bg-linear-to-br from-brand-teal/10 to-brand-pink/10 p-6 rounded-2xl border border-border">
                <div className="text-3xl font-bold text-brand-teal mb-2">15,000+</div>
                <p className="text-muted-foreground">Usuarios Registrados</p>
              </div>
              
              <div className="bg-linear-to-br from-brand-pink/10 to-brand-teal/10 p-6 rounded-2xl border border-border">
                <div className="text-3xl font-bold text-brand-pink mb-2">45%</div>
                <p className="text-muted-foreground">Ahorro Promedio</p>
              </div>
              
              <div className="bg-linear-to-br from-brand-teal/10 to-brand-pink/10 p-6 rounded-2xl border border-border">
                <div className="text-3xl font-bold text-brand-teal mb-2">24/7</div>
                <p className="text-muted-foreground">Servicio Disponible</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!searchQuery && (
        <section className="bg-linear-to-r from-brand-pink to-brand-teal py-16 px-4 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para ahorrar en medicamentos?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Únete a miles de usuarios que ya están ahorrando hasta 50% en sus medicamentos con FarmaJusta
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-brand-pink px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors cursor-pointer">
                Descargar App
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors cursor-pointer">
                Explorar Ofertas
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-card border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-r from-brand-pink to-brand-teal text-white">
                  <span className="text-sm font-bold">F</span>
                </div>
                <span className="font-bold">FarmaJusta</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Encuentra medicamentos al mejor precio en farmacias cercanas.
                Ahorra hasta 50% con genéricos de calidad.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Productos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">Medicamentos genéricos</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Medicamentos de marca</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Vitaminas y suplementos</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Cuidado personal</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">Sobre nosotros</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Carreras</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Contacto</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">Centro de ayuda</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Términos de servicio</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Política de privacidad</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Farmacia partners</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 FarmaJusta. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
