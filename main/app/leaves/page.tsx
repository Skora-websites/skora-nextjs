"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { FormSection } from "@/components/ui/form-section";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { FormActions } from "@/components/ui/form-actions";
import { DataTable } from "@/components/shared/data-table";
import type { Column, Action } from "@/components/shared/data-table";
import { useLeaveTypes } from "@/hooks/hrm/use-leave";
import { useMutation } from "@/hooks/use-mutation";
import type { LeaveType } from "@/types";

// ── Helpers ──────────────────────────────────────────────

const INCREMENT_TYPE_LABELS: Record<string, string> = {
  none: "None",
  monthly: "Monthly",
  yearly: "Yearly",
  per_quarter: "Per Quarter",
};

function formatIncrementType(type: string | undefined): string {
  return INCREMENT_TYPE_LABELS[type ?? "none"] ?? type ?? "—";
}

// ── Form state type ──────────────────────────────────────

interface LeaveTypeForm {
  name: string;
  code: string;
  planId: string;
  isPaid: boolean;
  maxBalance: number;
  incrementType: string;
  incrementValue: number;
  requiresApproval: boolean;
  requiresAttachment: boolean;
  genderRestriction: string;
  minDaysBeforeRequest: number;
  maxConsecutiveDays: number;
  color: string;
  status: string;
}

const emptyForm: LeaveTypeForm = {
  name: "",
  code: "",
  planId: "",
  isPaid: true,
  maxBalance: 30,
  incrementType: "none",
  incrementValue: 0,
  requiresApproval: true,
  requiresAttachment: false,
  genderRestriction: "",
  minDaysBeforeRequest: 0,
  maxConsecutiveDays: 30,
  color: "#5e72e4",
  status: "active",
};

// ── Page Component ───────────────────────────────────────

export default function LeavesPage() {
  const { data: leaveTypes, loading, error, refetch } = useLeaveTypes();
  const mutation = useMutation();

  // ── Dialog State ───────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [form, setForm] = useState<LeaveTypeForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── Delete Confirmation ────────────────────────────────
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Columns ────────────────────────────────────────────
  const columns: Column<LeaveType>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        sortable: true,
        cell: (lt: LeaveType) => (
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: lt.color || "#5e72e4" }}
            >
              {lt.name?.charAt(0)?.toUpperCase() ?? "L"}
            </div>
            <div>
              <p className="text-sm font-semibold text-dark dark:text-white leading-tight">
                {lt.name || "—"}
              </p>
              {lt.status === "inactive" && (
                <Badge
                  variant="outline"
                  size="sm"
                  className="mt-0.5 text-[10px] px-1.5 py-0"
                >
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "incrementType",
        header: "Type",
        sortable: true,
        cell: (lt: LeaveType) => (
          <Badge variant="subtle-info" size="sm" className="font-medium">
            {formatIncrementType(lt.incrementType)}
          </Badge>
        ),
      },
      {
        key: "isPaid",
        header: "Paid",
        sortable: true,
        cell: (lt: LeaveType) =>
          lt.isPaid ? (
            <div className="flex items-center gap-1.5 text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Yes</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">No</span>
            </div>
          ),
      },
      {
        key: "code",
        header: "Code",
        sortable: true,
        cell: (lt: LeaveType) => (
          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-dark dark:text-white/80">
            {lt.code || "—"}
          </code>
        ),
      },
    ],
    []
  );

  // ── Actions ────────────────────────────────────────────
  const actions: Action<LeaveType>[] = useMemo(
    () => [
      {
        label: "View Details",
        icon: Eye,
        onClick: (lt: LeaveType) => openViewDialog(lt),
        variant: "ghost",
      },
      {
        label: "Edit",
        icon: Pencil,
        onClick: (lt: LeaveType) => openEditDialog(lt),
        variant: "ghost",
      },
      {
        label: "Delete",
        icon: Trash2,
        onClick: (lt: LeaveType) => confirmDelete(lt.id),
        variant: "ghost",
      },
    ],
    []
  );

  // ── Dialogs ────────────────────────────────────────────

  const openAddDialog = useCallback(() => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogMode("add");
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((lt: LeaveType) => {
    setForm({
      name: lt.name ?? "",
      code: lt.code ?? "",
      planId: lt.planId ?? "",
      isPaid: lt.isPaid ?? true,
      maxBalance: lt.maxBalance ?? 30,
      incrementType: lt.incrementType ?? "none",
      incrementValue: lt.incrementValue ?? 0,
      requiresApproval: lt.requiresApproval ?? true,
      requiresAttachment: lt.requiresAttachment ?? false,
      genderRestriction: lt.genderRestriction ?? "",
      minDaysBeforeRequest: lt.minDaysBeforeRequest ?? 0,
      maxConsecutiveDays: lt.maxConsecutiveDays ?? 30,
      color: lt.color ?? "#5e72e4",
      status: lt.status ?? "active",
    });
    setEditingId(lt.id);
    setDialogMode("edit");
    setDialogOpen(true);
  }, []);

  const openViewDialog = useCallback((lt: LeaveType) => {
    setForm({
      name: lt.name ?? "",
      code: lt.code ?? "",
      planId: lt.planId ?? "",
      isPaid: lt.isPaid ?? true,
      maxBalance: lt.maxBalance ?? 30,
      incrementType: lt.incrementType ?? "none",
      incrementValue: lt.incrementValue ?? 0,
      requiresApproval: lt.requiresApproval ?? true,
      requiresAttachment: lt.requiresAttachment ?? false,
      genderRestriction: lt.genderRestriction ?? "",
      minDaysBeforeRequest: lt.minDaysBeforeRequest ?? 0,
      maxConsecutiveDays: lt.maxConsecutiveDays ?? 30,
      color: lt.color ?? "#5e72e4",
      status: lt.status ?? "active",
    });
    setEditingId(null);
    setDialogMode("view");
    setDialogOpen(true);
  }, []);

  // ── Save (Create / Update) ─────────────────────────────
  const handleSave = async () => {
    if (dialogMode === "add") {
      const result = await mutation.createRecord("/api/hrm/v2/leaves", {
        action: "create_type",
        ...form,
      });
      if (result) {
        setDialogOpen(false);
        refetch();
      }
    } else if (dialogMode === "edit" && editingId) {
      const result = await mutation.createRecord("/api/hrm/v2/leaves", {
        action: "update_type",
        id: editingId,
        ...form,
      });
      if (result) {
        setDialogOpen(false);
        refetch();
      }
    }
  };

  // ── Delete ─────────────────────────────────────────────
  const confirmDelete = useCallback((id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await mutation.createRecord("/api/hrm/v2/leaves", {
      action: "delete_type",
      id: deleteId,
    });
    if (result) {
      setDeleteId(null);
      setShowDeleteConfirm(false);
      refetch();
    }
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <AppShell title="Leaves">
      {/* ══════════════════════════════════════════════════
         HEADER: Title left, Add button right
         ══════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-h3 text-dark dark:text-white font-bold tracking-tighter">
            Leave Types
          </h2>
          <p className="mt-1 text-sm text-muted">
            Manage leave type definitions, allowances, and policies
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="rounded-full bg-gradient-danger text-white shadow-md shadow-danger/20 hover:shadow-lg hover:shadow-danger/30 transition-all duration-200 px-6"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Leave Type
        </Button>
      </div>

      {/* ══════════════════════════════════════════════════
         DATATABLE
         ══════════════════════════════════════════════════ */}
      <Card className="shadow-sm border-0 overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={leaveTypes ?? []}
            searchable
            searchKeys={["name", "code", "incrementType"]}
            pageSize={10}
            entriesOptions={[5, 10, 25, 50]}
            loading={loading}
            error={error || undefined}
            onRetry={refetch}
            emptyMessage="No leave types found"
            actions={actions}
            striped
            stickyHeader
          />
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════
         ADD / EDIT DIALOG
         ══════════════════════════════════════════════════ */}
      <Dialog
        open={dialogOpen && dialogMode !== "view"}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10">
                <CalendarDays className="h-4 w-4 text-danger" />
              </div>
              {dialogMode === "add" ? "Create Leave Type" : "Edit Leave Type"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Add a new leave type to the system."
                : "Update the details of this leave type."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-6"
          >
            <FormSection title="Basic Information" columns={2}>
              <FormInput
                label="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Annual Leave"
              />
              <FormInput
                label="Code"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                required
                placeholder="e.g. ANNUAL"
              />
              <FormSelect
                label="Increment Type"
                value={form.incrementType}
                onChange={(e) =>
                  setForm({ ...form, incrementType: e.target.value as any })
                }
                options={[
                  { value: "none", label: "None" },
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly" },
                  { value: "per_quarter", label: "Per Quarter" },
                ]}
              />
              <FormInput
                label="Max Balance (days)"
                type="number"
                value={String(form.maxBalance)}
                onChange={(e) =>
                  setForm({ ...form, maxBalance: Number(e.target.value) })
                }
              />
              <FormSelect
                label="Gender Restriction"
                value={form.genderRestriction}
                onChange={(e) =>
                  setForm({ ...form, genderRestriction: e.target.value })
                }
                options={[
                  { value: "", label: "None (All genders)" },
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                ]}
              />
              <FormSelect
                label="Status"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as any })
                }
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </FormSection>

            <FormSection title="Leave Settings" columns={2}>
              <FormSelect
                label="Paid Leave"
                value={form.isPaid ? "true" : "false"}
                onChange={(e) =>
                  setForm({ ...form, isPaid: e.target.value === "true" })
                }
                options={[
                  { value: "true", label: "Yes (Paid)" },
                  { value: "false", label: "No (Unpaid)" },
                ]}
              />
              <FormSelect
                label="Requires Approval"
                value={form.requiresApproval ? "true" : "false"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    requiresApproval: e.target.value === "true",
                  })
                }
                options={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
              />
              <FormInput
                label="Min Days Before Request"
                type="number"
                value={String(form.minDaysBeforeRequest)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minDaysBeforeRequest: Number(e.target.value),
                  })
                }
              />
              <FormInput
                label="Max Consecutive Days"
                type="number"
                value={String(form.maxConsecutiveDays)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxConsecutiveDays: Number(e.target.value),
                  })
                }
              />
              <div className="col-span-full">
                <label className="block text-sm font-semibold text-dark dark:text-white mb-1.5">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="h-10 w-16 rounded-lg border border-border/70 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs text-muted">{form.color}</span>
                </div>
              </div>
            </FormSection>

            {mutation.error && (
              <div className="p-3 text-sm text-danger bg-danger/10 rounded-lg border border-danger/20">
                {mutation.error}
              </div>
            )}

            <FormActions
              onCancel={() => setDialogOpen(false)}
              submitLabel={dialogMode === "add" ? "Create Leave Type" : "Save Changes"}
              loading={mutation.loading}
            />
          </form>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════
         VIEW DIALOG (Read-only)
         ══════════════════════════════════════════════════ */}
      <Dialog
        open={dialogOpen && dialogMode === "view"}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold"
                style={{ backgroundColor: form.color || "#5e72e4" }}
              >
                {form.name?.charAt(0)?.toUpperCase() ?? "L"}
              </div>
              {form.name || "Leave Type"}
            </DialogTitle>
            <DialogDescription>
              Complete details for this leave type.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <DetailItem label="Code" value={form.code} />
            <DetailItem
              label="Increment Type"
              value={formatIncrementType(form.incrementType)}
            />
            <DetailItem
              label="Paid"
              value={form.isPaid ? "Yes" : "No"}
              badge={form.isPaid ? "success" : undefined}
            />
            <DetailItem
              label="Max Balance"
              value={`${form.maxBalance} days`}
            />
            <DetailItem label="Requires Approval" value={form.requiresApproval ? "Yes" : "No"} />
            <DetailItem label="Min Days Notice" value={form.minDaysBeforeRequest ? `${form.minDaysBeforeRequest} days` : "None"} />
            <DetailItem label="Max Consecutive" value={form.maxConsecutiveDays ? `${form.maxConsecutiveDays} days` : "Unlimited"} />
            <DetailItem
              label="Gender Restriction"
              value={form.genderRestriction
                ? form.genderRestriction.charAt(0).toUpperCase() + form.genderRestriction.slice(1)
                : "None"}
            />
            <DetailItem label="Status" value={form.status} badge={form.status === "active" ? "success" : "warning"} />
            <DetailItem label="Color" value={form.color}>
              <div
                className="h-5 w-5 rounded border border-border"
                style={{ backgroundColor: form.color }}
              />
            </DetailItem>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════
         DELETE CONFIRMATION DIALOG
         ══════════════════════════════════════════════════ */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10">
                <Trash2 className="h-4 w-4 text-danger" />
              </div>
              Delete Leave Type
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this leave type? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={mutation.loading}
            >
              {mutation.loading ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

// ── Detail Item Sub-component ───────────────────────────

function DetailItem({
  label,
  value,
  badge,
  children,
}: {
  label: string;
  value: string;
  badge?: "success" | "warning" | "info" | "danger";
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      {children ? (
        <div className="flex items-center gap-2">{children}</div>
      ) : badge ? (
        <Badge
          variant={`subtle-${badge}` as any}
          size="sm"
          className="font-medium"
        >
          {value}
        </Badge>
      ) : (
        <p className="text-sm font-medium text-dark dark:text-white">{value}</p>
      )}
    </div>
  );
}
