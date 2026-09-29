import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { MongoClient, type Collection } from "mongodb";
import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { adminCredentials, envValue } from "./global-setup";

const LOGIN_URL = "/admin/login";
const DASHBOARD_URL = "/admin";

const MSG_NO_ACCOUNT = "Invalid credentials. No account found with this email.";
const MSG_BAD_PASSWORD = "Invalid credentials.";

/** Admin credentials come from env/.env — never from source code. */
const admin = adminCredentials();
const skipWithoutAdmin = () =>
  test.skip(!admin, "set ADMIN_EMAIL / ADMIN_PASSWORD (e.g. via npm run db:seed-admin) to run this test");

async function withUsers(fn: (users: Collection) => Promise<void>) {
  const client = new MongoClient(envValue("MONGODB_URI") || "mongodb://127.0.0.1:27017");
  await client.connect();
  try {
    await fn(client.db(envValue("MONGODB_DB") || "skora").collection("users"));
  } finally {
    await client.close();
  }
}

/** Creates a throwaway account with a random password (nothing hardcoded). */
async function createTempUser(role: string, loginStatus = "active") {
  const email = `tmp-${randomBytes(4).toString("hex")}@skora.test`;
  const password = randomBytes(18).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 12);
  await withUsers(async (users) => {
    await users.insertOne({
      email,
      username: email,
      role,
      loginStatus,
      passwordHash,
      displayName: "Temporary Test User",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
  return { email, password };
}

async function removeTempUser(email: string) {
  await withUsers(async (users) => {
    await users.deleteOne({ email });
  });
}

async function adminSessionCookie(context: BrowserContext) {
  const cookies = await context.cookies();
  return cookies.find((c) => c.name === "admin_session");
}

async function submitLogin(page: Page, identifier: string, password: string) {
  await page.goto(LOGIN_URL);
  await page.getByPlaceholder("your@email.com").fill(identifier);
  await page.getByPlaceholder("••••••••••••").fill(password);
  await page.getByRole("button", { name: /login to dashboard/i }).click();
}

test.describe("admin login — page guards", () => {
  test("unauthenticated visit to /admin redirects to the login page", async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await expect(page).toHaveURL(new RegExp(`${DASHBOARD_URL}/login$`));
    await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
  });

  test("authenticated visit to /admin/login redirects to the dashboard", async ({ page, context }) => {
    skipWithoutAdmin();
    await submitLogin(page, admin!.identifier, admin!.password);
    await page.waitForURL(new RegExp(`${DASHBOARD_URL}$`));

    await page.goto(LOGIN_URL);
    await expect(page).toHaveURL(new RegExp(`${DASHBOARD_URL}$`));
    expect(await adminSessionCookie(context)).toBeTruthy();
  });
});

test.describe("admin login — rejected credentials", () => {
  test("unknown email shows the no-account error and sets no session", async ({ page, context }) => {
    await submitLogin(page, "nobody@skora.test", "whatever-123");

    await expect(page.getByText(MSG_NO_ACCOUNT, { exact: true })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${LOGIN_URL}$`));
    expect(await adminSessionCookie(context)).toBeUndefined();
  });

  test("wrong password shows the invalid-credentials error and sets no session", async ({ page, context }) => {
    skipWithoutAdmin();
    await submitLogin(page, admin!.identifier, `wrong-${randomBytes(6).toString("hex")}`);

    await expect(page.getByText(MSG_BAD_PASSWORD, { exact: true })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${LOGIN_URL}$`));
    expect(await adminSessionCookie(context)).toBeUndefined();
  });

  test("non-admin role is refused access to the admin portal", async ({ page }) => {
    const temp = await createTempUser("employee");
    try {
      await submitLogin(page, temp.email, temp.password);
      await expect(page.getByText(/Access denied\. Your role is 'employee'/)).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`${LOGIN_URL}$`));
    } finally {
      await removeTempUser(temp.email);
    }
  });

  test("disabled account is refused", async ({ page, context }) => {
    const temp = await createTempUser("super_admin", "disabled");
    try {
      await submitLogin(page, temp.email, temp.password);
      await expect(page.getByText(/Account is disabled/)).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`${LOGIN_URL}$`));
      expect(await adminSessionCookie(context)).toBeUndefined();
    } finally {
      await removeTempUser(temp.email);
    }
  });
});

test.describe("admin login — successful sign-in", () => {
  test("valid credentials reach the dashboard and set the session cookie", async ({ page, context }) => {
    skipWithoutAdmin();
    await submitLogin(page, admin!.identifier, admin!.password);

    await page.waitForURL(new RegExp(`${DASHBOARD_URL}$`));
    await expect(page.getByText("Executive dashboard.")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("MANAGEMENT SUITE")).toBeVisible();

    const cookie = await adminSessionCookie(context);
    expect(cookie).toBeTruthy();
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.path).toBe("/");
  });

  test("identifier is matched case-insensitively", async ({ page }) => {
    skipWithoutAdmin();
    await submitLogin(page, admin!.identifier.toUpperCase(), admin!.password);
    await page.waitForURL(new RegExp(`${DASHBOARD_URL}$`));
    await expect(page.getByText("Executive dashboard.")).toBeVisible({ timeout: 15_000 });
  });

  test("identifier is trimmed before lookup", async ({ page }) => {
    skipWithoutAdmin();
    await submitLogin(page, `   ${admin!.identifier}   `, admin!.password);
    await page.waitForURL(new RegExp(`${DASHBOARD_URL}$`));
    await expect(page.getByText("Executive dashboard.")).toBeVisible({ timeout: 15_000 });
  });

  test("logout clears the session and returns to the login page", async ({ page, context }) => {
    skipWithoutAdmin();
    await submitLogin(page, admin!.identifier, admin!.password);
    await page.waitForURL(new RegExp(`${DASHBOARD_URL}$`));
    await expect(page.getByText("Executive dashboard.")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: /logout session/i }).click();
    await page.waitForURL(new RegExp(`${LOGIN_URL}$`));
    expect(await adminSessionCookie(context)).toBeUndefined();

    // Guard still holds after logout.
    await page.goto(DASHBOARD_URL);
    await expect(page).toHaveURL(new RegExp(`${DASHBOARD_URL}/login$`));
  });
});

test.describe("admin login — API contract", () => {
  test("unknown email → 401 with the no-account message", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { username: "nobody@skora.test", password: "x" },
    });
    expect(res.status()).toBe(401);
    expect((await res.json()).error).toBe(MSG_NO_ACCOUNT);
  });

  test("wrong password → 401 with a generic message", async ({ request }) => {
    skipWithoutAdmin();
    const res = await request.post("/api/admin/login", {
      data: { username: admin!.identifier, password: `nope-${randomBytes(6).toString("hex")}` },
    });
    expect(res.status()).toBe(401);
    expect((await res.json()).error).toBe(MSG_BAD_PASSWORD);
  });

  test("non-admin role → 403", async ({ request }) => {
    const temp = await createTempUser("employee");
    try {
      const res = await request.post("/api/admin/login", {
        data: { username: temp.email, password: temp.password },
      });
      expect(res.status()).toBe(403);
      expect((await res.json()).error).toMatch(/Access denied/);
    } finally {
      await removeTempUser(temp.email);
    }
  });

  test("valid credentials → 200, session cookie, and /api/admin/me agrees", async ({ request }) => {
    skipWithoutAdmin();
    const res = await request.post("/api/admin/login", {
      data: { username: admin!.identifier, password: admin!.password },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(res.headers()["set-cookie"] || "").toContain("admin_session=");

    const me = await request.get("/api/admin/me");
    expect((await me.json()).authenticated).toBe(true);

    const out = await request.post("/api/admin/logout");
    expect(out.status()).toBe(200);
    const meAfter = await request.get("/api/admin/me");
    expect((await meAfter.json()).authenticated).toBe(false);
  });

  test("missing credentials → 400", async ({ request }) => {
    const res = await request.post("/api/admin/login", { data: { username: "", password: "" } });
    expect(res.status()).toBe(400);
  });
});
