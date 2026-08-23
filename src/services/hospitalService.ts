import apiClient from './apiClient';

export const hospitalService = {
  list: async (params?: Record<string, any>): Promise<any[]> => {
    const res: any = await apiClient.get('/hospitals', { params });
    return res.data || [];
  },

  getById: async (id: string): Promise<any> => {
    const res: any = await apiClient.get(`/hospitals/${id}`);
    return res.data;
  },

  getInventory: async (id: string): Promise<any[]> => {
    const res: any = await apiClient.get(`/hospitals/${id}/inventory`);
    return res.data || [];
  },

  getConsumption: async (id: string): Promise<any[]> => {
    const res: any = await apiClient.get(`/hospitals/${id}/consumption`);
    return res.data || [];
  },

  getMapData: async (): Promise<any[]> => {
    const res: any = await apiClient.get('/hospitals/map');
    return res.data || [];
  },

  create: async (data: any): Promise<any> => {
    const res: any = await apiClient.post('/hospitals', data);
    return res.data;
  },
};

export const supplierService = {
  list: async (params?: Record<string, any>): Promise<any[]> => {
    const res: any = await apiClient.get('/suppliers', { params });
    return res.data || [];
  },

  getById: async (id: string): Promise<any> => {
    const res: any = await apiClient.get(`/suppliers/${id}`);
    return res.data;
  },

  getPerformance: async (id: string): Promise<any> => {
    const res: any = await apiClient.get(`/suppliers/${id}/performance`);
    return res.data;
  },

  getRanking: async (): Promise<any[]> => {
    const res: any = await apiClient.get('/suppliers/ranking');
    return res.data || [];
  },

  create: async (data: any): Promise<any> => {
    const res: any = await apiClient.post('/suppliers', data);
    return res.data;
  },
};

export const redistributionService = {
  getRecommendations: async (): Promise<any[]> => {
    const res: any = await apiClient.get('/transfers/recommendations');
    return res.data || [];
  },

  createTransfer: async (data: any): Promise<any> => {
    const res: any = await apiClient.post('/transfers', data);
    return res.data;
  },

  approveTransfer: async (id: string): Promise<any> => {
    const res: any = await apiClient.post(`/transfers/${id}/approve`);
    return res.data;
  },

  rejectTransfer: async (id: string): Promise<any> => {
    const res: any = await apiClient.post(`/transfers/${id}/reject`);
    return res.data;
  },
};

export const emergencyService = {
  list: async (params?: Record<string, any>): Promise<any[]> => {
    const res: any = await apiClient.get('/emergency-requests', { params });
    return res.data || [];
  },

  create: async (data: any): Promise<any> => {
    const res: any = await apiClient.post('/emergency-requests', data);
    return res.data;
  },

  approve: async (id: string): Promise<any> => {
    const res: any = await apiClient.post(`/emergency-requests/${id}/approve`);
    return res.data;
  },

  reject: async (id: string): Promise<any> => {
    const res: any = await apiClient.post(`/emergency-requests/${id}/reject`);
    return res.data;
  },

  recommendSource: async (id: string): Promise<any> => {
    const res: any = await apiClient.post(`/emergency-requests/${id}/recommend-source`);
    return res.data;
  },
};
