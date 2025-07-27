# SASM Project Deployment Guide

## Quick Start for Testing

### Prerequisites

- Node.js (v18 or later)
- MongoDB (local installation or use the provided Atlas connection)
- Git

### 1. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 2. Environment Setup

The project already has environment files configured:

- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration

**Note**: The project is configured to use MongoDB Atlas. If you want to use a local MongoDB:

1. Install MongoDB locally
2. Update `MONGO_URI` in `backend/.env` to `mongodb://localhost:27017/sasm-db`

### 3. Development Deployment

#### Option A: Run Both Services Manually

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

#### Option B: Use the Deployment Script

```bash
# Run the deployment script (see deploy.ps1)
.\deploy.ps1
```

### 4. Access the Application

- Frontend: http://localhost:58019 (or the port shown by the serve command)
- Backend API: http://localhost:4004

**Note**: The frontend port may vary if 5173 is already in use. Check the terminal output for the exact URL.

### 5. Production Build

#### Backend

```bash
cd backend
npm run build
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## Project Structure

- **Backend**: Express.js API with TypeScript, MongoDB, JWT authentication
- **Frontend**: React with Vite, TypeScript, Tailwind CSS
- **Features**: User authentication, file uploads, notifications, multi-role dashboard

## Troubleshooting

1. **Port conflicts**: Change ports in environment files if needed
2. **MongoDB connection**: Ensure MongoDB is running or check Atlas connection
3. **CORS issues**: Verify `APP_ORIGIN` in backend/.env matches frontend URL
4. **Email features**: Update `RESEND_API_KEY` for email functionality

## Environment Variables

### Backend (.env)

- `MONGO_URI`: MongoDB connection string
- `PORT`: Backend server port (default: 4004)
- `APP_ORIGIN`: Frontend URL for CORS (default: http://localhost:5173)
- `JWT_SECRET` & `JWT_REFRESH_SECRET`: JWT signing secrets
- `EMAIL_SENDER` & `RESEND_API_KEY`: Email service configuration

### Frontend (.env)

- `VITE_API`: Backend API URL (default: http://localhost:4004)
