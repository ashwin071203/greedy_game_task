'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { useAuth } from '@/context/auth-context';
import { createClient } from '@/lib/supabase/client';

type Stats = {
  totalTodos: number;
  completedTodos: number;
  upcomingTodos: number;
  totalUsers?: number;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch todos stats
      const { data: todosData, error: todosError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user?.id);

      if (todosError) throw todosError;

      const now = new Date();
      const upcomingTodos = todosData?.filter(
        (todo) => !todo.completed && new Date(todo.due_date) > now
      ).length || 0;

      const completedTodos = todosData?.filter((todo) => todo.completed).length || 0;

      const statsData: Stats = {
        totalTodos: todosData?.length || 0,
        completedTodos,
        upcomingTodos,
      };

      // If admin, fetch users count
      if (user?.role === 'admin') {
        const { count, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;
        
        statsData.totalUsers = count || 0;
      }

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
        <p className="text-muted-foreground">Here's what's happening with your tasks today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Icons.listTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTodos}</div>
            <p className="text-xs text-muted-foreground">All your tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Icons.checkCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTodos}</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Icons.calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingTodos}</div>
            <p className="text-xs text-muted-foreground">Tasks due soon</p>
          </CardContent>
        </Card>

        {user?.role === 'admin' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Icons.users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity or Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent todo activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.totalTodos === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Icons.listTodo className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No tasks yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Get started by creating a new task
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Sample activity items - in a real app, these would be fetched from the database */}
                  {stats.completedTodos > 0 && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Icons.check className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium">
                          You completed {stats.completedTodos} {stats.completedTodos === 1 ? 'task' : 'tasks'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Keep up the good work!
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {stats.upcomingTodos > 0 && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Icons.clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium">
                          {stats.upcomingTodos} upcoming {stats.upcomingTodos === 1 ? 'task' : 'tasks'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Don't forget to check your upcoming tasks
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <a
                href="/dashboard/todos/new"
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-indigo-100 p-2">
                    <Icons.plus className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span>Add New Task</span>
                </div>
                <Icons.chevronRight className="h-4 w-4 text-muted-foreground" />
              </a>

              <a
                href="/dashboard/todos"
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <Icons.list className="h-5 w-5 text-green-600" />
                  </div>
                  <span>View All Tasks</span>
                </div>
                <Icons.chevronRight className="h-4 w-4 text-muted-foreground" />
              </a>

              {user?.role === 'admin' && (
                <a
                  href="/dashboard/admin/users"
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-purple-100 p-2">
                      <Icons.users className="h-5 w-5 text-purple-600" />
                    </div>
                    <span>Manage Users</span>
                  </div>
                  <Icons.chevronRight className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
