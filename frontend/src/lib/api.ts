import API from "@/config/apiClient";

export const signin = async (data: any) => API.post("/auth/signin", data);
export const signout = async () => {
  const res = await API.get("/auth/signout");
  console.log("API response: ", res);
  return res;
};
export const signup = async (data: any) => API.post("/auth/signup", data);
export const getUser = async () => API.get("/user");
export const verifyEmail = async (verificationCode: string) =>
  API.get(`/auth/email/verify/${verificationCode}`);
export const sendPasswordResetEmail = async (data: { email: string }) =>
  API.post("/auth/password/forgot", data);
