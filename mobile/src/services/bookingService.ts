import api from './api';

export interface Booking {
  id: number;
  status: string;
  created_at: string;
  shift?: {
    id: number;
    title: string;
    location: string;
    start_time: string;
    end_time: string;
    pay_rate: number;
  };
}

export const bookingService = {
  myBookings: async (): Promise<Booking[]> => {
    const res = await api.get('/api/bookings/my-bookings');
    return res.data.data as Booking[];
  },

  book: async (shiftId: number): Promise<Booking> => {
    const res = await api.post('/api/bookings', { shift_id: shiftId });
    return res.data.data as Booking;
  },

  cancel: async (id: number): Promise<void> => {
    await api.delete(`/api/bookings/${id}`);
  },
};
