export const dynamic = 'force-dynamic';
import { revalidatePath } from 'next/cache';
import { CheckSquare, Clock, HeartHandshake, X, Check } from 'lucide-react';
import { getHRMSUser, getPendingTeamApprovals, reviewLeaveRequest, approveRegularizationOrOvertime } from '@/lib/actions/hrms-actions';

export default async function ManagerApprovalsPage() {
  const manager = await getHRMSUser();
  if (!manager) return null;
  const { leaves, attendance } = await getPendingTeamApprovals(manager._id);

  async function approveLeave(formData: FormData) {
    'use server';
    const leaveId = String(formData.get('leaveId') || '');
    if (leaveId) {
      await reviewLeaveRequest({ leaveId, status: 'APPROVED' });
      revalidatePath('/hrms/manager/approvals');
    }
  }

  async function rejectLeave(formData: FormData) {
    'use server';
    const leaveId = String(formData.get('leaveId') || '');
    if (leaveId) {
      await reviewLeaveRequest({ leaveId, status: 'REJECTED' });
      revalidatePath('/hrms/manager/approvals');
    }
  }

  async function approveAtt(formData: FormData) {
    'use server';
    const attendanceId = String(formData.get('attendanceId') || '');
    const type = (String(formData.get('type') || '') as 'REGULARIZATION' | 'OVERTIME');
    if (attendanceId && type) {
      await approveRegularizationOrOvertime({ attendanceId, type, status: 'APPROVED' });
      revalidatePath('/hrms/manager/approvals');
    }
  }

  async function rejectAtt(formData: FormData) {
    'use server';
    const attendanceId = String(formData.get('attendanceId') || '');
    const type = (String(formData.get('type') || '') as 'REGULARIZATION' | 'OVERTIME');
    if (attendanceId && type) {
      await approveRegularizationOrOvertime({ attendanceId, type, status: 'REJECTED' });
      revalidatePath('/hrms/manager/approvals');
    }
  }

  const empty = leaves.length === 0 && attendance.length === 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">Manager Approval Center & Team Roster</h1>
        <p className="text-xs text-slate-400">Approve or reject team leave requests (with Half-Day Morning/Afternoon option), Regularization, and Overtime past 7:00 PM</p>
      </div>

      {empty && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No pending approvals. Your team is up to date.</p>
        </div>
      )}

      {/* PENDING LEAVES */}
      {leaves.length > 0 && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <HeartHandshake className="w-4 h-4" /> Pending Leave Requests ({leaves.length})
          </h2>
          {leaves.map((lv: any) => {
            const u = lv.userId || {};
            return (
              <div key={lv._id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-bold text-white text-sm">{u.name || 'Unknown'}</span>
                    <span className="text-slate-400 ml-2 font-mono">({u.employeeCode || '—'})</span>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded font-mono font-semibold">
                    {lv.leaveType}{lv.isHalfDay ? ` (HALF-DAY ${lv.halfDaySession || ''})` : ''}
                  </span>
                </div>
                <p className="text-slate-300">
                  Dates: {lv.startDate} → {lv.endDate} | Reason: {lv.reason}
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <form action={approveLeave}>
                    <input type="hidden" name="leaveId" value={lv._id} />
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-1.5 rounded inline-flex items-center gap-1">
                      <Check className="w-3 h-3" /> Approve
                    </button>
                  </form>
                  <form action={rejectLeave}>
                    <input type="hidden" name="leaveId" value={lv._id} />
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-1.5 rounded inline-flex items-center gap-1">
                      <X className="w-3 h-3" /> Reject
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* PENDING ATTENDANCE: REGULARIZATION + OVERTIME */}
      {attendance.length > 0 && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" /> Pending Attendance Items ({attendance.length})
          </h2>
          {attendance.map((a: any) => {
            const u = a.userId || {};
            const isReg = a.regularizationStatus === 'PENDING';
            const isOT = a.overtimeStatus === 'PENDING';
            return (
              <div key={a._id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-bold text-white text-sm">{u.name || 'Unknown'}</span>
                    <span className="text-slate-400 ml-2 font-mono">({u.employeeCode || '—'})</span>
                  </div>
                  <div className="flex gap-2">
                    {isReg && (
                      <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded font-mono font-semibold">
                        REGULARIZATION
                      </span>
                    )}
                    {isOT && (
                      <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded font-mono font-semibold">
                        OVERTIME {a.overtimeHours ? `(${a.overtimeHours}h)` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-slate-300">
                  Date: {a.date}
                  {a.regularizationReason ? ` | Reason: ${a.regularizationReason}` : ''}
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  {isReg && (
                    <>
                      <form action={approveAtt}>
                        <input type="hidden" name="attendanceId" value={a._id} />
                        <input type="hidden" name="type" value="REGULARIZATION" />
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-1.5 rounded inline-flex items-center gap-1">
                          <Check className="w-3 h-3" /> Approve Reg.
                        </button>
                      </form>
                      <form action={rejectAtt}>
                        <input type="hidden" name="attendanceId" value={a._id} />
                        <input type="hidden" name="type" value="REGULARIZATION" />
                        <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-1.5 rounded inline-flex items-center gap-1">
                          <X className="w-3 h-3" /> Reject Reg.
                        </button>
                      </form>
                    </>
                  )}
                  {isOT && (
                    <>
                      <form action={approveAtt}>
                        <input type="hidden" name="attendanceId" value={a._id} />
                        <input type="hidden" name="type" value="OVERTIME" />
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-1.5 rounded inline-flex items-center gap-1">
                          <Check className="w-3 h-3" /> Approve OT
                        </button>
                      </form>
                      <form action={rejectAtt}>
                        <input type="hidden" name="attendanceId" value={a._id} />
                        <input type="hidden" name="type" value="OVERTIME" />
                        <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-1.5 rounded inline-flex items-center gap-1">
                          <X className="w-3 h-3" /> Reject OT
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
