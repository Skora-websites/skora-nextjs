import "server-only";
import { getAdminDb } from "./firebase-admin";
import type { DocumentData, Timestamp } from "firebase-admin/firestore";

// ── Collection Names ───────────────────────────────────

const COLLECTIONS = {
  users: "users",
  leads: "leads",
  customers: "customers",
  deals: "deals",
  contacts: "contacts",
  activities: "activities",
  tasks: "tasks",
  accounts: "accounts",
  sessions: "sessions",
  verificationTokens: "verification_tokens",
} as const;

// ── Type Helpers ────────────────────────────────────────

/**
 * Converts Firestore Timestamps to native Date objects
 * recursively on a document snapshot.
 */
function serializeDoc<T extends DocumentData>(id: string, data: DocumentData): T {
  const out: Record<string, unknown> = { id };
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && "toDate" in value) {
      out[key] = (value as Timestamp).toDate();
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

// ── Generic CRUD Operations ─────────────────────────────

export type WhereFilterOp = FirebaseFirestore.WhereFilterOp;
export type OrderByDirection = FirebaseFirestore.OrderByDirection;

export type WhereClause = {
  field: string;
  op: WhereFilterOp;
  value: unknown;
};

export type QueryOptions = {
  where?: WhereClause[];
  orderByField?: string;
  orderByDirection?: OrderByDirection;
  limitCount?: number;
};

export function createFirestoreService<T extends { id?: string }>(collectionName: string) {
  // Lazily initialize the collection reference to avoid crashes at module import time
  // when Firebase Admin SDK is not yet configured (e.g., missing .env).
  let _collRef: FirebaseFirestore.CollectionReference | null = null;

  function coll() {
    if (!_collRef) {
      _collRef = getAdminDb().collection(collectionName);
    }
    return _collRef;
  }

  return {
    /** Find a document by ID */
    async findById(id: string): Promise<T | null> {
      const snap = await coll().doc(id).get();
      if (!snap.exists) return null;
      return serializeDoc<T>(snap.id, snap.data()!);
    },

    /** Find all documents, optionally filtered/sorted */
    async findMany(options: QueryOptions = {}): Promise<T[]> {
      let query: FirebaseFirestore.Query = coll();

      if (options.where) {
        for (const clause of options.where) {
          query = query.where(clause.field, clause.op, clause.value);
        }
      }

      if (options.orderByField) {
        query = query.orderBy(options.orderByField, options.orderByDirection ?? "asc");
      }

      if (options.limitCount) {
        query = query.limit(options.limitCount);
      }

      // M10: fail loud on missing composite indexes. The previous in-memory
      // sort fallback silently downgraded prod queries and hid index drift.
      // Use `firebase deploy --only firestore:indexes` after adding the index.
      const snap = await query.get();
      return snap.docs.map((d) => serializeDoc<T>(d.id, d.data()));
    },

    /** Find a single document by a field value */
    async findOne(field: string, value: unknown): Promise<T | null> {
      const q = coll().where(field, "==", value).limit(1);
      const snap = await q.get();
      if (snap.empty) return null;
      const doc = snap.docs[0];
      return serializeDoc<T>(doc.id, doc.data());
    },

    /** Create a document with an auto-generated ID */
    async create(data: Partial<T>): Promise<T> {
      const docRef = coll().doc();
      const now = new Date();
      const docData = {
        ...data,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      };
      await docRef.set(docData);
      return docData as unknown as T;
    },

    /** Create a document with a specific ID */
    async createWithId(id: string, data: Partial<T>): Promise<T> {
      const docRef = coll().doc(id);
      const now = new Date();
      const docData = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      await docRef.set(docData);
      return docData as unknown as T;
    },

    /** Update a document (partial update) */
    async update(id: string, data: Partial<T>): Promise<T | null> {
      const docRef = coll().doc(id);
      const snap = await docRef.get();
      if (!snap.exists) return null;

      const updateData = {
        ...data,
        updatedAt: new Date(),
      };
      await docRef.update(updateData);
      const updated = await docRef.get();
      return serializeDoc<T>(id, updated.data()!);
    },

    /** Delete a document */
    async delete(id: string): Promise<boolean> {
      const docRef = coll().doc(id);
      const snap = await docRef.get();
      if (!snap.exists) return false;
      await docRef.delete();
      return true;
    },

    /** Count documents with optional filters */
    async count(options: { where?: WhereClause[] } = {}): Promise<number> {
      let query: FirebaseFirestore.Query = coll();
      if (options.where) {
        for (const clause of options.where) {
          query = query.where(clause.field, clause.op, clause.value);
        }
      }
      const snap = await query.get();
      return snap.size;
    },
  };
}

// ── Specific Service Types ──────────────────────────────

export interface FirestoreUser {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  role: "super_admin" | "admin" | "employee" | "manager" | "agent";
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreAccount {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refreshToken?: string;
  accessToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
  sessionState?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreSession {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreLead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  source: "website" | "referral" | "linkedin" | "cold_call" | "email_campaign" | "event" | "partner" | "other";
  value: number;
  probability: number;
  notes?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreCustomer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  industry?: string;
  status: "active" | "inactive" | "vip";
  lifetimeValue: number;
  deals: number;
  ownerId: string;
  lastContact?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreDeal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  probability: number;
  notes?: string;
  ownerId: string;
  closeDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  position?: string;
  status: string;
  lastContact?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreActivity {
  id: string;
  type: "call" | "email" | "meeting" | "note" | "task" | "deal";
  title: string;
  description?: string;
  userId: string;
  relatedTo?: string;
  relatedType?: string;
  createdAt: Date;
}

export interface FirestoreTask {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  assigneeId: string;
  dueDate?: Date;
  relatedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreVerificationToken {
  id: string;
  identifier: string;
  token: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ── Exported Service Instances ──────────────────────────

export const usersService = createFirestoreService<FirestoreUser>(COLLECTIONS.users);
export const leadsService = createFirestoreService<FirestoreLead>(COLLECTIONS.leads);
export const customersService = createFirestoreService<FirestoreCustomer>(COLLECTIONS.customers);
export const dealsService = createFirestoreService<FirestoreDeal>(COLLECTIONS.deals);
export const contactsService = createFirestoreService<FirestoreContact>(COLLECTIONS.contacts);
export const activitiesService = createFirestoreService<FirestoreActivity>(COLLECTIONS.activities);
export const tasksService = createFirestoreService<FirestoreTask>(COLLECTIONS.tasks);
export const accountsService = createFirestoreService<FirestoreAccount>(COLLECTIONS.accounts);
export const sessionsService = createFirestoreService<FirestoreSession>(COLLECTIONS.sessions);
export const verificationTokensService = createFirestoreService<FirestoreVerificationToken>(
  COLLECTIONS.verificationTokens
);
