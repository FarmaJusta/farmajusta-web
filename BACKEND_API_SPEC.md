# FarmaNexo - Especificación Técnica del Backend

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Microservicios](#microservicios)
4. [Base de Datos](#base-de-datos)
5. [APIs REST](#apis-rest)
6. [Autenticación y Autorización](#autenticación-y-autorización)
7. [Integraciones Externas](#integraciones-externas)
8. [Analytics y Métricas](#analytics-y-métricas)
9. [Infraestructura](#infraestructura)

---

## Visión General

FarmaNexo requiere un backend robusto y escalable que soporte:

- Gestión de catálogo de medicamentos
- Comparación de precios en tiempo real
- Autenticación y gestión de usuarios
- Analytics y tracking de eventos
- Integración con APIs de farmacias
- Chatbot con IA

### Stack Tecnológico Recomendado

- **Lenguaje**: Node.js (TypeScript) o Python
- **Framework**: NestJS, Express, o FastAPI
- **Base de Datos**: PostgreSQL + Redis
- **ORM**: Prisma, TypeORM, o SQLAlchemy
- **Autenticación**: JWT + bcrypt
- **Cache**: Redis
- **Queue**: Bull/BullMQ o Celery
- **Search**: Elasticsearch (opcional)
- **Hosting**: Vercel, AWS, o GCP

---

## Arquitectura

### Arquitectura de Microservicios (Recomendada)

```
┌─────────────────────────────────────────────────┐
│              API Gateway / BFF                   │
│         (Next.js API Routes o Express)           │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│   Auth       │ │  Catalog │ │  Analytics   │
│   Service    │ │  Service │ │  Service     │
└──────────────┘ └──────────┘ └──────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      ▼
        ┌─────────────────────────────┐
        │     PostgreSQL Database     │
        └─────────────────────────────┘
                      │
                      ▼
              ┌─────────────┐
              │    Redis    │
              │   (Cache)   │
              └─────────────┘
```

### Alternativa Monolito Modular (MVP)

Para el MVP, se puede iniciar con un monolito modular que sea fácil de separar después:

```
app/
├── modules/
│   ├── auth/
│   ├── drugs/
│   ├── pharmacies/
│   ├── prices/
│   ├── users/
│   └── analytics/
├── shared/
│   ├── database/
│   ├── cache/
│   └── utils/
└── main.ts
```

---

## Microservicios

### 1. Auth Service (Servicio de Autenticación)

**Responsabilidad**: Gestión de usuarios, autenticación y autorización

**Endpoints**:

- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cierre de sesión
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Recuperación de contraseña
- `POST /api/auth/reset-password` - Reset de contraseña
- `GET /api/auth/me` - Obtener usuario actual
- `PATCH /api/auth/me` - Actualizar perfil

**Base de Datos**:

- Tabla `users`
- Tabla `refresh_tokens`
- Tabla `password_resets`

**Tecnologías**:

- JWT para tokens
- bcrypt para hashing de contraseñas
- Nodemailer o SendGrid para emails

### 2. Catalog Service (Servicio de Catálogo)

**Responsabilidad**: Gestión del catálogo de medicamentos

**Endpoints**:

- `GET /api/drugs` - Listar medicamentos (paginado, filtros)
- `GET /api/drugs/:id` - Obtener detalle de medicamento
- `GET /api/drugs/search` - Búsqueda de medicamentos
- `POST /api/drugs` - Crear medicamento (admin)
- `PATCH /api/drugs/:id` - Actualizar medicamento (admin)
- `DELETE /api/drugs/:id` - Eliminar medicamento (admin)

**Parámetros de búsqueda**:

```typescript
interface DrugSearchParams {
  q?: string              // Término de búsqueda (DCI o nombre comercial)
  type?: 'generico' | 'marca' | 'todos'
  requiresPrescription?: boolean
  laboratory?: string
  pharmaceuticalForm?: string
  isActive?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'laboratory'
  sortOrder?: 'asc' | 'desc'
}
```

**Base de Datos**:

- Tabla `drugs`

### 3. Pharmacy Service (Servicio de Farmacias)

**Responsabilidad**: Gestión de farmacias y sucursales

**Endpoints**:

- `GET /api/pharmacies` - Listar farmacias
- `GET /api/pharmacies/:id` - Detalle de farmacia
- `GET /api/branches` - Listar sucursales (con geolocalización)
- `GET /api/branches/:id` - Detalle de sucursal
- `GET /api/branches/nearby` - Sucursales cercanas

**Parámetros de búsqueda de sucursales**:

```typescript
interface BranchSearchParams {
  lat: number
  lng: number
  radius?: number         // En km (default: 5)
  district?: string
  pharmacyId?: string
  isOpen24Hours?: boolean
  minRating?: number
}
```

**Base de Datos**:

- Tabla `pharmacies`
- Tabla `pharmacy_branches`
- Índice geoespacial en `pharmacy_branches.coordinates`

### 4. Price Service (Servicio de Precios)

**Responsabilidad**: Gestión y comparación de precios

**Endpoints**:

- `GET /api/prices/compare` - Comparar precios de un medicamento
- `GET /api/prices/drug/:drugId` - Precios de un medicamento
- `POST /api/prices` - Crear/actualizar precio (scraper)
- `GET /api/prices/history/:drugId` - Historial de precios

**Comparación de precios**:

```typescript
interface PriceComparisonParams {
  drugId: string
  lat?: number
  lng?: number
  radius?: number
  sortBy?: 'price' | 'distance'
  onlyInStock?: boolean
}

interface PriceComparisonResponse {
  drug: Drug
  results: Array<{
    branch: PharmacyBranch
    price: DrugPrice
    distance?: number      // En km
  }>
  savings: {
    minPrice: number
    maxPrice: number
    averagePrice: number
    savingsAmount: number
    savingsPercentage: number
  }
}
```

**Base de Datos**:

- Tabla `drug_prices`
- Índices en `drug_id`, `branch_id`, `updated_at`

### 5. User Service (Servicio de Usuarios)

**Responsabilidad**: Gestión de datos de usuario y preferencias

**Endpoints**:

- `GET /api/users/favorites` - Obtener favoritos
- `POST /api/users/favorites/:drugId` - Agregar a favoritos
- `DELETE /api/users/favorites/:drugId` - Quitar de favoritos
- `GET /api/users/orders` - Obtener órdenes
- `POST /api/users/orders` - Crear orden
- `GET /api/users/search-history` - Historial de búsquedas
- `DELETE /api/users/search-history` - Limpiar historial

**Base de Datos**:

- Tabla `user_favorites`
- Tabla `user_orders`
- Tabla `order_items`

### 6. Analytics Service (Servicio de Analytics)

**Responsabilidad**: Tracking de eventos y métricas

**Endpoints**:

- `POST /api/analytics/events` - Registrar evento
- `GET /api/analytics/metrics` - Obtener métricas
- `GET /api/analytics/dashboard` - Dashboard de métricas

**Tipos de eventos**:

```typescript
// Evento de búsqueda
POST /api/analytics/events
{
  type: "SEARCH",
  data: {
    searchTerm: string
    normalizedDrugId?: string
    location: { lat: number, lng: number, district?: string }
    resultsCount: number
    channel: "WEB" | "MOBILE" | "WHATSAPP"
    device: "DESKTOP" | "MOBILE" | "TABLET"
  }
}

// Evento de clic
POST /api/analytics/events
{
  type: "CLICK",
  data: {
    searchEventId?: string
    drugId: string
    branchId: string
    eventType: "VIEW_MAP" | "GO_TO_PHARMACY" | "EXTERNAL_LINK"
  }
}

// Evento de conversión
POST /api/analytics/events
{
  type: "CONVERSION",
  data: {
    clickEventId: string
    conversionType: "PHARMACY_VISIT" | "EXTERNAL_CLICK" | "PHONE_CALL"
  }
}

// Interacción de chatbot
POST /api/analytics/events
{
  type: "CHATBOT_INTERACTION",
  data: {
    query: string
    response: string
    relatedDrugId?: string
  }
}
```

**Base de Datos**:

- Tabla `search_events`
- Tabla `click_events`
- Tabla `conversion_events`
- Tabla `chatbot_interactions`

### 7. Chatbot Service (Servicio de Chatbot)

**Responsabilidad**: Procesamiento de consultas del chatbot

**Endpoints**:

- `POST /api/chatbot/chat` - Enviar mensaje al chatbot
- `GET /api/chatbot/history` - Historial de conversación

**Request/Response**:

```typescript
// Request
POST /api/chatbot/chat
{
  message: string
  sessionId?: string
  context?: {
    drugId?: string
    location?: { lat: number, lng: number }
  }
}

// Response
{
  response: string
  relatedDrugs?: Drug[]
  suggestions?: string[]
  disclaimer: string
  sessionId: string
}
```

**Integración con IA**:

- OpenAI GPT-4 o GPT-3.5 Turbo
- Anthropic Claude
- Vercel AI SDK (recomendado)

**Guardrails de seguridad**:

- Prompt engineering para evitar diagnósticos
- Filtrado de respuestas médicas sensibles
- Disclaimer obligatorio en cada respuesta

---

## Base de Datos

### Esquema PostgreSQL

#### Tabla: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
```

#### Tabla: `drugs`

```sql
CREATE TABLE drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dci VARCHAR(255) NOT NULL,              -- Denominación Común Internacional
  commercial_names TEXT[] NOT NULL,        -- Array de nombres comerciales
  pharmaceutical_form VARCHAR(100) NOT NULL,
  concentration VARCHAR(100) NOT NULL,
  is_generic BOOLEAN DEFAULT false,
  laboratory VARCHAR(255) NOT NULL,
  active_ingredient VARCHAR(255) NOT NULL,
  presentation VARCHAR(255) NOT NULL,
  requires_prescription BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Información médica
  indications TEXT[],
  contraindications TEXT[],
  dosage TEXT,
  side_effects TEXT[],
  interactions TEXT[],
  composition TEXT,
  warnings TEXT[],
  storage_conditions TEXT,
  expiration_info TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drugs_dci ON drugs(dci);
CREATE INDEX idx_drugs_is_generic ON drugs(is_generic);
CREATE INDEX idx_drugs_laboratory ON drugs(laboratory);
CREATE INDEX idx_drugs_is_active ON drugs(is_active);
CREATE INDEX idx_drugs_commercial_names ON drugs USING GIN(commercial_names);

-- Full-text search
CREATE INDEX idx_drugs_search ON drugs USING GIN(
  to_tsvector('spanish', dci || ' ' || array_to_string(commercial_names, ' '))
);
```

#### Tabla: `pharmacies`

```sql
CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  chain_name VARCHAR(255),
  logo_url VARCHAR(500),
  website VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pharmacies_name ON pharmacies(name);
```

#### Tabla: `pharmacy_branches`

```sql
CREATE TABLE pharmacy_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  district VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Lima',
  region VARCHAR(100) NOT NULL DEFAULT 'Lima',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone VARCHAR(20),
  hours VARCHAR(255),
  is_open_24_hours BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_branches_pharmacy_id ON pharmacy_branches(pharmacy_id);
CREATE INDEX idx_branches_district ON pharmacy_branches(district);
CREATE INDEX idx_branches_is_active ON pharmacy_branches(is_active);

-- Geospatial index for location queries
CREATE INDEX idx_branches_location ON pharmacy_branches USING GIST(
  ST_MakePoint(longitude, latitude)::geography
);
```

#### Tabla: `drug_prices`

```sql
CREATE TYPE stock_status AS ENUM ('IN_STOCK', 'LOW', 'OUT_OF_STOCK');
CREATE TYPE data_source AS ENUM ('SNIP', 'PHARMACY_API', 'MANUAL', 'SCRAPER');

CREATE TABLE drug_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_id UUID REFERENCES drugs(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES pharmacy_branches(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PEN',
  stock_status stock_status DEFAULT 'IN_STOCK',
  stock_quantity INTEGER,
  source data_source NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(drug_id, branch_id)
);

CREATE INDEX idx_prices_drug_id ON drug_prices(drug_id);
CREATE INDEX idx_prices_branch_id ON drug_prices(branch_id);
CREATE INDEX idx_prices_last_updated ON drug_prices(last_updated);
CREATE INDEX idx_prices_stock_status ON drug_prices(stock_status);
```

#### Tabla: `user_favorites`

```sql
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  drug_id UUID REFERENCES drugs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, drug_id)
);

CREATE INDEX idx_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_favorites_drug_id ON user_favorites(drug_id);
```

#### Tabla: `user_orders`

```sql
CREATE TYPE order_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

CREATE TABLE user_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES pharmacy_branches(id),
  status order_status DEFAULT 'PENDING',
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PEN',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON user_orders(user_id);
CREATE INDEX idx_orders_branch_id ON user_orders(branch_id);
CREATE INDEX idx_orders_status ON user_orders(status);
CREATE INDEX idx_orders_created_at ON user_orders(created_at DESC);
```

#### Tabla: `order_items`

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES user_orders(id) ON DELETE CASCADE,
  drug_id UUID REFERENCES drugs(id),
  price_id UUID REFERENCES drug_prices(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_drug_id ON order_items(drug_id);
```

#### Tabla: `search_events`

```sql
CREATE TYPE channel AS ENUM ('WEB', 'MOBILE', 'WHATSAPP');
CREATE TYPE device AS ENUM ('DESKTOP', 'MOBILE', 'TABLET');

CREATE TABLE search_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255) NOT NULL,
  search_term VARCHAR(500) NOT NULL,
  normalized_drug_id UUID REFERENCES drugs(id),
  results_count INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  district VARCHAR(100),
  channel channel NOT NULL,
  device device NOT NULL,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_events_user_id ON search_events(user_id);
CREATE INDEX idx_search_events_session_id ON search_events(session_id);
CREATE INDEX idx_search_events_created_at ON search_events(created_at DESC);
CREATE INDEX idx_search_events_normalized_drug_id ON search_events(normalized_drug_id);
```

#### Tabla: `click_events`

```sql
CREATE TYPE click_type AS ENUM ('VIEW_MAP', 'GO_TO_PHARMACY', 'EXTERNAL_LINK', 'PHONE_CALL');

CREATE TABLE click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255) NOT NULL,
  search_event_id UUID REFERENCES search_events(id),
  drug_id UUID REFERENCES drugs(id),
  branch_id UUID REFERENCES pharmacy_branches(id),
  event_type click_type NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_click_events_user_id ON click_events(user_id);
CREATE INDEX idx_click_events_session_id ON click_events(session_id);
CREATE INDEX idx_click_events_search_event_id ON click_events(search_event_id);
CREATE INDEX idx_click_events_created_at ON click_events(created_at DESC);
```

#### Tabla: `conversion_events`

```sql
CREATE TYPE conversion_type AS ENUM ('PHARMACY_VISIT', 'EXTERNAL_CLICK', 'PHONE_CALL');

CREATE TABLE conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255) NOT NULL,
  click_event_id UUID REFERENCES click_events(id),
  conversion_type conversion_type NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversion_events_user_id ON conversion_events(user_id);
CREATE INDEX idx_conversion_events_click_event_id ON conversion_events(click_event_id);
CREATE INDEX idx_conversion_events_created_at ON conversion_events(created_at DESC);
```

#### Tabla: `chatbot_interactions`

```sql
CREATE TABLE chatbot_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255) NOT NULL,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  related_drug_id UUID REFERENCES drugs(id),
  channel channel NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chatbot_user_id ON chatbot_interactions(user_id);
CREATE INDEX idx_chatbot_session_id ON chatbot_interactions(session_id);
CREATE INDEX idx_chatbot_created_at ON chatbot_interactions(created_at DESC);
```

#### Tabla: `refresh_tokens`

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

#### Tabla: `password_resets`

```sql
CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(token);
```

### Redis (Cache)

**Uso de Redis**:

- Cache de resultados de búsqueda (TTL: 5 minutos)
- Cache de precios (TTL: 1 hora)
- Rate limiting
- Sessions de usuario
- Queue para jobs de scraping

**Estructura de claves**:

```
# Cache de búsqueda
search:{drugId}:{lat}:{lng}:{radius} -> JSON (results)

# Cache de precios
prices:drug:{drugId} -> JSON (prices array)
prices:branch:{branchId} -> JSON (prices array)

# Rate limiting
ratelimit:{ip}:{endpoint} -> counter (TTL: 1 minuto)

# Sessions
session:{sessionId} -> JSON (user data)
```

---

## APIs REST

### Convenciones

**Base URL**: `https://api.FarmaNexo.pe/v1`

**Headers**:

```
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

**Respuestas estándar**:

```typescript
// Éxito
{
  success: true,
  data: any,
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

// Error
{
  success: false,
  error: {
    code: string
    message: string
    details?: any
  }
}
```

**Códigos de estado HTTP**:

- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado
- `400 Bad Request` - Datos inválidos
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - Sin permisos
- `404 Not Found` - Recurso no encontrado
- `429 Too Many Requests` - Rate limit excedido
- `500 Internal Server Error` - Error del servidor

### Paginación

```typescript
// Query params
?page=1&limit=20

// Response
{
  success: true,
  data: [...],
  meta: {
    page: 1,
    limit: 20,
    total: 156,
    totalPages: 8
  }
}
```

### Filtrado y Ordenamiento

```typescript
// Filtros
?filter[isGeneric]=true&filter[laboratory]=Bayer

// Ordenamiento
?sortBy=price&sortOrder=asc

// Búsqueda
?search=paracetamol
```

---

## Autenticación y Autorización

### JWT (JSON Web Tokens)

**Access Token**:

- Duración: 15 minutos
- Incluye: `userId`, `email`, `role`

```typescript
interface AccessTokenPayload {
  sub: string      // user ID
  email: string
  role: UserRole
  iat: number      // issued at
  exp: number      // expiration
}
```

**Refresh Token**:

- Duración: 7 días
- Almacenado en base de datos
- Permite obtener nuevo access token

### Flujo de Autenticación

1. **Login**: `POST /api/auth/login`
   - Request: `{ email, password }`
   - Response: `{ accessToken, refreshToken, user }`

2. **Refresh**: `POST /api/auth/refresh`
   - Request: `{ refreshToken }`
   - Response: `{ accessToken, refreshToken }`

3. **Logout**: `POST /api/auth/logout`
   - Request: `{ refreshToken }`
   - Response: `{ success: true }`

### Roles y Permisos

```typescript
enum UserRole {
  PATIENT = 'patient',              // Usuario normal
  QF = 'qf',                        // Químico Farmacéutico
  PHARMACY_ADMIN = 'pharmacy_admin', // Admin de farmacia
  LAB_ANALYST = 'lab_analyst',      // Analista de laboratorio
  PLATFORM_ADMIN = 'platform_admin'  // Admin de plataforma
}

// Permisos por rol
const PERMISSIONS = {
  patient: ['read:drugs', 'read:prices', 'write:favorites', 'write:orders'],
  qf: ['read:drugs', 'read:prices', 'write:chatbot'],
  pharmacy_admin: ['read:drugs', 'write:prices', 'read:analytics'],
  lab_analyst: ['read:drugs', 'write:drugs', 'read:analytics'],
  platform_admin: ['*'] // Todos los permisos
}
```

### Rate Limiting

```typescript
// Límites por endpoint
const RATE_LIMITS = {
  '/api/auth/login': { max: 5, window: '15m' },
  '/api/drugs/search': { max: 60, window: '1m' },
  '/api/prices/compare': { max: 30, window: '1m' },
  '/api/chatbot/chat': { max: 20, window: '1m' },
  'default': { max: 100, window: '1m' }
}
```

---

## Integraciones Externas

### 1. SNIP (Sistema Nacional Integrado de Precios)

**URL**: <http://observatorio.digemid.minsa.gob.pe/>

**Objetivo**: Obtener precios oficiales de medicamentos

**Método**: Scraping o API (si está disponible)

**Frecuencia**: Diaria

**Implementación**:

```typescript
interface SNIPIntegration {
  fetchDrugs(): Promise<Drug[]>
  fetchPrices(drugId: string): Promise<DrugPrice[]>
  syncData(): Promise<void>
}
```

### 2. APIs de Farmacias

**Farmacias a integrar**:

- InkaFarma
- MiFarma
- Boticas y Salud
- Boticas Arcángel
- Farmacia Universal

**Métodos**:

- API REST (si está disponible)
- Web Scraping (con rate limiting y respeto a robots.txt)

**Scheduler**:

- Actualización de precios: Cada 6 horas
- Actualización de stock: Cada 2 horas
- Full sync: Semanal

### 3. Google Maps API

**Uso**:

- Geocoding de direcciones
- Cálculo de distancias
- Visualización de mapas
- Direcciones de navegación

**APIs necesarias**:

- Maps JavaScript API
- Geocoding API
- Distance Matrix API
- Places API (opcional)

### 4. OpenAI / Anthropic (Chatbot)

**Uso**: Procesamiento de lenguaje natural para el chatbot

**Configuración**:

```typescript
const chatbotConfig = {
  model: 'gpt-4-turbo',
  temperature: 0.7,
  maxTokens: 500,
  systemPrompt: `Eres un asistente farmacéutico virtual...`
}
```

**Guardrails**:

- Prompt engineering para evitar diagnósticos
- Filtrado de contenido sensible
- Disclaimer obligatorio

### 5. SendGrid / Mailgun (Emails)

**Uso**:

- Emails de bienvenida
- Recuperación de contraseña
- Notificaciones de precios
- Newsletters

**Templates**:

- `welcome.html`
- `password-reset.html`
- `price-alert.html`

---

## Analytics y Métricas

### Métricas Clave (KPIs)

1. **Tasa de Conversión (TC)**

   ```sql
   SELECT 
     COUNT(DISTINCT ce.session_id) * 100.0 / COUNT(DISTINCT se.session_id) AS conversion_rate
   FROM search_events se
   LEFT JOIN click_events ce ON se.id = ce.search_event_id
   WHERE se.created_at >= NOW() - INTERVAL '30 days';
   ```

2. **CAC (Costo de Adquisición de Cliente)**
   - Cálculo externo basado en gasto en marketing
   - Fórmula: `CAC = Total Marketing Spend / New Users Acquired`

3. **Promedio de Interacciones del Chatbot**

   ```sql
   SELECT 
     AVG(interaction_count) AS avg_interactions
   FROM (
     SELECT session_id, COUNT(*) AS interaction_count
     FROM chatbot_interactions
     WHERE created_at >= NOW() - INTERVAL '30 days'
     GROUP BY session_id
   ) AS subquery;
   ```

4. **Búsquedas Únicas**

   ```sql
   SELECT COUNT(DISTINCT session_id) AS unique_searches
   FROM search_events
   WHERE created_at >= NOW() - INTERVAL '30 days';
   ```

5. **Medicamentos Más Buscados**

   ```sql
   SELECT 
     d.dci,
     d.commercial_names[1] AS brand_name,
     COUNT(*) AS search_count
   FROM search_events se
   JOIN drugs d ON se.normalized_drug_id = d.id
   WHERE se.created_at >= NOW() - INTERVAL '30 days'
   GROUP BY d.id
   ORDER BY search_count DESC
   LIMIT 10;
   ```

### Dashboard de Analytics

**Endpoints del dashboard**:

- `GET /api/analytics/metrics/overview` - Métricas generales
- `GET /api/analytics/metrics/searches` - Análisis de búsquedas
- `GET /api/analytics/metrics/conversions` - Análisis de conversiones
- `GET /api/analytics/metrics/chatbot` - Métricas del chatbot
- `GET /api/analytics/metrics/drugs` - Medicamentos más populares

**Respuesta de overview**:

```typescript
interface AnalyticsOverview {
  period: {
    startDate: string
    endDate: string
  }
  metrics: {
    totalSearches: number
    uniqueUsers: number
    conversionRate: number
    avgChatbotInteractions: number
    totalOrders: number
    totalRevenue: number
  }
  trends: {
    searches: { date: string, count: number }[]
    conversions: { date: string, count: number }[]
  }
  topDrugs: {
    drugId: string
    name: string
    searchCount: number
  }[]
  topPharmacies: {
    pharmacyId: string
    name: string
    clickCount: number
  }[]
}
```

---

## Infraestructura

### Hosting y Deployment

**Opciones recomendadas**:

1. **Vercel** (Para Next.js + API Routes)
   - Frontend: Edge network
   - API Routes: Serverless functions
   - Pros: Deploy automático, CDN global
   - Contras: Cold starts en functions

2. **AWS**
   - Frontend: S3 + CloudFront
   - Backend: ECS/Fargate o Lambda
   - Database: RDS PostgreSQL
   - Cache: ElastiCache Redis
   - Pros: Escalable, completo
   - Contras: Configuración compleja

3. **Railway / Render**
   - Backend: Containers
   - Database: Managed PostgreSQL
   - Pros: Simple, económico
   - Contras: Menos control

### CI/CD

**Pipeline recomendado**:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: npm run build
      
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deploy commands
```

### Monitoreo

**Herramientas**:

- **Logs**: Logtail, Datadog, CloudWatch
- **APM**: New Relic, Datadog APM
- **Errors**: Sentry
- **Uptime**: Pingdom, UptimeRobot

**Alertas**:

- Error rate > 5%
- Response time > 2s (p95)
- Database connections > 80%
- CPU usage > 80%

### Backups

- **Base de datos**: Backup diario automático
- **Retención**: 30 días
- **Restauración**: Proceso documentado y probado

### Seguridad

1. **SSL/TLS**: Obligatorio en producción
2. **Secrets**: Usar variables de entorno, nunca en código
3. **SQL Injection**: Usar ORM o prepared statements
4. **XSS**: Sanitización de inputs
5. **CORS**: Configuración restrictiva
6. **Rate Limiting**: Implementado en todos los endpoints
7. **Auditoría**: Logs de acciones críticas

---

## Cronograma de Implementación

### Fase 1: MVP Backend (4-6 semanas)

**Semana 1-2**: Setup y Base de Datos

- [ ] Configurar proyecto (NestJS/Express)
- [ ] Setup PostgreSQL + Prisma/TypeORM
- [ ] Crear esquema de base de datos
- [ ] Seeders con data inicial

**Semana 3-4**: APIs Core

- [ ] Auth Service (login, registro, JWT)
- [ ] Catalog Service (CRUD de medicamentos)
- [ ] Pharmacy Service (farmacias y sucursales)
- [ ] Price Service (comparación de precios)

**Semana 5-6**: Integraciones y Analytics

- [ ] Integración con Google Maps API
- [ ] Analytics Service (eventos básicos)
- [ ] Chatbot Service (integración con OpenAI)
- [ ] Testing y documentación

### Fase 2: Integraciones Avanzadas (4 semanas)

- [ ] Scraper de SNIP
- [ ] Integración con farmacias (APIs/scraping)
- [ ] Sistema de notificaciones por email
- [ ] Dashboard de analytics avanzado

### Fase 3: Optimización y Escalabilidad (2-4 semanas)

- [ ] Cache con Redis
- [ ] Queue system para jobs
- [ ] Optimización de queries
- [ ] Load testing y performance tuning

---

## Consideraciones Finales

### Escalabilidad

- Diseñar para escalar horizontalmente
- Usar cache agresivamente (Redis)
- Implementar CDN para assets
- Database read replicas para queries pesadas

### Mantenimiento

- Documentación completa de APIs (Swagger/OpenAPI)
- Monitoreo y alertas configuradas
- Proceso de deploy automatizado
- Backups automáticos y verificados

### Compliance

- **Protección de datos**: Cumplir con Ley de Protección de Datos Personales (Perú)
- **Términos y condiciones**: Publicados y aceptados por usuarios
- **Privacidad**: Política de privacidad clara
- **Disclaimer médico**: Visible y obligatorio en chatbot

---

## Recursos y Referencias

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

---

**Última actualización**: Diciembre 2024
**Versión del documento**: 1.0

