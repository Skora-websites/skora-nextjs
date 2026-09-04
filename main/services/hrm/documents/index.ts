import "server-only";
import {
  documentsService,
  documentCategoriesService,
  documentTemplatesService,
} from "@/lib/hrm/firestore";
import type {
  Document,
  DocumentCategory,
  DocumentTemplate,
} from "@/types";
import { getAdminStorage } from "@/lib/firebase-admin";
import { sanitizeFilename } from "@/lib/uploads/sanitize";

// ══════════════════════════════════════════════════════════════════
// Documents Service
// ══════════════════════════════════════════════════════════════════

// ── Categories ─────────────────────────────────────────

export async function getDocumentCategories(tenantId: string): Promise<DocumentCategory[]> {
  return documentCategoriesService.findManyInTenant(tenantId, {
    orderByField: "name",
    orderByDirection: "asc",
  });
}

export async function createDocumentCategory(tenantId: string, data: Partial<DocumentCategory>): Promise<DocumentCategory> {
  return documentCategoriesService.create({ ...data, tenantId } as any);
}

export async function updateDocumentCategory(id: string, data: Partial<DocumentCategory>): Promise<DocumentCategory | null> {
  return documentCategoriesService.update(id, data as any);
}

export async function deleteDocumentCategory(id: string): Promise<boolean> {
  return documentCategoriesService.delete(id);
}

// ── Documents ──────────────────────────────────────────

export async function getDocuments(
  tenantId: string,
  options: {
    userId?: string;
    categoryId?: string;
    status?: Document["status"];
    isVerified?: boolean;
  } = {}
): Promise<Document[]> {
  const where: { field: string; op: "=="; value: unknown }[] = [];
  if (options.userId) where.push({ field: "userId", op: "==", value: options.userId });
  if (options.categoryId) where.push({ field: "categoryId", op: "==", value: options.categoryId });
  if (options.status) where.push({ field: "status", op: "==", value: options.status });
  if (options.isVerified !== undefined) where.push({ field: "isVerified", op: "==", value: options.isVerified });

  return documentsService.findManyInTenant(tenantId, {
    where,
    orderByField: "createdAt",
    orderByDirection: "desc",
  });
}

export async function getDocumentById(id: string): Promise<Document | null> {
  return documentsService.findById(id);
}

export async function uploadDocument(
  tenantId: string,
  data: {
    categoryId: string;
    userId: string;
    title: string;
    description?: string;
    file: Buffer;
    fileName: string;
    mimeType: string;
    expiryDate?: Date;
  }
): Promise<Document> {
  const bucket = getAdminStorage().bucket();
  // SECURITY (F-3, F-4): the on-disk object name is server-issued (uuid + ext).
  // `fileName` is only used as a display label and is sanitized first.
  const safe = sanitizeFilename(data.fileName);
  const ext = safe.ext || "bin";
  const filePath = `tenants/${tenantId}/documents/${data.userId}/${cryptoRandomUUID()}.${ext}`;
  const file = bucket.file(filePath);

  await file.save(data.file, {
    metadata: { contentType: data.mimeType },
  });

  // SECURITY (F-3): never call makePublic(). The stored `fileURL` is the
  // object PATH; consumers must call getDocumentDownloadUrl() to get a
  // short-lived signed URL.
  const filePath_out = filePath;

  return documentsService.create({
    categoryId: data.categoryId,
    userId: data.userId,
    title: data.title,
    description: data.description,
    fileURL: filePath_out,
    fileType: data.mimeType,
    fileSize: data.file.length,
    expiryDate: data.expiryDate,
    status: "active",
    isVerified: false,
    tenantId,
  } as any);
}

export async function updateDocument(id: string, data: Partial<Document>): Promise<Document | null> {
  return documentsService.update(id, data as any);
}

const DELETE_RETRY_DELAYS_MS = [0, 200, 800] as const;

export async function deleteDocument(id: string): Promise<boolean> {
  const doc = await documentsService.findById(id);
  if (!doc) return false;

  // SECURITY (F-3): bounded retry, fail loud if storage delete doesn't work.
  let lastErr: unknown = null;
  for (const delay of DELETE_RETRY_DELAYS_MS) {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    try {
      const bucket = getAdminStorage().bucket();
      await bucket.file(doc.fileURL).delete({ ignoreNotFound: true });
      lastErr = null;
      break;
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr) {
    // Don't delete the DB row if the storage delete failed. Surface the error
    // so the caller can retry / escalate. The previous version swallowed this
    // and left public objects live.
    throw new Error(`Storage delete failed: ${(lastErr as Error).message}`);
  }

  return documentsService.delete(id);
}

export async function verifyDocument(
  id: string,
  verifiedById: string
): Promise<Document | null> {
  return documentsService.update(id, {
    isVerified: true,
    verifiedById,
    verifiedAt: new Date(),
  } as any);
}

/**
 * Issue a 5-minute signed download URL for a document. Tenant-isolated.
 * Callers must look up the document by id, then call this with the
 * resolved `tenantId` (do NOT trust client-supplied tenant).
 */
export async function getDocumentDownloadUrl(
  tenantId: string,
  id: string
): Promise<{ url: string; expiresInMs: number } | null> {
  const doc = await documentsService.findById(id);
  if (!doc) return null;
  if (String(doc.tenantId) !== String(tenantId)) return null;
  const file = getAdminStorage().bucket().file(doc.fileURL);
  const expires = Date.now() + 5 * 60 * 1000;
  const [url] = await file.getSignedUrl({ action: "read", expires, version: "v4" });
  return { url, expiresInMs: 5 * 60 * 1000 };
}

// ── Document Templates ─────────────────────────────────

export async function getDocumentTemplates(
  tenantId: string,
  type?: DocumentTemplate["type"]
): Promise<DocumentTemplate[]> {
  const where = type ? [{ field: "type", op: "==" as const, value: type }] : [];
  return documentTemplatesService.findManyInTenant(tenantId, {
    where,
    orderByField: "name",
    orderByDirection: "asc",
  });
}

export async function getDocumentTemplateById(id: string): Promise<DocumentTemplate | null> {
  return documentTemplatesService.findById(id);
}

export async function createDocumentTemplate(tenantId: string, data: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
  return documentTemplatesService.create({ ...data, tenantId } as any);
}

export async function updateDocumentTemplate(id: string, data: Partial<DocumentTemplate>): Promise<DocumentTemplate | null> {
  return documentTemplatesService.update(id, data as any);
}

export async function deleteDocumentTemplate(id: string): Promise<boolean> {
  return documentTemplatesService.delete(id);
}

// ── Template Rendering ─────────────────────────────────

export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return rendered;
}

// ── Helpers ────────────────────────────────────────────

function cryptoRandomUUID(): string {
  // Lazy import; runs in Node runtime.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { randomUUID } = require("node:crypto") as typeof import("node:crypto");
  return randomUUID();
}
