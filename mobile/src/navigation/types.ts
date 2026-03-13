export type AppStackParamList = {
  WorkerDashboard: undefined;
  ShiftList: undefined;
  ShiftDetails: { shiftId: number };
  MyBookings: undefined;
  RightToWorkStatus: undefined;
  IdDocumentDetails: {
    idType: string;
    isCompleted: boolean;
    isLocked: boolean;
  };
  RtwMethodDetails: {
    method: string;
    isCompleted: boolean;
    isLocked: boolean;
  };
  DocumentVerification: {
    title: string;
    fields: Array<{ label: string; value: string }>;
  };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};