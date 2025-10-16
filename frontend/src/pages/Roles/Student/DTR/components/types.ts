export interface Entry {
  id: number;
  day?: number; // Backend field (same as id)
  in1?: string;
  out1?: string;
  in2?: string;
  out2?: string;
  status?: string;
  totalHours?: number;
  late?: number;
  undertime?: number;
  confirmationStatus?: "unconfirmed" | "confirmed";
  confirmedBy?: string;
  confirmedAt?: string;
}

export const defaultStatusOptions = ["Present", "Absent", "Late", "On Leave"];
