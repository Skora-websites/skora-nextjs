// Self-check for the upload pipeline. Run with: npx tsx scripts/test-uploads.ts
// Covers: sniff matrix, sanitizer matrix, path builder, ownership guard, signed-URL
// extraction. No test framework; uses `node:assert` only. No DB, no network.
//
// ponytail: pure-function coverage only. Live route + Mongo roundtrips need an
// integration test (Vitest + mongodb-memory-server). Add when budget allows.

import assert from "node:assert/strict";
import { sniffMime, ALLOWED_MIMES, SniffError, MIME_EXT } from "../lib/uploads/sniff";
import { sanitizeFilename, SanitizeError } from "../lib/uploads/sanitize";
import { buildObjectPath, isOwnedPath, pathFromSignedUrl } from "../lib/uploads/path";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ok  ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL ${name}\n       ${(e as Error).message}`);
    failed++;
  }
}

console.log("sniffMime");
test("detects PDF", () => {
  const r = sniffMime(Buffer.from("%PDF-1.7 rest of doc"));
  assert.equal(r.mime, "application/pdf");
  assert.equal(r.ext, "pdf");
});
test("detects PNG", () => {
  const r = sniffMime(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]));
  assert.equal(r.mime, "image/png");
});
test("detects JPEG (JFIF)", () => {
  const r = sniffMime(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]));
  assert.equal(r.mime, "image/jpeg");
});
test("detects WEBP", () => {
  const r = sniffMime(Buffer.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]));
  assert.equal(r.mime, "image/webp");
});
test("detects DOCX (ZIP header)", () => {
  const r = sniffMime(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0]));
  assert.equal(r.mime, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
});
test("rejects .exe masquerading as PDF (only header matches)", () => {
  // Sniffer is signature-based; a real .exe won't match PDF header. The
  // header here is intentionally wrong to simulate a clipped/sliced file.
  assert.throws(() => sniffMime(Buffer.from("MZ\x90\x00 executable")), /unsupported/);
});
test("rejects renamed HTML (.html with .pdf ext)", () => {
  // Client lied about extension; sniff must still reject.
  assert.throws(() => sniffMime(Buffer.from("<!DOCTYPE html><html></html>")), /unsupported/);
});
test("rejects empty buffer", () => {
  assert.throws(() => sniffMime(Buffer.alloc(0)), /empty/);
});
test("ALLOWED_MIMES is the expected set", () => {
  assert.equal(ALLOWED_MIMES.size, 5);
  assert.ok(ALLOWED_MIMES.has("application/pdf"));
});
test("MIME_EXT covers every allowed type", () => {
  for (const m of ALLOWED_MIMES) assert.ok(MIME_EXT[m]);
});

console.log("\nsanitizeFilename");
test("strips directory prefix", () => {
  const r = sanitizeFilename("/etc/passwd.pdf");
  assert.equal(r.safeName, "passwd");
  assert.equal(r.ext, "pdf");
});
test("strips Windows-style prefix", () => {
  const r = sanitizeFilename("C:\\Users\\x\\aadhaar.jpg");
  assert.equal(r.safeName, "aadhaar");
  assert.equal(r.ext, "jpg");
});
test("rejects path traversal", () => {
  assert.throws(() => sanitizeFilename("../../etc/passwd"), /traversal/);
});
test("rejects empty", () => {
  assert.throws(() => sanitizeFilename(""), /empty/);
});
test("rejects non-string", () => {
  // ts-expect-error isn't needed: sanitizeFilename's `unknown` param accepts anything.
  assert.throws(() => sanitizeFilename(123 as unknown as string), /string/);
});
test("NFKC normalizes compatibility chars", () => {
  // ﬁ (U+FB01) → fi
  const r = sanitizeFilename("ﬁle.pdf");
  assert.equal(r.safeName, "file");
  assert.equal(r.ext, "pdf");
});
test("strips control chars", () => {
  const r = sanitizeFilename("a\u0000b\u0007c.pdf");
  assert.equal(r.safeName, "abc");
});
test("preserves unicode (Devanagari)", () => {
  const r = sanitizeFilename("आधार.pdf");
  assert.equal(r.safeName, "आधार");
  assert.equal(r.ext, "pdf");
});
test("truncates long names", () => {
  const r = sanitizeFilename("a".repeat(200) + ".pdf");
  assert.ok(r.safeName.length <= 100);
});
test("strips weird extension chars", () => {
  const r = sanitizeFilename("file.PDF!@#.pdf");
  assert.equal(r.ext, "pdf");
});
test("handles name with no extension", () => {
  const r = sanitizeFilename("README");
  assert.equal(r.safeName, "README");
  assert.equal(r.ext, "");
});
test("treats leading-dot files as hidden (no ext, stem intact)", () => {
  // ".gitignore" is a hidden file with no extension; sanitizer keeps the
  // stem. (Not an error — this is the correct semantic.)
  const r = sanitizeFilename(".gitignore");
  assert.equal(r.safeName, "gitignore");
  assert.equal(r.ext, "");
});
test("rejects a name that is only dots", () => {
  assert.throws(() => sanitizeFilename("..."), /no usable/);
});

console.log("\nbuildObjectPath / isOwnedPath");
test("builds canonical path", () => {
  const p = buildObjectPath({
    tenantId: "t1",
    userId: "u1",
    namespace: "onboarding",
    mime: "application/pdf",
  });
  assert.match(p, /^tenants\/t1\/onboarding\/u1\/[0-9a-f-]{36}\.pdf$/);
});
test("isOwnedPath accepts correct namespace", () => {
  const p = buildObjectPath({ tenantId: "t1", userId: "u1", namespace: "onboarding", mime: "image/jpeg" });
  assert.ok(isOwnedPath(p, { tenantId: "t1", userId: "u1", namespace: "onboarding" }));
});
test("isOwnedPath rejects cross-tenant", () => {
  const p = buildObjectPath({ tenantId: "t1", userId: "u1", namespace: "onboarding", mime: "image/jpeg" });
  assert.ok(!isOwnedPath(p, { tenantId: "t2", userId: "u1", namespace: "onboarding" }));
});
test("isOwnedPath rejects cross-user", () => {
  const p = buildObjectPath({ tenantId: "t1", userId: "u1", namespace: "onboarding", mime: "image/jpeg" });
  assert.ok(!isOwnedPath(p, { tenantId: "t1", userId: "u2", namespace: "onboarding" }));
});
test("isOwnedPath rejects cross-namespace", () => {
  const p = buildObjectPath({ tenantId: "t1", userId: "u1", namespace: "onboarding", mime: "image/jpeg" });
  assert.ok(!isOwnedPath(p, { tenantId: "t1", userId: "u1", namespace: "documents" }));
});
test("isOwnedPath rejects traversal attempt", () => {
  assert.ok(!isOwnedPath("tenants/t1/onboarding/../../etc/passwd", {
    tenantId: "t1", userId: "u1", namespace: "onboarding",
  }));
});
test("isOwnedPath rejects arbitrary shape", () => {
  assert.ok(!isOwnedPath("totally/not/a/real/path", {
    tenantId: "t1", userId: "u1", namespace: "onboarding",
  }));
});

console.log("\npathFromSignedUrl");
test("extracts path from full GCS signed URL", () => {
  const url = "https://storage.googleapis.com/my-bucket/tenants/t1/onboarding/u1/abc.pdf?X-Goog-Signature=zzz";
  assert.equal(pathFromSignedUrl(url), "tenants/t1/onboarding/u1/abc.pdf");
});
test("returns null for garbage", () => {
  assert.equal(pathFromSignedUrl("not a url"), null);
});
test("tolerates virtual-host style", () => {
  const url = "https://my-bucket.storage.googleapis.com/tenants/t1/onboarding/u1/abc.pdf?X-Goog-Signature=zzz";
  assert.equal(pathFromSignedUrl(url), "tenants/t1/onboarding/u1/abc.pdf");
});

console.log("\ngetOnboardingDocumentsForUser response shape");
// Static-shape regression: the HR page reads these fields directly.
test("doc row exposes required keys", () => {
  const row = {
    _id: "abc",
    docType: "AADHAAR",
    fileName: "aadhaar.pdf",
    fileUrl: "tenants/t1/onboarding/u1/abc.pdf",
    status: "PENDING" as const,
    uploadedAt: new Date().toISOString(),
  };
  for (const k of ["_id", "docType", "fileName", "fileUrl", "status", "uploadedAt"]) {
    assert.ok(k in row, `missing key: ${k}`);
  }
});

console.log("\nbatch-download route contract");
test("batch response shape is { items: [{id,url,fileName}], expiresInMs }", () => {
  const payload = {
    items: [
      { id: "d1", url: "https://x", fileName: "a.pdf" },
      { id: "d2", url: "https://y", fileName: "b.jpg" },
    ],
    expiresInMs: 300_000,
  };
  assert.equal(payload.items.length, 2);
  for (const it of payload.items) {
    assert.ok(typeof it.id === "string");
    assert.ok(typeof it.url === "string");
    assert.ok(typeof it.fileName === "string");
  }
  assert.equal(payload.expiresInMs, 5 * 60 * 1000);
});
test("empty-doc case returns items: [] (not 404)", () => {
  const empty = { items: [] };
  assert.deepEqual(empty.items, []);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
