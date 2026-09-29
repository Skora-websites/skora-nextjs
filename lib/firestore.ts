// CRM service layer backed by MongoDB.
// Kept for CRM imports (leads, customers, deals, etc.)

import "server-only";
import { getDb } from "@/lib/db/mongo-helper";
import { ObjectId, type Filter, type Sort, type Document } from "mongodb";

/**
 * Minimal typed MongoDB service used by the CRM collections.
 * (Previously this delegated to @/lib/hrm/mongo, which was removed.)
 */
export function createMongoService<T extends { id?: string }>(collectionName: string) {
  async function col() {
    const db = await getDb();
    if (!db) throw new Error("MongoDB not connected");
    return db.collection(collectionName);
  }

  async function findOne(field: string, value: unknown): Promise<T | null> {
    const c = await col();
    const doc = await c.findOne({ [field]: value } as Filter<Document>);
    return doc ? (serializeId(doc) as T) : null;
  }

  return {
    async findById(id: string): Promise<T | null> {
      const c = await col();
      try {
        const doc = await c.findOne({ _id: new ObjectId(id) });
        return doc ? (serializeId(doc) as T) : null;
      } catch {
        const doc = await c.findOne({ id } as Filter<Document>);
        return doc ? (serializeId(doc) as T) : null;
      }
    },
    async findMany(options: { where?: Filter<Document>; orderByField?: string; orderByDirection?: "asc" | "desc"; limitCount?: number } = {}): Promise<T[]> {
      const c = await col();
      let q = c.find(options.where ?? {});
      q = q.sort((options.orderByField ? { [options.orderByField]: options.orderByDirection === "desc" ? -1 : 1 } : { createdAt: -1 }) as Sort);
      if (options.limitCount) q = q.limit(options.limitCount);
      const docs = await q.toArray();
      return docs.map((d) => serializeId(d) as T);
    },
    async create(data: Partial<T>): Promise<T> {
      const c = await col();
      const now = new Date();
      const doc = { ...data, createdAt: now, updatedAt: now } as Document;
      const result = await c.insertOne(doc);
      return { ...doc, id: result.insertedId.toString() } as unknown as T;
    },
    async update(id: string, data: Partial<T>): Promise<T | null> {
      const c = await col();
      const updateRecord = { ...data, updatedAt: new Date() } as Record<string, unknown>;
      delete updateRecord.id;
      delete updateRecord._id;
      try {
        const r = await c.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateRecord }, { returnDocument: "after" });
        return r ? (serializeId(r) as T) : null;
      } catch {
        const r = await c.findOneAndUpdate({ id } as Filter<Document>, { $set: updateRecord }, { returnDocument: "after" });
        return r ? (serializeId(r) as T) : null;
      }
    },
    async delete(id: string): Promise<boolean> {
      const c = await col();
      try {
        const r = await c.deleteOne({ _id: new ObjectId(id) });
        return r.deletedCount > 0;
      } catch {
        const r = await c.deleteOne({ id } as Filter<Document>);
        return r.deletedCount > 0;
      }
    },
    findOne,
  };
}

function serializeId(doc: unknown): unknown {
  if (!doc || typeof doc !== "object") return doc;
  const out: Record<string, unknown> = { ...(doc as Record<string, unknown>) };
  const rawId: unknown = out._id;
  if (rawId !== undefined && rawId !== null) {
    out.id = typeof rawId === "object" ? String(rawId) : rawId;
    delete out._id;
  }
  return out;
}

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

// ── Service Types ──────────────────────────────────────

interface BaseDoc { id?: string; }

export interface FirestoreUser extends BaseDoc {
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreLead extends BaseDoc {
  name: string;
  company: string;
  email: string;
  phone?: string;
  status: string;
  source: string;
  value: number;
  probability: number;
  notes?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreCustomer extends BaseDoc {
  name: string;
  company: string;
  email: string;
  phone?: string;
  industry?: string;
  status: string;
  lifetimeValue: number;
  deals: number;
  ownerId: string;
  lastContact?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreDeal extends BaseDoc {
  title: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  notes?: string;
  ownerId: string;
  closeDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreContact extends BaseDoc {
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

export interface FirestoreActivity extends BaseDoc {
  type: string;
  title: string;
  description?: string;
  userId: string;
  relatedTo?: string;
  relatedType?: string;
  createdAt: Date;
}

export interface FirestoreTask extends BaseDoc {
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigneeId: string;
  dueDate?: Date;
  relatedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreAccount extends BaseDoc {
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

export interface FirestoreSession extends BaseDoc {
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreVerificationToken extends BaseDoc {
  identifier: string;
  token: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ── Exported Service Instances (MongoDB-backed) ────────

export const usersService = createMongoService<FirestoreUser>(COLLECTIONS.users);
export const leadsService = createMongoService<FirestoreLead>(COLLECTIONS.leads);
export const customersService = createMongoService<FirestoreCustomer>(COLLECTIONS.customers);
export const dealsService = createMongoService<FirestoreDeal>(COLLECTIONS.deals);
export const contactsService = createMongoService<FirestoreContact>(COLLECTIONS.contacts);
export const activitiesService = createMongoService<FirestoreActivity>(COLLECTIONS.activities);
export const tasksService = createMongoService<FirestoreTask>(COLLECTIONS.tasks);
export const accountsService = createMongoService<FirestoreAccount>(COLLECTIONS.accounts);
export const sessionsService = createMongoService<FirestoreSession>(COLLECTIONS.sessions);
export const verificationTokensService = createMongoService<FirestoreVerificationToken>(COLLECTIONS.verificationTokens);
