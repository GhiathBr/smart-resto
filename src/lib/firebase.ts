import * as admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK
 * This module ensures Firebase Admin is initialized only once
 */

let firebaseApp: admin.app.App | null = null;

export function initializeFirebase(): admin.app.App {
  // Return existing instance if already initialized
  if (firebaseApp) {
    return firebaseApp;
  }

  // Validate required environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !privateKey || !clientEmail || !storageBucket) {
    throw new Error(
      'Missing required Firebase environment variables. Please check FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and FIREBASE_STORAGE_BUCKET in .env file.'
    );
  }

  // Initialize Firebase Admin with service account credentials
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
      clientEmail,
    }),
    storageBucket,
  });

  return firebaseApp;
}

/**
 * Get Firebase Admin instance
 * Initializes if not already initialized
 */
export function getFirebaseAdmin(): admin.app.App {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
}

/**
 * Get Firebase Storage bucket
 */
export function getStorageBucket(): admin.storage.Storage {
  const app = getFirebaseAdmin();
  return app.storage();
}
