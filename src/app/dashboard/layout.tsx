'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useAuth } from '@/context/auth-context';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Icons.layoutDashboard,
    roles: ['user', 'admin'],
  },
  {
    name: 'My Todos',
    href: '/dashboard/todos',
    icon: Icons.listTodo,
    roles: ['user', 'admin'],
  },
  {
    name: 'Users',
    href: '/dashboard/admin/users',
    icon: Icons.users,
    roles: ['admin'],
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: Icons.user,
    roles: ['user', 'admin'],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  if (!user) {
    return null; // or a loading/redirect component
  }

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role || 'user')
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0',
          !isSidebarOpen && '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            <div className="flex items-center">
              <Icons.logo className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Todo App</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <Icons.chevronLeft className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    'transition-colors duration-200'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Icons.user className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user.name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => signOut()}
                title="Sign out"
              >
                <Icons.logOut className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow lg:hidden">
          <div className="flex items-center px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden"
            >
              <Icons.menu className="h-6 w-6" />
            </Button>
            <h1 className="ml-2 text-lg font-medium text-gray-900">
              {navItems.find((item) => item.href === pathname)?.name || 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
