export const dynamic = 'force-dynamic';
import { reviewOnboardingDocument, getHRMSUser, getPendingOnboardingUsers, getOnboardingDocumentsForUser } from '@/lib/actions/hrms-actions';
import { FileCheck, CheckCircle2, Clock, CheckCircle } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { OnboardingDocPreview } from '@/components/hrms/onboarding-doc-preview';
import { DownloadAllButton } from '@/components/hrms/download-all-button';

export default async function HRAdminOnboardingPage() {
  const hrUser = await getHRMSUser();
  const pendingUsers = await getPendingOnboardingUsers();

  // Pull docs for each user in parallel.
  const docsByUser = await Promise.all(
    pendingUsers.map(async (u: any) => ({
      userId: u._id,
      docs: await getOnboardingDocumentsForUser(u._id).catch(() => []),
    }))
  );
  const docsMap = new Map(docsByUser.map((d) => [d.userId, d.docs]));

  async function handleReviewAction(formData: FormData) {
    'use server';
    const targetUserId = String(formData.get('userId') || '');
    const status = (formData.get('status') as any) || 'APPROVED';
    const rejectionReason = String(formData.get('rejectionReason') || '');

    if (targetUserId && hrUser) {
      await reviewOnboardingDocument(targetUserId, hrUser.id, status, rejectionReason);
      revalidatePath('/hrms/hr-admin/onboarding');
      revalidatePath('/hrms/hr-admin');
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">HR Onboarding Verification Loop</h1>
        <p className="text-xs text-slate-400">
          Review employee uploaded compliance documents. Approval generates Employee Code; Rejection sets 48h countdown timer.
        </p>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 shadow-xl text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">All Onboarding Complete</h2>
          <p className="text-xs text-slate-400">No pending document reviews at this time.</p>
        </div>
      ) : (
        pendingUsers.map((empUser: any) => {
          const docs = (docsMap.get(empUser._id) || []) as Array<{
            _id: string;
            docType: string;
            fileName: string;
            fileUrl: string;
            status: 'PENDING' | 'APPROVED' | 'REJECTED';
            uploadedAt: string;
            rejectionReason?: string;
          }>;
          return (
            <div key={empUser._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white">{empUser.name}</h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Email: {empUser.email} | Department: {empUser.department}
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                  empUser.onboardingStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  empUser.onboardingStatus === 'REJECTED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  empUser.onboardingStatus === 'ESCALATED_SUPERADMIN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {empUser.onboardingStatus}
                </span>
              </div>

              {/* Document Review List — real rows from UserDocument */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200">Uploaded Compliance Documents</h3>
                  {docs.length > 0 && <DownloadAllButton userId={empUser._id} />}
                </div>
                {docs.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">
                    No documents uploaded yet. Status will move to PENDING_REVIEW once the employee uploads.
                  </p>
                ) : (
                  docs.map((d) => (
                    <OnboardingDocPreview key={d._id} doc={d} />
                  ))
                )}
              </div>

              {/* Action Controls */}
              <form action={handleReviewAction} className="space-y-4 text-xs pt-2">
                <input type="hidden" name="userId" value={empUser._id} />
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rejection Reason (If rejecting document)</label>
                  <input
                    type="text"
                    name="rejectionReason"
                    placeholder="e.g. Document image blurry or expired ID card..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="submit"
                    name="status"
                    value="APPROVED"
                    disabled={docs.length === 0}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Issue Employee Code</span>
                  </button>

                  <button
                    type="submit"
                    name="status"
                    value="REJECTED"
                    disabled={docs.length === 0}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Reject & Start 48h Countdown Timer</span>
                  </button>
                </div>
              </form>
            </div>
          );
        })
      )}
    </div>
  );
}
