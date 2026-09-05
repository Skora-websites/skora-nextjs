// ── HRMS RBAC + approvals self-check ─────────────────────────────
// Run: `npx tsx tests/hrms-approvals-rbac-selfcheck.ts`
// Asserts the dual-RBAC fix: HR_ADMIN/MANAGER now resolve to "admin"
// in the 3-role map, AND a new 4-role hrmsCanAccess() gate keeps
// employees out of approver areas and out of the approvals page.

import { canAccessRoute, normalizeRole } from '../lib/rbac';
import { mapFirebaseRoleToHRMS, roleAtLeast, hrmsCanAccess, type HRMSRole } from '../lib/hrms-roles';

let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) console.log(`  ✓ ${name}`);
  else { console.log(`  ✗ ${name}`); failed++; }
}

console.log('\n[rbac] normalizeRole maps 4-role HRMS to 3-role RBAC');
check('SUPER_ADMIN → super_admin', normalizeRole('SUPER_ADMIN') === 'super_admin');
check('HR_ADMIN   → admin',         normalizeRole('HR_ADMIN')   === 'admin');
check('MANAGER    → admin',         normalizeRole('MANAGER')    === 'admin');
check('EMPLOYEE   → employee',      normalizeRole('EMPLOYEE')   === 'employee');
check('lowercase hr_admin → admin', normalizeRole('hr_admin')   === 'admin');

console.log('\n[rbac] canAccessRoute no longer claims /hms/* (3-role map is non-HRMS)');
const SA  = normalizeRole('SUPER_ADMIN');
const HR  = normalizeRole('HR_ADMIN');
const MGR = normalizeRole('MANAGER');
const EMP = normalizeRole('EMPLOYEE');
// SA bypasses the map (early return), so /hrms/superadmin is true.
check('SA  → /hrms/superadmin via 3-role',  canAccessRoute(SA,  '/hrms/superadmin'));
check('EMP ∉ /hrms/superadmin via 3-role', !canAccessRoute(EMP, '/hrms/superadmin'));
check('SA  → /dashboard',                  canAccessRoute(SA,  '/dashboard'));
check('EMP → /dashboard',                  canAccessRoute(EMP, '/dashboard'));

console.log('\n[hrms-roles] mapFirebaseRoleToHRMS + roleAtLeast');
check('map("superadmin") → SUPER_ADMIN', mapFirebaseRoleToHRMS('superadmin') === 'SUPER_ADMIN');
check('map("ADMIN") → HR_ADMIN',         mapFirebaseRoleToHRMS('ADMIN') === 'HR_ADMIN');
check('map("manager") → MANAGER',        mapFirebaseRoleToHRMS('manager') === 'MANAGER');
check('map(undefined) → EMPLOYEE',       mapFirebaseRoleToHRMS(undefined) === 'EMPLOYEE');

check('SA at least HR',  roleAtLeast('SUPER_ADMIN', 'HR_ADMIN'));
check('HR at least HR',  roleAtLeast('HR_ADMIN',    'HR_ADMIN'));
check('MGR not >= HR',  !roleAtLeast('MANAGER',     'HR_ADMIN'));
check('EMP not >= MGR', !roleAtLeast('EMPLOYEE',    'MANAGER'));

console.log('\n[hrms-roles] hrmsCanAccess (4-role guard)');
check('SA  → /hrms/superadmin',  hrmsCanAccess('SUPER_ADMIN', '/hrms/superadmin'));
check('SA  → /hrms/hr-admin',    hrmsCanAccess('SUPER_ADMIN', '/hrms/hr-admin'));
check('SA  → /hrms/manager',     hrmsCanAccess('SUPER_ADMIN', '/hrms/manager'));
check('SA  → /hrms/employee',    hrmsCanAccess('SUPER_ADMIN', '/hrms/employee'));
check('SA  → /hrms/approvals',   hrmsCanAccess('SUPER_ADMIN', '/hrms/approvals'));

check('HR  ✗ /hrms/superadmin', !hrmsCanAccess('HR_ADMIN',    '/hrms/superadmin'));
check('HR  ✓ /hrms/hr-admin',    hrmsCanAccess('HR_ADMIN',    '/hrms/hr-admin'));
check('HR  ✓ /hrms/manager',     hrmsCanAccess('HR_ADMIN',    '/hrms/manager'));
check('HR  ✓ /hrms/employee',    hrmsCanAccess('HR_ADMIN',    '/hrms/employee'));
check('HR  ✓ /hrms/approvals',   hrmsCanAccess('HR_ADMIN',    '/hrms/approvals'));

check('MGR ✗ /hrms/superadmin', !hrmsCanAccess('MANAGER',     '/hrms/superadmin'));
check('MGR ✗ /hrms/hr-admin',   !hrmsCanAccess('MANAGER',     '/hrms/hr-admin'));
check('MGR ✓ /hrms/manager',     hrmsCanAccess('MANAGER',     '/hrms/manager'));
check('MGR ✓ /hrms/employee',    hrmsCanAccess('MANAGER',     '/hrms/employee'));
check('MGR ✓ /hrms/approvals',   hrmsCanAccess('MANAGER',     '/hrms/approvals'));

check('EMP ✗ /hrms/superadmin', !hrmsCanAccess('EMPLOYEE',    '/hrms/superadmin'));
check('EMP ✗ /hrms/hr-admin',   !hrmsCanAccess('EMPLOYEE',    '/hrms/hr-admin'));
check('EMP ✗ /hrms/manager',    !hrmsCanAccess('EMPLOYEE',    '/hrms/manager'));
check('EMP ✓ /hrms/employee',    hrmsCanAccess('EMPLOYEE',    '/hrms/employee'));
check('EMP ✗ /hrms/approvals',  !hrmsCanAccess('EMPLOYEE',    '/hrms/approvals'));

check('any role passes /hrms',        hrmsCanAccess('EMPLOYEE', '/hrms'));
check('any role passes /hrms/login',  hrmsCanAccess('EMPLOYEE', '/hrms/login'));
check('SA hits deep path',             hrmsCanAccess('SUPER_ADMIN', '/hrms/superadmin/escalations'));

console.log('\n[hrms-roles] type surface (compile-time)');
const _r: HRMSRole = 'EMPLOYEE'; void _r;

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAIL`);
process.exit(failed === 0 ? 0 : 1);
