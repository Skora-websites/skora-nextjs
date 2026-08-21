export const dynamic = 'force-dynamic';
import { getHRMSUser } from '@/lib/actions/hrms-actions';
import { OnboardingCountdownWidget } from '@/components/hrms/onboarding-countdown-widget';

export default async function EmployeeOnboardingPage() {
  const empUser = await getHRMSUser();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">Compliance Document Onboarding</h1>
        <p className="text-xs text-slate-400">Upload your mandatory identification & compliance documents to Firebase Storage for HR verification</p>
      </div>

      <OnboardingCountdownWidget user={empUser} />
    </div>
  );
}
