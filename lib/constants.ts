/**
 * List of email addresses that should automatically be granted Super Admin role.
 * The first user to sign up also becomes super_admin automatically.
 * Add additional emails here to designate multiple super admins.
 */
export const SUPER_ADMIN_EMAILS = [
  "ashish17427@gmail.com",
  "skorainfotech@gmail.com",
  process.env.SUPER_ADMIN_EMAIL || "",
  "admin@skora.info",
  "admin@edskora.com",
].filter(Boolean);
