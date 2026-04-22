'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import IntegrationProjectForm, { type ProjectFormValues } from '../_form';

export default function EditIntegrationProjectPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [initial, setInitial] = useState<ProjectFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/integration-projects/${id}`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || '불러오기 실패');
        const p = json.project;
        if (!cancelled) {
          setInitial({
            id: p.id,
            key: p.key,
            name: p.name ?? '',
            description: p.description ?? '',
            baseUrl: p.baseUrl ?? '',
            apiBaseUrl: p.apiBaseUrl ?? '',
            endpointTemplate: p.endpointTemplate ?? '/api/integrations/public/{external_id}',
            authType: p.authType ?? 'none',
            authCredential: p.authCredential ?? '', // '***encrypted***' or null
            adapterKey: p.adapterKey ?? '',
            brandColor: p.brandColor ?? '',
            logoUrl: p.logoUrl ?? '',
            isEnabled: Boolean(p.isEnabled),
            sortOrder: Number(p.sortOrder ?? 0),
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'unknown');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F2F2] p-6 flex items-center justify-center">
        <div className="max-w-md rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="min-h-screen bg-[#F3F2F2] p-6 flex items-center justify-center">
        <p className="text-sm text-gray-500">불러오는 중…</p>
      </div>
    );
  }

  return <IntegrationProjectForm mode="edit" initial={initial} />;
}
