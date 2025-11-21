import { create } from 'zustand';
import { Product, Pharmacy, searchProducts, filterProducts, sortProducts } from '@/lib/mock-data';

interface SearchFilters {
  type: 'generico' | 'marca' | 'todos';
  priceRange: [number, number];
  maxDistance: string;
  onlyInStock: boolean;
}

interface UserLocation {
  lat: number;
  lng: number;
  address: string;
}

interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
}

interface OrderHistory {
  id: string;
  items: Array<{ productId: string; quantity: number; pharmacyId: string; price: number }>;
  total: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'cancelled';
  pharmacyName: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  preferences: {
    preferGeneric: boolean;
    maxDistance: number;
    notifications: boolean;
  };
}

interface AppState {
  // Search & Filters
  searchQuery: string;
  filters: SearchFilters;
  sortBy: 'price-asc' | 'price-desc' | 'distance' | 'rating' | 'name';
  
  // Products & Results
  allProducts: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;
  
  // User State
  userLocation: UserLocation | null;
  favorites: string[];
  cart: Array<{ productId: string; quantity: number; pharmacyId: string }>;
  
  // Profile & History
  userProfile: UserProfile | null;
  searchHistory: SearchHistory[];
  orderHistory: OrderHistory[];
  
  // UI State
  isLoading: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setSortBy: (sortBy: 'price-asc' | 'price-desc' | 'distance' | 'rating' | 'name') => void;
  setUserLocation: (location: UserLocation) => void;
  
  // Product Actions
  setSelectedProduct: (product: Product | null) => void;
  addToFavorites: (productId: string) => void;
  removeFromFavorites: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  
  // Cart Actions
  addToCart: (productId: string, pharmacyId: string, quantity?: number) => void;
  removeFromCart: (productId: string, pharmacyId: string) => void;
  updateCartQuantity: (productId: string, pharmacyId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Profile Actions
  updateProfile: (profile: Partial<UserProfile>) => void;
  addToSearchHistory: (query: string, resultsCount: number) => void;
  clearSearchHistory: () => void;
  addToOrderHistory: (order: Omit<OrderHistory, 'id' | 'timestamp'>) => void;
  
  // Search Actions
  performSearch: () => void;
  clearSearch: () => void;
  
  // Geolocation
  getCurrentLocation: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  searchQuery: '',
  filters: {
    type: 'todos',
    priceRange: [0, 500],
    maxDistance: '10km',
    onlyInStock: false,
  },
  sortBy: 'distance',
  
  allProducts: [],
  filteredProducts: [],
  selectedProduct: null,
  
  userLocation: null,
  favorites: [],
  cart: [],
  
  // Profile & History
  userProfile: null,
  searchHistory: [],
  orderHistory: [],
  
  isLoading: false,

  // Search & Filter Actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().performSearch();
  },

  setFilters: (newFilters: Partial<SearchFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().performSearch();
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    get().performSearch();
  },

  setUserLocation: (location: UserLocation) => {
    set({ userLocation: location });
  },

  // Product Actions
  setSelectedProduct: (product: Product | null) => {
    set({ selectedProduct: product });
  },

  addToFavorites: (productId: string) => {
    set(state => ({
      favorites: [...state.favorites, productId]
    }));
  },

  removeFromFavorites: (productId: string) => {
    set(state => ({
      favorites: state.favorites.filter(id => id !== productId)
    }));
  },

  toggleFavorite: (productId: string) => {
    const { favorites } = get();
    if (favorites.includes(productId)) {
      get().removeFromFavorites(productId);
    } else {
      get().addToFavorites(productId);
    }
  },

  // Cart Actions
  addToCart: (productId: string, pharmacyId: string, quantity = 1) => {
    const { allProducts } = get();
    
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
      return;
    }
    
    if (!product.pharmacy || product.pharmacy.id !== pharmacyId) {
      return;
    }

    set(state => {
      const existingItem = state.cart.find(
        item => item.productId === productId && item.pharmacyId === pharmacyId
      );

      if (existingItem) {
        return {
          cart: state.cart.map(item =>
            item.productId === productId && item.pharmacyId === pharmacyId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      } else {
        return {
          cart: [...state.cart, { productId, pharmacyId, quantity }]
        };
      }
    });
  },

  removeFromCart: (productId: string, pharmacyId: string) => {
    set(state => ({
      cart: state.cart.filter(
        item => !(item.productId === productId && item.pharmacyId === pharmacyId)
      )
    }));
  },

  updateCartQuantity: (productId: string, pharmacyId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, pharmacyId);
      return;
    }

    set(state => ({
      cart: state.cart.map(item =>
        item.productId === productId && item.pharmacyId === pharmacyId
          ? { ...item, quantity }
          : item
      )
    }));
  },

  clearCart: () => {
    set({ cart: [] });
  },

  // Profile Actions
  updateProfile: (profileUpdates: Partial<UserProfile>) => {
    set(state => ({
      userProfile: state.userProfile 
        ? { ...state.userProfile, ...profileUpdates }
        : {
            name: '',
            email: '',
            phone: '',
            address: '',
            district: 'San Isidro',
            preferences: {
              preferGeneric: true,
              maxDistance: 10,
              notifications: true,
            },
            ...profileUpdates
          }
    }));
  },

  addToSearchHistory: (query: string, resultsCount: number) => {
    if (!query.trim()) return;
    
    set(state => {
      const newSearch: SearchHistory = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: new Date(),
        resultsCount,
      };
      
      const updatedHistory = [newSearch, ...state.searchHistory.filter(h => h.query !== query.trim())]
        .slice(0, 20);
      
      return { searchHistory: updatedHistory };
    });
  },

  clearSearchHistory: () => {
    set({ searchHistory: [] });
  },

  addToOrderHistory: (orderData: Omit<OrderHistory, 'id' | 'timestamp'>) => {
    set(state => {
      const newOrder: OrderHistory = {
        ...orderData,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      
      return {
        orderHistory: [newOrder, ...state.orderHistory]
      };
    });
  },

  // Search Actions
  performSearch: () => {
    const { searchQuery, filters, sortBy, allProducts, addToSearchHistory } = get();
    
    set({ isLoading: true });

    setTimeout(() => {
      let results = searchProducts(searchQuery, allProducts);
      results = filterProducts(results, filters);
      results = sortProducts(results, sortBy);

      if (searchQuery.trim()) {
        addToSearchHistory(searchQuery, results.length);
      }

      set({ 
        filteredProducts: results,
        isLoading: false 
      });
    }, 300);
  },

  clearSearch: () => {
    set({
      searchQuery: '',
      filteredProducts: [],
      filters: {
        type: 'todos',
        priceRange: [0, 500],
        maxDistance: '10km',
        onlyInStock: false,
      }
    });
  },

  // Geolocation
  getCurrentLocation: async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      set({ isLoading: true });

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          const mockAddress = 'Lima, Perú'; 
          
          set({
            userLocation: {
              lat: latitude,
              lng: longitude,
              address: mockAddress
            },
            isLoading: false
          });
          
          resolve();
        },
        (error) => {
          set({ isLoading: false });
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  },
}));

// Selectors for computed values
export const useCartTotal = () => {
  return useAppStore(state => {
    return state.cart.reduce((total, item) => {
      const product = state.allProducts.find(p => p.id === item.productId);
      if (!product) {
        console.warn(`Producto con ID ${item.productId} no encontrado en allProducts`);
        return total;
      }
      return total + (product.price * item.quantity);
    }, 0);
  });
};

export const useCartItemCount = () => {
  return useAppStore(state => 
    state.cart.reduce((total, item) => total + item.quantity, 0)
  );
};

export const useFavoriteProducts = () => {
  return useAppStore(state => 
    state.allProducts.filter(product => state.favorites.includes(product.id))
  );
};
