import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "HRMS Sign In",
  description: "Sign in to your HRMS portal",
  path: "/hrms/login",
  noIndex: true,
});

export default function HRMSLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
