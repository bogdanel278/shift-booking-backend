import api from './api';

export interface RtwStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  verification_method: 'passport' | 'visa' | 'share_code';
  submitted_at: string;
  notes?: string | null;
}

export interface PassportExtractedFields {
  documentType?: string;
  passportNumber: string;
  expiryDate: string;
  countryOfIssue: string;
  name: string;
  dateOfBirth: string;
  licenseNumber?: string;
  idNumber?: string;
  visaNumber?: string;
  visaType?: string;
  shareCode?: string;
}

interface WorkerRtwStatusResponse {
  has_verification: boolean;
  status: RtwStatus['status'] | null;
  verification: RtwStatus | null;
}

export const rtwService = {
  getStatus: async (): Promise<RtwStatus | null> => {
    try {
      const res = await api.get('/api/right-to-work/status');
      const data = res.data.data as WorkerRtwStatusResponse;
      if (!data?.has_verification || !data.verification) {
        return null;
      }
      return data.verification;
    } catch {
      return null;
    }
  },

  submit: async (payload: {
    document_type: string;
    document_number: string;
    expiry_date?: string;
    id_document_uri?: string;
    rtw_document_uri?: string;
  }): Promise<RtwStatus> => {
    const res = await api.post('/api/right-to-work/submit', payload);
    return res.data.data as RtwStatus;
  },

  analyzeDocument: async (payload: {
    documentType: string;
    uri: string;
    fileName: string;
    mimeType?: string;
  }): Promise<PassportExtractedFields> => {
    const formData = new FormData();
    formData.append('documentType', payload.documentType);
    formData.append('file', {
      uri: payload.uri,
      name: payload.fileName,
      type: payload.mimeType || 'application/octet-stream',
    } as any);

    const res = await api.post('/api/right-to-work/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data as PassportExtractedFields;
  },
};
