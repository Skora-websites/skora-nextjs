"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Palette,
  Building2,
  Save,
  Users,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  Info,
  Plus,
  Trash2,
  History,
  ToggleLeft,
  Lock,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/providers/auth-provider";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTheme, THEME_COLORS } from "@/hooks/use-theme";

// ── Types ──────────────────────────────────────────────

interface ManagedUser {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  loginStatus: string;
}

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin", description: "Full system access" },
  { value: "admin", label: "Admin", description: "Employee & HR operations" },
  { value: "employee", label: "Employee", description: "Self-service access" },
] as const;

const ROLE_BADGE_VARIANTS: Record<string, "primary" | "warning" | "info" | "success" | "danger"> = {
  super_admin: "primary",
  admin: "warning",
  employee: "success",
};

const settingsTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "roles", label: "Roles", icon: ShieldCheck },
];

// ── Helpers ────────────────────────────────────────────

function formatDate(date: Date | string | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Settings Content Components ─────────────────────────

function ProfileTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary text-white text-xl font-bold">
            SW
          </div>
          <div>
            <h5 className="text-dark dark:text-white font-bold">
              Sarah Wilson
            </h5>
            <p className="text-sm text-muted">Administrator</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto">
            Change Avatar
          </Button>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-dark dark:text-white">
              First Name
            </label>
            <Input defaultValue="Sarah" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-dark dark:text-white">
              Last Name
            </label>
            <Input defaultValue="Wilson" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-dark dark:text-white">
              Email
            </label>
            <Input defaultValue="sarah@crm.pro" type="email" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-dark dark:text-white">
              Phone
            </label>
            <Input defaultValue="+1 (555) 123-4567" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="primary">
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { title: "New lead assigned", desc: "When a new lead is assigned to you" },
          { title: "Deal updates", desc: "When a deal changes stage or value" },
          { title: "Email notifications", desc: "Receive daily digest via email" },
          { title: "Meeting reminders", desc: "15 minutes before scheduled meetings" },
          { title: "Task due alerts", desc: "When a task is approaching its due date" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
          >
            <div>
              <p className="text-sm font-semibold text-dark dark:text-white">
                {item.title}
              </p>
              <p className="text-xs text-muted mt-0.5">{item.desc}</p>
            </div>
            <Switch defaultChecked={i < 3} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SecurityTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-dark dark:text-white">
            Current Password
          </label>
          <Input type="password" placeholder="Enter current password" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-dark dark:text-white">
              New Password
            </label>
            <Input type="password" placeholder="Enter new password" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-dark dark:text-white">
              Confirm Password
            </label>
            <Input type="password" placeholder="Confirm new password" />
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-dark dark:text-white">
              Two-Factor Authentication
            </p>
            <p className="text-xs text-muted mt-0.5">
              Add an extra layer of security
            </p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-dark dark:text-white">
              Active Sessions
            </p>
            <p className="text-xs text-muted mt-0.5">
              2 active sessions
            </p>
          </div>
          <Badge variant="info" size="sm">
            Manage
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function AppearanceTab() {
  const { theme, toggleTheme, config, updateConfig } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-dark dark:text-white">
              Dark Mode
            </p>
            <p className="text-xs text-muted mt-0.5">
              Toggle dark/light theme
            </p>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>
        <Separator />
        <div>
          <p className="text-sm font-semibold text-dark dark:text-white mb-3">
            Theme Color
          </p>
          <div className="flex gap-3">
            {Object.keys(THEME_COLORS).map((color) => {
              const isActive = config.primaryColor === color;
              return (
                <button
                  key={color}
                  onClick={() => updateConfig({ primaryColor: color })}
                  className={`relative h-10 w-10 rounded-full transition-all duration-200 hover:scale-110 ${
                    isActive
                      ? "scale-110 ring-2 ring-offset-2 ring-[var(--color-primary)]"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {isActive && (
                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-dark dark:text-white">
              Compact Mode
            </p>
            <p className="text-xs text-muted mt-0.5">
              Reduce spacing for denser layouts
            </p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}

function OrganizationTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-dark dark:text-white">
              Company Name
            </label>
            <Input defaultValue="CRM.pro Inc." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-dark dark:text-white">
              Industry
            </label>
            <Input defaultValue="Software & Technology" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-dark dark:text-white">
              Address
            </label>
            <Input defaultValue="123 Business Ave, Suite 400, San Francisco, CA 94105" />
          </div>
        </div>
        <Separator />
        <div className="space-y-3">
          <p className="text-sm font-semibold text-dark dark:text-white">
            Team Members
          </p>
          {[
            { name: "Sarah Wilson", role: "Admin", email: "sarah@crm.pro" },
            { name: "Mike Chen", role: "Manager", email: "mike@crm.pro" },
            { name: "Emily Davis", role: "Agent", email: "emily@crm.pro" },
          ].map((member, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-white text-xs font-bold">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-dark dark:text-white">
                  {member.name}
                </p>
                <p className="text-xs text-muted">{member.email}</p>
              </div>
              <Badge
                variant={
                  member.role === "Admin"
                    ? "warning"
                    : member.role === "Manager"
                    ? "info"
                    : "success"
                }
                size="sm"
              >
                {member.role}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RolesTab() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/hrm/v2/auth?action=users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/hrm/v2/auth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setSuccessMsg("Role updated successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  // ── Permission Matrix State ────────────────────────────
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const [permissionData, setPermissionData] = useState<{
    roles: { key: string; label: string; permissions: string[]; permissionCount: number; isSystem: boolean; isCustom: boolean; firestoreId?: string }[];
    allPermissions: string[];
    permissionTree: { key: string; label: string; children?: { key: string; label: string }[] }[];
    auditLogs: any[];
  } | null>(null);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [permissionToggling, setPermissionToggling] = useState<string | null>(null);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  // ── Custom Role Dialog State ────────────────────────────
  const [showCustomRoleDialog, setShowCustomRoleDialog] = useState(false);
  const [customRoleForm, setCustomRoleForm] = useState<{
    name: string;
    displayName: string;
    description: string;
    selectedPermissions: Set<string>;
  }>({ name: "", displayName: "", description: "", selectedPermissions: new Set() });
  const [creatingRole, setCreatingRole] = useState(false);
  const [deletingRole, setDeletingRole] = useState<string | null>(null);

  const fetchPermissionData = useCallback(async () => {
    if (permissionData) {
      setShowPermissionMatrix(!showPermissionMatrix);
      return;
    }
    setPermissionLoading(true);
    try {
      const res = await fetch("/api/auth/permissions");
      if (!res.ok) throw new Error("Failed to fetch permissions");
      const json = await res.json();
      setPermissionData(json.data);
      setShowPermissionMatrix(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPermissionLoading(false);
    }
  }, [permissionData, showPermissionMatrix]);

  // ── Permission Toggle Handler ──────────────────────────
  const handlePermissionToggle = async (roleKey: string, permission: string, enabled: boolean) => {
    if (!permissionData) return;
    setPermissionToggling(`${roleKey}:${permission}`);

    const role = permissionData.roles.find((r) => r.key === roleKey);
    if (!role) return;

    const updatedPermissions = enabled
      ? [...role.permissions, permission]
      : role.permissions.filter((p) => p !== permission);

    // Optimistic update
    setPermissionData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        roles: prev.roles.map((r) =>
          r.key === roleKey
            ? { ...r, permissions: updatedPermissions, permissionCount: updatedPermissions.length }
            : r
        ),
      };
    });

    try {
      const res = await fetch("/api/auth/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleKey, permissions: updatedPermissions }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update permissions");
      }
    } catch (err: any) {
      setError(err.message);
      // Rollback optimistic update by refetching
      fetchPermissionData();
    } finally {
      setPermissionToggling(null);
    }
  };

  // ── Create Custom Role Handler ─────────────────────────
  const handleCreateCustomRole = async () => {
    if (!customRoleForm.name || !customRoleForm.displayName) {
      setError("Role name and display name are required");
      return;
    }
    setCreatingRole(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_role",
          name: customRoleForm.name,
          displayName: customRoleForm.displayName,
          description: customRoleForm.description,
          permissions: Array.from(customRoleForm.selectedPermissions),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create role");
      }
      setShowCustomRoleDialog(false);
      setCustomRoleForm({ name: "", displayName: "", description: "", selectedPermissions: new Set() });
      setSuccessMsg("Custom role created successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
      // Refresh permission data
      fetchPermissionData();
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setCreatingRole(false);
    }
  };

  // ── Delete Custom Role Handler ─────────────────────────
  const handleDeleteCustomRole = async (roleKey: string) => {
    setDeletingRole(roleKey);
    setError(null);
    try {
      const res = await fetch("/api/auth/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_role", role: roleKey }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete role");
      }
      setSuccessMsg(`Role "${roleKey}" deleted successfully`);
      setTimeout(() => setSuccessMsg(null), 3000);
      // Refresh permission data
      fetchPermissionData();
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeletingRole(null);
    }
  };

  // ── Custom Role Form Helpers ───────────────────────────
  const togglePermissionInForm = (perm: string) => {
    setCustomRoleForm((prev) => {
      const next = new Set(prev.selectedPermissions);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return { ...prev, selectedPermissions: next };
    });
  };

  const selectAllPermissions = () => {
    if (!permissionData) return;
    setCustomRoleForm((prev) => ({
      ...prev,
      selectedPermissions: new Set(permissionData.allPermissions),
    }));
  };

  const clearAllPermissions = () => {
    setCustomRoleForm((prev) => ({
      ...prev,
      selectedPermissions: new Set(),
    }));
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Color coding for permission check
  const getPermissionColor = (roleKey: string): string => {
    if (roleKey === "super_admin") return "text-primary";
    if (roleKey === "admin") return "text-warning";
    return "text-success";
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-start gap-3 p-4">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-dark dark:text-white">
              Role Management
            </p>
            <p className="text-xs text-muted mt-0.5">
              Assign roles to users. <strong>Super Admin</strong> has full access,{" "}
              <strong>Admin</strong> manages employees &amp; HR, and{" "}
              <strong>Employee</strong> has self-service access.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Success / Error Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 text-sm text-success bg-success/10 rounded-lg border border-success/20">
          <CheckCircle2 className="h-4 w-4" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-danger bg-danger/10 rounded-lg border border-danger/20">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Users List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              {users.length} user{users.length !== 1 ? "s" : ""} in your organization
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2 text-muted">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <p className="text-sm">Loading users...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2 text-muted">
                <Users className="h-8 w-8" />
                <p className="text-sm">No users found</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {/* Header row (desktop) */}
              <div className="hidden md:flex items-center gap-4 px-6 py-3 text-xxs font-bold text-muted uppercase tracking-wider">
                <div className="flex-1">User</div>
                <div className="w-28">Current Role</div>
                <div className="w-40">Change Role</div>
                <div className="w-24 text-center">Status</div>
              </div>

              {users.map((u) => (
                <div
                  key={u.id}
                  className={`flex flex-col md:flex-row md:items-center gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    u.id === updatingId ? "opacity-60" : ""
                  }`}
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-white text-xs font-bold">
                      {getInitials(u.displayName || u.firstName, u.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-dark dark:text-white truncate">
                        {u.displayName || u.firstName || u.email}
                      </p>
                      <p className="text-xs text-muted truncate">{u.email}</p>
                    </div>
                  </div>

                  {/* Current role badge */}
                  <div className="md:w-28">
                    <Badge
                      variant={ROLE_BADGE_VARIANTS[u.role] || "info"}
                      size="sm"
                      className="capitalize"
                    >
                      {u.role.replace("_", " ")}
                    </Badge>
                  </div>

                  {/* Role selector */}
                  <div className="md:w-40">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === updatingId || u.id === user?.id}
                      className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      title={
                        u.id === user?.id
                          ? "You cannot change your own role"
                          : "Assign role"
                      }
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="md:w-24 text-center">
                    <Badge
                      variant={u.status === "active" ? "success" : "danger"}
                      size="sm"
                    >
                      {u.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permission Matrix Toggle */}
      <Card className="border-primary/20">
        <CardContent className="p-0">
          <button
            onClick={fetchPermissionData}
            disabled={permissionLoading}
            className="w-full flex items-center justify-between p-4 hover:bg-primary/[0.03] transition-colors rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-dark dark:text-white">
                  Permission Matrix
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {showPermissionMatrix
                    ? "Hide the detailed permission matrix"
                    : "View which permissions each role has across all modules"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {permissionLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <ChevronDown
                  className={`h-4 w-4 text-muted transition-transform duration-200 ${
                    showPermissionMatrix ? "rotate-180" : ""
                  }`}
                />
              )}
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Permission Matrix Content */}
      {showPermissionMatrix && permissionData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Summary badges */}
          <div className="flex flex-wrap gap-3 mb-4">
            {permissionData.roles.map((r) => (
              <div
                key={r.key}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 bg-card text-sm"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {r.label}
                </span>
                <span className="font-bold text-dark dark:text-white">
                  {r.permissionCount}
                </span>
                <span className="text-xs text-muted">permissions</span>
              </div>
            ))}
          </div>

          {/* Permission Tree Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Permission Matrix</CardTitle>
              <CardDescription>
                Each row shows a permission group. Expand to see individual permissions and which roles have access.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {/* Header */}
                <div className="hidden md:flex items-center px-4 py-3 text-xxs font-bold text-muted uppercase tracking-wider bg-gray-50 dark:bg-gray-800/30">
                  <div className="flex-1 min-w-0">Permission</div>
                  {permissionData.roles.map((r) => (
                    <div key={r.key} className="w-28 text-center">
                      <span className="text-xs">{r.label}</span>
                    </div>
                  ))}
                </div>

                {/* Permission groups */}
                {permissionData.permissionTree.map((group) => {
                  const isExpanded = expandedGroups.has(group.key);
                  return (
                    <div key={group.key}>
                      {/* Group header */}
                      <button
                        onClick={() => toggleGroup(group.key)}
                        className="w-full flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <ChevronDown
                            className={`h-3 w-3 text-muted transition-transform duration-200 shrink-0 ${
                              isExpanded ? "rotate-0" : "-rotate-90"
                            }`}
                          />
                          <span className="text-sm font-semibold text-dark dark:text-white">
                            {group.label}
                          </span>
                          <span className="text-xs text-muted">
                            (                          {group.children?.length || 0} permissions)
                          </span>
                        </div>
                        {permissionData.roles.map((r) => {
                          const hasAll = group.children?.every(
                            (child) => r.key === "super_admin" || r.permissions.includes(child.key)
                          );
                          return (
                            <div key={r.key} className="w-28 text-center hidden md:block">
                              {r.key === "super_admin" || hasAll ? (
                                <Check className={`h-4 w-4 mx-auto ${getPermissionColor(r.key)}`} />
                              ) : (
                                <span className="text-xs text-muted">
                                  {group.children?.filter((c) => r.permissions.includes(c.key)).length || 0}
                                  /{group.children?.length || 0}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </button>

                      {/* Expanded children with interactive toggles */}
                      {isExpanded && group.children && (
                        <div className="bg-gray-50/50 dark:bg-gray-800/20">
                          {group.children.map((child) => (
                            <div
                              key={child.key}
                              className="flex items-center px-4 py-2.5 pl-10 border-t border-border/30 text-sm"
                            >
                              <div className="flex-1 min-w-0">
                                <span className="text-muted">{child.label}</span>
                                <span className="text-xxs text-muted/50 ml-2 font-mono">
                                  ({child.key})
                                </span>
                              </div>
                              {permissionData.roles.map((r) => {
                                const isSuperAdmin = r.key === "super_admin";
                                const isSystemRole = r.isSystem && !isSuperAdmin;
                                const hasPerm = isSuperAdmin || r.permissions.includes(child.key);
                                const toggleId = `${r.key}:${child.key}`;
                                const isLoading = permissionToggling === toggleId;

                                return (
                                  <div key={r.key} className="w-28 flex items-center justify-center hidden md:flex">
                                    {isSuperAdmin ? (
                                      <span title="Super Admin — always enabled">
                                        <Lock className="h-3.5 w-3.5 text-primary/40" />
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        <Switch
                                          checked={hasPerm}
                                          onCheckedChange={(checked) =>
                                            handlePermissionToggle(r.key, child.key, checked)
                                          }
                                          disabled={isLoading}
                                          className={`scale-75 ${isLoading ? "opacity-50" : ""}`}
                                          id={toggleId}
                                        />
                                        {isLoading && (
                                          <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 px-4 py-3">
              <div className="flex items-center gap-4 text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-primary" /> = Has permission
                </div>
                <div className="flex items-center gap-1.5">
                  <ToggleLeft className="h-3 w-3 text-muted" /> = Toggle on/off
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-primary/40" /> = Super Admin (locked)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium">2/4</span> = Partial access
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Create Custom Role */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-dark dark:text-white">
            Custom Roles
          </p>
          <p className="text-xs text-muted mt-0.5">
            Create new roles with custom permission sets
          </p>
        </div>
        <Dialog open={showCustomRoleDialog} onOpenChange={setShowCustomRoleDialog}>
          <DialogTrigger asChild>
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create Custom Role
            </Button>
          </DialogTrigger>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>Create Custom Role</DialogTitle>
              <DialogDescription>
                Define a new role with granular permissions. Custom roles appear alongside system roles.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-dark dark:text-white">
                    Role Key <span className="text-danger">*</span>
                  </label>
                  <Input
                    placeholder="e.g., department_head"
                    value={customRoleForm.name}
                    onChange={(e) =>
                      setCustomRoleForm((prev) => ({
                        ...prev,
                        name: e.target.value.toLowerCase().replace(/[^a-z_]/g, "_"),
                      }))
                    }
                  />
                  <p className="text-xs text-muted">
                    Unique identifier (lowercase, no spaces)
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-dark dark:text-white">
                    Display Name <span className="text-danger">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Department Head"
                    value={customRoleForm.displayName}
                    onChange={(e) =>
                      setCustomRoleForm((prev) => ({
                        ...prev,
                        displayName: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-dark dark:text-white">
                  Description
                </label>
                <Input
                  placeholder="What this role can do..."
                  value={customRoleForm.description}
                  onChange={(e) =>
                    setCustomRoleForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <Separator />

              {/* Permissions selector */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-dark dark:text-white">
                  Permissions
                  <span className="text-xs text-muted font-normal ml-2">
                    ({customRoleForm.selectedPermissions.size} selected)
                  </span>
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="xs" onClick={selectAllPermissions}>
                    Select All
                  </Button>
                  <Button variant="ghost" size="xs" onClick={clearAllPermissions}>
                    Clear
                  </Button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1 border border-border/50 rounded-lg p-2">
                {permissionData?.permissionTree.map((group) => (
                  <div key={group.key}>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider px-2 py-1.5">
                      {group.label}
                    </p>
                    {group.children?.map((child) => (
                      <label
                        key={child.key}
                        className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded-lg cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={customRoleForm.selectedPermissions.has(child.key)}
                          onChange={() => togglePermissionInForm(child.key)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span>{child.label}</span>
                        <span className="text-xxs text-muted/50 ml-auto font-mono">
                          {child.key}
                        </span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" size="sm">Cancel</Button>
              </DialogClose>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateCustomRole}
                loading={creatingRole}
                disabled={!customRoleForm.name || !customRoleForm.displayName}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Custom Roles List */}
      {permissionData && permissionData.roles.filter((r) => r.isCustom).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Custom Roles</CardTitle>
            <CardDescription>
              Roles created by Super Admin with custom permission sets.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {permissionData.roles
                .filter((r) => r.isCustom)
                .map((customRole) => (
                  <div
                    key={customRole.key}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary/10 text-primary text-xs font-bold">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-dark dark:text-white">
                          {customRole.label}
                        </p>
                        <p className="text-xs text-muted">
                          {customRole.permissionCount} permissions · key: {customRole.key}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="xs"
                      onClick={() => handleDeleteCustomRole(customRole.key)}
                      loading={deletingRole === customRole.key}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs */}
      <Card>
        <CardContent className="p-0">
          <button
            onClick={() => setShowAuditLogs(!showAuditLogs)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <History className="h-5 w-5 text-warning" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-dark dark:text-white">
                  Audit Logs
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {showAuditLogs
                    ? "Hide recent role and permission changes"
                    : "View recent role assignment and permission changes"}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted transition-transform duration-200 ${
                showAuditLogs ? "rotate-180" : ""
              }`}
            />
          </button>
        </CardContent>
      </Card>

      {showAuditLogs && permissionData?.auditLogs && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="p-0">
              {permissionData.auditLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted">
                  <History className="h-8 w-8 mb-2" />
                  <p className="text-sm">No audit logs yet</p>
                  <p className="text-xs mt-1">
                    Role and permission changes will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {permissionData.auditLogs.map((log: any, idx: number) => (
                    <div key={log.id || idx} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-dark dark:text-white">
                            {log.details || "Role change"}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                            <span>{log.performedByName || "System"}</span>
                            <span>·</span>
                            <span>{formatDate(log.createdAt)}</span>
                            {log.targetUserEmail && (
                              <>
                                <span>·</span>
                                <span>{log.targetUserEmail}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROLE_OPTIONS.map((role) => (
              <div
                key={role.value}
                className="p-4 rounded-lg border border-border/50 bg-gray-50 dark:bg-gray-800/30"
              >
                <Badge
                  variant={ROLE_BADGE_VARIANTS[role.value] || "info"}
                  size="sm"
                  className="mb-2 capitalize"
                >
                  {role.label}
                </Badge>
                <p className="text-xs text-muted">{role.description}</p>
                <div className="mt-2 text-xxs text-muted/60">
                  {role.value === "super_admin" && (
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Full system access</li>
                      <li>Manage admins &amp; employees</li>
                      <li>Settings &amp; permissions</li>
                      <li>All reports &amp; analytics</li>
                    </ul>
                  )}
                  {role.value === "admin" && (
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Manage employees</li>
                      <li>Attendance &amp; leave</li>
                      <li>Payroll &amp; organization</li>
                      <li>HR operations</li>
                    </ul>
                  )}
                  {role.value === "employee" && (
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Own profile</li>
                      <li>Attendance &amp; leave requests</li>
                      <li>Assigned assets</li>
                      <li>Documents &amp; engage</li>
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Settings Page ─────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  // Filter tabs based on role — roles tab is super_admin only
  const visibleTabs = settingsTabs.filter(
    (tab) => tab.id !== "roles" || isSuperAdmin
  );

  return (
    <AppShell title="Settings">
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs (desktop) */}
        <div className="hidden lg:flex flex-col w-64 shrink-0">
          <Card>
            <CardContent className="p-2 space-y-1">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-primary text-white shadow-sm"
                        : "text-muted hover:text-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Mobile tabs */}
        <div className="lg:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full overflow-x-auto flex-nowrap">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex-col gap-1 py-2 shrink-0">
                    <Icon className="h-4 w-4" />
                    <span className="text-xxs">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "appearance" && <AppearanceTab />}
          {activeTab === "organization" && <OrganizationTab />}
          {activeTab === "roles" && <RolesTab />}
        </div>
      </div>
    </AppShell>
  );
}
