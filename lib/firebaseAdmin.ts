import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

// Inicialización perezosa del Admin SDK. Si las credenciales no están
// configuradas, devuelve null y las notificaciones simplemente se omiten
// (no rompe el cambio de estado del reporte).
let cachedApp: App | null = null;
let tried = false;

function getAdminApp(): App | null {
  if (cachedApp) return cachedApp;
  if (tried) return null;
  tried = true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "[firebaseAdmin] Falta FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY. Notificaciones deshabilitadas."
    );
    return null;
  }

  // En Vercel/.env la clave privada suele venir con saltos de línea escapados (\n).
  privateKey = privateKey.replace(/\\n/g, "\n");

  try {
    cachedApp =
      getApps()[0] ??
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    return cachedApp;
  } catch (e) {
    console.error("[firebaseAdmin] Error inicializando Admin SDK:", e);
    return null;
  }
}

export function getFirestoreAdmin(): Firestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}

export function getMessagingAdmin(): Messaging | null {
  const app = getAdminApp();
  return app ? getMessaging(app) : null;
}
