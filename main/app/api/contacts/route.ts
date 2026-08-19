import { NextRequest, NextResponse } from "next/server";
import { apiRoute, toISO } from "@/lib/api-utils";
import { contactsService } from "@/lib/firestore";
import { requirePermission, isErrorResponse } from "@/lib/api-auth";
import { PERMISSIONS } from "@/lib/rbac";
import { withErrorHandler, badRequest, notFound, created } from "@/lib/api-handler";

export const GET = apiRoute(
  async () => {
    const contacts = await contactsService.findMany({
      orderByField: "createdAt",
      orderByDirection: "desc",
    });

    return contacts.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || undefined,
      company: c.company,
      position: c.position || "",
      status: c.status as "active" | "inactive",
      lastContact: c.lastContact ? toISO(c.lastContact) : undefined,
      notes: c.notes,
      createdAt: toISO(c.createdAt),
    }));
  },
  { permission: "contacts.view" as const }
);

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.CONTACTS_CREATE);
  if (isErrorResponse(auth)) return auth;

  const body = await request.json();

  if (!body.name || !body.email || !body.company) {
    return badRequest("Missing required fields: name, email, company");
  }

  const contact = await contactsService.create({
    name: body.name,
    email: body.email,
    company: body.company,
    phone: body.phone || null,
    position: body.position || null,
    status: body.status || "active",
    lastContact: body.lastContact ? new Date(body.lastContact) : undefined,
    notes: body.notes || null,
  });

  return created({
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone || undefined,
    company: contact.company,
    position: contact.position || "",
    status: contact.status as "active" | "inactive",
    lastContact: contact.lastContact ? toISO(contact.lastContact) : undefined,
    notes: contact.notes,
    createdAt: toISO(contact.createdAt),
    updatedAt: toISO(contact.updatedAt),
  });
}, { label: "Contacts" });

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.CONTACTS_EDIT);
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

  const contact = await contactsService.update(id, body);
  if (!contact) {
    return notFound("Contact not found");
  }

  return NextResponse.json({
    data: {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone || undefined,
      company: contact.company,
      position: contact.position || "",
      status: contact.status as "active" | "inactive",
      lastContact: contact.lastContact ? toISO(contact.lastContact) : undefined,
      notes: contact.notes,
      createdAt: toISO(contact.createdAt),
      updatedAt: toISO(contact.updatedAt),
    },
  });
}, { label: "Contacts" });

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.CONTACTS_DELETE);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return badRequest("id parameter required");
  }

  const deleted = await contactsService.delete(id);
  if (!deleted) {
    return notFound("Contact not found");
  }

  return NextResponse.json({ success: true });
}, { label: "Contacts" });
