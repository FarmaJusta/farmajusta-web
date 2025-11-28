"use client"

import { MapPin } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface RadiusSelectorProps {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
}

export function RadiusSelector({ value, onChange, min = 1, max = 10 }: RadiusSelectorProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    Radio de búsqueda
                </Label>
                <span className="text-sm font-semibold text-brand-teal">{value} km</span>
            </div>

            <Slider
                value={[value]}
                onValueChange={(values) => onChange(values[0])}
                min={min}
                max={max}
                step={0.5}
                className="w-full"
            />

            <p className="text-xs text-muted-foreground">Buscaremos farmacias dentro de {value} km de tu ubicación</p>
        </div>
    )
}
