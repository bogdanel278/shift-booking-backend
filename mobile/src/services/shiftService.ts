import api from './api';

export interface Shift {
  id: number;
  title: string;
  description?: string;
  location: string;
  requirements?: string;
  start_time: string;
  end_time: string;
  pay_rate: number;
  max_workers?: number;
  category?: string;
  status: string;
}

export const shiftService = {
  getAvailable: async (): Promise<Shift[]> => {
    const res = await api.get('/api/shifts?available=true');
    return res.data.data as Shift[];
  },

  getById: async (id: number): Promise<Shift> => {
    const res = await api.get(`/api/shifts/${id}`);
    return res.data.data as Shift;
  },

  create: async (payload: Partial<Shift>): Promise<Shift> => {
    const res = await api.post('/api/shifts', payload);
    return res.data.data as Shift;
  },
};
