export interface Shift {
  in?: string;
  out?: string;
}

export interface Entry {
  id: number;
  day?: number; // Backend field (same as id)
  // Legacy fields (kept for backward compatibility)
  in1?: string;
  out1?: string;
  in2?: string;
  out2?: string;
  in3?: string;
  out3?: string;
  in4?: string;
  out4?: string;
  // NEW: Dynamic shifts array
  shifts?: Shift[];
  status?: string;
  totalHours?: number;
  late?: number;
  undertime?: number;
  confirmationStatus?: "unconfirmed" | "confirmed";
  confirmedBy?: string;
  confirmedAt?: string;
}

export const defaultStatusOptions = ["Present", "Absent", "Late", "On Leave"];
