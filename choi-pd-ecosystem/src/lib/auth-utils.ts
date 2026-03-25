/**
 * Authentication Utilities
 * Role-based access control and authentication helpers for JWT session
 */

import { getSession } from '@/lib/auth/session';

export type UserRole = 'admin' | 'member';

export interface UserMetadata {
  role: UserRole;
  slug?: string;
}

/**
 * Get current user's role from JWT session
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const session = await getSession();

    if (!session) {
      return null;
    }

    return session.role || null;
  } catch (error) {
    console.error('Failed to get user role:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole === requiredRole;
}

/**
 * Check if user has any of the required roles
 */
export async function hasAnyRole(requiredRoles: UserRole[]): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole ? requiredRoles.includes(userRole) : false;
}

/**
 * Get dashboard URL based on user role
 */
export function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'member':
      return '/pd/dashboard';
    default:
      return '/';
  }
}

/**
 * Get sign-in URL based on intended destination
 */
export function getSignInUrl(intendedPath: string): string {
  return `/login?callbackUrl=${encodeURIComponent(intendedPath)}`;
}

/**
 * Verify user can access route based on role
 */
export async function canAccessRoute(path: string): Promise<boolean> {
  const role = await getCurrentUserRole();

  if (!role) {
    return false;
  }

  // Admin can access all routes
  if (role === 'admin') {
    return true;
  }

  // Member can access /pd and /member routes
  if (role === 'member') {
    return path.startsWith('/pd') || path.startsWith('/member');
  }

  return false;
}

/**
 * Get user's slug from JWT session (for member public pages)
 */
export async function getUserSlug(): Promise<string | null> {
  try {
    const session = await getSession();

    if (!session) {
      return null;
    }

    return session.slug || null;
  } catch (error) {
    console.error('Failed to get user slug:', error);
    return null;
  }
}
