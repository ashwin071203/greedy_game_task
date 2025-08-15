'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  todoId?: string;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  toggleDrawer: () => void;
  fetchNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // In a real app, you would fetch notifications from your database
      // For now, we'll simulate some notifications based on todos
      const { data: todos, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Generate notifications from todos
      const todoNotifications: Notification[] = todos.map(todo => ({
        id: `todo-${todo.id}`,
        title: todo.completed ? 'Task Completed' : 'Upcoming Task',
        message: `${todo.title} ${todo.completed ? 'has been completed' : 'is due soon'}`,
        type: todo.completed ? 'success' : 'warning',
        read: false,
        createdAt: todo.completed ? todo.updated_at : todo.due_date,
        todoId: todo.id
      }));

      // Add some system notifications (in a real app, these would come from your backend)
      const systemNotifications: Notification[] = [
        {
          id: 'welcome-1',
          title: 'Welcome to Todo App',
          message: 'Start by creating your first task!',
          type: 'info',
          read: false,
          createdAt: new Date().toISOString()
        }
      ];

      setNotifications([...todoNotifications, ...systemNotifications]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      
      // In a real app, you would update the notification as read in your database
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      // In a real app, you would update all notifications as read in your database
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const clearAll = async () => {
    try {
      setNotifications([]);
      
      // In a real app, you would clear notifications from your database
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const toggleDrawer = () => {
    setIsOpen(prev => !prev);
    
    // Mark all as read when opening the drawer
    if (!isOpen) {
      markAllAsRead();
    }
  };

  // Fetch notifications when user logs in or when the component mounts
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up real-time subscription for todo changes
      const channel = supabase
        .channel('todos')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'todos',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            // Refresh notifications when todos change
            fetchNotifications();
            
            // Show toast for new or updated todos
            if (payload.eventType === 'INSERT') {
              const newTodo = payload.new;
              toast.success(`New task created: ${newTodo.title}`);
            } else if (payload.eventType === 'UPDATE' && payload.new.completed) {
              const completedTodo = payload.new;
              toast.success(`Task completed: ${completedTodo.title}`);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        isLoading,
        markAsRead,
        markAllAsRead,
        clearAll,
        toggleDrawer,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
