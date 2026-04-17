'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Trash2, Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface IdentityState {
  content: string;
  filename: string | null;
  updatedAt: string | number | null;
}

interface Props {
  /** /admin/distributors/[id] 의 id (또는 slug) */
  distributorId: string;
}

const MAX_BYTES = 512 * 1024;
const ACCEPT = '.md,.markdown,.txt';

export function DistributorIdentityUploader({ distributorId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [identity, setIdentity] = useState<IdentityState>({
    content: '',
    filename: null,
    updatedAt: null,
  });
  const [draft, setDraft] = useState<string>('');
  const [filenameDraft, setFilenameDraft] = useState<string>('identity.md');
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/distributors/${distributorId}/identity`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data?.success) {
        const next: IdentityState = {
          content: data.identity?.content ?? '',
          filename: data.identity?.filename ?? null,
          updatedAt: data.identity?.updatedAt ?? null,
        };
        setIdentity(next);
        setDraft(next.content);
        setFilenameDraft(next.filename || 'identity.md');
      } else {
        setError(data?.error || '아이덴티티 정보를 불러오지 못했습니다.');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [distributorId]);

  useEffect(() => {
    load();
  }, [load]);

  const readFile = async (file: File) => {
    setError('');
    if (file.size > MAX_BYTES) {
      setError(`파일이 ${MAX_BYTES / 1024}KB 를 초과합니다.`);
      return;
    }
    const lower = file.name.toLowerCase();
    if (!/\.(md|markdown|txt)$/.test(lower)) {
      setError('.md / .markdown / .txt 파일만 허용됩니다.');
      return;
    }
    const text = await file.text();
    setDraft(text);
    setFilenameDraft(file.name);
    setSuccess(`"${file.name}" 을 불러왔습니다. "저장"을 눌러 반영하세요.`);
    setTimeout(() => setSuccess(''), 2500);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await readFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await readFile(file);
  };

  const save = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/distributors/${distributorId}/identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft, filename: filenameDraft || 'identity.md' }),
      });
      const data = await res.json();
      if (!data?.success) {
        setError(data?.message || data?.error || '저장 실패');
        return;
      }
      setIdentity({
        content: data.identity.content,
        filename: data.identity.filename,
        updatedAt: data.identity.updatedAt,
      });
      setSuccess('아이덴티티가 저장되었습니다.');
      setTimeout(() => setSuccess(''), 2500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const clear = async () => {
    if (!confirm('아이덴티티 파일을 삭제하시겠습니까? 되돌릴 수 없습니다.')) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/distributors/${distributorId}/identity`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data?.success) {
        setIdentity({ content: '', filename: null, updatedAt: null });
        setDraft('');
        setFilenameDraft('identity.md');
        setSuccess('삭제되었습니다.');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(data?.error || '삭제 실패');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const byteLen = new Blob([draft]).size;
  const pctFull = Math.min(100, Math.round((byteLen / MAX_BYTES) * 100));
  const hasChanges =
    draft !== identity.content || (filenameDraft || '') !== (identity.filename || '');

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2" style={{ color: '#16325C' }}>
              <FileText className="h-5 w-5 text-[#00A1E0]" />
              회원 아이덴티티 (identity.md)
            </CardTitle>
            <CardDescription>
              브랜드/톤/아젠다를 정의하는 .md 파일을 업로드하면 이 회원의 콘텐츠/홈페이지에 반영됩니다.
            </CardDescription>
          </div>
          {identity.filename && (
            <div className="text-right text-xs text-gray-500">
              <div className="font-mono">{identity.filename}</div>
              {identity.updatedAt && (
                <div>
                  {new Date(identity.updatedAt).toLocaleString('ko-KR', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 드롭존 */}
        <div
          ref={dropRef}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={
            'cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors ' +
            (dragOver
              ? 'border-[#00A1E0] bg-[#E6F6FD]'
              : 'border-gray-300 bg-gray-50 hover:border-[#00A1E0] hover:bg-[#F3FBFE]')
          }
          role="button"
          tabIndex={0}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload className="h-8 w-8 text-[#00A1E0]" />
            <div className="text-sm font-semibold" style={{ color: '#16325C' }}>
              .md 파일을 끌어다 놓거나 클릭해서 업로드
            </div>
            <div className="text-xs text-gray-600">
              허용 확장자: .md · .markdown · .txt &nbsp;|&nbsp; 최대 {MAX_BYTES / 1024}KB
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={handleFileChange}
          />
        </div>

        {/* 파일명 편집 */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="identityFilename"
            className="text-xs font-semibold text-gray-600 shrink-0"
          >
            파일명
          </label>
          <input
            id="identityFilename"
            value={filenameDraft}
            onChange={(e) => setFilenameDraft(e.target.value)}
            placeholder="identity.md"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          />
        </div>

        {/* 본문 에디터 */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="identityContent"
              className="text-xs font-semibold text-gray-600"
            >
              본문 (markdown)
            </label>
            <span
              className={
                'text-xs ' + (pctFull > 90 ? 'text-red-600' : 'text-gray-500')
              }
            >
              {byteLen.toLocaleString()} / {MAX_BYTES.toLocaleString()} bytes ({pctFull}%)
            </span>
          </div>
          <Textarea
            id="identityContent"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={14}
            spellCheck={false}
            placeholder={`# 회원 아이덴티티\n\n## 아젠다\n- ...\n\n## 톤 앤 매너\n- ...\n\n## 핵심 키워드\n- ...\n`}
            className="font-mono text-[13px] leading-relaxed"
          />
        </div>

        {/* 상태 메시지 */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* 액션 */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clear}
            disabled={isSaving || isLoading || !identity.filename}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            삭제
          </Button>
          <div className="flex items-center gap-2">
            {hasChanges && !isSaving && (
              <span className="text-xs text-orange-600">저장되지 않은 변경사항</span>
            )}
            <Button
              type="button"
              size="sm"
              onClick={save}
              disabled={isSaving || isLoading || !hasChanges}
              className="bg-[#00A1E0] text-white hover:bg-[#0082B3]"
            >
              <Save className="mr-1.5 h-4 w-4" />
              {isSaving ? '저장 중…' : '저장'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
