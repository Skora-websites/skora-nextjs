'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface SidebarNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function SidebarNavClient({ navItems }: { navItems: SidebarNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isHrmsPrefix = pathname.startsWith('/hrms');
        const targetHref = isHrmsPrefix ? `/hrms${item.href}` : item.href;
        const isActive =
          pathname === targetHref ||
          pathname === item.href ||
          pathname.startsWith(`${targetHref}/`) ||
          pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={targetHref}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
