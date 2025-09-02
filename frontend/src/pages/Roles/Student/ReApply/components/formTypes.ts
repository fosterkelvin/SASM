export type FormData = {
  name: string;
  idNumber: string;
  schoolDept: string;
  courseYear: string;
  effectivityDate: string;
  yearsInService: string;
  term: "first" | "second" | "short";
  academicYear: string;
  reasons: string;
  signatureName: string;
  signatureDate: string;
};

export const defaultData: FormData = {
  name: "",
  idNumber: "",
  schoolDept: "",
  courseYear: "",
  effectivityDate: "",
  yearsInService: "",
  term: "first",
  academicYear: "",
  reasons: "",
  signatureName: "",
  signatureDate: "",
};
