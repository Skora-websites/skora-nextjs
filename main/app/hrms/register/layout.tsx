import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Register Super Admin",
  description: "Register for your HRMS Command Center",
  path: "/hrms/register",
  noIndex: true,
});

export default function HRMSRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
