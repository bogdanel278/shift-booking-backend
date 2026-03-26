import api from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: 'worker' | 'business';
  company_name?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'worker' | 'business' | 'admin';
  name?: string;
  first_name?: string;
  last_name?: string;
  is_verified?: boolean;
  profile_picture_url?: string | null;
  has_bank_account?: boolean;
  rtw_verified?: boolean;
  min_payrate?: number | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post('/api/auth/login', payload);
    return res.data.data as AuthResponse;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post('/api/auth/register', payload);
    return res.data.data as AuthResponse;
  },

  me: async (): Promise<AuthUser> => {
    const res = await api.get('/api/auth/me');
    return res.data.data as AuthUser;
  },

  updateProfilePicture: async (profilePictureUrl: string): Promise<AuthUser> => {
    const res = await api.patch('/api/auth/profile-picture', { profile_picture_url: profilePictureUrl });
    return res.data.data as AuthUser;
  },
};
