import "server-only";
import {
  hrmUsersService,
} from "@/lib/hrm/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import type { Job, Candidate, Application, Interview, Offer } from "@/types";

// ══════════════════════════════════════════════════════════════════
// Recruitment Module Service
// ══════════════════════════════════════════════════════════════════

const JOBS_COLLECTION = "jobs";
const CANDIDATES_COLLECTION = "candidates";
const APPLICATIONS_COLLECTION = "applications";
const INTERVIEWS_COLLECTION = "interviews";
const OFFERS_COLLECTION = "offers";

function db() {
  return getAdminDb();
}

// ── Jobs ───────────────────────────────────────────────

export async function getJobs(tenantId: string): Promise<Job[]> {
  const snap = await db()
    .collection(JOBS_COLLECTION)
    .where("tenantId", "==", tenantId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
}

export async function getJobById(id: string): Promise<Job | null> {
  const snap = await db().collection(JOBS_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as Job;
}

export async function createJob(tenantId: string, data: Partial<Job>): Promise<Job> {
  const docRef = db().collection(JOBS_COLLECTION).doc();
  const now = new Date();
  const job: Job = {
    id: docRef.id,
    tenantId,
    title: data.title || "",
    department: data.department || "",
    location: data.location || "",
    type: data.type || "full-time",
    status: data.status || "draft",
    description: data.description || "",
    requirements: data.requirements || "",
    applicants: 0,
    interviews: 0,
    offers: 0,
    createdById: data.createdById,
    createdAt: now,
    updatedAt: now,
  };
  await docRef.set(job);
  return job;
}

export async function updateJob(id: string, data: Partial<Job>): Promise<Job | null> {
  const docRef = db().collection(JOBS_COLLECTION).doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return null;
  const updateData = { ...data, updatedAt: new Date() };
  await docRef.update(updateData);
  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() } as Job;
}

export async function deleteJob(id: string): Promise<boolean> {
  const docRef = db().collection(JOBS_COLLECTION).doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return false;
  await docRef.delete();
  return true;
}

export async function getJobsDashboard(tenantId: string): Promise<{
  totalJobs: number;
  openPositions: number;
  totalCandidates: number;
  interviewsScheduled: number;
  offersExtended: number;
}> {
  const jobs = await getJobs(tenantId);
  const candidatesSnap = await db()
    .collection(CANDIDATES_COLLECTION)
    .where("tenantId", "==", tenantId)
    .get();
  const totalCandidates = candidatesSnap.size;

  return {
    totalJobs: jobs.length,
    openPositions: jobs.filter((j) => j.status === "open").length,
    totalCandidates,
    interviewsScheduled: jobs.reduce((sum, j) => sum + (j.interviews || 0), 0),
    offersExtended: jobs.reduce((sum, j) => sum + (j.offers || 0), 0),
  };
}

// ── Candidates ─────────────────────────────────────────

export async function getCandidates(tenantId: string): Promise<Candidate[]> {
  const snap = await db()
    .collection(CANDIDATES_COLLECTION)
    .where("tenantId", "==", tenantId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Candidate));
}

export async function createCandidate(tenantId: string, data: Partial<Candidate>): Promise<Candidate> {
  const docRef = db().collection(CANDIDATES_COLLECTION).doc();
  const now = new Date();
  const candidate: Candidate = {
    id: docRef.id,
    tenantId,
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    position: data.position || "",
    jobId: data.jobId || "",
    location: data.location || "",
    status: "new",
    appliedDate: now,
    createdAt: now,
    updatedAt: now,
  };
  await docRef.set(candidate);

  // Update job applicant count
  if (data.jobId) {
    const jobRef = db().collection(JOBS_COLLECTION).doc(data.jobId);
    const jobSnap = await jobRef.get();
    if (jobSnap.exists) {
      const current = (jobSnap.data()?.applicants || 0) + 1;
      await jobRef.update({ applicants: current, updatedAt: now });
    }
  }

  return candidate;
}

// ── Applications ───────────────────────────────────────

export async function getApplications(tenantId: string): Promise<Application[]> {
  const snap = await db()
    .collection(APPLICATIONS_COLLECTION)
    .where("tenantId", "==", tenantId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Application));
}
