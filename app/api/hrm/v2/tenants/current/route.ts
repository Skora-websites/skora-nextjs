import { NextResponse } from "next/server";
import { tenantsService } from "@/lib/hrm/firestore";
import { getDb } from "@/lib/db/mongo-helper";
import { requireAuth, isErrorResponse } from "@/lib/api-auth";
import { withErrorHandler } from "@/lib/api-handler";

const DEFAULT_RULES = {
  officeStart: 10,
  officeEnd: 19,
  lateAfter: 10.5,
  workDays: [1, 2, 3, 4, 5],
  halfDayAfter: 14.5,
  requiredHours: 8.5,
  breakAllowance: 30,
  meetingCountsAsWork: true,
};

export const GET = withErrorHandler(async () => {
  const auth = await requireAuth();
  if (isErrorResponse(auth)) return auth;

  let latitude = 28.6007594;
  let longitude = 77.4319307;
  let geofenceRadius = 100;
  let officeRules = { ...DEFAULT_RULES };

  try {
    const tenants = await tenantsService.findMany({ limitCount: 1 });
    if (tenants && tenants.length > 0) {
      const tenant = tenants[0] as any;
      if (tenant.officeLatitude) latitude = tenant.officeLatitude;
      if (tenant.officeLongitude) longitude = tenant.officeLongitude;
      if (tenant.geofenceRadius) geofenceRadius = tenant.geofenceRadius;
      if (tenant.officeRules) officeRules = { ...DEFAULT_RULES, ...tenant.officeRules };
    }
  } catch { /* use defaults */ }

  try {
    const db = await getDb();
    if (db) {
      const settingsDoc = await db.collection("settings").findOne({ key: "super_admin_system" });
      if (settingsDoc?.settings?.officeRules) {
        officeRules = { ...DEFAULT_RULES, ...settingsDoc.settings.officeRules };
      }
    }
  } catch { /* use defaults */ }

  return NextResponse.json({ latitude, longitude, geofenceRadius, officeRules });
}, { label: "Tenant Current" });
