import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import HRMSPortalLandingPage from "../page";

export default async function HRMSIndexPage() {
  const session = await auth();

  if (session?.user?.role) {
    const norm = session.user.role.toUpperCase();
    if (norm === 'SUPER_ADMIN' || norm === 'SUPERADMIN' || norm === 'SUPER_ADMINISTRATOR') {
      redirect('/hrms/superadmin');
    }
    if (norm === 'HR_ADMIN' || norm === 'HRADMIN' || norm === 'ADMIN') {
      redirect('/hrms/hr-admin');
    }
    if (norm === 'MANAGER') {
      redirect('/hrms/manager');
    }
    redirect('/hrms/employee');
  }

  return <HRMSPortalLandingPage />;
}
