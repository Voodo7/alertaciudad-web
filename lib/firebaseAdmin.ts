import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Inicialización perezosa del Admin SDK. Si las credenciales no están
// configuradas, devuelve null y las notificaciones simplemente se omiten
// (no rompe el cambio de estado del reporte).
let cached: Firestore | null = null;
let tried = false;

export function getFirestoreAdmin(): Firestore | null {
  if (cached) return cached;
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
    const app: App =
      getApps()[0] ??
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    cached = getFirestore(app);
    return cached;
  } catch (e) {
    console.error("[firebaseAdmin] Error inicializando Admin SDK:", e);
    return null;
  }
}
