'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

type WithAuthProps = {
  user: any;
  isLoading: boolean;
};

type Role = 'user' | 'admin';

export function withAuth<T extends WithAuthProps>(
  WrappedComponent: React.ComponentType<T>,
  options?: {
    requiredRole?: Role;
    redirectTo?: string;
    loadingComponent?: React.ReactNode;
  }
) {
  const { requiredRole, redirectTo = '/auth/login', loadingComponent = null } = options || {};

  return function WithAuthComponent(props: Omit<T, keyof WithAuthProps>) {
    const { user, isLoading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        // User is not authenticated, redirect to login
        router.push(`${redirectTo}?redirectedFrom=${window.location.pathname}`);
      } else if (!isLoading && user) {
        // Check if user has the required role
        if (requiredRole === 'admin' && !isAdmin) {
          // User doesn't have admin role, redirect to dashboard or home
          router.push('/dashboard');
        }
      }
    }, [user, isLoading, isAdmin, router]);

    if (isLoading) {
      return loadingComponent || <div>Loading...</div>;
    }

    if (!user) {
      return null; // or a loading/redirect component
    }

    if (requiredRole === 'admin' && !isAdmin) {
      return null; // or an access denied component
    }

    return <WrappedComponent {...(props as T)} user={user} isLoading={isLoading} />;
  };
}

// Example usage:
// export default withAuth(MyComponent, { requiredRole: 'admin' });
