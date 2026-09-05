// ── HRMS 4-role helpers (shared between server actions, layouts, and sidebar) ──

export type HRMSRole = 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export const HRMS_ROLES: HRMSRole[] = ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'];

/** Map Firebase custom-claim / Mongo role strings to the 4-role HRMS enum. */
export function mapFirebaseRoleToHRMS(role?: string | null): HRMSRole {
  const norm = (role || '').toUpperCase().trim();
  if (norm === 'SUPER_ADMIN' || norm === 'SUPERADMIN' || norm === 'SUPER_ADMINISTRATOR') return 'SUPER_ADMIN';
  if (norm === 'HR_ADMIN' || norm === 'HRADMIN' || norm === 'ADMIN') return 'HR_ADMIN';
  if (norm === 'MANAGER') return 'MANAGER';
  return 'EMPLOYEE';
}

/** Authority ordering for approvals. Higher = more privileged. */
const ROLE_RANK: Record<HRMSRole, number> = {
  EMPLOYEE: 0,
  MANAGER: 1,
  HR_ADMIN: 2,
  SUPER_ADMIN: 3,
};

export function roleAtLeast(actor: HRMSRole, minimum: HRMSRole): boolean {
  return ROLE_RANK[actor] >= ROLE_RANK[minimum];
}

// ── HRMS route guard ──
//
// Each HRMS route has a minimum required role. The 3-role canAccessRoute()
// in lib/rbac.ts cannot express this because HR_ADMIN and MANAGER both map
// to "admin". Use this on the client (AuthProvider) AND server (layouts).

const HRMS_ROUTE_MIN: Array<{ prefix: string; min: HRMSRole }> = [
  { prefix: '/hrms/superadmin', min: 'SUPER_ADMIN' },
  { prefix: '/hrms/hr-admin',   min: 'HR_ADMIN' },
  { prefix: '/hrms/manager',    min: 'MANAGER' },
  { prefix: '/hrms/approvals',  min: 'MANAGER' },
  { prefix: '/hrms/employee',   min: 'EMPLOYEE' },
];

export function hrmsCanAccess(actor: HRMSRole, path: string): boolean {
  // /hrms index is a server-side redirect; everyone authenticated passes.
  if (path === '/hrms' || path === '/hrms/') return true;
  if (path.startsWith('/hrms/login') || path.startsWith('/hrms/register')) return true;
  for (const r of HRMS_ROUTE_MIN) {
    if (path === r.prefix || path.startsWith(r.prefix + '/')) {
      return roleAtLeast(actor, r.min);
    }
  }
  return false;
}
