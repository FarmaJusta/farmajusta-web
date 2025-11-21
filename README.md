# 💊 FarmaJusta Web – MVP Comparador de Medicamentos

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC)
![Zustand](https://img.shields.io/badge/State%20Management-Zustand-000)
![Radix UI](https://img.shields.io/badge/UI-Radix%20UI%20%2B%20Custom-6633cc)

FarmaJusta Web es un **MVP (Producto Mínimo Viable)** para comparar precios de medicamentos en distintas farmacias, ayudando a los pacientes a optimizar su gasto y tomar mejores decisiones entre **genéricos y de marca**, priorizando **ahorro, conveniencia y experiencia de usuario**.

Este proyecto está diseñado como base para una plataforma que, en fases posteriores, integrará datos reales, geolocalización y capacidades de analítica e IA.

---

## 🚀 Objetivo del MVP

- Permitir que un usuario **busque medicamentos** y los visualice de forma clara.
- Simular un flujo sencillo de **selección, comparación y exploración de opciones**.
- Contar con una **UI moderna y extensible**, lista para conectarse a microservicios y APIs reales en fases posteriores del proyecto FarmaJusta.

---

## ✨ Características principales

- **🔍 Búsqueda de medicamentos**  
  Interfaz preparada con barra de búsqueda y componentes reutilizables para filtrar y listar medicamentos.

- **🧾 Fichas de producto**  
  Tarjetas de medicamentos con información relevante (nombre, presentación, precio, etc.).

- **🧱 Componentes modulares**  
  Uso intensivo de componentes desacoplados (`product-card`, `header`, modales, etc.) para facilitar la iteración y escalabilidad del MVP.

- **🌓 Tema claro/oscuro**  
  Integración de `next-themes` y componentes compatibles con theming para una experiencia moderna.

- **🧠 Manejo de estado ligero**  
  Gestión de estado global mediante **Zustand**, ideal para un MVP rápido pero escalable.

- **🎨 UI moderna basada en Radix UI**  
  Se usan componentes headless de Radix UI combinados con estilos personalizados y patrones similares a shadcn/ui.

- **📊 Preparado para analítica y visualizaciones**  
  Inclusión de **Recharts** para poder representar métricas y comparaciones visuales en futuras iteraciones (por ejemplo, precios promedio, ranking de farmacias, etc.).

---

## 🛠️ Stack tecnológico

- **Framework**: [Next.js 16.0.3](https://nextjs.org/) (App Router)
- **Librería UI**: [React 19.2.0](https://react.dev/)
- **Lenguaje**: [TypeScript 5](https://www.typescriptlang.org/)
- **Estilos**:
  - [Tailwind CSS 4](https://tailwindcss.com/)
  - Utilidades: `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`
- **UI / UX**:
  - [Radix UI](https://www.radix-ui.com/) (accordion, dialog, toast, tooltip, etc.)
  - Iconos: [lucide-react](https://lucide.dev/)
  - Modales, toasts, layout responsive
- **Estado global**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Formularios y validación**:
  - `react-hook-form`
  - `zod`
- **Gráficos**:
  - `recharts`
- **Otras utilidades**:
  - `date-fns`
  - `immer`
  - `sonner`
  - `use-sync-external-store`

---

## 📂 Estructura del proyecto

La estructura está pensada para un proyecto Next.js con App Router y componentes desacoplados:

```bash
.
├── app/                      # Rutas y entrypoints de la aplicación (App Router)
│   ├── globals.css           # Estilos globales
│   ├── layout.tsx            # Layout principal de la aplicación
│   └── page.tsx              # Página principal (Home / Catálogo)
├── components/               # Componentes de UI y de dominio
│   ├── ui/                   # Componentes base reutilizables (Radix + estilos)
│   ├── header.tsx            # Header principal con navegación
│   ├── search-bar.tsx        # Barra de búsqueda de medicamentos
│   ├── product-card.tsx      # Tarjeta de medicamento
│   ├── cart-modal.tsx        # Modal de carrito (estructura lista para integración)
│   ├── product-detail-modal.tsx # Detalle extendido del medicamento
│   ├── location-modal.tsx    # Selección / simulación de ubicación
│   └── profile-modal.tsx     # Modal para perfil de usuario (futuras funcionalidades)
├── hooks/                    # Hooks personalizados
│   ├── use-mobile.ts         # Hook para detectar contexto móvil
│   └── use-toast.ts          # Hook para notificaciones/toasts
├── lib/                      # Lógica de apoyo y datos simulados
│   ├── mock-data.ts          # Datos de prueba de medicamentos/farmacias
│   ├── store.ts              # Store global con Zustand
│   └── utils.ts              # Helpers y funciones utilitarias
├── public/                   # Assets estáticos (iconos, imágenes, etc.)
├── styles/                   # Estilos adicionales
│   └── globals.css           # Estilos globales (vinculados en app/globals.css)
├── package.json              # Dependencias y scripts de npm/pnpm
├── pnpm-lock.yaml            # Lockfile de pnpm (para entornos reproducibles)
├── tsconfig.json             # Configuración de TypeScript
├── postcss.config.mjs        # Configuración de PostCSS
├── next.config.mjs           # Configuración de Next.js
├── .gitignore                # Archivos y carpetas ignorados por Git
└── .gitattributes            # Normalización de fin de línea (EOL) y binarios
