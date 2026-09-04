import "server-only";
import { connectDB } from "@/lib/db/db";
import { AuditLog } from "@/lib/db/models";
import type { ActingUser } from "@/lib/auth-server";

/**
 * F-53: append a row to the audit log. Fire-and-forget so it never blocks the
 * main action. Failures are logged but never thrown (audit must not break UX).
 */
export function logAudit(
  actor: Pick<ActingUser, "id" | "email" | "role" | "tenantId">,
  action: string,
  args: unknown,
  result: "SUCCESS" | "FAILURE" = "SUCCESS",
  startedAt: number = Date.now()
): void {
  const durationMs = Date.now() - startedAt;
  // Intentionally not awaited: caller continues.
  connectDB()
    .then(() =>
      AuditLog.create({
        tenantId: actor.tenantId || undefined,
        actorId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        action,
        args: args === undefined ? [] : [args],
        result,
        durationMs,
      })
    )
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error("[audit] write failed:", (e as Error).message);
    });
}
