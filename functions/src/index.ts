import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

async function requireAdmin(uid: string) {
  const snap = await db.doc(`users/${uid}`).get();
  if (!snap.exists) throw new HttpsError("permission-denied", "Admin profile not found.");

  const data = snap.data() as any;
  if (data.role !== "admin") throw new HttpsError("permission-denied", "Admins only.");
  if (!data.companyId) throw new HttpsError("failed-precondition", "Admin companyId missing.");

  return {companyId: String(data.companyId)};
}

// ✅ create worker (Auth + Firestore)
export const createWorker = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError("unauthenticated", "Login required.");

  const adminUid = auth.uid;
  const adminProfile = await requireAdmin(adminUid);

  const name = String((request.data as any)?.name || "").trim();
  const email = String((request.data as any)?.email || "").trim().toLowerCase();
  const tempPassword = String((request.data as any)?.tempPassword || "").trim();

  if (!name || !email || !tempPassword) {
    throw new HttpsError("invalid-argument", "name, email, tempPassword are required.");
  }
  if (tempPassword.length < 6) {
    throw new HttpsError("invalid-argument", "tempPassword must be at least 6 characters.");
  }

  const userRecord = await admin.auth().createUser({
    email,
    password: tempPassword,
    displayName: name,
    disabled: false,
  });

  const workerUid = userRecord.uid;

  await db.doc(`users/${workerUid}`).set({
    uid: workerUid,
    name,
    email,
    role: "worker",
    companyId: adminProfile.companyId,
    createdBy: adminUid,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {workerUid};
});

// ✅ delete worker (Firestore + Auth)
export const deleteWorker = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError("unauthenticated", "Login required.");

  const adminUid = auth.uid;
  const adminProfile = await requireAdmin(adminUid);

  const workerUid = String((request.data as any)?.workerUid || "").trim();
  if (!workerUid) throw new HttpsError("invalid-argument", "workerUid is required.");

  const workerSnap = await db.doc(`users/${workerUid}`).get();
  if (!workerSnap.exists) throw new HttpsError("not-found", "Worker not found.");

  const worker = workerSnap.data() as any;
  if (worker.role !== "worker") {
    throw new HttpsError("failed-precondition", "Target user is not a worker.");
  }
  if (String(worker.companyId) !== adminProfile.companyId) {
    throw new HttpsError("permission-denied", "Not your worker.");
  }

  await db.doc(`users/${workerUid}`).delete();
  await admin.auth().deleteUser(workerUid);

  return {ok: true};
});
