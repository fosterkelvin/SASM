# Updated API Configuration Guide

## Environment Variable Update

Your frontend code has been updated to use the standardized `VITE_API` environment variable instead of `VITE_API_URL`.

## Configuration Files Updated

### Frontend Environment Files

- `frontend/.env` - Updated to use `VITE_API=http://localhost:4004`
- `frontend/.env.example` - Updated to use `VITE_API=http://localhost:4004`

### API Client Configuration

- `frontend/src/config/apiClient.ts` - Now uses `import.meta.env.VITE_API`

### Image URLs in Components

- `frontend/src/pages/ApplicationManagement.tsx` - All image URLs updated to use `VITE_API`

## How It Works

### 1. Environment Variable

```bash
# In your .env file
VITE_API=http://localhost:4004
```

### 2. API Client Setup

```typescript
// In apiClient.ts
const options = {
  baseURL: import.meta.env.VITE_API,
  withCredentials: true,
};

const API = axios.create(options);
```

### 3. Making API Calls

```typescript
// Example API functions
export const signin = async (data: any) => {
  const response = await API.post("/auth/signin", data);
  return response.data;
};

// Example fetch equivalent
const API = import.meta.env.VITE_API;
const res = await fetch(`${API}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
```

### 4. File/Image URLs

```typescript
// For displaying uploaded files
const imageUrl = `${import.meta.env.VITE_API}/uploads/profiles/filename.jpg`;
```

## All API Calls Now Use

✅ **Consistent environment variable**: `VITE_API`  
✅ **Centralized API client**: All requests go through the configured axios instance  
✅ **Proper error handling**: Built-in error interceptors  
✅ **Cookie support**: Configured with `withCredentials: true`

## Benefits

1. **Consistency**: All API calls use the same base URL configuration
2. **Centralized**: Easy to change API endpoint by updating one environment variable
3. **Error Handling**: Unified error handling across all API requests
4. **Type Safety**: Better TypeScript support with centralized API client

Your frontend is now properly configured to use the `VITE_API` environment variable for all API communications!
