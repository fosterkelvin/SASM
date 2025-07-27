# File Upload Feature

## Overview

The application now supports file uploads for student applications, allowing students to submit supporting documents along with their scholarship applications.

## Supported File Types

- **Profile Photo**: Personal photo of the applicant
- **ID Document**: Government ID or School ID
- **Certificates**: Multiple certificates from seminars, trainings, awards, etc.

## File Specifications

- **Accepted formats**: JPG, PNG, GIF
- **Maximum file size**: 5MB per file
- **Maximum certificates**: 5 files
- **Storage location**: `/uploads` directory on the server

## Frontend Implementation

- Drag-and-drop file upload interface
- Image preview before submission
- File validation and error handling
- Responsive design for mobile and desktop

## Backend Implementation

- Multer middleware for handling multipart/form-data
- File storage in organized subdirectories:
  - `/uploads/profiles/` - Profile photos
  - `/uploads/ids/` - ID documents
  - `/uploads/certificates/` - Certificate files
- Unique filename generation to prevent conflicts
- File path storage in MongoDB

## API Endpoints

- `POST /applications` - Create application with file uploads
- `GET /uploads/:filename` - Serve uploaded files

## Usage Instructions

### For Students:

1. Navigate to the Application page
2. Fill out the application form
3. In the "Supporting Documents" section:
   - Upload a profile photo (optional but recommended)
   - Upload a government or school ID (optional)
   - Upload certificates from seminars/trainings (optional)
4. Submit the application

### For HR/Office Staff:

1. Navigate to Application Management
2. Click "Review" on any application
3. View uploaded documents in the modal
4. Update application status as needed

## Security Considerations

- Only image files are accepted
- File size limits prevent server overload
- Unique filenames prevent conflicts
- Files are served statically but could be protected with authentication in the future

## File Storage Structure

```
backend/
├── uploads/
│   ├── profiles/
│   │   └── profilePhoto-1234567890-john-doe.jpg
│   ├── ids/
│   │   └── idDocument-1234567890-id-card.jpg
│   └── certificates/
│       ├── certificates-1234567890-cert1.jpg
│       └── certificates-1234567890-cert2.jpg
```

## Environment Variables

- `VITE_API` - Frontend API base URL for file serving

## Dependencies Added

- `multer` - File upload handling
- `@types/multer` - TypeScript definitions
