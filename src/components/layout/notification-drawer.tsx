'use client';

import { X, Bell, Check, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/context/notification-context';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

type NotificationIconProps = {
  type: 'info' | 'success' | 'warning' | 'error';
  className?: string;
};

const NotificationIcon = ({ type, className }: NotificationIconProps) => {
  const iconMap = {
    info: <Info className="h-5 w-5 text-blue-500" />,
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
  };

  return <div className={cn('flex-shrink-0', className)}>{iconMap[type]}</div>;
};

export function NotificationDrawer() {
  const {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearAll,
    toggleDrawer,
  } = useNotifications();

  if (!isOpen) return null;

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={toggleDrawer}
          aria-hidden="true"
        />
        
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md">
            <div className="flex h-full flex-col overflow-hidden bg-white shadow-xl">
              <div className="flex-1 overflow-y-auto">
                <div className="bg-indigo-700 px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-white">Notifications</h2>
                    <div className="ml-3 flex h-7 items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-md text-indigo-200 hover:bg-indigo-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={toggleDrawer}
                      >
                        <span className="sr-only">Close panel</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-indigo-300">
                      {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <ScrollArea className="h-[calc(100vh-10rem)]">
                    <div className="p-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="text-center py-8">
                          <Bell className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            You don't have any notifications yet.
                          </p>
                        </div>
                      ) : (
                        <>
                          {unreadNotifications.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-900">New</h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-indigo-600 hover:text-indigo-900"
                                  onClick={markAllAsRead}
                                >
                                  Mark all as read
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {unreadNotifications.map((notification) => (
                                  <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={markAsRead}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {readNotifications.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-900">Older</h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-indigo-600 hover:text-indigo-900"
                                  onClick={clearAll}
                                >
                                  Clear all
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {readNotifications.map((notification) => (
                                  <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={markAsRead}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
              
              <div className="flex flex-shrink-0 justify-between border-t border-gray-200 px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-gray-700 hover:bg-gray-100"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Mark all as read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-gray-700 hover:bg-gray-100"
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                >
                  Clear all
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type NotificationItemProps = {
  notification: {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: string;
    todoId?: string;
  };
  onMarkAsRead: (id: string) => void;
};

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const { title, message, type, read, createdAt, todoId } = notification;
  
  const content = (
    <div className="relative">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <NotificationIcon type={type} />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gray-500">{message}</p>
          <p className="mt-1 text-xs text-gray-400">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
        {!read && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-4 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
          >
            <span className="sr-only">Mark as read</span>
            <Check className="h-5 w-5 text-gray-400" />
          </Button>
        )}
      </div>
    </div>
  );

  const className = cn(
    'block w-full px-4 py-3 text-left text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500',
    !read && 'bg-indigo-50'
  );

  if (todoId) {
    return (
      <Link href={`/dashboard/todos/${todoId}`} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
