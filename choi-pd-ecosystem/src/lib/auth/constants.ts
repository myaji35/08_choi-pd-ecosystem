export const RESERVED_SLUGS = [
  'admin', 'api', 'pd', 'www', 'mail', 'ftp',
  'dashboard', '_next', 'static', 'public',
  'login', 'signup', 'auth', 'oauth', 'member',
  'chopd',
];

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 30;

export const SESSION_COOKIE_NAME = 'impd_session';
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24시간

export const ADMIN_ALLOWED_EMAILS = (process.env.ADMIN_ALLOWED_EMAILS || '')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);
