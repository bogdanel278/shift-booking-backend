export type TabParamList = {
  Home: undefined;
  Search: undefined;
  MyJobs: undefined;
  Pay: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  WorkerDashboard: undefined;
  ShiftList: undefined;
  ShiftDetails: { shiftId: number };
  MyBookings: undefined;
  RightToWorkStatus: undefined;
  EditAccount: undefined;
  IdDocumentDetails: {
    idType: string;
    isCompleted: boolean;
    isLocked: boolean;
    status?: 'pending' | 'approved' | 'rejected' | 'failed' | null;
  };
  RtwMethodDetails: {
    method: string;
    isCompleted: boolean;
    isLocked: boolean;
  };
  DocumentVerification: {
    title: string;
    fields: Array<{ label: string; value: string }>;
    verificationMethod: 'passport' | 'visa' | 'share_code';
  };
  LivenessVerification: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};