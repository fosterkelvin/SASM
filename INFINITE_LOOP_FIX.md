# Infinite Loop Fix - Certificate Upload

## Problem

When clicking "Submit Requirements Now" button, the application crashed with:

```
Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```

The error was pointing to `useCertificatesUpload.ts:34`.

## Root Cause

In `Application.tsx`, there was a `useEffect` hook that had `clearCertificates` in its dependency array:

```typescript
useEffect(() => {
  if (submitSuccess) {
    clearCertificates();
  }
}, [submitSuccess, clearCertificates]); // ❌ clearCertificates recreated every render
```

The `clearCertificates` function in `useCertificatesUpload` hook was defined as a regular function, which meant it was recreated on every render. This caused the `useEffect` to run on every render, which triggered state updates, causing infinite re-renders.

## Solution

Wrapped all callback functions in `useCallback` hook to ensure they maintain the same reference across renders:

### Fixed Files

#### 1. `useCertificatesUpload.ts`

```typescript
import { useState, useCallback } from "react"; // ✅ Added useCallback

export default function useCertificatesUpload() {
  const [uploadedCertificates, setUploadedCertificates] =
    useState<UploadedCertificates>({ certificates: [] });
  const [certificatePreviewUrls, setCertificatePreviewUrls] =
    useState<CertificatePreviewUrls>({ certificates: [] });

  // ✅ Wrapped in useCallback with empty dependency array
  const clearCertificates = useCallback(() => {
    setCertificatePreviewUrls((prev) => {
      prev.certificates.forEach((item) => {
        if (item && item.url) {
          try {
            URL.revokeObjectURL(item.url);
          } catch (e) {
            // ignore
          }
        }
      });
      return { certificates: [] };
    });
    setUploadedCertificates({ certificates: [] });
  }, []);

  // ✅ Also wrapped other callbacks
  const handleCertificatesUpload = useCallback((files: FileList) => {
    // ... upload logic
  }, []);

  const removeCertificate = useCallback((index: number) => {
    // ... remove logic
  }, []);

  return {
    uploadedCertificates,
    certificatePreviewUrls,
    handleCertificatesUpload,
    removeCertificate,
    clearCertificates,
  };
}
```

#### 2. `useFileUpload.ts`

Also fixed the same pattern in the file upload hook:

```typescript
import { useState, useCallback } from "react"; // ✅ Added useCallback

export default function useFileUpload() {
  // ... state declarations

  // ✅ Wrapped in useCallback
  const handleFileUpload = useCallback((files: FileList | null) => {
    // ... upload logic
  }, []);

  // ✅ Wrapped in useCallback
  const removeFile = useCallback(() => {
    setFilePreviewUrls((prev) => {
      if (prev.profilePhoto) {
        try {
          URL.revokeObjectURL(prev.profilePhoto);
        } catch (e) {
          // ignore
        }
      }
      return { ...prev, profilePhoto: "" };
    });
    setUploadedFiles((prev) => ({ ...prev, profilePhoto: null }));
  }, []);

  return {
    uploadedFiles,
    filePreviewUrls,
    handleFileUpload,
    removeFile,
    setUploadedFiles,
    setFilePreviewUrls,
  };
}
```

## Key Changes

### Before (❌ Caused Infinite Loop)

```typescript
const clearCertificates = () => {
  // function body
};
```

- Function recreated on every render
- New reference on every render
- `useEffect` with this function in dependencies runs infinitely

### After (✅ Fixed)

```typescript
const clearCertificates = useCallback(() => {
  // function body
}, []);
```

- Function reference stays the same across renders
- `useEffect` only runs when `submitSuccess` changes
- No infinite loop

## Why useCallback?

`useCallback` is a React hook that memoizes function references. It returns the same function reference across renders unless dependencies change. This is crucial when:

1. Functions are passed to `useEffect` dependency arrays
2. Functions are passed as props to child components (prevents unnecessary re-renders)
3. Functions are used in other hooks' dependency arrays

## Benefits

✅ **Prevents infinite loops** - Functions maintain stable references  
✅ **Performance improvement** - Child components don't re-render unnecessarily  
✅ **Cleaner code** - Proper React patterns followed  
✅ **Memory management** - Object URLs properly revoked using functional state updates

## Testing

After the fix:

1. ✅ Frontend compiles without errors
2. ✅ No infinite loop warnings in console
3. ✅ "Submit Requirements Now" button should work without crashes
4. ✅ Certificate uploads should work normally

## Additional Improvements Made

- Used functional state updates (`setState((prev) => ...)`) when revoking URLs
- This ensures we're accessing the latest state even in callbacks
- Prevents stale closure issues

## Related Files

- `frontend/src/pages/Roles/Student/Apply/Application.tsx` - Uses the hooks
- `frontend/src/pages/Roles/Student/Apply/hooks/useCertificatesUpload.ts` - Fixed
- `frontend/src/pages/Roles/Student/Apply/hooks/useFileUpload.ts` - Fixed
