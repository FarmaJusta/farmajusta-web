"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Users, MessageSquare, Search, BarChart3 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getMetrics } from "@/lib/analytics-service"

export function AnalyticsDashboard() {
    const [metrics, setMetrics] = useState<ReturnType<typeof getMetrics> | null>(null)

    useEffect(() => {
        // Cargar métricas
        const data = getMetrics()
        setMetrics(data)
    }, [])

    if (!metrics) {
        return (
            <Card className="p-6">
                <p className="text-center text-muted-foreground">Cargando métricas...</p>
            </Card>
        )
    }

    const kpiCards = [
        {
            title: "Usuarios Únicos",
            value: metrics.uniqueUsers,
            icon: Users,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Búsquedas Totales",
            value: metrics.totalSearches,
            icon: Search,
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "Tasa de Conversión",
            value: `${metrics.conversionRate}%`,
            icon: TrendingUp,
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-500/10",
            subtitle: metrics.conversionRate >= 10 ? "Meta alcanzada" : "Por debajo de la meta",
        },
        {
            title: "Interacciones Chatbot",
            value: metrics.chatbotInteractions,
            icon: MessageSquare,
            color: "text-brand-teal",
            bgColor: "bg-brand-teal/10",
            subtitle: `${metrics.averageChatbotInteractions} por usuario`,
        },
    ]

    return (
        <div className="space-y-6">
            {/* KPIs principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((kpi) => (
                    <Card key={kpi.title} className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                                <p className="text-3xl font-bold mt-2">{kpi.value}</p>
                                {kpi.subtitle && <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>}
                            </div>
                            <div className={`rounded-full p-3 ${kpi.bgColor}`}>
                                <kpi.icon className={`size-6 ${kpi.color}`} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Búsquedas más populares */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="size-5 text-brand-pink" />
                    Búsquedas Más Populares
                </h3>
                <div className="space-y-2">
                    {metrics.topSearches.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay búsquedas registradas aún</p>
                    ) : (
                        metrics.topSearches.map((search, index) => (
                            <div key={search.term} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="size-6 flex items-center justify-center p-0">
                                        {index + 1}
                                    </Badge>
                                    <span className="font-medium">{search.term}</span>
                                </div>
                                <Badge variant="outline">{search.count} búsquedas</Badge>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Distribución por canal y dispositivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Por Canal</h3>
                    <div className="space-y-3">
                        {Object.entries(metrics.channelDistribution).map(([channel, count]) => (
                            <div key={channel} className="flex items-center justify-between">
                                <span className="text-sm">{channel}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-brand-teal h-full"
                                            style={{
                                                width: `${(count / metrics.totalSearches) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium w-12 text-right">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Por Dispositivo</h3>
                    <div className="space-y-3">
                        {Object.entries(metrics.deviceDistribution).map(([device, count]) => (
                            <div key={device} className="flex items-center justify-between">
                                <span className="text-sm">{device}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-brand-pink h-full"
                                            style={{
                                                width: `${(count / metrics.totalSearches) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium w-12 text-right">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Nota sobre el periodo */}
            <Card className="p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground text-center">
                    Métricas del período: {new Date(metrics.dateRange.start).toLocaleDateString("es-PE")} -{" "}
                    {new Date(metrics.dateRange.end).toLocaleDateString("es-PE")}
                </p>
            </Card>
        </div>
    )
}
