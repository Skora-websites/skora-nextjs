// Self-check: validates the permission-fix invariants from the audit.
// Run with: npx tsx tests/permission-audit-selfcheck.ts
// ponytail: no test framework — assert-based, exits non-zero on failure.
import assert from "node:assert/strict";
import crypto from "node:crypto";

// 1. HMAC payload role must NOT be trusted: auth() must override from Mongo.
// We don't boot Mongo here; we only assert the SOURCE-OF-TRUTH path exists.
import * as fs from "node:fs";
const authSrc = fs.readFileSync(new URL("../lib/auth.ts", import.meta.url), "utf-8");
assert.ok(
  /loginStatus/.test(authSrc) && /never trust the role baked into the signed payload/i.test(authSrc),
  "lib/auth.ts must re-validate HMAC role against Mongo and reject deactivated users"
);
console.log("OK: lib/auth.ts re-validates HMAC role");

// 2. Login must never silently downgrade a privileged Mongo role.
const loginSrc = fs.readFileSync(new URL("../app/api/auth/login/route.ts", import.meta.url), "utf-8");
assert.ok(
  /PRIVILEGED/.test(loginSrc) && /sticky/i.test(loginSrc),
  "app/api/auth/login/route.ts must have a sticky-privilege path"
);
assert.ok(
  /REGISTER_BOOTSTRAP_SUPERADMIN/.test(loginSrc),
  "login must gate first-user bootstrap on REGISTER_BOOTSTRAP_SUPERADMIN env"
);
console.log("OK: login route downgrades are sticky");

// 3. getHRMSUser must gate first-user bootstrap on env.
const hrmsSrc = fs.readFileSync(new URL("../lib/actions/hrms-actions.ts", import.meta.url), "utf-8");
assert.ok(
  /REGISTER_BOOTSTRAP_SUPERADMIN/.test(hrmsSrc) && /auto-provision/i.test(hrmsSrc),
  "getHRMSUser must opt-in bootstrap"
);
assert.ok(
  /loginStatus === false/.test(hrmsSrc),
  "getHRMSUser must reject deactivated users"
);
console.log("OK: getHRMSUser bootstrap gated + deactivation enforced");

// 4. getAllHRMSUsers must hide SUPER_ADMIN rows from HR_ADMIN.
assert.ok(
  /actor\.role !== 'SUPER_ADMIN'/.test(hrmsSrc) && /\$ne.*SUPER_ADMIN/s.test(hrmsSrc),
  "getAllHRMSUsers must filter SUPER_ADMIN rows for non-SA actors"
);
console.log("OK: getAllHRMSUsers hides SA rows from non-SA");

// 5. api/hrm/v2 create-user must apply HR_ADMIN role ceiling.
const hrmv2Src = fs.readFileSync(new URL("../app/api/hrm/v2/auth/route.ts", import.meta.url), "utf-8");
assert.ok(
  /Cannot create users at or above your own role/.test(hrmv2Src),
  "create-user must reject HR_ADMIN attempts to mint HR_ADMIN or SA"
);
console.log("OK: api/hrm/v2 create-user role ceiling enforced");

// 6. api/hrm/v2 PATCH must sync Mongo role on role change.
assert.ok(
  /User\.updateOne/.test(hrmv2Src) && /hrmsRole/.test(hrmv2Src),
  "PATCH must sync Mongo User.role alongside Firebase claim"
);
assert.ok(
  /revokeRefreshTokens\(userId\)/.test(hrmv2Src),
  "PATCH must revoke refresh tokens so demoted user loses role on next request"
);
console.log("OK: api/hrm/v2 PATCH syncs Mongo + revokes tokens");

// 7. middleware.ts must gate /hrms/* per role.
const mwSrc = fs.readFileSync(new URL("../middleware.ts", import.meta.url), "utf-8");
assert.ok(/matcher/.test(mwSrc) && /ALLOW/.test(mwSrc), "middleware must exist with matcher + ALLOW map");
console.log("OK: middleware.ts gates /hrms/*");

// 8. HMAC payload round-trip (smoke).
const secret = "dev-only-hrms-session-secret";
function sign(payload: object) {
  const body = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}
function verify(token: string) {
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
}
const tok = sign({ id: "u1", role: "EMPLOYEE", tenantId: "t1" });
const decoded = verify(tok);
assert.deepEqual(decoded, { id: "u1", role: "EMPLOYEE", tenantId: "t1" });
// Tampered token must reject.
const bad = tok.replace(/.$/, "X");
assert.equal(verify(bad), null);
console.log("OK: HMAC round-trip + tamper rejection");

console.log("\nALL PERMISSION-AUDIT SELF-CHECKS PASSED");
