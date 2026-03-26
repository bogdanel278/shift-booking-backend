import api from './api';

export interface RtwStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'failed';
  verification_method: 'passport' | 'visa' | 'share_code' | 'liveness';
  submitted_at: string;
  share_code?: string | null;
  passport_number?: string | null;
  notes?: string | null;
}

export interface LivenessSessionResponse {
  verificationId: string;
  sessionId: string;
  sessionUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'failed';
}

export interface RtwStepStatus {
  status: RtwStatus['status'] | null;
  verification: RtwStatus | null;
}

export interface WorkerRtwStatus {
  has_verification: boolean;
  status: RtwStatus['status'] | null;
  verification: RtwStatus | null;
  id_step: RtwStepStatus;
  share_code_step: RtwStepStatus;
  can_submit_share_code: boolean;
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
  rawText?: string;
  raw_text?: string;
}

export const rtwService = {
  getStatus: async (): Promise<WorkerRtwStatus | null> => {
    try {
      const res = await api.get('/api/right-to-work/status');
      const data = res.data.data as WorkerRtwStatus;
      if (!data) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  submit: async (payload: {
    verification_method: 'passport' | 'visa' | 'share_code';
    passport_number?: string;
    passport_country?: string;
    passport_expiry_date?: string;
    visa_type?: string;
    visa_reference?: string;
    visa_expiry_date?: string;
    share_code?: string;
    date_of_birth?: string;
    document_file_url?: string;
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

  createLivenessSession: async (payload?: { callbackUrl?: string; vendorData?: string }): Promise<LivenessSessionResponse> => {
    const res = await api.post('/api/liveness/session', payload || {});
    return res.data.data as LivenessSessionResponse;
  },
};
