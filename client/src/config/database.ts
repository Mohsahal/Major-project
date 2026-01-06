
// Stateless Database Configuration - No Data Storage
// This configuration is maintained for compatibility but does not store any user data

const API_BASE_URL = (import.meta as ImportMeta)?.env?.VITE_API_BASE_URL || 'https://job-reco-backend.onrender.com/api';

// Mock database interface for compatibility (no actual data storage)
export const db = {
  collection: (collectionName: string) => ({
    add: async (data: Record<string, unknown>) => {
      // Stateless mode: return mock ID without storing data
      console.warn('Stateless mode: Data not stored, returning mock ID');
      return { id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
    },
    get: async () => {
      // Stateless mode: return empty result
      console.warn('Stateless mode: No stored data available');
      return { docs: [] };
    }
  }),
  doc: (collectionName: string, docId: string) => ({
    get: async () => {
      // Stateless mode: return non-existent document
      console.warn('Stateless mode: No stored documents available');
      return {
        exists: false,
        id: null,
        data: () => null
      };
    }
  })
};

export const query = (collectionRef: { _path?: { segments?: string[] } }, ...constraints: any[]) => {
  // Stateless mode: Mock query function (no data storage)
  return {
    get: async () => {
      console.warn('Stateless mode: Query returns empty results - no data stored');
      return { docs: [] };
    }
  };
};

export const where = (field: string, operator: string, value: any) => ({
  type: 'where',
  field,
  operator,
  value
});

export const collection = (db: any, collectionName: string) => ({
  _path: { segments: [collectionName] }
});

// Stateless utility functions (no data persistence)
export const getDocs = async (queryRef: any) => {
  console.warn('Stateless mode: getDocs returns empty results');
  return { docs: [] };
};

export const getDoc = async (docRef: any) => {
  console.warn('Stateless mode: getDoc returns non-existent document');
  return { exists: false, data: () => null };
};

export const addDoc = async (collectionRef: any, data: any) => {
  console.warn('Stateless mode: addDoc returns mock ID without storing data');
  return { id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
};

export const serverTimestamp = () => new Date();
export const auth = {} as any; // Mock auth for compatibility
