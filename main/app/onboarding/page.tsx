"use client";

import { useState, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
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
import { FormSection } from "@/components/ui/form-section";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { FormTextarea } from "@/components/ui/form-textarea";
import { FormActions } from "@/components/ui/form-actions";
import {
  UserCheck,
  Plus,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Pencil,
  Trash2,
  Layers,
  ToggleLeft,
} from "lucide-react";
import { useOnboardingPrograms, useOnboardingDashboard } from "@/hooks/hrm/use-onboarding";
import { useMutation } from "@/hooks/use-mutation";

const statusColors: Record<string, "success" | "warning" | "danger" | "info" | "primary"> = {
  active: "success",
  inactive: "info",
};

const emptyForm = { name: "", description: "", departmentId: "", isDefault: "false", status: "active", tasks: "[]" };

export default function OnboardingPage() {
  const { data: programs, loading, error, refetch } = useOnboardingPrograms();
  const { data: dashboard } = useOnboardingDashboard();
  const mutation = useMutation();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const resetForm = useCallback(() => setForm(emptyForm), []);

  const handleAdd = async () => {
    const result = await mutation.createRecord("/api/hrm/v2/onboarding", {
      name: form.name, description: form.description, departmentId: form.departmentId || undefined,
      isDefault: form.isDefault === "true", status: form.status, tasks: form.tasks ? JSON.parse(form.tasks) : [],
    });
    if (result) { setShowAddDialog(false); resetForm(); refetch(); }
  };

  const handleEdit = async () => {
    if (!selectedProgram) return;
    const result = await mutation.updateRecord(`/api/hrm/v2/onboarding?id=${selectedProgram.id}`, {
      name: form.name, description: form.description, departmentId: form.departmentId || undefined,
      isDefault: form.isDefault === "true", status: form.status, tasks: form.tasks ? JSON.parse(form.tasks) : [],
    });
    if (result) { setShowEditDialog(false); setSelectedProgram(null); resetForm(); refetch(); }
  };

  const handleDelete = async () => {
    if (!selectedProgram) return;
    const result = await mutation.deleteRecord(`/api/hrm/v2/onboarding?id=${selectedProgram.id}`);
    if (result) { setShowDeleteDialog(false); setSelectedProgram(null); refetch(); }
  };

  const openEdit = (program: any) => {
    setSelectedProgram(program);
    setForm({
      name: program.name || "", description: program.description || "", departmentId: program.departmentId || "",
      isDefault: program.isDefault ? "true" : "false", status: program.status || "active", tasks: JSON.stringify(program.tasks || []),
    });
    setShowEditDialog(true);
  };

  const safeDashboard = dashboard || { totalPrograms: 0, activeOnboardings: 0, pendingTasks: 0, overdueTasks: 0 };

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Program",
      sortable: true,
      cell: (p: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-dark dark:text-white">{p.name}</p>
            <p className="text-xs text-muted">{p.tasks?.length || 0} tasks</p>
          </div>
        </div>
      ),
    },
    {
      key: "departmentId",
      header: "Department",
      cell: (p: any) => <span className="text-sm text-muted">{p.departmentId || "All"}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (p: any) => (
        <Badge variant={statusColors[p.status as keyof typeof statusColors] || "info"} size="sm">{p.status}</Badge>
      ),
    },
    {
      key: "isDefault",
      header: "Default",
      sortable: true,
      cell: (p: any) => (
        <Badge variant={p.isDefault ? "success" : "subtle"} size="sm">{p.isDefault ? "Yes" : "No"}</Badge>
      ),
    },
  ];

  const actions: Action<any>[] = [
    { label: "Edit", icon: Pencil, onClick: (p: any) => openEdit(p), variant: "ghost" },
    { label: "Delete", icon: Trash2, onClick: (p: any) => { setSelectedProgram(p); setShowDeleteDialog(true); }, variant: "ghost" },
  ];

  return (
    <AppShell title="Onboarding">
      <PageHeader
        title="Onboarding"
        description="Manage new employee onboarding — programs, tasks, and progress tracking."
      >
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          New Program
        </Button>
      </PageHeader>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Programs", value: safeDashboard.activeOnboardings, icon: UserCheck, color: "text-primary" },
          { label: "In Progress", value: safeDashboard.pendingTasks, icon: Clock, color: "text-warning" },
          { label: "Total Programs", value: safeDashboard.totalPrograms, icon: ClipboardList, color: "text-info" },
          { label: "Overdue Tasks", value: safeDashboard.overdueTasks, icon: AlertCircle, color: "text-danger" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-dark dark:text-white">{stat.value}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={programs ?? []}
        searchable
        searchKeys={["name", "departmentId"]}
        pageSize={10}
        loading={loading}
        error={error || undefined}
        onRetry={refetch}
        emptyMessage="No onboarding programs yet"
        actions={actions}
        striped
        stickyHeader
      />

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              New Onboarding Program
            </DialogTitle>
            <DialogDescription>Create a new employee onboarding program.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} className="space-y-6">
            <FormSection title="Program Details" icon={<ClipboardList className="h-4 w-4" />} columns={2}>
              <FormInput label="Program Name" icon={<UserCheck className="h-4 w-4" />} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Standard Onboarding" />
              <FormInput label="Department ID" icon={<Users className="h-4 w-4" />} value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} placeholder="engineering" />
              <FormSelect label="Status" icon={<ToggleLeft className="h-4 w-4" />} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
              <FormSelect label="Default Program" icon={<CheckCircle2 className="h-4 w-4" />} value={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.value })} options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]} />
            </FormSection>
            <FormSection title="Description" icon={<ClipboardList className="h-4 w-4" />}>
              <FormTextarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the onboarding program..." />
            </FormSection>
            <FormSection title="Tasks Configuration" icon={<Layers className="h-4 w-4" />}>
              <FormTextarea label="Tasks (JSON array)" value={form.tasks} onChange={(e) => setForm({ ...form, tasks: e.target.value })} placeholder='[{"title":"Submit ID","assignedTo":"employee","dueDaysAfterJoining":1,"isMandatory":true}]' className="font-mono text-xs" />
            </FormSection>
            {mutation.error && <div className="p-3 text-sm text-danger bg-danger/10 rounded-lg border border-danger/20">{mutation.error}</div>}
            <FormActions onCancel={() => setShowAddDialog(false)} submitLabel="Create Program" loading={mutation.loading} />
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Pencil className="h-4 w-4 text-primary" />
              </div>
              Edit Program
            </DialogTitle>
            <DialogDescription>Update the onboarding program details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-6">
            <FormSection title="Program Details" icon={<ClipboardList className="h-4 w-4" />} columns={2}>
              <FormInput label="Program Name" icon={<UserCheck className="h-4 w-4" />} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Standard Onboarding" />
              <FormInput label="Department ID" icon={<Users className="h-4 w-4" />} value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} placeholder="engineering" />
              <FormSelect label="Status" icon={<ToggleLeft className="h-4 w-4" />} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
              <FormSelect label="Default Program" icon={<CheckCircle2 className="h-4 w-4" />} value={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.value })} options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]} />
            </FormSection>
            <FormSection title="Description" icon={<ClipboardList className="h-4 w-4" />}>
              <FormTextarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the onboarding program..." />
            </FormSection>
            <FormSection title="Tasks Configuration" icon={<Layers className="h-4 w-4" />}>
              <FormTextarea label="Tasks (JSON array)" value={form.tasks} onChange={(e) => setForm({ ...form, tasks: e.target.value })} placeholder='[{"title":"Submit ID","assignedTo":"employee","dueDaysAfterJoining":1,"isMandatory":true}]' className="font-mono text-xs" />
            </FormSection>
            {mutation.error && <div className="p-3 text-sm text-danger bg-danger/10 rounded-lg border border-danger/20">{mutation.error}</div>}
            <FormActions onCancel={() => setShowEditDialog(false)} submitLabel="Save Changes" loading={mutation.loading} />
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10">
                <Trash2 className="h-4 w-4 text-danger" />
              </div>
              Delete Program
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedProgram?.name || "this program"}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {mutation.error && <div className="p-3 text-sm text-danger bg-danger/10 rounded-lg border border-danger/20 mb-4">{mutation.error}</div>}
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)} disabled={mutation.loading}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={mutation.loading}><Trash2 className="h-4 w-4 mr-1.5" />Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
