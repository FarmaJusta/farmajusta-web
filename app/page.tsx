"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { DrugSearch } from "@/components/drug-search"
import { ChatbotWidget } from "@/components/chatbot-widget"
import { ChatbotFAQ } from "@/components/chatbot-faq"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, MapPin, Shield, Pill, MessageCircle } from "lucide-react"
import type { Drug } from "@/lib/types"
import { Toaster } from "sonner"
import Link from "next/link"

export default function Home() {
  const router = useRouter()
  const [isSearching, setIsSearching] = useState(false)

  const handleDrugSelect = (drug: Drug) => {
    setIsSearching(true)
    router.push(`/buscar?medicamento=${encodeURIComponent(drug.id)}`)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toaster position="top-right" richColors />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-pink/5 via-brand-teal/5 to-background py-12 sm:py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 text-balance">
              Encuentra tus medicamentos
              <br />
              <span className="bg-gradient-to-r from-brand-pink to-brand-teal bg-clip-text text-transparent">
                al mejor precio
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance px-4">
              Compara precios en tiempo real entre farmacias cercanas. Ahorra hasta 50% eligiendo genéricos de calidad
              certificada.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <DrugSearch onDrugSelect={handleDrugSelect} isLoading={isSearching} />
            <div className="text-center">
              <Button variant="outline" asChild className="bg-card hover:bg-accent">
                <Link href="/catalogo">
                  <Pill className="size-4 mr-2" />
                  Ver catálogo completo de medicamentos
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-12 max-w-3xl mx-auto">
            <div className="text-center p-3 sm:p-4 rounded-lg bg-card border">
              <div className="text-2xl sm:text-3xl font-bold text-brand-pink">1000+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Medicamentos</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-card border">
              <div className="text-2xl sm:text-3xl font-bold text-brand-teal">50+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Farmacias</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-card border">
              <div className="text-2xl sm:text-3xl font-bold text-brand-pink">50%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Ahorro</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-card border">
              <div className="text-2xl sm:text-3xl font-bold text-brand-teal">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Disponible</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">¿Por qué elegir FarmaJusta?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto px-4">
              Tres pilares que nos hacen diferentes: Ahorro, Seguridad y Conveniencia
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="rounded-full bg-brand-pink/10 p-4 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="size-6 sm:size-8 text-brand-pink" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Ahorro Garantizado</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Compara precios en tiempo real y ahorra hasta 50% con genéricos certificados. Transparencia total en
                cada búsqueda.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="rounded-full bg-brand-teal/10 p-4 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="size-6 sm:size-8 text-brand-teal" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Súper Conveniente</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Encuentra farmacias dentro de tu radio de búsqueda. Ver ubicación, horarios y llamar con un clic.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
              <div className="rounded-full bg-brand-pink/10 p-4 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="size-6 sm:size-8 text-brand-pink" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Información Confiable</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Datos actualizados del MINSA. Asistente IA orientador para tus dudas sobre medicamentos.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Chatbot Info Section */}
      <section id="chatbot" className="bg-muted/50 py-12 sm:py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="rounded-full bg-brand-teal/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <MessageCircle className="size-6 text-brand-teal" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Orientador Farmacéutico con IA</h2>
              <p className="text-muted-foreground mb-6 text-base sm:text-lg">
                Consulta dudas sobre uso, conservación y precauciones de medicamentos. Respuestas confiables basadas en
                información validada.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Pill className="size-5 text-brand-teal shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Información sobre uso correcto de medicamentos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Pill className="size-5 text-brand-teal shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Condiciones de conservación y almacenamiento</span>
                </li>
                <li className="flex items-start gap-2">
                  <Pill className="size-5 text-brand-teal shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Advertencias generales y precauciones</span>
                </li>
              </ul>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <strong>Nota importante:</strong> El chatbot proporciona información educativa general y no sustituye la
                consulta con un profesional de la salud.
              </p>
            </div>

            <div>
              <ChatbotFAQ />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8 sm:py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-brand-pink to-brand-teal text-white">
                  <span className="text-sm font-bold">F</span>
                </div>
                <span className="font-bold">FarmaJusta</span>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Comparador de precios de medicamentos en Lima Metropolitana. Encuentra el mejor precio cerca de ti.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm sm:text-base">Plataforma</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <Link href="/catalogo" className="hover:text-foreground transition-colors">
                    Catálogo
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("chatbot")}
                    className="hover:text-foreground transition-colors text-left"
                  >
                    Asistente IA
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm sm:text-base">Información</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="hover:text-foreground transition-colors text-left"
                  >
                    Sobre FarmaJusta
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="hover:text-foreground transition-colors text-left"
                  >
                    Cómo funciona
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="text-muted-foreground/60 cursor-default">
                  Términos <span className="text-xs">(próx.)</span>
                </li>
                <li className="text-muted-foreground/60 cursor-default">
                  Privacidad <span className="text-xs">(próx.)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
            <p>© 2025 FarmaJusta MVP 1.0 - Fase de Descubrimiento. Todos los derechos reservados.</p>
            <p className="mt-2 text-xs">
              Los precios son referenciales. Confirmar disponibilidad con la farmacia antes de visitar.
            </p>
          </div>
        </div>
      </footer>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  )
}
