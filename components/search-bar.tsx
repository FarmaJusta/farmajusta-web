"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SlidersHorizontal, MapPin, Clock, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SearchBar() {
  const { 
    searchQuery, 
    filters, 
    setSearchQuery, 
    setFilters, 
    performSearch,
    clearSearch 
  } = useAppStore();

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange);
  const [localSelectedType, setLocalSelectedType] = useState(filters.type);
  const [localSelectedDistance, setLocalSelectedDistance] = useState(filters.maxDistance);
  const [localOnlyInStock, setLocalOnlyInStock] = useState(filters.onlyInStock);

  const recentSearches = [
    "Paracetamol",
    "Ibuprofeno",
    "Amoxicilina",
    "Omeprazol",
    "Loratadina",
    "Diclofenaco"
  ];

  // Sync local state with store
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setLocalPriceRange(filters.priceRange);
    setLocalSelectedType(filters.type);
    setLocalSelectedDistance(filters.maxDistance);
    setLocalOnlyInStock(filters.onlyInStock);
  }, [filters]);

  const handleSearch = () => {
    setSearchQuery(localSearchQuery);
    performSearch();
  };

  const handleQuickFilter = (filterType: string, value: any) => {
    switch (filterType) {
      case 'cerca':
        setFilters({ maxDistance: '1km' });
        break;
      case 'genericos':
        setFilters({ type: 'generico' });
        break;
      case 'ofertas':
        // Filter products with discounts
        break;
      case 'stock':
        setFilters({ onlyInStock: true });
        break;
    }
    performSearch();
  };

  const handleApplyFilters = () => {
    setFilters({
      type: localSelectedType,
      priceRange: localPriceRange,
      maxDistance: localSelectedDistance,
      onlyInStock: localOnlyInStock
    });
    performSearch();
  };

  const handleClearFilters = () => {
    setLocalPriceRange([0, 500]);
    setLocalSelectedType('todos');
    setLocalSelectedDistance('10km');
    setLocalOnlyInStock(false);
    setFilters({
      type: 'todos',
      priceRange: [0, 500],
      maxDistance: '10km',
      onlyInStock: false
    });
  };

  const hasActiveFilters = 
    searchQuery || 
    filters.type !== 'todos' || 
    filters.priceRange[0] !== 0 || 
    filters.priceRange[1] !== 500 ||
    filters.maxDistance !== '10km' ||
    filters.onlyInStock;

  return (
    <div className="w-full space-y-4">
      {/* Main Search Bar */}
      <div className="flex w-full max-w-4xl mx-auto items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar medicamentos (ej: Paracetamol, Ibuprofeno...)"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 text-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {localSearchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => {
                setLocalSearchQuery("");
                setSearchQuery("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="lg" className="h-12 relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                  !
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros de Búsqueda</SheetTitle>
            </SheetHeader>
            
            <div className="grid gap-6 py-6">
              {/* Tipo de Medicamento */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Medicamento</label>
                <Select value={localSelectedType} onValueChange={(value) => setLocalSelectedType(value as 'todos' | 'generico' | 'marca')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="generico">Genérico</SelectItem>
                    <SelectItem value="marca">Marca</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rango de Precio */}
              <div className="space-y-4">
                <label className="text-sm font-medium">
                  Rango de Precio: S/{localPriceRange[0]} - S/{localPriceRange[1]}
                </label>
                <Slider
                  value={localPriceRange}
                  onValueChange={(value) => setLocalPriceRange(value as [number, number])}
                  max={500}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Distancia</label>
                <Select value={localSelectedDistance} onValueChange={(value) => setLocalSelectedDistance(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar distancia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1km">Hasta 1 km</SelectItem>
                    <SelectItem value="5km">Hasta 5 km</SelectItem>
                    <SelectItem value="10km">Hasta 10 km</SelectItem>
                    <SelectItem value="20km">Hasta 20 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Solo en Stock */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="onlyInStock"
                  checked={localOnlyInStock}
                  onChange={(e) => setLocalOnlyInStock(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="onlyInStock" className="text-sm font-medium">
                  Solo productos en stock
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleClearFilters}
                >
                  Limpiar
                </Button>
                <Button className="flex-1" onClick={handleApplyFilters}>
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Button size="lg" className="h-12 px-8" onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 max-w-4xl mx-auto">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Búsqueda: {searchQuery}
              <X className="h-3 w-3 cursor-pointer" onClick={() => {
                setSearchQuery("");
                setLocalSearchQuery("");
              }} />
            </Badge>
          )}
          {filters.type !== 'todos' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Tipo: {filters.type === 'generico' ? 'Genérico' : 'Marca'}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ type: 'todos' })} />
            </Badge>
          )}
          {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Precio: S/{filters.priceRange[0]}-{filters.priceRange[1]}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ priceRange: [0, 500] })} />
            </Badge>
          )}
          {filters.maxDistance !== '10km' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Distancia: {filters.maxDistance}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ maxDistance: '10km' })} />
            </Badge>
          )}
          {filters.onlyInStock && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Solo en stock
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ onlyInStock: false })} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearSearch}>
            Limpiar todo
          </Button>
        </div>
      )}

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2 max-w-4xl mx-auto">
        <span className="text-sm text-muted-foreground">Filtros rápidos:</span>
        <Badge 
          variant="secondary" 
          className="cursor-pointer hover:bg-[#db1a85]/10 hover:text-[#db1a85] border-[#db1a85]/20"
          onClick={() => handleQuickFilter('cerca', null)}
        >
          <MapPin className="h-3 w-3 mr-1" />
          Cerca de mí
        </Badge>
        <Badge 
          variant="secondary" 
          className="cursor-pointer hover:bg-[#0ec1ac]/10 hover:text-[#0ec1ac] border-[#0ec1ac]/20"
          onClick={() => handleQuickFilter('genericos', null)}
        >
          Genéricos
        </Badge>
        <Badge 
          variant="secondary" 
          className="cursor-pointer hover:bg-[#db1a85]/10 hover:text-[#db1a85] border-[#db1a85]/20"
          onClick={() => handleQuickFilter('ofertas', null)}
        >
          Ofertas
        </Badge>
        <Badge 
          variant="secondary" 
          className="cursor-pointer hover:bg-secondary/80"
          onClick={() => handleQuickFilter('stock', null)}
        >
          En stock
        </Badge>
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && localSearchQuery === "" && !searchQuery && (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Búsquedas populares:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="cursor-pointer hover:bg-accent"
                onClick={() => {
                  setLocalSearchQuery(search);
                  setSearchQuery(search);
                }}
              >
                {search}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
