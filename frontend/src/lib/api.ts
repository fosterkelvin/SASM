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

// Application management
export const createApplication = async (applicationData: any) => {
  const response = await API.post("/applications", applicationData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getUserApplications = async () => {
  const response = await API.get("/applications/my-applications");
  return response.data;
};

export const getApplicationById = async (id: string) => {
  const response = await API.get(`/applications/my-applications/${id}`);
  return response.data;
};

export const getAllApplications = async (params?: {
  status?: string;
  position?: string;
  page?: number;
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append("status", params.status);
  if (params?.position) searchParams.append("position", params.position);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const response = await API.get(
    `/applications/all?${searchParams.toString()}`
  );
  return response.data;
};

export const updateApplicationStatus = async (
  id: string,
  data: {
    status: string;
    hrComments?: string;
  }
) => {
  const response = await API.put(`/applications/${id}/status`, data);
  return response.data;
};

export const deleteApplication = async (id: string) => {
  const response = await API.delete(`/applications/${id}`);
  return response.data;
};

export const getApplicationStats = async () => {
  const response = await API.get("/applications/stats");
  return response.data;
};

// Notification API
export const getUserNotifications = async (params?: {
  isRead?: boolean;
  limit?: number;
  skip?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.isRead !== undefined)
    searchParams.append("isRead", params.isRead.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.skip) searchParams.append("skip", params.skip.toString());

  const response = await API.get(`/notifications?${searchParams.toString()}`);
  return response.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await API.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await API.put("/notifications/mark-all-read");
  return response.data;
};

export const deleteNotification = async (id: string) => {
  const response = await API.delete(`/notifications/${id}`);
  return response.data;
};

export const deleteMultipleNotifications = async (
  notificationIDs: string[]
) => {
  const response = await API.delete("/notifications/bulk", {
    data: { notificationIDs },
  });
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await API.get("/notifications/unread-count");
  return response.data;
};
