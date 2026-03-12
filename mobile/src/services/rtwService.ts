import api from './api';

export interface RtwStatus {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  document_type: string;
  submitted_at: string;
  rejection_reason?: string;
}

export const rtwService = {
  getStatus: async (): Promise<RtwStatus | null> => {
    try {
      const res = await api.get('/api/right-to-work/status');
      return res.data.data as RtwStatus;
    } catch {
      return null;
    }
  },

  submit: async (payload: {
    document_type: string;
    document_number: string;
    expiry_date?: string;
  }): Promise<RtwStatus> => {
    const res = await api.post('/api/right-to-work/submit', payload);
    return res.data.data as RtwStatus;
  },
};
