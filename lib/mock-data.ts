export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  isOpen: boolean;
  hours: string;
  phone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Product {
  id: string;
  name: string;
  genericName?: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  pharmacy: Pharmacy;
  isGeneric: boolean;
  prescription: boolean;
  discount?: number;
  stock: number;
  description: string;
  activeIngredient: string;
  presentation: string;
  laboratory: string;
  // Información médica adicional (opcional para compatibilidad)
  indications?: string[];
  contraindications?: string[];
  dosage?: string;
  sideEffects?: string[];
  interactions?: string[];
  composition?: string;
  warnings?: string[];
  storageConditions?: string;
  expirationDate?: string;
}

export const mockPharmacies: Pharmacy[] = [
  {
    id: "1",
    name: "InkaFarma San Isidro",
    address: "Av. Javier Prado Este 1234, San Isidro",
    distance: "0.8 km",
    rating: 4.5,
    isOpen: true,
    hours: "24 horas",
    phone: "+51 1 234-5678",
    coordinates: { lat: -12.0954, lng: -77.0397 }
  },
  {
    id: "2", 
    name: "MiFarma Miraflores",
    address: "Av. Larco 789, Miraflores",
    distance: "1.2 km",
    rating: 4.3,
    isOpen: true,
    hours: "7:00 AM - 11:00 PM",
    phone: "+51 1 234-5679",
    coordinates: { lat: -12.1215, lng: -77.0298 }
  },
  {
    id: "3",
    name: "Boticas Arcángel",
    address: "Av. El Ejército 456, Miraflores", 
    distance: "1.5 km",
    rating: 4.2,
    isOpen: false,
    hours: "8:00 AM - 10:00 PM",
    phone: "+51 1 234-5680",
    coordinates: { lat: -12.1198, lng: -77.0280 }
  },
  {
    id: "4",
    name: "Farmacia Universal",
    address: "Jirón de la Unión 567, Lima Centro",
    distance: "2.1 km", 
    rating: 4.0,
    isOpen: true,
    hours: "6:00 AM - 12:00 AM",
    phone: "+51 1 234-5681",
    coordinates: { lat: -12.0464, lng: -77.0306 }
  },
  {
    id: "5",
    name: "Boticas y Salud",
    address: "Av. Brasil 890, Breña",
    distance: "2.8 km",
    rating: 4.1,
    isOpen: true,
    hours: "7:00 AM - 11:00 PM", 
    phone: "+51 1 234-5682",
    coordinates: { lat: -12.0598, lng: -77.0522 }
  }
];

// Helper function para generar información médica básica
const getBasicMedicalInfo = (name: string, genericName: string = "", isGeneric: boolean = false) => ({
  indications: ["Consultar con profesional médico", "Seguir indicaciones del prospecto"],
  contraindications: ["Hipersensibilidad al principio activo", "Consultar con médico antes de usar"],
  dosage: "Seguir indicaciones médicas y del prospecto adjunto",
  sideEffects: ["Posibles reacciones adversas según prospecto", "Consultar médico si aparecen efectos no deseados"],
  interactions: ["Informar al médico sobre otros medicamentos que esté tomando"],
  composition: `Contiene ${genericName || name} como principio activo`,
  warnings: ["Mantener fuera del alcance de los niños", "No exceder la dosis recomendada"],
  storageConditions: "Conservar en lugar seco y fresco, protegido de la luz",
  expirationDate: "Ver fecha en el empaque"
});

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    genericName: "Paracetamol",
    brand: "Genérico",
    price: 8.50,
    originalPrice: 12.00,
    image: "/api/placeholder/300/300",
    pharmacy: mockPharmacies[0],
    isGeneric: true,
    prescription: false,
    discount: 29,
    stock: 25,
    description: "Analgésico y antipirético para el alivio del dolor y la fiebre",
    activeIngredient: "Paracetamol 500mg",
    presentation: "Caja x 20 tabletas",
    laboratory: "Laboratorios AC Farma",
    indications: [
      "Alivio temporal de dolores leves a moderados",
      "Reducción de la fiebre",
      "Dolor de cabeza y migraña",
      "Dolor muscular y articular",
      "Dolor dental",
      "Malestar asociado con resfriados y gripe"
    ],
    contraindications: [
      "Hipersensibilidad al paracetamol",
      "Insuficiencia hepática grave",
      "Hepatitis activa",
      "Alcoholismo crónico"
    ],
    dosage: "Adultos: 1-2 tabletas cada 4-6 horas. Máximo 8 tabletas en 24 horas. No exceder 4g diarios.",
    sideEffects: [
      "Raros: náuseas, vómitos",
      "Muy raros: reacciones cutáneas",
      "Sobredosis: hepatotoxicidad"
    ],
    interactions: [
      "Warfarina: puede potenciar efecto anticoagulante",
      "Alcohol: incrementa riesgo de hepatotoxicidad",
      "Rifampicina: reduce eficacia del paracetamol"
    ],
    composition: "Cada tableta contiene: Paracetamol 500mg, excipientes c.s.p.",
    warnings: [
      "No exceder la dosis recomendada",
      "Consultar médico si síntomas persisten por más de 3 días",
      "No administrar con otros medicamentos que contengan paracetamol"
    ],
    storageConditions: "Conservar en lugar seco y fresco, protegido de la luz. Temperatura no mayor a 30°C.",
    expirationDate: "Abril 2026"
  },
  {
    id: "2", 
    name: "Tylenol 500mg",
    genericName: "Paracetamol",
    brand: "Johnson & Johnson",
    price: 15.90,
    image: "/api/placeholder/300/300",
    pharmacy: mockPharmacies[1],
    isGeneric: false,
    prescription: false,
    stock: 18,
    description: "Analgésico y antipirético de marca reconocida",
    activeIngredient: "Paracetamol 500mg",
    presentation: "Caja x 10 tabletas",
    laboratory: "Johnson & Johnson",
    ...getBasicMedicalInfo("Tylenol 500mg", "Paracetamol", false)
  },
  {
    id: "3",
    name: "Ibuprofeno 400mg",
    genericName: "Ibuprofeno", 
    brand: "Genérico",
    price: 12.30,
    originalPrice: 18.50,
    image: "/api/placeholder/300/300",
    pharmacy: mockPharmacies[2],
    isGeneric: true,
    prescription: false,
    discount: 33,
    stock: 12,
    description: "Antiinflamatorio no esteroideo para dolor e inflamación",
    activeIngredient: "Ibuprofeno 400mg",
    presentation: "Caja x 20 tabletas",
    laboratory: "Laboratorios Corporación Infarmasa"
  },
  {
    id: "4",
    name: "Advil 400mg",
    genericName: "Ibuprofeno",
    brand: "Pfizer",
    price: 22.50,
    image: "/api/placeholder/300/300", 
    pharmacy: mockPharmacies[1],
    isGeneric: false,
    prescription: false,
    stock: 8,
    description: "Antiinflamatorio de marca líder mundial",
    activeIngredient: "Ibuprofeno 400mg",
    presentation: "Caja x 20 cápsulas",
    laboratory: "Pfizer"
  },
  {
    id: "5",
    name: "Amoxicilina 500mg",
    genericName: "Amoxicilina",
    brand: "Genérico",
    price: 25.80,
    originalPrice: 35.00,
    image: "/api/placeholder/300/300",
    pharmacy: mockPharmacies[3],
    isGeneric: true,
    prescription: true,
    discount: 26,
    stock: 15,
    description: "Antibiótico de amplio espectro para infecciones bacterianas",
    activeIngredient: "Amoxicilina 500mg",
    presentation: "Caja x 21 cápsulas",
    laboratory: "Laboratorios Portugal"
  },
  {
    id: "6",
    name: "Amoxil 500mg",
    genericName: "Amoxicilina",
    brand: "GSK",
    price: 45.60,
    image: "/api/placeholder/300/300",
    pharmacy: mockPharmacies[0],
    isGeneric: false,
    prescription: true,
    stock: 6,
    description: "Antibiótico de marca reconocida internacionalmente",
    activeIngredient: "Amoxicilina 500mg",
    presentation: "Caja x 21 cápsulas",
    laboratory: "GlaxoSmithKline"
  },
  {
    id: "7",
    name: "Omeprazol 20mg",
    genericName: "Omeprazol",
    brand: "Genérico",
    price: 18.90,
    originalPrice: 28.00,
    image: "/api/placeholder/300/300",
    pharmacy: mockPharmacies[4],
    isGeneric: true,
    prescription: false,
    discount: 32,
    stock: 22,
    description: "Inhibidor de la bomba de protones para úlceras y acidez",
    activeIngredient: "Omeprazol 20mg",
    presentation: "Caja x 14 cápsulas",
    laboratory: "Laboratorios Bagó"
  },
  {
    id: "8",
    name: "Losec 20mg",
    genericName: "Omeprazol",
    brand: "AstraZeneca",
    price: 38.50,
    image: "/api/placeholder/300/300",
    pharmacy: mockPharmacies[2],
    isGeneric: false,
    prescription: false,
    stock: 10,
    description: "Tratamiento original para problemas gástricos",
    activeIngredient: "Omeprazol 20mg", 
    presentation: "Caja x 14 cápsulas",
    laboratory: "AstraZeneca"
  },
  {
    id: "9",
    name: "Loratadina 10mg",
    genericName: "Loratadina",
    brand: "Genérico",
    price: 14.20,
    originalPrice: 20.00,
    image: "/api/placeholder/300/300",
    pharmacy: mockPharmacies[1],
    isGeneric: true,
    prescription: false,
    discount: 29,
    stock: 30,
    description: "Antihistamínico para alergias y rinitis",
    activeIngredient: "Loratadina 10mg",
    presentation: "Caja x 10 tabletas", 
    laboratory: "Laboratorios Roemmers"
  },
  {
    id: "10",
    name: "Claritin 10mg",
    genericName: "Loratadina",
    brand: "Bayer",
    price: 32.80,
    image: "/api/placeholder/300/300",
    pharmacy: mockPharmacies[3],
    isGeneric: false,
    prescription: false,
    stock: 14,
    description: "Antihistamínico de larga duración sin somnolencia",
    activeIngredient: "Loratadina 10mg",
    presentation: "Caja x 10 tabletas",
    laboratory: "Bayer"
  },
  {
    id: "11",
    name: "Diclofenaco 50mg",
    genericName: "Diclofenaco",
    brand: "Genérico", 
    price: 16.50,
    originalPrice: 24.00,
    image: "/api/placeholder/300/300",
    pharmacy: mockPharmacies[4],
    isGeneric: true,
    prescription: false,
    discount: 31,
    stock: 20,
    description: "Antiinflamatorio para dolor muscular y articular",
    activeIngredient: "Diclofenaco sódico 50mg",
    presentation: "Caja x 20 tabletas",
    laboratory: "Laboratorios Synthesis"
  },
  {
    id: "12",
    name: "Voltaren 50mg",
    genericName: "Diclofenaco",
    brand: "Novartis",
    price: 28.90,
    image: "/api/placeholder/300/300",
    pharmacy: mockPharmacies[0],
    isGeneric: false,
    prescription: false,
    stock: 7,
    description: "Antiinflamatorio de marca líder para el dolor",
    activeIngredient: "Diclofenaco sódico 50mg",
    presentation: "Caja x 20 tabletas",
    laboratory: "Novartis"
  }
];

// Funciones de utilidad para búsqueda y filtrado
export function searchProducts(query: string, products: Product[] = mockProducts): Product[] {
  if (!query.trim()) return products;
  
  const searchTerm = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.genericName?.toLowerCase().includes(searchTerm) ||
    product.brand.toLowerCase().includes(searchTerm) ||
    product.activeIngredient.toLowerCase().includes(searchTerm)
  );
}

export function filterProducts(
  products: Product[],
  filters: {
    type?: 'generico' | 'marca' | 'todos';
    priceRange?: [number, number];
    maxDistance?: string;
    onlyInStock?: boolean;
  }
): Product[] {
  let filtered = [...products];

  if (filters.type && filters.type !== 'todos') {
    filtered = filtered.filter(product => 
      filters.type === 'generico' ? product.isGeneric : !product.isGeneric
    );
  }

  if (filters.priceRange) {
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange![0] && 
      product.price <= filters.priceRange![1]
    );
  }

  if (filters.onlyInStock) {
    filtered = filtered.filter(product => product.stock > 0);
  }

  return filtered;
}

export function sortProducts(
  products: Product[],
  sortBy: 'price-asc' | 'price-desc' | 'distance' | 'rating' | 'name'
): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'distance':
      return sorted.sort((a, b) => 
        parseFloat(a.pharmacy.distance) - parseFloat(b.pharmacy.distance)
      );
    case 'rating':
      return sorted.sort((a, b) => b.pharmacy.rating - a.pharmacy.rating);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}
