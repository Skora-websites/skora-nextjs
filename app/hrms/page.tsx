import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HRMS.pro — Human Resource Management System",
  description:
    "A comprehensive HRM platform for managing employees, attendance, payroll, leaves, assets, and more.",
};

export default function Home() {
  redirect("/hrms/dashboard");
}
