import axios from 'axios';
import { UserModel } from '../models/userModel';

export interface CreateLivenessSessionInput {
  workerUserId: string;
  callbackUrl?: string;
  vendorData?: string;
}

export interface LivenessSessionResult {
  sessionId: string;
  sessionUrl: string;
  status: string;
}

type VeriffSessionResponse = {
  verification?: {
    id?: string;
    url?: string;
    status?: string;
  };
};

export class VeriffService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor() {
    this.baseUrl = process.env.VERIFF_BASE_URL || 'https://stationapi.veriff.com';
    this.apiKey = process.env.VERIFF_API_KEY || '';
    this.secretKey = process.env.VERIFF_SECRET_KEY || '';
  }

  private ensureConfigured(): void {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Veriff is not configured. Set VERIFF_API_KEY and VERIFF_SECRET_KEY in .env.');
    }
  }

  async createLivenessSession(input: CreateLivenessSessionInput): Promise<LivenessSessionResult> {
    this.ensureConfigured();

    const user = await UserModel.findById(input.workerUserId);
    if (!user) {
      throw new Error('Worker not found');
    }

    const nameParts = user.name.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || 'Worker';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    try {
      // Prepare callback URL - only use if it's HTTPS
      const callbackUrl = input.callbackUrl || process.env.VERIFF_CALLBACK_URL;
      const useCallback = callbackUrl && callbackUrl.startsWith('https://');

      const requestBody: any = {
        verification: {
          person: {
            firstName,
            lastName,
          },
          vendorData: input.vendorData || `worker:${input.workerUserId}`,
          document: {
            type: 'PASSPORT',
          },
          features: ['selfid'], // Enable production liveness features
        },
      };

      // Only add callback if it's HTTPS
      if (useCallback) {
        requestBody.verification.callback = callbackUrl;
      }

      const response = await axios.post<VeriffSessionResponse>(
        `${this.baseUrl}/v1/sessions`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-AUTH-CLIENT': this.apiKey,
            'X-AUTH-SECRET': this.secretKey,
          },
        },
      );

      const verification = response.data.verification;
      if (!verification?.id || !verification.url) {
        throw new Error('Veriff session response is missing id or url');
      }

      return {
        sessionId: verification.id,
        sessionUrl: verification.url,
        status: verification.status || 'created',
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const providerMessage = error.response?.data?.message;
      const fallback = error.message || 'Failed to create Veriff liveness session';
      throw new Error(statusCode ? `Veriff session creation failed (${statusCode}): ${providerMessage || fallback}` : fallback);
    }
  }
}