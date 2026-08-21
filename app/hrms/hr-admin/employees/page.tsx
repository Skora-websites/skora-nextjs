"use client"

import { useState, useEffect } from "react";
import { Users, Search, Plus, Edit3, Trash2, Mail, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

interface Employee { id: string; name: string; email: string; department: string; designation: string; status: string; employeeCode?: string; reportingManager?: string; employmentType?: string }

export default function HrAdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: "", email: "", department: "", designation: "", reportingManager: "", employmentType: "permanent" });
  const [adding, setAdding] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [editData, setEditData] = useState({ name: "", department: "", designation: "", reportingManager: "", status: "active" });
  const [editing, setEditing] = useState(false);
  const [deleteEmp, setDeleteEmp] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => { setLoading(true); try { const res = await fetch("/api/hrm/v2/employees"); if (res.ok) setEmployees((await res.json()).data || []); } catch {} setLoading(false); };

  const filtered = employees.filter((e) => {
    const ms = (e.name || "").toLowerCase().includes(search.toLowerCase()) || (e.email || "").toLowerCase().includes(search.toLowerCase()) || ((e.employeeCode || "").toLowerCase().includes(search.toLowerCase()));
    const md = filterDept === "all" || e.department === filterDept;
    return ms && md;
  });

  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))];

  const handleAdd = async (ev: React.FormEvent) => {
    ev.preventDefault(); setAdding(true);
    try { const res = await fetch("/api/hrm/v2/employees", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(newEmp) });
      if (res.ok) { setShowAdd(false); setNewEmp({name:"",email:"",department:"",designation:"",reportingManager:"",employmentType:"permanent"}); setSuccessMsg("Employee added!"); setTimeout(() => setSuccessMsg(null), 3000); loadEmployees(); }
    } catch {} setAdding(false);
  };

  const openEdit = (emp: Employee) => { setEditEmp(emp); setEditData({name:emp.name,department:emp.department,designation:emp.designation,reportingManager:emp.reportingManager||"",status:emp.status}); };

  const handleEdit = async () => {
    if (!editEmp) return; setEditing(true);
    try { const res = await fetch("/api/hrm/v2/employees", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({id:editEmp.id,...editData}) });
      if (res.ok) { setEditEmp(null); setSuccessMsg("Employee updated!"); setTimeout(() => setSuccessMsg(null), 3000); loadEmployees(); }
    } catch {} setEditing(false);
  };

  const handleDelete = async () => {
    if (!deleteEmp) return; setDeleting(true);
    try { const res = await fetch("/api/hrm/v2/employees", { method: "DELETE", headers: {"Content-Type":"application/json"}, body: JSON.stringify({id:deleteEmp.id}) });
      if (res.ok) { setDeleteEmp(null); setSuccessMsg("Employee deleted!"); setTimeout(() => setSuccessMsg(null), 3000); loadEmployees(); }
    } catch {} setDeleting(false);
  };

  const F = ({l,v,o,r,t}:{l:string;v:string;o:(v:string)=>void;r?:boolean;t?:string}) => (<div><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{l}</label><input type={t||"text"} value={v} onChange={(e)=>o(e.target.value)} required={r} className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary" /></div>);

  return (
    <AppShell title="Employee Directory">
      {successMsg && <div className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shadow-lg">{successMsg}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Employee Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage all employees - {employees.length} total</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-primary text-white font-bold text-xs gap-2"><Plus className="h-4 w-4" /> Add Employee</Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 text-slate-900 dark:text-white focus:outline-none focus:border-primary" />
        </div>
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary">
          <option value="all">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 text-slate-900 dark:text-white">
        {loading ? <div className="p-8 text-center text-slate-500 text-xs">Loading...</div> : filtered.length === 0 ? <div className="p-8 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 text-xs">No employees found.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Employee</th>
                  <th className="pb-3 font-semibold">Code</th>
                  <th className="pb-3 font-semibold">Dept</th>
                  <th className="pb-3 font-semibold">Designation</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filtered.map((emp) => (
                  <tr key={emp.id}>
                    <td className="py-3">
                      <span className="font-bold text-slate-900 dark:text-white block">{emp.name}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3" />{emp.email}</span>
                    </td>
                    <td className="py-3 font-mono text-primary font-bold">{emp.employeeCode || "-"}</td>
                    <td className="py-3">{emp.department || "-"}</td>
                    <td className="py-3">{emp.designation || "-"}</td>
                    <td className="py-3">
                      <span className={"inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border " + (emp.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20")}>{emp.status}</span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(emp)} className="h-7 w-7 p-0"><Edit3 className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteEmp(emp)} className="h-7 w-7 p-0 text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div className="bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
        <div className="flex items-center justify-between"><h3 className="font-bold text-lg">Add New Employee</h3><button onClick={() => setShowAdd(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"><X className="h-4 w-4" /></button></div>
        <form onSubmit={handleAdd} className="space-y-3 text-xs">
          <F l="Full Name" v={newEmp.name} o={(v)=>setNewEmp({...newEmp,name:v})} r />
          <F l="Email" v={newEmp.email} o={(v)=>setNewEmp({...newEmp,email:v})} r t="email" />
          <F l="Department" v={newEmp.department} o={(v)=>setNewEmp({...newEmp,department:v})} r />
          <F l="Designation" v={newEmp.designation} o={(v)=>setNewEmp({...newEmp,designation:v})} r />
          <F l="Reporting Manager" v={newEmp.reportingManager} o={(v)=>setNewEmp({...newEmp,reportingManager:v})} />
          <div><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Employment Type</label><select value={newEmp.employmentType} onChange={(e)=>setNewEmp({...newEmp,employmentType:e.target.value})} className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"><option value="permanent">Permanent</option><option value="contract">Contract</option><option value="probation">Probation</option><option value="intern">Intern</option></select></div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-white/10"><Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button type="submit" disabled={adding} className="bg-primary text-white font-bold gap-2">{adding ? "Adding..." : "Add Employee"}</Button></div>
        </form></div></div>}

      {editEmp && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div className="bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
        <div className="flex items-center justify-between"><h3 className="font-bold text-lg">Edit Employee</h3><button onClick={() => setEditEmp(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"><X className="h-4 w-4" /></button></div>
        <p className="text-xs text-slate-500">Editing: {editEmp.email}</p>
        <div className="space-y-3 text-xs">
          <F l="Full Name" v={editData.name} o={(v)=>setEditData({...editData,name:v})} />
          <F l="Department" v={editData.department} o={(v)=>setEditData({...editData,department:v})} />
          <F l="Designation" v={editData.designation} o={(v)=>setEditData({...editData,designation:v})} />
          <F l="Reporting Manager" v={editData.reportingManager} o={(v)=>setEditData({...editData,reportingManager:v})} />
          <div><label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label><select value={editData.status} onChange={(e)=>setEditData({...editData,status:e.target.value})} className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"><option value="active">Active</option><option value="inactive">Inactive</option><option value="terminated">Terminated</option></select></div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-white/10"><Button variant="outline" onClick={() => setEditEmp(null)}>Cancel</Button><Button onClick={handleEdit} disabled={editing} className="bg-primary text-white font-bold">{editing ? "Saving..." : "Save Changes"}</Button></div>
        </div></div></div>}

      {deleteEmp && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div className="bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
        <h3 className="font-bold text-lg text-red-600 dark:text-red-400">Delete Employee</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">Are you sure you want to delete <strong>{deleteEmp.name}</strong>?</p>
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-white/10"><Button variant="outline" onClick={() => setDeleteEmp(null)}>Cancel</Button><Button onClick={handleDelete} disabled={deleting} className="bg-red-600 text-white hover:bg-red-700 font-bold">{deleting ? "Deleting..." : "Delete"}</Button></div>
      </div></div>}
    </AppShell>
  );
}
