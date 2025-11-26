export type UserRow = {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role?: string;
  status?: string;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  office?: string;
  officeName?: string;
  maxProfiles?: number;
  // For display compatibility
  firstName?: string;
  lastName?: string;
};
