export interface Entry {
  id: number;
  in1?: string;
  out1?: string;
  in2?: string;
  out2?: string;
  status?: string;
}

export const defaultStatusOptions = ["Present", "Absent", "Late", "On Leave"];
