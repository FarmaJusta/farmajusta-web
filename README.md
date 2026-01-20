# FarmaNexo - Comparador de Precios de Medicamentos

**FarmaNexo** es un comparador de precios de medicamentos en tiempo real para Lima Metropolitana que ayuda a los usuarios a encontrar los mejores precios en farmacias cercanas, promoviendo el acceso equitativo a medicamentos de calidad certificada.

## 🎯 Objetivos del MVP 1.0 (Fase 1 - 3 meses)

- **Comparador de precios** con geolocalización (radio de 5km)
- **Chatbot IA "Orientador Farmacéutico"** Lite (solo información educativa, sin diagnósticos)
- **Métricas clave**: Tasa de Conversión >10%, CAC, Interacciones del Chatbot

## 🚀 Características Principales

### Funcionalidades Públicas (Sin autenticación)

- ✅ Búsqueda de medicamentos por DCI o nombre comercial
- ✅ Comparación de precios entre farmacias
- ✅ Visualización de genéricos vs marcas equivalentes
- ✅ Geolocalización y filtrado por distancia
- ✅ Catálogo completo de medicamentos
- ✅ Detalle de medicamentos con información completa

### Funcionalidades Privadas (Requieren login)

- 🔒 Sistema de autenticación (login, registro, recuperación de contraseña)
- ⭐ Favoritos: guardar medicamentos favoritos
- 🛍️ Mis Órdenes: lista de compras organizada por farmacia
- 👤 Perfil de usuario con historial de búsquedas
- 🤖 Chatbot IA con orientación farmacéutica

## 🛠️ Stack Tecnológico

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **Componentes UI**: shadcn/ui
- **Gestión de Estado**: Zustand
- **IA**: Vercel AI SDK v5
- **Mapas**: Google Maps API

### Herramientas de Desarrollo

- **Linting**: ESLint
- **Formateo**: Prettier (configurado en Next.js)
- **Control de versiones**: Git

## 📁 Estructura del Proyecto

```
proyecto-farma-nexo/
├── app/                          # App Router de Next.js
│   ├── api/
│   │   └── chatbot/
│   │       └── route.ts         # API del chatbot con AI SDK
│   ├── buscar/                  # Página de búsqueda y comparación
│   ├── catalogo/                # Catálogo completo de medicamentos
│   ├── medicamento/[id]/        # Detalle de medicamento (ruta dinámica)
│   ├── login/                   # Página de inicio de sesión
│   ├── registro/                # Página de registro
│   ├── recuperar-contrasena/   # Recuperación de contraseña
│   ├── layout.tsx               # Layout raíz con providers
│   ├── page.tsx                 # Página principal (hero + búsqueda)
│   └── globals.css              # Estilos globales y tema
│
├── components/                   # Componentes reutilizables
│   ├── ui/                      # Componentes base de shadcn/ui
│   ├── auth-guard.tsx           # Componente de protección de rutas
│   ├── chatbot-widget.tsx       # Widget del chatbot
│   ├── comparison-results.tsx   # Resultados de comparación de precios
│   ├── drug-catalog.tsx         # Catálogo de medicamentos
│   ├── drug-detail-modal.tsx    # Modal de detalle de medicamento
│   ├── drug-search.tsx          # Buscador de medicamentos
│   ├── header.tsx               # Header con navegación adaptativa
│   ├── location-modal.tsx       # Modal de selección de ubicación
│   ├── login-prompt.tsx         # Prompt de login para no autenticados
│   ├── mode-toggle.tsx          # Toggle de modo claro/oscuro
│   ├── orders-modal.tsx         # Modal de órdenes/lista de compras
│   ├── profile-modal.tsx        # Modal de perfil de usuario
│   └── theme-provider.tsx       # Provider de temas (next-themes)
│
├── lib/                         # Librerías y utilidades
│   ├── analytics-service.ts     # Servicio de analytics y métricas
│   ├── auth-store.ts            # Store de autenticación (Zustand)
│   ├── farmanexo-data.ts       # Data mockeada para desarrollo
│   ├── farmanexo-store.ts      # Store principal de la app
│   ├── search-service.ts        # Servicio de búsqueda y comparación
│   ├── types.ts                 # Tipos TypeScript del dominio
│   └── utils.ts                 # Utilidades generales (cn, etc.)
│
├── public/                      # Archivos estáticos
│   └── *.jpg                    # Logos de farmacias
│
├── BACKEND_API_SPEC.md          # Especificación completa del backend
└── README.md                    # Este archivo
```

## 🎨 Diseño y Tema

### Paleta de Colores

- **Brand Pink**: `#db1a85` (primario)
- **Brand Teal**: `#0ec1ac` (secundario/accento)
- **Modo Claro/Oscuro**: Totalmente soportado con next-themes

### Responsive

- Mobile-first design
- Breakpoints: sm, md, lg, xl
- Todos los componentes son completamente responsive

## 🔐 Autenticación

### Credenciales de Prueba (Mock)

- **Email**: `demo@farmanexo.pe`
- **Contraseña**: `Demo123!`

### Funcionalidad Mock

- Login y registro con validación
- Persistencia en localStorage
- Recuperación de contraseña (mock)
- Gestión de perfil

**⚠️ Nota**: El sistema de autenticación actual es mock para desarrollo. Se requiere implementar backend real con JWT/OAuth.

## 📊 Data Mockeada

El proyecto incluye data mockeada realista en `lib/farmanexo-data.ts`:

- **1000+** medicamentos
- **50+** farmacias
- **200+** sucursales en Lima Metropolitana
- Precios variables por farmacia y ubicación

## 🤖 Chatbot IA

### Características

- Integración con Vercel AI SDK v5
- Guardrails de seguridad (no diagnósticos ni prescripciones)
- Disclaimers obligatorios
- Tracking de interacciones
- Solo disponible para usuarios autenticados

### Configuración

Requiere configurar el AI Gateway de Vercel o agregar API keys de proveedores de IA en variables de entorno.

## 🚀 Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/proyecto-farma-nexo.git

# Navegar al directorio
cd proyecto-farma-nexo

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

## 🌐 Variables de Entorno

```env
# No requiere variables de entorno para funcionalidad básica
# El AI Gateway de Vercel funciona automáticamente al desplegar

# Opcional para desarrollo local del chatbot:
# OPENAI_API_KEY=tu_api_key
# ANTHROPIC_API_KEY=tu_api_key
```

## 📈 Métricas y Analytics

El sistema trackea:

- **Búsquedas**: términos, ubicación, resultados
- **Clics**: en farmacias, mapas, links externos
- **Conversiones**: visitas a farmacia, llamadas
- **Chatbot**: interacciones, queries, respuestas

Dashboard de métricas disponible en: (próximamente)

## 🔄 Próximos Pasos

### Backend (Ver BACKEND_API_SPEC.md)

- [ ] API REST con autenticación JWT
- [ ] Base de datos PostgreSQL
- [ ] Integración con SNIP/APIs de farmacias
- [ ] Sistema de scraping de precios
- [ ] Analytics y reporting

### Frontend

- [ ] Notificaciones de cambios de precio
- [ ] Sistema de alertas por medicamento
- [ ] Comparación de múltiples medicamentos
- [ ] PWA para instalación móvil

## 👥 Contribución

Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre nuestro código de conducta y el proceso para enviar pull requests.

## 📄 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados © 2025 FarmaNexo.

## 📞 Contacto

- **Email**: <contacto@farmanexo.pe>
- **Website**: <https://farmanexo.pe>

---

**Hecho en Lima, Perú**
