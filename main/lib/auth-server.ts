import "server-only";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { AuditLog } from "@/lib/db/models";
import mongoose from "mongoose";

export type HRMSRole = "SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE";

export interface ActingUser {
  id: string;
  email: string;
  name: string;
  role: HRMSRole;
  tenantId?: string;
}

const ROLE_RANK: Record<HRMSRole, number> = {
  SUPER_ADMIN: 100,
  HR_ADMIN: 80,
  MANAGER: 60,
  EMPLOYEE: 20,
};

/** Read the current session and require a logged-in HRMS user. */
export async function requireSession(): Promise<ActingUser> {
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHENTICATED");
  const role = ((session.user.role || "employee").toUpperCase() as string);
  if (!["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"].includes(role)) {
    throw new Error("INVALID_ROLE");
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name || session.user.email,
    role: role as HRMSRole,
    tenantId: (session.user as { tenantId?: string }).tenantId,
  };
}

/** Require one of the given roles. */
export async function requireRole(allowed: HRMSRole[]): Promise<ActingUser> {
  const u = await requireSession();
  if (!allowed.includes(u.role)) throw new Error("FORBIDDEN");
  return u;
}

/** Require role at or above a minimum rank. */
export async function requireMinRole(min: HRMSRole): Promise<ActingUser> {
  const u = await requireSession();
  if (ROLE_RANK[u.role] < ROLE_RANK[min]) throw new Error("FORBIDDEN");
  return u;
}

/** Wrap a server action with audit logging. */
export function withAudit<TArgs extends unknown[], TRet>(
  action: string,
  fn: (actor: ActingUser, ...args: TArgs) => Promise<TRet>
) {
  return async (...args: TArgs): Promise<TRet> => {
    const actor = await requireSession();
    const started = Date.now();
    try {
      const result = await fn(actor, ...args);
      await writeAudit(actor, action, args, "ok", Date.now() - started);
      return result;
    } catch (err) {
      await writeAudit(actor, action, args, `error:${(err as Error).message}`, Date.now() - started);
      throw err;
    }
  };
}

async function writeAudit(
  actor: ActingUser,
  action: string,
  args: unknown[],
  result: string,
  durationMs: number
): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 1) return; // skip if not connected
    await AuditLog.create({
      tenantId: actor.tenantId,
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action,
      args: sanitizeArgs(args),
      result,
      durationMs,
      createdAt: new Date(),
    });
  } catch (e) {
    logger.warn("Audit write failed", { action, err: (e as Error).message });
  }
}

function sanitizeArgs(args: unknown[]): unknown[] {
  return args.map((a) => {
    if (a == null) return a;
    if (typeof a === "string" && a.length > 500) return a.slice(0, 500) + "…";
    if (typeof a === "object") {
      try {
        const json = JSON.stringify(a);
        return json.length > 1000 ? json.slice(0, 1000) + "…" : JSON.parse(json);
      } catch {
        return "[unserializable]";
      }
    }
    return a;
  });
}
