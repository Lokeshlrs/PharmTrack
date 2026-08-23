import apiClient from './apiClient';

export const forecastService = {
  list: async (): Promise<any[]> => {
    const res: any = await apiClient.get('/forecast');
    return res.data || [];
  },

  getForDrug: async (drugId: string, days = 30): Promise<any> => {
    const res: any = await apiClient.get(`/forecast/${drugId}`, { params: { days } });
    return res.data;
  },

  getReorder: async (drugId: string): Promise<any> => {
    const res: any = await apiClient.get(`/forecast/${drugId}/reorder`);
    return res.data;
  },

  generatePO: async (drugId: string): Promise<any> => {
    const res: any = await apiClient.post(`/forecast/${drugId}/generate-purchase-order`);
    return res.data;
  },
};

export const coldChainService = {
  listUnits: async (): Promise<any[]> => {
    const res: any = await apiClient.get('/cold-chain');
    return res.data || [];
  },

  getUnit: async (unitId: string): Promise<any> => {
    const res: any = await apiClient.get(`/cold-chain/${unitId}`);
    return res.data;
  },

  getReadings: async (unitId: string): Promise<any[]> => {
    const res: any = await apiClient.get(`/cold-chain/${unitId}/readings`);
    return res.data || [];
  },

  recordReading: async (data: any): Promise<any> => {
    const res: any = await apiClient.post('/cold-chain/readings', data);
    return res.data;
  },

  simulateBreach: async (data?: { storageUnitId?: string; temperature?: number; humidity?: number }): Promise<any> => {
    const res: any = await apiClient.post('/cold-chain/simulate', data || {});
    return res.data;
  },
};

export const recallService = {
  list: async (): Promise<any[]> => {
    const res: any = await apiClient.get('/recalls');
    return res.data || [];
  },

  initiate: async (data: any): Promise<any> => {
    const res: any = await apiClient.post('/recalls', data);
    return res.data;
  },

  quarantine: async (id: string): Promise<any> => {
    const res: any = await apiClient.post(`/recalls/${id}/quarantine`);
    return res.data;
  },

  notifyHospitals: async (id: string): Promise<any> => {
    const res: any = await apiClient.post(`/recalls/${id}/notify`);
    return res.data;
  },
};

export const analyticsService = {
  getDashboard: async (): Promise<any> => {
    const res: any = await apiClient.get('/analytics/dashboard');
    return res.data;
  },

  getAll: async (): Promise<any> => {
    const res: any = await apiClient.get('/analytics');
    return res.data;
  },

  getShortageMap: async (): Promise<any[]> => {
    const res: any = await apiClient.get('/analytics/shortage-map');
    return res.data || [];
  },
};

export const notificationService = {
  list: async (params?: Record<string, any>): Promise<any[]> => {
    const res: any = await apiClient.get('/notifications', { params });
    return res.data || [];
  },

  getUnread: async (): Promise<any[]> => {
    const res: any = await apiClient.get('/notifications/unread');
    return res.data || [];
  },

  markRead: async (id: string): Promise<any> => {
    const res: any = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllRead: async (): Promise<any> => {
    const res: any = await apiClient.patch('/notifications/read-all');
    return res.data;
  },
};

export const traceabilityService = {
  getBatch: async (batchId: string): Promise<any> => {
    const res: any = await apiClient.get(`/traceability/batch/${encodeURIComponent(batchId)}`);
    return res.data;
  },
  scanQR: async (qrData: string): Promise<any> => {
    const res: any = await apiClient.post('/traceability/scan', { qrData });
    return res.data;
  },
};

export const auditService = {
  list: async (params?: Record<string, any>): Promise<any[]> => {
    const res: any = await apiClient.get('/audit-logs', { params });
    return res.data || [];
  },
};

