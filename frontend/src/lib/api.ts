import API from "@/config/apiClient";

export const signin = async (data: any) => {
  const response = await API.post("/auth/signin", data);
  return response.data;
};
export const signout = async () => {
  const res = await API.get("/auth/signout");
  console.log("API response: ", res);
  return res;
};
export const signup = async (data: any) => {
  const response = await API.post("/auth/signup", data);
  return response.data;
};
export const getUser = async () => API.get("/user");
export const verifyEmail = async (verificationCode: string) => {
  const response = await API.get(`/auth/email/verify/${verificationCode}`);
  return response.data;
};
export const resendVerificationEmail = async (data: { email: string }) =>
  API.post("/auth/email/resend", data);
export const sendPasswordResetEmail = async (data: { email: string }) =>
  API.post("/auth/password/forgot", data);
export const resetPassword = async ({
  verificationCode,
  password,
}: {
  verificationCode: string;
  password: string;
}) => API.post("/auth/password/reset", { verificationCode, password });

export const changePassword = async ({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await API.post("/auth/password/change", {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const changeEmail = async ({ newEmail }: { newEmail: string }) => {
  console.log("API call: changeEmail with newEmail:", newEmail);
  try {
    const response = await API.post("/auth/email/change", {
      newEmail,
    });
    console.log("API response:", response);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const cancelEmailChange = async () => {
  const response = await API.delete("/auth/email/cancel");
  return response.data;
};

// Session management
export const getSessions = async () => API.get("/sessions");
export const deleteSession = async (sessionId: string) =>
  API.delete(`/sessions/${sessionId}`);
