import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/api-auth";
import { updateAttendanceLocation, getLiveEmployeeLocations } from "@/lib/db/attendance";
import { haversineDistance } from "@/lib/geofencing";

// Default office coordinates (used when tenant settings unavailable)
const DEFAULT_OFFICE = { latitude: 28.6007594, longitude: 77.4319307, radius: 100 };

/**
 * POST /api/hrm/v2/attendance/location
 * Employee sends their current GPS coordinates every ~30 seconds.
 * Stores in locationHistory array and updates currentLocation on the attendance record.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isErrorResponse(auth)) return auth;

    const body = await request.json();
    const { latitude, longitude, accuracy } = body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ error: "latitude and longitude are required" }, { status: 400 });
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // Calculate distance from office
    let distanceFromOffice: number | undefined;
    try {
      distanceFromOffice = Math.round(haversineDistance(
        latitude, longitude,
        DEFAULT_OFFICE.latitude, DEFAULT_OFFICE.longitude
      ));
    } catch { /* ignore */ }

    const updated = await updateAttendanceLocation(
      auth.userId, dateStr, latitude, longitude,
      typeof accuracy === "number" ? accuracy : 0,
      distanceFromOffice
    );

    if (!updated) {
      return NextResponse.json({ error: "No active attendance record found. Please punch in first." }, { status: 404 });
    }

    return NextResponse.json({ success: true, distanceFromOffice });
  } catch (error: any) {
    console.error("POST /api/hrm/v2/attendance/location error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

/**
 * GET /api/hrm/v2/attendance/location
 * HR/Admin fetches live locations for all currently punched-in employees.
 */
export async function GET() {
  try {
    const auth = await requireAuth();
    if (isErrorResponse(auth)) return auth;

    // Only managers, HR, and super admins can view all locations
    if (auth.role === "employee") {
      return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
    }

    const locations = await getLiveEmployeeLocations("default");
    return NextResponse.json({ data: locations });
  } catch (error: any) {
    console.error("GET /api/hrm/v2/attendance/location error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
