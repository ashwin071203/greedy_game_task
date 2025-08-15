'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, isToday, isTomorrow, isThisWeek, isPast, isAfter } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/ui/icons';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

type Todo = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  created_at: string;
  updated_at: string;
};

type Filter = 'all' | 'today' | 'upcoming' | 'completed' | 'overdue';
type SortBy = 'due_date' | 'priority' | 'created_at' | 'title';
type SortOrder = 'asc' | 'desc';

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('due_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTodos();
  }, [filter, sortBy, sortOrder, page]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      let query = supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id);

      // Apply filters
      const now = new Date().toISOString();
      switch (filter) {
        case 'today':
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          query = query
            .gte('due_date', today.toISOString().split('T')[0] + 'T00:00:00')
            .lt('due_date', tomorrow.toISOString().split('T')[0] + 'T00:00:00');
          break;
        case 'upcoming':
          query = query.gte('due_date', now).eq('completed', false);
          break;
        case 'completed':
          query = query.eq('completed', true);
          break;
        case 'overdue':
          query = query.lt('due_date', now).eq('completed', false);
          break;
        default:
          // 'all' - no additional filter
          break;
      }

      // Apply search
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      setTodos(data || []);
      setHasMore((data?.length || 0) === itemsPerPage);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const toggleTodoStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ 
          completed: !currentStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Todo marked as ${!currentStatus ? 'completed' : 'incomplete'}`);
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo status:', error);
      toast.error('Failed to update todo status');
    }
  };

  const deleteTodo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Todo deleted successfully');
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete todo');
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date)) return format(date, 'EEEE'); // Day name
    
    return format(date, 'MMM d, yyyy');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchTodos();
  };

  const handleFilterChange = (value: string) => {
    setFilter(value as Filter);
    setPage(1); // Reset to first page when changing filters
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-') as [SortBy, SortOrder];
    setSortBy(field);
    setSortOrder(order);
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Todos</h1>
          <p className="text-muted-foreground">
            {filter === 'all' && 'All your tasks'}
            {filter === 'today' && 'Tasks due today'}
            {filter === 'upcoming' && 'Upcoming tasks'}
            {filter === 'completed' && 'Completed tasks'}
            {filter === 'overdue' && 'Overdue tasks'}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/todos/new">
            <Icons.plus className="mr-2 h-4 w-4" />
            Add Todo
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search todos..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          
          <div className="flex space-x-2">
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={`${sortBy}-${sortOrder}`} 
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due_date-asc">Due Date (Earliest)</SelectItem>
                <SelectItem value="due_date-desc">Due Date (Latest)</SelectItem>
                <SelectItem value="priority-asc">Priority (Low to High)</SelectItem>
                <SelectItem value="priority-desc">Priority (High to Low)</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <Icons.listTodo className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No todos found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? 'No todos match your search. Try a different term.'
                : filter === 'completed'
                ? 'You have no completed todos yet.'
                : filter === 'today'
                ? 'No todos due today.'
                : filter === 'upcoming'
                ? 'No upcoming todos.'
                : filter === 'overdue'
                ? 'No overdue todos. Great job!'
                : 'Get started by creating a new todo.'}
            </p>
            <Button asChild>
              <Link href="/dashboard/todos/new">
                <Icons.plus className="mr-2 h-4 w-4" />
                Add Todo
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50 ${
                  todo.completed ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => toggleTodoStatus(todo.id, todo.completed)}
                    className="mt-1 flex-shrink-0"
                    aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {todo.completed ? (
                      <Icons.checkCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3
                        className={`font-medium ${
                          todo.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {todo.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(
                          todo.priority
                        )}`}
                      >
                        {todo.priority}
                      </span>
                    </div>
                    {todo.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {todo.description.length > 100
                          ? `${todo.description.substring(0, 100)}...`
                          : todo.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <Icons.calendar className="mr-1 h-3.5 w-3.5" />
                      <span>
                        {todo.completed
                          ? `Completed on ${format(new Date(todo.updated_at), 'MMM d, yyyy')}`
                          : `Due ${formatDueDate(todo.due_date)}`}
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8"
                  >
                    <Link href={`/dashboard/todos/${todo.id}`}>
                      <Icons.pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    <Icons.trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
