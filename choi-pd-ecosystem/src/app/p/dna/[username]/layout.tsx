// 컬러 주입은 page.tsx로 이동 (Next.js layout은 searchParams 미지원)
export default function DnaProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
