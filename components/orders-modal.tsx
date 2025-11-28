"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    ShoppingBag,
    Trash2,
    MapPin,
    Phone,
    Navigation,
    MessageCircle,
    Plus,
    Minus,
    Package,
    Clock,
} from "lucide-react"
import { useFarmaJustaStore, getShoppingListByPharmacy, getShoppingListTotal } from "@/lib/farmajusta-store"
import { toast } from "sonner"

interface OrdersModalProps {
    isOpen: boolean
    onClose: () => void
}

export function OrdersModal({ isOpen, onClose }: OrdersModalProps) {
    const [mounted, setMounted] = useState(false)
    const { shoppingList, removeFromShoppingList, updateShoppingListQuantity, clearShoppingList } = useFarmaJustaStore()

    useEffect(() => {
        setMounted(true)
    }, [])

    const groupedByPharmacy = useMemo(() => {
        return getShoppingListByPharmacy(shoppingList)
    }, [shoppingList])

    const total = useMemo(() => {
        return getShoppingListTotal(shoppingList)
    }, [shoppingList])

    const handleOpenMaps = (lat: number, lng: number, address: string) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(address)}`
        window.open(url, "_blank")
    }

    const handleCall = (phone: string) => {
        window.open(`tel:${phone}`, "_self")
    }

    const handleWhatsApp = (phone: string, pharmacyName: string, items: typeof shoppingList) => {
        const itemsList = items
            .map(
                (item) =>
                    `- ${item.drug.commercialNames?.[0] || item.drug.dci} (${item.quantity}x) - S/ ${(item.price.price * item.quantity).toFixed(2)}`,
            )
            .join("\n")

        const message = `Hola ${pharmacyName}, quisiera consultar disponibilidad de:\n\n${itemsList}\n\nTotal estimado: S/ ${items.reduce((t, i) => t + i.price.price * i.quantity, 0).toFixed(2)}`
        const cleanPhone = phone.replace(/\D/g, "")
        window.open(`https://wa.me/51${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank")
    }

    const handleConfirmOrder = (pharmacyName: string) => {
        toast.success(`Orden preparada para ${pharmacyName}`, {
            description: "Recuerda confirmar disponibilidad antes de ir a la farmacia",
        })
    }

    if (!mounted) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingBag className="size-5 text-brand-teal" />
                        Mis Órdenes
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    {shoppingList.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="size-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No tienes órdenes</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Busca medicamentos y agrégalos a tu orden para compararlos y reservarlos en farmacias cercanas.
                            </p>
                            <Button variant="outline" onClick={onClose}>
                                Buscar medicamentos
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {groupedByPharmacy.map((group) => (
                                <Card key={group.branch.id} className="p-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{group.branch.pharmacyName}</h3>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <MapPin className="size-3 shrink-0" />
                                                <span className="truncate">{group.branch.address}</span>
                                            </p>
                                            {group.branch.hours && (
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                    <Clock className="size-3 shrink-0" />
                                                    {group.branch.hours}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant="secondary" className="shrink-0 ml-2">
                                            S/ {group.total.toFixed(2)}
                                        </Badge>
                                    </div>

                                    <div className="space-y-3">
                                        {group.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-muted/50">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {item.drug.commercialNames?.[0] || item.drug.dci}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{item.drug.concentration}</p>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7 bg-transparent"
                                                            onClick={() => updateShoppingListQuantity(item.id, item.quantity - 1)}
                                                        >
                                                            <Minus className="size-3" />
                                                        </Button>
                                                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7 bg-transparent"
                                                            onClick={() => updateShoppingListQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            <Plus className="size-3" />
                                                        </Button>
                                                    </div>

                                                    <span className="text-sm font-semibold w-16 text-right">
                                                        S/ {(item.price.price * item.quantity).toFixed(2)}
                                                    </span>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => {
                                                            removeFromShoppingList(item.id)
                                                            toast.success("Producto eliminado")
                                                        }}
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 min-w-[100px] bg-transparent"
                                            onClick={() =>
                                                handleOpenMaps(group.branch.coordinates.lat, group.branch.coordinates.lng, group.branch.address)
                                            }
                                        >
                                            <Navigation className="size-3 mr-1" />
                                            Cómo llegar
                                        </Button>
                                        {group.branch.phone && (
                                            <>
                                                <Button variant="outline" size="sm" onClick={() => handleCall(group.branch.phone!)}>
                                                    <Phone className="size-3 mr-1" />
                                                    Llamar
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:hover:bg-green-900 dark:text-green-400 dark:border-green-800"
                                                    onClick={() => handleWhatsApp(group.branch.phone!, group.branch.pharmacyName, group.items)}
                                                >
                                                    <MessageCircle className="size-3 mr-1" />
                                                    WhatsApp
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    <Button
                                        className="w-full mt-3 bg-brand-teal hover:bg-brand-teal/90"
                                        size="sm"
                                        onClick={() => handleConfirmOrder(group.branch.pharmacyName)}
                                    >
                                        Confirmar orden
                                    </Button>
                                </Card>
                            ))}

                            <Separator />
                            <div className="flex items-center justify-between py-2">
                                <span className="font-semibold">Total estimado</span>
                                <span className="text-xl font-bold text-brand-teal">S/ {total.toFixed(2)}</span>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full text-destructive hover:text-destructive bg-transparent"
                                onClick={() => {
                                    clearShoppingList()
                                    toast.success("Órdenes eliminadas")
                                }}
                            >
                                <Trash2 className="size-4 mr-2" />
                                Limpiar todas las órdenes
                            </Button>

                            <p className="text-xs text-muted-foreground text-center">
                                Los precios son referenciales. Confirma disponibilidad y precio final con la farmacia antes de tu
                                visita.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
