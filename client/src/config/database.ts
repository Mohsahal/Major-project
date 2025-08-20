

const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const db = {
  collection: (collectionName: string) => ({
    add: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/${collectionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('futurefind_token')}`
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return { id: result.id || result._id };
    },
    get: async () => {
      const response = await fetch(`${API_BASE_URL}/${collectionName}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('futurefind_token')}`
        }
      });
      const data = await response.json();
      return {
        docs: data.map((item: any) => ({
          id: item._id || item.id,
          data: () => item
        }))
      };
    }
  }),
  doc: (collectionName: string, docId: string) => ({
    get: async () => {
      const response = await fetch(`${API_BASE_URL}/${collectionName}/${docId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('futurefind_token')}`
        }
      });
      const data = await response.json();
      return {
        exists: !!data,
        id: data._id || data.id,
        data: () => data
      };
    }
  })
};

export const query = (collectionRef: any, ...constraints: any[]) => {
  // Mock query function that filters data
  return {
    get: async () => {
      const response = await fetch(`${API_BASE_URL}/${collectionRef._path?.segments?.[0] || 'userAnswers'}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('futurefind_token')}`
        }
      });
      const data = await response.json();
      
      // Apply constraints (simplified filtering)
      let filteredData = data;
      constraints.forEach(constraint => {
        if (constraint.type === 'where') {
          filteredData = filteredData.filter((item: any) => 
            item[constraint.field] === constraint.value
          );
        }
      });
      
      return {
        docs: filteredData.map((item: any) => ({
          id: item._id || item.id,
          data: () => item
        }))
      };
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

export const getDocs = async (queryRef: any) => {
  return await queryRef.get();
};

export const getDoc = async (docRef: any) => {
  return await docRef.get();
};

export const addDoc = async (collectionRef: any, data: any) => {
  return await collectionRef.add(data);
};

export const serverTimestamp = () => new Date();
export const auth = {} as any;
