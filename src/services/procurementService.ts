import apiClient from './apiClient';
import type { Shipment } from '../data/mockData';

export const procurementService = {
  list: async (params?: Record<string, any>): Promise<any[]> => {
    const res: any = await apiClient.get('/purchase-orders', { params });
    return res.data || [];
  },

  getById: async (id: string): Promise<any> => {
    const res: any = await apiClient.get(`/purchase-orders/${id}`);
    return res.data;
  },

  create: async (data: any): Promise<any> => {
    const res: any = await apiClient.post('/purchase-orders', data);
    return res.data;
  },

  approve: async (id: string): Promise<any> => {
    const res: any = await apiClient.post(`/purchase-orders/${id}/approve`);
    return res.data;
  },

  confirm: async (id: string): Promise<any> => {
    const res: any = await apiClient.post(`/purchase-orders/${id}/confirm`);
    return res.data;
  },

  deliver: async (id: string): Promise<any> => {
    const res: any = await apiClient.post(`/purchase-orders/${id}/deliver`);
    return res.data;
  },
};

export const shipmentService = {
  list: async (params?: Record<string, any>): Promise<Shipment[]> => {
    const res: any = await apiClient.get('/shipments', { params });
    return res.data || [];
  },

  getById: async (id: string): Promise<Shipment> => {
    const res: any = await apiClient.get(`/shipments/${id}`);
    return res.data;
  },

  create: async (data: any): Promise<Shipment> => {
    const res: any = await apiClient.post('/shipments', data);
    return res.data;
  },

  updateStatus: async (id: string, status: string): Promise<Shipment> => {
    const res: any = await apiClient.post(`/shipments/${id}/status`, { status });
    return res.data;
  },

  updateLocation: async (id: string, location: string, note?: string): Promise<Shipment> => {
    const res: any = await apiClient.post(`/shipments/${id}/location`, { location, note });
    return res.data;
  },

  getTracking: async (id: string): Promise<any> => {
    const res: any = await apiClient.get(`/shipments/${id}/tracking`);
    return res.data;
  },
};
