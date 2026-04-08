# Firebase Admin SDK Setup Guide

This guide explains how to set up Firebase Admin SDK for the Restaurant Ordering System.

## Prerequisites

1. A Firebase project (create one at https://console.firebase.google.com)
2. Firebase Storage enabled in your project

## Setup Steps

### 1. Generate Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Navigate to the "Service accounts" tab
6. Click "Generate new private key"
7. A JSON file will be downloaded

### 2. Configure Environment Variables

The downloaded JSON file contains the credentials you need. Extract the following values:

```json
{
  "project_id": "your-project-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
}
```

Add these to your `.env` file:

```env
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
```

**Important Notes:**
- The `FIREBASE_PRIVATE_KEY` should include the full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Replace actual newlines in the private key with `\n` (the code will handle converting them back)
- The `FIREBASE_STORAGE_BUCKET` is typically `your-project-id.appspot.com` or can be found in Firebase Console > Storage

### 3. Enable Firebase Storage

1. In Firebase Console, go to "Storage" in the left sidebar
2. Click "Get started"
3. Choose security rules (you can start with test mode and update later)
4. Select a Cloud Storage location
5. Click "Done"

### 4. Configure Storage Security Rules

For production, update your Storage security rules in Firebase Console > Storage > Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /menu-images/{imageId} {
      // Allow public read access to menu images
      allow read: if true;
      
      // Allow write access only to authenticated admin users
      // (You'll need to implement Firebase Auth for this)
      allow write: if request.auth != null && request.auth.token.role == 'ADMIN';
    }
  }
}
```

For development, you can use more permissive rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## Testing the Setup

Run the Firebase initialization tests:

```bash
npm test src/lib/firebase.test.ts
```

## Usage

The Firebase Admin SDK is initialized automatically when you use the storage service:

```typescript
import { uploadFile } from '@/services/storage.service';

// Upload a file
const result = await uploadFile(fileBuffer, 'image.jpg', 'image/jpeg');
console.log('File uploaded:', result.url);
```

## Troubleshooting

### Error: "Missing required Firebase environment variables"

Make sure all four Firebase environment variables are set in your `.env` file:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_STORAGE_BUCKET`

### Error: "Failed to upload file to storage"

1. Verify Firebase Storage is enabled in your project
2. Check that the storage bucket name is correct
3. Verify your service account has the necessary permissions
4. Check Firebase Console > Storage for any error messages

### Private Key Format Issues

If you get authentication errors, ensure:
- The private key includes the BEGIN and END markers
- Newlines are escaped as `\n` in the .env file
- There are no extra spaces or quotes around the key

## Security Best Practices

1. **Never commit** the `.env` file or service account JSON to version control
2. Use different Firebase projects for development and production
3. Implement proper Storage security rules before going to production
4. Rotate service account keys periodically
5. Use Firebase Auth to verify user roles before allowing uploads
