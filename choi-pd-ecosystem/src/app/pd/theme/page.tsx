import { ThemeEditor } from './ThemeEditor';
import { getSeedProfile } from '@/lib/seed/choipd-dna';

export const metadata = { title: 'Pomelli 테마 편집 | imPD' };

export default function ThemeEditorPage() {
  // MVP: 현재 로그인 사용자 기반 조회 대신 choipd 시드 사용
  const profile = getSeedProfile('choipd');
  if (!profile) return <div style={{ padding: 24 }}>프로필을 찾을 수 없습니다.</div>;

  return <ThemeEditor initialColors={profile.baseColors} initialUsername={profile.username} />;
}
