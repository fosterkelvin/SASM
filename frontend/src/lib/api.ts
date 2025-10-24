export const markMultipleNotificationsAsRead = async (
  notificationIDs: string[]
) => {
  const response = await API.put("/notifications/bulk-read", {
    notificationIDs,
  });
  return response.data;
};
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
  // Do not set the Content-Type header manually for multipart/form-data.
  // Let the browser/axios set the correct boundary automatically.
  const response = await API.post("/applications", applicationData);
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
  assignedTo?: string;
  priority?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append("status", params.status);
  if (params?.position) searchParams.append("position", params.position);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.assignedTo) searchParams.append("assignedTo", params.assignedTo);
  if (params?.priority) searchParams.append("priority", params.priority);
  if (params?.minRating !== undefined)
    searchParams.append("minRating", params.minRating.toString());
  if (params?.maxRating !== undefined)
    searchParams.append("maxRating", params.maxRating.toString());
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);
  if (params?.search) searchParams.append("search", params.search);

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

export const withdrawApplication = async (id: string) => {
  const response = await API.put(`/applications/${id}/withdraw`);
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

// New HR Application Management APIs
export const assignApplication = async (
  id: string,
  assignedTo: string | null
) => {
  const response = await API.put(`/applications/${id}/assign`, { assignedTo });
  return response.data;
};

export const rateApplication = async (
  id: string,
  rating: number,
  ratingNotes?: string
) => {
  const response = await API.put(`/applications/${id}/rate`, {
    rating,
    ratingNotes,
  });
  return response.data;
};

export const addApplicationNote = async (id: string, notes: string) => {
  const response = await API.post(`/applications/${id}/notes`, { notes });
  return response.data;
};

export const updateApplicationPriority = async (
  id: string,
  priority: string
) => {
  const response = await API.put(`/applications/${id}/priority`, { priority });
  return response.data;
};

export const bulkUpdateApplications = async (
  applicationIds: string[],
  action: string,
  data: any
) => {
  const response = await API.post("/applications/bulk-update", {
    applicationIds,
    action,
    data,
  });
  return response.data;
};

// Get all HR staff for assignment dropdown
export const getHRStaff = async () => {
  const response = await API.get("/users?role=hr,office");
  return response.data;
};

// Get all office users for trainee deployment dropdown
export const getOfficeUsers = async () => {
  const response = await API.get("/users?role=office");
  return response.data;
};

// ===== NEW WORKFLOW APIs =====

// Psychometric Test Workflow
export const schedulePsychometricTest = async (
  applicationId: string,
  data: {
    psychometricTestDate: string;
    psychometricTestTime: string;
    psychometricTestLocation?: string;
    psychometricTestLink?: string;
    psychometricTestNotes?: string;
  }
) => {
  const response = await API.post(
    `/workflow/applications/${applicationId}/psychometric/schedule`,
    data
  );
  return response.data;
};

export const submitPsychometricTestScore = async (
  applicationId: string,
  data: {
    psychometricTestScore: number;
    psychometricTestPassed: boolean;
    psychometricTestNotes?: string;
  }
) => {
  const response = await API.post(
    `/workflow/applications/${applicationId}/psychometric/score`,
    data
  );
  return response.data;
};

// Interview Workflow
export const scheduleInterview = async (
  applicationId: string,
  data: {
    interviewDate: string;
    interviewTime: string;
    interviewLocation?: string;
    interviewMode: "in-person" | "virtual" | "phone";
    interviewLink?: string;
    interviewNotes?: string;
  }
) => {
  const response = await API.post(
    `/workflow/applications/${applicationId}/interview/schedule`,
    data
  );
  return response.data;
};

export const submitInterviewResult = async (
  applicationId: string,
  data: {
    interviewScore: number;
    interviewPassed: boolean;
    interviewNotes?: string;
  }
) => {
  const response = await API.post(
    `/workflow/applications/${applicationId}/interview/result`,
    data
  );
  return response.data;
};

// Trainee Workflow
export const setAsTrainee = async (
  applicationId: string,
  data: {
    traineeStartDate: string;
    requiredHours: number;
    traineeOffice?: string;
    traineeSupervisor?: string;
    traineeNotes?: string;
  }
) => {
  const response = await API.post(
    `/workflow/applications/${applicationId}/trainee/set`,
    data
  );
  return response.data;
};

export const updateTraineeHours = async (
  applicationId: string,
  data: {
    completedHours: number;
    traineeNotes?: string;
  }
) => {
  const response = await API.put(
    `/workflow/applications/${applicationId}/trainee/hours`,
    data
  );
  return response.data;
};

// ===== TRAINEE DEPLOYMENT & MANAGEMENT APIs =====

// Get all trainees (HR only)
export const getAllTrainees = async (params?: {
  office?: string;
  status?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.office) searchParams.append("office", params.office);
  if (params?.status) searchParams.append("status", params.status);

  const response = await API.get(`/trainees/all?${searchParams.toString()}`);
  return response.data;
};

// Get trainees for specific office (Office staff and HR)
export const getOfficeTrainees = async (params?: { office?: string }) => {
  const searchParams = new URLSearchParams();
  if (params?.office) searchParams.append("office", params.office);

  const response = await API.get(`/trainees/office?${searchParams.toString()}`);
  return response.data;
};

// Deploy trainee to office (HR only)
export const deployTrainee = async (
  applicationId: string,
  data: {
    traineeOffice: string;
    traineeSupervisor?: string;
    traineeStartDate: string;
    traineeEndDate?: string;
    requiredHours: number;
    traineeNotes?: string;
  }
) => {
  const response = await API.post(`/trainees/${applicationId}/deploy`, data);
  return response.data;
};

// Update trainee deployment (HR only)
export const updateTraineeDeployment = async (
  applicationId: string,
  data: {
    traineeOffice?: string;
    traineeSupervisor?: string;
    traineeStartDate?: string;
    traineeEndDate?: string;
    requiredHours?: number;
    completedHours?: number;
    traineeNotes?: string;
    traineePerformanceRating?: number;
  }
) => {
  const response = await API.put(`/trainees/${applicationId}/deployment`, data);
  return response.data;
};

// Update trainee hours (Office staff)
export const updateTraineeHoursOffice = async (
  applicationId: string,
  data: {
    completedHours: number;
    notes?: string;
  }
) => {
  const response = await API.put(`/trainees/${applicationId}/hours`, data);
  return response.data;
};

// Get student's own trainee deployment info
export const getMyTraineeDeployment = async () => {
  const response = await API.get("/trainees/my-deployment");
  return response.data;
};

// Schedule deployment interview (Office staff)
export const scheduleDeploymentInterview = async (
  applicationId: string,
  data: {
    deploymentInterviewDate: string;
    deploymentInterviewTime: string;
    deploymentInterviewLocation?: string;
    deploymentInterviewMode: "in-person" | "virtual" | "phone";
    deploymentInterviewLink?: string;
    deploymentInterviewNotes?: string;
  }
) => {
  const response = await API.post(
    `/trainees/${applicationId}/deployment/interview/schedule`,
    data
  );
  return response.data;
};

// Accept deployment (Office staff)
export const acceptDeployment = async (
  applicationId: string,
  data?: {
    notes?: string;
  }
) => {
  const response = await API.post(
    `/trainees/${applicationId}/deployment/accept`,
    data || {}
  );
  return response.data;
};

// Reject deployment (Office staff)
export const rejectDeployment = async (
  applicationId: string,
  data: {
    rejectionReason: string;
  }
) => {
  const response = await API.post(
    `/trainees/${applicationId}/deployment/reject`,
    data
  );
  return response.data;
};

// Upload class schedule (Student only)
export const uploadClassSchedule = async (
  file: File,
  scheduleData?: Array<{
    section: string;
    subjectCode: string;
    subjectName: string;
    instructor: string;
    schedule: string;
    units: number;
  }>
) => {
  const formData = new FormData();
  formData.append("schedule", file);

  if (scheduleData) {
    formData.append("scheduleData", JSON.stringify(scheduleData));
  }

  const response = await API.post("/trainees/schedule/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Get class schedule (Student, Office, HR)
export const getClassSchedule = async (applicationId?: string) => {
  const url = applicationId
    ? `/trainees/${applicationId}/schedule`
    : "/trainees/schedule";
  const response = await API.get(url);
  return response.data;
};

// Get class schedule file URL (Student, Office, HR)
export const getClassScheduleFileUrl = (applicationId?: string) => {
  const baseURL = API.defaults.baseURL || "";
  const url = applicationId
    ? `/trainees/${applicationId}/schedule/download`
    : "/trainees/schedule/download";
  return `${baseURL}${url}`;
};

// Final Actions
export const acceptApplication = async (
  applicationId: string,
  data: {
    traineePerformanceRating?: number;
    hrComments?: string;
  }
) => {
  const response = await API.post(
    `/workflow/applications/${applicationId}/accept`,
    data
  );
  return response.data;
};

export const rejectApplication = async (
  applicationId: string,
  data: {
    rejectionReason: string;
  }
) => {
  const response = await API.post(
    `/workflow/applications/${applicationId}/reject`,
    data
  );
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

// UserData API
export const getUserData = async () => {
  const response = await API.get("/userdata");
  return response.data;
};

export const upsertUserData = async (data: {
  gender?: string;
  birthdate?: string;
  civilStatus?: string;
  phoneNumber?: string;
  address?: string;
}) => {
  const response = await API.post("/userdata", data);
  return response.data;
};

export const deleteUserData = async () => {
  const response = await API.delete("/userdata");
  return response.data;
};

// Netflix-Style Profile Management APIs
export const getProfiles = async () => {
  const response = await API.get("/office/profiles");
  return response.data;
};

export const createProfile = async (data: {
  profileName: string;
  profilePIN: string;
  permissions?: any;
}) => {
  const response = await API.post("/office/profiles", data);
  return response.data;
};

export const selectProfile = async (data: {
  profileID: string;
  profilePIN: string;
}) => {
  const response = await API.post("/office/profiles/select", data);
  return response.data;
};

export const updateProfile = async (
  profileID: string,
  updates: {
    profileName?: string;
    profilePIN?: string;
    permissions?: any;
    isActive?: boolean;
    avatar?: string;
  }
) => {
  const response = await API.patch(`/office/profiles/${profileID}`, updates);
  return response.data;
};

export const deleteProfile = async (profileID: string) => {
  const response = await API.delete(`/office/profiles/${profileID}`);
  return response.data;
};

export const resetProfilePIN = async (data: {
  profileID: string;
  accountPassword: string;
  newPIN: string;
}) => {
  const response = await API.post("/office/profiles/reset-pin", data);
  return response.data;
};

// Audit Log APIs
export const getAuditLogs = async (params?: {
  profileID?: string;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  skip?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.profileID) searchParams.append("profileID", params.profileID);
  if (params?.module) searchParams.append("module", params.module);
  if (params?.action) searchParams.append("action", params.action);
  if (params?.startDate) searchParams.append("startDate", params.startDate);
  if (params?.endDate) searchParams.append("endDate", params.endDate);
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.skip) searchParams.append("skip", params.skip.toString());

  const response = await API.get(
    `/office/audit-logs?${searchParams.toString()}`
  );
  return response.data;
};
