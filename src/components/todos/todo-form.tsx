'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const todoFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  due_date: z.date({
    required_error: 'Due date is required',
  }),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  completed: z.boolean().default(false),
});

type TodoFormValues = z.infer<typeof todoFormSchema>;

type TodoFormProps = {
  todo?: {
    id: string;
    title: string;
    description: string | null;
    due_date: string;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
  };
  onSuccess?: () => void;
};

export function TodoForm({ todo, onSuccess }: TodoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: todo?.title || '',
      description: todo?.description || '',
      due_date: todo?.due_date ? new Date(todo.due_date) : new Date(),
      priority: todo?.priority || 'medium',
      completed: todo?.completed || false,
    },
  });

  const onSubmit = async (data: TodoFormValues) => {
    try {
      setIsLoading(true);
      
      if (todo) {
        // Update existing todo
        const { error } = await supabase
          .from('todos')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', todo.id);

        if (error) throw error;
        
        toast.success('Todo updated successfully');
      } else {
        // Create new todo
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('You must be logged in to create a todo');
        }

        const { error } = await supabase.from('todos').insert([
          {
            ...data,
            user_id: user.id,
          },
        ]);

        if (error) throw error;
        
        toast.success('Todo created successfully');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/todos');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error saving todo:', error);
      toast.error(error.message || 'Failed to save todo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Buy groceries" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add details about your todo..."
                  className="resize-none"
                  rows={4}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ].map((priority) => (
                    <Button
                      key={priority.value}
                      type="button"
                      variant={field.value === priority.value ? 'default' : 'outline'}
                      className={cn(
                        'justify-start',
                        field.value === priority.value && {
                          'bg-blue-600 text-white': priority.value === 'high',
                          'bg-yellow-500 text-white': priority.value === 'medium',
                          'bg-green-500 text-white': priority.value === 'low',
                        }
                      )}
                      onClick={() => field.onChange(priority.value)}
                    >
                      {priority.label}
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {todo ? 'Update' : 'Create'} Todo
          </Button>
        </div>
      </form>
    </Form>
  );
}
