import apiClient from './apiClient';
import type { InventoryItem } from '../data/mockData';

export const inventoryService = {
  list: async (params?: Record<string, any>): Promise<InventoryItem[]> => {
    const res: any = await apiClient.get('/inventory', { params });
    return res.data || [];
  },

  getById: async (id: string): Promise<InventoryItem> => {
    const res: any = await apiClient.get(`/inventory/${id}`);
    return res.data;
  },

  create: async (data: any): Promise<InventoryItem> => {
    const res: any = await apiClient.post('/inventory', data);
    return res.data;
  },

  adjust: async (id: string, adjustment: { quantityAdjustment: number; reason?: string }): Promise<InventoryItem> => {
    const res: any = await apiClient.post('/inventory/adjust', { id, ...adjustment });
    return res.data;
  },

  consume: async (id: string, data: { quantity: number; department?: string; dispensedTo?: string }): Promise<any> => {
    const res: any = await apiClient.post('/inventory/consume', { id, ...data });
    return res.data;
  },

  consumeFEFO: async (data: { drugId: string; quantity: number; location?: string; department?: string }): Promise<any> => {
    const res: any = await apiClient.post('/inventory/consume-fefo', data);
    return res.data;
  },

  getCritical: async (): Promise<InventoryItem[]> => {
    const res: any = await apiClient.get('/inventory/critical');
    return res.data || [];
  },

  getExpiring: async (days = 30): Promise<InventoryItem[]> => {
    const res: any = await apiClient.get('/inventory/expiring', { params: { days } });
    return res.data || [];
  },

  getExpired: async (): Promise<InventoryItem[]> => {
    const res: any = await apiClient.get('/inventory/expired');
    return res.data || [];
  },

  getFEFOForDrug: async (drugId: string): Promise<InventoryItem[]> => {
    const res: any = await apiClient.get(`/inventory/fefo/${drugId}`);
    return res.data || [];
  },
};

export const drugService = {
  list: async (params?: Record<string, any>): Promise<any[]> => {
    const res: any = await apiClient.get('/drugs', { params });
    return res.data || [];
  },

  getById: async (id: string): Promise<any> => {
    const res: any = await apiClient.get(`/drugs/${id}`);
    return res.data;
  },

  create: async (data: any): Promise<any> => {
    const res: any = await apiClient.post('/drugs', data);
    return res.data;
  },

  update: async (id: string, data: any): Promise<any> => {
    const res: any = await apiClient.patch(`/drugs/${id}`, data);
    return res.data;
  },

  listBatches: async (params?: Record<string, any>): Promise<any[]> => {
    const res: any = await apiClient.get('/batches', { params });
    return res.data || [];
  },

  recordQC: async (batchId: string, data: any): Promise<any> => {
    const res: any = await apiClient.post(`/batches/${batchId}/quality-check`, data);
    return res.data;
  },

  getBatchHistory: async (batchId: string): Promise<any> => {
    const res: any = await apiClient.get(`/batches/${batchId}/history`);
    return res.data;
  },
};
