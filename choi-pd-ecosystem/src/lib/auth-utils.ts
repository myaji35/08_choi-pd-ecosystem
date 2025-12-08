/**
 * Authentication Utilities
 * Role-based access control and authentication helpers for Clerk integration
 */

import { currentUser } from '@clerk/nextjs/server';

export type UserRole = 'admin' | 'pd' | 'distributor';

export interface UserMetadata {
  role: UserRole;
  distributorId?: number;
}

/**
 * Get current user's role from Clerk metadata
 * In production, roles are stored in Clerk's publicMetadata
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }

    // Check Clerk public metadata for role
    const metadata = user.publicMetadata as UserMetadata;

    if (metadata?.role) {
      return metadata.role;
    }

    // Default role based on email (fallback for development)
    const email = user.emailAddresses[0]?.emailAddress;

    if (email?.includes('admin')) {
      return 'admin';
    }

    if (email?.includes('pd')) {
      return 'pd';
    }

    return 'distributor';
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
    case 'pd':
      return '/pd/dashboard';
    case 'distributor':
      return '/distributor/dashboard';
    default:
      return '/';
  }
}

/**
 * Get sign-in URL based on intended destination
 */
export function getSignInUrl(intendedPath: string): string {
  if (intendedPath.startsWith('/admin')) {
    return '/admin/sign-in';
  }

  if (intendedPath.startsWith('/pd')) {
    return '/pd/sign-in';
  }

  return '/sign-in';
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

  // PD can only access /pd routes
  if (role === 'pd') {
    return path.startsWith('/pd');
  }

  // Distributor can only access /distributor routes
  if (role === 'distributor') {
    return path.startsWith('/distributor');
  }

  return false;
}

/**
 * Get user's distributor ID from Clerk metadata
 */
export async function getDistributorId(): Promise<number | null> {
  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }

    const metadata = user.publicMetadata as UserMetadata;
    return metadata?.distributorId || null;
  } catch (error) {
    console.error('Failed to get distributor ID:', error);
    return null;
  }
}
