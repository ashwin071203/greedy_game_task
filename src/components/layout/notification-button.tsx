'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/context/notification-context';

export function NotificationButton() {
  const { unreadCount, toggleDrawer } = useNotifications();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative rounded-full"
      onClick={toggleDrawer}
      aria-label="View notifications"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
}
