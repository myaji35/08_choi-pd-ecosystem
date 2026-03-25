'use client';

import { useState, useEffect } from 'react';

interface User {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  slug?: string;
  status?: string;
  provider: 'google' | 'towningraph';
}

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data?.user || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  };

  return { user, loading, logout };
}
