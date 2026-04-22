'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export interface ProjectFormValues {
  id?: number;
  key: string;
  name: string;
  description: string;
  baseUrl: string;
  apiBaseUrl: string;
  endpointTemplate: string;
  authType: 'none' | 'api_key' | 'bearer' | 'oauth2';
  authCredential: string; // '***encrypted***'면 미변경
  adapterKey: string;
  brandColor: string;
  logoUrl: string;
  isEnabled: boolean;
  sortOrder: number;
}

interface Props {
  mode: 'create' | 'edit';
  initial: ProjectFormValues;
}

function toPayload(v: ProjectFormValues, mode: 'create' | 'edit') {
  const payload: Record<string, unknown> = {
    name: v.name,
    description: v.description || null,
    baseUrl: v.baseUrl,
    apiBaseUrl: v.apiBaseUrl || null,
    endpointTemplate: v.endpointTemplate || null,
    authType: v.authType,
    adapterKey: v.adapterKey || null,
    brandColor: v.brandColor || null,
    logoUrl: v.logoUrl || null,
    isEnabled: v.isEnabled,
    sortOrder: Number(v.sortOrder) || 0,
  };
  if (mode === 'create') payload.key = v.key;
  // 마스킹된 기본값은 서버로 보내지 않음
  if (v.authCredential && v.authCredential !== '***encrypted***') {
    payload.authCredential = v.authCredential;
  }
  return payload;
}

export default function IntegrationProjectForm({ mode, initial }: Props) {
  const router = useRouter();
  const [v, setV] = useState<ProjectFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url =
        mode === 'create'
          ? '/api/admin/integration-projects'
          : `/api/admin/integration-projects/${v.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPayload(v, mode)),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || '저장에 실패했습니다.');
      }
      router.push('/admin/integration-projects');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown error');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!v.id) return;
    if (!confirm(`"${v.name}" 프로젝트를 삭제하시겠습니까? 연결된 회원 매핑도 함께 삭제됩니다.`))
      return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/integration-projects/${v.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || '삭제 실패');
      router.push('/admin/integration-projects');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F2F2] p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/integration-projects">
            <Button variant="ghost" size="sm" className="text-[#16325C]">
              <ArrowLeft className="w-4 h-4 mr-1" /> 목록
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-[#16325C]">
            {mode === 'create' ? '새 통합 프로젝트' : '프로젝트 편집'}
          </h1>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-[#16325C] text-base">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field
                label="Key (URL/adapter 식별자)"
                hint="영소문자/숫자/하이픈 2~32자. 생성 후 변경 불가."
              >
                <Input
                  value={v.key}
                  disabled={mode === 'edit'}
                  onChange={(e) => setV({ ...v, key: e.target.value })}
                  placeholder="townin"
                  required
                />
              </Field>

              <Field label="이름" hint="어드민에서 표시될 이름">
                <Input
                  value={v.name}
                  onChange={(e) => setV({ ...v, name: e.target.value })}
                  placeholder="Townin — 지역 커뮤니티 플랫폼"
                  required
                />
              </Field>

              <Field label="설명">
                <Input
                  value={v.description}
                  onChange={(e) => setV({ ...v, description: e.target.value })}
                  placeholder="회원이 참여하는 프로젝트의 짧은 설명"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Base URL" hint="공개 사이트 주소">
                  <Input
                    type="url"
                    value={v.baseUrl}
                    onChange={(e) => setV({ ...v, baseUrl: e.target.value })}
                    placeholder="https://townin.kr"
                    required
                  />
                </Field>
                <Field label="API Base URL" hint="표준 스펙 엔드포인트 호스트 (선택)">
                  <Input
                    type="url"
                    value={v.apiBaseUrl}
                    onChange={(e) => setV({ ...v, apiBaseUrl: e.target.value })}
                    placeholder="https://api.townin.kr"
                  />
                </Field>
              </div>

              <Field
                label="Endpoint Template"
                hint="기본값: /api/integrations/public/{external_id}"
              >
                <Input
                  value={v.endpointTemplate}
                  onChange={(e) => setV({ ...v, endpointTemplate: e.target.value })}
                  placeholder="/api/integrations/public/{external_id}"
                />
              </Field>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-[#16325C] text-base">인증 & 어댑터</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Auth Type">
                  <select
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
                    value={v.authType}
                    onChange={(e) =>
                      setV({ ...v, authType: e.target.value as ProjectFormValues['authType'] })
                    }
                  >
                    <option value="none">인증 없음</option>
                    <option value="api_key">API Key</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="oauth2">OAuth2</option>
                  </select>
                </Field>

                <Field
                  label="Auth Credential"
                  hint={mode === 'edit' ? '비워두면 기존 값 유지' : 'API Key 또는 Bearer Token'}
                >
                  <Input
                    type="password"
                    value={v.authCredential}
                    onChange={(e) => setV({ ...v, authCredential: e.target.value })}
                    placeholder="***encrypted***"
                  />
                </Field>
              </div>

              <Field
                label="Adapter Key"
                hint="표준 스펙 미준수 레거시용 — lib/integrations/adapters/<key>.ts"
              >
                <Input
                  value={v.adapterKey}
                  onChange={(e) => setV({ ...v, adapterKey: e.target.value })}
                  placeholder="townin-legacy"
                />
              </Field>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-[#16325C] text-base">브랜딩 & 표시</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Brand Color" hint="공개 페이지 배지/카드 색상">
                  <Input
                    type="text"
                    value={v.brandColor}
                    onChange={(e) => setV({ ...v, brandColor: e.target.value })}
                    placeholder="#FF6B35"
                  />
                </Field>

                <Field label="Logo URL">
                  <Input
                    type="url"
                    value={v.logoUrl}
                    onChange={(e) => setV({ ...v, logoUrl: e.target.value })}
                    placeholder="https://cdn.example.com/logo.svg"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="정렬 순서" hint="낮을수록 앞">
                  <Input
                    type="number"
                    value={v.sortOrder}
                    onChange={(e) => setV({ ...v, sortOrder: Number(e.target.value) })}
                    placeholder="0"
                  />
                </Field>

                <Field label="상태">
                  <label className="inline-flex items-center gap-2 mt-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={v.isEnabled}
                      onChange={(e) => setV({ ...v, isEnabled: e.target.checked })}
                    />
                    활성화 (비활성 시 공개 페이지에서 숨김)
                  </label>
                </Field>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div>
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onDelete}
                  disabled={deleting}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {deleting ? '삭제 중…' : '삭제'}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Link href="/admin/integration-projects">
                <Button type="button" variant="outline">
                  취소
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#00A1E0] hover:bg-[#0288C7] text-white"
              >
                <Save className="w-4 h-4 mr-1" />
                {saving ? '저장 중…' : '저장'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}
