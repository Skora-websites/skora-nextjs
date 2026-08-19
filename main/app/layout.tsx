import type { Metadata } from "next";
import { Providers } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | HRMS.pro",
    default: "HRMS.pro — Human Resource Management System",
  },
  description:
    "A comprehensive HRM platform for managing employees, attendance, payroll, leaves, assets, and more.",
  keywords: [
    "HRM",
    "human resource management",
    "employees",
    "payroll",
    "attendance",
    "leave management",
    "HRMS",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('crm-theme');
                  if (stored) {
                    var config = JSON.parse(stored);
                    if (config.mode === 'dark') {
                      document.documentElement.classList.add('dark');
                    }
                    // Restore sidebar width before React hydrates (prevents layout shift)
                    var isMini = config.sidebarMini === true;
                    document.documentElement.style.setProperty('--sidebar-width', isMini ? '68px' : '270px');
                    document.documentElement.dataset.sidebarMini = String(isMini);
                    // Restore primary colour before React hydrates (prevents flash)
                    if (config.primaryColor && config.primaryColor !== '#5e72e4') {
                      document.documentElement.style.setProperty('--color-primary', config.primaryColor);
                      // Also set gradient endpoints
                      var darkGrads = {
                        '#344767': '#212529',
                        '#11cdef': '#1171ef',
                        '#2dce89': '#2dcecc',
                        '#fb6340': '#fbb140',
                        '#f5365c': '#f56036',
                        '#5e72e4': '#825ee4'
                      };
                      var gradStart = config.primaryColor;
                      var gradEnd = darkGrads[config.primaryColor] || '#825ee4';
                      document.documentElement.style.setProperty('--gradient-primary-start', gradStart);
                      document.documentElement.style.setProperty('--gradient-primary-end', gradEnd);
                      // Set the primary-50 (light) variant for subtle backgrounds
                      var lightVariant = {
                        '#5e72e4': '#f0f1fe',
                        '#344767': '#f0f1f4',
                        '#11cdef': '#e8faff',
                        '#2dce89': '#eafbf3',
                        '#fb6340': '#fff0eb',
                        '#f5365c': '#feeff2'
                      };
                      document.documentElement.style.setProperty('--color-primary-50', lightVariant[config.primaryColor] || '#f0f1fe');
                      document.documentElement.style.setProperty('--color-primary-500', gradStart);
                      document.documentElement.style.setProperty('--color-primary-600', gradEnd);
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
