"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Pill, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { searchDrugs } from "@/lib/search-service"
import type { Drug } from "@/lib/types"

interface DrugSearchProps {
    onDrugSelect: (drug: Drug) => void
    initialDrug?: Drug
    isLoading?: boolean
}

export function DrugSearch({ onDrugSelect, initialDrug, isLoading: externalLoading }: DrugSearchProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Drug[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    useEffect(() => {
        if (initialDrug) {
            setQuery(initialDrug.commercialNames?.[0] || initialDrug.dci)
        }
    }, [initialDrug])

    const handleSearch = () => {
        if (!query.trim()) return

        setIsSearching(true)
        setHasSearched(true)

        setTimeout(() => {
            const searchResults = searchDrugs(query)
            setResults(searchResults)
            setIsSearching(false)
        }, 300)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

    const handleQuickSearch = (term: string) => {
        setQuery(term)
        setIsSearching(true)
        setHasSearched(true)

        setTimeout(() => {
            const searchResults = searchDrugs(term)
            setResults(searchResults)
            setIsSearching(false)
        }, 100)
    }

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            {/* Barra de búsqueda - Made responsive */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Buscar por nombre, DCI o principio activo..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
                    />
                </div>
                <Button
                    onClick={handleSearch}
                    disabled={isSearching || externalLoading || !query.trim()}
                    size="lg"
                    className="bg-brand-pink hover:bg-brand-pink/90 h-10 sm:h-12 text-sm sm:text-base"
                >
                    {isSearching || externalLoading ? (
                        <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Buscando...
                        </>
                    ) : (
                        "Buscar"
                    )}
                </Button>
            </div>

            {/* Sugerencias - Responsive layout */}
            {!hasSearched && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">Búsquedas populares:</span>
                    {["Paracetamol", "Ibuprofeno", "Amoxicilina", "Omeprazol"].map((term) => (
                        <Badge
                            key={term}
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary/80 text-xs sm:text-sm"
                            onClick={() => handleQuickSearch(term)}
                        >
                            {term}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Resultados - Improved mobile layout */}
            {hasSearched && (
                <div className="space-y-3 sm:space-y-4">
                    {results.length === 0 ? (
                        <Card className="p-6 sm:p-8">
                            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-center">
                                <AlertCircle className="size-10 sm:size-12 text-muted-foreground" />
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold">No se encontraron resultados</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Intenta con otro término de búsqueda</p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                {results.length} medicamento{results.length !== 1 ? "s" : ""} encontrado
                                {results.length !== 1 ? "s" : ""}
                            </p>

                            <div className="grid gap-2 sm:gap-3">
                                {results.map((drug) => (
                                    <Card
                                        key={drug.id}
                                        className="p-3 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-brand-teal"
                                        onClick={() => onDrugSelect(drug)}
                                    >
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <div className="rounded-full bg-brand-teal/10 p-2 sm:p-3 shrink-0">
                                                <Pill className="size-4 sm:size-6 text-brand-teal" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-sm sm:text-lg truncate">
                                                            {drug.commercialNames?.[0] || drug.dci}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                            DCI: {drug.dci} {drug.concentration}
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-1 sm:gap-2 flex-wrap">
                                                        {drug.isGeneric && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs bg-green-500/10 text-green-700 dark:text-green-400"
                                                            >
                                                                Genérico
                                                            </Badge>
                                                        )}
                                                        {drug.requiresPrescription && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Receta
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                                                    <span>{drug.pharmaceuticalForm}</span>
                                                    <span>{drug.laboratory}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
