import { getHRMSUser, submitLeaveRequest, logTimesheet } from '@/lib/actions/hrms-actions';
import { GeofencedPunchWidget } from '@/components/hrms/geofenced-punch-widget';
import { OnboardingCountdownWidget } from '@/components/hrms/onboarding-countdown-widget';
import { CheckSquare, Clock, HeartHandshake, DollarSign, Play, Pause, Calendar, Send } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function EmployeeDashboardPage() {
  const empUser = await getHRMSUser();

  async function handleLeaveSubmitAction(formData: FormData) {
    'use server';
    const leaveType = (formData.get('leaveType') as any) || 'CASUAL';
    const startDate = String(formData.get('startDate') || '');
    const endDate = String(formData.get('endDate') || '');
    const isHalfDay = formData.get('isHalfDay') === 'on';
    const halfDaySession = (formData.get('halfDaySession') as any) || 'MORNING';
    const reason = String(formData.get('reason') || '');

    if (empUser && startDate && endDate) {
      await submitLeaveRequest({
        userId: empUser._id,
        leaveType,
        startDate,
        endDate,
        isHalfDay,
        halfDaySession,
        reason
      });
      revalidatePath('/hrms/employee');
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Personal Employee Portal</span>
          <h1 className="text-2xl font-extrabold text-white">Employee Action Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="text-white font-medium">{empUser.name}</span> | Route: <code className="bg-slate-900 px-2 py-0.5 rounded text-blue-400">/hrms/employee</code>
          </p>
        </div>

        <Link
          href="/hrms/employee/settings"
          className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl shadow"
        >
          Access Isolated Employee Settings
        </Link>
      </div>

      {/* Profile Info Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {empUser.name?.charAt(0) || 'E'}
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">{empUser.name}</h2>
              <p className="text-xs text-slate-400">{empUser.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Employee Code</span>
              <p className="text-sm font-extrabold text-blue-400 font-mono mt-0.5">{empUser.employeeCode || 'PENDING'}</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Department</span>
              <p className="text-sm font-extrabold text-emerald-400 mt-0.5">{empUser.department}</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Reporting Manager</span>
              <p className="text-sm font-extrabold text-indigo-400 mt-0.5">{empUser.reportingManagerId?.name || 'Unassigned'}</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Work Area</span>
              <p className="text-sm font-extrabold text-purple-400 mt-0.5">{empUser.department}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. TOP DYNAMIC BANNER: Onboarding Verification & 48h Countdown Timer */}
      <OnboardingCountdownWidget user={empUser} />

      {/* 2. ACTION HUB: Geofenced Punch In / Out (100m Radius) */}
      <GeofencedPunchWidget
        userId={empUser._id}
        userName={empUser.name}
        userRole={empUser.role}
      />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Project Execution (PMS Tasks & Timer) */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">My Tasks & Task Timer</h2>
                <p className="text-xs text-slate-400">Start task timer or manually log task hours</p>
              </div>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded font-mono font-semibold">2 Assigned Tasks</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Implement Haversine Geofence Punching</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Est: 8h | Logged: 4.5h</p>
              </div>
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded flex items-center space-x-1">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Timer</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">48h Onboarding Re-upload Countdown</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Est: 6h | Logged: 3.0h</p>
              </div>
              <button className="bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold px-3 py-1.5 rounded flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Log Hours</span>
              </button>
            </div>
          </div>
        </section>

        {/* 4. Self-Service: Leave Request with Half-Day Toggle */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Leave Request (with Half-Day Toggle)</h2>
              <p className="text-xs text-slate-400">Submit leave for Manager approval (Half-Day Morning/Afternoon option)</p>
            </div>
          </div>

          <form action={handleLeaveSubmitAction} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Leave Type</label>
                <select name="leaveType" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white">
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="EARNED">Earned Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center space-x-2 bg-slate-950 border border-slate-800 p-2 rounded-lg cursor-pointer">
                  <input type="checkbox" name="isHalfDay" className="rounded text-blue-600" />
                  <span className="font-medium text-white">Half-Day Toggle</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">If Half-Day, Select Session</label>
              <select name="halfDaySession" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white">
                <option value="MORNING">Morning Session (10:00 AM - 2:00 PM)</option>
                <option value="AFTERNOON">Afternoon Session (2:30 PM - 7:00 PM)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Reason</label>
              <input
                type="text"
                name="reason"
                placeholder="Reason for leave..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg shadow flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Leave Request</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
