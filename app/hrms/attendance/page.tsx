"use client";

import { useState, useMemo, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { FormSection } from "@/components/ui/form-section";
import { FormActions } from "@/components/ui/form-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import type { Column, Action } from "@/components/shared/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Download,
  Plus,
  Pencil,
  Trash2,
  User,
  LogIn,
  LogOut,
} from "lucide-react";
import { useAttendance } from "@/hooks/hrm/use-attendance";
import { useMutation } from "@/hooks/use-mutation";
import { formatDate } from "@/lib/utils";

const statusConfig: Record<string, { label: string; variant: "success" | "danger" | "warning" | "info" | "primary" }> = {
  present: { label: "Present", variant: "success" },
  absent: { label: "Absent", variant: "danger" },
  half_day: { label: "Half Day", variant: "warning" },
  late: { label: "Late", variant: "warning" },
  week_off: { label: "Week Off", variant: "info" },
  holiday: { label: "Holiday", variant: "info" },
  on_leave: { label: "On Leave", variant: "primary" },
};

const ATTENDANCE_STATUSES = ["present", "absent", "half_day", "late", "week_off", "holiday", "on_leave"];

const emptyForm = { userId: "", date: "", checkIn: "", checkOut: "", status: "present", shiftId: "" };

export default function AttendancePage() {
  const { data: records, loading, error, refetch } = useAttendance();
  const mutation = useMutation();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const resetForm = useCallback(() => setForm(emptyForm), []);

  const handleAdd = async () => {
    const result = await mutation.createRecord("/api/hrm/v2/attendance", {
      ...form,
      date: form.date || new Date().toISOString().split("T")[0],
      calculateStats: true,
    });
    if (result) {
      setShowAddDialog(false);
      resetForm();
      refetch();
    }
  };

  const handleEdit = async () => {
    if (!selectedRecord) return;
    const result = await mutation.updateRecord(
      `/api/hrm/v2/attendance?id=${selectedRecord.id}`,
      form
    );
    if (result) {
      setShowEditDialog(false);
      setSelectedRecord(null);
      resetForm();
      refetch();
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    const result = await mutation.deleteRecord(
      `/api/hrm/v2/attendance?id=${selectedRecord.id}`
    );
    if (result) {
      setShowDeleteDialog(false);
      setSelectedRecord(null);
      refetch();
    }
  };

  const openEdit = (rec: any) => {
    setSelectedRecord(rec);
    setForm({
      userId: rec.userId || "",
      date: rec.date ? new Date(rec.date).toISOString().split("T")[0] : "",
      checkIn: rec.checkIn ? new Date(rec.checkIn).toISOString().slice(0, 16) : "",
      checkOut: rec.checkOut ? new Date(rec.checkOut).toISOString().slice(0, 16) : "",
      status: rec.status || "present",
      shiftId: rec.shiftId || "",
    });
    setShowEditDialog(true);
  };

  const openDelete = (rec: any) => {
    setSelectedRecord(rec);
    setShowDeleteDialog(true);
  };

  // ── Columns ────────────────────────────────────────────
  const columns: Column<any>[] = useMemo(
    () => [
      {
        key: "userId",
        header: "User ID",
        sortable: true,
        cell: (record: any) => (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-info flex items-center justify-center text-white text-xs font-bold shrink-0">
              {record.userId?.charAt(0) || "?"}
            </div>
            <span className="text-sm font-medium text-dark dark:text-white">{record.userId || "—"}</span>
          </div>
        ),
      },
      {
        key: "date",
        header: "Date",
        sortable: true,
        cell: (record: any) => (
          <span className="text-sm text-muted">{record.date ? formatDate(record.date as any) : "—"}</span>
        ),
      },
      {
        key: "checkIn",
        header: "Check In",
        cell: (record: any) => (
          <span className="text-sm text-muted">{record.checkIn ? formatDate(record.checkIn as any) : "—"}</span>
        ),
      },
      {
        key: "checkOut",
        header: "Check Out",
        cell: (record: any) => (
          <span className="text-sm text-muted">{record.checkOut ? formatDate(record.checkOut as any) : "—"}</span>
        ),
      },
      {
        key: "totalHours",
        header: "Hours",
        sortable: true,
        cell: (record: any) => (
          <span className="text-sm text-muted">{record.totalHours ? `${record.totalHours}h` : "—"}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        cell: (record: any) => {
          const cfg = statusConfig[record.status as keyof typeof statusConfig] || { label: record.status || "—", variant: "info" as const };
          return <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>;
        },
      },
    ],
    []
  );

  // ── Actions ────────────────────────────────────────────
  const actions: Action<any>[] = useMemo(
    () => [
      {
        label: "Edit",
        icon: Pencil,
        onClick: (rec: any) => openEdit(rec),
        variant: "ghost",
      },
      {
        label: "Delete",
        icon: Trash2,
        onClick: (rec: any) => openDelete(rec),
        variant: "ghost",
      },
    ],
    []
  );

  return (
    <AppShell title="Attendance">
      <PageHeader
        title="Attendance"
        description="Track employee attendance, check-ins, and work hours."
      >
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Calendar View
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Present Today", value: "—", color: "text-success", icon: CheckCircle2 },
          { label: "Absent Today", value: "—", color: "text-danger", icon: XCircle },
          { label: "On Leave", value: "—", color: "text-primary", icon: Clock },
          { label: "Late Today", value: "—", color: "text-warning", icon: AlertTriangle },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-dark dark:text-white">{stat.value}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={records ?? []}
        searchable
        searchKeys={["userId"]}
        pageSize={10}
        entriesOptions={[5, 10, 25, 50]}
        loading={loading}
        error={error || undefined}
        onRetry={refetch}
        emptyMessage="No attendance records found"
        actions={actions}
        striped
        stickyHeader
      />

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-md">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Mark Attendance</DialogTitle>
                <DialogDescription>Record attendance for an employee.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
            <div className="space-y-5 max-h-[60vh] overflow-y-auto px-0.5">
              <FormSection title="Employee & Date" icon={<Calendar className="h-4 w-4" />} columns={2} gradient>
                <FormInput label="User ID" icon={<User className="h-4 w-4" />} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} placeholder="user_123" required />
                <FormInput label="Date" type="date" icon={<Calendar className="h-4 w-4" />} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </FormSection>
              <FormSection title="Timings" icon={<Clock className="h-4 w-4" />} columns={2}>
                <FormInput label="Check In" type="datetime-local" icon={<LogIn className="h-4 w-4" />} value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
                <FormInput label="Check Out" type="datetime-local" icon={<LogOut className="h-4 w-4" />} value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
              </FormSection>
              <FormSection title="Status" columns={1}>
                <FormSelect label="Status" icon={<Clock className="h-4 w-4" />} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={ATTENDANCE_STATUSES.map((s) => ({ value: s, label: s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) }))} />
              </FormSection>
            </div>
            <FormActions onCancel={() => setShowAddDialog(false)} submitLabel="Save Record" submitIcon={<CheckCircle2 className="h-4 w-4" />} loading={mutation.loading} error={mutation.error} />
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-md">
                <Pencil className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Edit Attendance</DialogTitle>
                <DialogDescription>Update attendance record details.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
            <div className="space-y-5 max-h-[60vh] overflow-y-auto px-0.5">
              <FormSection title="Employee & Date" icon={<Calendar className="h-4 w-4" />} columns={2}>
                <FormInput label="Date" type="date" icon={<Calendar className="h-4 w-4" />} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </FormSection>
              <FormSection title="Timings" icon={<Clock className="h-4 w-4" />} columns={2}>
                <FormInput label="Check In" type="datetime-local" icon={<LogIn className="h-4 w-4" />} value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
                <FormInput label="Check Out" type="datetime-local" icon={<LogOut className="h-4 w-4" />} value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
              </FormSection>
              <FormSection title="Status" columns={1}>
                <FormSelect label="Status" icon={<Clock className="h-4 w-4" />} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={ATTENDANCE_STATUSES.map((s) => ({ value: s, label: s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) }))} />
              </FormSection>
            </div>
            <FormActions onCancel={() => setShowEditDialog(false)} submitLabel="Save Changes" submitIcon={<Pencil className="h-4 w-4" />} loading={mutation.loading} error={mutation.error} />
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-danger text-white shadow-md">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Delete Record</DialogTitle>
                <DialogDescription>Are you sure you want to delete this attendance record? This cannot be undone.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <FormActions onCancel={() => setShowDeleteDialog(false)} submitLabel="Delete" submitIcon={<Trash2 className="h-4 w-4" />} submitVariant="danger" loading={mutation.loading} error={mutation.error} sticky={false} />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
