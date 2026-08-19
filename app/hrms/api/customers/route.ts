import { NextRequest, NextResponse } from "next/server";
import { apiRoute, toISO } from "@/lib/api-utils";
import { customersService } from "@/lib/firestore";
import { requirePermission, isErrorResponse, type ApiAuthResult } from "@/lib/api-auth";
import { PERMISSIONS } from "@/lib/rbac";
import { withErrorHandler, badRequest, notFound, created } from "@/lib/api-handler";

export const GET = apiRoute(
  async () => {
    const customers = await customersService.findMany({
      orderByField: "createdAt",
      orderByDirection: "desc",
    });

    return customers.map((c) => ({
      id: c.id,
      name: c.name,
      company: c.company,
      email: c.email,
      phone: c.phone || undefined,
      industry: c.industry || "",
      status: c.status,
      lifetimeValue: c.lifetimeValue,
      deals: c.deals,
      owner: "",
      lastContact: c.lastContact ? toISO(c.lastContact) : undefined,
      createdAt: toISO(c.createdAt),
    }));
  },
  { permission: "customers.view" as const }
);

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.CUSTOMERS_CREATE);
  if (isErrorResponse(auth)) return auth;
  const { userId } = auth as ApiAuthResult;

  const body = await request.json();

  if (!body.name || !body.email || !body.company) {
    return badRequest("Missing required fields: name, email, company");
  }

  const customer = await customersService.create({
    name: body.name,
    company: body.company,
    email: body.email,
    phone: body.phone || null,
    industry: body.industry || null,
    status: body.status || "active",
    lifetimeValue: body.lifetimeValue || 0,
    deals: body.deals || 0,
    ownerId: userId,
    lastContact: body.lastContact ? new Date(body.lastContact) : undefined,
  });

  return created({
    id: customer.id,
    name: customer.name,
    company: customer.company,
    email: customer.email,
    phone: customer.phone || undefined,
    industry: customer.industry || "",
    status: customer.status,
    lifetimeValue: customer.lifetimeValue,
    deals: customer.deals,
    owner: "",
    lastContact: customer.lastContact ? toISO(customer.lastContact) : undefined,
    createdAt: toISO(customer.createdAt),
    updatedAt: toISO(customer.updatedAt),
  });
}, { label: "Customers" });

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.CUSTOMERS_EDIT);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return badRequest("id parameter required");
  }

  const body = await request.json();

  if (body.lastContact) {
    body.lastContact = new Date(body.lastContact);
  }

  const customer = await customersService.update(id, body);
  if (!customer) {
    return notFound("Customer not found");
  }

  return NextResponse.json({
    data: {
      id: customer.id,
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone || undefined,
      industry: customer.industry || "",
      status: customer.status,
      lifetimeValue: customer.lifetimeValue,
      deals: customer.deals,
      owner: "",
      lastContact: customer.lastContact ? toISO(customer.lastContact) : undefined,
      createdAt: toISO(customer.createdAt),
      updatedAt: toISO(customer.updatedAt),
    },
  });
}, { label: "Customers" });

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.CUSTOMERS_DELETE);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return badRequest("id parameter required");
  }

  const deleted = await customersService.delete(id);
  if (!deleted) {
    return notFound("Customer not found");
  }

  return NextResponse.json({ success: true });
}, { label: "Customers" });
