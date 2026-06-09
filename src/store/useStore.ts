import { create } from 'zustand';

export interface LawnSection {
  id: string;
  name: string;
  areaSqFt: number;
  boundaryGeoJSON: any;
}

export interface Property {
  id: string;
  name: string;
  location: { address: string; city: string; state: string; coords?: [number, number] };
  lawns: LawnSection[];
}

interface AppState {
  onboardingStep: 'splash' | 'address' | 'map' | 'dashboard';
  properties: Property[];
  activePropertyId: string | null;
  
  setOnboardingStep: (step: 'splash' | 'address' | 'map' | 'dashboard') => void;
  
  addProperty: (propertyData: Omit<Property, 'id' | 'lawns'> & { id?: string }) => string;
  setActivePropertyId: (id: string) => void;
  updatePropertyLocation: (id: string, location: Property['location']) => void;
  
  addLawnSection: (lawnData: Omit<LawnSection, 'id'>) => void;
  updateLawnSection: (id: string, lawnData: Partial<Omit<LawnSection, 'id'>>) => void;
  removeLawnSection: (id: string) => void;
  
  resetOnboarding: () => void;
}

export const useStore = create<AppState>()((set, get) => ({
  onboardingStep: 'splash',
  properties: [],
  activePropertyId: null,

  setOnboardingStep: (step) => set({ onboardingStep: step }),

  addProperty: (propertyData) => {
    const newId = propertyData.id || crypto.randomUUID();
    const newProperty: Property = {
      id: newId,
      name: propertyData.name,
      location: propertyData.location,
      lawns: []
    };
    set((state) => ({
      properties: [...state.properties, newProperty],
      activePropertyId: newId
    }));
    return newId;
  },

  setActivePropertyId: (id) => set({ activePropertyId: id }),

  updatePropertyLocation: (id, location) => set((state) => ({
    properties: state.properties.map(p => 
      p.id === id ? { ...p, location } : p
    )
  })),

  addLawnSection: (lawnData) => set((state) => {
    if (!state.activePropertyId) return state;
    const newSection: LawnSection = {
      id: crypto.randomUUID(),
      ...lawnData
    };
    return {
      properties: state.properties.map(p => 
        p.id === state.activePropertyId 
          ? { ...p, lawns: [...p.lawns, newSection] } 
          : p
      )
    };
  }),

  updateLawnSection: (id, lawnData) => set((state) => {
    if (!state.activePropertyId) return state;
    return {
      properties: state.properties.map(p => 
        p.id === state.activePropertyId 
          ? {
              ...p,
              lawns: p.lawns.map(l => l.id === id ? { ...l, ...lawnData } : l)
            }
          : p
      )
    };
  }),

  removeLawnSection: (id) => set((state) => {
    if (!state.activePropertyId) return state;
    return {
      properties: state.properties.map(p => 
        p.id === state.activePropertyId 
          ? { ...p, lawns: p.lawns.filter(l => l.id !== id) } 
          : p
      )
    };
  }),

  resetOnboarding: () => set({ 
    onboardingStep: 'splash', 
    properties: [],
    activePropertyId: null
  }),
}));
