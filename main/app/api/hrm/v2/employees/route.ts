import { NextRequest, NextResponse } from "next/server";
import {
  getEmployees,
  getEmployeesPaginated,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeProfile,
} from "@/services/hrm/employee";
import { resolveTenantFromOrigin } from "@/services/hrm/tenant";
import { requireAuth, requireAdmin, isErrorResponse } from "@/lib/api-auth";
import { withErrorHandler, badRequest, notFound, forbidden } from "@/lib/api-handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth();
  if (isErrorResponse(auth)) return auth;

  const origin = request.headers.get("origin");
  const tenantCtx = await resolveTenantFromOrigin(origin);
  const tenantId = tenantCtx?.tenantId || "default";

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const profile = searchParams.get("profile");

  // Check for server-table pagination params
  const page = searchParams.get("page");
  const pageSize = searchParams.get("pageSize");
  const search = searchParams.get("search");
  const sortKey = searchParams.get("sortKey");
  const sortDir = searchParams.get("sortDir");
  const status = searchParams.get("status");

  const hasPagination = page !== null && pageSize !== null;

  // Employees can only view their own profile
  if (auth.role === "employee" && id !== auth.userId) {
    return forbidden("You can only view your own profile");
  }

  if (id && profile === "true") {
    const result = await getEmployeeProfile(id);
    if (!result.user) {
      return notFound("Employee not found");
    }
    return NextResponse.json({ data: result });
  }

  if (id) {
    const employee = await getEmployeeById(id);
    if (!employee) {
      return notFound("Employee not found");
    }
    return NextResponse.json({ data: employee });
  }

  // Employees can only view their own data
  if (auth.role === "employee") {
    const employee = await getEmployeeById(auth.userId);
    if (!employee) {
      return notFound("Employee not found");
    }
    return NextResponse.json({ data: [employee] });
  }

  // Server-side paginated query
  if (hasPagination) {
    const result = await getEmployeesPaginated(tenantId, {
      page: page ? parseInt(page) : 0,
      pageSize: pageSize ? parseInt(pageSize) : 10,
      search: search || undefined,
      sortKey: sortKey || undefined,
      sortDir: sortDir === "asc" || sortDir === "desc" ? sortDir : undefined,
      status: status || undefined,
    });
    return NextResponse.json({
      data: result.data,
      totalItems: result.totalItems,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  }

  // Legacy full-list query
  const employees = await getEmployees(tenantId);
  return NextResponse.json({ data: employees });
}, { label: "HRM Employees" });

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const origin = request.headers.get("origin");
  const tenantCtx = await resolveTenantFromOrigin(origin);
  const tenantId = tenantCtx?.tenantId || "default";

  const body = await request.json();

  if (!body.email || !body.password || !body.displayName || !body.firstName || !body.lastName) {
    return badRequest("Missing required fields: email, password, displayName, firstName, lastName");
  }

  const employee = await createEmployee(tenantId, {
    email: body.email,
    password: body.password,
    displayName: body.displayName,
    firstName: body.firstName,
    lastName: body.lastName,
    phone: body.phone || "",
    role: body.role || "employee",
    status: body.status || "active",
    departmentId: body.departmentId || "",
    departmentName: body.departmentName || "",
    designationId: body.designationId || "",
    designationName: body.designationName || "",
    joiningDate: body.joiningDate ? new Date(body.joiningDate) : undefined,
    employeeCode: body.employeeCode || "",
    address: body.address || "",
    emergencyContact: body.emergencyContact || "",
    emergencyPhone: body.emergencyPhone || "",
  });

  return NextResponse.json({ data: employee }, { status: 201 });
}, { label: "HRM Employees" });

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return badRequest("id parameter required");
  }

  const body = await request.json();
  const employee = await updateEmployee(id, body);
  if (!employee) {
    return notFound("Employee not found");
  }

  return NextResponse.json({ data: employee });
}, { label: "HRM Employees" });

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return badRequest("id parameter required");
  }

  const deleted = await deleteEmployee(id);
  if (!deleted) {
    return notFound("Employee not found");
  }

  return NextResponse.json({ success: true });
}, { label: "HRM Employees" });
