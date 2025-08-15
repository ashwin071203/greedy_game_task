'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/ui/icons';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
      });
      
      // If user has an avatar, set the preview
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
    }
  }, [user, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async (userId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      let avatarUrl = user.avatar_url || '';
      
      // Upload new avatar if selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar(user.id, avatarFile);
      }
      
      // Update user profile
      const { error } = await supabase
        .from('users')
        .update({
          name: data.name,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update auth user data
      await updateUserProfile({
        name: data.name,
        avatar_url: avatarUrl,
      });
      
      toast.success('Profile updated successfully');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast.error('Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Update your profile information and settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Profile Picture</h2>
            <p className="text-sm text-muted-foreground">
              This will be displayed on your profile and in the navigation.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarPreview || ''} alt={user.name || 'User'} />
                <AvatarFallback>
                  {user.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                    : user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Change
                  <input
                    id="avatar-upload"
                    name="avatar-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, GIF or PNG. Max 2MB.
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium">Account Type</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.role === 'admin' ? 'Administrator' : 'Standard User'}
            </p>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium">Member Since</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <div className="mt-1">
                  <Input
                    id="name"
                    type="text"
                    {...form.register('name')}
                    className={form.formState.errors.name && 'border-red-500'}
                  />
                  {form.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    type="email"
                    disabled
                    {...form.register('email')}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Contact support to change your email address.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
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
                Save Changes
              </Button>
            </div>
          </form>
          
          <div className="mt-8 space-y-6">
            <div className="border-t pt-6">
              <h2 className="text-lg font-medium">Change Password</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update your password associated with your account.
              </p>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePasswordReset}
                  disabled={isLoading}
                >
                  Change Password
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-lg font-medium text-red-600">Danger Zone</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isLoading}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      // Handle account deletion
                      console.log('Account deletion requested');
                    }
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
